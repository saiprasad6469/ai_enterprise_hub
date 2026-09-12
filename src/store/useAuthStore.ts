import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  login: (emailOrId: string, password: string, role: 'SuperAdmin' | 'Admin' | 'Employee', department: User['department']) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'Admin' | 'Employee', department: User['department']) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,

      login: async (emailOrId: string, password: string, role: 'SuperAdmin' | 'Admin' | 'Employee', department: User['department']) => {
        set({ isLoading: true, error: null });
        
        // Format ID to email under the hood for API compatibility
        const email = emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase()}@enterprise.ai`;

        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: emailOrId, email, password, role, department }),
          });

          const data = await res.json();

          if (res.ok && data.success && data.data) {
            const { user, accessToken } = data.data;
            set({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department || department,
                status: user.status,
                avatar: user.avatar,
                joinedAt: user.createdAt,
              },
              accessToken,
              isAuthenticated: true,
              error: null,
              isLoading: false,
            });
            return true;
          } else {
            set({ error: data.message || 'Invalid email/ID or password.', isLoading: false });
            return false;
          }
        } catch (e) {
          console.error('Login error:', e);
          set({ error: 'Unable to connect to authentication server. Please try again.', isLoading: false });
          return false;
        }
      },

      signup: async (name: string, email: string, password: string, role: 'Admin' | 'Employee', department: User['department']) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, role, department }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ error: data.message || 'Registration failed.', isLoading: false });
            return false;
          }

          const { user, accessToken } = data.data;
          set({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department || 'Engineering',
              status: user.status,
              avatar: user.avatar,
              joinedAt: user.createdAt,
            },
            accessToken,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
          return true;
        } catch {
          set({ error: 'Network error. Please check your connection.', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { accessToken } = get();
        try {
          if (accessToken) {
            await fetch(`${API_BASE}/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: 'include',
            });
          }
        } catch {
          // Silent logout even on network error
        } finally {
          set({ user: null, accessToken: null, isAuthenticated: false, error: null });
        }
      },

      updateProfile: (updates: Partial<User>) => {
        set((state: AuthState) => {
          if (!state.user) return state;
          return { user: { ...state.user, ...updates } };
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ai-enterprise-auth',
      partialize: (state: AuthState) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
