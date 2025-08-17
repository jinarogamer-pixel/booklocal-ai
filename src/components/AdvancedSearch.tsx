"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Clock, User } from 'lucide-react';

interface SearchFilters {
  category: string;
  location: string;
  priceRange: [number, number];
  rating: number;
  availability: string;
  distance: number;
  verified: boolean;
  emergency: boolean;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedSearch({ onSearch, isOpen, onClose }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    priceRange: [50, 300],
    rating: 0,
    availability: '',
    distance: 25,
    verified: false,
    emergency: false
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const categories = [
    'All Categories',
    'Flooring',
    'Painting',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Carpentry',
    'Landscaping',
    'Cleaning',
    'Moving',
    'Handyman'
  ];

  const availabilityOptions = [
    'Any Time',
    'Today',
    'This Week',
    'This Month',
    'Weekends Only',
    'Emergency Available'
  ];

  const handleSearch = () => {
    onSearch(query, filters);
    console.log('🔍 Advanced search:', { query, filters });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
                  <p className="text-white/60 text-sm mt-1">Find the perfect contractor for your project</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for contractors, services, or projects..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6">
              <div className="flex gap-1 bg-black/30 rounded-xl p-1 mb-6">
                {['basic', 'location', 'pricing', 'advanced'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Content */}
            <div className="px-6 pb-6 max-h-96 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-white font-medium mb-3">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-3">
                        Minimum Rating ({filters.rating} stars)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.5"
                          value={filters.rating}
                          onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
                          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= filters.rating ? 'text-yellow-400 fill-current' : 'text-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'location' && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-white font-medium mb-3">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                          placeholder="City, state, or ZIP code"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-3">
                        Search Radius ({filters.distance} miles)
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={filters.distance}
                        onChange={(e) => setFilters({ ...filters, distance: Number(e.target.value) })}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-white/60 text-sm mt-2">
                        <span>5 mi</span>
                        <span>100 mi</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'pricing' && (
                  <motion.div
                    key="pricing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-white font-medium mb-3">
                        Hourly Rate Range (${filters.priceRange[0]} - ${filters.priceRange[1]})
                      </label>
                      <div className="space-y-4">
                        <input
                          type="range"
                          min="25"
                          max="500"
                          step="25"
                          value={filters.priceRange[0]}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            priceRange: [Number(e.target.value), filters.priceRange[1]] 
                          })}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="range"
                          min="25"
                          max="500"
                          step="25"
                          value={filters.priceRange[1]}
                          onChange={(e) => setFilters({ 
                            ...filters, 
                            priceRange: [filters.priceRange[0], Number(e.target.value)] 
                          })}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-white/60 text-sm">
                        <span>$25/hr</span>
                        <span>$500/hr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-3">Availability</label>
                      <select
                        value={filters.availability}
                        onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                      >
                        {availabilityOptions.map(option => (
                          <option key={option} value={option} className="bg-slate-800">{option}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'advanced' && (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium">Background Verified Only</span>
                        </div>
                        <button
                          onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                          className={`w-12 h-6 rounded-full transition-all ${
                            filters.verified ? 'bg-blue-500' : 'bg-white/20'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                            filters.verified ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-red-400" />
                          <span className="text-white font-medium">Emergency Available</span>
                        </div>
                        <button
                          onClick={() => setFilters({ ...filters, emergency: !filters.emergency })}
                          className={`w-12 h-6 rounded-full transition-all ${
                            filters.emergency ? 'bg-red-500' : 'bg-white/20'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                            filters.emergency ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => {
                  setQuery('');
                  setFilters({
                    category: '',
                    location: '',
                    priceRange: [50, 300],
                    rating: 0,
                    availability: '',
                    distance: 25,
                    verified: false,
                    emergency: false
                  });
                }}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={handleSearch}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
              >
                Search Contractors
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
