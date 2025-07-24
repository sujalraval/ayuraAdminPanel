import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import PatientDetailsModal from './PatientDetailsModal';

const Header = ({ adminUser, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch patients from API
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/v1/auth/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPatients(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 1) {
            const results = patients.filter(patient =>
                patient.name?.toLowerCase().includes(value.toLowerCase()) ||
                patient.email?.toLowerCase().includes(value.toLowerCase())
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
            const token = localStorage.getItem('adminToken');

            // Call logout API
            await fetch('http://localhost:5000/api/v1/admin/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and call parent logout function
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminUser');

            if (onLogout) {
                onLogout();
            }
        }
    };

    // Get admin user info from props or localStorage
    const currentAdmin = adminUser || (() => {
        const stored = localStorage.getItem('adminUser');
        return stored ? JSON.parse(stored) : null;
    })();

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-800">Ayura Labs Admin</span>
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
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
                            {searchResults.map(patient => (
                                <div
                                    key={patient._id || patient.id}
                                    className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                                    onClick={() => handlePatientSelect(patient)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{patient.name}</div>
                                            <div className="text-sm text-gray-500">{patient.email}</div>
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
                    {searchTerm.length > 1 && searchResults.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-2 text-gray-500 text-center">
                                No patients found
                            </div>
                        </div>
                    )}
                </div>

                {/* Admin Info */}
                <div className="flex items-center space-x-4">
                    <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 relative">
                        <Bell className="h-6 w-6" />
                        {/* Notification badge - you can add logic to show actual notifications */}
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-2 hidden md:block">
                            <div className="text-sm font-medium text-gray-700">
                                {currentAdmin?.name || 'Admin User'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {currentAdmin?.role || 'admin'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 flex items-center transition-colors duration-200"
                    >
                        <LogOut className="h-5 w-5 mr-1" />
                        <span className="hidden md:block">Logout</span>
                    </button>
                </div>
            </div>

            {/* Patient Details Modal */}
            {showPatientModal && selectedPatient && (
                <PatientDetailsModal
                    patient={selectedPatient}
                    onClose={() => setShowPatientModal(false)}
                />
            )}
        </header>
    );
};

export default Header;