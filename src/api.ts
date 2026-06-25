// API Configuration and Helper Functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add auth token if available
  const headers = options.headers || {};
  const token = localStorage.getItem('token');
  
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const API_ENDPOINTS = {
  login: '/api/login',
  register: '/api/register',
  courseCatalog: '/api/courses',
  courses: (userId: number) => `/api/users/${userId}/courses`,
  grades: (studentId: number) => `/api/users/${studentId}/grades`,
  receipts: (userId: number) => `/api/receipts?userId=${userId}`,
  receipt: (receiptId: number) => `/api/receipts/${receiptId}`,
  courseMaterials: (courseId: number) => `/api/courses/${courseId}/materials`,
  courseFeedback: (courseId: number) => `/api/courses/${courseId}/feedback`,
  courseStudents: (courseId: number) => `/api/courses/${courseId}/students`,
  users: '/api/users',
  adminReceipts: '/api/admin/receipts',
};
