import React, { useState } from 'react';
import CategoriesPanel from '../components/admin/CategoriesPanel';
import LabTestsPanel from '../components/admin/LabTestsPanel';
import PopularTestsPanel from '../components/admin/PopularTestsPanel';
import WhyChoosePanel from '../components/admin/WhyChoosePanel';
import ExpectationsPanel from '../components/admin/ExpectationsPanel';
import TestimonialsPanel from '../components/admin/TestimonialsPanel';
import InsightsDashboard from '../components/InsightsDashboard';
import axios from 'axios';

// Set the base URL for all API requests
axios.defaults.baseURL = 'https://ayuras.life/api/v1';

const LabInsights = () => {
    const [activeTab, setActiveTab] = useState('insights');
    const [currentSection, setCurrentSection] = useState('categories');
    const [error, setError] = useState(null);

    const isSuperAdmin = true;

    const renderAdminSection = () => {
        const commonProps = {
            currentSection,
        };

        try {
            switch (currentSection) {
                case 'categories':
                    return <CategoriesPanel {...commonProps} />;
                case 'labTests':
                    return <LabTestsPanel {...commonProps} />;
                case 'popularTests':
                    return <PopularTestsPanel {...commonProps} />;
                case 'whyChoose':
                    return <WhyChoosePanel {...commonProps} />;
                case 'expectations':
                    return <ExpectationsPanel {...commonProps} />;
                case 'testimonials':
                    return <TestimonialsPanel {...commonProps} />;
                default:
                    return null;
            }
        } catch (err) {
            setError(err.message);
            return <div className="text-red-500 p-4">Error loading section: {error}</div>;
        }
    };

    return (
        <div className="p-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {isSuperAdmin && (
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => {
                                setActiveTab('insights');
                                setError(null);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'insights'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Insights Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('admin');
                                setError(null);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'admin'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Admin Panel
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'insights' && <InsightsDashboard />}

            {activeTab === 'admin' && (
                <div>
                    <div className="mb-6">
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                            {['categories', 'labTests', 'popularTests', 'whyChoose', 'expectations', 'testimonials'].map((section) => (
                                <button
                                    key={section}
                                    onClick={() => {
                                        setCurrentSection(section);
                                        setError(null);
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${currentSection === section
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {renderAdminSection()}
                </div>
            )}
        </div>
    );
};

export default LabInsights;