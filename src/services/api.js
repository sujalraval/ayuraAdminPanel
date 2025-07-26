// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ayuras.life/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;