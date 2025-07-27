import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ExpectationsPanel = () => {
    const [items, setItems] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', image: null });
    const [editId, setEditId] = useState(null);

    const fetchItems = async () => {
        try {
            const res = await axios.get('/expectations');
            setItems(res.data);
        } catch (error) {
            console.error('Error fetching expectations:', error);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        if (formData.image) form.append('image', formData.image);

        try {
            if (editId) {
                await axios.put(`/expectations/${editId}`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/expectations', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchItems();
            closeModal();
        } catch (error) {
            console.error('Error saving expectation:', error);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            description: item.description,
            image: null
        });
        setEditId(item._id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/expectations/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Error deleting expectation:', error);
        }
    };

    const closeModal = () => {
        setFormData({ title: '', description: '', image: null });
        setEditId(null);
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Expectations Section</h2>
                <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
                    <Plus className="mr-1" /> Add New
                </button>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md relative">
                        <h3 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Expectation</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full border p-2"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full border p-2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full border p-2"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                required={!editId}
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item._id} className="border rounded p-4 shadow">
                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-40 object-cover rounded mb-2"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.jpg';
                                }}
                            />
                        )}
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-700">{item.description}</p>
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => handleEdit(item)} className="text-blue-600"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-600"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpectationsPanel;