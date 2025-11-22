'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/utils/adminApi';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    defaultUom: 'PIECE',
    perUnitCost: '',
    reorderPoint: 10,
    reorderQty: 50,
    isActive: true,
  });

  const uomOptions = ['PIECE', 'KG', 'LTR', 'MTR', 'BOX', 'PACK', 'CASE', 'BUNDLE', 'UNIT', 'OTHER'];

  const fetchProductsByWarehouse = useCallback(async (warehouseId) => {
    try {
      setLoading(true);
      const data = await adminApi.stockBalances.getByWarehouse(warehouseId);
      // Extract unique products from stock balances
      const productMap = new Map();
      data.data.forEach(stockBalance => {
        if (stockBalance.product && !productMap.has(stockBalance.product._id)) {
          productMap.set(stockBalance.product._id, {
            ...stockBalance.product,
            warehouse: stockBalance.warehouse,
            stockBalance: stockBalance
          });
        }
      });
      setProducts(Array.from(productMap.values()));
    } catch (err) {
      setError('Failed to load products');
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
        await fetchProductsByWarehouse(adminWarehouses[0]._id);
      } else {
        setWarehouses([]);
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to load warehouses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchProductsByWarehouse]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleWarehouseChange = async (warehouseId) => {
    const warehouse = warehouses.find(w => w._id === warehouseId);
    setSelectedWarehouse(warehouse);
    await fetchProductsByWarehouse(warehouseId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'perUnitCost' || name === 'reorderPoint' || name === 'reorderQty') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.category || !formData.perUnitCost) {
        setError('Please fill required fields');
        return;
      }

      const res = await adminApi.products.create(formData);

      if (!res.success) {
        setError(res.message || 'Failed to create product');
        return;
      }

      resetForm();
      setShowCreateModal(false);
      setError('');
      if (selectedWarehouse) {
        await fetchProductsByWarehouse(selectedWarehouse._id);
      }
    } catch (err) {
      setError(err.message || 'Error creating product');
      console.error(err);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await adminApi.products.update(editingProduct._id, formData);

      if (!res.success) {
        setError(res.message || 'Failed to update product');
        return;
      }

      resetForm();
      setEditingProduct(null);
      setShowCreateModal(false);
      setError('');
      if (selectedWarehouse) {
        await fetchProductsByWarehouse(selectedWarehouse._id);
      }
    } catch (err) {
      setError(err.message || 'Error updating product');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await adminApi.products.delete(productId);

      if (!res.success) {
        setError(res.message || 'Failed to delete product');
        return;
      }

      if (selectedWarehouse) {
        await fetchProductsByWarehouse(selectedWarehouse._id);
      }
    } catch (err) {
      setError(err.message || 'Error deleting product');
      console.error(err);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      defaultUom: product.defaultUom || 'PIECE',
      perUnitCost: product.perUnitCost || '',
      reorderPoint: product.reorderPoint || 10,
      reorderQty: product.reorderQty || 50,
      isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      defaultUom: 'PIECE',
      perUnitCost: '',
      reorderPoint: 10,
      reorderQty: 50,
      isActive: true,
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    resetForm();
    setError('');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          + Create Product
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
          No warehouses found. Please create a warehouse first to manage products.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No products found
          </div>
        ) : (
          products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={() => openEditModal(product)}
              onDelete={() => handleDeleteProduct(product._id)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <ProductModal
          product={editingProduct}
          formData={formData}
          uomOptions={uomOptions}
          onInputChange={handleInputChange}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onClose={closeModal}
          isEditing={!!editingProduct}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const stockBalance = product.stockBalance;
  const availableQuantity = stockBalance ? stockBalance.availableQuantity : 0;
  const totalQuantity = stockBalance ? stockBalance.quantity : 0;
  const reservedQuantity = stockBalance ? stockBalance.reservedQuantity : 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
        <p className="text-sm text-blue-600">{product.category}</p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="text-gray-700">
          <span className="font-semibold">UOM:</span> {product.defaultUom}
        </div>
        <div className="text-gray-700">
          <span className="font-semibold">Cost:</span> ₹{product.perUnitCost}
        </div>
        <div className="text-gray-700">
          <span className="font-semibold">Reorder Point:</span> {product.reorderPoint}
        </div>
        <div className="text-gray-700">
          <span className="font-semibold">Reorder Qty:</span> {product.reorderQty}
        </div>
        {stockBalance && (
          <>
            <div className="text-gray-700">
              <span className="font-semibold">Total Stock:</span> {totalQuantity} {product.defaultUom}
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">Available:</span> {availableQuantity} {product.defaultUom}
              {reservedQuantity > 0 && <span className="text-orange-600"> ({reservedQuantity} reserved)</span>}
            </div>
          </>
        )}
        <div className="text-gray-700">
          <span className="font-semibold">Status:</span>
          <span className={`ml-1 px-2 py-1 rounded text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.isActive ? 'Active' : 'Inactive'}
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

function ProductModal({ product, formData, uomOptions, onInputChange, onSubmit, onClose, isEditing }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Product' : 'Create New Product'}
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
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measurement *
              </label>
              <select
                name="defaultUom"
                value={formData.defaultUom}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {uomOptions.map(uom => (
                  <option key={uom} value={uom}>{uom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Unit Cost (₹) *
              </label>
              <input
                type="number"
                name="perUnitCost"
                value={formData.perUnitCost}
                onChange={onInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Point
              </label>
              <input
                type="number"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={onInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Quantity
              </label>
              <input
                type="number"
                name="reorderQty"
                value={formData.reorderQty}
                onChange={onInputChange}
                min="1"
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
              Active Product
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