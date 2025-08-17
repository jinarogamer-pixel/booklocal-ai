'use client';

import { useState } from 'react';
import { LoaderIcon, SearchIcon, BrainIcon, ShieldIcon, TrendingUpIcon } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  primary_category: string;
  city: string;
  state: string;
  description: string;
  similarity: number;
}

interface ProjectBrief {
  scope: string;
  materials: string[];
  timeline_weeks: number;
  budget_low: number;
  budget_high: number;
  questions: string[];
}

interface ModerationResult {
  allowed: boolean;
  details?: {
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  };
  checked_at: string;
}

export default function AIDemoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [briefTitle, setBriefTitle] = useState('');
  const [briefNotes, setBriefNotes] = useState('');
  const [briefResult, setBriefResult] = useState<ProjectBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const [moderationText, setModerationText] = useState('');
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [moderationLoading, setModerationLoading] = useState(false);

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 5 })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.providers || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearchLoading(false);
  };

  const handleGenerateBrief = async () => {
    if (!briefTitle.trim()) return;
    
    setBriefLoading(true);
    try {
      const response = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: briefTitle, 
          notes: briefNotes,
          location: 'San Francisco, CA'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBriefResult(data.brief);
      }
    } catch (error) {
      console.error('Brief generation error:', error);
    }
    setBriefLoading(false);
  };

  const handleModerationCheck = async () => {
    if (!moderationText.trim()) return;
    
    setModerationLoading(true);
    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: moderationText })
      });
      
      if (response.ok) {
        const data = await response.json();
        setModerationResult(data);
      }
    } catch (error) {
      console.error('Moderation error:', error);
    }
    setModerationLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            BookLocal AI Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Experience our AI-powered features: Semantic Search, Project Briefs, and Content Moderation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Semantic Search Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <SearchIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Semantic Search</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for providers (e.g., 'experienced plumber near downtown')"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSemanticSearch()}
                />
                <button 
                  onClick={handleSemanticSearch} 
                  disabled={searchLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : 'Search'}
                </button>
              </div>
              
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{result.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {Math.round(result.similarity * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                    <p className="text-xs text-gray-500">
                      {result.primary_category} • {result.city}, {result.state}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Brief Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BrainIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold">AI Project Brief</h3>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Project title (e.g., 'Kitchen renovation')"
                value={briefTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBriefTitle(e.target.value)}
              />
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Project notes and requirements..."
                value={briefNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBriefNotes(e.target.value)}
                rows={3}
              />
              <button 
                onClick={handleGenerateBrief} 
                disabled={briefLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {briefLoading && <LoaderIcon className="h-4 w-4 animate-spin mr-2" />}
                Generate Project Brief
              </button>
              
              {briefResult && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium mb-3">Generated Brief:</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Scope:</strong> {briefResult.scope}
                    </div>
                    <div>
                      <strong>Timeline:</strong> {briefResult.timeline_weeks} weeks
                    </div>
                    <div>
                      <strong>Budget:</strong> ${briefResult.budget_low.toLocaleString()} - ${briefResult.budget_high.toLocaleString()}
                    </div>
                    <div>
                      <strong>Materials:</strong> {briefResult.materials.join(', ')}
                    </div>
                    <div>
                      <strong>Questions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {briefResult.questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Moderation Demo */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldIcon className="h-5 w-5 text-orange-600" />
            <h3 className="text-xl font-semibold">Content Moderation</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <textarea
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter text to check for policy violations..."
                value={moderationText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setModerationText(e.target.value)}
                rows={3}
              />
              <button 
                onClick={handleModerationCheck} 
                disabled={moderationLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {moderationLoading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : 'Check'}
              </button>
            </div>
            
            {moderationResult && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    moderationResult.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {moderationResult.allowed ? "✓ Safe" : "⚠ Flagged"}
                  </span>
                </div>
                {moderationResult.details && (
                  <div className="text-sm text-gray-600">
                    Flagged: {moderationResult.details.flagged ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feature Status */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-semibold">AI Integration Status</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full block mb-2">Active</span>
              <p className="text-sm">Semantic Search</p>
            </div>
            <div className="text-center">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full block mb-2">Active</span>
              <p className="text-sm">Project Briefs</p>
            </div>
            <div className="text-center">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full block mb-2">Active</span>
              <p className="text-sm">Content Moderation</p>
            </div>
            <div className="text-center">
              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full block mb-2">Ready</span>
              <p className="text-sm">Recommendations</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <h4 className="font-medium mb-2">Next Steps:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Run database migration (ai-setup.sql) in Supabase</li>
              <li>2. Set OPENAI_API_KEY in environment variables</li>
              <li>3. Initialize provider embeddings via /api/embeddings/reindex</li>
              <li>4. Enable feature flags for production rollout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
