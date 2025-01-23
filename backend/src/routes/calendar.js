const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Helper function to setup Google Calendar client
const setupCalendarClient = (user) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://calendar-dashboard-backend.onrender.com/auth/google/callback'
    );

    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Get all calendar events
router.get('/events', isAuthenticated, async (req, res) => {
    try {
        const calendar = setupCalendarClient(req.user);
        const timeMin = req.query.timeMin || new Date().toISOString();
        const timeMax = req.query.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            maxResults: parseInt(req.query.maxResults) || 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        res.json(response.data.items);
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

// Get single event
router.get('/events/:eventId', isAuthenticated, async (req, res) => {
    try {
        const calendar = setupCalendarClient(req.user);
        const response = await calendar.events.get({
            calendarId: 'primary',
            eventId: req.params.eventId
        });
        res.json(response.data);
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Create new event
router.post('/events', isAuthenticated, async (req, res) => {
    try {
        const calendar = setupCalendarClient(req.user);
        const event = {
            summary: req.body.summary,
            description: req.body.description,
            start: {
                dateTime: req.body.start,
                timeZone: req.body.timeZone || 'UTC',
            },
            end: {
                dateTime: req.body.end,
                timeZone: req.body.timeZone || 'UTC',
            },
            reminders: {
                useDefault: true
            }
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.json(response.data);
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Update event
router.put('/events/:eventId', isAuthenticated, async (req, res) => {
    try {
        const calendar = setupCalendarClient(req.user);
        const event = {
            summary: req.body.summary,
            description: req.body.description,
            start: {
                dateTime: req.body.start,
                timeZone: req.body.timeZone || 'UTC',
            },
            end: {
                dateTime: req.body.end,
                timeZone: req.body.timeZone || 'UTC',
            }
        };

        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId: req.params.eventId,
            resource: event,
        });

        res.json(response.data);
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event
router.delete('/events/:eventId', isAuthenticated, async (req, res) => {
    try {
        const calendar = setupCalendarClient(req.user);
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: req.params.eventId,
        });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Get upcoming events (next 7 days)
router.get('/upcoming', isAuthenticated, async (req, res) => {
    try {
        const calendar = setupCalendarClient(req.user);
        const timeMin = new Date();
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 7);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        res.json(response.data.items);
    } catch (error) {
        console.error('Calendar API Error:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
});

module.exports = router;