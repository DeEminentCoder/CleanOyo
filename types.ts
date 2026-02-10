
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
  avatar?: string; // Base64 image data
  availability?: boolean; // For PSP Operators
  password?: string; // Hashed in real backend
}

export interface PSPOperatorProfile {
  userId: string;
  serviceZone: string;
  availability: boolean;
  fleetSize: number;
  efficiency: number;
  assignedSubZones: string[];
}

export interface PickupRequest {
  id: string;
  residentId: string;
  residentName: string;
  operatorId?: string;
  operatorName?: string;
  location: string;
  coordinates?: Coordinates;
  wasteType: WasteType;
  scheduledDate: string;
  status: PickupStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  boundaries: Coordinates[];
  assignedOperators: string[]; // User IDs
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
