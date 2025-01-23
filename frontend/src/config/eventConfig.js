export const eventCategories = {
    default: { color: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', label: 'Default' },
    meeting: { color: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', label: 'Meeting' },
    personal: { color: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', label: 'Personal' },
    deadline: { color: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', label: 'Deadline' },
    workshop: { color: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', label: 'Workshop' },
    holiday: { color: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', label: 'Holiday' }
};

export const eventTemplates = [
    {
        name: 'Quick Meeting',
        duration: 30,
        category: 'meeting',
        description: 'Brief team sync-up meeting'
    },
    {
        name: 'Team Meeting',
        duration: 60,
        category: 'meeting',
        description: 'Regular team meeting'
    },
    {
        name: 'Workshop',
        duration: 120,
        category: 'workshop',
        description: 'Team workshop session'
    },
    {
        name: 'Personal Break',
        duration: 30,
        category: 'personal',
        description: 'Short personal break'
    },
    {
        name: 'Project Deadline',
        duration: 0,
        category: 'deadline',
        description: 'Project submission deadline'
    }
];