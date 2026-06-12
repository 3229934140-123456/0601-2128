import { create } from 'zustand';
import { User } from '@/types';
import { mockApi } from '@/mock';

interface AuthState {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, role: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: mockApi.getCurrentUser(),
  user: mockApi.getCurrentUser(),
  isAuthenticated: !!mockApi.getCurrentUser(),

  checkAuth: () => {
    const currentUser = mockApi.getCurrentUser();
    set({
      currentUser,
      user: currentUser,
      isAuthenticated: !!currentUser,
    });
  },

  login: async (phone: string, role: 'user' | 'admin') => {
    const users = mockApi.getUsers();
    const user = users.find(u => u.phone === phone && u.role === role);
    
    if (user) {
      if (user.isBlacklisted && role === 'user') {
        return false;
      }
      mockApi.setCurrentUser(user);
      set({ currentUser: user, user, isAuthenticated: true });
      return true;
    }
    
    if (role === 'user') {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: '用户' + phone.slice(-4),
        idCard: '',
        phone,
        role: 'user',
        isBlacklisted: false,
        createdAt: new Date(),
      };
      const updatedUsers = [...users, newUser];
      mockApi.saveUsers(updatedUsers);
      mockApi.setCurrentUser(newUser);
      set({ currentUser: newUser, user: newUser, isAuthenticated: true });
      return true;
    }
    
    return false;
  },

  logout: () => {
    mockApi.setCurrentUser(null);
    set({ currentUser: null, user: null, isAuthenticated: false });
  },

  updateUser: (user: User) => {
    const users = mockApi.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      mockApi.saveUsers(users);
      mockApi.setCurrentUser(user);
      set({ currentUser: user, user, isAuthenticated: true });
    }
  },
}));
