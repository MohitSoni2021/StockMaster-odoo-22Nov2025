'use client'

import React, { useState, useEffect } from 'react'
import StaffNavbar from '../../../components/StaffNavbar'
import { staffAPI } from '../../../utils/api'

const StaffStockCount = () => {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetails, setTaskDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [lineUpdates, setLineUpdates] = useState({})
  const [barcodeInput, setBarcodeInput] = useState('')

  useEffect(() => {
    fetchStockCounts()
  }, [])

  const fetchStockCounts = async () => {
    try {
      setLoading(true)
      const result = await staffAPI.getAssignedTasks({ type: 'ADJUSTMENT', status: 'WAITING' })
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
        countedQuantity: parseFloat(quantity) || 0
      }
    }))
  }

  const handleBarcodeInput = (e) => {
    setBarcodeInput(e.target.value)
  }

  const handleBarcodeSubmit = (e) => {
    e.preventDefault()
    if (barcodeInput && taskDetails?.lines) {
      const matchedLine = taskDetails.lines.find(l => l.product?.sku === barcodeInput)
      if (matchedLine) {
        handleQuantityChange(matchedLine._id, (lineUpdates[matchedLine._id]?.countedQuantity || 0) + 1)
      } else {
        alert('Product not found in this count')
      }
      setBarcodeInput('')
    }
  }

  const handleSubmitCount = async () => {
    try {
      if (Object.keys(lineUpdates).length === 0) {
        alert('Please enter at least one count')
        return
      }

      setSubmitting(true)
      const updates = Object.values(lineUpdates).map(u => ({
        ...u,
        countedQuantity: u.countedQuantity || 0
      }))
      
      await staffAPI.performStockCount(selectedTask, updates)
      alert('Stock count submitted for approval!')
      setSelectedTask(null)
      setTaskDetails(null)
      fetchStockCounts()
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
      <StaffNavbar currentPage="stock-count" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Cycle Count</h1>
          <p className="text-gray-600">Count physical stock and verify inventory levels</p>
        </div>

        {!selectedTask ? (
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Available Stock Counts</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
                <p className="mt-4 text-gray-600">Loading stock counts...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                <p>Error: {error}</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-xl">No pending stock counts</p>
                <p className="mt-2">Check back later for new count tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task._id} className="border-2 border-gray-300 rounded-lg p-4 hover:border-black transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{task.reference}</h3>
                        <p className="text-gray-600">Warehouse: {task.warehouse?.name}</p>
                        <p className="text-sm text-gray-500">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
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

            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
              <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeInput}
                  placeholder="Scan or type SKU to count..."
                  autoFocus
                  className="flex-1 border-2 border-blue-500 p-3 rounded-lg font-mono"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Count →
                </button>
              </form>
              <p className="text-sm text-blue-600 mt-2">💡 Scan each product to increment the count</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-100 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Warehouse</p>
                <p className="font-semibold">{taskDetails.document.warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Items to Count</p>
                <p className="font-semibold text-lg">{taskDetails.lines.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Counted</p>
                <p className="font-semibold text-lg">{Object.keys(lineUpdates).filter(k => lineUpdates[k].countedQuantity > 0).length}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Products to Count</h3>
            <div className="space-y-3">
              {taskDetails.lines.map((line) => {
                const counted = lineUpdates[line._id]?.countedQuantity || 0
                return (
                  <div key={line._id} className={`border-2 rounded-lg p-4 transition-colors ${
                    counted > 0 ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{line.product?.sku}</p>
                        <p className="text-gray-600 text-sm">{line.product?.name}</p>
                        <p className="text-sm text-gray-500">Category: {line.product?.category}</p>
                      </div>
                      {counted > 0 && (
                        <div className="text-center bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                          {counted} counted
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={counted || ''}
                        onChange={(e) => handleQuantityChange(line._id, e.target.value)}
                        placeholder="Counted quantity"
                        className="flex-1 border-2 border-black p-3 rounded-lg font-mono text-lg"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleQuantityChange(line._id, counted + 1)}
                          className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 font-bold"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuantityChange(line._id, Math.max(0, counted - 1))}
                          className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-bold"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSubmitCount}
                disabled={submitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold transition-colors"
              >
                {submitting ? 'Submitting...' : '✓ Submit Count'}
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

export default StaffStockCount
