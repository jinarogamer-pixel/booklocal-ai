#!/usr/bin/env node
/**
 * Database Schema Tester for BookLocal
 * Tests provider queries and trust scoring
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabaseConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('📋 Next steps:');
      console.log('1. Open your Supabase dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and run the schema from: database/schema.sql');
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return true;
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function testProviderQueries() {
  console.log('\n🏗️ Testing provider material queries...');
  
  try {
    // Test basic provider query
    const { data: providers, error: providerError } = await supabase
      .from('provider_material_expertise')
      .select('*')
      .limit(5);
    
    if (providerError) {
      console.log('❌ Provider query failed:', providerError.message);
      console.log('💡 Run the database schema first!');
      return;
    }
    
    console.log(`✅ Found ${providers.length} provider material expertise records`);
    
    // Test material category queries
    const categories = ['flooring', 'wall', 'furniture'];
    for (const category of categories) {
      const { data: categoryProviders } = await supabase
        .from('provider_material_expertise')
        .select('name, material_type, trust_score')
        .eq('material_category', category)
        .order('trust_score', { ascending: false })
        .limit(3);
      
      console.log(`🎯 ${category.toUpperCase()} specialists:`, 
        categoryProviders?.map(p => `${p.name} (${p.trust_score}%)`) || 'None'
      );
    }
    
  } catch (err) {
    console.log('❌ Query test failed:', err.message);
  }
}

async function testTrustScoring() {
  console.log('\n⭐ Testing trust scoring system...');
  
  try {
    const { data: trustScores } = await supabase
      .from('provider_trust_scores')
      .select('name, trust_score, avg_rating, jobs_completed')
      .order('trust_score', { ascending: false })
      .limit(5);
    
    if (trustScores && trustScores.length > 0) {
      console.log('🏆 Top Trust Scores:');
      trustScores.forEach((provider, index) => {
        console.log(`${index + 1}. ${provider.name}: ${provider.trust_score}% (${provider.avg_rating}⭐, ${provider.jobs_completed} jobs)`);
      });
    } else {
      console.log('📊 No trust scores found - ensure sample data is loaded');
    }
    
    // Test trust weight configuration
    const { data: weights } = await supabase
      .from('trust_weights')
      .select('component, weight, description')
      .order('weight', { ascending: false });
    
    if (weights && weights.length > 0) {
      console.log('\n⚖️ Trust Score Weights:');
      weights.forEach(w => {
        console.log(`• ${w.component}: ${(w.weight * 100).toFixed(1)}% - ${w.description}`);
      });
    }
    
  } catch (err) {
    console.log('❌ Trust scoring test failed:', err.message);
  }
}

async function runTests() {
  console.log('🧪 BookLocal Database Testing Suite');
  console.log('=====================================\n');
  
  const connected = await testDatabaseConnection();
  if (!connected) {
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Copy database/schema.sql content');
    console.log('2. Paste into Supabase SQL Editor');
    console.log('3. Execute the query');
    console.log('4. Re-run this test');
    return;
  }
  
  await testProviderQueries();
  await testTrustScoring();
  
  console.log('\n🎯 Material Query Testing:');
  console.log('In your browser console, try:');
  console.log('```javascript');
  console.log('// Test floor providers');
  console.log('fetch("/api/materials?category=floor&style=modern")');
  console.log('  .then(r => r.json()).then(console.log);');
  console.log('```');
  
  console.log('\n✅ Database testing complete!');
  console.log('🚀 Your BookLocal platform is ready for material-based provider matching!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDatabaseConnection, testProviderQueries, testTrustScoring };
