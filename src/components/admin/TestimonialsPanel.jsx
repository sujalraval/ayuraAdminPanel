import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminTable from '../AdminTable';
import AddEditForm from '../AddEditForm';
import { Plus } from 'lucide-react';

const API_BASE_URL = 'https://ayuras.life/api/v1';

const TestimonialsPanel = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/testimonials`);
                setTestimonials(res.data.data || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching testimonials:', err);
                setError('Failed to load testimonials');
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const handleAddClick = () => {
        setFormData({
            name: '',
            rating: 5,
            comment: '',
            location: '',
            image: null
        });
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            ...item,
            imageFile: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/testimonials/${id}`);
            setTestimonials((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete testimonial');
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('rating', formData.rating);
            data.append('comment', formData.comment);
            data.append('location', formData.location || '');
            if (formData.imageFile) {
                data.append('image', formData.imageFile);
            }

            let res;
            if (editingItem) {
                res = await axios.put(`${API_BASE_URL}/testimonials/${editingItem._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTestimonials((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data.data : i))
                );
            } else {
                res = await axios.post(`${API_BASE_URL}/testimonials`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTestimonials((prev) => [...prev, res.data.data]);
            }
            setShowForm(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save testimonial');
        }
    };

    const columns = [
        { key: 'name', label: 'Customer Name' },
        {
            key: 'rating',
            label: 'Rating',
            render: (value) => (
                <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < value ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                </div>
            )
        },
        {
            key: 'comment',
            label: 'Comment',
            render: (value) => <div className="max-w-xs truncate">{value}</div>
        },
        { key: 'location', label: 'Location' },
        {
            key: 'image',
            label: 'Image',
            render: (value) => value ? (
                <img src={value} alt="Customer" className="w-10 h-10 rounded-full object-cover" />
            ) : null
        }
    ];

    if (loading) return <div className="p-4">Loading testimonials...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Manage Testimonials</h3>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add New
                </button>
            </div>

            <AdminTable
                data={testimonials}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {showForm && (
                <AddEditForm
                    title={`${editingItem ? 'Edit' : 'Add'} Testimonial`}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingItem(null);
                    }}
                    onSubmit={handleSave}
                    renderFields={() => (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.rating || 5}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    required
                                >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment *</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.comment || ''}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.location || ''}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {editingItem ? 'Change Image' : 'Upload Image'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        imageFile: e.target.files[0],
                                        image: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : formData.image
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {(formData.image) && (
                                    <div className="mt-2 flex items-center">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-20 h-20 object-cover rounded-full border"
                                        />
                                        {editingItem && (
                                            <button
                                                type="button"
                                                className="ml-2 text-red-500 text-sm"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    image: null,
                                                    imageFile: null
                                                })}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                />
            )}
        </div>
    );
};

export default TestimonialsPanel;