import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

// Enhanced API configuration with better error handling
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://ayuras.life/api/v1',
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', {
            method: config.method,
            url: config.url,
            baseURL: config.baseURL,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

// Enhanced image URL correction function
const getCorrectImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // Get the current domain for consistent URL generation
    const currentDomain = window.location.hostname;
    const isAdmin = currentDomain.includes('admin');
    const baseDomain = isAdmin ? 'https://admin.ayuras.life' : 'https://ayuras.life';

    console.log('Processing image URL:', { imageUrl, currentDomain, baseDomain });

    // If it's already a full URL with the correct domain, return as is
    if (imageUrl.startsWith(`${baseDomain}/uploads/expectations/`)) {
        return imageUrl;
    }

    // If it's a full URL but wrong domain, extract filename and reconstruct
    if (imageUrl.startsWith('http')) {
        try {
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const correctedUrl = `${baseDomain}/uploads/expectations/${filename}`;
            console.log('Corrected URL:', correctedUrl);
            return correctedUrl;
        } catch (e) {
            console.error('Error parsing image URL:', imageUrl, e);
            return null;
        }
    }

    // If it's just a filename, construct the full URL
    const fullUrl = `${baseDomain}/uploads/expectations/${imageUrl}`;
    console.log('Constructed URL:', fullUrl);
    return fullUrl;
};

const ExpectationsPanel = () => {
    const [items, setItems] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching expectations...');
            const res = await api.get('/expectations');

            console.log('Raw API response:', res.data);

            // Handle both array and object responses
            const responseData = res.data.data || res.data;
            const itemsArray = Array.isArray(responseData) ? responseData : [];

            const processedItems = itemsArray.map((item) => {
                const processedItem = {
                    ...item,
                    image: getCorrectImageUrl(item.image)
                };
                console.log('Processed item:', processedItem);
                return processedItem;
            });

            setItems(processedItems);
            console.log('Final processed items:', processedItems);
        } catch (error) {
            console.error('Error fetching expectations:', error);
            setError(`Failed to fetch expectations: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.title || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        if (!editId && !formData.image) {
            setError('Please select an image');
            return;
        }

        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);

        if (formData.image) {
            form.append('image', formData.image);
            console.log('Uploading file:', {
                name: formData.image.name,
                size: formData.image.size,
                type: formData.image.type
            });
        }

        try {
            setLoading(true);
            let response;

            if (editId) {
                console.log('Updating expectation:', editId);
                response = await api.put(`/expectations/${editId}`, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                console.log('Creating new expectation');
                response = await api.post('/expectations', form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            console.log('Submit response:', response.data);
            await fetchItems();
            closeModal();
        } catch (error) {
            console.error('Error saving expectation:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Unknown error occurred';
            setError(`Error saving expectation: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        console.log('Editing item:', item);
        setFormData({
            title: item.title,
            description: item.description,
            image: null
        });
        setEditId(item._id);
        setImagePreview(null);
        setModalOpen(true);
        setError(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expectation?')) return;

        try {
            setLoading(true);
            setError(null);

            console.log('Deleting expectation:', id);
            await api.delete(`/expectations/${id}`);
            await fetchItems();
        } catch (error) {
            console.error('Error deleting expectation:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Unknown error occurred';
            setError(`Error deleting expectation: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setFormData({ title: '', description: '', image: null });
        setEditId(null);
        setModalOpen(false);
        setImagePreview(null);
        setError(null);
    };

    const handleImageError = (e, item) => {
        console.error('Image failed to load:', {
            src: e.target.src,
            item: item
        });

        e.target.onerror = null; // Prevent infinite loop

        // Try alternative URL construction
        if (item && item.image && !e.target.src.includes('data:image')) {
            const filename = item.image.split('/').pop();
            const alternativeUrl = `https://ayuras.life/uploads/expectations/${filename}`;

            if (e.target.src !== alternativeUrl) {
                console.log('Trying alternative URL:', alternativeUrl);
                e.target.src = alternativeUrl;
                return;
            }
        }

        // Show placeholder
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please select a valid image file (JPEG, JPG, PNG)');
                e.target.value = '';
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                e.target.value = '';
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            setError(null);
        }
    };

    const testImageUrl = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log('Image test result:', { url, status: response.status, ok: response.ok });
            return response.ok;
        } catch (error) {
            console.error('Image test failed:', { url, error: error.message });
            return false;
        }
    };

    const handleImageLoad = (e) => {
        console.log('Image loaded successfully:', e.target.src);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Expectations Management</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    <Plus size={20} />
                    Add Expectation
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                        </div>

                        {item.image && (
                            <div className="mb-4 relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={(e) => handleImageError(e, item)}
                                    onLoad={handleImageLoad}
                                    crossOrigin="anonymous"
                                />
                                <button
                                    onClick={() => testImageUrl(item.image)}
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded"
                                    title="Test image URL"
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                ID: {item._id?.slice(-6)}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                                    disabled={loading}
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                    disabled={loading}
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {items.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No expectations found</p>
                    <p className="text-sm">Add your first expectation to get started!</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editId ? 'Edit Expectation' : 'Add New Expectation'}
                        </h3>

                        {/* Modal Error Display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    maxLength={1000}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    maxLength={10000}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image {!editId && '*'}
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/jpg,image/png"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={!editId}
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Max size: 10MB. Formats: JPEG, JPG, PNG
                                </p>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (editId ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpectationsPanel;
