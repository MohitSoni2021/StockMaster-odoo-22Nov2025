'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'

const StockBalance = () => {
  const [stockBalances, setStockBalances] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [filterProduct, setFilterProduct] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')

  const [formData, setFormData] = useState({
    product: '',
    warehouse: '',
    location: '',
    quantity: 0,
    reservedQuantity: 0
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'quantity' || name === 'reservedQuantity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else if (name === 'warehouse') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        location: ''
      }))
      if (value) {
        fetchLocationsByWarehouse(value)
      } else {
        setLocations([])
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.product || !formData.warehouse) {
      alert('Please select a product and warehouse')
      return
    }

    try {
      setSubmitLoading(true)
      const response = await fetch('http://localhost:5001/api/v1/stock-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Stock balance created successfully!')
        setFormData({
          product: '',
          warehouse: '',
          location: '',
          quantity: 0,
          reservedQuantity: 0
        })
        fetchStockBalances()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating stock balance:', error)
      alert('Error creating stock balance. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const fetchStockBalances = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = 'http://localhost:5001/api/v1/stock-balances'
      const params = new URLSearchParams()
      if (filterProduct) params.append('product', filterProduct)
      if (filterWarehouse) params.append('warehouse', filterWarehouse)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setStockBalances(result.data || [])
      } else if (response.status === 401) {
        setError('Authentication required. Please log in.')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch stock balances')
      }
    } catch (error) {
      console.error('Error fetching stock balances:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setProducts(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/warehouses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setWarehouses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    }
  }

  const fetchLocationsByWarehouse = async (warehouseId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/v1/locations?warehouse=${warehouseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setLocations(result.data || [])
      } else {
        setLocations([])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([])
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchWarehouses()
    fetchStockBalances()
  }, [filterProduct, filterWarehouse])

  const deleteStockBalance = async (id) => {
    if (!confirm('Are you sure you want to delete this stock balance?')) return

    try {
      const response = await fetch(`http://localhost:5001/api/v1/stock-balances/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('Stock balance deleted successfully!')
        fetchStockBalances()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting stock balance:', error)
      alert('Error deleting stock balance.')
    }
  }

  const getProductName = (product) => {
    if (!product) return '-'
    if (typeof product === 'object' && product.name) {
      return product.name
    }
    const foundProduct = products.find(p => p._id === product)
    return foundProduct ? foundProduct.name : product
  }

  const getWarehouseName = (warehouse) => {
    if (!warehouse) return '-'
    if (typeof warehouse === 'object' && warehouse.name) {
      return warehouse.name
    }
    const foundWarehouse = warehouses.find(w => w._id === warehouse)
    return foundWarehouse ? foundWarehouse.name : warehouse
  }

  const getLocationName = (location) => {
    if (!location) return '-'
    if (typeof location === 'object' && location.name) {
      return `${location.name} (${location.shortCode})`
    }
    const foundLocation = locations.find(l => l._id === location)
    return foundLocation ? `${foundLocation.name} (${foundLocation.shortCode})` : location
  }

  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Stock Balance Management</h1>

        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Add Stock Balance</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Product *</label>
                <select
                  name='product'
                  value={formData.product}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                >
                  <option value=''>Select a product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Warehouse *</label>
                <select
                  name='warehouse'
                  value={formData.warehouse}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                >
                  <option value=''>Select a warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name} ({warehouse.shortCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.warehouse && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Location</label>
                  <select
                    name='location'
                    value={formData.location}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                  >
                    <option value=''>Select a location (optional)</option>
                    {locations.map(location => (
                      <option key={location._id} value={location._id}>
                        {location.name} ({location.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Quantity</label>
                <input
                  type='number'
                  name='quantity'
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., 100'
                  min='0'
                  step='0.01'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Reserved Quantity</label>
                <input
                  type='number'
                  name='reservedQuantity'
                  value={formData.reservedQuantity}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., 10'
                  min='0'
                  step='0.01'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={submitLoading}
              className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 w-full md:w-auto disabled:bg-gray-400'
            >
              {submitLoading ? 'Creating...' : 'Add Stock Balance'}
            </button>
          </form>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Filter Stock Balances</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Filter by Product</label>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md'
              >
                <option value=''>All Products</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Filter by Warehouse</label>
              <select
                value={filterWarehouse}
                onChange={(e) => setFilterWarehouse(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md'
              >
                <option value=''>All Warehouses</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} ({warehouse.shortCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Stock Balances</h2>

          {loading ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <p className='mt-2 text-gray-600'>Loading stock balances...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-500 mb-4'>{error}</p>
              <button
                onClick={fetchStockBalances}
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
              >
                Try Again
              </button>
            </div>
          ) : stockBalances.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No stock balances found.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-2 text-left'>Product</th>
                    <th className='px-4 py-2 text-left'>Warehouse</th>
                    <th className='px-4 py-2 text-left'>Location</th>
                    <th className='px-4 py-2 text-center'>Quantity</th>
                    <th className='px-4 py-2 text-center'>Reserved</th>
                    <th className='px-4 py-2 text-center'>Available</th>
                    <th className='px-4 py-2 text-center'>Last Updated</th>
                    <th className='px-4 py-2 text-center'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stockBalances.map(balance => (
                    <tr key={balance._id} className='border-t hover:bg-gray-50'>
                      <td className='px-4 py-2 font-medium'>{getProductName(balance.product)}</td>
                      <td className='px-4 py-2'>{getWarehouseName(balance.warehouse)}</td>
                      <td className='px-4 py-2'>{getLocationName(balance.location)}</td>
                      <td className='px-4 py-2 text-center font-semibold'>{balance.quantity}</td>
                      <td className='px-4 py-2 text-center text-orange-600'>{balance.reservedQuantity}</td>
                      <td className='px-4 py-2 text-center text-green-600 font-semibold'>
                        {balance.quantity - balance.reservedQuantity}
                      </td>
                      <td className='px-4 py-2 text-center text-sm'>
                        {new Date(balance.lastUpdatedAt).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-2 text-center'>
                        <button
                          onClick={() => deleteStockBalance(balance._id)}
                          className='bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StockBalance
