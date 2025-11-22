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

  stats: {
    getSummary: async () => {
      const [usersRes, warehousesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/warehouses`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        }),
      ]);

      const users = await usersRes.json();
      const warehouses = await warehousesRes.json();

      return {
        totalUsers: users.count || 0,
        totalWarehouses: warehouses.count || 0,
        usersByRole: users.users
          ? users.users.reduce((acc, user) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {})
          : {},
      };
    },
  },
};
