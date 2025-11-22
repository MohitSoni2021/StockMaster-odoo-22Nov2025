'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

const Product = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    defaultUom: 'PIECE',
    perUnitCost: '',
    reorderPoint: 10,
    reorderQty: 50,
    meta: {}
  })

  const uomOptions = ['PIECE', 'KG', 'LTR', 'MTR', 'BOX', 'PACK', 'CASE', 'BUNDLE', 'UNIT', 'OTHER']

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'perUnitCost' || name === 'reorderPoint' || name === 'reorderQty') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || ''
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

    if (!formData.name || !formData.category || !formData.perUnitCost) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitLoading(true)
      const response = await fetch('http://localhost:5001/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Product created successfully! SKU: ${result.data.sku}`)
        setFormData({
          name: '',
          category: '',
          defaultUom: 'PIECE',
          perUnitCost: '',
          reorderPoint: 10,
          reorderQty: 50,
          meta: {}
        })
        fetchProducts()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error creating product. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5001/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setProducts(result.data || [])
      } else if (response.status === 401) {
        setError('Authentication required. Please log in.')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Product Management</h1>

        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Create New Product</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Product Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., Laptop'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Category *</label>
                <input
                  type='text'
                  name='category'
                  value={formData.category}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., Electronics'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Unit of Measurement *</label>
                <select
                  name='defaultUom'
                  value={formData.defaultUom}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                >
                  {uomOptions.map(uom => (
                    <option key={uom} value={uom}>{uom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Per Unit Cost *</label>
                <input
                  type='number'
                  name='perUnitCost'
                  value={formData.perUnitCost}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., 999.99'
                  step='0.01'
                  min='0'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Reorder Point</label>
                <input
                  type='number'
                  name='reorderPoint'
                  value={formData.reorderPoint}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., 10'
                  min='0'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Reorder Quantity</label>
                <input
                  type='number'
                  name='reorderQty'
                  value={formData.reorderQty}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., 50'
                  min='1'
                />
              </div>
            </div>

            <div className='bg-blue-50 p-3 rounded-md text-sm text-blue-700'>
              <p><strong>Note:</strong> SKU will be automatically generated from the product name, category, and current date.</p>
            </div>

            <button
              type='submit'
              disabled={submitLoading}
              className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 w-full md:w-auto disabled:bg-gray-400'
            >
              {submitLoading ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Available Products</h2>

          {loading ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <p className='mt-2 text-gray-600'>Loading products...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-500 mb-4'>{error}</p>
              <button
                onClick={fetchProducts}
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No products created yet.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-2 text-left'>SKU</th>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Category</th>
                    <th className='px-4 py-2 text-left'>UOM</th>
                    <th className='px-4 py-2 text-left'>Unit Cost</th>
                    <th className='px-4 py-2 text-left'>Reorder Point</th>
                    <th className='px-4 py-2 text-left'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className='border-t hover:bg-gray-50'>
                      <td className='px-4 py-2 font-mono text-sm bg-gray-50'>{product.sku}</td>
                      <td className='px-4 py-2 font-medium'>{product.name}</td>
                      <td className='px-4 py-2'>{product.category}</td>
                      <td className='px-4 py-2 text-center'>{product.defaultUom}</td>
                      <td className='px-4 py-2 text-right'>₹{product.perUnitCost.toFixed(2)}</td>
                      <td className='px-4 py-2 text-center'>{product.reorderPoint}</td>
                      <td className='px-4 py-2'>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
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

export default Product
