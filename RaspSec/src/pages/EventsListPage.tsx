import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { mockEvents, filterEvents } from '../data/mockEvents';
import { Event, EventType, EventStatus } from '../types';
import { useAlert } from '../contexts/AlertContext';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventTypeLabel = ({ type }: { type: EventType }) => {
  let bgColor = 'bg-secondary/10';
  let textColor = 'text-secondary';
  
  switch (type) {
    case 'motion_detected':
      bgColor = 'bg-secondary/10';
      textColor = 'text-secondary';
      break;
    case 'unauthorized_access':
      bgColor = 'bg-destructive/10';
      textColor = 'text-destructive';
      break;
    case 'perimeter_breach':
      bgColor = 'bg-destructive/10';
      textColor = 'text-destructive';
      break;
    case 'glass_break':
      bgColor = 'bg-destructive/10';
      textColor = 'text-destructive';
      break;
    case 'person_detected':
      bgColor = 'bg-warning/10';
      textColor = 'text-warning';
      break;
    case 'vehicle_detected':
      bgColor = 'bg-warning/10';
      textColor = 'text-warning';
      break;
  }
  
  const label = type.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

const StatusLabel = ({ status }: { status: EventStatus }) => {
  const bgColor = status === 'reviewed' ? 'bg-success/10' : 'bg-warning/10';
  const textColor = status === 'reviewed' ? 'text-success' : 'text-warning';
  const icon = status === 'reviewed' ? CheckCircle : Clock;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <icon className="h-3 w-3 mr-1" />
      {status === 'reviewed' ? 'Reviewed' : 'Pending'}
    </span>
  );
};

const EventsListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedType, setSelectedType] = useState<EventType | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | ''>('');
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  // Get unique locations from mock data
  const locations = Array.from(new Set(mockEvents.map(e => e.location)));
  
  // Event types for filter dropdown
  const eventTypes: EventType[] = [
    'motion_detected',
    'unauthorized_access',
    'object_left',
    'person_detected',
    'vehicle_detected',
    'door_opened',
    'glass_break',
    'perimeter_breach',
  ];

  useEffect(() => {
    // Simulate API fetch
    const fetchEvents = async () => {
      setLoading(true);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Apply filters
        const filteredEvents = filterEvents(
          searchTerm,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined,
          selectedType || undefined,
          selectedLocation || undefined,
          selectedStatus || undefined
        );
        
        setEvents(filteredEvents);
      } catch (error) {
        showAlert({ 
          type: 'error', 
          message: 'Failed to load events. Please try again.' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [searchTerm, startDate, endDate, selectedType, selectedLocation, selectedStatus]);
  
  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedType('');
    setSelectedLocation('');
    setSelectedStatus('');
  };
  
  const activeFiltersCount = [
    startDate, 
    endDate, 
    selectedType, 
    selectedLocation, 
    selectedStatus
  ].filter(Boolean).length;

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Security Events</h1>
        <p className="text-muted-foreground">Monitor and manage security events from all cameras</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search events by ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter toggle */}
        <button
          className="btn btn-secondary flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-white bg-opacity-20 text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filter Events</h3>
            <button
              className="text-muted-foreground hover:text-foreground text-sm flex items-center"
              onClick={handleClearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date range */}
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="date"
                  className="input pl-10"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="date"
                  className="input pl-10"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Event type */}
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                className="input"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as EventType | '')}
              >
                <option value="">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                className="input"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as EventStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Events table */}
      <div className="table-container">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No events found matching your filters.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date/Time</th>
                <th>Location</th>
                <th>Event Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="font-mono text-xs">{event.id}</td>
                  <td>
                    <div>{formatDate(event.timestamp)}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(event.timestamp)}</div>
                  </td>
                  <td>{event.location}</td>
                  <td><EventTypeLabel type={event.type} /></td>
                  <td><StatusLabel status={event.status} /></td>
                  <td>
                    <button
                      className="btn btn-ghost text-sm"
                      onClick={() => handleViewDetails(event.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventsListPage;