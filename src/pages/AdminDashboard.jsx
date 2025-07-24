import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import withAdminAuth from '../hoc/withAdminAuth.jsx';

// Import your dashboard components
import Header from '../components/Header';
import ReportRequests from './ReportRequests';
import Patients from './Patients';
import UploadReports from './PreviousReports';
import LabInsights from './LabInsights';
import Working from './Working';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('report-requests');
    const [adminUser, setAdminUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('adminUser');
        if (user) {
            setAdminUser(JSON.parse(user));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
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
                            onClick={() => setActiveTab(tab.id)}
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

// Protect the dashboard - allow admin and labtech roles
export default withAdminAuth(AdminDashboard, ['admin', 'labtech', 'superadmin']);