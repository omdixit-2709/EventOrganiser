import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import CalendarView from './components/Calendar/CalendarView';
import AuthCallback from './components/Auth/AuthCallback';
import { Toaster } from 'react-hot-toast';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'var(--dialog-bg)',
                    color: 'var(--text-primary)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root': {
                        color: 'var(--text-primary)',
                    },
                    '& .MuiInputLabel-root': {
                        color: 'var(--text-secondary)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--border-color)',
                    },
                },
            },
        },
        // Add DatePicker styles for dark mode
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--dialog-bg)',
                    '&:hover': {
                        backgroundColor: 'var(--border-color)',
                    },
                },
            },
        },
        MuiPickersCalendarHeader: {
            styleOverrides: {
                root: {
                    color: 'var(--text-primary)',
                },
            },
        },
    },
});

// CSS variables for theme
const style = document.createElement('style');
style.textContent = `
    :root {
        --dialog-bg: #ffffff;
        --text-primary: #000000;
        --text-secondary: #666666;
        --border-color: #e0e0e0;
    }

    [data-theme='dark'] {
        --dialog-bg: #1e1e1e;
        --text-primary: #ffffff;
        --text-secondary: #a0a0a0;
        --border-color: #404040;
    }

    /* Toast Styles */
    .Toastify__toast {
        border-radius: 8px;
        padding: 16px;
    }

    .Toastify__toast--success {
        background: #10B981;
    }

    .Toastify__toast--error {
        background: #EF4444;
    }

    .Toastify__toast--warning {
        background: #F59E0B;
    }

    .dark .Toastify__toast {
        background: #374151;
        color: #fff;
    }
`;
document.head.appendChild(style);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <AuthProvider>
                    <Router>
                        <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
                            <Toaster 
                                position="bottom-right"
                                toastOptions={{
                                    duration: 3000,
                                    style: {
                                        background: 'var(--dialog-bg)',
                                        color: 'var(--text-primary)',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: '#10B981',
                                            secondary: '#ffffff',
                                        },
                                    },
                                    error: {
                                        iconTheme: {
                                            primary: '#EF4444',
                                            secondary: '#ffffff',
                                        },
                                    },
                                }}
                            />
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />
                                <Route
                                    path="/dashboard/*"
                                    element={
                                        <PrivateRoute>
                                            <CalendarView />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="/" element={<Login />} />
                            </Routes>
                        </div>
                    </Router>
                </AuthProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;