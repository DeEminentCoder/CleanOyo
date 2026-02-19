
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel, PickupRequestModel, PSPOperatorModel, ZoneModel, ActivityLogModel } from './models.js';
import { sendPickupNotification, sendVerificationEmail } from './mailer.js';
import { seedData } from './seed.js';
import crypto from 'crypto';

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

import { Request, Response, NextFunction } from 'express';

// --- Middleware ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    (req as any).user = decoded;
    next();
  });
};

const authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!roles.includes((req as any).user.role)) {
    return res.status(403).json({ message: 'Access denied for this role' });
  }
  next();
};

// --- Routes ---

// 1. Auth: Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, password, location } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new UserModel({ name, email, phone, role, passwordHash, location, verificationToken });
    await user.save();

    if (role === 'psp') {
      const pspProfile = new PSPOperatorModel({ userId: user._id, serviceZone: location });
      await pspProfile.save();
    }

    await sendVerificationEmail(user.email, user.name, verificationToken);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

            res.status(201).json({ 
                message: 'User registered successfully. Please check your email to verify your account.',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: (user as any).phone,
                    role: user.role,
                    location: user.location,
                    isVerified: user.isVerified,
                },
                token 
            });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Auth: Verify Email
app.get('/api/users/verify', async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send('Verification token is required.');

        const user = await UserModel.findOne({ verificationToken: token as string });
        if (!user) return res.status(400).send('Invalid verification token.');

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send('Email verified successfully. You can now log in.');
    } catch (error: any) {
        res.status(500).send('Error verifying email.');
    }
});

// 3. Auth: Login
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email before logging in.' });
    if (user.role !== role) return res.status(403).json({ message: 'Role mismatch' });

    const valid = await bcrypt.compare(password || 'password123', user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name, location: user.location }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Pickup Requests
app.get('/api/pickuprequests', authenticate, async (req: Request, res: Response) => {
  try {
    let query = {};
    if ((req as any).user.role === 'resident') query = { residentId: (req as any).user.id };
    else if ((req as any).user.role === 'psp') query = { operatorId: (req as any).user.id };

    const requests = await PickupRequestModel.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/pickuprequests', authenticate, authorize(['resident']), async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById((req as any).user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pspUser = await UserModel.findOne({ role: 'psp', location: user.location });

    const newRequest = new PickupRequestModel({
      ...req.body,
      resident: user._id,
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
      location: newRequest.location.toString()
    });

    await new ActivityLogModel({ userId: user._id, action: 'CREATE_REQUEST', details: `New ${req.body.wasteType} request created.` }).save();

    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/pickuprequests/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const updated = await PickupRequestModel.findByIdAndUpdate(req.params.id, { 
      status: req.body.status, 
      updatedAt: new Date() 
    }, { new: true }).populate('resident');
    
    if (updated && updated.resident) {
      const resUser = updated.resident as any;
      await sendPickupNotification(resUser.email, resUser.name, {
        status: updated.status,
        wasteType: updated.wasteType,
        scheduledDate: updated.scheduledDate,
        location: updated.location.toString()
      });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Admin: Zones
app.get('/api/zones', async (req: Request, res: Response) => {
  const zones = await ZoneModel.find();
  res.json(zones);
});

app.post('/api/zones', authenticate, authorize(['admin']), async (req: Request, res: Response) => {
  const zone = new ZoneModel(req.body);
  await zone.save();
  res.status(201).json(zone);
});

// 5. Activity Logs (Admin only)
app.get('/api/activitylogs', authenticate, authorize(['admin']), async (req: Request, res: Response) => {
  const logs = await ActivityLogModel.find().populate('userId', 'name email').sort({ timestamp: -1 });
  res.json(logs);
});

import { GoogleGenerativeAI } from '@google/generative-ai';

// --- AI Service Proxy ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

app.post('/api/ai/waste-tips', authenticate, async (req, res) => {
    try {
        const { wasteType } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Provide 1 short, actionable tip for residents in Ibadan, Nigeria to better manage ${wasteType} waste to prevent drainage blockage and flooding. Keep it friendly and localized. (Limit: 30 words)`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ tip: text });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate waste management tips.' });
    }
});

app.post('/api/ai/analyze-image', authenticate, async (req, res) => {
    try {
        const { image } = req.body; // base64 encoded image
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const prompt = "Identify the waste in this image. Provide: 1. Waste Category (General, Recyclable, Organic, Hazardous, Construction). 2. Specific disposal advice for a resident in Ibadan. 3. Environmental impact if dumped illegally in a gutter. Return in JSON format.";
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: "image/jpeg"
            }
        };
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        res.json(JSON.parse(text));
    } catch (error) {
        res.status(500).json({ message: 'Failed to analyze waste image.' });
    }
});

app.post('/api/ai/generate-sms', authenticate, async (req, res) => {
    try {
        const { type, data } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Generate a short, professional SMS notification (max 140 chars) for a waste management app in Ibadan. 
    Context: ${type}. Details: ${JSON.stringify(data)}. 
    Include 'Waste Up Ibadan'.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ content: text });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate SMS content.' });
    }
});

app.post('/api/ai/generate-email', authenticate, async (req, res) => {
    try {
        const { type, data } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        let prompt = "";
        if (type === 'PASSWORD_RESET') {
            prompt = `Generate a warm, professional email message for a password reset for a Waste Up Ibadan user named ${data.name}. (Limit: 50 words)`;
        } else {
            prompt = `Generate a confirmation email message for a ${data.wasteType} pickup request in Ibadan for ${data.name}. Location: ${data.location}. Mention 'Waste Up Ibadan' and 'Clean Oyo'. (Limit: 60 words)`;
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ content: text });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate email content.' });
    }
});

app.post('/api/ai/optimize-route', authenticate, async (req, res) => {
    try {
        const { locations } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Suggest an efficient waste collection route for the following locations in Ibadan, Nigeria: ${locations.map((l: any, i: number) => `${i}: ${l}`).join(', ')}. 
      Consider traffic patterns in areas like Challenge, Dugbe, and Iwo Road. 
      Return the optimized order by their original index.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json(JSON.parse(text));
    } catch (error) {
        res.status(500).json({ message: 'Failed to optimize route.' });
    }
});

// Start Server
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 Waste Up Backend running on port ${PORT}`);
    console.log(`📧 System notifications configured for: ${SYSTEM_EMAIL}`);
  });
}

export default app;