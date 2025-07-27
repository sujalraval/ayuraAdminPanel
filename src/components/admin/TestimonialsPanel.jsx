// ✅ Admin Panel: components/admin/TestimonialsPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminTable from '../AdminTable';
import AddEditForm from '../AddEditForm';
import { Plus } from 'lucide-react';

const TestimonialsPanel = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        axios.get('/testimonials').then((res) => setTestimonials(res.data));
    }, []);

    const handleAddClick = () => {
        setFormData({});
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this testimonial?')) return;
        try {
            await axios.delete(`/testimonials/${id}`);
            setTestimonials((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('rating', formData.rating);
            data.append('comment', formData.comment);
            data.append('location', formData.location);
            if (formData.imageFile) data.append('image', formData.imageFile);

            let res;
            if (editingItem) {
                res = await axios.put(`/testimonials/${editingItem._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTestimonials((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data : i))
                );
            } else {
                res = await axios.post('/testimonials', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTestimonials((prev) => [...prev, res.data]);
            }
            setShowForm(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const columns = [
        { key: 'name', label: 'Customer Name' },
        { key: 'rating', label: 'Rating' },
        { key: 'comment', label: 'Comment' },
        { key: 'location', label: 'Location' }
    ];

    return (
        <div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="1"
                                    max="5"
                                    value={formData.rating || ''}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.comment || ''}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {(formData.image || formData.imageFile) && (
                                    <img
                                        src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.image}
                                        alt="Preview"
                                        className="mt-2 w-20 h-20 object-cover rounded-full border"
                                    />
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
