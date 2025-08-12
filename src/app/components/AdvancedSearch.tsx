// AdvancedSearch: Search bar and filters for providers/services
import { useState } from 'react';


export default function AdvancedSearch({ onSearch }: { onSearch: (query: string, filters: Record<string,string>) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [experience, setExperience] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query, { category, location, price, rating, experience });
  }

  return (
    <form className="glass-card flex flex-col md:flex-row gap-3 items-center p-4 animate-fade-in-up" onSubmit={handleSubmit}>
      <input
        className="flex-1 px-4 py-2 rounded-lg border border-gray-200"
        placeholder="Search providers or services..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <select className="px-3 py-2 rounded-lg border border-gray-200" value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="cleaning">Cleaning</option>
        <option value="handyman">Handyman</option>
        <option value="fitness">Fitness & Wellness</option>
        <option value="photography">Photography & Video</option>
        <option value="catering">Catering & Food</option>
        <option value="pet">Pet Care</option>
        <option value="it">IT Help</option>
        <option value="tutoring">Tutoring & Lessons</option>
        <option value="senior">Senior Care</option>
        <option value="childcare">Childcare</option>
        <option value="delivery">Delivery & Errands</option>
        <option value="beauty">Beauty & Personal Care</option>
        <option value="transport">Transport & Rides</option>
        <option value="home">Home Improvement</option>
        <option value="tech">Tech Support</option>
      </select>
      <select className="px-3 py-2 rounded-lg border border-gray-200" value={price} onChange={e => setPrice(e.target.value)}>
        <option value="">Any Price</option>
        <option value="low">$</option>
        <option value="medium">$$</option>
        <option value="high">$$$</option>
      </select>
      <select className="px-3 py-2 rounded-lg border border-gray-200" value={rating} onChange={e => setRating(e.target.value)}>
        <option value="">Any Rating</option>
        <option value="4">4★ & up</option>
        <option value="3">3★ & up</option>
        <option value="2">2★ & up</option>
        <option value="1">1★ & up</option>
      </select>
      <select className="px-3 py-2 rounded-lg border border-gray-200" value={experience} onChange={e => setExperience(e.target.value)}>
        <option value="">Any Experience</option>
        <option value="beginner">Beginner Friendly</option>
        <option value="intermediate">Intermediate</option>
        <option value="expert">Expert</option>
      </select>
      <input
        className="px-4 py-2 rounded-lg border border-gray-200"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />
      <button className="btn-primary" type="submit">Search</button>
    </form>
  );
}
