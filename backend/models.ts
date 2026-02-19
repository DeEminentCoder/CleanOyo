import mongoose, { Schema, Document } from 'mongoose';

// User Model
export enum UserRole {
    RESIDENT = 'RESIDENT',
    PSP_OPERATOR = 'PSP_OPERATOR',
    ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  passwordHash: string;
  location?: string;
  operatorId?: string;
  zone?: string;
  isVerified: boolean;
  verificationToken?: string;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: Object.values(UserRole), required: true },
  passwordHash: { type: String, required: true },
  location: { type: String },
  operatorId: { type: String },
  zone: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema);


// PickupRequest Model
export enum PickupStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  ON_THE_WAY = 'ON_THE_WAY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IPickupRequest extends Document {
  resident: mongoose.Schema.Types.ObjectId;
  pspOperator?: mongoose.Schema.Types.ObjectId;
  wasteType: string;
  status: PickupStatus;
  scheduledDate: Date;
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  };
  notes?: string;
}

const pickupRequestSchema: Schema = new Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pspOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wasteType: { type: String, required: true },
  status: { type: String, enum: Object.values(PickupStatus), default: PickupStatus.PENDING },
  scheduledDate: { type: Date, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  notes: { type: String },
}, { timestamps: true });

pickupRequestSchema.index({ location: '2dsphere' });

export const PickupRequestModel = mongoose.model<IPickupRequest>('PickupRequest', pickupRequestSchema);


// Zone Model
export interface IZone extends Document {
  name: string;
  floodRisk: 'Low' | 'Medium' | 'High';
  activeRequests: number;
  coordinates: [number, number];
}

const zoneSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  floodRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  activeRequests: { type: Number, default: 0 },
  coordinates: { type: [Number], required: true },
}, { timestamps: true });

export const ZoneModel = mongoose.model<IZone>('Zone', zoneSchema);

// PSPOperator Model
export interface IPSPOperator extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    serviceZone: string;
}

const pspOperatorSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceZone: { type: String, required: true },
}, { timestamps: true });

export const PSPOperatorModel = mongoose.model<IPSPOperator>('PSPOperator', pspOperatorSchema);

// ActivityLog Model
export interface IActivityLog extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    action: string;
    details: string;
}

const activityLogSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
}, { timestamps: true });

export const ActivityLogModel = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);