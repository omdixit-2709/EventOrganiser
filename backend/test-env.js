const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
console.log('Environment file path:', envPath);

// Check if file exists
if (fs.existsSync(envPath)) {
    console.log('Found .env file');
    
    // Read file content
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\nFile content:');
    console.log(envContent);
    
    // Try to load environment variables
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
        console.error('\nError loading .env file:', result.error);
    } else {
        console.log('\nEnvironment variables loaded successfully');
        console.log({
            PORT: process.env.PORT,
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
            SESSION_SECRET: process.env.SESSION_SECRET ? 'Set' : 'Not Set',
            NODE_ENV: process.env.NODE_ENV
        });
    }
} else {
    console.error('.env file not found at:', envPath);
}