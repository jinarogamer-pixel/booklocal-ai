"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Camera, 
  Star, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Eye,
  FileText,
  Users,
  Target,
  BarChart3,
  Zap,
  Award,
  MessageSquare,
  Phone,
  Video,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Navigation,
  Crosshair,
  Route,
  Timer,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  Flag,
  AlertCircle,
  Settings,
  Bell
} from 'lucide-react';

interface GPSLocation {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  accuracy: number;
}

interface WorkSession {
  id: string;
  projectId: string;
  contractorId: string;
  startTime: string;
  endTime?: string;
  startLocation: GPSLocation;
  endLocation?: GPSLocation;
  workPhotos: WorkPhoto[];
  status: 'active' | 'completed' | 'paused';
  milestoneId?: string;
  notes: string;
}

interface WorkPhoto {
  id: string;
  url: string;
  timestamp: string;
  location: GPSLocation;
  description: string;
  type: 'before' | 'progress' | 'after' | 'issue';
}

interface QualityMetric {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  maxScore: number;
  category: 'technical' | 'communication' | 'timeliness' | 'professionalism';
}

interface QualityAssessment {
  id: string;
  projectId: string;
  contractorId: string;
  clientId: string;
  overallRating: number;
  metrics: QualityMetric[];
  feedback: string;
  photos: string[];
  timestamp: string;
  verified: boolean;
}

interface PerformanceAlert {
  id: string;
  type: 'location_deviation' | 'time_overrun' | 'quality_issue' | 'safety_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  projectId: string;
  contractorId: string;
  resolved: boolean;
}

const mockWorkSession: WorkSession = {
  id: '1',
  projectId: 'proj-1',
  contractorId: 'cont-1',
  startTime: '2024-01-20T09:00:00Z',
  startLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Main St, San Francisco, CA',
    timestamp: '2024-01-20T09:00:00Z',
    accuracy: 5
  },
  workPhotos: [
    {
      id: '1',
      url: '/api/placeholder/400/300',
      timestamp: '2024-01-20T09:30:00Z',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Main St, San Francisco, CA',
        timestamp: '2024-01-20T09:30:00Z',
        accuracy: 3
      },
      description: 'Work area setup complete',
      type: 'before'
    },
    {
      id: '2',
      url: '/api/placeholder/400/300',
      timestamp: '2024-01-20T12:00:00Z',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Main St, San Francisco, CA',
        timestamp: '2024-01-20T12:00:00Z',
        accuracy: 4
      },
      description: 'Halfway through installation',
      type: 'progress'
    }
  ],
  status: 'active',
  notes: 'Project proceeding on schedule'
};

const mockQualityMetrics: QualityMetric[] = [
  {
    id: '1',
    name: 'Work Quality',
    description: 'Technical execution and craftsmanship',
    weight: 30,
    score: 9.2,
    maxScore: 10,
    category: 'technical'
  },
  {
    id: '2',
    name: 'Timeliness',
    description: 'Adherence to schedule and deadlines',
    weight: 25,
    score: 8.8,
    maxScore: 10,
    category: 'timeliness'
  },
  {
    id: '3',
    name: 'Communication',
    description: 'Responsiveness and clarity',
    weight: 20,
    score: 9.5,
    maxScore: 10,
    category: 'communication'
  },
  {
    id: '4',
    name: 'Professionalism',
    description: 'Conduct and presentation',
    weight: 25,
    score: 9.0,
    maxScore: 10,
    category: 'professionalism'
  }
];

const mockAlerts: PerformanceAlert[] = [
  {
    id: '1',
    type: 'time_overrun',
    severity: 'medium',
    message: 'Project running 30 minutes behind schedule',
    timestamp: '2024-01-20T15:30:00Z',
    projectId: 'proj-1',
    contractorId: 'cont-1',
    resolved: false
  },
  {
    id: '2',
    type: 'quality_issue',
    severity: 'high',
    message: 'Client reported concern about work quality',
    timestamp: '2024-01-20T14:00:00Z',
    projectId: 'proj-2',
    contractorId: 'cont-2',
    resolved: true
  }
];

