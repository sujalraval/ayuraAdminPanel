import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const LabTestsPanel = () => {
    const [labTests, setLabTests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const tests = await axios.get('/api/v1/lab-tests');
        const cats = await axios.get('/api/v1/categories/all');
        setLabTests(tests.data);
        setCategories(cats.data);
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
        await axios.delete(`/api/v1/lab-tests/${id}`);
        setLabTests((prev) => prev.filter((t) => t._id !== id));
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                const res = await axios.put(`/api/v1/lab-tests/${editingItem._id}`, formData);
                setLabTests((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data : i))
                );
            } else {
                const res = await axios.post('/api/v1/lab-tests', formData);
                setLabTests((prev) => [...prev, res.data]);
            }
            closeModal();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

            {/* Table */}
            <div className="overflow-x-auto shadow rounded bg-white">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                        <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Category</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labTests.map((test) => (
                            <tr key={test._id} className="border-t">
                                <td className="px-4 py-2">{test.name}</td>
                                <td className="px-4 py-2">{test.category}</td>
                                <td className="px-4 py-2">₹{test.price}</td>
                                <td className="px-4 py-2">{test.status}</td>
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
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
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
                                { label: 'Test Name', name: 'name', type: 'text' },
                                { label: 'Alias', name: 'alias', type: 'text' },
                                { label: 'Description', name: 'description', type: 'text' },
                                { label: 'Parameters', name: 'parameters', type: 'text' },
                                { label: 'Sample', name: 'sample', type: 'text' },
                                { label: 'Fasting', name: 'fasting', type: 'text' },
                                { label: 'Age Group', name: 'ageGroup', type: 'text' },
                                { label: 'Gender', name: 'gender', type: 'text' },
                                { label: 'Price (₹)', name: 'price', type: 'number' },
                                { label: 'Duration', name: 'duration', type: 'text' }
                            ].map(({ label, name, type }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium mb-1">{label}</label>
                                    <input
                                        name={name}
                                        type={type}
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData[name] || ''}
                                        onChange={handleChange}
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
                                    <option value="">Select Category</option>
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
