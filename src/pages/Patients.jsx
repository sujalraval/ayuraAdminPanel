import React from 'react';
import PatientsTable from '../components/PatientsTable';

const Patients = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                    Add New Patient
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden p-6">
                <PatientsTable />
            </div>
        </div>
    );
};

export default Patients;