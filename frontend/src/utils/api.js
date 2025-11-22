// API utility functions for making authenticated requests

const API_BASE_URL = 'http://localhost:5001/api/v1';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Create headers with authorization
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Warehouse API functions
export const warehouseAPI = {
  // Get all warehouses
  getWarehouses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/warehouses?${queryString}`);
  },

  // Get single warehouse
  getWarehouse: (id) => {
    return apiRequest(`/warehouses/${id}`);
  },

  // Create new warehouse
  createWarehouse: (warehouseData) => {
    return apiRequest('/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouseData)
    });
  },

  // Update warehouse
  updateWarehouse: (id, warehouseData) => {
    return apiRequest(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData)
    });
  },

  // Delete warehouse
  deleteWarehouse: (id) => {
    return apiRequest(`/warehouses/${id}`, {
      method: 'DELETE'
    });
  },

  // Get warehouse statistics
  getWarehouseStats: () => {
    return apiRequest('/warehouses/stats/overview');
  }
};

// Auth API functions
export const authAPI = {
  // Login
  login: (credentials) => {
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    });
  },

  // Register
  register: (userData) => {
    return fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }
      return response.json();
    });
  }
};

// Utility function to set token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};