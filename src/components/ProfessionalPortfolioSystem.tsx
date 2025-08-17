"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  Eye,
  Heart,
  Share2,
  Download,
  Edit,
  Plus,
  Upload,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,

  Layers
} from 'lucide-react';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  beforeImages: string[];
  afterImages: string[];
  videoUrl?: string;

  completionDate: string;
  location: string;
  budget: number;
  duration: string;
  clientTestimonial?: {
    text: string;
    clientName: string;
    rating: number;
  };
  tags: string[];
  views: number;
  likes: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  credentialId: string;
  badgeUrl: string;
}

const mockProjects: PortfolioProject[] = [
  {
    id: '1',
    title: 'Modern Kitchen Renovation',
    description: 'Complete kitchen transformation with custom cabinetry, quartz countertops, and smart appliances. Increased home value by 35%.',
    category: 'Kitchen Renovation',
    beforeImages: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    afterImages: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    videoUrl: '/videos/kitchen-timelapse.mp4',

    completionDate: '2024-01-15',
    location: 'San Francisco, CA',
    budget: 45000,
    duration: '6 weeks',
    clientTestimonial: {
      text: 'Absolutely stunning work! The attention to detail was incredible and the project finished on time and under budget.',
      clientName: 'Sarah Johnson',
      rating: 5
    },
    tags: ['Kitchen', 'Modern', 'Smart Home', 'Custom Cabinetry'],
    views: 1247,
    likes: 89
  },
  {
    id: '2',
    title: 'Luxury Bathroom Remodel',
    description: 'Spa-inspired bathroom with heated floors, rainfall shower, and premium fixtures. Featured in Home & Design Magazine.',
    category: 'Bathroom Renovation',
    beforeImages: ['/api/placeholder/600/400'],
    afterImages: ['/api/placeholder/600/400'],
    completionDate: '2023-12-08',
    location: 'Palo Alto, CA',
    budget: 28000,
    duration: '4 weeks',
    clientTestimonial: {
      text: 'Our dream bathroom became reality. The craftsmanship is exceptional and the design is perfect.',
      clientName: 'Michael Chen',
      rating: 5
    },
    tags: ['Bathroom', 'Luxury', 'Spa', 'Heated Floors'],
    views: 892,
    likes: 67
  }
];

const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'Master Contractor License',
    issuer: 'California State License Board',
    dateObtained: '2020-03-15',
    credentialId: 'MC-2020-4782',
    badgeUrl: '/badges/master-contractor.png'
  },
  {
    id: '2',
    name: 'OSHA Safety Certification',
    issuer: 'Occupational Safety and Health Administration',
    dateObtained: '2023-01-10',
    expiryDate: '2026-01-10',
    credentialId: 'OSHA-2023-8934',
    badgeUrl: '/badges/osha-certified.png'
  }
];

export default function ProfessionalPortfolioSystem() {
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'video' | '3d' | 'testimonials'>('gallery');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!selectedProject) return;
    
    const images = showBefore ? selectedProject.beforeImages : selectedProject.afterImages;
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
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
              Professional Portfolio
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Showcase your best work with interactive galleries and project documentation. 
            Build trust and win more clients with compelling project presentations.
          </p>
        </motion.div>

        {/* Portfolio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: 'Projects Completed', value: '247', icon: CheckCircle, color: 'text-green-400' },
            { label: 'Total Views', value: '12.4K', icon: Eye, color: 'text-blue-400' },
            { label: 'Client Rating', value: '4.9', icon: Star, color: 'text-yellow-400' },
            { label: 'Portfolio Likes', value: '1.2K', icon: Heart, color: 'text-red-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card p-6 rounded-3xl text-center"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Project Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white">Recent Projects</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="btn-quantum flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Project</span>
          </motion.button>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mockProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card rounded-3xl overflow-hidden magnetic-hover cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              {/* Project Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.afterImages[0]}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">
                  {project.category}
                </div>
                
                {/* Stats Overlay */}
                <div className="absolute bottom-4 right-4 flex space-x-3">
                  <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-white text-xs">{project.views}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-white text-xs">{project.likes}</span>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${project.budget.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 rounded-3xl"
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Award className="w-8 h-8 mr-3 text-yellow-400" />
            Professional Certifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCertifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{cert.name}</h3>
                <p className="text-white/70 text-sm mb-3">{cert.issuer}</p>
                
                <div className="space-y-2 text-xs text-white/60">
                  <div>Obtained: {new Date(cert.dateObtained).toLocaleDateString()}</div>
                  {cert.expiryDate && (
                    <div>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</div>
                  )}
                  <div>ID: {cert.credentialId}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Project Detail Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="glass-card rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">{selectedProject.title}</h2>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-8">
                  {[
                    { id: 'gallery', label: 'Gallery', icon: Camera },
                    { id: 'video', label: 'Time-lapse', icon: Video },

                    { id: 'testimonials', label: 'Testimonials', icon: Star }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'gallery' && (
                    <motion.div
                      key="gallery"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {/* Before/After Toggle */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="bg-white/10 rounded-2xl p-1 flex">
                          <button
                            onClick={() => setShowBefore(true)}
                            className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                              showBefore ? 'bg-blue-500 text-white' : 'text-white/70'
                            }`}
                          >
                            Before
                          </button>
                          <button
                            onClick={() => setShowBefore(false)}
                            className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                              !showBefore ? 'bg-green-500 text-white' : 'text-white/70'
                            }`}
                          >
                            After
                          </button>
                        </div>
                      </div>

                      {/* Image Gallery */}
                      <div className="relative">
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                          <img
                            src={(showBefore ? selectedProject.beforeImages : selectedProject.afterImages)[currentImageIndex]}
                            alt={`${selectedProject.title} - ${showBefore ? 'Before' : 'After'}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Navigation Arrows */}
                        <button
                          onClick={() => handleImageNavigation('prev')}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={() => handleImageNavigation('next')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'video' && selectedProject.videoUrl && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative"
                    >
                      <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                        <video
                          ref={videoRef}
                          src={selectedProject.videoUrl}
                          className="w-full h-full object-cover"
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                        />
                      </div>

                      {/* Video Controls */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button
                          onClick={toggleVideoPlayback}
                          className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          {isVideoPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white ml-1" />
                          )}
                        </button>

                        <button
                          onClick={toggleVideoMute}
                          className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          {isVideoMuted ? (
                            <VolumeX className="w-6 h-6 text-white" />
                          ) : (
                            <Volume2 className="w-6 h-6 text-white" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}



                  {activeTab === 'testimonials' && selectedProject.clientTestimonial && (
                    <motion.div
                      key="testimonials"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-8"
                    >
                      <div className="flex items-center space-x-1 mb-4">
                        {[...Array(selectedProject.clientTestimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      <blockquote className="text-xl text-white/90 leading-relaxed mb-6">
                        "{selectedProject.clientTestimonial.text}"
                      </blockquote>
                      
                      <div className="text-white/70">
                        — {selectedProject.clientTestimonial.clientName}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <Calendar className="w-6 h-6 text-blue-400 mb-2" />
                    <div className="text-white/60 text-sm">Completed</div>
                    <div className="text-white font-semibold">{new Date(selectedProject.completionDate).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <Clock className="w-6 h-6 text-green-400 mb-2" />
                    <div className="text-white/60 text-sm">Duration</div>
                    <div className="text-white font-semibold">{selectedProject.duration}</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <DollarSign className="w-6 h-6 text-yellow-400 mb-2" />
                    <div className="text-white/60 text-sm">Budget</div>
                    <div className="text-white font-semibold">${selectedProject.budget.toLocaleString()}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}