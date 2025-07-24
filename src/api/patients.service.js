import apiClient from './api_client';

const patient_service = {
    getPatients : async () =>{
        try {
            const response = await apiClient.get('/auth/users');
            return response.data;
        } catch (error) {
            console.error("Error getting users:", error);
            throw error;
        }
    }
};


export default patient_service;
