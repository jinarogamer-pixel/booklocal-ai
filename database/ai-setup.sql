-- BookLocal AI - Semantic Search & AI Features Setup
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column to providers table
alter table providers 
add column if not exists name_desc_embedding vector(1536);

-- Create index for vector similarity search
create index if not exists providers_name_desc_embedding_idx
on providers using ivfflat (name_desc_embedding vector_cosine_ops) 
with (lists = 100);

-- Create semantic search function
create or replace function match_providers(
  query_embedding vector(1536),
  match_count int default 12,
  similarity_threshold float default 0.75
)
returns table (
  id uuid, 
  name text, 
  primary_category text, 
  city text, 
  state text, 
  description text, 
  similarity float
)
language sql stable as $$
  select 
    p.id, 
    p.name, 
    p.primary_category, 
    p.city, 
    p.state, 
    p.description,
    1 - (p.name_desc_embedding <=> query_embedding) as similarity
  from providers p
  where p.name_desc_embedding is not null
    and 1 - (p.name_desc_embedding <=> query_embedding) >= similarity_threshold
  order by p.name_desc_embedding <=> query_embedding
  limit match_count;
$$;

-- Create events table for tracking user interactions
create table if not exists events(
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  provider_id uuid references providers(id),
  event_type text check (event_type in ('view', 'contact', 'bookmark', 'search')),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create index on events for faster queries
create index if not exists events_actor_provider_idx 
on events(actor_user_id, provider_id);
create index if not exists events_created_at_idx 
on events(created_at desc);

-- Create co-visitation view for recommendations
create or replace view covisit as
select 
  a.actor_user_id, 
  b.provider_id as candidate, 
  count(*) as hits
from events a
join events b 
  on a.actor_user_id = b.actor_user_id 
  and a.provider_id <> b.provider_id
where a.event_type in ('view', 'contact') 
  and b.event_type in ('view', 'contact')
group by a.actor_user_id, b.provider_id;

-- RLS policies for events table
alter table events enable row level security;

create policy "Users can insert their own events" on events
  for insert with check (auth.uid() = actor_user_id);

create policy "Users can view their own events" on events
  for select using (auth.uid() = actor_user_id);

-- Create recommendation function
create or replace function get_recommendations(
  user_id uuid,
  provider_id uuid default null,
  limit_count int default 8
)
returns table (
  id uuid,
  name text,
  primary_category text,
  city text,
  state text,
  avg_rating numeric,
  total_reviews int,
  recommendation_score numeric
)
language sql stable as $$
  with covisit_recs as (
    select 
      c.candidate as provider_id,
      c.hits::numeric as score
    from covisit c
    where c.actor_user_id = user_id
    order by c.hits desc
    limit limit_count
  ),
  category_recs as (
    select 
      p.id as provider_id,
      2.0 as score -- Base score for category similarity
    from providers p
    where provider_id is not null
      and p.primary_category = (
        select primary_category 
        from providers 
        where id = provider_id
      )
      and p.id <> provider_id
    limit limit_count
  ),
  combined as (
    select provider_id, score from covisit_recs
    union all
    select provider_id, score from category_recs
  )
  select 
    p.id,
    p.name,
    p.primary_category,
    p.city,
    p.state,
    p.avg_rating,
    p.total_reviews,
    coalesce(max(c.score), 0) as recommendation_score
  from providers p
  left join combined c on p.id = c.provider_id
  where p.id <> coalesce(provider_id, '00000000-0000-0000-0000-000000000000'::uuid)
  group by p.id, p.name, p.primary_category, p.city, p.state, p.avg_rating, p.total_reviews
  order by recommendation_score desc, p.avg_rating desc
  limit limit_count;
$$;
