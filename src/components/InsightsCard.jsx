// import React from 'react';

// const InsightsCard = ({ title, value, change, icon, color = 'red' }) => {
//     const changeType = change >= 0 ? 'positive' : 'negative';

//     return (
//         <div className="bg-white p-5 rounded-lg shadow">
//             <div className="flex justify-between items-start">
//                 <div>
//                     <p className="text-sm font-medium text-gray-500">{title}</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//                 </div>
//                 <div className={`bg-${color}-100 p-3 rounded-lg`}>
//                     {icon}
//                 </div>
//             </div>
//             <div className={`mt-3 flex items-center text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
//                 <span>
//                     {changeType === 'positive' ? '↑' : '↓'} {Math.abs(change)}%
//                 </span>
//                 <span className="ml-1">from last month</span>
//             </div>
//         </div>
//     );
// };

// export default InsightsCard;

// components/InsightsCard.jsx
import React from 'react';

const InsightsCard = ({ title, value, change, icon, color = 'red' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
                {icon}
            </div>
        </div>
        <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-2">from last period</span>
        </div>
    </div>
);

export default InsightsCard;
