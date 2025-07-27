import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusOptions = [
    'pending',
    'approved',
    'sample collected',
    'processing',
    'report submitted',
    'denied',
    'cancelled'
];

function Working() {
    const [requests, setRequests] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [tempStatus, setTempStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const fetchWorkingOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use production API URL
                const apiUrl = 'https://ayuras.life/api/v1';

                const res = await axios.get(`${apiUrl}/orders/working`, {
                    headers: getAuthHeaders(),
                    timeout: 10000
                });

                const orders = res.data.orders || [];
                const transformed = orders.map((o, index) => ({
                    id: o._id,
                    reportNo: `RPT${String(index + 1).padStart(4, '0')}`,
                    patientName: o.patientInfo?.name || 'N/A',
                    tests: o.cartItems?.map((item) => item.testName) || [],
                    amount: `₹${o.totalPrice || 0}`,
                    phlebotomist: o.assignedTech || 'Not Assigned',
                    status: o.status || 'pending',
                    age: o.patientInfo?.age || calculateAge(o.patientInfo?.dob) || 'N/A',
                    gender: o.patientInfo?.gender || 'N/A',
                    address: o.patientInfo?.address || 'N/A',
                    phone: o.patientInfo?.phone || 'N/A',
                    email: o.patientInfo?.email || 'N/A',
                    reportFile: o.reportUrl || null,
                    createdAt: o.createdAt,
                    technicianNotes: o.technicianNotes || '',
                    labNotes: o.labNotes || ''
                }));

                setRequests(transformed);
            } catch (err) {
                console.error('Failed to fetch working orders:', err);

                if (err.code === 'ERR_NETWORK' || err.code === 'NETWORK_ERROR') {
                    setError("Network error. Please check your connection and try again.");
                } else if (err.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                    window.location.href = '/admin/login';
                } else {
                    setError(err.response?.data?.message || 'Failed to fetch working orders');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWorkingOrders();
    }, []);

    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const openModal = (entry) => {
        setSelectedEntry(entry);
        setUploadedFile(entry.reportFile);
        setTempStatus(entry.status);
        setUploadError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEntry(null);
        setUploadedFile(null);
        setTempStatus('');
        setUploadError('');
        setUploadLoading(false);
        setIsModalOpen(false);
    };

    const updateStatus = async () => {
        if (!selectedEntry || !tempStatus) {
            alert('Please select a status');
            return;
        }

        try {
            const apiUrl = 'https://ayuras.life/api/v1';

            const response = await axios.put(
                `${apiUrl}/orders/${selectedEntry.id}/status`,
                {
                    status: tempStatus.toLowerCase(),
                    notes: `Status updated to ${tempStatus} by admin`
                },
                {
                    headers: getAuthHeaders(),
                    timeout: 10000
                }
            );

            if (response.data.success || response.status === 200) {
                setRequests((prev) =>
                    prev.map((req) =>
                        req.id === selectedEntry.id
                            ? { ...req, status: tempStatus.toLowerCase() }
                            : req
                    )
                );
                setSelectedEntry((prev) => ({ ...prev, status: tempStatus.toLowerCase() }));
                alert('Status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to update status';
            alert(`Error: ${errorMessage}`);
        }
    };

    const validatePdfFile = (file) => {
        if (!file) return 'No file selected';
        if (file.type !== 'application/pdf') return 'Only PDF files are allowed.';
        if (!file.name.toLowerCase().endsWith('.pdf')) return 'File must have .pdf extension.';
        if (file.size > 10 * 1024 * 1024) return 'File size must be less than 10MB.';
        if (file.size === 0) return 'File cannot be empty.';
        return null;
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadError('');

        if (!file) return;

        const validationError = validatePdfFile(file);
        if (validationError) {
            setUploadError(validationError);
            event.target.value = '';
            return;
        }

        setUploadedFile(file);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setUploadError('');
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleSaveReport = async () => {
        if (!uploadedFile || !selectedEntry) {
            setUploadError('Please select a PDF file to upload');
            return;
        }

        // Check if uploadedFile is a file object or just a URL string
        if (typeof uploadedFile === 'string') {
            alert('Report already uploaded');
            return;
        }

        const validationError = validatePdfFile(uploadedFile);
        if (validationError) {
            setUploadError(validationError);
            return;
        }

        try {
            setUploadLoading(true);
            setUploadError('');

            if (!selectedEntry.id || selectedEntry.id.length !== 24) {
                throw new Error('Invalid order ID');
            }

            const formData = new FormData();
            formData.append('report', uploadedFile);
            formData.append('notes', `Report uploaded for ${selectedEntry.patientName}`);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const apiUrl = 'https://ayuras.life/api/v1';

            const response = await axios.post(
                `${apiUrl}/orders/upload-report/${selectedEntry.id}`,
                formData,
                {
                    headers,
                    timeout: 30000,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload Progress: ${percentCompleted}%`);
                    }
                }
            );

            if (response.data.success || response.status === 200) {
                setRequests((prev) =>
                    prev.map((req) =>
                        req.id === selectedEntry.id
                            ? {
                                ...req,
                                reportFile: response.data.reportUrl || 'uploaded',
                                status: 'report submitted'
                            }
                            : req
                    )
                );
                alert('PDF report uploaded successfully!');
                closeModal();
            }
        } catch (error) {
            console.error('Error uploading report:', error);

            let errorMessage = 'Failed to upload PDF report.';

            if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.response) {
                if (error.response.status === 500) {
                    errorMessage = 'Server error. Please check server logs and try again.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Upload endpoint not found. Please check the API route.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                } else if (error.response.status === 413) {
                    errorMessage = 'File too large. Please upload a smaller PDF file.';
                } else {
                    errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        `Server error: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setUploadError(errorMessage);
        } finally {
            setUploadLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'approved': return 'text-blue-600 bg-blue-100';
            case 'sample collected': return 'text-purple-600 bg-purple-100';
            case 'processing': return 'text-orange-600 bg-orange-100';
            case 'report submitted': return 'text-green-600 bg-green-100';
            case 'denied': return 'text-red-600 bg-red-100';
            case 'cancelled': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

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
                            onClick={() => window.location.reload()}
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
            <h1 className="text-2xl font-bold mb-6">Working Orders Management</h1>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phlebotomist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        No working orders found
                                    </td>
                                </tr>
                            ) : (
                                requests.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {entry.reportNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.patientName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {entry.tests.length > 0 ? entry.tests.join(', ') : 'No tests'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.phlebotomist}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.reportFile ? (
                                                <a
                                                    href={entry.reportFile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    📄 PDF Uploaded
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">No PDF file</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => openModal(entry)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Manage Order - {selectedEntry.patientName}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600">Report No</p>
                                    <p className="font-medium">{selectedEntry.reportNo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Patient Name</p>
                                    <p className="font-medium">{selectedEntry.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-medium">{selectedEntry.age}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="font-medium">{selectedEntry.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{selectedEntry.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{selectedEntry.email}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">Address</p>
                                <p className="font-medium">{selectedEntry.address}</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">Tests</p>
                                <p className="font-medium">{selectedEntry.tests.join(', ') || 'No tests'}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Update Status
                                </label>
                                <select
                                    value={tempStatus}
                                    onChange={(e) => setTempStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Status</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={updateStatus}
                                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Update Status
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Report (PDF Only)
                                </label>

                                {uploadError && (
                                    <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {uploadError}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />

                                <p className="text-xs text-gray-500 mt-1">
                                    **PDF files only** (Maximum 10MB)
                                </p>

                                {uploadedFile && (
                                    <div className="mt-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                                        <span className="text-sm text-gray-700">
                                            {typeof uploadedFile === 'string' ? 'Previously uploaded file' : uploadedFile.name}
                                        </span>
                                        {typeof uploadedFile !== 'string' && (
                                            <button
                                                onClick={handleRemoveFile}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleSaveReport}
                                    disabled={uploadLoading || !uploadedFile || typeof uploadedFile === 'string'}
                                    className="mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
                                >
                                    {uploadLoading ? 'Uploading...' : 'Save Report'}
                                </button>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Working;
