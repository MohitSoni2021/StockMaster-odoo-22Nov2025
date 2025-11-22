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

// Contact API functions
export const contactAPI = {
  // Get all contacts
  getContacts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/contacts?${queryString}`);
  },

  // Get single contact
  getContact: (id) => {
    return apiRequest(`/contacts/${id}`);
  },

  // Create new contact
  createContact: (contactData) => {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  },

  // Update contact
  updateContact: (id, contactData) => {
    return apiRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
  },

  // Delete contact
  deleteContact: (id) => {
    return apiRequest(`/contacts/${id}`, {
      method: 'DELETE'
    });
  },

  // Get contacts by type
  getContactsByType: (type) => {
    return apiRequest(`/contacts/type/${type}`);
  }
};

// Document API functions
export const documentAPI = {
  // Get all documents
  getDocuments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/documents?${queryString}`);
  },

  // Get single document
  getDocument: (id) => {
    return apiRequest(`/documents/${id}`);
  },

  // Create new document
  createDocument: (documentData) => {
    return apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  },

  // Update document
  updateDocument: (id, documentData) => {
    return apiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData)
    });
  },

  // Delete document
  deleteDocument: (id) => {
    return apiRequest(`/documents/${id}`, {
      method: 'DELETE'
    });
  },

  // Validate document
  validateDocument: (id, validatedBy) => {
    return apiRequest(`/documents/${id}/validate`, {
      method: 'PUT',
      body: JSON.stringify({ validatedBy })
    });
  },

  // Update document status
  updateDocumentStatus: (id, status) => {
    return apiRequest(`/documents/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Get document statistics
  getDocumentStats: () => {
    return apiRequest('/documents/stats/overview');
  }
};

// Document Line API functions
export const documentLineAPI = {
  // Get all document lines
  getDocumentLines: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/document-lines?${queryString}`);
  },

  // Get single document line
  getDocumentLine: (id) => {
    return apiRequest(`/document-lines/${id}`);
  },

  // Create new document line
  createDocumentLine: (lineData) => {
    return apiRequest('/document-lines', {
      method: 'POST',
      body: JSON.stringify(lineData)
    });
  },

  // Update document line
  updateDocumentLine: (id, lineData) => {
    return apiRequest(`/document-lines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lineData)
    });
  },

  // Delete document line
  deleteDocumentLine: (id) => {
    return apiRequest(`/document-lines/${id}`, {
      method: 'DELETE'
    });
  },

  // Update line status
  updateLineStatus: (id, status) => {
    return apiRequest(`/document-lines/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Get document lines by document
  getDocumentLinesByDocument: (documentId) => {
    return apiRequest(`/document-lines/document/${documentId}`);
  }
};

// Product API functions
export const productAPI = {
  // Get all products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  // Get single product
  getProduct: (id) => {
    return apiRequest(`/products/${id}`);
  },

  // Create new product
  createProduct: (productData) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  // Update product
  updateProduct: (id, productData) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  // Delete product
  deleteProduct: (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};