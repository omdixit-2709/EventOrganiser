import React from 'react';
import { Calendar } from 'lucide-react';

const Login = () => {
    const handleGoogleLogin = () => {
        window.location.href = 'https://calendar-dashboard-backend.onrender.com/auth/google';
    };

    // Add handlers for terms and privacy links
    const handleTermsClick = (e) => {
        e.preventDefault();
        // Add your terms of service logic here
        console.log('Terms clicked');
    };

    const handlePrivacyClick = (e) => {
        e.preventDefault();
        // Add your privacy policy logic here
        console.log('Privacy clicked');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2C2F33] to-[#333333] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-[#2C2F33] rounded-full p-3">
                            <Calendar className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                        Sign in to manage your calendar events
                    </p>
                    
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200"
                    >
                        <img 
                            src="/images/google.svg" 
                            alt="Google" 
                            className="w-5 h-5"
                        />
                        Sign in with Google
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            By signing in, you agree to our{' '}
                            <button
                                onClick={handleTermsClick}
                                className="text-blue-500 hover:text-blue-600 underline focus:outline-none"
                            >
                                Terms of Service
                            </button>
                            {' '}and{' '}
                            <button
                                onClick={handlePrivacyClick}
                                className="text-blue-500 hover:text-blue-600 underline focus:outline-none"
                            >
                                Privacy Policy
                            </button>
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 py-4 px-8 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-600">
                        © {new Date().getFullYear()} Calendar Dashboard. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;