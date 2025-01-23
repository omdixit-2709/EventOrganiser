import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { eventCategories } from '../../config/eventConfig';

const MonthView = ({ 
    currentMonth, 
    setCurrentMonth, 
    selectedDate, 
    setSelectedDate, 
    events,
    isDarkMode,
    onEventClick 
}) => {
    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const getEventsForDate = (date) => {
        return events.filter(event => 
            isSameDay(new Date(event.start.dateTime), date)
        );
    };

    return (
        <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px">
                {/* Week days header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                        key={day}
                        className={`p-2 text-center text-sm font-medium ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'
                        }`}
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[100px] p-2 ${
                                !isSameMonth(day, currentMonth)
                                    ? isDarkMode 
                                        ? 'bg-gray-900 text-gray-600' 
                                        : 'bg-gray-100 text-gray-400'
                                    : isDarkMode
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white text-gray-900'
                            } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setSelectedDate(day)}
                        >
                            <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                                isToday ? 'bg-blue-500 text-white' : ''
                            }`}>
                                {format(day, 'd')}
                            </div>
                            
                            {/* Events for the day */}
                            <div className="mt-1 space-y-1">
                                {dayEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        className={`text-xs p-1 rounded truncate cursor-pointer ${
                                            eventCategories[event.category || 'default'].color
                                        } ${eventCategories[event.category || 'default'].text}`}
                                    >
                                        {format(new Date(event.start.dateTime), 'HH:mm')} {event.summary}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;