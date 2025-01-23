const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    googleId: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    name: {
        type: DataTypes.STRING
    },
    accessToken: {
        type: DataTypes.STRING
    },
    refreshToken: {
        type: DataTypes.STRING
    }
});

module.exports = User;