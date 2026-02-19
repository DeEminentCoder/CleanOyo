
import { User, UserRole } from '../types';
import { notificationService } from './notificationService';
import { apiService } from './apiService';

const TOKEN_KEY = 'waste_up_auth_token';
const JWT_SECRET = 'wasteup_secret_key_ibadan';

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
  login: async (email: string, role: UserRole, password?: string): Promise<{ user: User; token: string }> => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem(TOKEN_KEY, token);
    return { user, token };
  },

  register: async (details: { name: string; email: string; phone: string; role: UserRole; location?: string; password?: string }): Promise<{ message: string }> => {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  },

  updateToken: (user: User) => {
    const token = generateMockJWT(user);
    localStorage.setItem(TOKEN_KEY, token);
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const user = apiService.getUserByEmail(email);
    if (!user) {
      throw new Error("Reset Failed: Account not found.");
    }
    await notificationService.sendEmail('PASSWORD_RESET', email, {
      name: user.name
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
    return payload;
  },

  getToken: () => localStorage.getItem(TOKEN_KEY)
};