'use client';

/**
 * ============================================
 * Calendar/Schedule Page - Project SINAG
 * ============================================
 * 
 * This page implements the "Notifications and Calendaring" core module.
 * Accessible to ALL authenticated roles with role-specific events.
 * 
 * ============================================
 * API ENDPOINTS REQUIRED:
 * ============================================
 * 
 * GET /api/calendar/events
 *   - Returns events visible to the authenticated user
 *   - Query params: startDate, endDate, types[], role
 *   - Response: { events: CalendarEvent[], total: number }
 * 
 * POST /api/calendar/events
 *   - Creates a new event (coordinator/adviser only)
 *   - Body: Omit<CalendarEvent, '_id'>
 *   - Response: { event: CalendarEvent }
 * 
 * PUT /api/calendar/events/:id
 *   - Updates an existing event
 *   - Body: Partial<CalendarEvent>
 *   - Response: { event: CalendarEvent }
 * 
 * DELETE /api/calendar/events/:id
 *   - Deletes an event (coordinator/adviser only, or own personal reminders)
 *   - Response: { success: true }
 * 
 * GET /api/calendar/events/upcoming
 *   - Returns upcoming events for the next 7 days
 *   - Response: { events: CalendarEvent[] }
 */

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  X,
  Filter,
  Shield,
  Target,
  Users,
  GraduationCap,
  Bell,
  Check,
} from 'lucide-react';
import { useAuth, UserRole } from '@/app/hooks/useAuth';
import Modal from '@/app/components/Modal';

// ============================================
// TypeScript Interfaces
// ============================================

export type CalendarEventType = 
  | 'defense'      // Blue - Thesis/Proposal defenses
  | 'milestone'    // Red/Orange - Milestone deadlines
  | 'meeting'      // Green - Adviser meetings
  | 'workshop'     // Purple - Workshops/Seminars
  | 'personal';    // Gray - Personal reminders

export type View = 'month' | 'week' | 'day';

export interface CalendarEvent {
  _id: string;
  title: string;
  date: string;        // ISO date string
  endDate?: string;    // Optional end date for multi-day events
  type: CalendarEventType;
  description?: string;
  location?: string;
  relatedTo?: {
    type: 'student' | 'workflow' | 'thesis' | 'none';
    id?: string;
    name?: string;
  };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Event Type Configuration
// ============================================

const EVENT_TYPE_CONFIG: Record<CalendarEventType, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  lightBg: string;
  icon: React.ElementType;
}> = {
  defense: {
    label: 'Defense Schedule',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    lightBg: 'bg-blue-50',
    icon: Shield,
  },
  milestone: {
    label: 'Milestone Deadline',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-500',
    lightBg: 'bg-orange-50',
    icon: Target,
  },
  meeting: {
    label: 'Meeting',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-600',
    lightBg: 'bg-green-50',
    icon: Users,
  },
  workshop: {
    label: 'Workshop/Seminar',
    bgColor: 'bg-purple-600',
    textColor: 'text-white',
    borderColor: 'border-purple-600',
    lightBg: 'bg-purple-50',
    icon: GraduationCap,
  },
  personal: {
    label: 'Personal Reminder',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    borderColor: 'border-gray-500',
    lightBg: 'bg-gray-50',
    icon: Bell,
  },
};

// ============================================
// Mock Data
// ============================================

