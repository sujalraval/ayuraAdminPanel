import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

// Enhanced API configuration with better error handling
const api = axios.create({
    baseURL: 'https://ayuras.life/api/v1',
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

// Enhanced image URL validation and fallback
const getValidImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // If it's already a valid URL, return as is
    if (imageUrl.startsWith('https://ayuras.life/uploads/expectations/')) {
        return imageUrl;
    }

    // If it's a filename only, construct the full URL
    if (!imageUrl.startsWith('http')) {
        return `https://ayuras.life/uploads/expectations/${imageUrl}`;
    }

    // If it's a different domain, try to extract filename and reconstruct
    try {
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        return `https://ayuras.life/uploads/expectations/${filename}`;
    } catch (e) {
        console.error('Error processing image URL:', imageUrl, e);
        return null;
    }
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
                    image: getValidImageUrl(item.image)
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
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                console.log('Creating new expectation');
                response = await api.post('/expectations', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
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
        console.error('Image failed to load:', { src: e.target.src, item: item });
        e.target.onerror = null; // Prevent infinite loop

        // Show placeholder immediately
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

    const handleImageLoad = (e) => {
        console.log('Image loaded successfully:', e.target.src);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Expectations Management</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    disabled={loading}
                >
                    <Plus size={20} />
                    Add Expectation
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading && !modalOpen && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 bg-gray-200 relative">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => handleImageError(e, item)}
                                    onLoad={handleImageLoad}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                                    disabled={loading}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                    disabled={loading}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Eye size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expectations found</h3>
                    <p className="text-gray-500 mb-4">Add your first expectation to get started!</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {editId ? 'Edit Expectation' : 'Add New Expectation'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image {!editId && '*'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-2 w-full h-32 object-cover rounded"
                                    />
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : editId ? 'Update' : 'Save'}
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
