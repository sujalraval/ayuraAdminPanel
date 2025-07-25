import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = window.location.hostname === 'admin.ayuras.life'
    ? 'https://api.ayuras.life/api/v1'
    : 'http://localhost:5000/api/v1';

export default function withAdminAuth(Component, allowedRoles = []) {
    return function AuthWrapper(props) {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
            const verifyAuth = async () => {
                try {
                    // Try to get token from both localStorage and cookies
                    const token = localStorage.getItem('adminToken');

                    if (!token) {
                        navigate('/admin/login');
                        return;
                    }

                    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        navigate('/admin/login');
                        toast.error('Session expired. Please login again.');
                        return;
                    }

                    const data = await response.json();

                    if (allowedRoles.length > 0 && !allowedRoles.includes(data.admin.role)) {
                        navigate('/admin/unauthorized');
                        return;
                    }

                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth verification error:', error);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    navigate('/admin/login');
                    toast.error('Authentication failed. Please login again.');
                } finally {
                    setIsLoading(false);
                }
            };

            verifyAuth();
        }, [navigate]);

        if (isLoading) {
            return <LoadingSpinner fullScreen />;
        }

        if (!isAuthenticated) {
            return null;
        }

        return <Component {...props} />;
    };
}