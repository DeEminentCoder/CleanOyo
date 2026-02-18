import express from 'express';
import serverless from 'serverless-http';
import { connectDB } from '../../backend/db';
import authRoutes from '../../backend/routes/auth';
import pickupRoutes from '../../backend/routes/pickup';
import pspRoutes from '../../backend/routes/psp';
import zoneRoutes from '../../backend/routes/zone';

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/psp', pspRoutes);
app.use('/api/zones', zoneRoutes);

export const handler = serverless(app);