'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/utils/adminApi';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    loginid: '',
    email: '',
    password: '',
    role: 'staff',
    warehouse: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.users.getAll();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await adminApi.warehouses.getAll();
      setWarehouses(data.data || []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (!formData.loginid || !formData.email || !formData.password || !formData.warehouse) {
        setError('Please fill all fields');
        return;
      }

      const createPayload = {
        loginid: formData.loginid,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        warehouseAssigned: formData.warehouse,
      };

      const createRes = await adminApi.users.create(createPayload);

      if (!createRes.success) {
        setError(createRes.message || 'Failed to create user');
        return;
      }

      setFormData({
        loginid: '',
        email: '',
        password: '',
        role: 'staff',
        warehouse: '',
      });
      setShowCreateModal(false);
      setError('');
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Error creating user');
      console.error(err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updatePayload = {
        email: formData.email,
        role: formData.role,
        warehouseAssigned: formData.warehouse,
      };

      const res = await adminApi.users.update(editingUser._id, updatePayload);

      if (!res.success) {
        setError(res.message || 'Failed to update user');
        return;
      }

      setEditingUser(null);
      setFormData({
        loginid: '',
        email: '',
        password: '',
        role: 'staff',
        warehouse: '',
      });
      setError('');
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Error updating user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await adminApi.users.delete(userId);

      if (!res.success) {
        setError(res.message || 'Failed to delete user');
        return;
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Error deleting user');
      console.error(err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      loginid: user.loginid || '',
      email: user.email || '',
      password: '',
      role: user.role || 'staff',
      warehouse: user.warehouseAssigned?._id || '',
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setFormData({
      loginid: '',
      email: '',
      password: '',
      role: 'staff',
      warehouse: '',
    });
    setError('');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              loginid: '',
              email: '',
              password: '',
              role: 'staff',
              warehouse: '',
            });
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Create User
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Login ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Warehouse</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.loginid}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.warehouseAssigned?.name || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <UserModal
          user={editingUser}
          formData={formData}
          warehouses={warehouses}
          onInputChange={handleInputChange}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onClose={closeModal}
          isEditing={!!editingUser}
        />
      )}
    </div>
  );
}

function UserModal({ user, formData, warehouses, onInputChange, onSubmit, onClose, isEditing }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {!isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login ID
                </label>
                <input
                  type="text"
                  name="loginid"
                  value={formData.loginid}
                  onChange={onInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={onInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="auditor">Auditor</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse
            </label>
            <select
              name="warehouse"
              value={formData.warehouse}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a warehouse</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getRoleColor(role) {
  const colors = {
    admin: 'bg-red-600',
    manager: 'bg-blue-600',
    staff: 'bg-green-600',
    auditor: 'bg-purple-600',
    supervisor: 'bg-orange-600',
  };
  return colors[role] || 'bg-gray-600';
}
