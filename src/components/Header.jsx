import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import PatientDetailsModal from './PatientDetailsModal';

// Use production API URL consistently
const API_BASE_URL = 'https://ayuras.life/api/v1';

const Header = ({ adminUser, onLogout, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch patients from API
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken');

            if (!token) {
                console.error('No admin token found');
                return;
            }

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${API_BASE_URL}/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, redirect to login
                    localStorage.removeItem('adminToken');
                    if (onLogout) onLogout();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPatients(data.data || data.users || []);

        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to fetch patients');

            if (error.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 1) {
            const results = patients.filter(patient =>
                patient.name?.toLowerCase().includes(value.toLowerCase()) ||
                patient.email?.toLowerCase().includes(value.toLowerCase()) ||
                patient.phone?.includes(value)
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('adminToken');

            // Call logout API with proper error handling
            if (token) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    await fetch(`${API_BASE_URL}/admin/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                } catch (logoutError) {
                    console.log('Logout API call failed, proceeding with local logout:', logoutError);
                    // Continue with logout even if API call fails
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local storage and call parent logout function
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminData');

            // Clear any additional storage items
            sessionStorage.clear();

            if (onLogout) {
                onLogout();
            }

            setIsLoading(false);
        }
    };

    const handleRefreshPatients = () => {
        fetchPatients();
    };

    // Get admin user info from props or localStorage
    const currentAdmin = adminUser || (() => {
        try {
            const stored = localStorage.getItem('adminUser') || localStorage.getItem('adminData');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error parsing admin user data:', error);
            return null;
        }
    })();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-800">Ayura Labs Admin</span>
                    {isLoading && (
                        <div className="ml-3 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative w-1/3">
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-12 py-2 border-gray-300 rounded-md"
                            placeholder={error ? "Search unavailable" : "Search patients..."}
                            value={searchTerm}
                            onChange={handleSearch}
                            disabled={isLoading || error}
                        />
                        {error && (
                            <button
                                onClick={handleRefreshPatients}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                title="Retry fetching patients"
                            >
                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
                            {searchResults.map(patient => (
                                <div
                                    key={patient._id || patient.id}
                                    className="cursor-pointer hover:bg-gray-100 px-4 py-2 transition-colors duration-150"
                                    onClick={() => handlePatientSelect(patient)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-gray-900">{patient.name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{patient.email || 'No Email'}</div>
                                        </div>
                                        {patient.phone && (
                                            <div className="text-sm text-gray-400">{patient.phone}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results Message */}
                    {searchTerm.length > 1 && searchResults.length === 0 && !isLoading && !error && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-2 text-gray-500 text-center">
                                No patients found for "{searchTerm}"
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && searchTerm.length > 1 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-2 text-red-500 text-center text-sm">
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                {/* Admin Info */}
                <div className="flex items-center space-x-4">
                    <button
                        className="p-1 rounded-full text-gray-500 hover:text-gray-700 relative transition-colors duration-200"
                        title="Notifications"
                    >
                        <Bell className="h-6 w-6" />
                        {/* Notification badge - you can add logic to show actual notifications */}
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                    </button>

                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {currentAdmin?.avatar ? (
                                <img
                                    src={currentAdmin.avatar}
                                    alt="Admin Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-6 w-6 text-gray-600" />
                            )}
                        </div>
                        <div className="ml-2 hidden md:block">
                            <div className="text-sm font-medium text-gray-700">
                                {currentAdmin?.name || currentAdmin?.email || 'Admin User'}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {currentAdmin?.role || 'admin'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loading || isLoading}
                        className="text-gray-500 hover:text-red-600 flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Logout"
                    >
                        {loading || isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-1"></div>
                        ) : (
                            <LogOut className="h-5 w-5 mr-1" />
                        )}
                        <span className="hidden md:block">
                            {loading || isLoading ? 'Logging out...' : 'Logout'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Details Modal */}
            {showPatientModal && selectedPatient && (
                <PatientDetailsModal
                    patient={selectedPatient}
                    onClose={() => {
                        setShowPatientModal(false);
                        setSelectedPatient(null);
                    }}
                />
            )}
        </header>
    );
};

export default Header;
