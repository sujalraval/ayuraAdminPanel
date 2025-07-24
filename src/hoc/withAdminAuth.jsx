import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

export default function withAdminAuth(Component, allowedRoles = []) {
    return function AuthWrapper(props) {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
            const verifyAuth = async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    const adminData = JSON.parse(localStorage.getItem('adminData'));

                    if (!token || !adminData) {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminData');
                        navigate('/admin/login');
                        return;
                    }

                    // Verify token with backend
                    const response = await fetch('http://localhost:5000/api/v1/admin/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminData');
                        navigate('/admin/login');
                        toast.error('Session expired. Please login again.');
                        return;
                    }

                    const data = await response.json();

                    // Check role permissions if specified
                    if (allowedRoles.length > 0 && !allowedRoles.includes(data.admin.role)) {
                        navigate('/admin/unauthorized');
                        return;
                    }

                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth verification error:', error);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
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