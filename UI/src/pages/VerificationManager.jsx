import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, EyeIcon, DocumentTextIcon, UserIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/solid';

const VerificationManager = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const applications = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      specialty: 'Vedic Astrology',
      experience: 15,
      appliedDate: '2024-01-08',
      status: 'pending',
      certificates: [
        { name: 'Vedic Astrology Certificate', type: 'pdf', url: '#' },
        { name: 'Experience Letter', type: 'pdf', url: '#' }
      ],
      idProof: { name: 'Aadhaar Card', type: 'pdf', url: '#' },
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      bio: 'Expert Vedic astrologer with 15+ years of experience in birth chart analysis and predictions.',
      languages: ['Hindi', 'English', 'Sanskrit'],
      consultationTypes: ['Video Call', 'Audio Call', 'Chat'],
      rate: 25
    },
    {
      id: 2,
      name: 'Tarot Master Raj',
      email: 'raj.tarot@email.com',
      phone: '+91 91234 56789',
      specialty: 'Tarot Reading',
      experience: 8,
      appliedDate: '2024-01-07',
      status: 'pending',
      certificates: [
        { name: 'Tarot Reading Certification', type: 'pdf', url: '#' },
        { name: 'Psychic Development Course', type: 'pdf', url: '#' }
      ],
      idProof: { name: 'PAN Card', type: 'pdf', url: '#' },
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Professional tarot reader specializing in love, career, and spiritual guidance.',
      languages: ['English', 'Hindi'],
      consultationTypes: ['Video Call', 'Chat'],
      rate: 20
    },
    {
      id: 3,
      name: 'Numerologist Anjali',
      email: 'anjali.numerology@email.com',
      phone: '+91 99887 76655',
      specialty: 'Numerology',
      experience: 12,
      appliedDate: '2024-01-06',
      status: 'approved',
      certificates: [
        { name: 'Numerology Diploma', type: 'pdf', url: '#' },
        { name: 'Vastu Shastra Certificate', type: 'pdf', url: '#' }
      ],
      idProof: { name: 'Driving License', type: 'pdf', url: '#' },
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Expert numerologist with deep knowledge of name correction and life path analysis.',
      languages: ['Hindi', 'English', 'Marathi'],
      consultationTypes: ['Audio Call', 'Chat'],
      rate: 18
    }
  ];

  const handleApprove = (id) => {
    // Handle approval logic
    console.log('Approved application:', id);
    setShowModal(false);
  };

  const handleReject = (id) => {
    // Handle rejection logic
    console.log('Rejected application:', id);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve astrologer applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {applications.filter(a => a.status === 'pending').length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pending Applications
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {applications.filter(a => a.status === 'approved').length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Approved Applications
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {applications.filter(a => a.status === 'rejected').length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Rejected Applications
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {applications.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Total Applications
            </p>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Applications
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {applications.map(application => (
              <div key={application.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={application.photo}
                      alt={application.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {application.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {application.specialty} • {application.experience} years experience
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {application.email} • {application.phone}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{application.rate}/min
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {application.languages.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Applied: {application.appliedDate}
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Review
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(application.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(application.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Application Review
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <img
                      src={selectedApplication.photo}
                      alt={selectedApplication.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedApplication.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedApplication.specialty}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Consultation Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">₹{selectedApplication.rate}/min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Languages</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.languages.join(', ')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Applied Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.appliedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Biography
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {selectedApplication.bio}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Certificates
                    </h4>
                    <div className="space-y-2">
                      {selectedApplication.certificates.map((cert, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                          <span className="text-gray-900 dark:text-white">{cert.name}</span>
                          <button className="ml-auto text-primary hover:text-blue-700">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      ID Proof
                    </h4>
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <span className="text-gray-900 dark:text-white">{selectedApplication.idProof.name}</span>
                      <button className="ml-auto text-primary hover:text-blue-700">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {selectedApplication.status === 'pending' && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(selectedApplication.id)}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedApplication.id)}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationManager;