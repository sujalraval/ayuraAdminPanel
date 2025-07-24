// components/InsightsDashboard.jsx
import React, { useState } from 'react';
import { CreditCard, Activity, BarChart2, TrendingUp } from 'lucide-react';
import InsightsCard from './InsightsCard';

const InsightsDashboard = () => {
    const [dateRange, setDateRange] = useState('month');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lab Insights</h2>
                <div className="flex space-x-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InsightsCard
                    title="Total Revenue"
                    value="₹1,84,200"
                    change={12.5}
                    icon={<CreditCard className="h-6 w-6 text-red-500" />}
                />
                <InsightsCard
                    title="Tests Conducted"
                    value="462"
                    change={8.2}
                    icon={<Activity className="h-6 w-6 text-blue-500" />}
                    color="blue"
                />
                <InsightsCard
                    title="New Patients"
                    value="84"
                    change={5.7}
                    icon={<TrendingUp className="h-6 w-6 text-green-500" />}
                    color="green"
                />
                <InsightsCard
                    title="Avg. Report Time"
                    value="18h"
                    change={-3.2}
                    icon={<BarChart2 className="h-6 w-6 text-yellow-500" />}
                    color="yellow"
                />
            </div>
        </div>
    );
};

export default InsightsDashboard;
