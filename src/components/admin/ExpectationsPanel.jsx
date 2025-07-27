import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

// ✅ Axios instance with production baseURL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://ayuras.life/api/v1',
    withCredentials: true
});

// Add response interceptor to log responses
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
            console.log('Fetched expectations:', res.data);

            // Log each image URL
            res.data.forEach((item, index) => {
                console.log(`Item ${index + 1} - ID: ${item._id}, Image URL: ${item.image}`);
            });

            setItems(res.data);
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
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
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
        e.target.onerror = null;
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
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

    const testImageUrl = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log(`Image test for ${url}:`, response.status, response.ok);
            return response.ok;
        } catch (error) {
            console.error(`Image test failed for ${url}:`, error);
            return false;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Expectations Management</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                // Debug button to test API endpoint
                                api.get('/debug/uploads').then(res => {
                                    console.log('Debug info:', res.data);
                                    alert(JSON.stringify(res.data, null, 2));
                                }).catch(err => {
                                    console.error('Debug failed:', err);
                                });
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Debug
                        </button>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            disabled={loading}
                        >
                            <Plus size={20} />
                            Add Expectation
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-48 bg-gray-200">
                                {item.image ? (
                                    <>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            onError={handleImageError}
                                            onLoad={() => console.log('Image loaded successfully:', item.image)}
                                            loading="lazy"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                            <button
                                                onClick={() => testImageUrl(item.image)}
                                                className="hover:underline"
                                            >
                                                Test URL
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image Available
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="bg-white hover:bg-gray-100 p-2 rounded-full shadow-md transition-colors"
                                        disabled={loading}
                                    >
                                        <Edit2 size={16} className="text-blue-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="bg-white hover:bg-gray-100 p-2 rounded-full shadow-md transition-colors"
                                        disabled={loading}
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                                <div className="mt-2 text-xs text-gray-400 break-all">
                                    ID: {item._id}
                                </div>
                                {item.image && (
                                    <div className="mt-1 text-xs text-blue-600 break-all">
                                        <a href={item.image} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            View Image
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No expectations found. Add your first expectation!</p>
                    </div>
                )}

                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Expectation' : 'Add New Expectation'}</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            maxLength={1000}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={4}
                                            maxLength={10000}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Image {!editId && '*'}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFileChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required={!editId}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max file size: 10MB. Supported formats: JPEG, JPG, PNG</p>
                                        {formData.image && (
                                            <p className="text-xs text-green-600 mt-1">Selected: {formData.image.name}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-colors"
                                        >
                                            {loading ? 'Saving...' : (editId ? 'Update' : 'Create')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={loading}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpectationsPanel;