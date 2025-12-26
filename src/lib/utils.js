import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const cookieStorage = {
  getItem: (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      try {
        const content = parts.pop().split(';').shift();
        return decodeURIComponent(content);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  setItem: (name, value) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  },
  removeItem: (name) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

export const scrubStorage = () => {
  if (typeof document === 'undefined') return;

  // Clear known cookies
  const cookies = ['auth-storage', 'data-storage', 'token', 'authToken', 'jwt'];
  cookies.forEach(name => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    // Also try clearing with different paths just in case
    document.cookie = `${name}=; path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });

  // Clear localStorage
  if (typeof localStorage !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('token') || key.includes('data')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('data-storage');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
  }

  // Clear sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
};

/**
 * Robust check if the user might be authenticated.
 * Checks for actual token cookies OR a persisted authenticated state in auth-storage.
 */
export const hasValidAuth = () => {
  if (typeof document === 'undefined') return false;

  // 1. Check for explicit token cookies (non-httpOnly ones)
  const token = cookieStorage.getItem('token') ||
    cookieStorage.getItem('authToken') ||
    cookieStorage.getItem('jwt');
  if (token && token !== 'undefined' && token !== 'null') return true;

  // 2. Check auth-storage if it indicates a previous authenticated session
  const authStorage = cookieStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const state = parsed.state || parsed;
      // ONLY return true if the persisted state says we ARE authenticated
      return !!(state && state.isAuthenticated && state.user);
    } catch (e) {
      return false;
    }
  }

  return false;
};

/**
 * Proactively retrieve stored user info/role from cookies before Zustand completely hydrates.
 * Returns the user object or null.
 */
export const getStoredAuth = () => {
  if (typeof document === 'undefined') return null;
  const authStorage = cookieStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const state = parsed.state || parsed;
      if (state && state.isAuthenticated && state.user) {
        return state.user;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getMissingProfileFields = (user) => {
  if (!user) return [];

  const commonRequired = [
    'fullName', 'headline', 'phone', 'dateOfBirth', 'gender',
    'currentCity', 'state', 'country', 'zipCode', 'profilePicture'
  ];

  const missing = [];

  // 1. Check Common Fields
  for (const field of commonRequired) {
    const value = user[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  }

  // 2. Role Specific Checks
  if (user.role === 'candidate' || user.role === 'Employee') {
    // Candidate/Employee required
    if (!user.resumeFileURL) missing.push('resumeFileURL');
    if (!user.skills || user.skills.length === 0) missing.push('skills');
    if (!user.languages || user.languages.length === 0) missing.push('languages');
    if (!user.education?.tenth?.schoolName) missing.push('education.tenth');
    if (!user.education?.graduation?.degree) missing.push('education.graduation');
    if (!user.jobPreferences?.jobType || user.jobPreferences.jobType.length === 0) missing.push('jobPreferences.jobType');
    if (!user.jobPreferences?.workMode || user.jobPreferences.workMode.length === 0) missing.push('jobPreferences.workMode');
  } else if (user.role === 'recruiter' || user.role === 'Recuter') {
    // Recruiter required
    // if (!user.currentRole) missing.push('currentRole');
    // if (!user.currentEmployer) missing.push('currentEmployer');
    if (!user.resumeFileURL) missing.push('resumeFileURL');
    if (!user.skills || user.skills.length === 0) missing.push('skills');
    if (!user.education?.graduation?.degree) missing.push('education.graduation');
  }

  return missing;
};

export const formatDate = (date) => {
  if (!date) return 'Not Specified';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    // Format: 25 Dec 2024
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return date;
  }
};
