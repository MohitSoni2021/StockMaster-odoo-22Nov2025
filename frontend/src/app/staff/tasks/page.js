'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import StaffNavbar from '../../../components/StaffNavbar'
import { staffAPI } from '../../../utils/api'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('WAITING')
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchTasks()
  }, [filterType, filterStatus])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterType) params.type = filterType
      if (filterStatus) params.status = filterStatus
      
      const result = await staffAPI.getAssignedTasks(params)
      setTasks(result.data || [])
      setPagination(result.pagination || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTaskIcon = (type) => {
    const icons = {
      RECEIPT: '📥',
      DELIVERY: '📦',
      TRANSFER: '↔️',
      ADJUSTMENT: '📊'
    }
    return icons[type] || '📋'
  }

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
      WAITING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      READY: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
      COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
    }
    return configs[status] || configs.DRAFT
  }

  const getTaskUrl = (task) => {
    const urls = {
      RECEIPT: '/staff/receipts',
      DELIVERY: '/staff/deliveries',
      TRANSFER: '/staff/transfers',
      ADJUSTMENT: '/staff/stock-count'
    }
    return urls[task.type] || '/staff/tasks'
  }

  const taskTypes = [
    { value: '', label: 'All Types' },
    { value: 'RECEIPT', label: '📥 Receipts' },
    { value: 'DELIVERY', label: '📦 Deliveries' },
    { value: 'TRANSFER', label: '↔️ Transfers' },
    { value: 'ADJUSTMENT', label: '📊 Stock Counts' }
  ]

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'WAITING', label: 'Waiting' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'READY', label: 'Ready' },
    { value: 'COMPLETED', label: 'Completed' }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <StaffNavbar currentPage="tasks" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <span className="text-3xl">📋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="text-gray-600 text-lg">View and manage all assigned warehouse tasks</p>
            </div>
          </div>
          <div className="w-24 h-1 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full"></div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">🔍</span>
            Filter Tasks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
              >
                {taskTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchTasks}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="flex items-end justify-end">
              <div className="text-sm text-gray-600">
                {tasks.length} tasks found
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="text-red-400 mr-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Error Loading Tasks</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl text-gray-600 mb-2">No tasks found</p>
              <p className="text-gray-500">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task, index) => {
                const statusConfig = getStatusConfig(task.status)
                return (
                  <div 
                    key={task._id} 
                    className="group p-6 hover:bg-gray-50 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors duration-200">
                          <span className="text-2xl">{getTaskIcon(task.type)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 mr-3">
                              {task.reference}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center">
                              <span className="mr-1">📋</span>
                              Type: {task.type}
                            </span>
                            {task.from?.name && (
                              <span className="flex items-center">
                                <span className="mr-1">📍</span>
                                From: {task.from.name}
                              </span>
                            )}
                            {task.warehouse?.name && (
                              <span className="flex items-center">
                                <span className="mr-1">🏢</span>
                                Warehouse: {task.warehouse.name}
                              </span>
                            )}
                            <span className="flex items-center">
                              <span className="mr-1">📅</span>
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {task.priority && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                Priority: {task.priority}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {task.status === 'WAITING' && (
                          <Link href={getTaskUrl(task)} className="group-hover:scale-105 transition-transform duration-200">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
                              Start Task
                            </button>
                          </Link>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <Link href={getTaskUrl(task)} className="group-hover:scale-105 transition-transform duration-200">
                            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
                              Continue
                            </button>
                          </Link>
                        )}
                        {task.status === 'COMPLETED' && (
                          <div className="flex items-center text-green-600">
                            <span className="mr-2">✅</span>
                            <span className="font-medium">Completed</span>
                          </div>
                        )}
                        <Link href={getTaskUrl(task)}>
                          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <span className="text-lg">👁️</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/staff/receipts" className="group">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">📥</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                  Quick Access
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Process Receipts</h3>
              <p className="text-gray-600 text-sm">Handle incoming stock</p>
            </div>
          </Link>

          <Link href="/staff/deliveries" className="group">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-green-300 transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">📦</span>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                  Quick Access
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Process Deliveries</h3>
              <p className="text-gray-600 text-sm">Pick and pack orders</p>
            </div>
          </Link>

          <Link href="/staff/transfers" className="group">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">↔️</span>
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                  Quick Access
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Stock Transfers</h3>
              <p className="text-gray-600 text-sm">Move stock between locations</p>
            </div>
          </Link>

          <Link href="/staff/stock-count" className="group">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">📊</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                  Quick Access
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Stock Counts</h3>
              <p className="text-gray-600 text-sm">Perform cycle counts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TaskList