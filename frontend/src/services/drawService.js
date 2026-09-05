import api from './api';

export const drawService = {
  /**
   * Create a new draw
   */
  createDraw: async (drawData) => {
    try {
      const response = await api.post('/draws', drawData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create draw';
    }
  },

  updateDraw: async (drawId, drawData) => {
    try {
      const response = await api.put(`/draws/${drawId}`, drawData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update draw');
    }
  },

  deleteDraw: async (drawId) => {
    try {
      await api.delete(`/draws/${drawId}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete draw');
    }
  },

  setDrawActive: async (drawId, isActive) => {
    try {
      const response = await api.patch(`/draws/${drawId}/active`, { is_active: isActive });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update draw activity');
    }
  },

  /**
   * Set lucky numbers for a draw
   */
  setLuckyNumbers: async (drawId, luckyNumbers) => {
    try {
      const response = await api.put(`/draws/${drawId}/lucky-numbers`, {
        luckyNumbers,
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to set lucky numbers';
    }
  },

  /**
   * Start a draw
   */
  startDraw: async (drawId) => {
    try {
      const response = await api.post(`/draws/${drawId}/start`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to start draw';
    }
  },

  /**
   * Spin the wheel
   */
  spin: async (drawId) => {
    try {
      const response = await api.post(`/draws/${drawId}/spin`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to spin wheel';
    }
  },

  /**
   * Get draw status
   */
  getDrawStatus: async (drawId) => {
    try {
      const response = await api.get(`/draws/${drawId}/status`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get draw status';
    }
  },

  /**
   * Get draws by ekub
   */
  getDrawsByEkub: async (ekubId) => {
    try {
      const response = await api.get(`/draws/ekub/${ekubId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get draws';
    }
  },

  /**
   * Get draw by ID
   */
  getDrawById: async (drawId) => {
    try {
      const response = await api.get(`/draws/${drawId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get draw';
    }
  },

  /**
   * Cancel a draw
   */
  cancelDraw: async (drawId) => {
    try {
      const response = await api.post(`/draws/${drawId}/cancel`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to cancel draw';
    }
  },

  /**
   * Reset a draw
   */
  resetDraw: async (drawId) => {
    try {
      const response = await api.post(`/draws/${drawId}/reset`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to reset draw';
    }
  },

  /**
   * Get draw results
   */
  getDrawResults: async (drawId) => {
    try {
      const response = await api.get(`/draws/${drawId}/results`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get draw results';
    }
  },

  /**
   * Get available users for a draw
   */
  getAvailableUsers: async (drawId) => {
    try {
      const response = await api.get(`/draws/${drawId}/available-users`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get available users';
    }
  },

  /**
   * Get all draws with filters
   */
  getAllDraws: async ({ status, search, page = 1, limit = 10 }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search }),
      });

      const response = await api.get(`/draws?${params}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get draws';
    }
  },

  /**
   * Get draw statistics
   */
  getDrawStats: async () => {
    try {
      const response = await api.get('/draws/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to get draw statistics';
    }
  },

  /**
   * Export draw results
   */
  exportDrawResults: async (drawId, format = 'csv') => {
    try {
      const response = await api.get(`/draws/${drawId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to export draw results';
    }
  },
};

export default drawService;