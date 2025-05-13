export type EventType = 
  | 'motion_detected'
  | 'unauthorized_access'
  | 'object_left'
  | 'person_detected'
  | 'vehicle_detected'
  | 'door_opened'
  | 'glass_break'
  | 'perimeter_breach';

export type EventStatus = 'pending' | 'reviewed';

export interface EventDetails {
  coordinates: string;
  confidence: string;
  duration: string;
  reviewer?: string;
  reviewTimestamp?: Date;
  notes?: string;
}

export interface Event {
  id: string;
  timestamp: Date;
  location: string;
  type: EventType;
  status: EventStatus;
  imageUrl: string;
  details: EventDetails;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastUpdated: Date;
  resolution: string;
  type: 'fixed' | 'ptz';
  imageUrl: string;
  ipAddress: string;
  connectionLost: Date | null;
}

export interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  id?: string;
  onDismiss?: () => void;
}

export interface ToastProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}