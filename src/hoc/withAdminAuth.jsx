import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

// Always use production API URL
const API_BASE_URL = 'https://ayuras.life/api/v1';

export default function withAdminAuth(Component, allowedRoles = []) {
    return function AuthWrapper(props) {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const [admin, setAdmin] = useState(null);
        const navigate = useNavigate();

        useEffect(() => {
            const verifyAuth = async () => {
                try {
                    const token = localStorage.getItem('adminToken');

                    if (!token) {
                        console.log('No admin token found, redirecting to login');
                        navigate('/admin/login');
                        return;
                    }

                    // Create AbortController for timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                        console.log('Request timed out after 10 seconds');
                    }, 10000);

                    console.log('Verifying admin authentication...');

                    // Use only the profile endpoint since verify doesn't exist
                    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    console.log('Auth response status:', response.status);

                    if (!response.ok) {
                        console.log('Authentication failed:', response.status, response.statusText);

                        // Clear all admin-related localStorage items
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        localStorage.removeItem('adminData');
                        localStorage.removeItem('adminRole');

                        if (response.status === 401) {
                            toast.error('Session expired. Please login again.');
                        } else if (response.status === 403) {
                            toast.error('Access denied. Insufficient permissions.');
                        } else if (response.status === 404) {
                            toast.error('Admin profile endpoint not found. Please contact support.');
                        } else {
                            toast.error('Authentication failed. Please login again.');
                        }

                        navigate('/admin/login');
                        return;
                    }

                    const data = await response.json();
                    console.log('Authentication successful:', data);

                    // Handle different response formats
                    let adminUser = null;

                    if (data.success && data.admin) {
                        adminUser = data.admin;
                    } else if (data.admin) {
                        adminUser = data.admin;
                    } else if (data.user) {
                        adminUser = data.user;
                    } else if (data.data) {
                        adminUser = data.data;
                    } else {
                        throw new Error('Invalid response format from server');
                    }

                    if (!adminUser) {
                        throw new Error('No admin user data received from server');
                    }

                    // Check role-based permissions
                    if (allowedRoles.length > 0 && adminUser.role && !allowedRoles.includes(adminUser.role)) {
                        console.log('Role not allowed:', adminUser.role, 'Required:', allowedRoles);
                        toast.error('Access denied. You do not have permission to access this page.');
                        navigate('/admin/unauthorized');
                        return;
                    }

                    // Store admin data
                    localStorage.setItem('adminUser', JSON.stringify(adminUser));
                    localStorage.setItem('adminData', JSON.stringify(adminUser));
                    if (adminUser.role) {
                        localStorage.setItem('adminRole', adminUser.role);
                    }

                    setAdmin(adminUser);
                    setIsAuthenticated(true);

                    console.log('Admin authentication successful for:', adminUser.email || adminUser.name);

                } catch (error) {
                    console.error('Auth verification error:', error);

                    // Clear all admin-related localStorage items
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('adminData');
                    localStorage.removeItem('adminRole');

                    setIsAuthenticated(false);
                    setAdmin(null);

                    if (error.name === 'AbortError') {
                        toast.error('Connection timeout. Please check your internet connection and try again.');
                    } else if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                        toast.error('Network error. Please check your connection and try again.');
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
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <LoadingSpinner text="Verifying authentication..." />
                </div>
            );
        }

        if (!isAuthenticated || !admin) {
            return null;
        }

        // Pass admin data as props to the wrapped component
        return <Component {...props} admin={admin} />;
    };
}
