import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Avatar, 
    Box,
    IconButton,
    Menu,
    MenuItem 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Header = () => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        window.location.href = 'https://calendar-dashboard-backend.onrender.com/auth/logout';
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Calendar Dashboard
                </Typography>
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            {user.name}
                        </Typography>
                        <IconButton
                            onClick={handleMenu}
                            sx={{ p: 0 }}
                        >
                            <Avatar alt={user.name} src={user.picture}>
                                {user.name.charAt(0)}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;