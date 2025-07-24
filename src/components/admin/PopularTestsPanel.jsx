import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const PopularTestsPanel = () => {
    const [popularTests, setPopularTests] = useState([]);
    const [availableLabTests, setAvailableLabTests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        axios.get('/api/v1/popular-tests/admin')
            .then((res) => setPopularTests(res.data.data));
    }, []);

    const fetchAvailableLabTests = async () => {
        const res = await axios.get('/api/v1/popular-tests/available-tests');
        setAvailableLabTests(res.data.data);
    };

    const handleAddClick = () => {
        setFormData({});
        setEditingItem(null);
        fetchAvailableLabTests();
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            badge: item.badge || '',
            labTestId: item.labTest?._id || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this test?')) return;
        try {
            await axios.delete(`/api/v1/popular-tests/${id}`);
            setPopularTests((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                badge: formData.badge,
                labTest: formData.labTestId
            };

            if (!payload.labTest || !payload.badge) {
                alert('Please select both lab test and badge');
                return;
            }

            if (editingItem) {
                const res = await axios.put(`/api/v1/popular-tests/${editingItem._id}`, payload);
                setPopularTests((prev) =>
                    prev.map((i) => (i._id === editingItem._id ? res.data.data : i))
                );
            } else {
                const res = await axios.post('/api/v1/popular-tests', payload);
                setPopularTests((prev) => [...prev, res.data.data]);
            }

            setShowForm(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Save failed:', err);
            alert(err?.response?.data?.message || 'Save failed');
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Manage Popular Tests</h3>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add New
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full table-auto text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 font-medium text-gray-600">Test Name</th>
                            <th className="px-4 py-2 font-medium text-gray-600">Category</th>
                            <th className="px-4 py-2 font-medium text-gray-600">Price</th>
                            <th className="px-4 py-2 font-medium text-gray-600">Badge</th>
                            <th className="px-4 py-2 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {popularTests.map((item) => (
                            <tr key={item._id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{item.labTest?.name}</td>
                                <td className="px-4 py-2">{item.labTest?.category}</td>
                                <td className="px-4 py-2">₹{item.labTest?.price}</td>
                                <td className="px-4 py-2">{item.badge}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingItem ? 'Edit Popular Test' : 'Add Popular Test'}
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            {!editingItem && (
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium">Select Lab Test</label>
                                    <select
                                        className="w-full border px-3 py-2 rounded"
                                        value={formData.labTestId || ''}
                                        onChange={(e) => setFormData({ ...formData, labTestId: e.target.value })}
                                    >
                                        <option value="">Select a test</option>
                                        {availableLabTests.map((test) => (
                                            <option key={test._id} value={test._id}>
                                                {test.name} - ₹{test.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">Badge</label>
                                <select
                                    className="w-full border px-3 py-2 rounded"
                                    value={formData.badge || ''}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                >
                                    <option value="">Select badge</option>
                                    <option value="Popular">Popular</option>
                                    <option value="Bestseller">Bestseller</option>
                                    <option value="Trending">Trending</option>
                                    <option value="New">New</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingItem(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    <X className="h-4 w-4 inline mr-2" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4 inline mr-2" /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopularTestsPanel;
