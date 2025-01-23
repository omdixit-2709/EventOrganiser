import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CalendarView from '../Calendar/CalendarView';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome, {user?.name}!
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Manage your calendar events below
                </Typography>
                <CalendarView />
            </Box>
        </Container>
    );
};

export default Dashboard;