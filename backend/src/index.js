const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const calendarRoutes = require('./routes/calendar')
const SQLiteStore = require('connect-sqlite3')(session);
const fs = require('fs');

// Load environment variables with explicit path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}

const { connectDB } = require('./config/db');
require('./config/passport');
const authRoutes = require('./routes/auth');

// Ensure sessions directory exists
const sessionsDir = path.join(__dirname, '../sessions');
if (!fs.existsSync(sessionsDir)){
    fs.mkdirSync(sessionsDir);
}

const app = express();

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Something went wrong!' });
};

// Connect to Database
connectDB().catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});

// CORS configuration for production
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: './sessions',
        table: 'sessions'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'calendar-session',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/calendar', calendarRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        clientUrl: process.env.CLIENT_URL
    });
});

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Calendar Dashboard API',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        endpoints: {
            auth: '/auth',
            calendar: '/calendar',
            health: '/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Server setup
const PORT = process.env.PORT || 5001;
let server;

const startServer = () => {
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Client URL: ${process.env.CLIENT_URL}`);
            resolve(server);
        }).on('error', (err) => {
            reject(err);
        });
    });
};

// Graceful shutdown handling
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    try {
        await new Promise((resolve) => {
            server.close(resolve);
        });
        console.log('Server closed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

// Start server with error handling
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// Signal handlers
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Uncaught error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown();
});

module.exports = app; // For testing purposes