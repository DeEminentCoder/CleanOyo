
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

// Backend Configuration
const API_URL = 'http://localhost:5000/api'; 
const USE_MOCK = true; 

const STORAGE_KEYS = {
  USERS: 'waste_up_db_users',
  REQUESTS: 'waste_up_db_requests',
  LOGS: 'waste_up_db_logs',
  OPERATORS: 'waste_up_db_operators'
};

const SYSTEM_CONTACT = "simeonkenny66@gmail.com";

class ApiService {
  private getHeaders() {
    const token = localStorage.getItem('waste_up_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // --- Mock Helpers ---
  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- API Methods ---

  async getUsers(): Promise<User[]> {
    if (!USE_MOCK) {
       try {
         const response = await fetch(`${API_URL}/users`, { headers: this.getHeaders() });
         if (response.ok) return await response.json();
       } catch (e) { console.warn('API Unavailable'); }
    }
    return this.getData<User>(STORAGE_KEYS.USERS);
  }

  async getRequests(userId?: string, role?: UserRole): Promise<PickupRequest[]> {
    if (!USE_MOCK) {
      try {
        const response = await fetch(`${API_URL}/pickuprequests`, { headers: this.getHeaders() });
        if (response.ok) return await response.json();
      } catch (e) { console.warn('API Unavailable, using fallback storage'); }
    }

    const all = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    if (!userId || role === UserRole.ADMIN) return all;
    if (role === UserRole.RESIDENT) return all.filter(r => r.residentId === userId);
    if (role === UserRole.PSP_OPERATOR) return all.filter(r => r.operatorId === userId);
    return [];
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (!USE_MOCK) {
       try {
         const response = await fetch(`${API_URL}/activitylogs`, { headers: this.getHeaders() });
         if (response.ok) return await response.json();
       } catch (e) { console.warn('API Unavailable'); }
    }
    return this.getData<ActivityLog>(STORAGE_KEYS.LOGS);
  }

  async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    const allLogs = await this.getActivityLogs();
    return allLogs.filter(log => log.userId === userId);
  }

  async createRequest(resident: User, data: Partial<PickupRequest>): Promise<PickupRequest> {
    const requests = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    const allUsers = this.getData<User>(STORAGE_KEYS.USERS);
    const availableOpUser = allUsers.find(u => 
      u.role === UserRole.PSP_OPERATOR && 
      u.location === resident.location && 
      (u.availability !== false)
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

    this.setData(STORAGE_KEYS.REQUESTS, [newRequest, ...requests]);
    await this.logActivity(resident.id, 'CREATE_PICKUP', `New ${newRequest.wasteType} request created for ${newRequest.location}.`);
    
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

    const oldStatus = requests[index].status;
    requests[index].status = status;
    requests[index].updatedAt = new Date().toISOString();
    this.setData(STORAGE_KEYS.REQUESTS, requests);

    await this.logActivity(userId, 'UPDATE_STATUS', `Request ID #${requestId.slice(-6)} status updated from ${oldStatus} to ${status}`);
    notificationService.sendSms('STATUS_UPDATE', '08000000000', { status });
  }

  saveUser(user: User) {
    const users = this.getData<User>(STORAGE_KEYS.USERS);
    const existingIndex = users.findIndex(u => u.email === user.email);
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.setData(STORAGE_KEYS.USERS, users);
    this.logActivity(user.id, 'UPDATE_PROFILE' as any, `User ${user.name} details updated.`);
  }

  getUserByEmail(email: string): User | undefined {
    const users = this.getData<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async logActivity(userId: string, action: string, details: string) {
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

  seedDatabase() {
    if (this.getData(STORAGE_KEYS.USERS).length === 0) {
      const users: User[] = [
        { id: 'admin-1', name: 'Admin User', email: SYSTEM_CONTACT, phone: '08000000001', role: UserRole.ADMIN, location: 'Dugbe', password: 'password123' },
        { id: 'psp-1', name: 'CleanOyo Ltd', email: 'ops@cleanoyo.ng', phone: '08023456789', role: UserRole.PSP_OPERATOR, location: 'Bodija', availability: true, password: 'password123' },
        { id: 'res-1', name: 'Ayo Balogun', email: 'ayo@mail.ng', phone: '08012345678', role: UserRole.RESIDENT, location: 'Bodija', password: 'password123' }
      ];
      this.setData(STORAGE_KEYS.USERS, users);
      this.logActivity('SYSTEM', 'DATABASE_SEED', 'System initial records successfully populated for Ibadan Pilot.');
    }
  }
}

export const apiService = new ApiService();
