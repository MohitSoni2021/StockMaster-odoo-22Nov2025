'use client'

import React, { useState, useEffect } from 'react'
import StaffNavbar from '../../../components/StaffNavbar'
import { staffAPI } from '../../../utils/api'

const StaffReceipts = () => {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetails, setTaskDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [lineUpdates, setLineUpdates] = useState({})
  const [photos, setPhotos] = useState({})

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const result = await staffAPI.getAssignedTasks({ type: 'RECEIPT', status: 'WAITING' })
      setTasks(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskDetails = async (taskId) => {
    try {
      const result = await staffAPI.getTaskDetail(taskId)
      setTaskDetails(result.data)
      setSelectedTask(taskId)
      setLineUpdates({})
      setPhotos({})
    } catch (err) {
      setError(err.message)
    }
  }

  const handleQuantityChange = (lineId, quantity) => {
    setLineUpdates(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        lineId,
        receivedQuantity: parseFloat(quantity) || 0
      }
    }))
  }

  const handlePhotoUpload = (lineId, file) => {
    setPhotos(prev => ({
      ...prev,
      [lineId]: file
    }))
  }

  const handleSubmitReceipt = async () => {
    try {
      if (Object.keys(lineUpdates).length === 0) {
        alert('Please enter at least one quantity')
        return
      }

      setSubmitting(true)
      const updates = Object.values(lineUpdates).filter(u => u.receivedQuantity > 0)
      
      await staffAPI.performReceipt(selectedTask, updates)
      alert('Receipt processed successfully!')
      setSelectedTask(null)
      setTaskDetails(null)
      fetchReceipts()
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <StaffNavbar currentPage="receipts" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <span className="text-3xl">📥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Process Receipts
              </h1>
              <p className="text-gray-600 text-lg">Receive incoming stock and update quantities</p>
            </div>
          </div>
          <div className="w-24 h-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full"></div>
        </div>

        {!selectedTask ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Available Receipts</h2>
              <button
                onClick={fetchReceipts}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
              >
                🔄 Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading receipts...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="text-red-400 mr-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Error Loading Receipts</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl text-gray-600 mb-2">No pending receipts</p>
                <p className="text-gray-500">Check back later for new receipt tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div 
                    key={task._id} 
                    className="group border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="bg-blue-100 p-2 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors duration-200">
                            <span className="text-xl">📥</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{task.reference}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>📍 From: {task.from?.name}</span>
                              <span>🏢 Warehouse: {task.warehouse?.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            Ready to Process
                          </span>
                          <span className="text-gray-500">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => fetchTaskDetails(task._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg group-hover:scale-105"
                      >
                        <span className="flex items-center">
                          Open
                          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : taskDetails ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{taskDetails.document.reference}</h2>
                  <p className="text-blue-100 mt-1">Receipt Processing</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">From Location</p>
                  <p className="font-semibold text-gray-800">{taskDetails.document.from?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Warehouse</p>
                  <p className="font-semibold text-gray-800">{taskDetails.document.warehouse?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="font-semibold text-gray-800">{new Date(taskDetails.document.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {taskDetails.document.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {taskDetails.document.notes && (
              <div className="p-6 bg-yellow-50 border-b border-yellow-200">
                <div className="flex items-start">
                  <div className="text-yellow-400 mr-3 mt-1">
                    <span className="text-lg">📝</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Special Instructions</h4>
                    <p className="text-yellow-700">{taskDetails.document.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Items Section */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">📦</span>
                Receipt Items
              </h3>
              <div className="space-y-6">
                {taskDetails.lines.map((line, index) => (
                  <div 
                    key={line._id} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Product SKU</p>
                          <p className="font-semibold text-lg text-gray-800">{line.product?.sku}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Product Name</p>
                          <p className="text-gray-700">{line.product?.name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected Quantity</p>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-blue-600">{line.quantity}</span>
                          <span className="text-gray-600 ml-2">{line.uom}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Received Quantity *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={lineUpdates[line._id]?.receivedQuantity || ''}
                          onChange={(e) => handleQuantityChange(line._id, e.target.value)}
                          placeholder="Enter received quantity"
                          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(line._id, e.target.files?.[0])}
                          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                        {photos[line._id] && (
                          <div className="mt-2 flex items-center text-green-600">
                            <span className="mr-2">✓</span>
                            <p className="text-sm">Photo attached</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmitReceipt}
                  disabled={submitting || Object.keys(lineUpdates).length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">✓</span>
                      Mark as READY
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default StaffReceipts