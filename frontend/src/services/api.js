import axios from 'axios';

const api = axios.create({
    baseURL: 'https://calendar-dashboard-backend.onrender.com' || 'http://localhost:5001',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
export const fetchCalendarEvents = async (date, accessToken) => {
    try {
        const response = await axios.get(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
                params: {
                    timeMin: date,
                    timeMax: new Date(new Date(date).setHours(23, 59, 59)).toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime'
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch calendar events');
    }
};

export default api;