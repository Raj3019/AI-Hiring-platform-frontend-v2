import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get the request URL to check if it's a login/signup request
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/login') || requestUrl.includes('/signup');

    if (error.response?.status === 401 && !isAuthRequest) {
      // Don't auto-logout for profile requests - might be a backend route mismatch
      const isProfileRequest = requestUrl.includes('/profile');

      if (!isProfileRequest) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Employee API endpoints
export const employeeAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/employee/login', { email, password });
    return response.data;
  },

  signup: async (email, password, confirmPassword) => {
    const response = await api.post('/api/employee/signup', { email, password, confirmPassword });
    return response.data;
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/employee/profile');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Fallback for potential route variations
        const response = await api.get('/api/candidate/profile');
        return response.data;
      }
      throw error;
    }
  },

  logout: async () => {
    const response = await api.post('/api/employee/logout');
    return response.data;
  },
  updateProfilePicture: async (formData) => {
    const response = await api.post('/api/employee/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateResume: async (formData) => {
    const response = await api.post('/api/employee/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await api.put(`/api/employee/profile/${id}`, data);
    return response.data;
  },
};

// Recruiter API endpoints (note: using /recuter/ as per backend)
export const recruiterAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/recuter/login', { email, password });
    return response.data;
  },

  signup: async (email, password, confirmPassword) => {
    const response = await api.post('/api/recuter/signup', { email, password, confirmPassword });
    return response.data;
  },

  getProfile: async () => {
    try {
      // Try the documented endpoint with typo
      const response = await api.get('/api/recuter/profile');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Fallback to correct spelling just in case
        const response = await api.get('/api/recruiter/profile');
        return response.data;
      }
      throw error;
    }
  },

  logout: async () => {
    const response = await api.post('/api/recuter/logout');
    return response.data;
  },
  updateProfile: async (id, data) => {
    const response = await api.put(`/api/recuter/profile/${id}`, data);
    return response.data;
  },

  updateProfilePicture: async (formData) => {
    const response = await api.post('/api/recuter/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Jobs API endpoints
export const jobsAPI = {
  getAll: async () => {
    const response = await api.get('/api/jobs');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/job/${id}`);
    return response.data;
  },

  scoreResume: async (id, formData) => {
    const response = await api.post(`/api/job/score/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  apply: async (id, formData) => {
    const response = await api.post(`/api/job/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/job/${id}`, data);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/job/create', data);
    return response.data;
  },
};

export default api;