const MOCK_EVENTS: CalendarEvent[] = [
  // Defense schedules
  {
    _id: '1',
    title: 'Proposal Defense: Maria Santos',
    date: '2026-05-05T09:00:00',
    endDate: '2026-05-05T11:00:00',
    type: 'defense',
    description: 'MS Thesis Proposal Defense on AI-Assisted Learning in Environmental Science Education',
    location: 'SESAM Conference Room A',
    relatedTo: { type: 'student', id: 'student-001', name: 'Maria Santos' },
  },
  {
    _id: '2',
    title: 'Final Defense: Juan Dela Cruz',
    date: '2026-05-15T13:00:00',
    endDate: '2026-05-15T15:00:00',
    type: 'defense',
    description: 'PhD Dissertation Defense on Mangrove Restoration Techniques',
    location: 'SESAM AVR',
    relatedTo: { type: 'student', id: 'student-002', name: 'Juan Dela Cruz' },
  },
  {
    _id: '3',
    title: 'Proposal Defense: Ana Garcia',
    date: '2026-04-30T10:00:00',
    endDate: '2026-04-30T12:00:00',
    type: 'defense',
    description: 'MS Thesis Proposal Defense on Water Quality Assessment',
    location: 'SESAM Conference Room B',
    relatedTo: { type: 'student', id: 'student-003', name: 'Ana Garcia' },
  },

  // Milestone deadlines
  {
    _id: '4',
    title: 'Data Collection Phase Deadline',
    date: '2026-05-15T23:59:59',
    type: 'milestone',
    description: 'Deadline for completing data collection phase. Target: 120 respondents.',
    relatedTo: { type: 'workflow', id: 'wf-001', name: 'Thesis Workflow' },
  },
  {
    _id: '5',
    title: 'Chapter 2 Literature Review Due',
    date: '2026-04-20T17:00:00',
    type: 'milestone',
    description: 'Submit revised Chapter 2 with updated citations and literature synthesis.',
  },
  {
    _id: '6',
    title: 'IRB Ethics Clearance Application',
    date: '2026-04-25T16:00:00',
    type: 'milestone',
    description: 'Submit complete IRB application with informed consent forms and research protocol.',
  },
  {
    _id: '7',
    title: 'Progress Report Submission',
    date: '2026-04-30T23:59:59',
    type: 'milestone',
    description: 'Monthly progress report due for all graduate students.',
  },
  {
    _id: '8',
    title: 'Pre-Defense Document Submission',
    date: '2026-05-08T17:00:00',
    type: 'milestone',
    description: 'Submit complete thesis manuscript to committee members at least 2 weeks before defense.',
  },

  // Meetings
  {
    _id: '9',
    title: 'Advising Session: Dr. Santos',
    date: '2026-04-22T14:00:00',
    endDate: '2026-04-22T15:30:00',
    type: 'meeting',
    description: 'Monthly advising session to discuss research progress and challenges.',
    location: 'SESAM Room 205',
    relatedTo: { type: 'student', id: 'student-001', name: 'Maria Santos' },
  },
  {
    _id: '10',
    title: 'Committee Meeting: Protocol Review',
    date: '2026-04-25T10:00:00',
    endDate: '2026-04-25T12:00:00',
    type: 'meeting',
    description: 'Review research methodology and data collection instruments with thesis committee.',
    location: 'Zoom Meeting',
  },
  {
    _id: '11',
    title: 'One-on-One: Research Methods Discussion',
    date: '2026-05-02T09:00:00',
    endDate: '2026-05-02T10:00:00',
    type: 'meeting',
    description: 'Discussion on statistical analysis approach for survey data.',
    location: 'Dr. Santos\' Office',
  },

  // Workshops/Seminars
  {
    _id: '12',
    title: 'SESAM Research Colloquium',
    date: '2026-04-12T08:00:00',
    endDate: '2026-04-12T17:00:00',
    type: 'workshop',
    description: 'Annual research colloquium featuring presentations from graduate students and faculty.',
    location: 'SESAM Main Hall',
  },
  {
    _id: '13',
    title: 'Workshop: Zotero Reference Management',
    date: '2026-04-18T13:00:00',
    endDate: '2026-04-18T16:00:00',
    type: 'workshop',
    description: 'Hands-on workshop on using Zotero for citation management and bibliography creation.',
    location: 'UPLB Library Computer Lab',
  },
  {
    _id: '14',
    title: 'Seminar: Thesis Writing Best Practices',
    date: '2026-05-08T09:00:00',
    endDate: '2026-05-08T12:00:00',
    type: 'workshop',
    description: 'Comprehensive seminar on academic writing, formatting, and thesis preparation.',
    location: 'SESAM AVR',
  },
  {
    _id: '15',
    title: 'Research Ethics Training',
    date: '2026-05-20T08:00:00',
    endDate: '2026-05-20T12:00:00',
    type: 'workshop',
    description: 'Mandatory ethics training for researchers working with human subjects.',
    location: 'SESAM Training Room',
  },

  // Personal reminders
  {
    _id: '16',
    title: 'Reminder: Submit revised consent forms',
    date: '2026-04-18T09:00:00',
    type: 'personal',
    description: 'Follow up on IRB feedback and submit revised informed consent documents.',
  },
  {
    _id: '17',
    title: 'Backup research data',
    date: '2026-04-28T18:00:00',
    type: 'personal',
    description: 'Weekly backup of all research data, survey responses, and analysis files.',
  },
];

