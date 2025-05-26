import { Event, EventType, EventStatus } from '../types';

const cameraLocations = [
  'Main Entrance',
  'Parking Lot A',
  'Parking Lot B',
  'Server Room',
  'Reception Area',
  'Warehouse',
  'Executive Office',
  'Loading Dock',
  'Break Room',
  'Perimeter East',
  'Perimeter West',
  'Employee Entrance',
];

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

// Generate a random date within the last 30 days
const generateRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

// Generate a random event
const generateEvent = (id: number): Event => {
  const date = generateRandomDate();
  const location = cameraLocations[Math.floor(Math.random() * cameraLocations.length)];
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const status: EventStatus = Math.random() > 0.3 ? 'reviewed' : 'pending';
  
  // Generate a random image URL from Unsplash based on the event type
  let imageUrl = 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80';
  
  if (type === 'person_detected') {
    imageUrl = 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=800&q=80';
  } else if (type === 'vehicle_detected') {
    imageUrl = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
  } else if (type === 'unauthorized_access') {
    imageUrl = 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&w=800&q=80';
  }
  
  return {
    id: `evt-${id.toString().padStart(4, '0')}`,
    timestamp: date,
    location,
    type,
    status,
    imageUrl,
    details: {
      coordinates: `${Math.floor(Math.random() * 1000) + 100}x${Math.floor(Math.random() * 1000) + 100}`,
      confidence: Math.floor(Math.random() * 100) + '%',
      duration: `${Math.floor(Math.random() * 60) + 1} seconds`,
      reviewer: status === 'reviewed' ? 'John Operator' : undefined,
      reviewTimestamp: status === 'reviewed' ? new Date(date.getTime() + Math.random() * 10000000) : undefined,
      notes: status === 'reviewed' ? 'Event verified and logged in the system.' : undefined,
    }
  };
};

// Generate an array of 100 random events
export const generateMockEvents = (count = 100): Event[] => {
  return Array.from({ length: count }, (_, i) => generateEvent(i + 1))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp (newest first)
};

export const mockEvents = generateMockEvents();

export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const filterEvents = (
  searchTerm: string = '', 
  startDate?: Date, 
  endDate?: Date, 
  eventType?: EventType,
  location?: string,
  status?: EventStatus
): Event[] => {
  return mockEvents.filter(event => {
    // Filter by search term
    if (searchTerm && !event.id.includes(searchTerm) && !event.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (startDate && event.timestamp < startDate) {
      return false;
    }
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      if (event.timestamp >= nextDay) {
        return false;
      }
    }
    
    // Filter by event type
    if (eventType && event.type !== eventType) {
      return false;
    }
    
    // Filter by location
    if (location && event.location !== location) {
      return false;
    }
    
    // Filter by status
    if (status && event.status !== status) {
      return false;
    }
    
    return true;
  });
};