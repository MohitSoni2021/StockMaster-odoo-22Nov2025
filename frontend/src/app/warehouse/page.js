'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    contact: {
      name: '',
      phone: '',
      email: ''
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Handle nested objects (address and contact)
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
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.shortCode || !formData.address.line1 ||
        !formData.address.city || !formData.address.state ||
        !formData.address.postalCode || !formData.address.country ||
        !formData.contact.name || !formData.contact.phone || !formData.contact.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/v1/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('Warehouse created successfully!')
        setFormData({
          name: '',
          shortCode: '',
          address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          contact: {
            name: '',
            phone: '',
            email: ''
          }
        })
        // Refresh the warehouses list
        fetchWarehouses()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating warehouse:', error)
      alert('Error creating warehouse. Please try again.')
    }
  }

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5001/api/v1/warehouses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setWarehouses(result.data || [])
      } else if (response.status === 401) {
        setError('Authentication required. Please log in.')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch warehouses')
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  return (
    <div>
      <Navbar />
      <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Warehouse Management</h1>

      {/* Register New Warehouse Form */}
      <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Register New Warehouse</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Warehouse Name *</label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Short Code *</label>
              <input
                type='text'
                name='shortCode'
                value={formData.shortCode}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md uppercase'
                placeholder='e.g., NYC001'
                required
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
                  required
                />
              </div>
            </div>
          </div>

          <div className='border-t pt-4'>
            <h3 className='text-lg font-medium mb-3'>Contact Information</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Contact Name *</label>
                <input
                  type='text'
                  name='contact.name'
                  value={formData.contact.name}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Phone *</label>
                <input
                  type='text'
                  name='contact.phone'
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-1'>Email *</label>
                <input
                  type='email'
                  name='contact.email'
                  value={formData.contact.email}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  required
                />
              </div>
            </div>
          </div>

          <button
            type='submit'
            className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 w-full md:w-auto'
          >
            Register Warehouse
          </button>
        </form>
      </div>

      {/* Available Warehouses List */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>Available Warehouses</h2>

        {loading ? (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            <p className='mt-2 text-gray-600'>Loading warehouses...</p>
          </div>
        ) : error ? (
          <div className='text-center py-8'>
            <p className='text-red-500 mb-4'>{error}</p>
            <button
              onClick={fetchWarehouses}
              className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
            >
              Try Again
            </button>
          </div>
        ) : warehouses.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>No warehouses registered yet.</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='px-4 py-2 text-left'>Name</th>
                  <th className='px-4 py-2 text-left'>Short Code</th>
                  <th className='px-4 py-2 text-left'>City</th>
                  <th className='px-4 py-2 text-left'>State</th>
                  <th className='px-4 py-2 text-left'>Contact</th>
                  <th className='px-4 py-2 text-left'>Status</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map(warehouse => (
                  <tr key={warehouse._id} className='border-t'>
                    <td className='px-4 py-2 font-medium'>{warehouse.name}</td>
                    <td className='px-4 py-2 font-mono text-sm bg-gray-50'>{warehouse.shortCode}</td>
                    <td className='px-4 py-2'>{warehouse.address?.city}</td>
                    <td className='px-4 py-2'>{warehouse.address?.state}</td>
                    <td className='px-4 py-2'>
                      <div className='text-sm'>
                        <div>{warehouse.contact?.name}</div>
                        <div className='text-gray-500'>{warehouse.contact?.email}</div>
                      </div>
                    </td>
                    <td className='px-4 py-2'>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        warehouse.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
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

export default Warehouse