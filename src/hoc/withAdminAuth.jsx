import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

// Always use production API URL - no more localhost references
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

                    console.log('Verifying admin authentication with API:', API_BASE_URL);

                    // Try multiple endpoints to verify authentication
                    let response;
                    let endpoint = '';

                    try {
                        // Try verify endpoint first
                        endpoint = `${API_BASE_URL}/admin/verify`;
                        response = await fetch(endpoint, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            signal: controller.signal
                        });
                    } catch (fetchError) {
                        console.log('Verify endpoint failed, trying profile endpoint...');
                        // If verify endpoint doesn't exist, try profile endpoint
                        endpoint = `${API_BASE_URL}/admin/profile`;
                        response = await fetch(endpoint, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            signal: controller.signal
                        });
                    }

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
                            toast.error('Admin authentication endpoint not found. Please contact support.');
                        } else {
                            toast.error('Authentication failed. Please login again.');
                        }

                        navigate('/admin/login');
                        return;
                    }

                    const data = await response.json();
                    console.log('Authentication successful:', data);

                    if (!data.success && !data.admin) {
                        // Handle different response formats
                        if (data.user) {
                            // Some APIs return user instead of admin
                            data.admin = data.user;
                        } else {
                            throw new Error('Invalid response format from server');
                        }
                    }

                    const adminUser = data.admin || data.user;

                    if (!adminUser) {
                        throw new Error('No admin user data received from server');
                    }

                    // Check role-based permissions
                    if (allowedRoles.length > 0 && !allowedRoles.includes(adminUser.role)) {
                        console.log('Role not allowed:', adminUser.role, 'Required:', allowedRoles);
                        toast.error('Access denied. You do not have permission to access this page.');
                        navigate('/admin/unauthorized');
                        return;
                    }

                    // Store admin data in multiple formats for compatibility
                    localStorage.setItem('adminUser', JSON.stringify(adminUser));
                    localStorage.setItem('adminData', JSON.stringify(adminUser));
                    localStorage.setItem('adminRole', adminUser.role);

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
                    } else if (error.message?.includes('NetworkError')) {
                        toast.error('Network error. Unable to connect to server.');
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

        // Show loading spinner while verifying
        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <LoadingSpinner />
                </div>
            );
        }

        // Don't render anything if not authenticated
        if (!isAuthenticated || !admin) {
            return null;
        }

        // Pass admin data as props to the wrapped component
        return <Component {...props} admin={admin} />;
    };
}
