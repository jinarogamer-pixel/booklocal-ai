#!/bin/bash
echo "🗄️ BookLocal Database Setup"
echo "=========================="
echo ""
echo "Setting up provider tables with material expertise..."
echo ""

# Check if we can connect to Supabase
echo "📡 Checking Supabase connection..."

if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Environment loaded"
else
    echo "❌ .env.local not found"
    echo "Please ensure your Supabase credentials are set up:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    exit 1
fi

echo ""
echo "📊 Tables to create/update:"
echo "1. providers - Main provider information"
echo "2. provider_materials - Material specializations"
echo "3. trust_weights - Trust scoring configuration"
echo "4. Views: provider_trust_scores, provider_material_expertise"
echo ""

echo "🚀 To run the schema:"
echo "1. Open your Supabase dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy and run the SQL from: database/schema.sql"
echo ""
echo "Or if you have psql installed:"
echo "psql \$DATABASE_URL -f database/schema.sql"
echo ""

echo "🧪 Test queries you can run:"
echo ""
echo "-- Find flooring specialists"
echo "SELECT * FROM provider_material_expertise WHERE material_category = 'flooring';"
echo ""
echo "-- Get top trust scores"
echo "SELECT name, trust_score FROM provider_trust_scores ORDER BY trust_score DESC LIMIT 5;"
echo ""
echo "-- Find providers for specific materials"
echo "SELECT name, material_type, expertise_level FROM provider_material_expertise"
echo "WHERE material_category IN ('flooring', 'wall', 'furniture');"
echo ""

# Show the current file structure
echo "📁 Current database files:"
ls -la database/ 2>/dev/null || echo "No database directory found"
echo ""

echo "✅ Ready for database setup!"
echo "Run the schema.sql file in your Supabase dashboard to get started."
