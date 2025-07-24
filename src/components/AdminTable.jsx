// components/AdminTable.jsx
import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';

const AdminTable = ({ data, columns, onEdit, onDelete, onToggleStatus }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {columns.map((column) => (
                        <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {column.label}
                        </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-gray-50">
                        {columns.map((column) => (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {column.key === 'status' ? (
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item[column.key] === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item[column.key]}
                                    </span>
                                ) : column.key === 'price' ? (
                                    `₹${item[column.key]}`
                                ) : (
                                    item[column.key]
                                )}
                            </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(item.id || item._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                {item.status && (
                                    <button
                                        onClick={() => onToggleStatus(item.id || item._id)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AdminTable;
