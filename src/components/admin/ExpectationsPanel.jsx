import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://ayuras.life/api/v1',
    withCredentials: true
});

// Fixed URL construction function
const getCorrectImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    console.log('Processing image URL:', imageUrl);

    // If it's already the correct full URL, return as is
    if (imageUrl.startsWith('https://ayuras.life/uploads/expectations/')) {
        console.log('URL already correct:', imageUrl);
        return imageUrl;
    }

    // If it's any other full URL, extract filename and reconstruct
    if (imageUrl.startsWith('http')) {
        try {
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const correctedUrl = `https://ayuras.life/uploads/expectations/${filename}`;
            console.log('Reconstructed URL from:', imageUrl, 'to:', correctedUrl);
            return correctedUrl;
        } catch (e) {
            console.error('Error parsing image URL:', imageUrl, e);
            return null;
        }
    }

    // If it's just a filename, construct the full URL
    const finalUrl = `https://ayuras.life/uploads/expectations/${imageUrl}`;
    console.log('Constructed URL from filename:', imageUrl, 'to:', finalUrl);
    return finalUrl;
};

// REMOVED: testImageAccess function that was causing CORS issues

api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('API Error:', error.config?.url, error.response?.status, error.message);
        return Promise.reject(error);
    }
);

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

    const fetchItems = async () => {
        try {
            setLoading(true);
            console.log('Fetching expectations...');
            const res = await api.get('/expectations');
            console.log('Raw API response:', res.data);

            // Process items with correct URLs - REMOVED accessibility testing
            const processedItems = res.data.map((item) => {
                const correctedUrl = getCorrectImageUrl(item.image);

                return {
                    ...item,
                    image: correctedUrl
                };
            });

            console.log('Processed items:', processedItems);
            setItems(processedItems);
        } catch (error) {
            console.error('Error fetching expectations:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }

        if (!editId && !formData.image) {
            alert('Please select an image');
            return;
        }

        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);

        if (formData.image) {
            form.append('image', formData.image);
            console.log('Uploading file:', formData.image.name, 'Size:', formData.image.size);
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

            console.log('Save response:', response.data);
            fetchItems();
            closeModal();
        } catch (error) {
            console.error('Error saving expectation:', error);
            alert(`Error saving expectation: ${error.response?.data?.error || error.message}`);
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
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expectation?')) return;

        try {
            setLoading(true);
            console.log('Deleting expectation:', id);
            await api.delete(`/expectations/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Error deleting expectation:', error);
            alert(`Error deleting expectation: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setFormData({ title: '', description: '', image: null });
        setEditId(null);
        setModalOpen(false);
    };

    const handleImageError = (e) => {
        console.error('Image failed to load:', e.target.src);

        // Try the direct route if main route fails
        const originalSrc = e.target.src;
        if (originalSrc.includes('/uploads/expectations/') && !originalSrc.includes('/test-image/')) {
            const filename = originalSrc.split('/').pop();
            const directUrl = `https://ayuras.life/uploads/expectations/${filename}`;
            console.log('Trying direct URL:', directUrl);

            // Set a flag to prevent infinite loops
            if (!e.target.dataset.retried) {
                e.target.dataset.retried = 'true';
                e.target.src = directUrl;
                return;
            }
        }

        e.target.onerror = null;
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    };

    const handleImageLoad = (e) => {
        console.log('Image loaded successfully:', e.target.src);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Selected file:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, JPG, PNG)');
                e.target.value = '';
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                e.target.value = '';
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Expectations Management</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    disabled={loading}
                >
                    <Plus size={20} />
                    Add Expectation
                </button>
            </div>

            {loading && <div className="text-center py-4">Loading...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                        </div>

                        {item.image && (
                            <div className="mb-4">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                    crossOrigin="anonymous"
                                />
                                <p className="text-xs text-gray-500 mt-1 break-all">
                                    URL: {item.image}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 p-2"
                                disabled={loading}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item._id)}
                                className="text-red-600 hover:text-red-800 p-2"
                                disabled={loading}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <p>No expectations found. Add your first expectation!</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {editId ? 'Edit Expectation' : 'Add New Expectation'}
                        </h3>

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
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Max size: 10MB. Formats: JPEG, JPG, PNG
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
