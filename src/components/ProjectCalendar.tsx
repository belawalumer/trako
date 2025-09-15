'use client';

import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import { Project } from '@/lib/supabase';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface ProjectCalendarProps {
  projects: Project[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Project;
}

const localizer = momentLocalizer(moment);

export default function ProjectCalendar({ projects }: ProjectCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Convert projects to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return projects
      .filter(project => project.start_date)
      .map(project => {
        const startDate = new Date(project.start_date!);
        const endDate = project.end_date ? new Date(project.end_date) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week if no end date
        
        return {
          id: project.id,
          title: project.name,
          start: startDate,
          end: endDate,
          resource: project,
        };
      });
  }, [projects]);

  // Event style function
  const eventStyleGetter = (event: CalendarEvent) => {
    const project = event.resource;
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    // Color based on project status
    switch (project.status) {
      case 'active':
        backgroundColor = '#10B981';
        borderColor = '#059669';
        break;
      case 'started':
        backgroundColor = '#3B82F6';
        borderColor = '#2563EB';
        break;
      case 'completed':
        backgroundColor = '#6B7280';
        borderColor = '#4B5563';
        break;
      case 'stopped':
        backgroundColor = '#EF4444';
        borderColor = '#DC2626';
        break;
      case 'waiting_for_client_approval':
        backgroundColor = '#F59E0B';
        borderColor = '#D97706';
        break;
      case 'gathering_requirements':
        backgroundColor = '#8B5CF6';
        borderColor = '#7C3AED';
        break;
      default:
        backgroundColor = '#3174ad';
        borderColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
      },
    };
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const project = event.resource;
    return (
      <div className="p-1">
        <div className="font-medium text-xs truncate">{event.title}</div>
        <div className="text-xs opacity-75">
          {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        {project.priority && (
          <div className="text-xs opacity-75">
            Priority: {project.priority}
          </div>
        )}
      </div>
    );
  };

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const changeView = (viewName: View) => {
      toolbar.onView(viewName);
    };

    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToBack}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ‹
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ›
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {toolbar.label}
          </h2>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => changeView(Views.MONTH)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              toolbar.view === Views.MONTH
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => changeView(Views.WEEK)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              toolbar.view === Views.WEEK
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => changeView(Views.DAY)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              toolbar.view === Views.DAY
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track project timelines and start dates
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { status: 'active', label: 'Active', color: 'bg-green-500' },
            { status: 'started', label: 'Started', color: 'bg-blue-500' },
            { status: 'completed', label: 'Completed', color: 'bg-gray-500' },
            { status: 'stopped', label: 'Stopped', color: 'bg-red-500' },
            { status: 'waiting_for_client_approval', label: 'Waiting for Approval', color: 'bg-yellow-500' },
            { status: 'gathering_requirements', label: 'Gathering Requirements', color: 'bg-purple-500' },
          ].map((item) => (
            <div key={item.status} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            style={{ height: 600 }}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
            }}
            eventPropGetter={eventStyleGetter}
            popup
            showMultiDayTimes
            step={30}
            timeslots={2}
          />
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Project Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {projects.filter(p => p.start_date).length}
            </div>
            <div className="text-sm text-gray-500">Projects with Start Dates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {projects.filter(p => p.start_date && new Date(p.start_date) <= new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Projects Started</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {projects.filter(p => p.start_date && new Date(p.start_date) > new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Upcoming Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {projects.filter(p => p.end_date && new Date(p.end_date) < new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Completed Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
}
