import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      
      // Keep authentication scoped to the current browser tab.
      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        if (data.refreshToken) {
          sessionStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get user profile';
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      const { user } = response.data.data;
      
      // Update stored user data
      sessionStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to change password';
    }
  },

  /**
   * Forgot password - request reset
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to send reset email';
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to reset password';
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to verify email';
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    try {
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get stored token
   */
  getToken: () => {
    return sessionStorage.getItem('token');
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token } = response.data.data;
      
      sessionStorage.setItem('token', token);
      return token;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to refresh token';
    }
  },
};

export default authService;