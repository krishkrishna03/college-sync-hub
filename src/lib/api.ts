const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    console.error('API request error:', error);
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

  registerAdmin: async (userData: any) => {
    return apiRequest('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  verifyInvitation: async (token: string) => {
    return apiRequest(`/invitations/verify/${token}`);
  },

  acceptInvitation: async (token: string, password: string) => {
    return apiRequest(`/invitations/accept/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  rejectInvitation: async (token: string) => {
    return apiRequest(`/invitations/reject/${token}`, {
      method: 'POST',
    });
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

// Master Admin API
export const masterAdminAPI = {
  getDashboardStats: async () => {
    return apiRequest('/master-admin/dashboard');
  },

  getAuditLogs: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/master-admin/audit-logs?${queryParams}`);
  },

  getPlatformStats: async () => {
    return apiRequest('/master-admin/platform-stats');
  }
};

// Exams API (for Master Admin)
export const examsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/exams?${queryParams}`);
  },

  create: async (examData: any) => {
    return apiRequest('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  },

  update: async (id: string, examData: any) => {
    return apiRequest(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/exams/${id}`, {
      method: 'DELETE',
    });
  },

  assignToColleges: async (examId: string, collegeIds: string[]) => {
    return apiRequest(`/exams/${examId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ collegeIds }),
    });
  },

  getReports: async (examId: string, filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/exams/${examId}/reports?${queryParams}`);
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/notifications?${queryParams}`);
  },

  create: async (notificationData: any) => {
    return apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  markAsRead: async (id: string) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
};
// Colleges API
export const collegesAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/colleges?${queryParams}`);
  },

  create: async (collegeData: any) => {
    return apiRequest('/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData),
    });
  },

  update: async (id: string, collegeData: any) => {
    return apiRequest(`/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collegeData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/colleges/${id}`, {
      method: 'DELETE',
    });
  }
};

// Invitations API
export const invitationsAPI = {
  send: async (invitationData: any) => {
    return apiRequest('/invitations/send', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  },

  verify: async (token: string) => {
    return apiRequest(`/invitations/verify/${token}`);
  },

  accept: async (token: string, password: string) => {
    return apiRequest(`/invitations/accept/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  reject: async (token: string) => {
    return apiRequest(`/invitations/reject/${token}`, {
      method: 'POST',
    });
  }
};

// Students API
export const studentsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/students?${queryParams}`);
  },

  getMyProfile: async () => {
    return apiRequest('/students/my-profile');
  },

  getMyTests: async () => {
    return apiRequest('/students/my-tests');
  },

  getMyTestResults: async () => {
    return apiRequest('/students/my-test-results');
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
  },

  sendInvitations: async (params: any) => {
    return apiRequest('/students/send-invitations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
};

// Faculty API
export const facultyAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/faculty?${queryParams}`);
  },

  getMyStudents: async () => {
    return apiRequest('/faculty/my-students');
  },

  getMyTasks: async () => {
    return apiRequest('/faculty/my-tasks');
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    return apiRequest(`/faculty/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
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

  getAssignedTests: async (studentId?: string, collegeId?: string) => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (collegeId) params.append('collegeId', collegeId);
    return apiRequest(`/tests/assigned?${params.toString()}`);
  },

  getCollegeTests: async (collegeId: string) => {
    return apiRequest(`/tests/college/${collegeId}`);
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

  addSection: async (batchId: string, branchId: string, sectionData: any) => {
    return apiRequest(`/batches/${batchId}/branches/${branchId}/sections`, {
      method: 'POST',
      body: JSON.stringify(sectionData),
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
