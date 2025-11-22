const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const adminApi = {
  users: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    create: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }
      return data;
    },

    update: async (id, userData) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }
      return data;
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    assignWarehouse: async (userId, warehouseId) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/warehouse`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ warehouseId }),
        credentials: 'include',
      });
      return response.json();
    },
  },

  warehouses: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/warehouses`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    create: async (warehouseData) => {
      const response = await fetch(`${API_BASE_URL}/warehouses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(warehouseData),
        credentials: 'include',
      });
      return response.json();
    },

    update: async (id, warehouseData) => {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(warehouseData),
        credentials: 'include',
      });
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },
  },

  products: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/products?${queryString}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    create: async (productData) => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
        credentials: 'include',
      });
      return response.json();
    },

    update: async (id, productData) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
        credentials: 'include',
      });
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/products/stats/overview`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },
  },

  locations: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/locations?${queryString}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    create: async (locationData) => {
      const response = await fetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(locationData),
        credentials: 'include',
      });
      return response.json();
    },

    update: async (id, locationData) => {
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(locationData),
        credentials: 'include',
      });
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getByWarehouse: async (warehouseId) => {
      const response = await fetch(`${API_BASE_URL}/locations/warehouse/${warehouseId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/locations/stats/overview`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },
  },

  stockBalances: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/stock-balances?${queryString}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getByWarehouse: async (warehouseId) => {
      const response = await fetch(`${API_BASE_URL}/stock-balances/warehouse/${warehouseId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getLowStock: async () => {
      const response = await fetch(`${API_BASE_URL}/stock-balances/low-stock`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },
  },

  documents: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/admin/documents?${query}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/admin/documents/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    getByType: async (type, params = {}) => {
      const query = new URLSearchParams({ ...params, documentType: type }).toString();
      const response = await fetch(`${API_BASE_URL}/admin/documents?${query}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },

    updateStatus: async (id, status, notes = '') => {
      const response = await fetch(`${API_BASE_URL}/admin/documents/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
        credentials: 'include',
      });
      return response.json();
    },

    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/documents/stats/overview`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return response.json();
    },
  },

  stats: {
    getSummary: async () => {
      const [usersRes, warehousesRes, productsRes, documentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/warehouses`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/products`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        }),
      ]);

      const users = await usersRes.json();
      const warehouses = await warehousesRes.json();
      const products = await productsRes.json();
      const documents = await documentsRes.json();

      return {
        totalUsers: users.count || users.data?.length || 0,
        totalWarehouses: warehouses.count || warehouses.data?.length || 0,
        totalProducts: products.count || products.data?.length || 0,
        usersByRole: users.data
          ? users.data.reduce((acc, user) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {})
          : {},
        documentsByType: documents.data?.documentsByType || {},
        documentsByStatus: documents.data?.documentsByStatus || {},
        recentDocuments: documents.data?.recentDocuments || [],
      };
    },
  },
};
