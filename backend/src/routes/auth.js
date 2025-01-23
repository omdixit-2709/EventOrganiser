const express = require('express');
const passport = require('passport');
const { google } = require('googleapis');
const router = express.Router();

// Middleware to handle authentication errors
const handleAuthErrors = (err, req, res, next) => {
    console.error('Authentication Error:', err);
    res.status(500).json({
        error: 'Authentication failed',
        message: err.message
    });
};

// Middleware to check authentication status
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Initialize Google OAuth authentication
router.get('/google', (req, res, next) => {
    console.log('Starting Google OAuth flow...');
    passport.authenticate('google', {
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ],
        accessType: 'offline',
        prompt: 'consent'
    })(req, res, next);
});

// Handle Google OAuth callback
router.get('/google/callback',
    (req, res, next) => {
        console.log('Received callback from Google');
        passport.authenticate('google', { 
            failureRedirect: 'http://localhost:3000/login?error=auth_failed',
            session: true 
        })(req, res, next);
    },
    (req, res) => {
        console.log('Authentication successful for user:', req.user?.email);
        // Redirect to frontend callback route
        res.redirect('http://localhost:3000/auth/callback');
    }
);

// Success route
router.get('/success', isAuthenticated, (req, res) => {
    console.log('User successfully authenticated:', req.user?.email);
    res.json({
        success: true,
        message: 'Authentication successful',
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            googleId: req.user.googleId
        }
    });
});

// Failure route
router.get('/failed', (req, res) => {
    console.log('Authentication failed');
    res.status(401).json({
        success: false,
        message: 'Authentication failed'
    });
});

// Get current user information
router.get('/user', isAuthenticated, (req, res) => {
    try {
        console.log('Fetching user information for:', req.user?.email);
        const user = {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            googleId: req.user.googleId,
        };
        res.json(user);
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// Check authentication status
router.get('/status', (req, res) => {
    console.log('Checking authentication status');
    try {
        if (req.isAuthenticated()) {
            console.log('User is authenticated:', req.user?.email);
            res.json({
                isAuthenticated: true,
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    googleId: req.user.googleId
                }
            });
        } else {
            console.log('User is not authenticated');
            res.json({
                isAuthenticated: false,
                user: null
            });
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
        res.status(500).json({ error: 'Failed to check authentication status' });
    }
});

// Refresh token endpoint
router.post('/refresh-token', isAuthenticated, async (req, res) => {
    try {
        console.log('Attempting to refresh token for user:', req.user?.email);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:3000/auth/callback'
        );

        oauth2Client.setCredentials({
            refresh_token: req.user.refreshToken
        });

        const { tokens } = await oauth2Client.refreshAccessToken();
        console.log('Token refreshed successfully');

        // Update user's tokens in database
        req.user.accessToken = tokens.access_token;
        if (tokens.refresh_token) {
            req.user.refreshToken = tokens.refresh_token;
        }
        await req.user.save();

        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    console.log('Logging out user:', req.user?.email);
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            // Clear cookies
            res.clearCookie('calendar-session');
            // Redirect to frontend
            res.redirect('http://localhost:3000/login');
        });
    });
});

// Test route to verify the setup
router.get('/test', (req, res) => {
    res.json({
        message: 'Auth routes are working',
        timestamp: new Date().toISOString(),
        environment: {
            nodeEnv: process.env.NODE_ENV,
            googleClientConfigured: !!process.env.GOOGLE_CLIENT_ID
        }
    });
});

// Session check route
router.get('/session', (req, res) => {
    res.json({
        sessionExists: !!req.session,
        sessionId: req.session?.id,
        isAuthenticated: req.isAuthenticated(),
        user: req.user ? {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name
        } : null
    });
});

// Error handling middleware
router.use(handleAuthErrors);

module.exports = router;