import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ReportRequestsTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const navigate = useNavigate();

    // Create axios instance with production base URL
    const api = axios.create({
        baseURL: 'https://ayuras.life/api/v1',
        withCredentials: true,
        timeout: 15000
    });

    // Set up interceptors
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(config => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                config.headers['Content-Type'] = 'application/json';
            } else {
                navigate('/admin/login');
                return Promise.reject(new Error('No authentication token found'));
            }
            return config;
        });

        const responseInterceptor = api.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                    toast.error('Session expired. Please log in again.');
                    navigate('/admin/login');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [navigate]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            // Verify admin authentication first
            try {
                const authCheck = await api.get('/admin/verify');
                console.log('Auth check successful:', authCheck.data);
            } catch (authError) {
                console.error('Auth check failed:', authError);
                throw new Error('Authentication verification failed');
            }

            const res = await api.get('/orders/pending');
            const ordersData = res.data?.orders || [];

            if (Array.isArray(ordersData)) {
                setRequests(ordersData);
                setDebugInfo(res.data?.debug || null);
                if (ordersData.length === 0) {
                    toast.info("No pending orders found");
                }
            } else {
                setRequests([]);
                toast.warning("Invalid data structure received from server");
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApiError = (err) => {
        let errorMessage = "Failed to fetch requests";

        if (err.code === 'ECONNABORTED') {
            errorMessage = "Request timed out";
        } else if (err.code === 'ERR_NETWORK' || err.code === 'NETWORK_ERROR') {
            errorMessage = "Network error. Please check your connection and try again.";
        } else if (err.response?.status === 401) {
            errorMessage = "Session expired. Please log in again.";
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
        } else if (err.response?.status === 403) {
            errorMessage = "Access denied. Admin privileges required.";
        } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
        setRequests([]);
    };

    const handleAction = async (orderId, action) => {
        try {
            console.log(`Attempting to ${action} order ${orderId}`);

            // Verify token exists
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const endpoint = `/orders/${action === 'deny' ? 'deny' : 'approve'}/${orderId}`;
            const response = await api.put(endpoint, {
                notes: `Order ${action}ed by admin`
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`${action} response:`, response.data);

            toast.success(`Order ${action === 'deny' ? 'denied' : 'approved'}`);
            await fetchRequests(); // Refresh list
        } catch (err) {
            console.error(`Error ${action}ing order:`, err);
            const errorMessage = err.response?.data?.message || `Failed to ${action} order`;
            toast.error(errorMessage);
            handleApiError(err);
        }
    };

    const calculateAge = (dob) => {
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
        } catch (error) {
            return 'N/A';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const getTestNames = (cartItems) => {
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return 'No tests';
        }
        return cartItems.map(item => item.testName || item.name || 'Unknown Test').join(', ');
    };

    const getTotalPrice = (totalPrice) => {
        if (typeof totalPrice === 'number') {
            return `₹${totalPrice.toFixed(2)}`;
        }
        return 'N/A';
    };

    useEffect(() => {
        // Check if token exists before making the request
        if (!localStorage.getItem('adminToken')) {
            setError("Authentication required. Please log in.");
            setLoading(false);
            navigate('/admin/login');
            return;
        }

        fetchRequests();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchRequests}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Pending Order Requests</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {requests.length} pending order{requests.length !== 1 ? 's' : ''} found
                    </p>

                    {debugInfo && (
                        <div className="mt-2 text-xs text-gray-500">
                            <p>Database contains {debugInfo.totalOrdersInDB} total orders</p>
                            <p>Available statuses: {debugInfo.allStatuses?.join(', ')}</p>
                        </div>
                    )}
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                        <p className="text-gray-600">All orders have been processed</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tests & Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address & Schedule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((request) => (
                                    <tr key={request._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">#{request._id?.slice(-8)}</div>
                                                <div className="text-gray-500">Created: {formatDate(request.createdAt)}</div>
                                                <div className="text-gray-500">Status: {request.status}</div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">Name: {request.patientInfo?.name || 'N/A'}</div>
                                                <div className="text-gray-500">Age: {calculateAge(request.patientInfo?.dob)}</div>
                                                <div className="text-gray-500">Gender: {request.patientInfo?.gender || 'N/A'}</div>
                                                <div className="text-gray-500">Email: {request.patientInfo?.email || 'N/A'}</div>
                                                <div className="text-gray-500">Phone: {request.patientInfo?.phone || 'N/A'}</div>
                                                <div className="text-gray-500">Relation: {request.patientInfo?.relation || 'N/A'}</div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">Status: {request.status}</div>
                                                <div className="text-gray-500">Payment: {request.paymentMethod || 'N/A'}</div>
                                                <div className="text-gray-500">Total: {getTotalPrice(request.totalPrice)}</div>
                                                <div className="text-gray-500">Time Slot: {request.patientInfo?.timeSlot || 'Not set'}</div>
                                                <div className="text-gray-500">Payment Status: {request.paymentStatus || 'N/A'}</div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="text-gray-900 max-w-xs">
                                                    {[
                                                        request.patientInfo?.address,
                                                        request.patientInfo?.city,
                                                        request.patientInfo?.state,
                                                        request.patientInfo?.pincode
                                                    ].filter(Boolean).join(', ') || 'No address provided'}
                                                </div>
                                                <div className="mt-2 text-gray-600">
                                                    <div className="font-medium">Tests:</div>
                                                    <div>{getTestNames(request.cartItems)}</div>
                                                    {Array.isArray(request.cartItems) && request.cartItems.length > 0 && (
                                                        <div className="mt-1">
                                                            {request.cartItems.map((item, index) => (
                                                                <div key={index} className="text-xs text-gray-500">
                                                                    {item.testName || item.name} - ₹{item.price}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {request.technicianNotes && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Notes: {request.technicianNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAction(request._id, 'approve')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request._id, 'deny')}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                                >
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
        </div>
    );
};

export default ReportRequestsTable;