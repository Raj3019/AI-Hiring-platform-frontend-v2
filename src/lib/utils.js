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

export const getMissingProfileFields = (user) => {
  if (!user) return [];
  const requiredFields = [
    'fullName', 'phone', 'dateOfBirth', 'gender',
    'currentCity', 'state', 'country', 'zipCode', 'resumeFileURL'
  ];
  const missing = [];

  // Check top-level strings
  for (const field of requiredFields) {
    const value = user[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  }

  // Check Arrays
  if (!user.skills || user.skills.length === 0) missing.push('skills');
  if (!user.languages || user.languages.length === 0) missing.push('languages');

  // Check Education
  if (!user.education?.tenth?.schoolName) missing.push('education.tenth');
  if (!user.education?.graduation?.degree) missing.push('education.graduation');

  // Check Job Preferences
  if (!user.jobPreferences?.jobType || user.jobPreferences.jobType.length === 0) missing.push('jobPreferences.jobType');
  if (!user.jobPreferences?.workMode || user.jobPreferences.workMode.length === 0) missing.push('jobPreferences.workMode');

  return missing;
};
