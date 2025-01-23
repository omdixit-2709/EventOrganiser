import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('https://calendar-dashboard-backend.onrender.com/auth/status', {
                withCredentials: true
            });
            console.log('Auth status response:', response.data);
            if (response.data.isAuthenticated) {
                setUser(response.data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const value = {
        user,
        setUser,
        loading,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};