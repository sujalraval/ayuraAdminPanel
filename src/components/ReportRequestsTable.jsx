import React, { useEffect, useState } from 'react';
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

    const api = axios.create({
        baseURL: 'https://ayuras.life/api/v1',
        withCredentials: true,
        timeout: 15000,
    });

    // Attach token globally via interceptor
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            config => {
                const token = localStorage.getItem('adminToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                config.headers['Content-Type'] = 'application/json';
                return config;
            },
            error => {
                toast.error('Request Error');
                return Promise.reject(error);
            }
        );

        const responseInterceptor = api.interceptors.response.use(
            response => response,
            error => {
                if (error?.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                    navigate('/admin/login');
                } else {
                    toast.error(error?.response?.data?.message || 'API Error');
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
            const res = await api.get('/orders/pending');
            setRequests(res.data.orders || []);
        } catch (err) {
            setError('Failed to load orders');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (orderId, action) => {
        try {
            setActionLoading(orderId);
            const endpoint = `/orders/${action === 'deny' ? 'deny' : 'approve'}/${orderId}`;

            const response = await api.put(
                endpoint,
                {
                    adminNotes: `Order ${action}ed by admin`,
                    actionTimestamp: new Date().toISOString(),
                }
            );

            if (response.data.success) {
                toast.success(`Order ${action}ed successfully`);
                await fetchRequests();
            } else {
                toast.error(`Failed to ${action} order`);
            }
        } catch (err) {
            console.error('Action error:', err);
            toast.error(`Error while trying to ${action} order: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchRequests();
        }
    }, [navigate]);

    const calculateAge = dob => {
        if (!dob) return 'N/A';
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const formatDate = dateString => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getTestNames = cartItems => {
        if (!Array.isArray(cartItems)) return 'No tests';
        return cartItems.map(item => item.testName || item.name).join(', ');
    };

    const getTotalPrice = price => `₹${price?.toLocaleString('en-IN') || 0}`;

    if (loading) return <div className="text-center py-10">Loading pending orders...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-semibold mb-4">Pending Order Requests</h2>
            <button
                onClick={fetchRequests}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Refresh
            </button>
            {requests.length === 0 ? (
                <div className="text-center py-10">No pending orders found</div>
            ) : (
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Order</th>
                            <th className="border px-4 py-2">Patient</th>
                            <th className="border px-4 py-2">Tests</th>
                            <th className="border px-4 py-2">Address</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req._id}>
                                <td className="border px-4 py-2">
                                    #{req._id.slice(-6)}<br />
                                    {formatDate(req.createdAt)}<br />
                                    <strong>Status:</strong> {req.status}
                                </td>
                                <td className="border px-4 py-2">
                                    {req.patientInfo?.name}<br />
                                    Age: {calculateAge(req.patientInfo?.dob)}<br />
                                    Phone: {req.patientInfo?.phone}
                                </td>
                                <td className="border px-4 py-2">
                                    {getTestNames(req.cartItems)}<br />
                                    Total: {getTotalPrice(req.totalPrice)}
                                </td>
                                <td className="border px-4 py-2">
                                    {[req.patientInfo?.address, req.patientInfo?.city, req.patientInfo?.state, req.patientInfo?.pincode]
                                        .filter(Boolean)
                                        .join(', ')}
                                </td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => handleAction(req._id, 'approve')}
                                        className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                        disabled={actionLoading === req._id}
                                    >
                                        {actionLoading === req._id ? '⏳' : '✓'} Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req._id, 'deny')}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                        disabled={actionLoading === req._id}
                                    >
                                        {actionLoading === req._id ? '⏳' : '✕'} Deny
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReportRequestsTable;