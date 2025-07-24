// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Verify token with backend
                const response = await axios.get('http://localhost:5000/api/v1/auth/verify', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.success && response.data.user) {
                    // Check if user has required role
                    const userRole = response.data.user.role;
                    if (userRole === requiredRole || userRole === 'superadmin') {
                        setIsAuthenticated(true);
                    } else {
                        setIsAuthenticated(false);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                setIsAuthenticated(false);
                // Clear invalid token
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [requiredRole]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isAuthenticated === false) {
        return <Navigate to="/admin/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
