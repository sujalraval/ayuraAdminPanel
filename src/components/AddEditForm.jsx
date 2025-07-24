// components/AddEditForm.jsx
import React from 'react';
import { Save, X } from 'lucide-react';

const AddEditForm = ({ title, renderFields, onCancel, onSubmit }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    {renderFields()}
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
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
    );
};

export default AddEditForm;
