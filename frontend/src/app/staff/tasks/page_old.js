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

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      WAITING: 'bg-yellow-100 text-yellow-800',
      READY: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100'
  }

  const getTaskPath = (type) => {
    const paths = {
      RECEIPT: '/staff/receipts',
      DELIVERY: '/staff/deliveries',
      TRANSFER: '/staff/transfers',
      ADJUSTMENT: '/staff/stock-count'
    }
    return paths[type] || '/staff/tasks'
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
      <StaffNavbar currentPage="tasks" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assigned Tasks</h1>
          <p className="text-gray-600">View and manage your warehouse tasks</p>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Task Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border-2 border-black p-2 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="RECEIPT">Receipt (Incoming)</option>
                <option value="DELIVERY">Delivery (Outgoing)</option>
                <option value="TRANSFER">Transfer (Internal)</option>
                <option value="ADJUSTMENT">Stock Count</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border-2 border-black p-2 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="WAITING">Waiting</option>
                <option value="READY">Ready</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>Error: {error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-600">No tasks found</p>
            <p className="text-gray-500 mt-2">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{getTaskIcon(task.type)}</span>
                    <div>
                      <h3 className="text-xl font-bold">{task.type}</h3>
                      <p className="text-gray-600">{task.reference}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Warehouse</p>
                    <p className="font-semibold">{task.warehouse?.name}</p>
                  </div>
                  {task.from && (
                    <div>
                      <p className="text-gray-600">From</p>
                      <p className="font-semibold">{task.from?.name}</p>
                    </div>
                  )}
                  {task.to && (
                    <div>
                      <p className="text-gray-600">To</p>
                      <p className="font-semibold">{task.to?.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-semibold">{new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {task.notes && (
                  <div className="mb-4 bg-gray-50 p-3 rounded border-l-4 border-black">
                    <p className="text-sm text-gray-700">{task.notes}</p>
                  </div>
                )}

                <Link href={`${getTaskPath(task.type)}?task=${task._id}`}>
                  <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                    Open Task →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors">
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskList
