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

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
      <StaffNavbar currentPage="product-lookup" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Product Lookup</h1>
          <p className="text-gray-600">Search products by SKU, name, or scan barcode</p>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-2">Search Term</label>
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
                  autoFocus
                  className="w-full border-2 border-black p-3 rounded-lg font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Search Type</label>
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value)
                    setSearchQuery('')
                    setResults([])
                  }}
                  className="w-full border-2 border-black p-3 rounded-lg"
                >
                  <option value="sku">SKU</option>
                  <option value="name">Name</option>
                  <option value="barcode">Barcode</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-bold text-lg transition-colors"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
            <p className="mt-4 text-gray-600">Searching products...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 text-center">
            <p className="text-lg text-yellow-800">{error}</p>
          </div>
        )}

        {!selectedProduct ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Search Results</h2>
              {results.length === 0 && !loading && !error ? (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center text-gray-600">
                  <p>No search results yet</p>
                  <p className="text-sm mt-2">Try searching for a product above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => setSelectedProduct(product)}
                      className="w-full text-left bg-white border-2 border-black rounded-lg p-4 hover:bg-black hover:text-white transition-colors"
                    >
                      <p className="font-bold text-lg">{product.sku}</p>
                      <p className="text-sm">{product.name}</p>
                      <p className="text-xs mt-1">Category: {product.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-2xl font-bold hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black text-white p-6 rounded-lg">
                <p className="text-sm text-gray-300">SKU</p>
                <p className="text-4xl font-bold mb-4">{selectedProduct.sku}</p>
                <p className="text-sm text-gray-300">Product Name</p>
                <p className="text-2xl font-semibold mb-4">{selectedProduct.name}</p>
                <p className="text-sm text-gray-300">Category</p>
                <p className="text-lg font-semibold mb-4">{selectedProduct.category}</p>
              </div>

              <div>
                <div className="bg-gray-50 border-2 border-black rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-bold mb-4">Product Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Unit of Measure</p>
                      <p className="font-semibold">{selectedProduct.defaultUom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit Cost</p>
                      <p className="font-semibold">₹{selectedProduct.perUnitCost?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reorder Point</p>
                      <p className="font-semibold">{selectedProduct.reorderPoint}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reorder Qty</p>
                      <p className="font-semibold">{selectedProduct.reorderQty}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Stock Levels by Location</h3>
              {selectedProduct.stocks && selectedProduct.stocks.length > 0 ? (
                <div className="space-y-3">
                  {selectedProduct.stocks.map((stock) => (
                    <div key={stock._id} className="bg-white border-2 border-gray-300 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg">
                            {stock.location?.shortCode || 'General'}
                          </p>
                          <p className="text-gray-600">{stock.location?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">On Hand</p>
                          <p className="text-2xl font-bold">{stock.quantity}</p>
                          <p className="text-xs text-gray-500">Reserved: {stock.reservedQuantity}</p>
                          <p className="text-xs text-green-600 font-semibold">
                            Available: {stock.availableQuantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 text-center">
                  <p className="text-yellow-800">No stock found for this product</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-bold"
              >
                Back to Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductLookup
