// components/admin/CategoriesPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminTable from '../AdminTable';
import AddEditForm from '../AddEditForm';
import { Plus } from 'lucide-react';

const CategoriesPanel = () => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        axios
            .get('/categories/all')
            .then((res) => setCategories(res.data))
            .catch((err) => console.error('Failed to fetch categories:', err));
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
        if (!window.confirm('Delete this category?')) return;
        try {
            await axios.delete(`/categories/${id}`);
            setCategories((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleToggleStatus = async (id) => {
        const item = categories.find((i) => i._id === id);
        const newStatus = item.status === 'active' ? 'inactive' : 'active';

        try {
            await axios.put(`/categories/${id}`, { ...item, status: newStatus });
            setCategories((prev) =>
                prev.map((i) => (i._id === id ? { ...i, status: newStatus } : i))
            );
        } catch (err) {
            console.error('Status toggle failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                const res = await axios.put(`/categories/${editingItem._id}`, formData);
                setCategories((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data : i))
                );
            } else {
                const res = await axios.post(`/categories`, formData);
                setCategories((prev) => [...prev, res.data]);
            }
            setShowForm(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const columns = [
        { key: 'name', label: 'Category Name' },
        { key: 'description', label: 'Description' },
        { key: 'slug', label: 'Slug' },
        { key: 'icon', label: 'Icon' },
        { key: 'status', label: 'Status' }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Manage Categories</h3>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </button>
            </div>
            <AdminTable
                data={categories}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {showForm && (
                <AddEditForm
                    title={`${editingItem ? 'Edit' : 'Add'} Category`}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.slug || ''}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.icon || ''}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                />
            )}
        </div>
    );
};

export default CategoriesPanel;
