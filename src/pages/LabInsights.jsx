// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//     CreditCard, Activity, BarChart2, TrendingUp,
//     Plus, Edit2, Trash2, Eye, Save, X
// } from 'lucide-react';

// const LabInsights = () => {
//     const [dateRange, setDateRange] = useState('month');
//     const [activeTab, setActiveTab] = useState('insights');
//     const [editingItem, setEditingItem] = useState(null);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [currentSection, setCurrentSection] = useState('categories');

//     // State for all data sections
//     const [categories, setCategories] = useState([]);
//     const [labTests, setLabTests] = useState([]);
//     const [popularTests, setPopularTests] = useState([]);
//     const [expectations, setExpectations] = useState([]);
//     const [testimonials, setTestimonials] = useState([]);
//     const [availableLabTests, setAvailableLabTests] = useState([]);
//     const [whyChooseItems, setWhyChooseItems] = useState([]);
//     // Check if user is super admin (in real app, this would come from authentication)
//     const isSuperAdmin = true;

//     // Fetch available lab tests for popular tests form
//     useEffect(() => {
//         const fetchAvailableLabTests = async () => {
//             if (currentSection === 'popularTests' && showAddForm) {
//                 try {
//                     const response = await axios.get('/api/v1/lab-tests');
//                     setAvailableLabTests(response.data);
//                 } catch (error) {
//                     console.error('Error fetching available lab tests:', error);
//                 }
//             }
//         };

//         fetchAvailableLabTests();
//     }, [currentSection, showAddForm]);

