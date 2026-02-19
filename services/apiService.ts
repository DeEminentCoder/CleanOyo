// services/apiService.ts
import { User } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const apiService = {
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },
};