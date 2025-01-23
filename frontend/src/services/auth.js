import axios from 'axios';

const api = axios.create({
    baseURL: 'https://calendar-dashboard-backend.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const checkAuthStatus = async () => {
    try {
        const response = await api.get('/auth/status');
        return response.data;
    } catch (error) {
        console.error('Auth status check failed:', error);
        return { isAuthenticated: false, user: null };
    }
};