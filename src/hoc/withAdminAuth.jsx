import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = window.location.hostname === 'admin.ayuras.life'
    ? 'https://api.ayuras.life/api/v1'
    : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function withAdminAuth(Component, allowedRoles = []) {
    return function AuthWrapper(props) {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
            const verifyAuth = async () => {
                try {
                    // Get token from localStorage
                    const token = localStorage.getItem('adminToken');

                    if (!token) {
                        navigate('/admin/login');
                        return;
                    }

                    // Create abort controller for timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        // Clear stored data and redirect to login
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        navigate('/admin/login');
                        toast.error('Session expired. Please login again.');
                        return;
                    }

                    const data = await response.json();

                    // Check role authorization
                    if (allowedRoles.length > 0 && !allowedRoles.includes(data.admin.role)) {
                        navigate('/admin/unauthorized');
                        return;
                    }

                    // Update stored user data
                    localStorage.setItem('adminUser', JSON.stringify(data.admin));
                    setIsAuthenticated(true);

                } catch (error) {
                    console.error('Auth verification error:', error);

                    // Clear stored data
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');

                    if (error.name === 'AbortError') {
                        toast.error('Connection timeout. Please try again.');
                    } else {
                        toast.error('Authentication failed. Please login again.');
                    }

                    navigate('/admin/login');
                } finally {
                    setIsLoading(false);
                }
            };

            verifyAuth();
        }, [navigate, allowedRoles]);

        if (isLoading) {
            return <LoadingSpinner />;
        }

        if (!isAuthenticated) {
            return null;
        }

        return <Component {...props} />;
    };
}