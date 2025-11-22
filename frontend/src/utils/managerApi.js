const API_URL = 'http://localhost:5001/api/v1/manager';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return {
    data: await response.json()
  };
};

export const managerAPI = {
  getDashboardKPIs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/dashboard/kpis?${query}`);
  },

  getReceipts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/receipts?${query}`);
  },

  getDeliveries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/deliveries?${query}`);
  },

  getTransfers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/transfers?${query}`);
  },

  getAdjustments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/adjustments?${query}`);
  },

  getPendingApprovals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/pending-approvals?${query}`);
  },

  approveDocument: (id, data) => {
    return apiRequest(`/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  rejectDocument: (id, data) => {
    return apiRequest(`/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  completeDocument: (id) => {
    return apiRequest(`/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({})
    });
  },

  cancelDocument: (id, data = {}) => {
    return apiRequest(`/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getStockLedger: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/ledger?${query}`);
  },

  getStockBalance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/stock-balance?${query}`);
  },

  getWarehouseSummary: (warehouseId) => {
    return apiRequest(`/warehouse/${warehouseId}/summary`);
  },

  assignTask: (id, data) => {
    return apiRequest(`/${id}/assign-task`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getReorderItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reorder/items?${query}`);
  }
};

export default managerAPI;
