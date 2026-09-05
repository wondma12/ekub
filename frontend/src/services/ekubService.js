import api from './api';

const ekubService = {
  getEkubs: async () => {
    try {
      const response = await api.get('/ekubs');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to load Ekubs');
    }
  },

  createEkub: async (ekubData) => {
    try {
      const response = await api.post('/ekubs', ekubData);
      return response.data.data;
    } catch (error) {
      const validationError = error.response?.data?.errors?.[0]?.msg;
      throw new Error(validationError || error.response?.data?.error || 'Failed to create Ekub');
    }
  },

  updateEkub: async (ekubId, ekubData) => {
    try {
      const response = await api.put(`/ekubs/${ekubId}`, ekubData);
      return response.data.data;
    } catch (error) {
      const validationError = error.response?.data?.errors?.[0]?.msg;
      throw new Error(validationError || error.response?.data?.error || 'Failed to update Ekub');
    }
  },

  deleteEkub: async (ekubId) => {
    try {
      await api.delete(`/ekubs/${ekubId}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete Ekub');
    }
  },
};

export default ekubService;