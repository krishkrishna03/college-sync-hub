const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if we're in development and backend is available
const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Check backend connection first
  const isBackendAvailable = await checkBackendConnection();
  if (!isBackendAvailable) {
    throw new Error('Backend server is not running. Please start the server with: cd server && npm run dev');
  }
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string, collegeCode?: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, collegeCode }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout: () => {
    removeAuthToken();
  }
};

// Students API
export const studentsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/students?${queryParams}`);
  },

  create: async (studentData: any) => {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  bulkUpload: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/bulk-upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  update: async (id: string, studentData: any) => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  getReport: async (id: string) => {
    return apiRequest(`/students/${id}/report`);
  }
};

// Faculty API
export const facultyAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/faculty?${queryParams}`);
  },

  create: async (facultyData: any) => {
    return apiRequest('/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData),
    });
  },

  bulkUpload: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/faculty/bulk-upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  update: async (id: string, facultyData: any) => {
    return apiRequest(`/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facultyData),
    });
  },

  assignTask: async (id: string, taskData: any) => {
    return apiRequest(`/faculty/${id}/assign-task`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/faculty/${id}`, {
      method: 'DELETE',
    });
  }
};

// Tests API
export const testsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/tests?${queryParams}`);
  },

  create: async (testData: any) => {
    return apiRequest('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  assign: async (id: string, assignmentData: any) => {
    return apiRequest(`/tests/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  getResults: async (id: string, filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/tests/${id}/results?${queryParams}`);
  },

  submit: async (id: string, answers: any[], timeTaken: number) => {
    return apiRequest(`/tests/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeTaken }),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/tests/${id}`, {
      method: 'DELETE',
    });
  }
};

// Courses API
export const coursesAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/courses?${queryParams}`);
  },

  create: async (courseData: any) => {
    return apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  getById: async (id: string) => {
    return apiRequest(`/courses/${id}`);
  },

  enroll: async (id: string) => {
    return apiRequest(`/courses/${id}/enroll`, {
      method: 'POST',
    });
  },

  getEnrolledStudents: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/courses/enrolled-students?${queryParams}`);
  },

  getCompletionRate: async () => {
    return apiRequest('/courses/completion-rate');
  }
};

// Announcements API
export const announcementsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/announcements?${queryParams}`);
  },

  create: async (announcementData: any) => {
    return apiRequest('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },

  update: async (id: string, announcementData: any) => {
    return apiRequest(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  markAsRead: async (id: string) => {
    return apiRequest(`/announcements/${id}/mark-read`, {
      method: 'POST',
    });
  }
};

// Batches API
export const batchesAPI = {
  getAll: async () => {
    return apiRequest('/batches');
  },

  create: async (batchData: any) => {
    return apiRequest('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  },

  addBranch: async (batchId: string, branchData: any) => {
    return apiRequest(`/batches/${batchId}/branches`, {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  },

  updateBranch: async (batchId: string, branchId: string, branchData: any) => {
    return apiRequest(`/batches/${batchId}/branches/${branchId}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  },

  deleteBranch: async (batchId: string, branchId: string) => {
    return apiRequest(`/batches/${batchId}/branches/${branchId}`, {
      method: 'DELETE',
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/batches/${id}`, {
      method: 'DELETE',
    });
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/dashboard/stats');
  }
};

export { getAuthToken, setAuthToken, removeAuthToken };
