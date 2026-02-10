
import { User, UserRole } from '../types';
import { notificationService } from './notificationService';
import { apiService } from './apiService';

const TOKEN_KEY = 'waste_up_auth_token';

const generateMockJWT = (user: User) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ ...user, exp: Date.now() + 3600000 }));
  const signature = 'mock_signature';
  return `${header}.${payload}.${signature}`;
};

const decodeJWT = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
};

export const authService = {
  login: async (email: string, role: UserRole): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try to find user in the "database"
    let user = apiService.getUserByEmail(email);

    if (!user) {
      // Create a temporary user if not found (for demo/fallback purposes)
      user = {
        id: role === UserRole.RESIDENT ? 'res-1' : (role === UserRole.PSP_OPERATOR ? 'psp-1' : 'admin-1'),
        name: role === UserRole.RESIDENT ? 'Ayo Balogun' : (role === UserRole.PSP_OPERATOR ? 'CleanOyo Operator' : 'Oyo Waste Admin'),
        role: role,
        location: 'Ibadan North',
        phone: '08012345678',
        email: email
      };
      apiService.saveUser(user);
    }

    const token = generateMockJWT(user);
    localStorage.setItem(TOKEN_KEY, token);
    
    return { user, token };
  },

  register: async (details: { name: string; email: string; phone: string; role: UserRole }): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: `user-${Date.now()}`,
      name: details.name,
      email: details.email,
      phone: details.phone,
      role: details.role,
      location: 'Bodija' // Default for Ibadan residents
    };

    apiService.saveUser(user);
    const token = generateMockJWT(user);
    localStorage.setItem(TOKEN_KEY, token);

    return { user, token };
  },

  updateToken: (user: User) => {
    const token = generateMockJWT(user);
    localStorage.setItem(TOKEN_KEY, token);
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await notificationService.sendEmail('PASSWORD_RESET', email, {
      name: 'Valued User',
      resetLink: 'https://wasteup.oyo.gov.ng/reset-password?token=mock_token'
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload || payload.exp < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      location: payload.location,
      phone: payload.phone,
      email: payload.email,
      avatar: payload.avatar
    };
  },

  getToken: () => localStorage.getItem(TOKEN_KEY)
};
