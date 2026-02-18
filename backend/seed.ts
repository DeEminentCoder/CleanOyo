
// backend/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel, ZoneModel, PSPOperatorModel, PickupRequestModel, UserRole } from './models.js';

export const seedData = async () => {
  try {
    console.log('[SEED] Verifying database integrity on Atlas...');

    // Count existing documents for verification
    const counts = {
      users: await UserModel.countDocuments(),
      zones: await ZoneModel.countDocuments(),
      requests: await PickupRequestModel.countDocuments()
    };

    console.log(`[SEED] Current Atlas Data: ${counts.users} Users, ${counts.zones} Zones, ${counts.requests} Requests`);

    if (counts.users > 0) {
      console.log('[SEED] Data already exists. Skipping initial population.');
      return;
    }

    console.log('[SEED] Starting initial population for CleanOyo database...');

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new UserModel({
      name: 'Oyo State Admin',
      email: 'simeonkenny66@gmail.com',
      phone: '08000000001',
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
      location: 'Dugbe'
    });
    await admin.save();
    console.log('✅ Created Admin Account');

    // 2. Create Zones
    const zones = [
      { name: 'Bodija', floodRisk: 'Low', coordinates: [[[3.91, 7.44], [3.92, 7.44], [3.92, 7.45], [3.91, 7.45], [3.91, 7.44]]] },
      { name: 'Akobo', floodRisk: 'Medium', coordinates: [[[3.94, 7.43], [3.95, 7.43], [3.95, 7.44], [3.94, 7.44], [3.94, 7.43]]] },
      { name: 'Challenge', floodRisk: 'High', coordinates: [[[3.87, 7.34], [3.88, 7.34], [3.88, 7.35], [3.87, 7.35], [3.87, 7.34]]] },
    ];

    for (const zone of zones) {
      await new ZoneModel({
        name: zone.name,
        floodRisk: zone.floodRisk,
        boundaries: { type: 'Polygon', coordinates: zone.coordinates }
      }).save();
    }
    console.log(`✅ Created ${zones.length} Zones`);

    // 3. Create PSP Operators
    const pspPassword = await bcrypt.hash('psp123', 10);
    const psp1 = new UserModel({
      name: 'CleanOyo Ltd',
      email: 'ops@cleanoyo.ng',
      phone: '08023456789',
      role: UserRole.PSP_OPERATOR,
      passwordHash: pspPassword,
      location: 'Bodija'
    });
    await psp1.save();
    await new PSPOperatorModel({ userId: psp1._id, serviceZone: 'Bodija', fleetSize: 12, efficiency: 94 }).save();
    console.log('✅ Created Initial PSP Profile');

    // 4. Create Residents
    const resPassword = await bcrypt.hash('res123', 10);
    const res1 = new UserModel({
      name: 'Ayo Balogun',
      email: 'ayo@mail.ng',
      phone: '08012345678',
      role: UserRole.RESIDENT,
      passwordHash: resPassword,
      location: 'Bodija'
    });
    await res1.save();
    console.log('✅ Created Initial Resident Account');

    // 5. Create Sample Pickup Request
    await new PickupRequestModel({
      residentId: res1._id,
      residentName: res1.name,
      operatorId: psp1._id,
      location: 'Plot 4, Bodija Estate',
      wasteType: 'General Household',
      scheduledDate: new Date(),
      status: 'Scheduled',
      notes: 'Initial seed request for Atlas testing'
    }).save();
    console.log('✅ Created Sample Pickup Document');

    console.log('[SEED] Seeding successfully confirmed on MongoDB Atlas.');
  } catch (error) {
    console.error('[SEED ERROR] Failed to populate Atlas:', error);
  }
};