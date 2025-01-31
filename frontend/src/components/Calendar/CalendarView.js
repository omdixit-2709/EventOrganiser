import React, { useState, useEffect } from 'react';
import { Calendar, LogOut, Search, Moon, Sun, Download, RefreshCcw, Plus} from 'lucide-react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import toast from 'react-hot-toast';
import { eventCategories, eventTemplates } from '../../config/eventConfig';
import MonthView from './MonthView';

const CalendarView = () => {
    // User state
    const [user, setUser] = useState({
        name: '',
        email: '',
        picture: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Basic states
    const [events, setEvents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDirectFetching, setIsDirectFetching] = useState(false);

    //feature states
    const [view, setView] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eventCategory, setEventCategory] = useState('default');
    const [showTemplates, setShowTemplates] = useState(false);
    const [timeOfDayFilter, setTimeOfDayFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('');

    //Eventform state
    const [newEvent, setNewEvent] = useState({
        summary: '',
        description: '',
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000),
        location: '',
        category: 'default'
    });

    const commonLocations = [
        'Mumbai',
        'Delhi',
        'Bangalore',
        'Conference Room A',
        'Conference Room B',
        'Meeting Room 1',
        'Meeting Room 2',
        'Virtual Meeting',
        'Work From Home',
        'Office',
        'Cafeteria',
        'Training Room'
    ];


    // Helper functions
    const resetNewEvent = () => {
        setNewEvent({
            summary: '',
            description: '',
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000),
            location: '',
            category: 'default'
        });
        setEventCategory('default');
        setSelectedEvent(null);
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await axios.delete(`http://localhost:5001/calendar/events/${eventId}`, {
                withCredentials: true
            });
            toast.success('Event deleted successfully');
            setOpenDialog(false);
            fetchEvents();
            resetNewEvent();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    const handleExportToCsv = () => {
        const formatDateTime = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const cleanForCSV = (str) => {
            if (!str) return '';
            return `"${str.replace(/"/g, '""')}"`;
        };

        const headers = ['Event', 'Start Time', 'End Time', 'Location', 'Category', 'Description'];
        const csvContent = [
            headers.join(','),
            ...filteredEvents.map(event => [
                cleanForCSV(event.summary),
                cleanForCSV(formatDateTime(event.start.dateTime)),
                cleanForCSV(formatDateTime(event.end.dateTime)),
                cleanForCSV(event.location || ''),
                cleanForCSV(eventCategories[event.category || 'default'].label),
                cleanForCSV(event.description || '')
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-events-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    //fetch user profile
    const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://calendar-dashboard-backend.onrender.com/auth/user'|| 'http://localhost:5001/auth/user', {
                withCredentials: true
            });
            setUser(response.data);
            toast.success(`Welcome back, ${response.data.name}!`);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to load user profile');
            toast.error('Failed to load user profile');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axios.get('https://calendar-dashboard-backend.onrender.com/calendar/events'||'http://localhost:5001/calendar/events', {
                withCredentials: true
            });
            // Ensure events have the required properties
            const formattedEvents = response.data.map(event => ({
                ...event,
                summary: event.summary || '',
                start: {
                    dateTime: event.start?.dateTime || new Date().toISOString()
                },
                end: {
                    dateTime: event.end?.dateTime || new Date().toISOString()
                },
                location: event.location || '', // Make sure location is explicitly set
                category: event.category || 'default'
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to fetch events');
            setEvents([]);
        }
    };

    const fetchEventsByDate = async (date) => {
        try {
            setIsDirectFetching(true);
            
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
    
            const response = await axios.get(
                'https://calendar-dashboard-backend.onrender.com/calendar/events/date' || 
                'http://localhost:5001/calendar/events/date',
                {
                    params: {
                        timeMin: startDate.toISOString(),
                        timeMax: endDate.toISOString()
                    },
                    withCredentials: true
                }
            );
    
            const formattedEvents = response.data.map(event => ({
                ...event,
                summary: event.summary || '',
                start: {
                    dateTime: event.start?.dateTime || new Date().toISOString()
                },
                end: {
                    dateTime: event.end?.dateTime || new Date().toISOString()
                },
                location: event.location || '',
                category: event.category || 'default'
            }));
    
            setEvents(formattedEvents);
            toast.success('Events fetched successfully');
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to fetch events');
            setEvents([]);
        } finally {
            setIsDirectFetching(false);
        }
    };
    

    //Effects
    useEffect(() => {
        const handleError = async (error) => {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                handleLogout();
            }
        };
    
        window.addEventListener('unhandledrejection', handleError);
        return () => window.removeEventListener('unhandledrejection', handleError);
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Your existing helper functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeOfDay = (dateString) => {
        const hours = new Date(dateString).getHours();
        if (hours >= 5 && hours < 12) return 'morning';
        if (hours >= 12 && hours < 17) return 'afternoon';
        return 'evening';
    };
    const filteredEvents = events.filter(event => {
        // Check if event and its properties exist
        if (!event || !event.summary || !event.start || !event.start.dateTime) {
            return false;
        }
    
        const matchesSearch = !searchQuery || 
            event.summary.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDate = !dateFilter || 
            event.start.dateTime.includes(dateFilter);
        
        const matchesTimeOfDay = timeOfDayFilter === 'all' || 
            getTimeOfDay(event.start.dateTime) === timeOfDayFilter;
        
        const matchesLocation = !locationFilter || 
            (event.location && event.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
        return matchesSearch && matchesDate && matchesTimeOfDay && matchesLocation;
    });
    // Event handlers
    const handleTemplateSelect = (template) => {
        const start = new Date();
        start.setMinutes(start.getMinutes() + 30);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + template.duration);

        setNewEvent({
            summary: template.name,
            description: template.description,
            start: start,
            end: end,
            location: '',
            category: template.category
        });
        setEventCategory(template.category);
        setShowTemplates(false);
        setOpenDialog(true);
    };

    const handleLogout = () => {
        window.location.href = 'https://calendar-dashboard-backend.onrender.com/auth/logout'|| 'http://localhost:5001/auth/logout';
    };
    
    const handleSaveEvent = async () => {
        try {
            if (!newEvent.summary.trim()) {
                toast.error('Event title is required');
                return;
            }
    
            const eventData = {
                summary: newEvent.summary.trim(),
                description: newEvent.description.trim(),
                start: newEvent.start.toISOString(),
                end: newEvent.end.toISOString(),
                location: newEvent.location ? newEvent.location.trim() : '',
                category: eventCategory
            };
    
            console.log('Saving event with location:', eventData.location); // Debug log
    
            if (selectedEvent) {
                await axios.put(
                    `http://localhost:5001/calendar/events/${selectedEvent.id}`,
                    eventData,
                    { withCredentials: true }
                );
                toast.success('Event updated successfully');
            } else {
                await axios.post(
                    'https://calendar-dashboard-backend.onrender.com/calendar/events'|| 'http://localhost:5001/calendar/events',
                    eventData,
                    { withCredentials: true }
                );
                toast.success('Event created successfully');
            }
            setOpenDialog(false);
            fetchEvents();
            resetNewEvent();
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Failed to save event');
        }
    };
    
        return (
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                {/* Header */}
                <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-[#2C2F33] to-[#333333]'} text-white`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8" />
                                <h1 className="ml-3 text-xl font-semibold">Calendar Dashboard</h1>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className={`p-2 rounded-full transition-colors duration-200 ${
                                        isDarkMode 
                                            ? 'hover:bg-gray-700' 
                                            : 'hover:bg-opacity-20 hover:bg-white'
                                    }`}
                                >
                                    {isDarkMode ? (
                                        <Sun className="h-5 w-5" />
                                    ) : (
                                        <Moon className="h-5 w-5" />
                                    )}
                                </button>
                                
                                <div className="flex items-center gap-3">
                                    {isLoading ? (
                                        <div className="animate-pulse flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                                <div className="h-3 w-32 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div className="text-red-500">{error}</div>
                                    ) : (
                                        <>
                                            <div className="text-sm">
                                                <p className="font-medium">{user.name}</p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`}>
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="relative">
                                                {user.picture ? (
                                                    <img 
                                                        src={user.picture} 
                                                        alt={user.name}
                                                        className="h-9 w-9 rounded-full object-cover border-2 border-white"
                                                    />
                                                ) : (
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-lg font-semibold border-2 border-white ${
                                                        isDarkMode ? 'bg-gray-700' : 'bg-[#2C2F33]'
                                                    }`}>
                                                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/* Welcome Banner */}
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-600'
                } mt-2`}>
                    {isLoading ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-8 w-64 bg-gray-300 rounded"></div>
                            <div className="h-4 w-96 bg-gray-300 rounded"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500">Failed to load welcome message</div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
                            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`}>
                                Manage your calendar events and stay organized
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* View Toggle */}
                <div className="flex justify-end mb-4">
                    <div className={`inline-flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <button
                            onClick={() => setView('list')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                view === 'list'
                                    ? isDarkMode
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-white text-gray-900 shadow'
                                    : isDarkMode
                                        ? 'text-gray-300 hover:text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                view === 'month'
                                    ? isDarkMode
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-white text-gray-900 shadow'
                                    : isDarkMode
                                        ? 'text-gray-300 hover:text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Month View
                        </button>
                    </div>
                </div>

                {/* Calendar Content */}
                {view === 'month' ? (
                    <MonthView
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        events={filteredEvents}
                        isDarkMode={isDarkMode}
                        onEventClick={(event) => {
                            setSelectedEvent(event);
                            setNewEvent({
                                summary: event.summary,
                                description: event.description,
                                start: new Date(event.start.dateTime),
                                end: new Date(event.end.dateTime),
                                location: event.location,
                                category: event.category
                            });
                            setEventCategory(event.category || 'default');
                            setOpenDialog(true);
                        }}
                    />
                ) : (
                    // List View
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
                        <div className="p-6">
                            {/* Controls */}
                            <div className="flex items-center space-x-4 mb-6">
                                {/* Left side filters */}
                                <div className="flex items-center space-x-4 flex-1">
                                    {/* Search Box */}
                                    <div className="w-48 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Search events..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            }`}
                                        />
                                    </div>
                                    {/* Date Filter */}
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            setDateFilter(newDate);
                                            if (newDate) {
                                                fetchEventsByDate(newDate);
                                            } else {
                                                fetchEvents();
                                            }
                                        }}
                                        className={`w-40 rounded-lg px-3 py-2 border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                    {isDirectFetching && (
                                        <div className="absolute right-[-30px] top-1/2 transform -translate-y-1/2">
                                            <CircularProgress size={20} />
                                        </div>
                                    )}
                            

                                    {/* Time Filter */}
                                    <select
                                        value={timeOfDayFilter}
                                        onChange={(e) => setTimeOfDayFilter(e.target.value)}
                                        className={`w-40 rounded-lg px-3 py-2 border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    >
                                        <option value="all">All Times</option>
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                    </select>

                                    {/* Location Filter */}
                                    <input
                                        type="text"
                                        placeholder="Filter by location..."
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                        className={`w-40 rounded-lg px-3 py-2 border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        }`}
                                    />
                                </div>
                                

                                {/* Right side buttons */}
                                <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => dateFilter ? fetchEventsByDate(dateFilter) : fetchEvents()}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 mr-2"
                                    disabled={isDirectFetching}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isDirectFetching ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                    <button
                                        onClick={handleExportToCsv}
                                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowTemplates(!showTemplates)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                        >
                                            <Plus className="h-4 w-4" />
                                            New Event
                                        </button>
                                        {showTemplates && (
                                            <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg ${
                                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                                            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => {
                                                            resetNewEvent();
                                                            setShowTemplates(false);
                                                            setOpenDialog(true);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                                                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Blank Event
                                                    </button>
                                                    <div className={`h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} my-1`}></div>
                                                    {eventTemplates.map((template, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleTemplateSelect(template)}
                                                            className={`w-full text-left px-4 py-2 rounded-lg ${
                                                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className={`w-2 h-2 rounded-full ${eventCategories[template.category].color} mr-2`}></div>
                                                                <div>
                                                                    <div className="font-medium">{template.name}</div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {template.duration}min • {eventCategories[template.category].label}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {  /* Events Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            } uppercase tracking-wider`}>
                                                Event
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            } uppercase tracking-wider`}>
                                                <div className="flex flex-col">
                                                    <span>Start</span>
                                                    <span className="font-normal text-xs opacity-75">Date & Time</span>
                                                </div>
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            } uppercase tracking-wider`}>
                                                <div className="flex flex-col">
                                                    <span>End</span>
                                                    <span className="font-normal text-xs opacity-75">Date & Time</span>
                                                </div>
                                            </th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            } uppercase tracking-wider`}>
                                                Location
                                            </th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody className={`${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
            {isDirectFetching ? (
                <tr>
                    <td colSpan="4" className={`px-6 py-4 text-center ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        <div className="flex items-center justify-center space-x-2">
                            <CircularProgress size={24} />
                            <span>Fetching events...</span>
                        </div>
                    </td>
                </tr>
            ) : filteredEvents.length === 0 ? (
                <tr>
                    <td colSpan="4" className={`px-6 py-4 text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        No events found for this date
                    </td>
                </tr>
            ) : (
                filteredEvents.map((event) => (
                    <tr
                        key={event.id}
                        className={`cursor-pointer ${
                            isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-900'
                        }`}
                        onClick={() => {
                            setSelectedEvent(event);
                            setNewEvent({
                                summary: event.summary,
                                description: event.description,
                                start: new Date(event.start.dateTime),
                                end: new Date(event.end.dateTime),
                                location: event.location,
                                category: event.category
                            });
                            setEventCategory(event.category || 'default');
                            setOpenDialog(true);
                        }}
                    >
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full ${
                                    eventCategories[event.category || 'default'].color
                                } mr-2`}></div>
                                {event.summary}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {formatDate(event.start.dateTime)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatTime(event.start.dateTime)}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {formatDate(event.end.dateTime)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatTime(event.end.dateTime)}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                {event.location ? (
                                    <>
                                        <span className="mr-2">📍</span>
                                        {event.location}
                                    </>
                                ) : (
                                    <span className="text-gray-400">
                                        No location specified
                                    </span>
                                )}
                            </div>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Event Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    className: isDarkMode ? 'bg-gray-800 text-white' : ''
                }}
            >
                <DialogTitle className={isDarkMode ? 'text-white' : ''}>
                    {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
                <DialogContent>
                    <div className="mt-4 mb-2">
                        <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Category
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(eventCategories).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setEventCategory(key)}
                                    className={`px-3 py-1 rounded-full text-sm ${value.color} ${value.text} ${
                                        eventCategory === key ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                    }`}
                                >
                                    {value.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={newEvent.summary}
                        onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                        className={isDarkMode ? 'dark-mode-input' : ''}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className={isDarkMode ? 'dark-mode-input' : ''}
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        fullWidth
                        value={newEvent.location || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className={isDarkMode ? 'dark-mode-input' : ''}
                        placeholder="Enter event location"
                        inputProps={{
                            list: "locationSuggestions"
                        }}
                    />
                    <datalist id="locationSuggestions">
                        {commonLocations.map((location, index) => (
                            <option key={index} value={location} />
                        ))}
                    </datalist>
                    <DateTimePicker
                        label="Start Time"
                        value={newEvent.start}
                        onChange={(newValue) => setNewEvent({ ...newEvent, start: newValue })}
                        className={isDarkMode ? 'dark-mode-input' : ''}
                    />
                    <DateTimePicker
                        label="End Time"
                        value={newEvent.end}
                        onChange={(newValue) => setNewEvent({ ...newEvent, end: newValue })}
                        className={isDarkMode ? 'dark-mode-input' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    {selectedEvent && (
                        <button
                            onClick={() => {
                                handleDeleteEvent(selectedEvent.id);
                                setOpenDialog(false);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={() => setOpenDialog(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveEvent}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CalendarView;