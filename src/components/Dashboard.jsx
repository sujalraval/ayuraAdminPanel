import React, { useState } from 'react';
import { Search, User, LogIn, LogOut, X, Phone, Mail, Calendar, TestTube, Activity, BarChart3, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('new-requests');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);

    // Mock data
    const labStaff = {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@ayuralab.com'
    };

    const mockPatients = [
        {
            id: 'PT001',
            name: 'John Smith',
            age: 45,
            contact: '+91 9876543210',
            email: 'john.smith@email.com',
            recentTests: ['Blood Test', 'Lipid Profile', 'Thyroid Function']
        },
        {
            id: 'PT002',
            name: 'Maria Garcia',
            age: 32,
            contact: '+91 9876543211',
            email: 'maria.garcia@email.com',
            recentTests: ['Complete Blood Count', 'Diabetes Panel']
        },
        {
            id: 'PT003',
            name: 'David Wilson',
            age: 58,
            contact: '+91 9876543212',
            email: 'david.wilson@email.com',
            recentTests: ['Cardiac Markers', 'Liver Function Test']
        }
    ];

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setShowSearchResults(query.length > 0);
    };

    const filteredPatients = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const PatientModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
                    <button
                        onClick={() => setShowPatientModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {selectedPatient && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-3">
                            <User className="text-blue-600" size={20} />
                            <div>
                                <p className="font-semibold text-gray-800">{selectedPatient.name}</p>
                                <p className="text-sm text-gray-600">ID: {selectedPatient.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center space-x-3">
                                <Calendar className="text-gray-500" size={16} />
                                <span className="text-gray-700">Age: {selectedPatient.age} years</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone className="text-gray-500" size={16} />
                                <span className="text-gray-700">{selectedPatient.contact}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Mail className="text-gray-500" size={16} />
                                <span className="text-gray-700">{selectedPatient.email}</span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <TestTube className="mr-2" size={16} />
                                Recent Tests
                            </h3>
                            <div className="space-y-2">
                                {selectedPatient.recentTests.map((test, index) => (
                                    <div key={index} className="bg-blue-50 px-3 py-2 rounded-md text-sm text-blue-800">
                                        {test}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const NewRequestsTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">New Test Requests</h2>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    12 Pending
                </span>
            </div>

            <div className="grid gap-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">Patient ID: PT00{item}</h3>
                                <p className="text-gray-600">Blood Test Panel</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                URGENT
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Requested: 2 hours ago</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                Accept Request
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const WorkingTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Currently Processing</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    8 In Progress
                </span>
            </div>

            <div className="grid gap-4">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">Patient ID: PT01{item}</h3>
                                <p className="text-gray-600">Complete Blood Count</p>
                            </div>
                            <div className="flex items-center text-blue-600">
                                <Clock size={16} className="mr-1" />
                                <span className="text-sm">In Progress</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Started: 4 hours ago</span>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                Mark Complete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const LabInsightsTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Lab Insights & Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Today's Tests</p>
                            <p className="text-2xl font-bold text-gray-800">24</p>
                        </div>
                        <TestTube className="text-blue-600" size={32} />
                    </div>
                    <div className="mt-4 text-sm">
                        <span className="text-green-600">+12% </span>
                        <span className="text-gray-500">from yesterday</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Completion Rate</p>
                            <p className="text-2xl font-bold text-gray-800">94%</p>
                        </div>
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <div className="mt-4 text-sm">
                        <span className="text-green-600">+2% </span>
                        <span className="text-gray-500">from last week</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Average Time</p>
                            <p className="text-2xl font-bold text-gray-800">2.5h</p>
                        </div>
                        <Activity className="text-orange-600" size={32} />
                    </div>
                    <div className="mt-4 text-sm">
                        <span className="text-red-600">+0.3h </span>
                        <span className="text-gray-500">from last week</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <BarChart3 className="mr-2 text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Weekly Overview</h3>
                </div>
                <div className="h-64 flex items-end justify-between space-x-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="flex flex-col items-center flex-1">
                            <div
                                className="bg-blue-600 w-full rounded-t-md mb-2"
                                style={{ height: `${Math.random() * 150 + 50}px` }}
                            ></div>
                            <span className="text-xs text-gray-600">{day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg">
                            </div>
                            <h1 className="text-xl font-bold text-gray-800">
                                <span className="text-[#E23744]">A</span>yura's Lab Test
                            </h1>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-8 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search patients by name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                onClick={() => handlePatientSelect(patient)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <User className="text-gray-400" size={16} />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{patient.name}</p>
                                                        <p className="text-sm text-gray-600">ID: {patient.id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 text-center">
                                            No patients found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Login/Staff Info */}
                        <div>
                            {isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-800">{labStaff.name}</p>
                                        <p className="text-xs text-gray-600">{labStaff.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <LogIn size={16} />
                                    <span>Login</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('new-requests')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'new-requests'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            New Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('working')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'working'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Working
                        </button>
                        <button
                            onClick={() => setActiveTab('lab-insights')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'lab-insights'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Lab Insights
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'new-requests' && <NewRequestsTab />}
                {activeTab === 'working' && <WorkingTab />}
                {activeTab === 'lab-insights' && <LabInsightsTab />}
            </main>

            {/* Patient Modal */}
            {showPatientModal && <PatientModal />}
        </div>
    );
};

export default Dashboard;