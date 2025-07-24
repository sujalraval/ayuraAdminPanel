import React from 'react';
import ReportRequestsTable from '../components/ReportRequestsTable';

const ReportRequests = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Report Requests</h2>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <ReportRequestsTable />
            </div>
        </div>
    );
};

export default ReportRequests;