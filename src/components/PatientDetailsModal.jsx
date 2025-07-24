import React from 'react';
import { X, User, Download, FileText, Mail, Phone } from 'lucide-react';

const PatientDetailsModal = ({ patient, onClose }) => {
    if (!patient) return null;

    // Dummy reports data
    const reports = [
        { id: 1, name: 'Complete Blood Count', date: '2023-05-15' },
        { id: 2, name: 'Thyroid Profile', date: '2023-04-10' },
        { id: 3, name: 'Vitamin D Test', date: '2023-03-22' },
        { id: 4, name: 'Liver Function Test', date: '2023-02-18' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-10 w-10 text-gray-600" />
                        </div>
                        <div className="ml-4">
                            <h4 className="text-2xl font-bold text-gray-900">{patient.name}</h4>
                            <div className="flex items-center mt-1 space-x-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <span>Age: {patient.age}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <span>Gender: {patient.gender}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Mail className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{patient.contact}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Phone className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">+91 98765 43210</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h5 className="text-lg font-medium text-gray-900 mb-3">Medical Reports</h5>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <div key={report.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{report.name}</p>
                                            <p className="text-sm text-gray-500">{report.date}</p>
                                        </div>
                                        <button className="flex items-center text-red-600 hover:text-red-800">
                                            <Download className="h-5 w-5 mr-1" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsModal;