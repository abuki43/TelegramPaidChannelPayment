const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'x-telegram-init-data': window?.Telegram?.WebApp?.initData,
});

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

const api = {
  verifyPayment: async (userId, transactionId, amount) => {
    try {
      if (!userId) throw new Error('User ID required');
      
      const response = await fetch(`${API_BASE_URL}/membership/verify-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, transactionId, amount }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  getUserStatus: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required');
      
      const response = await fetch(`${API_BASE_URL}/membership/status?userId=${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('User status fetch error:', error);
      throw error;
    }
  }
};

export default api;