export default function QualityAssuranceSystem() {
  const [activeSession, setActiveSession] = useState<WorkSession>(mockWorkSession);
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>(mockQualityMetrics);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState<'tracking' | 'quality' | 'alerts' | 'analytics'>('tracking');
  const [isTracking, setIsTracking] = useState(true);

  // Simulate GPS tracking
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        // Simulate location updates
        const newLocation: GPSLocation = {
          latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
          address: '123 Main St, San Francisco, CA',
          timestamp: new Date().toISOString(),
          accuracy: Math.floor(Math.random() * 10) + 1
        };
        setCurrentLocation(newLocation);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const calculateOverallRating = () => {
    const weightedSum = qualityMetrics.reduce((sum, metric) => 
      sum + (metric.score * metric.weight / 100), 0
    );
    return Math.round(weightedSum * 10) / 10;
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return Zap;
      case 'communication': return MessageSquare;
      case 'timeliness': return Clock;
      case 'professionalism': return Award;
      default: return Star;
    }
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const newPhoto: WorkPhoto = {
      id: Date.now().toString(),
      url: '/api/placeholder/400/300',
      timestamp: new Date().toISOString(),
      location: currentLocation!,
      description: 'Progress update',
      type: 'progress'
    };

    setActiveSession(prev => ({
      ...prev,
      workPhotos: [...prev.workPhotos, newPhoto]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Quality Assurance
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Real-time GPS tracking, performance monitoring, and comprehensive quality control 
            to ensure exceptional service delivery every time.
          </p>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Active Sessions', 
              value: '12', 
              icon: Activity, 
              color: 'text-green-400',
              change: '+3 from yesterday'
            },
            { 
              label: 'Avg Quality Score', 
              value: '9.1', 
              icon: Star, 
              color: 'text-yellow-400',
              change: '+0.2 this week'
            },
            { 
              label: 'On-Time Rate', 
              value: '94%', 
              icon: Clock, 
              color: 'text-blue-400',
              change: '+2% this month'
            },
            { 
              label: 'Active Alerts', 
              value: alerts.filter(a => !a.resolved).length.toString(), 
              icon: AlertTriangle, 
              color: 'text-red-400',
              change: '-5 from yesterday'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card p-6 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
              </div>
              <div className="text-white/80 font-semibold mb-1">{stat.label}</div>
              <div className="text-white/60 text-sm">{stat.change}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-3xl p-2 flex space-x-2">
            {[
              { id: 'tracking', label: 'GPS Tracking', icon: MapPin },
              { id: 'quality', label: 'Quality Metrics', icon: Star },
              { id: 'alerts', label: 'Performance Alerts', icon: Bell },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Live Tracking */}
              <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Navigation className="w-6 h-6 mr-3" />
                    Live GPS Tracking
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white/80">{isTracking ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Interactive Map</h3>
                    <p className="text-white/70 mb-4">Real-time contractor location tracking</p>
                    {currentLocation && (
                      <div className="text-white/80 text-sm">
                        <div>Lat: {currentLocation.latitude.toFixed(6)}</div>
                        <div>Lng: {currentLocation.longitude.toFixed(6)}</div>
                        <div>Accuracy: ±{currentLocation.accuracy}m</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Session Details */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Current Work Session</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-white/60 text-sm">Start Time</div>
                      <div className="text-white font-semibold">
                        {new Date(activeSession.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm">Duration</div>
                      <div className="text-white font-semibold">
                        {Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / (1000 * 60))} min
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm">Status</div>
                      <div className={`font-semibold ${
                        activeSession.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {activeSession.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Documentation */}
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Work Documentation
                </h3>

                {/* Photo Upload */}
                <button
                  onClick={handlePhotoUpload}
                  className="w-full border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-purple-400/50 transition-colors duration-300 mb-6"
                >
                  <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <div className="text-white/80 font-semibold">Upload Progress Photo</div>
                  <div className="text-white/60 text-sm">Document current work status</div>
                </button>

                {/* Recent Photos */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Recent Photos</h4>
                  {activeSession.workPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={photo.url}
                          alt={photo.description}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-white font-semibold mb-1">{photo.description}</div>
                          <div className="text-white/60 text-sm">
                            {new Date(photo.timestamp).toLocaleTimeString()}
                          </div>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                            photo.type === 'before' ? 'bg-blue-500/20 text-blue-300' :
                            photo.type === 'progress' ? 'bg-yellow-500/20 text-yellow-300' :
                            photo.type === 'after' ? 'bg-green-500/20 text-green-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {photo.type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'quality' && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Quality Metrics */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-3" />
                  Quality Metrics
                </h2>

                {/* Overall Rating */}
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-2xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white mb-2">
                      {calculateOverallRating()}
                    </div>
                    <div className="flex justify-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(calculateOverallRating())
                              ? 'text-yellow-400 fill-current'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-white/70">Overall Quality Score</div>
                  </div>
                </div>

                {/* Individual Metrics */}
                <div className="space-y-4">
                  {qualityMetrics.map((metric, index) => {
                    const IconComponent = getCategoryIcon(metric.category);
                    const percentage = (metric.score / metric.maxScore) * 100;
                    
                    return (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-white font-semibold">{metric.name}</div>
                              <div className="text-white/60 text-sm">{metric.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">
                              {metric.score}/{metric.maxScore}
                            </div>
                            <div className="text-white/60 text-sm">Weight: {metric.weight}%</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Quality Assessment Form */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Quality Assessment
                </h2>

                <div className="space-y-6">
                  {/* Quick Rating */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-3">
                      Overall Service Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          className="w-12 h-12 rounded-xl border-2 border-white/20 hover:border-yellow-400 transition-colors flex items-center justify-center"
                        >
                          <Star className="w-6 h-6 text-white/60 hover:text-yellow-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Detailed Feedback
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share your experience with this contractor..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Upload Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                      <Camera className="w-8 h-8 text-white/60 mx-auto mb-2" />
                      <div className="text-white/80">Upload completion photos</div>
                      <div className="text-white/60 text-sm">JPG, PNG up to 10MB</div>
                    </div>
                  </div>

                  {/* Submit Assessment */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-quantum"
                  >
                    Submit Quality Assessment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Bell className="w-6 h-6 mr-3" />
                    Performance Alerts
                  </h2>
                  <div className="flex space-x-3">
                    <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        alert.resolved 
                          ? 'border-green-400/30 bg-green-500/10' 
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAlertColor(alert.severity)}`}>
                            {alert.type === 'location_deviation' && <MapPin className="w-5 h-5" />}
                            {alert.type === 'time_overrun' && <Clock className="w-5 h-5" />}
                            {alert.type === 'quality_issue' && <AlertTriangle className="w-5 h-5" />}
                            {alert.type === 'safety_concern' && <Shield className="w-5 h-5" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-white font-semibold">{alert.message}</h3>
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getAlertColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="text-white/60 text-sm">
                              {new Date(alert.timestamp).toLocaleString()} • Project {alert.projectId}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {!alert.resolved && (
                            <button className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </button>
                          )}
                          <button className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Performance Trends */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  Performance Trends
                </h2>
                
                <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
                    <p className="text-white/70">Performance metrics and trend analysis</p>
                  </div>
                </div>
              </div>

              {/* Quality Insights */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Quality Insights
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Average Rating</span>
                      <span className="text-2xl font-bold text-white">4.8</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-[96%]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">On-Time Completion</span>
                      <span className="text-2xl font-bold text-white">94%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[94%]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Client Satisfaction</span>
                      <span className="text-2xl font-bold text-white">98%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full w-[98%]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}