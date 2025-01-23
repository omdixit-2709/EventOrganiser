const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const GOOGLE_CALLBACK_URL = 'https://calendar-dashboard-backend.onrender.com/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google OAuth Callback received:', { 
            profileId: profile.id,
            email: profile.emails[0].value 
        });

        // Find or create user
        const [user, created] = await User.findOrCreate({
            where: { googleId: profile.id },
            defaults: {
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                accessToken,
                refreshToken
            }
        });

        // Update tokens if user exists
        if (!created) {
            user.accessToken = accessToken;
            if (refreshToken) {
                user.refreshToken = refreshToken;
            }
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        console.error('Passport strategy error:', error);
        return done(error, null);
    }
}));

module.exports = passport;