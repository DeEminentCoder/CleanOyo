
export enum UserRole {
  RESIDENT = 'RESIDENT',
  PSP_OPERATOR = 'PSP_OPERATOR',
  ADMIN = 'ADMIN'
}

export enum PickupStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  ON_THE_WAY = 'ON_THE_WAY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum WasteType {
  GENERAL = 'General Household',
  RECYCLABLE = 'Recyclable (Plastic/Paper)',
  ORGANIC = 'Organic/Food Waste',
  HAZARDOUS = 'Hazardous/Medical',
  CONSTRUCTION = 'Construction/Bulky'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  preferredPspId?: string; // ID of the chosen Waste Collection Operator
  avatar?: string; // Base64 image data
  availability?: boolean; // For PSP Operators
  password?: string; // Hashed in real backend
  coordinates?: Coordinates; // For map placement
}

export interface PickupRequest {
  id: string;
  residentId: string;
  residentName: string;
  operatorId?: string;
  operatorName?: string;
  location: string; // The general area/zone
  houseNumber: string;
  streetName: string;
  landmark: string;
  contactPhone: string;
  coordinates?: Coordinates;
  wasteType: WasteType;
  priority: Priority;
  scheduledDate: string;
  status: PickupStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string; // Recipient
  type: string;
  message: string;
  timestamp: string;
  medium: 'SMS' | 'EMAIL' | 'SYSTEM';
  isRead: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: string;
}

export interface ZoneData {
  id: string;
  name: string;
  floodRisk: 'Low' | 'Medium' | 'High';
  activeRequests: number;
  coordinates: [number, number];
}
