'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import StaffNavbar from '../../../components/StaffNavbar'
import { staffAPI } from '../../../utils/api'

const StaffDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const result = await staffAPI.getDashboard()
      setDashboard(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
      <StaffNavbar currentPage="dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">Welcome to your warehouse operations portal</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>Error: {error}</p>
          </div>
        ) : dashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/staff/receipts">
              <div className="bg-white border-2 border-black p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">📥</div>
                <h3 className="text-lg font-semibold mb-2">Receipts</h3>
                <p className="text-3xl font-bold text-black">{dashboard.receipts}</p>
                <p className="text-sm text-gray-600 mt-2">Incoming stock to process</p>
              </div>
            </Link>

            <Link href="/staff/deliveries">
              <div className="bg-white border-2 border-black p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-2">Deliveries</h3>
                <p className="text-3xl font-bold text-black">{dashboard.deliveries}</p>
                <p className="text-sm text-gray-600 mt-2">Orders to pick/pack</p>
              </div>
            </Link>

            <Link href="/staff/transfers">
              <div className="bg-white border-2 border-black p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">↔️</div>
                <h3 className="text-lg font-semibold mb-2">Transfers</h3>
                <p className="text-3xl font-bold text-black">{dashboard.transfers}</p>
                <p className="text-sm text-gray-600 mt-2">Stock movements to execute</p>
              </div>
            </Link>

            <Link href="/staff/stock-count">
              <div className="bg-white border-2 border-black p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">Stock Counts</h3>
                <p className="text-3xl font-bold text-black">{dashboard.stockCounts}</p>
                <p className="text-sm text-gray-600 mt-2">Cycle counts to complete</p>
              </div>
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white border-2 border-black p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/staff/product-lookup">
                <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-left pl-4 font-semibold">
                  🔍 Product Lookup
                </button>
              </Link>
              <Link href="/staff/location-stock">
                <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-left pl-4 font-semibold">
                  📍 Location Stock
                </button>
              </Link>
              <Link href="/staff/tasks">
                <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-left pl-4 font-semibold">
                  📋 All Tasks
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-black text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Information</h2>
            <div className="space-y-3 text-sm">
              <p>💡 Use the Product Lookup to search by SKU or scan barcodes</p>
              <p>📍 Check location stock levels before picking orders</p>
              <p>📋 View all assigned tasks in the Tasks section</p>
              <p>✅ Mark receipts and deliveries as READY when complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
