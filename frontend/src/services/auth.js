import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
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