import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const LabTestsPanel = () => {
    const [labTests, setLabTests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'categorized', 'uncategorized'

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const [testsRes, catsRes] = await Promise.all([
                axios.get('/lab-tests'),
                axios.get('/categories/all')
            ]);

            setCategories(catsRes.data);

            if (activeTab === 'uncategorized') {
                const uncategorizedRes = await axios.get('/lab-tests/uncategorized');
                setLabTests(uncategorizedRes.data);
            } else if (activeTab === 'categorized') {
                setLabTests(testsRes.data.filter(test => test.category));
            } else {
                setLabTests(testsRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setFormData(item || {});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this test?')) return;
        try {
            await axios.delete(`/lab-tests/${id}`);
            setLabTests((prev) => prev.filter((t) => t._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                const res = await axios.put(`/lab-tests/${editingItem._id}`, formData);
                setLabTests((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data : i))
                );
            } else {
                const res = await axios.post('/lab-tests', formData);
                setLabTests((prev) => [...prev, res.data]);
            }
            closeModal();
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Manage Lab Tests</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => handleTabChange('all')}
                >
                    All Tests
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'categorized' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => handleTabChange('categorized')}
                >
                    Categorized
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'uncategorized' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => handleTabChange('uncategorized')}
                >
                    Uncategorized
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto shadow rounded bg-white">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                        <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Category</th>
                            <th className="px-4 py-2">Collection Type</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labTests.map((test) => (
                            <tr key={test._id} className="border-t">
                                <td className="px-4 py-2">{test.name}</td>
                                <td className="px-4 py-2">{test.category || 'None'}</td>
                                <td className="px-4 py-2">{test.collectionType || '-'}</td>
                                <td className="px-4 py-2">₹{test.price}</td>
                                <td className="px-4 py-2 capitalize">{test.status}</td>
                                <td className="px-4 py-2 flex space-x-2">
                                    <button onClick={() => openModal(test)}>
                                        <Edit2 className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button onClick={() => handleDelete(test._id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {labTests.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                    No tests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                        >
                            <X />
                        </button>
                        <h3 className="text-xl font-bold mb-4">
                            {editingItem ? 'Edit' : 'Add'} Lab Test
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Test Name', name: 'name', type: 'text', required: true },
                                { label: 'Alias', name: 'alias', type: 'text' },
                                { label: 'Description', name: 'description', type: 'text' },
                                { label: 'Parameters', name: 'parameters', type: 'text' },
                                { label: 'Sample', name: 'sample', type: 'text' },
                                { label: 'Fasting', name: 'fasting', type: 'text' },
                                { label: 'Age Group', name: 'ageGroup', type: 'text' },
                                { label: 'Gender', name: 'gender', type: 'text' },
                                { label: 'Price (₹)', name: 'price', type: 'number', required: true },
                                { label: 'Duration', name: 'duration', type: 'text' },
                                { label: 'Collection Type', name: 'collectionType', type: 'text' }
                            ].map(({ label, name, type, required }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium mb-1">
                                        {label}
                                        {required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        name={name}
                                        type={type}
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData[name] || ''}
                                        onChange={handleChange}
                                        required={required}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    name="category"
                                    className="w-full px-3 py-2 border rounded"
                                    value={formData.category || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">None (Uncategorized)</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    name="status"
                                    className="w-full px-3 py-2 border rounded"
                                    value={formData.status || 'active'}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Why It Is Important - Full Width Textarea */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">
                                Why It Is Important
                            </label>
                            <textarea
                                name="whyItIsImportant"
                                className="w-full px-3 py-2 border rounded h-24"
                                value={formData.whyItIsImportant || ''}
                                onChange={handleChange}
                                placeholder="Explain why this test is important..."
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {editingItem ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabTestsPanel;