// ============================================
// Utility Functions
// ============================================

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getWeekStart = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

// ============================================
// Main Component
// ============================================

export default function CalendarPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CalendarEventType[]>([
    'defense', 'milestone', 'meeting', 'workshop', 'personal'
  ]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => activeFilters.includes(event.type));
  }, [activeFilters]);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return filteredEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  }, [filteredEvents]);

  // Navigation handlers
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter toggle
  const toggleFilter = (type: CalendarEventType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const canAddEvents = userRole === 'coordinator' || userRole === 'adviser';

  // ============================================
  // Render Month View
  // ============================================
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];
    
    // Previous month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const date = new Date(year, month - 1, dayNum);
      const dayEvents = filteredEvents.filter(event => isSameDay(new Date(event.date), date));
      
      days.push(
        <div
          key={`prev-${dayNum}`}
          className="min-h-[120px] bg-gray-50 border border-gray-200 p-2 text-gray-400"
        >
          <span className="text-sm">{dayNum}</span>
          {dayEvents.slice(0, 2).map(event => (
            <div
              key={event._id}
              className={`mt-1 px-2 py-1 rounded text-xs truncate cursor-pointer ${EVENT_TYPE_CONFIG[event.type].bgColor} ${EVENT_TYPE_CONFIG[event.type].textColor}`}
              onClick={() => handleEventClick(event)}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="mt-1 text-xs text-gray-500 pl-2">+{dayEvents.length - 2} more</div>
          )}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, today);
      const dayEvents = filteredEvents.filter(event => isSameDay(new Date(event.date), date));
      
      days.push(
        <div
          key={day}
          className={`min-h-[120px] bg-white border border-gray-200 p-2 transition-colors hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
        >
          <span className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
            {day}
            {isToday && <span className="ml-1 text-xs text-blue-600">(Today)</span>}
          </span>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event._id}
                className={`px-2 py-1 rounded text-xs truncate cursor-pointer hover:opacity-80 ${EVENT_TYPE_CONFIG[event.type].bgColor} ${EVENT_TYPE_CONFIG[event.type].textColor}`}
                onClick={() => handleEventClick(event)}
                title={event.title}
              >
                {event.endDate ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                    {event.title}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{formatTime(event.date).replace(':00', '')}</span>
                    {event.title}
                  </span>
                )}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <button 
                className="text-xs text-gray-500 hover:text-gray-700 pl-1"
                onClick={() => {
                  // Could open a day view modal
                }}
              >
                +{dayEvents.length - 3} more
              </button>
            )}
          </div>
        </div>
      );
    }

    // Next month padding to complete the grid
    const remainingCells = 42 - days.length; // 6 rows x 7 columns
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      const dayEvents = filteredEvents.filter(event => isSameDay(new Date(event.date), date));
      
      days.push(
        <div
          key={`next-${day}`}
          className="min-h-[120px] bg-gray-50 border border-gray-200 p-2 text-gray-400"
        >
          <span className="text-sm">{day}</span>
          {dayEvents.slice(0, 2).map(event => (
            <div
              key={event._id}
              className={`mt-1 px-2 py-1 rounded text-xs truncate cursor-pointer ${EVENT_TYPE_CONFIG[event.type].bgColor} ${EVENT_TYPE_CONFIG[event.type].textColor}`}
              onClick={() => handleEventClick(event)}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  // ============================================
  // Render Week View
  // ============================================
  const renderWeekView = () => {
    const weekStart = getWeekStart(new Date(currentDate));
    const weekDays = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const isToday = isSameDay(date, today);
      const dayEvents = filteredEvents.filter(event => isSameDay(new Date(event.date), date));

      weekDays.push(
        <div key={i} className={`flex-1 border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className={`p-3 text-center border-b border-gray-200 ${isToday ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
              {date.getDate()}
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {dayEvents.map(event => (
              <div
                key={event._id}
                className={`p-2 rounded cursor-pointer hover:opacity-80 ${EVENT_TYPE_CONFIG[event.type].bgColor} ${EVENT_TYPE_CONFIG[event.type].textColor}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="text-xs font-medium">{formatTime(event.date)}</div>
                <div className="text-sm font-semibold truncate">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="flex min-h-[500px]">
          {weekDays}
        </div>
      </div>
    );
  };

  // ============================================
  // Render Day View
  // ============================================
  const renderDayView = () => {
    const dayEvents = filteredEvents.filter(event => isSameDay(new Date(event.date), currentDate));
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="w-full">
        <div className={`p-4 text-center border-b border-gray-200 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <h3 className={`text-xl font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
            {formatDate(currentDate.toISOString())}
            {isToday && <span className="ml-2 text-blue-600">(Today)</span>}
          </h3>
        </div>
        <div className="p-6 max-w-3xl mx-auto">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
                const config = EVENT_TYPE_CONFIG[event.type];
                const Icon = config.icon;
                
                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.lightBg}`}>
                        <Icon className={`w-6 h-6 ${config.bgColor.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                            {config.label}
                          </span>
                          <span className="text-sm text-gray-500">{formatTime(event.date)}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
                        {event.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full flex flex-col bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">View deadlines, defenses, and events</p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {(['month', 'week', 'day'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    view === v 
                      ? 'bg-white text-[#0C0B5D] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Add event button (coordinator/adviser only) */}
            {canAddEvents && (
              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Current period display */}
        <div className="mt-4 flex items-center justify-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
        </div>
      </div>

      {/* Main content - Calendar + Sidebar */}
      <div className="flex flex-col lg:flex-row">
        {/* Calendar area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Filters bar */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]).map((type) => {
                const config = EVENT_TYPE_CONFIG[type];
                const isActive = activeFilters.includes(type);
                
                return (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                      isActive 
                        ? `${config.bgColor} ${config.textColor} ${config.borderColor}` 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5" />}
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar view */}
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>

        {/* Upcoming events sidebar */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0C0B5D]" />
              Upcoming Events
            </h3>
            <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
          </div>
          
          <div className="p-3 space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.map(event => {
                const config = EVENT_TYPE_CONFIG[event.type];
                const Icon = config.icon;
                const eventDate = new Date(event.date);
                const today = new Date();
                const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.lightBg}`}>
                        <Icon className={`w-4 h-4 ${config.bgColor.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : `In ${daysDiff} days`}
                          {' • '}
                          {formatTime(event.date)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200 bg-white mt-auto">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Event Types</h4>
            <div className="space-y-2">
              {(Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]).map(type => {
                const config = EVENT_TYPE_CONFIG[type];
                return (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <span className={`w-3 h-3 rounded-full ${config.bgColor}`}></span>
                    <span className="text-gray-700">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Event Details"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${EVENT_TYPE_CONFIG[selectedEvent.type].bgColor} ${EVENT_TYPE_CONFIG[selectedEvent.type].textColor}`}>
                {EVENT_TYPE_CONFIG[selectedEvent.type].label}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>
                  {formatTime(selectedEvent.date)}
                  {selectedEvent.endDate && ` - ${formatTime(selectedEvent.endDate)}`}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>
            
            {selectedEvent.description && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>
            )}
            
            {selectedEvent.relatedTo && selectedEvent.relatedTo.type !== 'none' && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">Related To</h4>
                <p className="text-sm text-gray-600">
                  {selectedEvent.relatedTo.type === 'student' && 'Student: '}
                  {selectedEvent.relatedTo.type === 'workflow' && 'Workflow: '}
                  {selectedEvent.relatedTo.type === 'thesis' && 'Thesis: '}
                  <span className="font-medium text-gray-900">{selectedEvent.relatedTo.name}</span>
                </p>
              </div>
            )}
            
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="flex-1 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
              >
                Close
              </button>
              {canAddEvents && (
                <button
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Event Modal (placeholder for coordinator/adviser) */}
      <Modal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        title="Add New Event"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This would open a form to create a new event. Event creation is available for Coordinators and Advisers.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> API endpoint <code className="bg-yellow-100 px-1 rounded">POST /api/calendar/events</code> needs to be implemented.
            </p>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="flex-1 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Create Event
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
