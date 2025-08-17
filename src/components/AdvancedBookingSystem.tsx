"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  MessageCircle,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  Shield,
  Phone,
  Video,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Send,
  Paperclip,
  Star,
  Flag,
  Settings,
  Bell,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  contractor: {
    id: string;
    name: string;
    avatar: string;
    hourlyRate: number;
  };
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  attachments: ProjectFile[];
  clientApprovalRequired: boolean;
  clientApproved?: boolean;
  estimatedHours: number;
  actualHours?: number;
}

interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  uploadedBy: string;
  uploadedAt: string;
  size: number;
}

interface ProjectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  attachments?: ProjectFile[];
  type: 'message' | 'milestone_update' | 'payment_request' | 'system';
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  contractor: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  client: {
    id: string;
    name: string;
    avatar: string;
  };
  startDate: string;
  endDate: string;
  budget: number;
  milestones: ProjectMilestone[];
  messages: ProjectMessage[];
  location: string;
  category: string;
}

const mockBookingSlots: BookingSlot[] = [
  {
    id: '1',
    date: '2024-01-20',
    startTime: '09:00',
    endTime: '17:00',
    available: true,
    contractor: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      hourlyRate: 85
    }
  },
  {
    id: '2',
    date: '2024-01-21',
    startTime: '10:00',
    endTime: '16:00',
    available: true,
    contractor: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      hourlyRate: 85
    }
  }
];

const mockProject: Project = {
  id: '1',
  title: 'Kitchen Renovation',
  description: 'Complete kitchen remodel with new cabinets, countertops, and appliances',
  status: 'active',
  contractor: {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    rating: 4.9
  },
  client: {
    id: '2',
    name: 'John Smith',
    avatar: 'JS'
  },
  startDate: '2024-01-15',
  endDate: '2024-02-28',
  budget: 45000,
  location: 'San Francisco, CA',
  category: 'Kitchen Renovation',
  milestones: [
    {
      id: '1',
      title: 'Demolition Phase',
      description: 'Remove existing cabinets, countertops, and appliances',
      dueDate: '2024-01-22',
      status: 'completed',
      progress: 100,
      attachments: [],
      clientApprovalRequired: true,
      clientApproved: true,
      estimatedHours: 16,
      actualHours: 14
    },
    {
      id: '2',
      title: 'Electrical & Plumbing',
      description: 'Update electrical wiring and plumbing for new layout',
      dueDate: '2024-01-29',
      status: 'in_progress',
      progress: 65,
      attachments: [],
      clientApprovalRequired: false,
      estimatedHours: 24,
      actualHours: 16
    },
    {
      id: '3',
      title: 'Cabinet Installation',
      description: 'Install new custom cabinets and hardware',
      dueDate: '2024-02-05',
      status: 'pending',
      progress: 0,
      attachments: [],
      clientApprovalRequired: true,
      estimatedHours: 32
    }
  ],
  messages: [
    {
      id: '1',
      senderId: '1',
      senderName: 'Sarah Johnson',
      senderAvatar: 'SJ',
      content: 'Demo phase completed ahead of schedule! Everything went smoothly.',
      timestamp: '2024-01-22T14:30:00Z',
      type: 'milestone_update'
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'John Smith',
      senderAvatar: 'JS',
      content: 'Great work! The space looks perfect for the next phase.',
      timestamp: '2024-01-22T15:00:00Z',
      type: 'message'
    }
  ]
};

