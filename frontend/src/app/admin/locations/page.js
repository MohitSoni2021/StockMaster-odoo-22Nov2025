'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/utils/adminApi';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    warehouse: '',
    name: '',
    shortCode: '',
    type: 'rack',
    capacity: 0,
    isActive: true,
  });

  const locationTypes = ['rack', 'room', 'bin', 'floor', 'zone'];

  const fetchLocationsByWarehouse = useCallback(async (warehouseId) => {
    try {
      setLoading(true);
      const data = await adminApi.locations.getByWarehouse(warehouseId);
      setLocations(data.data || []);
    } catch (err) {
      setError('Failed to load locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const warehouseData = await adminApi.warehouses.getAll();
      const adminWarehouses = warehouseData.data || [];

      if (adminWarehouses.length > 0) {
        setWarehouses(adminWarehouses);
        setSelectedWarehouse(adminWarehouses[0]); // Default to first warehouse
        await fetchLocationsByWarehouse(adminWarehouses[0]._id);
      } else {
        setWarehouses([]);
        setLocations([]);
      }
    } catch (err) {
      setError('Failed to load warehouses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchLocationsByWarehouse]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleWarehouseChange = async (warehouseId) => {
    const warehouse = warehouses.find(w => w._id === warehouseId);
    setSelectedWarehouse(warehouse);
    await fetchLocationsByWarehouse(warehouseId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'capacity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.shortCode || !formData.warehouse) {
        setError('Please fill required fields');
        return;
      }

      const res = await adminApi.locations.create(formData);

      if (!res.success) {
        setError(res.message || 'Failed to create location');
        return;
      }

      resetForm();
      setShowCreateModal(false);
      setError('');
      if (selectedWarehouse) {
        await fetchLocationsByWarehouse(selectedWarehouse._id);
      }
    } catch (err) {
      setError(err.message || 'Error creating location');
      console.error(err);
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    if (!editingLocation) return;

    try {
      const res = await adminApi.locations.update(editingLocation._id, formData);

      if (!res.success) {
        setError(res.message || 'Failed to update location');
        return;
      }

      resetForm();
      setEditingLocation(null);
      setShowCreateModal(false);
      setError('');
      if (selectedWarehouse) {
        await fetchLocationsByWarehouse(selectedWarehouse._id);
      }
    } catch (err) {
      setError(err.message || 'Error updating location');
      console.error(err);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;

    try {
      const res = await adminApi.locations.delete(locationId);

      if (!res.success) {
        setError(res.message || 'Failed to delete location');
        return;
      }

      if (selectedWarehouse) {
        await fetchLocationsByWarehouse(selectedWarehouse._id);
      }
    } catch (err) {
      setError(err.message || 'Error deleting location');
      console.error(err);
    }
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setFormData({
      warehouse: location.warehouse?._id || location.warehouse || '',
      name: location.name || '',
      shortCode: location.shortCode || '',
      type: location.type || 'rack',
      capacity: location.capacity || 0,
      isActive: location.isActive !== undefined ? location.isActive : true,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      warehouse: selectedWarehouse?._id || '',
      name: '',
      shortCode: '',
      type: 'rack',
      capacity: 0,
      isActive: true,
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingLocation(null);
    resetForm();
    setError('');
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w._id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown Warehouse';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Location Management</h1>
        <button
          onClick={() => {
            setEditingLocation(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          + Create Location
        </button>
      </div>

      {/* Warehouse Selector and Info */}
      {warehouses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Warehouse
              </label>
              <select
                value={selectedWarehouse?._id || ''}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {warehouses.map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} ({warehouse.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {selectedWarehouse && (
              <div className="text-sm text-gray-600">
                <div className="font-semibold">Warehouse Location:</div>
                <div>{selectedWarehouse.address.line1}</div>
                {selectedWarehouse.address.line2 && <div>{selectedWarehouse.address.line2}</div>}
                <div>{selectedWarehouse.address.city}, {selectedWarehouse.address.state} {selectedWarehouse.address.postalCode}</div>
                <div>{selectedWarehouse.address.country}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {warehouses.length === 0 && !loading && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8">
          No warehouses found. Please create a warehouse first to manage locations.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No locations found
          </div>
        ) : (
          locations.map(location => (
            <LocationCard
              key={location._id}
              location={location}
              onEdit={() => openEditModal(location)}
              onDelete={() => handleDeleteLocation(location._id)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <LocationModal
          location={editingLocation}
          formData={formData}
          selectedWarehouse={selectedWarehouse}
          locationTypes={locationTypes}
          onInputChange={handleInputChange}
          onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation}
          onClose={closeModal}
          isEditing={!!editingLocation}
        />
      )}
    </div>
  );
}

function LocationCard({ location, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{location.name}</h3>
        <p className="text-sm text-gray-600 font-mono">{location.shortCode}</p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="text-gray-700">
          <span className="font-semibold">Type:</span> {location.type}
        </div>
        <div className="text-gray-700">
          <span className="font-semibold">Capacity:</span> {location.capacity || 'Unlimited'}
        </div>
        <div className="text-gray-700">
          <span className="font-semibold">Status:</span>
          <span className={`ml-1 px-2 py-1 rounded text-xs ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {location.isActive ? 'Active' : 'Inactive'}
          </span>
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

function LocationModal({ location, formData, selectedWarehouse, locationTypes, onInputChange, onSubmit, onClose, isEditing }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Location' : 'Create New Location'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse *
            </label>
            <input
              type="text"
              value={selectedWarehouse ? `${selectedWarehouse.name} (${selectedWarehouse.shortCode})` : ''}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
            />
            <input
              type="hidden"
              name="warehouse"
              value={formData.warehouse}
            />
          </div>

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
                maxLength="20"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {locationTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={onInputChange}
                min="0"
                placeholder="0 = unlimited"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Active Location
            </label>
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