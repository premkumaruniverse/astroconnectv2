import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { UsersIcon, CurrencyRupeeIcon, ShieldCheckIcon, DocumentTextIcon, XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { admin } from '../services/api';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change} from last month
        </p>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const DetailModal = ({ application, onClose, onVerify }) => {
  if (!application) return null;

  const safeList = (list) => {
      if (Array.isArray(list)) return list;
      if (typeof list === 'string') return list.split(',').map(s => s.trim());
      return [];
  };

  const specialties = safeList(application.specialties);
  const languages = safeList(application.languages);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                Application Details
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicant Name</label>
                <p className="text-gray-900 dark:text-white">{application.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{application.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <p className="text-gray-900 dark:text-white">{application.phone || 'N/A'}</p>
              </div>
               <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Date</label>
                <p className="text-gray-900 dark:text-white">
                    {application.application_date ? new Date(application.application_date).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                  <p className="text-gray-900 dark:text-white">{application.experience} Years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    application.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                    application.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.verification_status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Specialties</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {specialties.map((s, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages</label>
                <p className="text-gray-900 dark:text-white">{languages.join(', ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-3 rounded-md mt-1">
                  {application.bio}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sticky bottom-0 z-10 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => onVerify(application.email, 'approved')}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => onVerify(application.email, 'rejected')}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-slate-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await admin.getApplications();
      setApplications(response.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (email, status) => {
    try {
      await admin.verifyAstrologer(email, status);
      await fetchApplications();
      if (selectedApp && selectedApp.email === email) {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error("Failed to verify astrologer", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
              Admin Control Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Platform Overview & Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value="₹12,45,000" change="+12%" icon={CurrencyRupeeIcon} color="bg-green-500" />
          <StatCard title="Active Users" value="8,245" change="+5%" icon={UsersIcon} color="bg-blue-500" />
          <StatCard title="Astrologers" value="156" change="+2%" icon={ShieldCheckIcon} color="bg-purple-500" />
          <StatCard title="Total Sessions" value="24,000" change="+18%" icon={DocumentTextIcon} color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Astrologer Verification Queue */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-amber-500" />
                    Verification Requests
                </h2>
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
                    ) : applications.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No pending applications.</p>
                    ) : (
                        applications.map((app) => (
                            <div key={app.email} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                                        {app.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{app.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{app.specialties?.join(', ')}</p>
                                        <p className="text-xs text-gray-500">{app.experience} years • {app.languages?.join(', ')}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Applied: {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleVerification(app.email, 'approved')}
                                        className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                                        title="Approve"
                                    >
                                        <CheckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleVerification(app.email, 'rejected')}
                                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                                        title="Reject"
                                    >
                                        <XCircleIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedApp(app)}
                                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-500 text-sm rounded transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                 <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Recent System Logs
                </h2>
                <div className="space-y-4">
                     <p className="text-gray-500 text-sm">System logs will appear here.</p>
                </div>
            </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedApp && (
        <DetailModal 
            application={selectedApp} 
            onClose={() => setSelectedApp(null)} 
            onVerify={handleVerification}
        />
      )}
    </div>
  );
};

export default AdminPanel;
