import React from 'react';
import { FileText, CheckCircle, Clock, User } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { id: 1, patient: 'Rahul Sharma', test: 'Thyroid Profile', action: 'uploaded', time: '2 hours ago', status: 'completed' },
    { id: 2, patient: 'Priya Patel', test: 'Vitamin D Test', action: 'requested', time: '4 hours ago', status: 'pending' },
    { id: 3, patient: 'Amit Kumar', test: 'Liver Function Test', action: 'uploaded', time: '1 day ago', status: 'completed' },
    { id: 4, patient: 'Neha Gupta', test: 'Complete Blood Count', action: 'requested', time: '2 days ago', status: 'pending' },
  ];

  const getIcon = (status) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-md p-2">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.test}
                  </h4>
                  <span className="inline-flex items-center text-xs text-gray-500">
                    {activity.time}
                  </span>
                </div>
                <div className="mt-1 flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm text-gray-500 truncate">
                    {activity.patient} {activity.action} report
                  </p>
                </div>
              </div>
              <div className="ml-4">
                {getIcon(activity.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;