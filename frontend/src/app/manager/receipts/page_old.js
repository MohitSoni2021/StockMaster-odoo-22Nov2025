'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import managerAPI from '@/utils/managerApi';
import DocumentLines from '@/components/DocumentLines';

export default function ManagerReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
  const [itemsPerPage] = useState(15);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching manager receipts...');
      
      const response = await managerAPI.getReceipts({ limit: 1000 });
      console.log('Manager receipts response:', response);
      
      let receipts = [];
      if (response.data?.data) {
        receipts = response.data.data.documents || response.data.data || [];
      } else {
        receipts = response.data || [];
      }
      
      console.log('Processed manager receipts:', receipts);
      setReceipts(Array.isArray(receipts) ? receipts : []);
      
      if (!Array.isArray(receipts) || receipts.length === 0) {
        setError('No receipts found. You can create a new receipt to get started.');
      }
      
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to fetch receipts. Please check your connection and try again.');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const createSampleReceipt = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sampleReceipt = {
        reference: `REC-MGR-${Date.now()}`,
        documentType: 'RECEIPT',
        status: 'DRAFT',
        contact: 'Sample Vendor',
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: 'Sample receipt created for manager testing',
        lines: [
          {
            product: null,
            quantity: 15,
            unitCost: 35.00,
            description: 'Manager Sample Product A'
          },
          {
            product: null,
            quantity: 8,
            unitCost: 75.00,
            description: 'Manager Sample Product B'
          }
        ]
      };

      await managerAPI.createReceipt(sampleReceipt);
      setSuccess('Sample receipt created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchReceipts();
      
    } catch (err) {
      console.error('Error creating sample receipt:', err);
      setError(`Error creating sample receipt: ${err.message}`);
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
        setSuccess('Receipt updated successfully!');
      } else {
        await managerAPI.createReceipt(formData);
        setSuccess('Receipt created successfully!');
      }
      
      setTimeout(() => setSuccess(null), 3000);
      resetForm();
      await fetchReceipts();
      
    } catch (err) {
      console.error('Error saving receipt:', err);
      setError(err.message || 'Failed to save receipt');
    } finally {
      setSubmitting(false);
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
      setSuccess('Receipt deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchReceipts();
    } catch (err) {
      console.error('Error deleting receipt:', err);
      setError(err.message || 'Failed to delete receipt');
    }
  };

  const handleApprove = async (receiptId) => {
    try {
      await managerAPI.approveDocument(receiptId, { status: 'APPROVED' });
      setSuccess('Receipt approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchReceipts();
    } catch (err) {
      console.error('Error approving receipt:', err);
      setError(err.message || 'Failed to approve receipt');
    }
  };

  const handleComplete = async (receiptId) => {
    try {
      await managerAPI.completeDocument(receiptId);
      setSuccess('Receipt completed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchReceipts();
    } catch (err) {
      console.error('Error completing receipt:', err);
      setError(err.message || 'Failed to complete receipt');
    }
  };

  // Enhanced filtering with multiple field search
  const filteredReceipts = receipts.filter(receipt => {
    const matchesStatus = !filterStatus || receipt.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (receipt.reference && receipt.reference.toLowerCase().includes(searchLower)) ||
      (receipt.documentNumber && receipt.documentNumber.toLowerCase().includes(searchLower)) ||
      (receipt.contact && receipt.contact.toLowerCase().includes(searchLower)) ||
      (receipt.vendor && receipt.vendor.toLowerCase().includes(searchLower)) ||
      (receipt.createdBy?.name && receipt.createdBy.name.toLowerCase().includes(searchLower)) ||
      (receipt.createdBy?.loginid && receipt.createdBy.loginid.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const getTotalValue = (receipt) => {
    const lines = receipt.lines || receipt.documentLines || [];
    if (!Array.isArray(lines)) return 0;
    
    return lines.reduce((total, line) => {
      const quantity = parseFloat(line.quantity || line.qty || 0);
      const cost = parseFloat(line.unitCost || line.price || line.unitPrice || line.cost || 0);
      return total + (quantity * cost);
    }, 0);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading receipts...</p>
        </div>
      </div>
    );
  }

  // Create/Edit Form Modal
  if (showCreateForm) {
    return (
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
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.reference ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter reference number"
                />
                {formErrors.reference && <p className="text-red-500 text-xs mt-1">{formErrors.reference}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact/Vendor
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact or vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
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
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.scheduledDate && <p className="text-red-500 text-xs mt-1">{formErrors.scheduledDate}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter any additional notes"
              />
            </div>

            <div className="mb-6">
              <DocumentLines
                lines={formData.lines}
                onChange={(lines) => setFormData(prev => ({ ...prev, lines }))}
                error={formErrors.lines}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📦 Manager Receipts
          </h1>
          <p className="text-gray-600 text-lg">Manage and track receipt documents in your warehouse</p>
          <div className="w-24 h-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full mt-3"></div>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button
              onClick={fetchReceipts}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            {receipts.length === 0 && !loading && (
              <button
                onClick={createSampleReceipt}
                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Sample Receipt
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Receipt
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium">Unable to load receipts</h3>
                <p className="text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchReceipts}
                  className="text-sm underline hover:no-underline mt-2 inline-block"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Receipts</p>
                <p className="text-3xl font-bold text-gray-800">{receipts.length}</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                📦
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{receipts.filter(r => r.status === 'DONE').length}</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl">
                ✅
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{receipts.filter(r => r.status === 'WAITING' || r.status === 'DRAFT').length}</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white text-xl">
                ⏳
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-purple-600">${receipts.reduce((total, receipt) => total + getTotalValue(receipt), 0).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                💰
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by reference, contact, vendor, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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

        {/* Receipts Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {paginatedReceipts.length === 0 ? (
            <div className="text-center py-12">
              {filteredReceipts.length === 0 ? (
                <div>
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-xl text-gray-600 mb-2">No receipts found</p>
                  <p className="text-gray-500">Receipts will appear here once they are created</p>
                </div>
              ) : (
                <p className="text-gray-500">No receipts match the current filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lines</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {receipt.reference || receipt.documentNumber || receipt._id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {receipt.documentType || receipt.type || 'RECEIPT'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                          {receipt.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {receipt.contact || receipt.vendor || receipt.sourceLocation?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {receipt.scheduledDate ? new Date(receipt.scheduledDate).toLocaleDateString() : 
                         receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 
                         receipt.date ? new Date(receipt.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${getTotalValue(receipt).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {receipt.lines?.length || receipt.documentLines?.length || 0} items
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(receipt)}
                            className="inline-flex items-center px-3 py-1 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          {receipt.status === 'DRAFT' && (
                            <button
                              onClick={() => handleApprove(receipt._id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {receipt.status === 'READY' && (
                            <button
                              onClick={() => handleComplete(receipt._id)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(receipt._id)}
                            className="inline-flex items-center px-3 py-1 border border-red-600 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
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
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
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
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}