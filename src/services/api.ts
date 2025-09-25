const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(true),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ password }),
    });
  }

  // Admin endpoints (Master Admin)
  async createCollege(collegeData: any) {
    return this.request('/admin/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData),
    });
  }

  async getColleges() {
    return this.request('/admin/colleges');
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async toggleCollegeStatus(collegeId: string) {
    return this.request(`/admin/colleges/${collegeId}/toggle-status`, {
      method: 'PUT',
    });
  }

  // College endpoints
  async createUser(userData: any) {
    return this.request('/college/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCollegeUsers(role: 'faculty' | 'student') {
    return this.request(`/college/users/${role}`);
  }

  async getCollegeDashboard() {
    return this.request('/college/dashboard');
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/college/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async toggleUserStatus(userId: string) {
    return this.request(`/college/users/${userId}/toggle-status`, {
      method: 'PUT',
    });
  }

  // Test endpoints
  async createTest(testData: any) {
    return this.request('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  async getTests() {
    return this.request('/tests');
  }

  async getTest(testId: string) {
    return this.request(`/tests/${testId}`);
  }

  async assignTestToColleges(testId: string, collegeIds: string[]) {
    return this.request(`/tests/${testId}/assign-college`, {
      method: 'POST',
      body: JSON.stringify({ collegeIds }),
    });
  }

  async getAssignedTests() {
    return this.request('/tests/college/assigned');
  }

  async updateTestAssignmentStatus(assignmentId: string, status: 'accepted' | 'rejected') {
    return this.request(`/tests/assignment/${assignmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async assignTestToStudents(assignmentId: string, filters: any) {
    return this.request(`/tests/assignment/${assignmentId}/assign-students`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getStudentAssignedTests() {
    return this.request('/tests/student/assigned');
  }

  async startTest(testId: string) {
    return this.request(`/tests/${testId}/start`, {
      method: 'POST',
    });
  }

  async submitTest(testId: string, answers: any[], startTime: Date, timeSpent: number) {
    return this.request(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answers,
        startTime: startTime.toISOString(),
        timeSpent
      }),
    });
  }

  async getTestResults(testId: string) {
    return this.request(`/tests/${testId}/results`);
  }

  // Reports endpoints
  async getMasterAdminReports() {
    return this.request('/reports/master/overview');
  }

  async getTestReport(testId: string) {
    return this.request(`/reports/master/test/${testId}`);
  }

  async getCollegeReports() {
    return this.request('/reports/college/overview');
  }

  async getFacultyReports() {
    return this.request('/reports/faculty/overview');
  }

  async getStudentPerformance() {
    return this.request('/reports/student/performance');
  }
}

export default new ApiService();