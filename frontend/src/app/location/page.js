'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'

const Location = () => {
  const [locations, setLocations] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    warehouse: '',
    name: '',
    shortCode: '',
    type: 'rack',
    capacity: 0,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    isActive: true
  })

  const LOCATION_TYPES = ['rack', 'room', 'bin', 'floor', 'zone']

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  useEffect(() => {
    if (formData.warehouse && !editingId) {
      const selectedWarehouse = warehouses.find(w => w._id === formData.warehouse)
      if (selectedWarehouse && !formData.shortCode) {
        setFormData(prev => ({
          ...prev,
          shortCode: selectedWarehouse.shortCode
        }))
      }
    }
  }, [formData.warehouse, warehouses, editingId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.warehouse || !formData.name || !formData.shortCode || !formData.type ||
        !formData.address.line1 || !formData.address.city || !formData.address.state ||
        !formData.address.postalCode || !formData.address.country) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const url = editingId 
        ? `http://localhost:5001/api/v1/locations/${editingId}`
        : 'http://localhost:5001/api/v1/locations'
      
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingId ? 'Location updated successfully!' : 'Location created successfully!')
        resetForm()
        fetchLocations()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Error saving location. Please try again.')
    }
  }

  const handleEdit = (location) => {
    setEditingId(location._id)
    setFormData({
      warehouse: location.warehouse._id || location.warehouse,
      name: location.name,
      shortCode: location.shortCode,
      type: location.type,
      capacity: location.capacity,
      address: {
        line1: location.address?.line1 || '',
        line2: location.address?.line2 || '',
        city: location.address?.city || '',
        state: location.address?.state || '',
        postalCode: location.address?.postalCode || '',
        country: location.address?.country || ''
      },
      isActive: location.isActive
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const response = await fetch(`http://localhost:5001/api/v1/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('Location deleted successfully!')
        fetchLocations()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Error deleting location. Please try again.')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      warehouse: '',
      name: '',
      shortCode: '',
      type: 'rack',
      capacity: 0,
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      isActive: true
    })
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

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5001/api/v1/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setLocations(result.data || [])
      } else if (response.status === 401) {
        setError('Authentication required. Please log in.')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch locations')
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
    fetchLocations()
  }, [])

  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Location Management</h1>

        {/* Create/Edit Location Form */}
        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>
            {editingId ? 'Edit Location' : 'Create New Location'}
          </h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              <div>
                <label className='block text-sm font-medium mb-1'>Location Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., Main Storage'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Short Code *</label>
                <input
                  type='text'
                  name='shortCode'
                  value={formData.shortCode}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md uppercase'
                  placeholder='e.g., LOC001'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Type *</label>
                <select
                  name='type'
                  value={formData.type}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                >
                  {LOCATION_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Capacity</label>
                <input
                  type='number'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='0'
                  min='0'
                />
              </div>
            </div>

            <div className='border-t pt-4'>
              <h3 className='text-lg font-medium mb-3'>Address Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium mb-1'>Address Line 1 *</label>
                  <input
                    type='text'
                    name='address.line1'
                    value={formData.address.line1}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Street address'
                    required
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium mb-1'>Address Line 2</label>
                  <input
                    type='text'
                    name='address.line2'
                    value={formData.address.line2}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Apartment, floor, etc. (optional)'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>City *</label>
                  <input
                    type='text'
                    name='address.city'
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='City'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>State *</label>
                  <input
                    type='text'
                    name='address.state'
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='State/Province'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Postal Code *</label>
                  <input
                    type='text'
                    name='address.postalCode'
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Postal code'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Country *</label>
                  <input
                    type='text'
                    name='address.country'
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Country'
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  name='isActive'
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className='w-4 h-4 border-gray-300 rounded'
                />
                <span className='ml-2 text-sm font-medium'>Active</span>
              </label>
            </div>

            <div className='flex gap-2'>
              <button
                type='submit'
                className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600'
              >
                {editingId ? 'Update Location' : 'Create Location'}
              </button>
              {editingId && (
                <button
                  type='button'
                  onClick={resetForm}
                  className='bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600'
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Locations List */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>All Locations</h2>

          {loading ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <p className='mt-2 text-gray-600'>Loading locations...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-500 mb-4'>{error}</p>
              <button
                onClick={fetchLocations}
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
              >
                Try Again
              </button>
            </div>
          ) : locations.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No locations created yet.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Code</th>
                    <th className='px-4 py-2 text-left'>Warehouse</th>
                    <th className='px-4 py-2 text-left'>Address</th>
                    <th className='px-4 py-2 text-left'>Type</th>
                    <th className='px-4 py-2 text-left'>Capacity</th>
                    <th className='px-4 py-2 text-left'>Status</th>
                    <th className='px-4 py-2 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(location => (
                    <tr key={location._id} className='border-t'>
                      <td className='px-4 py-2 font-medium'>{location.name}</td>
                      <td className='px-4 py-2 font-mono text-sm bg-gray-50'>{location.shortCode}</td>
                      <td className='px-4 py-2'>
                        <span className='text-sm'>
                          {typeof location.warehouse === 'object' 
                            ? `${location.warehouse.name} (${location.warehouse.shortCode})`
                            : location.warehouse
                          }
                        </span>
                      </td>
                      <td className='px-4 py-2'>
                        <div className='text-sm'>
                          <div>{location.address?.city}, {location.address?.state}</div>
                          <div className='text-gray-500'>{location.address?.postalCode}, {location.address?.country}</div>
                        </div>
                      </td>
                      <td className='px-4 py-2'>
                        <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800'>
                          {location.type}
                        </span>
                      </td>
                      <td className='px-4 py-2 text-center'>{location.capacity}</td>
                      <td className='px-4 py-2'>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          location.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {location.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-4 py-2'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEdit(location)}
                            className='bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(location._id)}
                            className='bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600'
                          >
                            Delete
                          </button>
                        </div>
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

export default Location
