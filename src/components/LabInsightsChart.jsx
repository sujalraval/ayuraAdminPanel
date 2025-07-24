import React from 'react';

const LabInsightsChart = ({ title, data, color = 'red' }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-1/4 text-sm text-gray-600">{item.label}</div>
                        <div className="w-3/4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full bg-${color}-500`}
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-1/6 text-right text-sm font-medium text-gray-900">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LabInsightsChart;