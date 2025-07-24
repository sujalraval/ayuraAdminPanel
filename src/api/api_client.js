import axios from 'axios';

const apiClient = axios.create({
    baseURL: "/api/v1",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});
export default apiClient;   