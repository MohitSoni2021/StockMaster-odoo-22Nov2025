'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'

const WarehouseDetails = () => {
  const router = useRouter()
  const params = useParams()
  const warehouseId = params.id

  const [warehouseData, setWarehouseData] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('details')

  const fetchWarehouseDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `http://localhost:5001/api/v1/warehouses/${warehouseId}/details`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        const result = await response.json()
        setWarehouseData(result.data.warehouse)
        setLocations(result.data.locations || [])
      } else if (response.status === 401) {
        setError('Authentication required. Please log in.')
        router.push('/auth/login')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch warehouse details')
      }
    } catch (error) {
      console.error('Error fetching warehouse details:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseDetails()
    }
  }, [warehouseId])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className='p-6'>
          <div className='text-center py-16'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            <p className='mt-2 text-gray-600'>Loading warehouse details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className='p-6'>
          <div className='bg-red-50 p-8 rounded-lg text-center'>
            <p className='text-red-500 mb-4'>{error}</p>
            <button
              onClick={() => router.back()}
              className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!warehouseData) {
    return (
      <div>
        <Navbar />
        <div className='p-6'>
          <div className='text-center py-16'>
            <p className='text-gray-500 text-lg'>Warehouse not found</p>
            <button
              onClick={() => router.back()}
              className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4'
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <button
              onClick={() => router.back()}
              className='text-blue-500 hover:text-blue-700 font-medium mb-2'
            >
              ← Back
            </button>
            <h1 className='text-3xl font-bold'>{warehouseData.name}</h1>
            <p className='text-gray-600 text-sm mt-1'>Short Code: <span className='font-mono bg-gray-100 px-2 py-1'>{warehouseData.shortCode}</span></p>
          </div>
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              warehouseData.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {warehouseData.isActive ? '● Active' : '● Inactive'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='flex border-b mb-6'>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Warehouse Details
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Locations ({locations.length})
          </button>
        </div>

        {/* Warehouse Details Tab */}
        {activeTab === 'details' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Address Information */}
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-lg font-semibold mb-4 pb-2 border-b'>Address Information</h2>
              <div className='space-y-3'>
                <div>
                  <p className='text-gray-600 text-sm'>Street Address</p>
                  <p className='font-medium'>{warehouseData.address?.line1}</p>
                  {warehouseData.address?.line2 && (
                    <p className='font-medium'>{warehouseData.address.line2}</p>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-gray-600 text-sm'>City</p>
                    <p className='font-medium'>{warehouseData.address?.city}</p>
                  </div>
                  <div>
                    <p className='text-gray-600 text-sm'>State</p>
                    <p className='font-medium'>{warehouseData.address?.state}</p>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-gray-600 text-sm'>Postal Code</p>
                    <p className='font-medium'>{warehouseData.address?.postalCode}</p>
                  </div>
                  <div>
                    <p className='text-gray-600 text-sm'>Country</p>
                    <p className='font-medium'>{warehouseData.address?.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-lg font-semibold mb-4 pb-2 border-b'>Contact Information</h2>
              <div className='space-y-4'>
                <div>
                  <p className='text-gray-600 text-sm'>Contact Person</p>
                  <p className='font-medium text-lg'>{warehouseData.contact?.name}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Email</p>
                  <a
                    href={`mailto:${warehouseData.contact?.email}`}
                    className='text-blue-600 hover:text-blue-800 font-medium'
                  >
                    {warehouseData.contact?.email}
                  </a>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Phone</p>
                  <a
                    href={`tel:${warehouseData.contact?.phone}`}
                    className='text-blue-600 hover:text-blue-800 font-medium'
                  >
                    {warehouseData.contact?.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            <div className='bg-white p-6 rounded-lg shadow-md lg:col-span-2'>
              <h2 className='text-lg font-semibold mb-4 pb-2 border-b'>Additional Information</h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <p className='text-gray-600 text-sm'>Created</p>
                  <p className='font-medium text-sm'>
                    {new Date(warehouseData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Last Updated</p>
                  <p className='font-medium text-sm'>
                    {new Date(warehouseData.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Warehouse ID</p>
                  <p className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>{warehouseData._id}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-sm'>Total Locations</p>
                  <p className='font-medium text-lg'>{locations.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>All Locations</h2>

            {locations.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-gray-500 text-lg'>No locations found for this warehouse</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Name</th>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Short Code</th>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Type</th>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Capacity</th>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Address</th>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Status</th>
                      <th className='px-4 py-3 text-left text-sm font-semibold'>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map(location => (
                      <tr key={location._id} className='border-t hover:bg-gray-50'>
                        <td className='px-4 py-3 font-medium'>{location.name}</td>
                        <td className='px-4 py-3 font-mono text-sm bg-gray-50'>{location.shortCode}</td>
                        <td className='px-4 py-3'>
                          <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium'>
                            {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span className='bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs'>
                            {location.capacity} units
                          </span>
                        </td>
                        <td className='px-4 py-3 text-sm'>
                          <div>
                            <p className='font-medium'>{location.address?.city}, {location.address?.state}</p>
                            <p className='text-gray-600'>{location.address?.country}</p>
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            location.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {location.isActive ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-sm'>
                          {new Date(location.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WarehouseDetails
