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

    // Safe way to get environment variables
    const getApiBaseUrl = () => {
        // First try to get from environment variables safely
        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
            return process.env.REACT_APP_API_BASE_URL;
        }

        // Fallback to window environment variables (if set by build process)
        if (typeof window !== 'undefined' && window.env && window.env.REACT_APP_API_BASE_URL) {
            return window.env.REACT_APP_API_BASE_URL;
        }

        // Default fallback
        return 'http://localhost:5000/api/v1';
    };

    // Create axios instance with base URL
    const api = axios.create({
        baseURL: getApiBaseUrl(),
        timeout: 15000
    });

    // Set up interceptors
    useEffect(() => {
        // Request interceptor
        const requestInterceptor = api.interceptors.request.use(config => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                navigate('/admin/login');
                return Promise.reject(new Error('No authentication token found'));
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });

        // Response interceptor
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

        // Cleanup interceptors on unmount
        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [navigate, api]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if token exists
            if (!localStorage.getItem('adminToken')) {
                navigate('/admin/login');
                return;
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

    const fetchAllOrders = async () => {
        try {
            const res = await api.get('/orders/all');
            console.log('All orders response:', res.data);

            if (res.data?.orders) {
                const statuses = res.data.orders.map(o => o.status);
                const uniqueStatuses = [...new Set(statuses)];
                console.log('All statuses:', uniqueStatuses);
            }
        } catch (err) {
            console.error('Failed to fetch all orders:', err);
            handleApiError(err);
        }
    };

    const handleApiError = (err) => {
        let errorMessage = "Failed to fetch requests";

        if (err.code === 'ECONNABORTED') {
            errorMessage = "Request timed out";
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
            const endpoint = `/orders/${action === 'deny' ? 'deny' : 'approve'}/${orderId}`;
            await api.put(endpoint, {
                notes: `Order ${action}ed by admin`
            });

            toast.success(`Order ${action === 'deny' ? 'denied' : 'approved'}`);
            await fetchRequests(); // Refresh list

        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} order`);
            handleApiError(err);
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading pending requests...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-600 mb-4 text-lg">⚠️ {error}</div>
                {error.includes('log in') ? (
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🔄 Go to Login
                    </button>
                ) : (
                    <>
                        <button
                            onClick={fetchRequests}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
                        >
                            🔄 Retry Loading
                        </button>

                    </>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Pending Report Requests ({requests.length})
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={fetchRequests}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                    
                </div>
            </div>



            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-lg mb-2">✅ No pending requests found</div>
                    <div className="text-gray-400 text-sm mb-4">All orders have been processed</div>

                    {debugInfo && (
                        <div className="text-xs text-gray-500">
                            <p>Database contains {debugInfo.totalOrdersInDB} total orders</p>
                            <p>Available statuses: {debugInfo.allStatuses?.join(', ')}</p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            console.log('📊 Checking all orders...');
                            fetchAllOrders();
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Check All Orders
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Order ID: {request._id}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Created: {formatDate(request.createdAt)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Status: <span className="font-medium text-orange-600">{request.status}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(request._id, 'approve')}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(request._id, 'deny')}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                    >
                                        ❌ Deny
                                    </button>
                                </div>
                            </div>

                            {/* Patient Information */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">👤 Patient Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {request.patientInfo?.name || 'N/A'}</p>
                                        <p><span className="font-medium">Age:</span> {calculateAge(request.patientInfo?.dob)}</p>
                                        <p><span className="font-medium">Gender:</span> {request.patientInfo?.gender || 'N/A'}</p>
                                        <p><span className="font-medium">Email:</span> {request.patientInfo?.email || 'N/A'}</p>
                                        <p><span className="font-medium">Phone:</span> {request.patientInfo?.phone || 'N/A'}</p>
                                        <p><span className="font-medium">Relation:</span> {request.patientInfo?.relation || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">📋 Order Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Status:</span>
                                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                {request.status}
                                            </span>
                                        </p>
                                        <p><span className="font-medium">Payment:</span> {request.paymentMethod || 'N/A'}</p>
                                        <p><span className="font-medium">Total:</span> {getTotalPrice(request.totalPrice)}</p>
                                        <p><span className="font-medium">Time Slot:</span> {request.patientInfo?.timeSlot || 'Not set'}</p>
                                        <p><span className="font-medium">Payment Status:</span> {request.paymentStatus || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-1">📍 Address</h4>
                                <p className="text-sm text-gray-600">
                                    {[
                                        request.patientInfo?.address,
                                        request.patientInfo?.city,
                                        request.patientInfo?.state,
                                        request.patientInfo?.pincode
                                    ].filter(Boolean).join(', ') || 'No address provided'}
                                </p>
                            </div>

                            {/* Tests */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">🧪 Requested Tests</h4>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-sm font-medium">{getTestNames(request.cartItems)}</p>
                                    {Array.isArray(request.cartItems) && request.cartItems.length > 0 && (
                                        <>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Test count: {request.cartItems.length} |
                                                Labs: {[...new Set(request.cartItems.map(item => item.lab))].join(', ')}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {request.cartItems.map((item, index) => (
                                                    <div key={index} className="text-xs text-gray-600 flex justify-between">
                                                        <span>{item.testName} ({item.lab})</span>
                                                        <span>₹{item.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Technician Notes (if any) */}
                            {request.technicianNotes && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-gray-700 mb-1">📝 Notes</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        {request.technicianNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportRequestsTable;
