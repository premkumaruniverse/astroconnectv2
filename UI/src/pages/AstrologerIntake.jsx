import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserIcon, CalendarIcon, ClockIcon, MapPinIcon, SparklesIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/solid';

const AstrologerIntake = () => {
  const { userId } = useParams();
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('kundli');

  const userData = {
    name: 'Rahul Sharma',
    dob: '1990-05-15',
    time: '14:30',
    place: 'Mumbai, Maharashtra',
    gender: 'Male',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210'
  };

  const kundliData = {
    lagna: 'Leo',
    rashi: 'Aries',
    nakshatra: 'Ashwini',
    currentDasha: 'Mercury Mahadasha - Moon Antardasha',
    nextDasha: 'Ketu Antardasha starts on 2024-03-15'
  };

  const planetPositions = [
    { planet: 'Sun', sign: 'Leo', house: 1, degrees: '15° 30\'', status: 'Exalted' },
    { planet: 'Moon', sign: 'Aries', house: 9, degrees: '22° 15\'', status: 'Own Sign' },
    { planet: 'Mars', sign: 'Scorpio', house: 4, degrees: '08° 45\'', status: 'Own Sign' },
    { planet: 'Mercury', sign: 'Virgo', house: 2, degrees: '25° 10\'', status: 'Exalted' },
    { planet: 'Jupiter', sign: 'Sagittarius', house: 5, degrees: '12° 20\'', status: 'Own Sign' },
    { planet: 'Venus', sign: 'Libra', house: 3, degrees: '18° 55\'', status: 'Own Sign' },
    { planet: 'Saturn', sign: 'Capricorn', house: 6, degrees: '05° 40\'', status: 'Own Sign' },
    { planet: 'Rahu', sign: 'Gemini', house: 11, degrees: '28° 15\'', status: '---' },
    { planet: 'Ketu', sign: 'Sagittarius', house: 5, degrees: '28° 15\'', status: '---' }
  ];

  const tabs = [
    { id: 'kundli', name: 'Kundli Details', icon: SparklesIcon },
    { id: 'planets', name: 'Planet Positions', icon: DocumentTextIcon },
    { id: 'notes', name: 'Private Notes', icon: PencilIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Consultation #{userId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  Active Call
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Duration: 12:34
                </p>
              </div>
            </div>

            {/* User Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userData.dob}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time of Birth</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userData.time}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Place of Birth</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userData.place}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {activeTab === 'kundli' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Kundli Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lagna (Ascendant)</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{kundliData.lagna}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rashi (Moon Sign)</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{kundliData.rashi}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nakshatra</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{kundliData.nakshatra}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Current Dasha</p>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{kundliData.currentDasha}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400">Next Dasha</p>
                    <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">{kundliData.nextDasha}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Planet Positions
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Planet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        House
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Degrees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {planetPositions.map((planet, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {planet.planet}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {planet.sign}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {planet.house}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {planet.degrees}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            planet.status === 'Exalted'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : planet.status === 'Own Sign'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {planet.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Private Notes
              </h2>
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your private notes about this consultation..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="flex justify-end space-x-3">
                  <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AstrologerIntake;