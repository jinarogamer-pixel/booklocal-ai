"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';

// Mock data for demonstration
const mockLeads = [
  {
    id: 'lead_1705123456789',
    timestamp: '2025-01-15T10:30:00Z',
    type: 'customer_lead',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    serviceType: 'Plumbing',
    zipCode: '33101',
    description: 'Kitchen sink is leaking and needs immediate repair. Water is dripping constantly.',
    urgency: 'high',
    status: 'new',
    source: 'website_form'
  },
  {
    id: 'lead_1705123456790',
    timestamp: '2025-01-15T09:15:00Z',
    type: 'customer_lead',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 987-6543',
    serviceType: 'Electrical',
    zipCode: '33102',
    description: 'Need to install new outlets in home office and upgrade electrical panel.',
    urgency: 'medium',
    status: 'contacted',
    source: 'website_form'
  },
  {
    id: 'contractor_1705123456791',
    timestamp: '2025-01-15T08:45:00Z',
    type: 'contractor_application',
    name: 'Mike Rodriguez',
    email: 'mike@mikehandyman.com',
    phone: '(555) 555-5555',
    serviceType: 'Handyman',
    zipCode: '33103',
    experience: '6-10',
    hasLicense: 'no',
    hasInsurance: 'yes',
    status: 'pending_review',
    source: 'website_form'
  }
];

const urgencyColors = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  emergency: 'text-red-600 bg-red-100'
};

const statusColors = {
  new: 'text-blue-600 bg-blue-100',
  contacted: 'text-purple-600 bg-purple-100',
  pending_review: 'text-yellow-600 bg-yellow-100',
  approved: 'text-green-600 bg-green-100',
  rejected: 'text-red-600 bg-red-100'
};

export default function AdminLeadsPage() {
  const [filter, setFilter] = useState('all');
  const [leads] = useState(mockLeads);

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    if (filter === 'customers') return lead.type === 'customer_lead';
    if (filter === 'contractors') return lead.type === 'contractor_application';
    return true;
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lead Management Dashboard
          </h1>
          <p className="text-gray-600">
            Manage customer leads and contractor applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Phone className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Customer Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(l => l.type === 'customer_lead').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Contractor Apps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(l => l.type === 'contractor_application').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.filter(l => l.urgency === 'high' || l.urgency === 'emergency').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Leads' },
                { value: 'customers', label: 'Customer Leads' },
                { value: 'contractors', label: 'Contractor Applications' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lead.type === 'customer_lead' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {lead.type === 'customer_lead' ? 'Customer Lead' : 'Contractor Application'}
                  </div>
                  
                  {lead.urgency && (
                    <div className={`px-2 py-1 rounded text-xs font-medium ${urgencyColors[lead.urgency as keyof typeof urgencyColors]}`}>
                      {lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1)}
                    </div>
                  )}
                  
                  <div className={`px-2 py-1 rounded text-xs font-medium ${statusColors[lead.status as keyof typeof statusColors]}`}>
                    {lead.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {formatDate(lead.timestamp)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{lead.name}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                    {lead.phone}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{lead.serviceType} - {lead.zipCode}</span>
                </div>
              </div>

              {lead.type === 'customer_lead' && lead.description && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Project Description:</h4>
                  <p className="text-gray-600">{lead.description}</p>
                </div>
              )}

              {lead.type === 'contractor_application' && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2 font-medium">{(lead as any).experience} years</span>
                    </div>
                    <div>
                      <span className="text-gray-500">License:</span>
                      <span className="ml-2 font-medium">{(lead as any).hasLicense === 'yes' ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Insurance:</span>
                      <span className="ml-2 font-medium">{(lead as any).hasInsurance === 'yes' ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="ml-2 font-mono text-xs">{lead.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 pt-4 border-t">
                {lead.type === 'customer_lead' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Match Contractors
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Mark Contacted
                    </button>
                  </>
                )}
                
                {lead.type === 'contractor_application' && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                      Schedule Interview
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                      Reject
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No leads have been captured yet.' 
                : `No ${filter} found with the current filters.`}
            </p>
          </div>
        )}

        {/* Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a demo dashboard showing mock data. In production, this would connect to your database and display real leads and applications.
          </p>
        </div>
      </div>
    </div>
  );
}