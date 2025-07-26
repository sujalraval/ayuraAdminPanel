// components/admin/WhyChoosePanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminTable from '../AdminTable';
import AddEditForm from '../AddEditForm';
import { Plus } from 'lucide-react';

const WhyChoosePanel = () => {
    const [whyChooseItems, setWhyChooseItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        icon: '',
        title: '',
        description: '',
        status: 'active'
    });

    useEffect(() => {
        axios
            .get('/why-choose/all')
            .then((res) => setWhyChooseItems(res.data))
            .catch((err) => console.error('Failed to fetch why-choose items:', err));
    }, []);

    const handleAddClick = () => {
        setFormData({
            icon: '',
            title: '',
            description: '',
            status: 'active'
        });
        setEditingItem(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setFormData({
            icon: item.icon || '',
            title: item.title || '',
            description: item.description || '',
            status: item.status || 'active'
        });
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await axios.delete(`/why-choose/${id}`);
            setWhyChooseItems((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleToggleStatus = async (id) => {
        const item = whyChooseItems.find((i) => i._id === id);
        const newStatus = item.status === 'active' ? 'inactive' : 'active';

        try {
            await axios.put(`/why-choose/${id}/status`, { status: newStatus });
            setWhyChooseItems((prev) =>
                prev.map((i) => (i._id === id ? { ...i, status: newStatus } : i))
            );
        } catch (err) {
            console.error('Status toggle failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                const res = await axios.put(`/why-choose/${editingItem._id}`, formData);
                setWhyChooseItems((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data : i))
                );
            } else {
                const res = await axios.post(`/why-choose`, formData);
                setWhyChooseItems((prev) => [...prev, res.data]);
            }
            setShowForm(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'icon', label: 'Icon' },
        { key: 'status', label: 'Status' }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Manage Why Choose Us</h3>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </button>
            </div>
            <AdminTable
                data={whyChooseItems}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {showForm && (
                <AddEditForm
                    title={`${editingItem ? 'Edit' : 'Add'} Why Choose`}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingItem(null);
                    }}
                    onSubmit={handleSave}
                    renderFields={() => (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </>
                    )}
                />
            )}
        </div>
    );
};

export default WhyChoosePanel;