import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const ReportRequestsTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    // Memoize API instance to prevent recreation on every render
    const api = useMemo(() => {
        return axios.create({
            baseURL: 'https://ayuras.life/api/v1',
            withCredentials: true,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }, []);

    // Check authentication status
    const checkAuth = useCallback(() => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to continue');
            navigate('/admin/login');
            return false;
        }
        return token;
    }, [navigate]);

    // Setup API interceptors
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                const token = checkAuth();
                if (!token) {
                    return Promise.reject(new Error('Authentication required'));
                }
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                toast.error('Request configuration error');
                return Promise.reject(error);
            }
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error);

                if (error?.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('token');
                    localStorage.removeItem('adminData');
                    navigate('/admin/login');
                } else if (error?.response?.status === 403) {
                    toast.error('Access denied. Insufficient permissions.');
                } else if (error?.response?.status >= 500) {
                    toast.error('Server error. Please try again later.');
                } else if (error?.code === 'ECONNABORTED') {
                    toast.error('Request timeout. Please check your connection.');
                } else {
                    const errorMessage = error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        error?.message ||
                        'An unexpected error occurred';
                    toast.error(errorMessage);
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors
        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [api, checkAuth, navigate]);

    // Fetch pending requests
    const fetchRequests = useCallback(async () => {
        if (!checkAuth()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/orders/pending');

            if (response.data && response.data.success !== false) {
                const orders = response.data.orders || response.data.data || response.data || [];
                setRequests(Array.isArray(orders) ? orders : []);

                if (orders.length === 0) {
                    toast.info('No pending orders found');
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('Fetch requests error:', err);
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                'Failed to load pending orders';
            setError(errorMessage);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [api, checkAuth]);

    // Handle approve/deny actions
    const handleAction = useCallback(async (orderId, action) => {
        if (!orderId || !['approve', 'deny'].includes(action)) {
            toast.error('Invalid action parameters');
            return;
        }

        if (!checkAuth()) return;

        try {
            setActionLoading(orderId);

            const endpoint = action === 'deny' ? `/orders/deny/${orderId}` : `/orders/approve/${orderId}`;
            const payload = {
                action,
                adminNotes: `Order ${action}d by admin`,
                actionTimestamp: new Date().toISOString(),
            };

            const response = await api.put(endpoint, payload);

            if (response.data && response.data.success !== false) {
                toast.success(`Order ${action}d successfully`);
                // Refresh the list after successful action
                await fetchRequests();
            } else {
                throw new Error(response.data.message || `Failed to ${action} order`);
            }
        } catch (err) {
            console.error(`Action ${action} error:`, err);
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                `Error while trying to ${action} order`;
            toast.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    }, [api, checkAuth, fetchRequests]);

    // Initial data fetch
    useEffect(() => {
        if (checkAuth()) {
            fetchRequests();
        }
    }, [checkAuth, fetchRequests]);

    // Utility functions
    const calculateAge = useCallback((dob) => {
        if (!dob) return 'N/A';
        try {
            const birthDate = new Date(dob);
            if (isNaN(birthDate.getTime())) return 'N/A';

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age >= 0 ? age : 'N/A';
        } catch {
            return 'N/A';
        }
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    }, []);

    const getTestNames = useCallback((cartItems) => {
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return 'No tests';
        }
        return cartItems
            .map(item => item?.testName || item?.name || 'Unknown Test')
            .filter(name => name !== 'Unknown Test')
            .join(', ') || 'No tests';
    }, []);

    const getTotalPrice = useCallback((price) => {
        if (typeof price !== 'number' || isNaN(price)) return '₹0';
        return `₹${price.toLocaleString('en-IN')}`;
    }, []);

    const formatAddress = useCallback((patientInfo) => {
        if (!patientInfo) return 'N/A';

        const addressParts = [
            patientInfo.address,
            patientInfo.city,
            patientInfo.state,
            patientInfo.pincode
        ].filter(Boolean);

        return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Loading pending orders...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-10">
                    <div className="text-red-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchRequests}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Pending Order Requests ({requests.length})
                </h2>
                <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Orders</h3>
                    <p className="text-gray-500">There are no pending orders to review at this time.</p>
                </div>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Details
                                </th>
                                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient Info
                                </th>
                                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tests & Price
                                </th>
                                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Address
                                </th>
                                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-200 px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                #{req._id?.slice(-6) || 'N/A'}
                                            </div>
                                            <div className="text-gray-500">
                                                {formatDate(req.createdAt)}
                                            </div>
                                            <div className="mt-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${req.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {req.status || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-4">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {req.patientInfo?.name || 'N/A'}
                                            </div>
                                            <div className="text-gray-500">
                                                Age: {calculateAge(req.patientInfo?.dob)}
                                            </div>
                                            <div className="text-gray-500">
                                                Phone: {req.patientInfo?.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-4">
                                        <div className="text-sm">
                                            <div className="text-gray-900 mb-1">
                                                {getTestNames(req.cartItems)}
                                            </div>
                                            <div className="font-semibold text-green-600">
                                                {getTotalPrice(req.totalPrice)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs">
                                            {formatAddress(req.patientInfo)}
                                        </div>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAction(req._id, 'approve')}
                                                disabled={actionLoading === req._id}
                                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                                            >
                                                {actionLoading === req._id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                                ) : (
                                                    '✓'
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(req._id, 'deny')}
                                                disabled={actionLoading === req._id}
                                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                                            >
                                                {actionLoading === req._id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                                ) : (
                                                    '✕'
                                                )}
                                                Deny
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportRequestsTable;
