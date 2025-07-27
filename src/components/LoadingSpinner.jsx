import React from 'react';

const LoadingSpinner = ({
    size = 'large',
    text = 'Loading...',
    className = '',
    color = 'blue'
}) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12',
        xlarge: 'h-16 w-16'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        red: 'border-red-500',
        green: 'border-green-500',
        yellow: 'border-yellow-500',
        purple: 'border-purple-500',
        gray: 'border-gray-500'
    };

    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <div
                className={`animate-spin rounded-full border-b-2 ${colorClasses[color]} ${sizeClasses[size]}`}
                role="status"
                aria-label="Loading"
            ></div>
            {text && (
                <p className="mt-4 text-sm text-gray-600 font-medium text-center">
                    {text}
                </p>
            )}
        </div>
    );
};

// Alternative spinner designs
export const PulseLoader = ({ className = '' }) => (
    <div className={`flex space-x-2 ${className}`}>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
);

export const BarLoader = ({ className = '' }) => (
    <div className={`flex space-x-1 ${className}`}>
        {[1, 2, 3, 4].map(i => (
            <div
                key={i}
                className="w-1 h-6 bg-blue-500 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
        ))}
    </div>
);

export default LoadingSpinner;
