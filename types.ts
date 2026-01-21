
export enum AppView {
  OVERVIEW = 'Overview',
  EVENT_REQUESTS = 'Event Requests',
  CANCELLATION_REQUESTS = 'Cancellations',
  USER_MANAGEMENT = 'User Management'
}

export interface Booking {
  id: string;
  userName: string;
  court: string;
  time: string;
  timestamp: number;
}

export interface EventRequest {
  id: string;
  requesterName: string;
  eventName: string;
  dateTime: string;
  courts: string[];
  status: 'pending' | 'approved' | 'declined';
}

export interface CancellationRequest {
  id: string;
  bookingId: string;
  userName: string;
  reason: string;
  timestamp: any;
  status: 'pending' | 'processed';
}

export interface UserLog {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
}

export interface Court {
  id: number;
  status: 'available' | 'booked' | 'event' | 'locked';
  label?: string;
}
