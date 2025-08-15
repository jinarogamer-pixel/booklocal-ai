"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, Phone, MessageCircle, Heart, Shield, Award, DollarSign } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  distance: number;
  hourlyRate: number;
  availability: string;
  profileImage: string;
  verified: boolean;
  trustScore: number;
  specialties: string[];
  responseTime: string;
  completedJobs: number;
  description: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  totalResults: number;
}

export default function SearchResults({ results, loading, query, totalResults }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price' | 'distance'>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (contractorId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(contractorId)) {
      newFavorites.delete(contractorId);
    } else {
      newFavorites.add(contractorId);
    }
    setFavorites(newFavorites);
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'distance':
        return a.distance - b.distance;
      default:
        return b.trustScore - a.trustScore;
    }
  });

  const ResultCard = ({ contractor, index }: { contractor: SearchResult; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group ${
        viewMode === 'grid' ? 'min-h-[400px]' : ''
      }`}
    >
      <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'gap-6'}`}>
        {/* Profile Section */}
        <div className={`${viewMode === 'grid' ? 'mb-4' : 'flex-shrink-0'}`}>
          <div className="relative">
            <img
              src={contractor.profileImage || `/api/placeholder/80/80`}
              alt={contractor.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            {contractor.verified && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <button
            onClick={() => toggleFavorite(contractor.id)}
            className={`mt-3 p-2 rounded-lg transition-all ${
              favorites.has(contractor.id)
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/10 text-white/60 hover:text-white/80'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorites.has(contractor.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Details Section */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                {contractor.name}
              </h3>
              <p className="text-white/60 text-sm">{contractor.category}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{contractor.rating}</span>
                <span className="text-white/60 text-sm">({contractor.reviews})</span>
              </div>
              <div className="text-white/60 text-sm">
                ${contractor.hourlyRate}/hr
              </div>
            </div>
          </div>

          {/* Trust Score & Badges */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">{contractor.trustScore}% Trust Score</span>
            </div>
            {contractor.verified && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg font-medium">
                Verified
              </span>
            )}
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-4 mb-3 text-sm text-white/60">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{contractor.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{contractor.distance} mi away</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {contractor.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-lg"
              >
                {specialty}
              </span>
            ))}
            {contractor.specialties.length > 3 && (
              <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-lg">
                +{contractor.specialties.length - 3} more
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm mb-4 line-clamp-2">
            {contractor.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-white font-semibold">{contractor.completedJobs}</div>
              <div className="text-white/60 text-xs">Jobs Done</div>
            </div>
            <div>
              <div className="text-white font-semibold">{contractor.responseTime}</div>
              <div className="text-white/60 text-xs">Response Time</div>
            </div>
            <div>
              <div className="text-white font-semibold">{contractor.availability}</div>
              <div className="text-white/60 text-xs">Available</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Finding the best contractors for you...</p>
        </div>
        
        {/* Loading skeletons */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-white/20 rounded w-1/3"></div>
                  <div className="h-4 bg-white/20 rounded w-1/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-white/20 rounded w-16"></div>
                    <div className="h-8 bg-white/20 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Search Results {query && `for "${query}"`}
          </h2>
          <p className="text-white/60">
            {totalResults} contractors found
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Options */}
          <select
            value={sortBy}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-400"
          >
            <option value="relevance" className="bg-slate-800">Most Relevant</option>
            <option value="rating" className="bg-slate-800">Highest Rated</option>
            <option value="price" className="bg-slate-800">Lowest Price</option>
            <option value="distance" className="bg-slate-800">Closest</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/40 text-lg mb-2">No contractors found</div>
          <p className="text-white/60">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          <AnimatePresence>
            {sortedResults.map((contractor, index) => (
              <ResultCard
                key={contractor.id}
                contractor={contractor}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More */}
      {results.length > 0 && results.length < totalResults && (
        <div className="text-center pt-8">
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl transition-all">
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
}
