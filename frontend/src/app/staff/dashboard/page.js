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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <StaffNavbar currentPage="dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Welcome to your warehouse operations portal</p>
          <div className="w-24 h-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full mt-3"></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : dashboard ? (
          /* Statistics Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link href="/staff/receipts" className="group">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-blue-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">📥</div>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Receipts</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">{dashboard.receipts}</p>
                <p className="text-sm text-gray-600">Incoming stock to process</p>
                <div className="mt-4 flex items-center text-blue-600 group-hover:translate-x-1 transition-transform duration-200">
                  <span className="text-sm font-medium">View details</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>

            <Link href="/staff/deliveries" className="group">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">📦</div>
                  <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    Pending
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Deliveries</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">{dashboard.deliveries}</p>
                <p className="text-sm text-gray-600">Orders to pick/pack</p>
                <div className="mt-4 flex items-center text-green-600 group-hover:translate-x-1 transition-transform duration-200">
                  <span className="text-sm font-medium">View details</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>

            <Link href="/staff/transfers" className="group">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">↔️</div>
                  <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    In Progress
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Transfers</h3>
                <p className="text-3xl font-bold text-purple-600 mb-2">{dashboard.transfers}</p>
                <p className="text-sm text-gray-600">Stock movements to execute</p>
                <div className="mt-4 flex items-center text-purple-600 group-hover:translate-x-1 transition-transform duration-200">
                  <span className="text-sm font-medium">View details</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>

            <Link href="/staff/stock-count" className="group">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-orange-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">📊</div>
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    Scheduled
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Stock Counts</h3>
                <p className="text-3xl font-bold text-orange-600 mb-2">{dashboard.stockCounts}</p>
                <p className="text-sm text-gray-600">Cycle counts to complete</p>
                <div className="mt-4 flex items-center text-orange-600 group-hover:translate-x-1 transition-transform duration-200">
                  <span className="text-sm font-medium">View details</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          </div>
        ) : null}

        {/* Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
                <p className="text-gray-600">Frequently used tools and shortcuts</p>
              </div>
            </div>
            <div className="space-y-4">
              <Link href="/staff/product-lookup" className="group">
                <div className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg group-hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-200">🔍</span>
                    <div>
                      <div className="font-semibold">Product Lookup</div>
                      <div className="text-blue-100 text-sm">Search by SKU or scan barcodes</div>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/staff/location-stock" className="group">
                <div className="w-full bg-linear-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg group-hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-200">📍</span>
                    <div>
                      <div className="font-semibold">Location Stock</div>
                      <div className="text-green-100 text-sm">Check stock levels by location</div>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/staff/tasks" className="group">
                <div className="w-full bg-linear-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg group-hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-200">📋</span>
                    <div>
                      <div className="font-semibold">All Tasks</div>
                      <div className="text-purple-100 text-sm">View all assigned tasks</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-linear-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-400/20 p-3 rounded-lg mr-4">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Tips & Information</h2>
                <p className="text-gray-300">Helpful reminders for your daily tasks</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-white/5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                <span className="text-xl mr-3 mt-1">🔍</span>
                <div>
                  <h4 className="font-medium text-gray-200">Product Lookup</h4>
                  <p className="text-gray-400 text-sm mt-1">Use barcode scanning for faster product identification</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-white/5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                <span className="text-xl mr-3 mt-1">📍</span>
                <div>
                  <h4 className="font-medium text-gray-200">Stock Levels</h4>
                  <p className="text-gray-400 text-sm mt-1">Always check location stock before picking orders</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-white/5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                <span className="text-xl mr-3 mt-1">✅</span>
                <div>
                  <h4 className="font-medium text-gray-200">Task Completion</h4>
                  <p className="text-gray-400 text-sm mt-1">Mark receipts and deliveries as READY when complete</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-white/5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                <span className="text-xl mr-3 mt-1">📊</span>
                <div>
                  <h4 className="font-medium text-gray-200">Accuracy</h4>
                  <p className="text-gray-400 text-sm mt-1">Double-check quantities and locations for accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
