const { Sequelize } = require('sequelize');
const path = require('path');

// Determine database path based on environment
const getDatabasePath = () => {
    if (process.env.NODE_ENV === 'production') {
        // In production, use a specific directory that Render provides
        return path.join('/tmp', 'database.sqlite');
    }
    // In development, use local directory
    return path.join(__dirname, '../../database.sqlite');
};

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: getDatabasePath(),
    logging: process.env.NODE_ENV !== 'production', // Only log in development
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    // Additional production configurations
    define: {
        timestamps: true, // Add createdAt and updatedAt timestamps
        underscored: true // Use snake_case rather than camelCase
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync database with different settings based on environment
        if (process.env.NODE_ENV === 'production') {
            // In production, don't alter existing tables
            await sequelize.sync();
            console.log('Database synchronized (production mode)');
        } else {
            // In development, you might want to alter tables
            await sequelize.sync({ alter: true });
            console.log('Database synchronized (development mode)');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Let the main application handle the error
    }
};

// Add cleanup function for graceful shutdown
const closeDatabase = async () => {
    try {
        await sequelize.close();
        console.log('Database connection closed successfully');
    } catch (error) {
        console.error('Error closing database connection:', error);
        throw error;
    }
};

module.exports = { 
    sequelize, 
    connectDB,
    closeDatabase 
};