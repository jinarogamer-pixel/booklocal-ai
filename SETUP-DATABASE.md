# 🗄️ BookLocal Database Setup Guide

## Quick Setup (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your BookLocal project

### Step 2: Run Database Schema
1. In your project, click **SQL Editor** in the sidebar
2. Click **New query**
3. Copy the ENTIRE content from `database/schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or Cmd/Ctrl + Enter)

### Step 3: Verify Setup
```bash
# Run this to test the database
node test-database.js
```

## What This Schema Creates

### 📊 Core Tables
- **providers**: Main contractor database with trust metrics
- **provider_materials**: Material specializations (floor/wall/sofa expertise)
- **trust_weights**: Configurable scoring system weights

### 🎯 Sample Data Includes
- Elite Flooring Solutions (hardwood, vinyl, tile expert)
- Modern Wall Studio (paint, wallpaper specialist) 
- Custom Furniture Co (upholstery, restoration master)

### 🔍 Smart Views Created
- **provider_trust_scores**: Calculated trust rankings
- **provider_material_expertise**: Material-provider matching

## Testing Your Setup

After running the schema, test these queries in SQL Editor:

```sql
-- Check trust scores
SELECT name, trust_score, avg_rating 
FROM provider_trust_scores 
ORDER BY trust_score DESC;

-- Test material expertise
SELECT name, material_category, material_type, trust_score
FROM provider_material_expertise
WHERE material_category = 'flooring'
ORDER BY trust_score DESC;

-- Verify trust weights
SELECT component, weight, description 
FROM trust_weights 
ORDER BY weight DESC;
```

## Integration Points

Your React components will now connect to:
- `materialQueries.ts` → Queries provider expertise
- `trustScoringEnhanced.ts` → Uses weighted scoring  
- `FinishSwap.tsx` → Matches presets to providers
- `DemoModeToggle.tsx` → Cycles through provider results

🚀 **Once complete, your material swaps will show real providers with trust scores!**
