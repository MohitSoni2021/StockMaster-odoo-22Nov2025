'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/utils/adminApi';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN',
    },
    contact: {
      name: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await adminApi.warehouses.getAll();
      setWarehouses(data.data || []);
    } catch (err) {
      setError('Failed to load warehouses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address_')) {
      const field = name.replace('address_', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else if (name.startsWith('contact_')) {
      const field = name.replace('contact_', '');
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.shortCode) {
        setError('Please fill required fields');
        return;
      }

      const res = await adminApi.warehouses.create(formData);

      if (!res.success) {
        setError(res.message || 'Failed to create warehouse');
        return;
      }

      resetForm();
      setShowCreateModal(false);
      setError('');
      await fetchWarehouses();
    } catch (err) {
      setError(err.message || 'Error creating warehouse');
      console.error(err);
    }
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    if (!editingWarehouse) return;

    try {
      const res = await adminApi.warehouses.update(editingWarehouse._id, formData);

      if (!res.success) {
        setError(res.message || 'Failed to update warehouse');
        return;
      }

      resetForm();
      setEditingWarehouse(null);
      setShowCreateModal(false);
      setError('');
      await fetchWarehouses();
    } catch (err) {
      setError(err.message || 'Error updating warehouse');
      console.error(err);
    }
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;

    try {
      const res = await adminApi.warehouses.delete(warehouseId);

      if (!res.success) {
        setError(res.message || 'Failed to delete warehouse');
        return;
      }

      await fetchWarehouses();
    } catch (err) {
      setError(err.message || 'Error deleting warehouse');
      console.error(err);
    }
  };

  const openEditModal = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name || '',
      shortCode: warehouse.shortCode || '',
      address: {
        line1: warehouse.address?.line1 || '',
        line2: warehouse.address?.line2 || '',
        city: warehouse.address?.city || '',
        state: warehouse.address?.state || '',
        postalCode: warehouse.address?.postalCode || '',
        country: warehouse.address?.country || 'IN',
      },
      contact: {
        name: warehouse.contact?.name || '',
        phone: warehouse.contact?.phone || '',
        email: warehouse.contact?.email || '',
      },
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortCode: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN',
      },
      contact: {
        name: '',
        phone: '',
        email: '',
      },
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingWarehouse(null);
    resetForm();
    setError('');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Warehouse Management</h1>
        <button
          onClick={() => {
            setEditingWarehouse(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          + Create Warehouse
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No warehouses found
          </div>
        ) : (
          warehouses.map(warehouse => (
            <WarehouseCard
              key={warehouse._id}
              warehouse={warehouse}
              onEdit={() => openEditModal(warehouse)}
              onDelete={() => handleDeleteWarehouse(warehouse._id)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <WarehouseModal
          warehouse={editingWarehouse}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
          onClose={closeModal}
          isEditing={!!editingWarehouse}
        />
      )}
    </div>
  );
}

function WarehouseCard({ warehouse, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{warehouse.name}</h3>
        <p className="text-sm text-gray-600 font-mono">{warehouse.shortCode}</p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="text-gray-700">
          <span className="font-semibold">Address:</span>
          <p className="text-gray-600 ml-2">
            {warehouse.address?.line1}, {warehouse.address?.city}
          </p>
        </div>

        <div className="text-gray-700">
          <span className="font-semibold">Contact:</span>
          <p className="text-gray-600 ml-2">
            {warehouse.contact?.name}<br />
            {warehouse.contact?.phone}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function WarehouseModal({ warehouse, formData, onInputChange, onSubmit, onClose, isEditing }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Warehouse' : 'Create New Warehouse'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Code *
              </label>
              <input
                type="text"
                name="shortCode"
                value={formData.shortCode}
                onChange={onInputChange}
                required
                maxLength="10"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="address_line1"
              value={formData.address.line1}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address_line2"
              value={formData.address.line2}
              onChange={onInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="address_city"
                value={formData.address.city}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="address_state"
                value={formData.address.state}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                name="address_postalCode"
                value={formData.address.postalCode}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="address_country"
                value={formData.address.country}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact.name}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact.phone}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email *
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact.email}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
