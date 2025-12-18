import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { employeeAPI, recruiterAPI, jobsAPI } from './api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login function - calls backend API
      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const api = role === 'recruiter' ? recruiterAPI : employeeAPI;
          const response = await api.login(email, password);

          console.log('Login response:', response);

          // Store token in localStorage - check multiple possible locations
          // Recruiter API returns token as response.data string
          // Employee API likely returns it as response.token
          let token = response.token || response.accessToken;

          if (!token && response.data) {
            if (typeof response.data === 'string') {
              token = response.data;
            } else if (response.data.token) {
              token = response.data.token;
            } else if (response.data.accessToken) {
              token = response.data.accessToken;
            }
          }

          if (token) {
            localStorage.setItem('authToken', token);
            console.log('Token stored successfully');
          } else {
            console.error('No token found in login response!', response);
            console.warn('Full response structure:', JSON.stringify(response, null, 2));
          }

          // Small delay to ensure token is stored
          await new Promise(resolve => setTimeout(resolve, 100));

          // Try to fetch user profile after successful login
          let profileData = null;
          try {
            profileData = await api.getProfile();
            console.log('Profile response:', profileData);
          } catch (profileError) {
            console.error('Profile fetch failed:', profileError);
            // Continue with basic user data if profile fetch fails
          }

          // Determine the correct role: Employee for candidates, Recuter for recruiters (matching backend typo)
          // The profile endpoint doesn't return the user type, so use the login context
          const userRole = role === 'recruiter' ? 'Recuter' : 'Employee';

          // Build user object carefully - ensure role is not overwritten
          const profileInfo = profileData?.data || {};
          // Remove any 'role' field from profile data that might be job title
          const { role: _, ...cleanProfileInfo } = profileInfo;

          const user = {
            ...cleanProfileInfo,
            email,
            role: userRole,
            isAuthenticated: true,
          };

          console.log('User object after login:', { role: user.role, email, userRole });
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Signup function - calls backend API
      signup: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const api = role === 'recruiter' ? recruiterAPI : employeeAPI;
          const response = await api.signup(name, email, password);

          // Store token in localStorage
          let token = response.token || response.accessToken;
          if (!token && response.data) {
            if (typeof response.data === 'string') {
              token = response.data;
            } else if (response.data.token) {
              token = response.data.token;
            } else if (response.data.accessToken) {
              token = response.data.accessToken;
            }
          }

          if (token) {
            localStorage.setItem('authToken', token);
          }



          // Small delay to ensure token is stored
          await new Promise(resolve => setTimeout(resolve, 100));

          // Fetch user profile after successful signup
          const profileData = await api.getProfile();

          // Determine the correct role: Employee for candidates, Recuter for recruiters
          const userRole = role === 'recruiter' ? 'Recuter' : 'Employee';

          // Build user object carefully - ensure role is not overwritten
          const profileInfo = profileData?.data || {};
          const { role: _, ...cleanProfileInfo } = profileInfo;

          const user = {
            ...cleanProfileInfo,
            name,
            email,
            role: userRole,
            isAuthenticated: true,
          };

          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Fetch profile from backend
      fetchProfile: async (role) => {
        set({ isLoading: true, error: null });
        try {
          const api = role === 'recruiter' ? recruiterAPI : employeeAPI;
          const response = await api.getProfile();

          // Preserve the original role - don't let backend override it
          const currentRole = get().user?.role;

          set((state) => ({
            user: {
              ...state.user,
              ...response.data,
              recentApplicationJob: response.recentApplicationJob,
              role: currentRole || role
            },
            isLoading: false,
          }));
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch profile.';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Logout function - calls backend API and clears token and user data
      logout: async () => {
        try {
          // Get current user role to call the correct logout endpoint
          const state = useAuthStore.getState();
          const role = state.user?.role?.toLowerCase();
          const api = (role === 'recruiter') ? recruiterAPI : employeeAPI;

          // Call logout API (don't wait for success, proceed with local logout)
          await api.logout().catch(() => { });
        } catch (error) {
          // Ignore errors since we're logging out anyway
        } finally {
          // Always clear local data
          localStorage.removeItem('authToken');
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      // Update profile (for local state updates)
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Mock Data Store for Jobs and Applications
export const useDataStore = create(
  persist(
    (set, get) => ({
      jobs: [],
      applications: [], // { jobId, candidateId, status, score }

      fetchJobs: async () => {
        try {
          const res = await jobsAPI.getAll();
          // API returns { data: [ ...jobs ] }
          set({ jobs: res.data || [] });
        } catch (e) {
          set({ jobs: [] });
        }
      },

      addJob: (job) => set((state) => ({
        jobs: [...state.jobs, { ...job, id: Math.random().toString(36).substr(2, 9), applicants: 0 }]
      })),

      applyToJob: (jobId, candidateId) => {
        const { jobs } = get();
        // Increment applicant count
        const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, applicants: j.applicants + 1 } : j);

        // Mock AI Score
        const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;

        set((state) => ({
          jobs: updatedJobs,
          applications: [...state.applications, {
            id: Math.random().toString(36).substr(2, 9),
            jobId,
            candidateId,
            status: 'Applied',
            score,
            date: new Date().toISOString()
          }]
        }));

        return score; // Return score for UI display
      }
    }),
    {
      name: 'data-storage',
    }
  )
);
