'use client';

import React, { useState, useEffect } from 'react';
import managerAPI from '@/utils/managerApi';
import DocumentLines from '@/components/DocumentLines';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [formData, setFormData] = useState({
    reference: '',
    documentType: 'RECEIPT',
    status: 'DRAFT',
    source: '',
    destination: '',
    contact: '',
    scheduledDate: '',
    notes: '',
    lines: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getReceipts();
      const data = response.data?.data || response.data || [];
      setReceipts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.reference?.trim()) {
      errors.reference = 'Reference is required';
    }
    if (!formData.scheduledDate) {
      errors.scheduledDate = 'Scheduled date is required';
    }
    if (!formData.lines || formData.lines.length === 0) {
      errors.lines = 'At least one line item is required';
    } else {
      // Validate each line
      const lineErrors = formData.lines.some(line => 
        !line.product || !line.quantity || line.quantity <= 0
      );
      if (lineErrors) {
        errors.lines = 'All lines must have a product and valid quantity';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingReceipt) {
        await managerAPI.updateReceipt(editingReceipt._id, formData);
      } else {
        await managerAPI.createReceipt(formData);
      }
      
      // Reset form and refresh data
      setFormData({
        reference: '',
        documentType: 'RECEIPT',
        status: 'DRAFT',
        source: '',
        destination: '',
        contact: '',
        scheduledDate: '',
        notes: '',
        lines: []
      });
      setEditingReceipt(null);
      setShowCreateForm(false);
      setFormErrors({});
      await fetchReceipts();
      
    } catch (err) {
      console.error('Error saving receipt:', err);
      setError(err.message || 'Failed to save receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt);
    setFormData({
      reference: receipt.reference || '',
      documentType: receipt.documentType || 'RECEIPT',
      status: receipt.status || 'DRAFT',
      source: receipt.source || '',
      destination: receipt.destination || '',
      contact: receipt.contact || '',
      scheduledDate: receipt.scheduledDate ? receipt.scheduledDate.split('T')[0] : '',
      notes: receipt.notes || '',
      lines: receipt.lines || []
    });
    setShowCreateForm(true);
    setFormErrors({});
  };

  const handleDelete = async (receiptId) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      await managerAPI.deleteReceipt(receiptId);
      await fetchReceipts();
    } catch (err) {
      console.error('Error deleting receipt:', err);
      setError(err.message || 'Failed to delete receipt');
    }
  };

  const handleApprove = async (receiptId) => {
    try {
      await managerAPI.approveDocument(receiptId, { status: 'APPROVED' });
      await fetchReceipts();
    } catch (err) {
      console.error('Error approving receipt:', err);
      setError(err.message || 'Failed to approve receipt');
    }
  };

  const handleComplete = async (receiptId) => {
    try {
      await managerAPI.completeDocument(receiptId);
      await fetchReceipts();
    } catch (err) {
      console.error('Error completing receipt:', err);
      setError(err.message || 'Failed to complete receipt');
    }
  };

  const handleCancel = async (receiptId) => {
    try {
      await managerAPI.cancelDocument(receiptId, { reason: 'Cancelled by manager' });
      await fetchReceipts();
    } catch (err) {
      console.error('Error cancelling receipt:', err);
      setError(err.message || 'Failed to cancel receipt');
    }
  };

  // Filter and paginate receipts
  const filteredReceipts = receipts.filter(receipt => {
    const matchesStatus = !filterStatus || receipt.status === filterStatus;
    const matchesSearch = !searchQuery || 
      receipt.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.contact?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'WAITING': return 'bg-yellow-100 text-yellow-800';
      case 'READY': return 'bg-blue-100 text-blue-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      reference: '',
      documentType: 'RECEIPT',
      status: 'DRAFT',
      source: '',
      destination: '',
      contact: '',
      scheduledDate: '',
      notes: '',
      lines: []
    });
    setEditingReceipt(null);
    setShowCreateForm(false);
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-500">Loading receipts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">📦 Receipts Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Create Receipt
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by reference or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="WAITING">Waiting</option>
            <option value="READY">Ready</option>
            <option value="DONE">Done</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {paginatedReceipts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {filteredReceipts.length === 0 ? 'No receipts found' : 'No receipts match the current filters'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lines</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedReceipts.map((receipt) => (
                  <tr key={receipt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{receipt.reference}</div>
                      <div className="text-sm text-gray-500">{receipt.documentType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {receipt.contact || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {receipt.scheduledDate ? new Date(receipt.scheduledDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {receipt.lines?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(receipt)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        
                        {receipt.status === 'DRAFT' && (
                          <button
                            onClick={() => handleApprove(receipt._id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                        )}
                        
                        {receipt.status === 'READY' && (
                          <button
                            onClick={() => handleComplete(receipt._id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Complete
                          </button>
                        )}
                        
                        {receipt.status !== 'DONE' && receipt.status !== 'CANCELED' && (
                          <button
                            onClick={() => handleCancel(receipt._id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(receipt._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-2 text-sm rounded-lg ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingReceipt ? 'Edit Receipt' : 'Create New Receipt'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference *
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., REC-2024-001"
                  />
                  {formErrors.reference && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reference}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="WAITING">Waiting</option>
                    <option value="READY">Ready</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Supplier or contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.scheduledDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.scheduledDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Source location or supplier"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Destination warehouse"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or comments"
                />
              </div>

              {/* Document Lines */}
              <div className="mb-6">
                <DocumentLines
                  lines={formData.lines}
                  onChange={(lines) => setFormData({ ...formData, lines })}
                  error={formErrors.lines}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Saving...' : (editingReceipt ? 'Update Receipt' : 'Create Receipt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
