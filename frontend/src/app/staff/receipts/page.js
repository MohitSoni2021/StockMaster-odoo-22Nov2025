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
    <div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
      <StaffNavbar currentPage="receipts" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📥 Process Receipts</h1>
          <p className="text-gray-600">Receive incoming stock and update quantities</p>
        </div>

        {!selectedTask ? (
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Available Receipts</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
                <p className="mt-4 text-gray-600">Loading receipts...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                <p>Error: {error}</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-xl">No pending receipts</p>
                <p className="mt-2">Check back later for new receipt tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task._id} className="border-2 border-gray-300 rounded-lg p-4 hover:border-black transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{task.reference}</h3>
                        <p className="text-gray-600">From: {task.from?.name}</p>
                        <p className="text-sm text-gray-500">Warehouse: {task.warehouse?.name}</p>
                      </div>
                      <button
                        onClick={() => fetchTaskDetails(task._id)}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-semibold"
                      >
                        Open →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : taskDetails ? (
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{taskDetails.document.reference}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-2xl font-bold hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">From</p>
                <p className="font-semibold">{taskDetails.document.from?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Warehouse</p>
                <p className="font-semibold">{taskDetails.document.warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold">{new Date(taskDetails.document.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{taskDetails.document.status}</p>
              </div>
            </div>

            {taskDetails.document.notes && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="text-sm font-semibold text-yellow-800">{taskDetails.document.notes}</p>
              </div>
            )}

            <h3 className="text-xl font-bold mb-4">Receipt Items</h3>
            <div className="space-y-4">
              {taskDetails.lines.map((line) => (
                <div key={line._id} className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Product</p>
                      <p className="font-semibold text-lg">{line.product?.sku}</p>
                      <p className="text-gray-600">{line.product?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Qty</p>
                      <p className="font-semibold text-lg">{line.quantity} {line.uom}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Received Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={lineUpdates[line._id]?.receivedQuantity || ''}
                        onChange={(e) => handleQuantityChange(line._id, e.target.value)}
                        placeholder="Enter received quantity"
                        className="w-full border-2 border-black p-3 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Photo (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(line._id, e.target.files?.[0])}
                        className="w-full border-2 border-black p-3 rounded-lg"
                      />
                      {photos[line._id] && (
                        <p className="text-sm text-green-600 mt-2">✓ Photo attached</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSubmitReceipt}
                disabled={submitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold transition-colors"
              >
                {submitting ? 'Processing...' : '✓ Mark as READY'}
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-gray-400 text-white px-8 py-3 rounded-lg hover:bg-gray-500 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default StaffReceipts
