
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel, PickupRequestModel, PSPOperatorModel, ZoneModel, ActivityLogModel } from './models';
import { sendPickupNotification } from './mailer';
import { seedData } from './seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'wasteup_secret_key_ibadan';
const SYSTEM_EMAIL = process.env.SYSTEM_EMAIL || "simeonkenny66@gmail.com";
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://simeonkennycleanoyo_db_user:simeonkenny0810@cluster0.pgnr6i5.mongodb.net/cleanoyo?appName=Cluster0';

// Middleware
app.use(cors() as any);
app.use(express.json() as any);

// --- Database Connection ---
console.log('🔄 Initiating connection to MongoDB Atlas...');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas - Database: CleanOyo');
    // Run seed and test logic
    await seedData();
  })
  .catch(err => {
    console.error('❌ ERROR: Could not connect to MongoDB Atlas:', err.message);
    // Fix: Cast process to any to access exit property if types are missing in the current execution context
    (process as any).exit(1);
  });

// Handle connection events
mongoose.connection.on('error', err => {
  console.error('📡 MongoDB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('📡 MongoDB Disconnected. Attempting to reconnect...');
});

// --- Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied for this role' });
  }
  next();
};

// --- Routes ---

// 1. Auth: Register
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phone, role, password, location } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const user = new UserModel({ name, email, phone, role, passwordHash, location });
    await user.save();

    if (role === 'psp') {
      const pspProfile = new PSPOperatorModel({ userId: user._id, serviceZone: location });
      await pspProfile.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name, location: user.location, phone: user.phone }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Auth: Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.role !== role) return res.status(403).json({ message: 'Role mismatch' });

    const valid = await bcrypt.compare(password || 'password123', user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name, location: user.location, phone: user.phone }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Pickup Requests
app.get('/api/pickuprequests', authenticate, async (req: any, res) => {
  try {
    let query = {};
    if (req.user.role === 'resident') query = { residentId: req.user.id };
    else if (req.user.role === 'psp') query = { operatorId: req.user.id };

    const requests = await PickupRequestModel.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/pickuprequests', authenticate, authorize(['resident']), async (req: any, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pspUser = await UserModel.findOne({ role: 'psp', location: user.location });

    const newRequest = new PickupRequestModel({
      ...req.body,
      residentId: user._id,
      residentName: user.name,
      operatorId: pspUser?._id,
      status: 'Pending'
    });
    await newRequest.save();

    // Trigger Notification
    await sendPickupNotification(user.email, user.name, {
      status: 'Pending (Received)',
      wasteType: newRequest.wasteType,
      scheduledDate: newRequest.scheduledDate,
      location: newRequest.location
    });

    await new ActivityLogModel({ userId: user._id, action: 'CREATE_REQUEST', details: `New ${req.body.wasteType} request created.` }).save();

    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/pickuprequests/:id', authenticate, async (req: any, res) => {
  try {
    const updated = await PickupRequestModel.findByIdAndUpdate(req.params.id, { 
      status: req.body.status, 
      updatedAt: new Date() 
    }, { new: true }).populate('residentId');
    
    if (updated && updated.residentId) {
      const resUser = updated.residentId as any;
      await sendPickupNotification(resUser.email, resUser.name, {
        status: updated.status,
        wasteType: updated.wasteType,
        scheduledDate: updated.scheduledDate,
        location: updated.location
      });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Admin: Zones
app.get('/api/zones', async (req, res) => {
  const zones = await ZoneModel.find();
  res.json(zones);
});

app.post('/api/zones', authenticate, authorize(['admin']), async (req, res) => {
  const zone = new ZoneModel(req.body);
  await zone.save();
  res.status(201).json(zone);
});

// 5. Activity Logs (Admin only)
app.get('/api/activitylogs', authenticate, authorize(['admin']), async (req, res) => {
  const logs = await ActivityLogModel.find().populate('userId', 'name email').sort({ timestamp: -1 });
  res.json(logs);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Waste Up Backend running on port ${PORT}`);
  console.log(`📧 System notifications configured for: ${SYSTEM_EMAIL}`);
});
