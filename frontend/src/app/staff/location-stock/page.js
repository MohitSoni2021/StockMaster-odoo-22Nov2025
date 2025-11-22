'use client'

import React, { useState, useEffect } from 'react'
import StaffNavbar from '../../../components/StaffNavbar'
import { staffAPI, locationAPI } from '../../../utils/api'

const LocationStock = () => {
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locationStock, setLocationStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stockLoading, setStockLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const result = await locationAPI.getLocations({ limit: 100 })
      setLocations(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocationStock = async (locationId) => {
    try {
      setStockLoading(true)
      const result = await staffAPI.getLocationStock(locationId)
      setLocationStock(result.data)
      setSelectedLocation(locationId)
    } catch (err) {
      setError(err.message)
    } finally {
      setStockLoading(false)
    }
  }

  const calculateTotalValue = () => {
    if (!locationStock?.stocks) return 0
    return locationStock.stocks.reduce((sum, stock) => {
      return sum + (stock.product?.perUnitCost * stock.quantity)
    }, 0)
  }

  const getLocationTypeColor = (type) => {
    const colors = {
      rack: 'bg-blue-100 text-blue-800',
      room: 'bg-purple-100 text-purple-800',
      bin: 'bg-green-100 text-green-800',
      floor: 'bg-orange-100 text-orange-800',
      zone: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
      <StaffNavbar currentPage="location-stock" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📍 Location Stock</h1>
          <p className="text-gray-600">View stock levels by location</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Locations</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
                  <p className="mt-2 text-gray-600">Loading locations...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">
                  {error}
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>No locations found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {locations.map((location) => (
                    <button
                      key={location._id}
                      onClick={() => fetchLocationStock(location._id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedLocation === location._id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      <p className="font-bold">{location.shortCode}</p>
                      <p className="text-xs">{location.name}</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${getLocationTypeColor(location.type)}`}>
                        {location.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedLocation ? (
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-12 text-center">
                <p className="text-xl text-gray-600">Select a location to view stock</p>
              </div>
            ) : stockLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
                <p className="mt-4 text-gray-600">Loading stock...</p>
              </div>
            ) : locationStock ? (
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="mb-6 p-4 bg-black text-white rounded-lg">
                  <p className="text-sm text-gray-300">Location</p>
                  <p className="text-3xl font-bold">{locationStock.location.shortCode}</p>
                  <p className="text-gray-300 mt-1">{locationStock.location.name}</p>
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="font-semibold capitalize">{locationStock.location.type}</p>
                  </div>
                  {locationStock.location.capacity > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400">Capacity</p>
                      <p className="font-semibold">{locationStock.location.capacity} units</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {locationStock.stocks?.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{calculateTotalValue().toFixed(2)}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Stock Items</h3>
                {!locationStock.stocks || locationStock.stocks.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center text-gray-600">
                    <p>No stock in this location</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {locationStock.stocks.map((stock) => (
                      <div key={stock._id} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 hover:border-black transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-lg">{stock.product?.sku}</p>
                            <p className="text-gray-600 text-sm">{stock.product?.name}</p>
                            <p className="text-xs text-gray-500">Category: {stock.product?.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="bg-black text-white px-3 py-2 rounded-lg">
                              <p className="text-xs text-gray-300">Quantity</p>
                              <p className="text-2xl font-bold">{stock.quantity}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Reserved</p>
                            <p className="font-semibold">{stock.reservedQuantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Available</p>
                            <p className="font-semibold text-green-600">{stock.availableQuantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unit Cost</p>
                            <p className="font-semibold">₹{stock.product?.perUnitCost?.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs text-gray-600">
                            Total Value: ₹{(stock.quantity * (stock.product?.perUnitCost || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-bold"
                  >
                    Back to Locations
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationStock
