import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import withAdminAuth from '../hoc/withAdminAuth.jsx';
import Header from '../components/Header';
import ReportRequests from './ReportRequests';
import Patients from './Patients';
import UploadReports from './PreviousReports';
import LabInsights from './LabInsights';
import Working from './Working';
import axios from 'axios';

// Set the base URL for all API requests
axios.defaults.baseURL = 'https://ayuras.life/api/v1';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('report-requests');
    const [adminUser, setAdminUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminUser = async () => {
            try {
                const user = localStorage.getItem('adminUser');
                if (user) {
                    setAdminUser(JSON.parse(user));
                }
            } catch (err) {
                setError('Failed to load admin user');
                console.error('Error loading admin user:', err);
            }
        };

        fetchAdminUser();
    }, []);

    const handleLogout = () => {
        try {
            // Clear all admin-related localStorage items
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminUser');

            // Clear cookies by setting expired date
            document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.ayuras.life';

            navigate('/admin/login');
        } catch (err) {
            setError('Error during logout');
            console.error('Logout error:', err);
        }
    };

    const tabs = [
        { id: 'report-requests', label: 'Report Requests' },
        { id: 'working', label: 'Working' },
        { id: 'previous-reports', label: 'Previous Reports' },
        { id: 'patients', label: 'Patients' },
        { id: 'lab-insights', label: 'Lab Insights' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header adminUser={adminUser} onLogout={handleLogout} />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4">
                    {error}
                </div>
            )}

            {/* Horizontal Tabs */}
            <div className="border-b border-gray-200 px-4 sm:px-6">
                <div className="flex overflow-x-auto py-2 space-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`px-1 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-red-600 border-b-2 border-red-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setError(null);
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {activeTab === 'report-requests' && <ReportRequests />}
                {activeTab === 'working' && <Working />}
                {activeTab === 'previous-reports' && <UploadReports />}
                {activeTab === 'patients' && <Patients />}
                {activeTab === 'lab-insights' && <LabInsights />}
            </div>
        </div>
    );
}

export default withAdminAuth(AdminDashboard, ['admin', 'labtech', 'superadmin']);