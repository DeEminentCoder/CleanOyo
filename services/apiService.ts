
import { 
  User, 
  UserRole, 
  PickupRequest, 
  PickupStatus, 
  WasteType, 
  ActivityLog, 
  Priority,
  NotificationRecord
} from '../types';
import { notificationService } from './notificationService';

const STORAGE_KEYS = {
  USERS: 'waste_up_db_users',
  REQUESTS: 'waste_up_db_requests',
  LOGS: 'waste_up_db_logs',
  NOTIFICATIONS: 'waste_up_db_notifications'
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

  async getUsers(): Promise<User[]> {
    return this.getData<User>(STORAGE_KEYS.USERS);
  }

  async getRequests(userId?: string, role?: UserRole): Promise<PickupRequest[]> {
    const all = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    if (!userId || role === UserRole.ADMIN) return all;
    if (role === UserRole.RESIDENT) return all.filter(r => r.residentId === userId);
    if (role === UserRole.PSP_OPERATOR) return all.filter(r => r.operatorId === userId);
    return [];
  }

  async getNotifications(userId: string): Promise<NotificationRecord[]> {
    const all = this.getData<NotificationRecord>(STORAGE_KEYS.NOTIFICATIONS);
    return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.getData<ActivityLog>(STORAGE_KEYS.LOGS).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    const all = this.getData<ActivityLog>(STORAGE_KEYS.LOGS);
    return all.filter(l => l.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async clearNotifications(userId: string) {
    const all = this.getData<NotificationRecord>(STORAGE_KEYS.NOTIFICATIONS);
    const filtered = all.filter(n => n.userId !== userId);
    this.setData(STORAGE_KEYS.NOTIFICATIONS, filtered);
  }

  private async saveNotification(userId: string, message: string, type: string, medium: 'SMS' | 'EMAIL' | 'SYSTEM' = 'SYSTEM') {
    const all = this.getData<NotificationRecord>(STORAGE_KEYS.NOTIFICATIONS);
    const newNote: NotificationRecord = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      message,
      type,
      timestamp: new Date().toISOString(),
      medium,
      isRead: false
    };
    this.setData(STORAGE_KEYS.NOTIFICATIONS, [newNote, ...all].slice(0, 100));
  }

  async createRequest(resident: User, data: Partial<PickupRequest>): Promise<PickupRequest> {
    const requests = this.getData<PickupRequest>(STORAGE_KEYS.REQUESTS);
    const allUsers = this.getData<User>(STORAGE_KEYS.USERS);
    
    let operator = allUsers.find(u => u.id === data.operatorId && u.role === UserRole.PSP_OPERATOR);
    
    if (!operator) {
      operator = allUsers.find(u => 
        u.role === UserRole.PSP_OPERATOR && 
        u.location === resident.location && 
        (u.availability !== false)
      );
    }

    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      residentId: resident.id,
      residentName: resident.name,
      location: resident.location,
      houseNumber: data.houseNumber || '',
      streetName: data.streetName || '',
      landmark: data.landmark || '',
      contactPhone: data.contactPhone || resident.phone,
      coordinates: data.coordinates,
      wasteType: data.wasteType || WasteType.GENERAL,
      priority: data.priority || Priority.MEDIUM,
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      status: PickupStatus.PENDING,
      operatorId: operator?.id,
      operatorName: operator?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes
    };

    this.setData(STORAGE_KEYS.REQUESTS, [newRequest, ...requests]);
    await this.logActivity(resident.id, 'CREATE_PICKUP', `New ${newRequest.priority} request for ${newRequest.streetName}.`);
    
    const resMsg = `Your ${newRequest.wasteType} pickup request at ${newRequest.streetName} is confirmed.`;
    await this.saveNotification(resident.id, resMsg, 'PICKUP_CONFIRMATION', 'EMAIL');
    notificationService.sendEmail('PICKUP_CONFIRMATION', resident.email, {
      name: resident.name,
      wasteType: newRequest.wasteType,
      location: `${newRequest.houseNumber} ${newRequest.streetName}`,
      status: 'CONFIRMED'
    });

    if (operator) {
      const pspMsg = `New ${newRequest.priority} priority job assigned: ${newRequest.residentName} at ${newRequest.streetName}.`;
      await this.saveNotification(operator.id, pspMsg, 'NEW_JOB_ASSIGNMENT', 'SMS');
      notificationService.sendSms('CONFIRMATION', operator.phone, {
        status: 'ASSIGNED',
        wasteType: newRequest.wasteType,
        residentName: newRequest.residentName
      });
    }

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

    const updatedReq = requests[index];
    const allUsers = this.getData<User>(STORAGE_KEYS.USERS);
    const resident = allUsers.find(u => u.id === updatedReq.residentId);

    await this.logActivity(userId, 'UPDATE_STATUS', `Job #${requestId.slice(-6)}: ${oldStatus} -> ${status}`);
    
    if (resident) {
        let msg = `Waste Up Update: Your pickup status is now ${status}.`;
        if (status === PickupStatus.ON_THE_WAY) msg = `Driver from ${updatedReq.operatorName} is on the way to your address!`;
        if (status === PickupStatus.COMPLETED) msg = `Job completed! Thank you for helping keep Ibadan clean.`;
        
        await this.saveNotification(resident.id, msg, 'STATUS_UPDATE', 'SMS');
        notificationService.sendSms('STATUS_UPDATE', resident.phone, { 
            status,
            message: msg
        });
    }
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

  saveUser(user: User) {
    const users = this.getData<User>(STORAGE_KEYS.USERS);
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.setData(STORAGE_KEYS.USERS, users);
  }

  getUserByEmail(email: string): User | undefined {
    const users = this.getData<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  seedDatabase() {
    if (this.getData(STORAGE_KEYS.USERS).length === 0) {
      const users: User[] = [
        { id: 'admin-1', name: 'Admin User', email: SYSTEM_CONTACT, phone: '08000000001', role: UserRole.ADMIN, location: 'Dugbe', password: 'password123', coordinates: { lat: 7.3887, lng: 3.8962 } },
        { id: 'psp-1', name: 'CleanOyo Ltd', email: 'ops@cleanoyo.ng', phone: '08023456789', role: UserRole.PSP_OPERATOR, location: 'Bodija', availability: true, password: 'password123', coordinates: { lat: 7.4443, lng: 3.9187 } },
        { id: 'psp-2', name: 'EcoWaste Ibadan', email: 'ops@ecoib.ng', phone: '08011122233', role: UserRole.PSP_OPERATOR, location: 'Challenge', availability: true, password: 'password123', coordinates: { lat: 7.3487, lng: 3.8762 } },
        { id: 'res-1', name: 'Ayo Balogun', email: 'ayo@mail.ng', phone: '08012345678', role: UserRole.RESIDENT, location: 'Bodija', password: 'password123', coordinates: { lat: 7.4520, lng: 3.9210 } }
      ];
      this.setData(STORAGE_KEYS.USERS, users);
    }
  }
}

export const apiService = new ApiService();
apiService.seedDatabase();