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
        return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    };

    useEffect(() => {
        const fetchWorkingOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get('http://localhost:5000/api/v1/orders/working', {
                    headers: getAuthHeaders()
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
                setError(err.response?.data?.message || 'Failed to fetch working orders');
                if (err.response?.status === 401) {
                    window.location.href = '/admin/login';
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
            const response = await axios.put(
                `http://localhost:5000/api/v1/orders/${selectedEntry.id}/status`,
                {
                    status: tempStatus.toLowerCase(),
                    notes: `Status updated to ${tempStatus} by admin`
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success || response.status === 200) {
                setRequests((prev) =>
                    prev.map((req) =>
                        req.id === selectedEntry.id ? { ...req, status: tempStatus.toLowerCase() } : req
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

            const response = await axios.post(
                `http://localhost:5000/api/v1/orders/upload-report/${selectedEntry.id}`,
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
                            ? { ...req, reportFile: response.data.reportUrl || 'uploaded', status: 'report submitted' }
                            : req
                    )
                );

                alert('PDF report uploaded successfully!');
                closeModal();
            }
        } catch (error) {
            console.error('Error uploading report:', error);

            let errorMessage = 'Failed to upload PDF report.';

            if (error.code === 'NETWORK_ERROR') {
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 text-lg">Error: {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Working Orders</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 border-b text-left">Report No</th>
                            <th className="px-4 py-2 border-b text-left">Patient Name</th>
                            <th className="px-4 py-2 border-b text-left">Tests</th>
                            <th className="px-4 py-2 border-b text-left">Amount</th>
                            <th className="px-4 py-2 border-b text-left">Phlebotomist</th>
                            <th className="px-4 py-2 border-b text-left">Status</th>
                            <th className="px-4 py-2 border-b text-left">Report</th>
                            <th className="px-4 py-2 border-b text-left">Date</th>
                            <th className="px-4 py-2 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                    No working orders found
                                </td>
                            </tr>
                        ) : (
                            requests.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border-b">{entry.reportNo}</td>
                                    <td className="px-4 py-2 border-b">{entry.patientName}</td>
                                    <td className="px-4 py-2 border-b">
                                        {entry.tests.length > 0 ? entry.tests.join(', ') : 'No tests'}
                                    </td>
                                    <td className="px-4 py-2 border-b">{entry.amount}</td>
                                    <td className="px-4 py-2 border-b">{entry.phlebotomist}</td>
                                    <td className="px-4 py-2 border-b">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        {entry.reportFile ? (
                                            <span className="text-green-600">PDF Uploaded</span>
                                        ) : (
                                            <span className="text-gray-500">No PDF file</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        <button
                                            onClick={() => openModal(entry)}
                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
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

            {/* Modal */}
            {isModalOpen && selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Manage Order</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <strong>Name:</strong> {selectedEntry.patientName}
                            </div>
                            <div>
                                <strong>Age:</strong> {selectedEntry.age}
                            </div>
                            <div>
                                <strong>Gender:</strong> {selectedEntry.gender}
                            </div>
                            <div>
                                <strong>Phone:</strong> {selectedEntry.phone}
                            </div>
                            <div>
                                <strong>Email:</strong> {selectedEntry.email}
                            </div>
                            <div>
                                <strong>Amount:</strong> {selectedEntry.amount}
                            </div>
                        </div>

                        <div className="mb-4">
                            <strong>Current Status:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedEntry.status)}`}>
                                {selectedEntry.status}
                            </span>
                        </div>

                        <div className="mb-4">
                            <strong>Tests:</strong>
                            <div>{selectedEntry.tests.join(', ')}</div>
                        </div>

                        <div className="mb-4">
                            <strong>Address:</strong>
                            <div>{selectedEntry.address}</div>
                        </div>

                        {/* Status Update */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Update Status:</label>
                            <select
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">Select Status</option>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={updateStatus}
                                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Update Status
                            </button>
                        </div>

                        {/* File Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Upload Report:</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                <strong>PDF files only</strong> (Maximum 10MB)
                            </p>

                            {uploadError && (
                                <div className="text-red-600 text-sm mt-2">{uploadError}</div>
                            )}

                            {uploadedFile && (
                                <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded">
                                    <span className="text-sm">
                                        {typeof uploadedFile === 'string' ? 'Report uploaded' : uploadedFile.name}
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

                            {uploadedFile && typeof uploadedFile !== 'string' && (
                                <button
                                    onClick={handleSaveReport}
                                    disabled={uploadLoading}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    {uploadLoading ? 'Uploading...' : 'Save Report'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Working;
