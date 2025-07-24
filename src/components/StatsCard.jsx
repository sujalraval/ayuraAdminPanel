import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 bg-${color}-100`}>
                        {icon}
                    </div>
                    <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;