import api from './api';

export const userService = {
  /**
   * Get users with pagination and filters
   */
  getUsers: async ({ page = 1, limit = 10, search = '', role = '', status = '' }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status }),
      });

      const response = await api.get(`/users?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch users';
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch user';
    }
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create user';
    }
  },

  /**
   * Update user (admin only)
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update user';
    }
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to delete user';
    }
  },

  /**
   * Update user status (admin only)
   */
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/users/${userId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update user status';
    }
  },

  /**
   * Get ekub members
   */
  getEkubMembers: async (ekubId) => {
    try {
      const response = await api.get(`/users/ekub/${ekubId}/members`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch ekub members';
    }
  },

  /**
   * Add member to ekub
   */
  addEkubMember: async (ekubId, userId) => {
    try {
      const response = await api.post(`/users/ekub/${ekubId}/members`, { userId });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to add member';
    }
  },

  /**
   * Remove member from ekub
   */
  removeEkubMember: async (ekubId, userId) => {
    try {
      const response = await api.delete(`/users/ekub/${ekubId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to remove member';
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get profile';
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },

  /**
   * Change user password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to change password';
    }
  },

  /**
   * Get user statistics
   */
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get user stats';
    }
  },

  /**
   * Get all users (simplified for selects)
   */
  getAllUsersSimple: async () => {
    try {
      const response = await api.get('/users?limit=1000');
      return response.data.data.users;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch users';
    }
  },
};

export default userService;