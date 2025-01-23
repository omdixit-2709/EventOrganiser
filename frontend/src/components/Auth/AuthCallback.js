import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            await checkAuthStatus();
            navigate('/dashboard');
        };

        handleCallback();
    }, [navigate, checkAuthStatus]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
};

export default AuthCallback;