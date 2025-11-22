'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { documentAPI, documentLineAPI, warehouseAPI, contactAPI, productAPI } from '../../utils/api'

const Document = () => {
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [documentLines, setDocumentLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [contacts, setContacts] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('list')

  const documentTypes = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT']
  const documentStatuses = ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED']
  const lineStatuses = ['PENDING', 'PARTIAL', 'FULFILLED']

  const [formData, setFormData] = useState({
    type: 'RECEIPT',
    warehouse: '',
    contact: null,
    scheduleDate: '',
    notes: '',
    meta: {}
  })

  const [lineFormData, setLineFormData] = useState({
    product: '',
    uom: 'PIECE',
    quantity: '',
    unitCost: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLineInputChange = (e) => {
    const { name, value } = e.target
    setLineFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateDocument = async (e) => {
    e.preventDefault()

    if (!formData.type || !formData.warehouse) {
      alert('Please select type and warehouse')
      return
    }

    try {
      setSubmitLoading(true)
      const payload = {
        type: formData.type,
        warehouse: formData.warehouse,
        scheduleDate: formData.scheduleDate || undefined,
        notes: formData.notes || undefined,
        meta: formData.meta
      }

      const result = await documentAPI.createDocument(payload)
      alert('Document created successfully!')
      setFormData({
        type: 'RECEIPT',
        warehouse: '',
        contact: null,
        scheduleDate: '',
        notes: '',
        meta: {}
      })
      setSelectedDocument(result.data)
      setActiveTab('detail')
      fetchDocuments()
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleAddLine = async (e) => {
    e.preventDefault()

    if (!lineFormData.product || !lineFormData.quantity) {
      alert('Please fill in product and quantity')
      return
    }

    try {
      setSubmitLoading(true)
      const payload = {
        document: selectedDocument._id,
        product: lineFormData.product,
        uom: lineFormData.uom,
        quantity: parseFloat(lineFormData.quantity),
        unitCost: lineFormData.unitCost ? parseFloat(lineFormData.unitCost) : undefined
      }

      await documentLineAPI.createDocumentLine(payload)
      alert('Line item added successfully!')
      setLineFormData({
        product: '',
        uom: 'PIECE',
        quantity: '',
        unitCost: ''
      })
      fetchDocumentLines(selectedDocument._id)
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteLine = async (id) => {
    if (window.confirm('Are you sure you want to delete this line?')) {
      try {
        await documentLineAPI.deleteDocumentLine(id)
        alert('Line deleted successfully!')
        fetchDocumentLines(selectedDocument._id)
      } catch (error) {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const handleUpdateLineStatus = async (id, status) => {
    try {
      await documentLineAPI.updateLineStatus(id, status)
      alert('Line status updated!')
      fetchDocumentLines(selectedDocument._id)
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleUpdateDocumentStatus = async (status) => {
    try {
      await documentAPI.updateDocumentStatus(selectedDocument._id, status)
      alert('Document status updated!')
      fetchDocuments()
      fetchDocument(selectedDocument._id)
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const result = await documentAPI.getDocuments()
      setDocuments(result.data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocument = async (id) => {
    try {
      const result = await documentAPI.getDocument(id)
      setSelectedDocument(result.data)
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const fetchDocumentLines = async (docId) => {
    try {
      const result = await documentLineAPI.getDocumentLinesByDocument(docId)
      setDocumentLines(result.data || [])
    } catch (error) {
      console.error('Error fetching lines:', error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const result = await warehouseAPI.getWarehouses()
      setWarehouses(result.data || [])
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    }
  }

  const fetchContacts = async () => {
    try {
      const result = await contactAPI.getContacts()
      setContacts(result.data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const result = await productAPI.getProducts()
      setProducts(result.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchWarehouses()
    fetchContacts()
    fetchProducts()
  }, [])

  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Document Management</h1>

        <div className='mb-4 border-b'>
          <div className='flex gap-4'>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Documents
            </button>
            {selectedDocument && (
              <button
                onClick={() => setActiveTab('detail')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'detail'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Document Detail
              </button>
            )}
          </div>
        </div>

        {activeTab === 'list' && (
          <>
            <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
              <h2 className='text-xl font-semibold mb-4'>Create New Document</h2>
              <form onSubmit={handleCreateDocument} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Document Type *</label>
                    <select
                      name='type'
                      value={formData.type}
                      onChange={handleInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                      required
                    >
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Warehouse *</label>
                    <select
                      name='warehouse'
                      value={formData.warehouse}
                      onChange={handleInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                      required
                    >
                      <option value=''>Select Warehouse</option>
                      {warehouses.map(wh => (
                        <option key={wh._id} value={wh._id}>{wh.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Schedule Date</label>
                    <input
                      type='datetime-local'
                      name='scheduleDate'
                      value={formData.scheduleDate}
                      onChange={handleInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Notes</label>
                  <textarea
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    rows='3'
                    placeholder='Additional notes...'
                  />
                </div>

                <button
                  type='submit'
                  disabled={submitLoading}
                  className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 w-full md:w-auto disabled:bg-gray-400'
                >
                  {submitLoading ? 'Creating...' : 'Create Document'}
                </button>
              </form>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-xl font-semibold mb-4'>Documents</h2>

              {loading ? (
                <div className='text-center py-8'>
                  <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                  <p className='mt-2 text-gray-600'>Loading documents...</p>
                </div>
              ) : error ? (
                <div className='text-center py-8'>
                  <p className='text-red-500 mb-4'>{error}</p>
                </div>
              ) : documents.length === 0 ? (
                <p className='text-gray-500 text-center py-8'>No documents created yet.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full table-auto'>
                    <thead>
                      <tr className='bg-gray-50'>
                        <th className='px-4 py-2 text-left'>Reference</th>
                        <th className='px-4 py-2 text-left'>Type</th>
                        <th className='px-4 py-2 text-left'>Status</th>
                        <th className='px-4 py-2 text-left'>Warehouse</th>
                        <th className='px-4 py-2 text-left'>Created</th>
                        <th className='px-4 py-2 text-left'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc._id} className='border-t hover:bg-gray-50'>
                          <td className='px-4 py-2 font-mono text-sm'>{doc.reference}</td>
                          <td className='px-4 py-2'>{doc.type}</td>
                          <td className='px-4 py-2'>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.status === 'DONE'
                                ? 'bg-green-100 text-green-800'
                                : doc.status === 'CANCELED'
                                  ? 'bg-red-100 text-red-800'
                                  : doc.status === 'READY'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className='px-4 py-2 text-sm'>{doc.warehouse?.name || '-'}</td>
                          <td className='px-4 py-2 text-sm'>{new Date(doc.createdAt).toLocaleDateString()}</td>
                          <td className='px-4 py-2'>
                            <button
                              onClick={() => {
                                setSelectedDocument(doc)
                                fetchDocumentLines(doc._id)
                                setActiveTab('detail')
                              }}
                              className='text-blue-500 hover:text-blue-700'
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'detail' && selectedDocument && (
          <div className='space-y-6'>
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-xl font-semibold mb-4'>Document Detail - {selectedDocument.reference}</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Type</p>
                  <p className='font-medium'>{selectedDocument.type}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Status</p>
                  <div className='flex gap-2'>
                    <select
                      value={selectedDocument.status}
                      onChange={(e) => handleUpdateDocumentStatus(e.target.value)}
                      className='p-1 border border-gray-300 rounded-md text-sm'
                    >
                      {documentStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Warehouse</p>
                  <p className='font-medium'>{selectedDocument.warehouse?.name || '-'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Created At</p>
                  <p className='font-medium'>{new Date(selectedDocument.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedDocument.notes && (
                <div className='mt-4'>
                  <p className='text-sm text-gray-600'>Notes</p>
                  <p className='text-gray-700'>{selectedDocument.notes}</p>
                </div>
              )}
            </div>

            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-xl font-semibold mb-4'>Add Line Item</h2>
              <form onSubmit={handleAddLine} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Product *</label>
                    <select
                      name='product'
                      value={lineFormData.product}
                      onChange={handleLineInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                      required
                    >
                      <option value=''>Select Product</option>
                      {products.map(prod => (
                        <option key={prod._id} value={prod._id}>{prod.name} ({prod.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Quantity *</label>
                    <input
                      type='number'
                      name='quantity'
                      value={lineFormData.quantity}
                      onChange={handleLineInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                      min='0'
                      step='0.01'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Unit Cost</label>
                    <input
                      type='number'
                      name='unitCost'
                      value={lineFormData.unitCost}
                      onChange={handleLineInputChange}
                      className='w-full p-2 border border-gray-300 rounded-md'
                      min='0'
                      step='0.01'
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={submitLoading}
                  className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400'
                >
                  {submitLoading ? 'Adding...' : 'Add Line Item'}
                </button>
              </form>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-xl font-semibold mb-4'>Line Items</h2>

              {documentLines.length === 0 ? (
                <p className='text-gray-500 text-center py-8'>No line items yet.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full table-auto'>
                    <thead>
                      <tr className='bg-gray-50'>
                        <th className='px-4 py-2 text-left'>Product</th>
                        <th className='px-4 py-2 text-left'>Quantity</th>
                        <th className='px-4 py-2 text-left'>Unit Cost</th>
                        <th className='px-4 py-2 text-left'>Status</th>
                        <th className='px-4 py-2 text-left'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentLines.map(line => (
                        <tr key={line._id} className='border-t hover:bg-gray-50'>
                          <td className='px-4 py-2 font-medium'>{line.product?.name || '-'}</td>
                          <td className='px-4 py-2'>{line.quantity}</td>
                          <td className='px-4 py-2'>₹{line.unitCost || 0}</td>
                          <td className='px-4 py-2'>
                            <select
                              value={line.status}
                              onChange={(e) => handleUpdateLineStatus(line._id, e.target.value)}
                              className='px-2 py-1 border border-gray-300 rounded-md text-sm'
                            >
                              {lineStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td className='px-4 py-2'>
                            <button
                              onClick={() => handleDeleteLine(line._id)}
                              className='text-red-500 hover:text-red-700'
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedDocument(null)
                setActiveTab('list')
              }}
              className='bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600'
            >
              Back to List
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Document
