'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'

const StockLedger = () => {
  const [ledgers, setLedgers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [filterProduct, setFilterProduct] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [filterMovementType, setFilterMovementType] = useState('')
  const [viewStatsModal, setViewStatsModal] = useState(false)
  const [stats, setStats] = useState(null)

  const [formData, setFormData] = useState({
    product: '',
    fromWarehouse: '',
    fromLocation: '',
    toWarehouse: '',
    toLocation: '',
    quantity: 0,
    movementType: 'IN',
    performedBy: ''
  })

  const movementTypes = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'quantity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else if (name === 'fromWarehouse') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        fromLocation: ''
      }))
      if (value) {
        fetchLocationsByWarehouse(value, 'from')
      }
    } else if (name === 'toWarehouse') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        toLocation: ''
      }))
      if (value) {
        fetchLocationsByWarehouse(value, 'to')
      }
    } else if (name === 'movementType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        fromWarehouse: '',
        toWarehouse: '',
        fromLocation: '',
        toLocation: ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.product || !formData.quantity || !formData.performedBy) {
      alert('Please fill all required fields')
      return
    }

    if (formData.movementType === 'OUT' && (!formData.fromWarehouse || !formData.fromLocation)) {
      alert('For OUT movement, please select from warehouse and location')
      return
    }

    if (formData.movementType === 'IN' && (!formData.toWarehouse || !formData.toLocation)) {
      alert('For IN movement, please select to warehouse and location')
      return
    }

    if (formData.movementType === 'TRANSFER') {
      if (!formData.fromWarehouse || !formData.fromLocation || !formData.toWarehouse || !formData.toLocation) {
        alert('For TRANSFER, please select both from and to warehouse/location')
        return
      }
    }

    if (formData.movementType === 'ADJUSTMENT' && (!formData.toWarehouse || !formData.toLocation)) {
      alert('For ADJUSTMENT, please select to warehouse and location')
      return
    }

    try {
      setSubmitLoading(true)
      const response = await fetch('http://localhost:5001/api/v1/stock-ledgers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Stock ledger created successfully!')
        setFormData({
          product: '',
          fromWarehouse: '',
          fromLocation: '',
          toWarehouse: '',
          toLocation: '',
          quantity: 0,
          movementType: 'IN',
          performedBy: ''
        })
        fetchStockLedgers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating stock ledger:', error)
      alert('Error creating stock ledger. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const fetchStockLedgers = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = 'http://localhost:5001/api/v1/stock-ledgers'
      const params = new URLSearchParams()
      if (filterProduct) params.append('product', filterProduct)
      if (filterWarehouse) params.append('fromWarehouse', filterWarehouse)
      if (filterMovementType) params.append('movementType', filterMovementType)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setLedgers(result.data || [])
      } else if (response.status === 401) {
        setError('Authentication required. Please log in.')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch stock ledgers')
      }
    } catch (error) {
      console.error('Error fetching stock ledgers:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStockLedgerStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/stock-ledgers/stats/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
        setViewStatsModal(true)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  const fetchLocationsByWarehouse = async (warehouseId, type) => {
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchWarehouses()
    fetchUsers()
    fetchStockLedgers()
  }, [filterProduct, filterWarehouse, filterMovementType])

  const deleteLedger = async (id) => {
    if (!confirm('Are you sure you want to delete this stock ledger?')) return

    try {
      const response = await fetch(`http://localhost:5001/api/v1/stock-ledgers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('Stock ledger deleted successfully!')
        fetchStockLedgers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting stock ledger:', error)
      alert('Error deleting stock ledger.')
    }
  }

  const getProductName = (product) => {
    if (!product) return '-'
    if (typeof product === 'object' && product.name) {
      return `${product.sku} - ${product.name}`
    }
    const foundProduct = products.find(p => p._id === product)
    return foundProduct ? `${foundProduct.sku} - ${foundProduct.name}` : product
  }

  const getWarehouseName = (warehouse) => {
    if (!warehouse) return '-'
    if (typeof warehouse === 'object' && warehouse.name) {
      return `${warehouse.name} (${warehouse.shortCode})`
    }
    const foundWarehouse = warehouses.find(w => w._id === warehouse)
    return foundWarehouse ? `${foundWarehouse.name} (${foundWarehouse.shortCode})` : warehouse
  }

  const getLocationName = (location) => {
    if (!location) return '-'
    if (typeof location === 'object' && location.name) {
      return `${location.name} (${location.code})`
    }
    return location
  }

  const getUserName = (user) => {
    if (!user) return '-'
    if (typeof user === 'object' && user.name) {
      return user.name
    }
    const foundUser = users.find(u => u._id === user)
    return foundUser ? foundUser.name : user
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMovementTypeColor = (type) => {
    const colors = {
      'IN': 'bg-green-100 text-green-800',
      'OUT': 'bg-red-100 text-red-800',
      'TRANSFER': 'bg-blue-100 text-blue-800',
      'ADJUSTMENT': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Stock Ledger Management</h1>
          <button
            onClick={fetchStockLedgerStats}
            className='bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600'
          >
            View Stats
          </button>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Create Stock Ledger Entry</h2>
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
                <label className='block text-sm font-medium mb-1'>Movement Type *</label>
                <select
                  name='movementType'
                  value={formData.movementType}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                >
                  {movementTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Quantity *</label>
                <input
                  type='number'
                  name='quantity'
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., 100'
                  step='0.01'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Performed By *</label>
                <select
                  name='performedBy'
                  value={formData.performedBy}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                >
                  <option value=''>Select a user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(formData.movementType === 'OUT' || formData.movementType === 'TRANSFER') && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded'>
                <div>
                  <label className='block text-sm font-medium mb-1'>From Warehouse *</label>
                  <select
                    name='fromWarehouse'
                    value={formData.fromWarehouse}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    required
                  >
                    <option value=''>Select warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} ({warehouse.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>From Location *</label>
                  <select
                    name='fromLocation'
                    value={formData.fromLocation}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    disabled={!formData.fromWarehouse}
                    required
                  >
                    <option value=''>Select location</option>
                    {locations.map(location => (
                      <option key={location._id} value={location._id}>
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {(formData.movementType === 'IN' || formData.movementType === 'TRANSFER' || formData.movementType === 'ADJUSTMENT') && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded'>
                <div>
                  <label className='block text-sm font-medium mb-1'>To Warehouse *</label>
                  <select
                    name='toWarehouse'
                    value={formData.toWarehouse}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    required
                  >
                    <option value=''>Select warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} ({warehouse.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>To Location *</label>
                  <select
                    name='toLocation'
                    value={formData.toLocation}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    disabled={!formData.toWarehouse}
                    required
                  >
                    <option value=''>Select location</option>
                    {locations.map(location => (
                      <option key={location._id} value={location._id}>
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type='submit'
              disabled={submitLoading}
              className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 w-full md:w-auto disabled:bg-gray-400'
            >
              {submitLoading ? 'Creating...' : 'Create Entry'}
            </button>
          </form>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Filter Stock Ledgers</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
            <div>
              <label className='block text-sm font-medium mb-1'>Filter by Movement Type</label>
              <select
                value={filterMovementType}
                onChange={(e) => setFilterMovementType(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md'
              >
                <option value=''>All Types</option>
                {movementTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Stock Ledger Entries</h2>

          {loading ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <p className='mt-2 text-gray-600'>Loading stock ledgers...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-500 mb-4'>{error}</p>
              <button
                onClick={fetchStockLedgers}
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
              >
                Try Again
              </button>
            </div>
          ) : ledgers.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No stock ledger entries found.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='bg-gray-100 border-b'>
                    <th className='px-4 py-2 text-left'>Reference</th>
                    <th className='px-4 py-2 text-left'>Product</th>
                    <th className='px-4 py-2 text-left'>Type</th>
                    <th className='px-4 py-2 text-left'>From Location</th>
                    <th className='px-4 py-2 text-left'>To Location</th>
                    <th className='px-4 py-2 text-right'>Quantity</th>
                    <th className='px-4 py-2 text-right'>Before</th>
                    <th className='px-4 py-2 text-right'>After</th>
                    <th className='px-4 py-2 text-left'>Performed By</th>
                    <th className='px-4 py-2 text-left'>Timestamp</th>
                    <th className='px-4 py-2 text-center'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((ledger) => (
                    <tr key={ledger._id} className='border-b hover:bg-gray-50'>
                      <td className='px-4 py-2 font-mono text-sm'>{ledger.reference}</td>
                      <td className='px-4 py-2'>{getProductName(ledger.product)}</td>
                      <td className='px-4 py-2'>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getMovementTypeColor(ledger.movementType)}`}>
                          {ledger.movementType}
                        </span>
                      </td>
                      <td className='px-4 py-2 text-sm'>
                        {getWarehouseName(ledger.fromWarehouse)} {ledger.fromLocation && `/ ${getLocationName(ledger.fromLocation)}`}
                      </td>
                      <td className='px-4 py-2 text-sm'>
                        {getWarehouseName(ledger.toWarehouse)} {ledger.toLocation && `/ ${getLocationName(ledger.toLocation)}`}
                      </td>
                      <td className='px-4 py-2 text-right font-semibold'>{ledger.quantity}</td>
                      <td className='px-4 py-2 text-right text-gray-600'>{ledger.beforeQty}</td>
                      <td className='px-4 py-2 text-right text-gray-600'>{ledger.afterQty}</td>
                      <td className='px-4 py-2 text-sm'>{getUserName(ledger.performedBy)}</td>
                      <td className='px-4 py-2 text-sm'>{formatDate(ledger.timestamp)}</td>
                      <td className='px-4 py-2 text-center'>
                        <button
                          onClick={() => deleteLedger(ledger._id)}
                          className='text-red-600 hover:text-red-800 text-sm font-medium'
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

      {viewStatsModal && stats && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>Stock Ledger Statistics</h2>
              <button
                onClick={() => setViewStatsModal(false)}
                className='text-gray-500 hover:text-gray-700 text-2xl'
              >
                ×
              </button>
            </div>

            <div className='mb-6'>
              <p className='text-lg font-semibold mb-2'>Total Ledger Entries: {stats.total}</p>
            </div>

            <div className='mb-6'>
              <h3 className='font-semibold mb-3'>By Movement Type</h3>
              <div className='space-y-2'>
                {stats.byMovementType && stats.byMovementType.map((item) => (
                  <div key={item._id} className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getMovementTypeColor(item._id)}`}>
                      {item._id}
                    </span>
                    <span className='font-semibold'>
                      Count: {item.count} | Total Qty: {item.totalQty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {stats.recent && (
              <div>
                <h3 className='font-semibold mb-3'>Recent Entries</h3>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {stats.recent.map((entry) => (
                    <div key={entry._id} className='p-2 bg-gray-50 rounded text-sm'>
                      <p className='font-mono text-xs text-gray-600'>{entry.reference}</p>
                      <p>{getProductName(entry.product)} - {entry.quantity} units - {entry.movementType}</p>
                      <p className='text-gray-500 text-xs'>{formatDate(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StockLedger