//     // Fetch data based on current section
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 switch (currentSection) {
//                     case 'categories':
//                         const categoriesRes = await axios.get('/api/v1/categories/all');
//                         setCategories(categoriesRes.data);
//                         break;
//                     case 'labTests':
//                         const testsRes = await axios.get('/api/v1/lab-tests');
//                         setLabTests(testsRes.data);
//                         break;
//                     case 'popularTests':
//                         const popularRes = await axios.get('/api/v1/popular-tests');
//                         // Transform data to match frontend structure
//                         const transformedPopular = popularRes.data.map(item => ({
//                             id: item._id,
//                             labTestId: item.labTest._id,
//                             testName: item.labTest.name,
//                             category: item.labTest.category,
//                             price: item.labTest.price,
//                             badge: item.badge,
//                             displayOrder: item.displayOrder,
//                             bookingCount: item.bookingCount,
//                             status: item.isActive ? 'active' : 'inactive'
//                         }));
//                         setPopularTests(transformedPopular);
//                         break;
//                     case 'whyChoose':
//                         const whyChooseRes = await axios.get('/api/v1/why-choose/all');
//                         setWhyChooseItems(whyChooseRes.data);
//                         break;
//                     case 'expectations':
//                         // Add API call for expectations when backend is ready
//                         setExpectations([
//                             { id: 1, title: 'Accurate Results', description: 'State-of-the-art equipment', icon: 'accuracy' },
//                         ]);
//                         break;
//                     case 'testimonials':
//                         // Add API call for testimonials when backend is ready
//                         setTestimonials([
//                             { id: 1, name: 'Rajesh Kumar', rating: 5, comment: 'Excellent service!', location: 'Mumbai' },
//                         ]);
//                         break;
//                     default:
//                         break;
//                 }
//             } catch (err) {
//                 console.error(`Failed to fetch ${currentSection}:`, err);
//             }
//         };

//         if (activeTab === 'admin') {
//             fetchData();
//         }
//     }, [currentSection, activeTab]);

//     // Handle category CRUD operations
//     const handleCategoryDelete = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this category?')) return;
//         try {
//             await axios.delete(`/api/v1/categories/${id}`);
//             setCategories(categories.filter(item => item._id !== id));
//         } catch (err) {
//             console.error('Failed to delete category:', err);
//         }
//     };

//     const handleCategoryToggleStatus = async (id) => {
//         const category = categories.find((c) => c._id === id);
//         const updatedStatus = category.status === 'active' ? 'inactive' : 'active';

//         try {
//             await axios.put(`/api/v1/categories/${id}`, { status: updatedStatus });
//             setCategories(categories.map(item =>
//                 item._id === id ? { ...item, status: updatedStatus } : item
//             ));
//         } catch (err) {
//             console.error('Failed to toggle status:', err);
//         }
//     };

//     const handleCategorySave = async (formData) => {
//         try {
//             let updatedCategories;
//             if (editingItem) {
//                 const res = await axios.put(`/api/v1/categories/${editingItem._id}`, formData);
//                 updatedCategories = categories.map(item =>
//                     item._id === editingItem._id ? res.data : item
//                 );
//             } else {
//                 const res = await axios.post('/api/v1/categories', formData);
//                 updatedCategories = [...categories, res.data];
//             }
//             setCategories(updatedCategories);
//             setShowAddForm(false);
//             setEditingItem(null);
//         } catch (err) {
//             console.error('Failed to save category:', err);
//         }
//     };

//     // Handle other sections
//     const handleGenericDelete = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this item?')) return;

//         try {
//             switch (currentSection) {
//                 case 'popularTests':
//                     await axios.delete(`/api/v1/popular-tests/${id}`);
//                     setPopularTests(popularTests.filter(item => item.id !== id));
//                     break;
//                 case 'labTests':
//                     setLabTests(labTests.filter(item => item.id !== id));
//                     break;
//                 case 'whyChoose':
//                     await axios.delete(`/api/v1/why-choose/${id}`);
//                     setWhyChooseItems(whyChooseItems.filter(item => item._id !== id));
//                     break;
//                 case 'expectations':
//                     setExpectations(expectations.filter(item => item.id !== id));
//                     break;
//                 case 'testimonials':
//                     setTestimonials(testimonials.filter(item => item.id !== id));
//                     break;
//             }
//         } catch (err) {
//             console.error('Failed to delete item:', err);
//         }
//     };

//     const handleGenericToggleStatus = async (id) => {
//         try {
//             switch (currentSection) {
//                 case 'popularTests':
//                     const popularItem = popularTests.find(item => item.id === id);
//                     const newStatus = popularItem.status === 'active' ? 'inactive' : 'active';

//                     await axios.put(`/api/v1/popular-tests/${id}/status`, { isActive: newStatus === 'active' });

//                     setPopularTests(popularTests.map(item =>
//                         item.id === id ? { ...item, status: newStatus } : item
//                     ));
//                     break;
//                 case 'labTests':
//                     setLabTests(labTests.map(item =>
//                         item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item
//                     ));
//                     break;
//                 case 'whyChoose':
//                     const whyChooseItem = whyChooseItems.find(item => item._id === id);
//                     const newWhyChooseStatus = whyChooseItem.status === 'active' ? 'inactive' : 'active';

//                     await axios.put(`/api/v1/why-choose/${id}/status`, { status: newWhyChooseStatus });

//                     setWhyChooseItems(whyChooseItems.map(item =>
//                         item._id === id ? { ...item, status: newWhyChooseStatus } : item
//                     ));
//                     break;
//             }
//         } catch (err) {
//             console.error('Failed to toggle status:', err);
//         }
//     };

//     const handleGenericSave = async (formData) => {
//         try {
//             let updatedList;

//             switch (currentSection) {
//                 case 'labTests':
//                     if (editingItem) {
//                         const res = await axios.put(`/api/v1/lab-tests/${editingItem._id}`, formData);
//                         updatedList = labTests.map(item =>
//                             item._id === editingItem._id ? res.data : item
//                         );
//                     } else {
//                         const res = await axios.post(`/api/v1/lab-tests`, formData);
//                         updatedList = [...labTests, res.data];
//                     }
//                     setLabTests(updatedList);
//                     break;

//                 case 'popularTests':
//                     const popularData = {
//                         labTest: formData.labTestId,
//                         badge: formData.badge || null,
//                         displayOrder: formData.displayOrder || 0,
//                         isActive: formData.status === 'active'
//                     };

//                     if (editingItem) {
//                         const res = await axios.put(`/api/v1/popular-tests/${editingItem.id}`, popularData);
//                         updatedList = popularTests.map(item =>
//                             item.id === editingItem.id ? {
//                                 ...item,
//                                 ...formData,
//                                 id: res.data._id
//                             } : item
//                         );
//                     } else {
//                         const res = await axios.post('/api/v1/popular-tests', popularData);
//                         const newItem = {
//                             id: res.data._id,
//                             labTestId: res.data.labTest._id,
//                             testName: res.data.labTest.name,
//                             category: res.data.labTest.category,
//                             price: res.data.labTest.price,
//                             badge: res.data.badge,
//                             displayOrder: res.data.displayOrder,
//                             bookingCount: res.data.bookingCount,
//                             status: res.data.isActive ? 'active' : 'inactive'
//                         };
//                         updatedList = [...popularTests, newItem];
//                     }
//                     setPopularTests(updatedList);
//                     break;
//                 // In the handleGenericSave function, update the whyChoose case:
//                 case 'whyChoose':
//                     const whyChooseData = {
//                         icon: formData.icon,
//                         title: formData.title,
//                         description: formData.description
//                     };

//                     if (editingItem) {
//                         const res = await axios.put(`/api/v1/why-choose/${editingItem._id}`, whyChooseData);
//                         updatedList = whyChooseItems.map(item =>
//                             item._id === editingItem._id ? res.data : item
//                         );
//                     } else {
//                         const res = await axios.post('/api/v1/why-choose', whyChooseData);
//                         updatedList = [...whyChooseItems, res.data];
//                     }
//                     setWhyChooseItems(updatedList);
//                     break;
//                 case 'expectations':
//                     const newExpectation = {
//                         ...formData,
//                         id: editingItem ? editingItem.id : Date.now(),
//                         status: formData.status || 'active'
//                     };
//                     if (editingItem) {
//                         setExpectations(expectations.map(item => item.id === editingItem.id ? newExpectation : item));
//                     } else {
//                         setExpectations([...expectations, newExpectation]);
//                     }
//                     break;

//                 case 'testimonials':
//                     const newTestimonial = {
//                         ...formData,
//                         id: editingItem ? editingItem.id : Date.now(),
//                         status: formData.status || 'active'
//                     };
//                     if (editingItem) {
//                         setTestimonials(testimonials.map(item => item.id === editingItem.id ? newTestimonial : item));
//                     } else {
//                         setTestimonials([...testimonials, newTestimonial]);
//                     }
//                     break;
//             }

//             setShowAddForm(false);
//             setEditingItem(null);
//         } catch (err) {
//             console.error('Failed to save data:', err);
//             alert('Failed to save. Please try again.');
//         }
//     };

//     const InsightsCard = ({ title, value, change, icon, color = 'red' }) => (
//         <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <p className="text-sm font-medium text-gray-600">{title}</p>
//                     <p className="text-2xl font-bold text-gray-900">{value}</p>
//                 </div>
//                 <div className={`p-3 rounded-full bg-${color}-100`}>
//                     {icon}
//                 </div>
//             </div>
//             <div className="mt-4 flex items-center">
//                 <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {change >= 0 ? '+' : ''}{change}%
//                 </span>
//                 <span className="text-sm text-gray-500 ml-2">from last period</span>
//             </div>
//         </div>
//     );

//     const AdminTable = ({ data, columns, onEdit, onDelete, onToggleStatus }) => (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                     <tr>
//                         {columns.map((column) => (
//                             <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 {column.label}
//                             </th>
//                         ))}
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Actions
//                         </th>
//                     </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                     {data.map((item) => (
//                         <tr key={item.id || item._id} className="hover:bg-gray-50">
//                             {columns.map((column) => (
//                                 <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                     {column.key === 'status' ? (
//                                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item[column.key] === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                             {item[column.key]}
//                                         </span>
//                                     ) : column.key === 'price' ? (
//                                         `₹${item[column.key]}`
//                                     ) : (
//                                         item[column.key]
//                                     )}
//                                 </td>
//                             ))}
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                 <div className="flex space-x-2">
//                                     <button
//                                         onClick={() => onEdit(item)}
//                                         className="text-blue-600 hover:text-blue-900"
//                                     >
//                                         <Edit2 className="h-4 w-4" />
//                                     </button>
//                                     <button
//                                         onClick={() => onDelete(item.id || item._id)}
//                                         className="text-red-600 hover:text-red-900"
//                                     >
//                                         <Trash2 className="h-4 w-4" />
//                                     </button>
//                                     {item.status && (
//                                         <button
//                                             onClick={() => onToggleStatus(item.id || item._id)}
//                                             className="text-green-600 hover:text-green-900"
//                                         >
//                                             <Eye className="h-4 w-4" />
//                                         </button>
//                                     )}
//                                 </div>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     const AddEditForm = ({ section, item, onSave, onCancel }) => {
//         const [formData, setFormData] = useState(item || {});

//         const handleSubmit = () => {
//             onSave(formData);
//         };

//         const renderFormFields = () => {
//             switch (section) {
//                 case 'categories':
//                     return (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
//                                 <input
//                                     type="text"
//                                     value={formData.name || ''}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                                 <textarea
//                                     value={formData.description || ''}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     rows="3"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
//                                 <input
//                                     type="text"
//                                     value={formData.slug || ''}
//                                     onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Font Awesome)</label>
//                                 <input
//                                     type="text"
//                                     value={formData.icon || ''}
//                                     onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="fa-heartbeat"
//                                     required
//                                 />
//                             </div>
//                         </>
//                     );
//                 case 'labTests':
//                     return (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
//                                 <input
//                                     type="text"
//                                     value={formData.name || ''}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Also Known As</label>
//                                 <input
//                                     type="text"
//                                     value={formData.alias || ''}
//                                     onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//                                 <select
//                                     value={formData.category || ''}
//                                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                     required
//                                 >
//                                     <option value="">Select Category</option>
//                                     {categories.map(cat => (
//                                         <option key={cat._id} value={cat.name}>{cat.name}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                                 <textarea
//                                     value={formData.description || ''}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                     rows="3"
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Parameters (comma separated)</label>
//                                 <input
//                                     type="text"
//                                     value={formData.parameters || ''}
//                                     onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Sample Required</label>
//                                 <input
//                                     type="text"
//                                     value={formData.sample || ''}
//                                     onChange={(e) => setFormData({ ...formData, sample: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Fasting Required</label>
//                                 <select
//                                     value={formData.fasting || ''}
//                                     onChange={(e) => setFormData({ ...formData, fasting: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 >
//                                     <option value="">Select</option>
//                                     <option value="Required">Required</option>
//                                     <option value="Not Required">Not Required</option>
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
//                                 <input
//                                     type="text"
//                                     value={formData.ageGroup || ''}
//                                     onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
//                                 <select
//                                     value={formData.gender || ''}
//                                     onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 >
//                                     <option value="">All</option>
//                                     <option value="Male">Male</option>
//                                     <option value="Female">Female</option>
//                                     <option value="Other">Other</option>
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
//                                 <input
//                                     type="number"
//                                     value={formData.price || ''}
//                                     onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
//                                 <input
//                                     type="text"
//                                     value={formData.duration || ''}
//                                     onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                     placeholder="e.g., 24 hours"
//                                 />
//                             </div>
//                         </>
//                     );
//                 // In the AddEditForm component, update the whyChoose case:
//                 case 'whyChoose':
//                     return (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Font Awesome)</label>
//                                 <input
//                                     type="text"
//                                     value={formData.icon || ''}
//                                     onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="fa-tags"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
//                                 <input
//                                     type="text"
//                                     value={formData.title || ''}
//                                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                                 <textarea
//                                     value={formData.description || ''}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     rows="3"
//                                     required
//                                 />
//                             </div>
//                         </>
//                     );
//                 case 'popularTests':
//                     return (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Lab Test
//                                 </label>
//                                 <select
//                                     value={formData.labTestId || ''}
//                                     onChange={(e) => setFormData({ ...formData, labTestId: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 >
//                                     <option value="">Select a lab test</option>
//                                     {availableLabTests.map(test => (
//                                         <option key={test._id} value={test._id}>
//                                             {test.name} - {test.category} - ₹{test.price}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
//                                 <select
//                                     value={formData.badge || ''}
//                                     onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option value="">No Badge</option>
//                                     <option value="Popular">Popular</option>
//                                     <option value="Bestseller">Bestseller</option>
//                                     <option value="Trending">Trending</option>
//                                     <option value="New">New</option>
//                                 </select>
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Display Order
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={formData.displayOrder || 0}
//                                     onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     min="0"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                                 <select
//                                     value={formData.status || 'active'}
//                                     onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option value="active">Active</option>
//                                     <option value="inactive">Inactive</option>
//                                 </select>
//                             </div>
//                         </>
//                     );
//                 case 'expectations':
//                     return (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
//                                 <input
//                                     type="text"
//                                     value={formData.title || ''}
//                                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                                 <textarea
//                                     value={formData.description || ''}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     rows="3"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
//                                 <select
//                                     value={formData.icon || ''}
//                                     onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 >
//                                     <option value="accuracy">Accuracy</option>
//                                     <option value="speed">Speed</option>
//                                     <option value="expert">Expert</option>
//                                     <option value="home">Home</option>
//                                 </select>
//                             </div>
//                         </>
//                     );
//                 case 'testimonials':
//                     return (
//                         <>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
//                                 <input
//                                     type="text"
//                                     value={formData.name || ''}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
//                                 <select
//                                     value={formData.rating || ''}
//                                     onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                 >
//                                     <option value="">Select Rating</option>
//                                     <option value="5">5 Stars</option>
//                                     <option value="4">4 Stars</option>
//                                     <option value="3">3 Stars</option>
//                                     <option value="2">2 Stars</option>
//                                     <option value="1">1 Star</option>
//                                 </select>
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
//                                 <textarea
//                                     value={formData.comment || ''}
//                                     onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     rows="3"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
//                                 <input
//                                     type="text"
//                                     value={formData.location || ''}
//                                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                         </>
//                     );
//                 default:
//                     return null;
//             }
//         };

//         return (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//                     <h3 className="text-lg font-semibold mb-4">
//                         {item ? 'Edit' : 'Add'} {section.charAt(0).toUpperCase() + section.slice(1)}
//                     </h3>
//                     <div>
//                         {renderFormFields()}
//                         <div className="flex justify-end space-x-2">
//                             <button
//                                 type="button"
//                                 onClick={onCancel}
//                                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
//                             >
//                                 <X className="h-4 w-4 inline mr-2" />
//                                 Cancel
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={handleSubmit}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                             >
//                                 <Save className="h-4 w-4 inline mr-2" />
//                                 Save
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const handleEdit = (item) => {
//         setEditingItem(item);
//         setShowAddForm(true);
//     };

//     const handleDelete = (id) => {
//         if (currentSection === 'categories') {
//             handleCategoryDelete(id);
//         } else {
//             handleGenericDelete(id);
//         }
//     };

//     const handleToggleStatus = (id) => {
//         if (currentSection === 'categories') {
//             handleCategoryToggleStatus(id);
//         } else {
//             handleGenericToggleStatus(id);
//         }
//     };

//     const handleSave = (formData) => {
//         if (currentSection === 'categories') {
//             handleCategorySave(formData);
//         } else {
//             handleGenericSave(formData);
//         }
//     };

//     const renderAdminSection = () => {
//         const sections = {
//             categories: {
//                 data: categories,
//                 columns: [
//                     { key: 'name', label: 'Category Name' },
//                     { key: 'description', label: 'Description' },
//                     { key: 'slug', label: 'Slug' },
//                     { key: 'icon', label: 'Icon' },
//                 ]
//             },
//             labTests: {
//                 data: labTests,
//                 columns: [
//                     { key: 'name', label: 'Test Name' },
//                     { key: 'alias', label: 'Also Known As' },
//                     { key: 'category', label: 'Category' },
//                     { key: 'sample', label: 'Sample' },
//                     { key: 'fasting', label: 'Fasting' },
//                     { key: 'ageGroup', label: 'Age Group' },
//                     { key: 'gender', label: 'Gender' },
//                     { key: 'price', label: 'Price' },
//                     { key: 'duration', label: 'Duration' },
//                     { key: 'status', label: 'Status' }
//                 ]
//             },
//             popularTests: {
//                 data: popularTests,
//                 columns: [
//                     { key: 'testName', label: 'Test Name' },
//                     { key: 'category', label: 'Category' },
//                     { key: 'price', label: 'Price' },
//                     { key: 'badge', label: 'Badge' },
//                     { key: 'displayOrder', label: 'Display Order' },
//                     { key: 'bookingCount', label: 'Bookings' },
//                     { key: 'status', label: 'Status' }
//                 ]
//             },
//             // In the renderAdminSection function, update the whyChoose columns:
//             whyChoose: {
//                 data: whyChooseItems,
//                 columns: [
//                     { key: 'title', label: 'Title' },
//                     { key: 'description', label: 'Description' },
//                     { key: 'icon', label: 'Icon' }
//                 ]
//             },
//             expectations: {
//                 data: expectations,
//                 columns: [
//                     { key: 'title', label: 'Title' },
//                     { key: 'description', label: 'Description' },
//                     { key: 'icon', label: 'Icon' }
//                 ]
//             },
//             testimonials: {
//                 data: testimonials,
//                 columns: [
//                     { key: 'name', label: 'Customer Name' },
//                     { key: 'rating', label: 'Rating' },
//                     { key: 'comment', label: 'Comment' },
//                     { key: 'location', label: 'Location' }
//                 ]
//             }
//         };

//         const currentData = sections[currentSection];

//         return (
//             <div>
//                 <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-xl font-semibold text-gray-900">
//                         Manage {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
//                     </h3>
//                     <button
//                         onClick={() => {
//                             setEditingItem(null);
//                             setShowAddForm(true);
//                         }}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
//                     >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add New
//                     </button>
//                 </div>
//                 <AdminTable
//                     data={currentData.data}
//                     columns={currentData.columns}
//                     onEdit={handleEdit}
//                     onDelete={handleDelete}
//                     onToggleStatus={handleToggleStatus}
//                 />
//             </div>
//         );
//     };

//     return (
//         <div>
//             {isSuperAdmin && (
//                 <div className="mb-6">
//                     <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
//                         <button
//                             onClick={() => setActiveTab('insights')}
//                             className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'insights'
//                                 ? 'bg-white text-blue-600 shadow-sm'
//                                 : 'text-gray-600 hover:text-gray-900'
//                                 }`}
//                         >
//                             Insights Dashboard
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('admin')}
//                             className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'admin'
//                                 ? 'bg-white text-blue-600 shadow-sm'
//                                 : 'text-gray-600 hover:text-gray-900'
//                                 }`}
//                         >
//                             Admin Panel
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {activeTab === 'insights' && (
//                 <div>
//                     <div className="flex justify-between items-center mb-6">
//                         <h2 className="text-2xl font-bold text-gray-900">Lab Insights</h2>
//                         <div className="flex space-x-2">
//                             <select
//                                 value={dateRange}
//                                 onChange={(e) => setDateRange(e.target.value)}
//                                 className="border border-gray-300 rounded-md px-3 py-1 text-sm"
//                             >
//                                 <option value="week">Last Week</option>
//                                 <option value="month">Last Month</option>
//                                 <option value="quarter">Last Quarter</option>
//                                 <option value="year">Last Year</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                         <InsightsCard
//                             title="Total Revenue"
//                             value="₹1,84,200"
//                             change={12.5}
//                             icon={<CreditCard className="h-6 w-6 text-red-500" />}
//                         />
//                         <InsightsCard
//                             title="Tests Conducted"
//                             value="462"
//                             change={8.2}
//                             icon={<Activity className="h-6 w-6 text-blue-500" />}
//                             color="blue"
//                         />
//                         <InsightsCard
//                             title="New Patients"
//                             value="84"
//                             change={5.7}
//                             icon={<TrendingUp className="h-6 w-6 text-green-500" />}
//                             color="green"
//                         />
//                         <InsightsCard
//                             title="Avg. Report Time"
//                             value="18h"
//                             change={-3.2}
//                             icon={<BarChart2 className="h-6 w-6 text-yellow-500" />}
//                             color="yellow"
//                         />
//                     </div>
//                 </div>
//             )}

//             {activeTab === 'admin' && (
//                 <div>
//                     <div className="mb-6">
//                         <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
//                             {['categories', 'labTests', 'popularTests', 'whyChoose', 'expectations', 'testimonials'].map((section) => (
//                                 <button
//                                     key={section}
//                                     onClick={() => setCurrentSection(section)}
//                                     className={`px-4 py-2 rounded-md text-sm font-medium ${currentSection === section
//                                         ? 'bg-white text-blue-600 shadow-sm'
//                                         : 'text-gray-600 hover:text-gray-900'
//                                         }`}
//                                 >
//                                     {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                     {renderAdminSection()}
//                 </div>
//             )}

//             {showAddForm && (
//                 <AddEditForm
//                     section={currentSection}
//                     item={editingItem}
//                     onSave={handleSave}
//                     onCancel={() => {
//                         setShowAddForm(false);
//                         setEditingItem(null);
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default LabInsights;

// LabInsights.jsx (updated)
import React, { useState } from 'react';
import CategoriesPanel from '../components/admin/CategoriesPanel';
import LabTestsPanel from '../components/admin/LabTestsPanel';
import PopularTestsPanel from '../components/admin/PopularTestsPanel';
import WhyChoosePanel from '../components/admin/WhyChoosePanel';
import ExpectationsPanel from '../components/admin/ExpectationsPanel';
import TestimonialsPanel from '../components/admin/TestimonialsPanel';
import InsightsDashboard from '../components/InsightsDashboard';

const LabInsights = () => {
    const [activeTab, setActiveTab] = useState('insights');
    const [currentSection, setCurrentSection] = useState('categories');

    const isSuperAdmin = true;

    const renderAdminSection = () => {
        const commonProps = {
            currentSection,
        };

        switch (currentSection) {
            case 'categories':
                return <CategoriesPanel {...commonProps} />;
            case 'labTests':
                return <LabTestsPanel {...commonProps} />;
            case 'popularTests':
                return <PopularTestsPanel {...commonProps} />;
            case 'whyChoose':
                return <WhyChoosePanel {...commonProps} />;
            case 'expectations':
                return <ExpectationsPanel {...commonProps} />;
            case 'testimonials':
                return <TestimonialsPanel {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {isSuperAdmin && (
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'insights'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Insights Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'admin'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Admin Panel
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'insights' && <InsightsDashboard />}

            {activeTab === 'admin' && (
                <div>
                    <div className="mb-6">
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {['categories', 'labTests', 'popularTests', 'whyChoose', 'expectations', 'testimonials'].map((section) => (
                                <button
                                    key={section}
                                    onClick={() => setCurrentSection(section)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentSection === section
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {renderAdminSection()}
                </div>
            )}
        </div>
    );
};

export default LabInsights;
