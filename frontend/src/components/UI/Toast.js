import toast from 'react-hot-toast';

export const showToast = {
    success: (message) => {
        toast.success(message, {
            style: {
                background: '#10B981',
                color: '#FFFFFF',
            },
            duration: 3000,
        });
    },
    error: (message) => {
        toast.error(message, {
            style: {
                background: '#EF4444',
                color: '#FFFFFF',
            },
            duration: 3000,
        });
    },
    warning: (message) => {
        toast(message, {
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#FFFFFF',
            },
            duration: 3000,
        });
    }
};