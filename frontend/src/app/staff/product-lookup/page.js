'use client'

import React, { useState } from 'react'
import StaffNavbar from '../../../components/StaffNavbar'
import { staffAPI } from '../../../utils/api'

const ProductLookup = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('sku')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      alert('Please enter a search term')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const params = {}
      if (searchType === 'sku') {
        params.sku = searchQuery
      } else if (searchType === 'name') {
        params.name = searchQuery
      } else if (searchType === 'barcode') {
        params.barcode = searchQuery
      }

      const result = await staffAPI.searchProduct(params)
      setResults(result.data || [])
      
      if (!result.data || result.data.length === 0) {
        setError('No products found')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter' && searchType === 'barcode') {
      handleSearch(e)
    }
  }

  const searchTypeOptions = [
    { value: 'sku', label: 'SKU', icon: '📋' },
    { value: 'name', label: 'Product Name', icon: '🏷️' },
    { value: 'barcode', label: 'Barcode', icon: '📱' }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <StaffNavbar currentPage="product-lookup" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <span className="text-3xl">🔍</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Product Lookup
              </h1>
              <p className="text-gray-600 text-lg">Search products by SKU, name, or scan barcode</p>
            </div>
          </div>
          <div className="w-24 h-1 bg-linear-to-r from-green-500 to-teal-500 rounded-full"></div>
        </div>

        {/* Search Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Search Term
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">
                      {searchType === 'barcode' ? '📱' : searchType === 'sku' ? '📋' : '🏷️'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleBarcodeScan}
                    placeholder={
                      searchType === 'barcode'
                        ? 'Scan barcode here...'
                        : searchType === 'sku'
                        ? 'Enter SKU (e.g., SKU001)...'
                        : 'Enter product name...'
                    }
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                    autoFocus
                  />
                  {searchType === 'barcode' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-pulse">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-sm text-green-600 font-medium">Ready to scan</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Search Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                >
                  {searchTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🔍</span>
                    Search Product
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setResults([])
                  setError(null)
                  setSelectedProduct(null)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear
              </button>
            </div>

            {/* Quick Search Tips */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 Search Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• For barcode scanning: Select 'Barcode' and use the input field</li>
                <li>• SKU search: Use exact SKU codes for best results</li>
                <li>• Name search: Use partial product names for broader results</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-400 mr-3">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">No Results Found</h3>
                <p className="text-yellow-700 mt-1">{error}</p>
                <p className="text-yellow-600 text-sm mt-2">Try using different search terms or search type</p>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-green-500 to-teal-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">📦</span>
                Search Results ({results.length} found)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {results.map((product, index) => (
                <div 
                  key={product._id} 
                  className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedProduct(selectedProduct?._id === product._id ? null : product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="bg-green-100 p-2 rounded-lg mr-4">
                          <span className="text-xl">📦</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{product.sku}</h3>
                          <p className="text-gray-600">{product.name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Category</p>
                          <p className="font-medium text-gray-800">{product.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Unit of Measure</p>
                          <p className="font-medium text-gray-800">{product.uom}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Cost Price</p>
                          <p className="font-medium text-gray-800">${product.costPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                          <p className="font-medium text-gray-800">${product.sellingPrice}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {product.totalStock || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Stock</div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <span className="text-lg">
                          {selectedProduct?._id === product._id ? '🔼' : '🔽'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Product Details */}
                  {selectedProduct?._id === product._id && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">📋</span>
                        Product Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Basic Information</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Description:</span>
                              <span className="font-medium">{product.description || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium">{product.weight || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dimensions:</span>
                              <span className="font-medium">{product.dimensions || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Barcode:</span>
                              <span className="font-medium font-mono bg-white px-2 py-1 rounded">
                                {product.barcode || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Stock Levels</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Available:</span>
                              <span className="font-medium text-green-600">{product.availableStock || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reserved:</span>
                              <span className="font-medium text-yellow-600">{product.reservedStock || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Min Stock:</span>
                              <span className="font-medium text-red-600">{product.minStockLevel || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Max Stock:</span>
                              <span className="font-medium text-blue-600">{product.maxStockLevel || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location Stock Breakdown */}
                      {product.locationStock && product.locationStock.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                            <span className="mr-2">📍</span>
                            Stock by Location
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {product.locationStock.map((location, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">{location.name}</span>
                                  <span className="text-sm font-bold text-green-600">{location.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductLookup