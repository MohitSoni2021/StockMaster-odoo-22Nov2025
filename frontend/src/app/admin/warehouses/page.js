'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/utils/adminApi';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseDetails, setWarehouseDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const fetchWarehouseDetails = async (warehouseId) => {
    try {
      const [stockBalancesRes, locationsRes] = await Promise.all([
        adminApi.stockBalances.getByWarehouse(warehouseId),
        adminApi.locations.getByWarehouse(warehouseId)
      ]);

      return {
        stockBalances: stockBalancesRes.data || [],
        locations: locationsRes.data || []
      };
    } catch (err) {
      console.error('Failed to load warehouse details', err);
      return { stockBalances: [], locations: [] };
    }
  };

  const openDetailsModal = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailsModal(true);

    // Fetch details if not already cached
    if (!warehouseDetails[warehouse._id]) {
      const details = await fetchWarehouseDetails(warehouse._id);
      setWarehouseDetails(prev => ({
        ...prev,
        [warehouse._id]: details
      }));
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
              onViewDetails={() => openDetailsModal(warehouse)}
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

      {showDetailsModal && selectedWarehouse && (
        <WarehouseDetailsModal
          warehouse={selectedWarehouse}
          details={warehouseDetails[selectedWarehouse._id] || { stockBalances: [], locations: [] }}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedWarehouse(null);
          }}
        />
      )}
    </div>
  );
}

function WarehouseCard({ warehouse, onEdit, onDelete, onViewDetails }) {
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
          onClick={onViewDetails}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm font-medium"
        >
          View Details
        </button>
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

function WarehouseDetailsModal({ warehouse, details, onClose }) {
  const { stockBalances, locations } = details;

  // Calculate total products and quantities
  const totalProducts = stockBalances.length;
  const totalQuantity = stockBalances.reduce((sum, balance) => sum + (balance.quantity || 0), 0);

  // Group stock balances by product
  const productsById = stockBalances.reduce((acc, balance) => {
    const productId = balance.product?._id || balance.product;
    if (!acc[productId]) {
      acc[productId] = {
        product: balance.product,
        totalQuantity: 0,
        locations: []
      };
    }
    acc[productId].totalQuantity += balance.quantity || 0;
    acc[productId].locations.push({
      location: balance.location,
      quantity: balance.quantity || 0
    });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {warehouse.name} - Detailed Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Warehouse Basic Info */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Warehouse Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{warehouse.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Short Code</p>
              <p className="font-medium">{warehouse.shortCode}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">
                {warehouse.address?.line1}, {warehouse.address?.line2 && `${warehouse.address.line2}, `}
                {warehouse.address?.city}, {warehouse.address?.state} {warehouse.address?.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{warehouse.contact?.name}</p>
              <p className="text-sm text-gray-600">{warehouse.contact?.phone}</p>
              <p className="text-sm text-gray-600">{warehouse.contact?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 rounded text-sm ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {warehouse.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-800">Total Products</h4>
            <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-800">Total Quantity</h4>
            <p className="text-2xl font-bold text-green-600">{totalQuantity}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-purple-800">Locations</h4>
            <p className="text-2xl font-bold text-purple-600">{locations.length}</p>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Product Inventory</h3>
          {Object.keys(productsById).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products in this warehouse</p>
          ) : (
            <div className="space-y-4">
              {Object.values(productsById).map((productData, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold">{productData.product?.name || 'Unknown Product'}</h4>
                      <p className="text-sm text-gray-600">SKU: {productData.product?.sku || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Category: {productData.product?.category || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{productData.totalQuantity}</p>
                      <p className="text-sm text-gray-600">Total Quantity</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <h5 className="text-sm font-medium mb-2">Location Breakdown:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {productData.locations.map((loc, locIndex) => (
                        <div key={locIndex} className="bg-white rounded p-2 text-sm">
                          <span className="font-medium">{loc.location?.name || 'Unknown Location'}</span>
                          <span className="text-gray-600 ml-2">({loc.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locations List */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Warehouse Locations</h3>
          {locations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No locations in this warehouse</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(location => (
                <div key={location._id} className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold">{location.name}</h4>
                  <p className="text-sm text-gray-600">Code: {location.shortCode}</p>
                  <p className="text-sm text-gray-600">Type: {location.type}</p>
                  <p className="text-sm text-gray-600">Capacity: {location.capacity || 'Unlimited'}</p>
                  <span className={`px-2 py-1 rounded text-xs ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {location.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
