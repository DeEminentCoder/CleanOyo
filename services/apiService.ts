
import { 
  User, 
  UserRole, 
  PickupRequest, 
  PickupStatus, 
  WasteType, 
  ActivityLog, 
  PSPOperatorProfile 
} from '../types';
import { notificationService } from './notificationService';

// Mock "MongoDB" Collections in LocalStorage
const STORAGE_KEYS = {
  USERS: 'waste_up_db_users',
  REQUESTS: 'waste_up_db_requests',
  LOGS: 'waste_up_db_logs',
  OPERATORS: 'waste_up_db_operators'
};

const SYSTEM_CONTACT = "simeonkenny66@gmail.com";

class ApiService {
  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- User Management ---
  saveUser(user: User) {
    const users = this.getData<User>(STORAGE_KEYS.USERS);
    const existingIndex = users.findIndex(u => u.email === user.email);
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.setData(STORAGE_KEYS.USERS, users);
    
    // If it's a PSP operator, sync with the operators collection for assignment logic
    if (user.role === UserRole.PSP_OPERATOR) {
      const operators = this.getData<PSPOperatorProfile>(STORAGE_KEYS.OPERATORS);
      const opIndex = operators.findIndex(op => op.userId === user.id);
      if (opIndex > -1) {
        operators[opIndex].availability = user.availability ?? true;
        operators[opIndex].serviceZone = user.location;
        this.setData(STORAGE_KEYS.OPERATORS, operators);
      }
    }
  }

  getUserByEmail(email: string): User | undefined {
    const users = this.getData<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Activity Logging ---
  private async logActivity(userId: string, action: string, details: string) {
    const logs = this.getData<ActivityLog>(STORAGE_KEYS.LOGS);
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.setData(STORAGE_KEYS.LOGS, [newLog, ...logs]);
  }

  // --- Pickup Requests (Mongoose-like) ---
  async getRequests(userId?: string, role?: UserRole): Promise<PickupRequest[]> {
    const all = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    if (!userId || role === UserRole.ADMIN) return all;
    if (role === UserRole.RESIDENT) return all.filter(r => r.residentId === userId);
    if (role === UserRole.PSP_OPERATOR) return all.filter(r => r.operatorId === userId);
    return [];
  }

  async createRequest(resident: User, data: Partial<PickupRequest>): Promise<PickupRequest> {
    const requests = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    
    // Improved assignment logic: check for both the profile and the current user's availability status
    const allUsers = this.getData<User>(STORAGE_KEYS.USERS);
    const availableOpUser = allUsers.find(u => 
      u.role === UserRole.PSP_OPERATOR && 
      u.location === resident.location && 
      (u.availability !== false) // default to true if undefined
    );

    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      residentId: resident.id,
      residentName: resident.name,
      location: data.location || resident.location,
      wasteType: data.wasteType || WasteType.GENERAL,
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      status: PickupStatus.PENDING,
      operatorId: availableOpUser?.id,
      operatorName: availableOpUser?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes
    };

    const updated = [newRequest, ...requests];
    this.setData(STORAGE_KEYS.REQUESTS, updated);

    await this.logActivity(resident.id, 'CREATE_PICKUP', `New ${newRequest.wasteType} request created.`);
    
    notificationService.sendEmail('PASSWORD_RESET' as any, resident.email, {
      subject: "Pickup Scheduled",
      body: `Hello ${resident.name}, your ${newRequest.wasteType} pickup is scheduled.`,
      systemContact: SYSTEM_CONTACT
    });

    return newRequest;
  }

  async updateRequestStatus(requestId: string, userId: string, status: PickupStatus): Promise<void> {
    const requests = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return;

    requests[index].status = status;
    requests[index].updatedAt = new Date().toISOString();
    this.setData(STORAGE_KEYS.REQUESTS, requests);

    await this.logActivity(userId, 'UPDATE_STATUS', `Request ${requestId} status changed to ${status}`);
    notificationService.sendSms('STATUS_UPDATE', '08000000000', { status });
  }

  seedDatabase() {
    if (this.getData(STORAGE_KEYS.USERS).length === 0) {
      const users: User[] = [
        { id: 'admin-1', name: 'Admin User', email: SYSTEM_CONTACT, phone: '08000000001', role: UserRole.ADMIN, location: 'Dugbe' },
        { id: 'psp-1', name: 'CleanOyo Ltd', email: 'ops@cleanoyo.ng', phone: '08023456789', role: UserRole.PSP_OPERATOR, location: 'Bodija', availability: true },
        { id: 'res-1', name: 'Ayo Balogun', email: 'ayo@mail.ng', phone: '08012345678', role: UserRole.RESIDENT, location: 'Bodija' }
      ];
      const profiles: PSPOperatorProfile[] = [
        { userId: 'psp-1', serviceZone: 'Bodija', availability: true, fleetSize: 10, efficiency: 95, assignedSubZones: ['Bodija Estate', 'Samonda'] }
      ];
      this.setData(STORAGE_KEYS.USERS, users);
      this.setData(STORAGE_KEYS.OPERATORS, profiles);
    }
  }
}

export const apiService = new ApiService();
