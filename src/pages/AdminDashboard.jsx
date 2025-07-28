import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import withAdminAuth from '../hoc/withAdminAuth.jsx';
import Header from '../components/Header';
import ReportRequests from './ReportRequests';
import Patients from './Patients';
import UploadReports from './PreviousReports';
import LabInsights from './LabInsights';
import Working from './Working';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = 'https://ayuras.life/api/v1';

// Define tabs configuration outside the component
const adminTabs = [
    {
        id: 'report-requests',
        label: 'Report Requests',
        description: 'Manage pending order requests',
        allowedRoles: ['admin', 'manager', 'superadmin']
    },
    {
        id: 'working',
        label: 'Working',
        description: 'Manage orders in progress',
        allowedRoles: ['admin', 'labtech', 'manager', 'superadmin']
    },
    {
        id: 'previous-reports',
        label: 'Previous Reports',
        description: 'View uploaded reports',
        allowedRoles: ['admin', 'labtech', 'manager', 'superadmin']
    },
    {
        id: 'patients',
        label: 'Patients',
        description: 'Manage patient data',
        allowedRoles: ['admin', 'manager', 'superadmin']
    },
    {
        id: 'lab-insights',
        label: 'Lab Insights',
        description: 'View analytics and insights',
        allowedRoles: ['admin', 'manager', 'superadmin']
    },
];

const AdminDashboard = ({ admin: propAdmin }) => {
    const [activeTab, setActiveTab] = useState('report-requests');
    const [adminUser, setAdminUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAdminUser = () => {
            try {
                if (propAdmin) {
                    setAdminUser(propAdmin);
                    return;
                }

                const storedUser = localStorage.getItem('adminUser') || localStorage.getItem('adminData');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setAdminUser(parsedUser);
                } else {
                    setError('No admin user data found');
                    console.error('No admin user data available');
                }
            } catch (err) {
                setError('Failed to load admin user data');
                console.error('Error loading admin user:', err);
                toast.error('Failed to load user data');
            }
        };

        initializeAdminUser();
    }, [propAdmin]);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            if (token) {
                try {
                    await axios.post('/admin/logout', {}, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        timeout: 5000
                    });
                } catch (logoutError) {
                    console.log('Logout API call failed, proceeding with local logout:', logoutError);
                }
            }

            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminData');

            delete axios.defaults.headers.common['Authorization'];

            document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.ayuras.life';
            document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            toast.success('Logged out successfully');
            navigate('/admin/login');
        } catch (err) {
            setError('Error during logout');
            console.error('Logout error:', err);
            toast.error('Error during logout');
            localStorage.clear();
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tabId) => {
        try {
            setActiveTab(tabId);
            setError(null);
        } catch (err) {
            console.error('Error changing tab:', err);
            toast.error('Error switching tabs');
        }
    };

    const visibleTabs = adminTabs.filter(tab => {
        if (!adminUser || !adminUser.role) return true;
        return tab.allowedRoles.includes(adminUser.role);
    });

    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.find(tab => tab.id === activeTab)) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [visibleTabs, activeTab]);

    if (!adminUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                adminUser={adminUser}
                onLogout={handleLogout}
                loading={loading}
            />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4 flex justify-between items-center">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-700 hover:text-red-900"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                        Welcome, <span className="font-medium">{adminUser.name || adminUser.email}</span>
                        {adminUser.role && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {adminUser.role}
                            </span>
                        )}
                    </div>
                    <div>
                        Last login: {adminUser.lastLogin ? new Date(adminUser.lastLogin).toLocaleString() : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200 px-4 sm:px-6">
                <div className="flex overflow-x-auto py-2 space-x-6">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                                    ? 'text-red-600 border-b-2 border-red-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => handleTabChange(tab.id)}
                            title={tab.description}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="transition-opacity duration-200">
                    {activeTab === 'report-requests' && <ReportRequests adminUser={adminUser} />}
                    {activeTab === 'working' && <Working adminUser={adminUser} />}
                    {activeTab === 'previous-reports' && <UploadReports adminUser={adminUser} />}
                    {activeTab === 'patients' && <Patients adminUser={adminUser} />}
                    {activeTab === 'lab-insights' && <LabInsights adminUser={adminUser} />}
                </div>
            </div>

            <footer className="bg-white border-t border-gray-200 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="text-center text-sm text-gray-500">
                        © 2024 Ayuras Admin Panel. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Named export for the component
export { AdminDashboard };

// Default export with HOC wrapper
export default withAdminAuth(AdminDashboard, ['admin', 'labtech', 'superadmin', 'manager']);