export default function AdvancedBookingSystem() {
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-20');
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [activeProject, setActiveProject] = useState<Project>(mockProject);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'booking' | 'project' | 'calendar'>('booking');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'overdue': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ProjectMessage = {
      id: Date.now().toString(),
      senderId: '2',
      senderName: 'John Smith',
      senderAvatar: 'JS',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    setActiveProject(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
    
    setNewMessage('');
  };

  const handleMilestoneApproval = (milestoneId: string, approved: boolean) => {
    setActiveProject(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === milestoneId 
          ? { ...m, clientApproved: approved }
          : m
      )
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
              Project Management
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Advanced booking system with milestone tracking, real-time collaboration, 
            and integrated payment processing for seamless project delivery.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-3xl p-2 flex space-x-2">
            {[
              { id: 'booking', label: 'Smart Booking', icon: Calendar },
              { id: 'project', label: 'Project Hub', icon: Target },
              { id: 'calendar', label: 'Schedule View', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'booking' | 'project' | 'calendar')}
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
          {activeTab === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Available Slots */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  Available Time Slots
                </h2>

                <div className="space-y-4">
                  {mockBookingSlots.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        selectedSlot?.id === slot.id
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-white/70">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {slot.contractor.avatar}
                            </div>
                            <span className="text-white/80">{slot.contractor.name}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            ${slot.contractor.hourlyRate}/hr
                          </div>
                          <div className="text-green-400 text-sm font-semibold">
                            Available
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Booking Details */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Booking Details
                </h2>

                {selectedSlot ? (
                  <div className="space-y-6">
                    {/* Selected Slot Info */}
                    <div className="bg-purple-500/10 border border-purple-400/30 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Selected Appointment</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-blue-400" />
                          <span className="text-white">
                            {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-green-400" />
                          <span className="text-white">
                            {selectedSlot.startTime} - {selectedSlot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-purple-400" />
                          <span className="text-white">{selectedSlot.contractor.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-yellow-400" />
                          <span className="text-white">${selectedSlot.contractor.hourlyRate}/hour</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Details Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm font-semibold mb-2">
                          Project Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Kitchen Renovation"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm font-semibold mb-2">
                          Project Description
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Describe your project requirements..."
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm font-semibold mb-2">
                            Estimated Budget
                          </label>
                          <input
                            type="number"
                            placeholder="5000"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-semibold mb-2">
                            Project Duration
                          </label>
                          <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none">
                            <option value="">Select duration</option>
                            <option value="1-day">1 Day</option>
                            <option value="1-week">1 Week</option>
                            <option value="2-weeks">2 Weeks</option>
                            <option value="1-month">1 Month</option>
                            <option value="2-months">2+ Months</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Method
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input type="radio" name="payment" className="text-purple-500" defaultChecked />
                          <span className="text-white">Escrow Payment (Recommended)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="radio" name="payment" className="text-purple-500" />
                          <span className="text-white">Direct Payment</span>
                        </label>
                      </div>
                      <p className="text-white/60 text-sm mt-3">
                        Escrow payments are held securely until project milestones are completed.
                      </p>
                    </div>

                    {/* Book Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn-quantum text-xl py-4"
                    >
                      Book This Appointment
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Select a time slot to continue booking</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'project' && (
            <motion.div
              key="project"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Project Overview */}
              <div className="lg:col-span-2 space-y-8">
                {/* Project Header */}
                <div className="glass-card p-8 rounded-3xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{activeProject.title}</h2>
                      <p className="text-white/70">{activeProject.description}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(activeProject.status)}`}>
                      {activeProject.status.charAt(0).toUpperCase() + activeProject.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <DollarSign className="w-6 h-6 text-yellow-400 mb-2" />
                      <div className="text-white/60 text-sm">Budget</div>
                      <div className="text-white font-semibold">${activeProject.budget.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <Calendar className="w-6 h-6 text-blue-400 mb-2" />
                      <div className="text-white/60 text-sm">Start Date</div>
                      <div className="text-white font-semibold">{new Date(activeProject.startDate).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <Flag className="w-6 h-6 text-green-400 mb-2" />
                      <div className="text-white/60 text-sm">End Date</div>
                      <div className="text-white font-semibold">{new Date(activeProject.endDate).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <MapPin className="w-6 h-6 text-purple-400 mb-2" />
                      <div className="text-white/60 text-sm">Location</div>
                      <div className="text-white font-semibold">{activeProject.location}</div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="glass-card p-8 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <Target className="w-6 h-6 mr-3" />
                      Project Milestones
                    </h3>
                    <button className="btn-quantum flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeProject.milestones.map((milestone, index) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">{milestone.title}</h4>
                            <p className="text-white/70 text-sm mb-3">{milestone.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-white/60">
                              <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                              <span>Est: {milestone.estimatedHours}h</span>
                              {milestone.actualHours && (
                                <span>Actual: {milestone.actualHours}h</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ').toUpperCase()}
                            </div>
                            {milestone.clientApprovalRequired && (
                              <div className="flex space-x-2">
                                {milestone.clientApproved === undefined ? (
                                  <>
                                    <button
                                      onClick={() => handleMilestoneApproval(milestone.id, true)}
                                      className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      onClick={() => handleMilestoneApproval(milestone.id, false)}
                                      className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </>
                                ) : milestone.clientApproved ? (
                                  <div className="text-green-400 text-sm font-semibold">Approved</div>
                                ) : (
                                  <div className="text-red-400 text-sm font-semibold">Rejected</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70 text-sm">Progress</span>
                            <span className="text-white font-semibold">{milestone.progress}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${milestone.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Communication Panel */}
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Project Chat
                </h3>

                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {activeProject.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start space-x-3 ${
                        message.senderId === '2' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {message.senderAvatar}
                      </div>
                      <div className={`flex-1 ${message.senderId === '2' ? 'text-right' : ''}`}>
                        <div className="text-white/70 text-xs mb-1">
                          {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`inline-block p-3 rounded-2xl max-w-xs ${
                          message.senderId === '2' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/10 text-white'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                    <Video className="w-5 h-5" />
                    <span>Start Video Call</span>
                  </button>
                  <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                    <Upload className="w-5 h-5" />
                    <span>Upload Files</span>
                  </button>
                  <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                    <DollarSign className="w-5 h-5" />
                    <span>Request Payment</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 rounded-3xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3" />
                Schedule Overview
              </h2>
              
              <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Interactive Calendar</h3>
                  <p className="text-white/70 mb-6">Full calendar integration with Google, Outlook, and Apple Calendar</p>
                  <button className="btn-quantum">
                    Connect Calendar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}