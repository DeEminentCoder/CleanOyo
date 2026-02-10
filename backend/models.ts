
import mongoose, { Schema, Document } from 'mongoose';

// --- User Schema ---
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: 'resident' | 'psp' | 'admin';
  passwordHash: string;
  location: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['resident', 'psp', 'admin'], default: 'resident' },
  passwordHash: { type: String, required: true },
  location: { type: String, default: 'Bodija' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// --- PSP Operator Schema ---
export interface IPSPOperator extends Document {
  userId: mongoose.Types.ObjectId;
  serviceZone: string;
  availability: boolean;
  fleetSize: number;
  efficiency: number;
  assignedSubZones: string[];
}

const PSPOperatorSchema = new Schema<IPSPOperator>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceZone: { type: String, required: true },
  availability: { type: Boolean, default: true },
  fleetSize: { type: Number, default: 0 },
  efficiency: { type: Number, default: 0 },
  assignedSubZones: [{ type: String }]
});

// --- Pickup Request Schema ---
export interface IPickupRequest extends Document {
  residentId: mongoose.Types.ObjectId;
  operatorId?: mongoose.Types.ObjectId;
  residentName: string;
  location: string;
  gps?: { lat: number; lng: number };
  wasteType: string;
  scheduledDate: Date;
  status: 'Pending' | 'Scheduled' | 'On The Way' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PickupRequestSchema = new Schema<IPickupRequest>({
  residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  operatorId: { type: Schema.Types.ObjectId, ref: 'User' }, // Ref to User (PSP Role)
  residentName: { type: String, required: true },
  location: { type: String, required: true },
  gps: {
    lat: { type: Number },
    lng: { type: Number }
  },
  wasteType: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Scheduled', 'On The Way', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// --- Zone Schema ---
export interface IZone extends Document {
  name: string;
  boundaries: { type: string, coordinates: number[][][] }; // GeoJSON
  assignedOperators: mongoose.Types.ObjectId[];
  floodRisk: 'Low' | 'Medium' | 'High';
}

const ZoneSchema = new Schema<IZone>({
  name: { type: String, required: true, unique: true },
  boundaries: {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true }
  },
  assignedOperators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  floodRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' }
});

// --- Activity Log Schema ---
export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
export const PSPOperatorModel = mongoose.model<IPSPOperator>('PSPOperator', PSPOperatorSchema);
export const PickupRequestModel = mongoose.model<IPickupRequest>('PickupRequest', PickupRequestSchema);
export const ZoneModel = mongoose.model<IZone>('Zone', ZoneSchema);
export const ActivityLogModel = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
