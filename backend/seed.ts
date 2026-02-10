
// backend/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel, ZoneModel, PSPOperatorModel, PickupRequestModel } from './models';

export const seedData = async () => {
  try {
    // Check if database is already seeded
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      console.log('[SEED] Database already has data. Skipping seed.');
      return;
    }

    console.log('[SEED] Starting database seeding for Ibadan Pilot...');

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new UserModel({
      name: 'Oyo State Admin',
      email: 'simeonkenny66@gmail.com',
      phone: '08000000001',
      role: 'admin',
      passwordHash: adminPassword,
      location: 'Dugbe'
    });
    await admin.save();

    // 2. Create Zones
    const zones = [
      { name: 'Bodija', floodRisk: 'Low', coordinates: [[[3.91, 7.44], [3.92, 7.44], [3.92, 7.45], [3.91, 7.45], [3.91, 7.44]]] },
      { name: 'Akobo', floodRisk: 'Medium', coordinates: [[[3.94, 7.43], [3.95, 7.43], [3.95, 7.44], [3.94, 7.44], [3.94, 7.43]]] },
      { name: 'Challenge', floodRisk: 'High', coordinates: [[[3.87, 7.34], [3.88, 7.34], [3.88, 7.35], [3.87, 7.35], [3.87, 7.34]]] },
    ];

    for (const z of zones) {
      await new ZoneModel({
        name: z.name,
        floodRisk: z.floodRisk,
        boundaries: { type: 'Polygon', coordinates: z.coordinates }
      }).save();
    }

    // 3. Create PSP Operators
    const pspPassword = await bcrypt.hash('psp123', 10);
    const psp1 = new UserModel({
      name: 'CleanOyo Ltd',
      email: 'ops@cleanoyo.ng',
      phone: '08023456789',
      role: 'psp',
      passwordHash: pspPassword,
      location: 'Bodija'
    });
    await psp1.save();
    await new PSPOperatorModel({ userId: psp1._id, serviceZone: 'Bodija', fleetSize: 12, efficiency: 94 }).save();

    // 4. Create Residents
    const resPassword = await bcrypt.hash('res123', 10);
    const res1 = new UserModel({
      name: 'Ayo Balogun',
      email: 'ayo@mail.ng',
      phone: '08012345678',
      role: 'resident',
      passwordHash: resPassword,
      location: 'Bodija'
    });
    await res1.save();

    // 5. Create Sample Pickup Request
    await new PickupRequestModel({
      residentId: res1._id,
      residentName: res1.name,
      operatorId: psp1._id,
      location: 'Plot 4, Bodija Estate',
      wasteType: 'General Household',
      scheduledDate: new Date(),
      status: 'Scheduled',
      notes: 'Pilot request'
    }).save();

    console.log('[SEED] Database seeding completed successfully.');
  } catch (error) {
    console.error('[SEED ERROR]', error);
  }
};
