'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/utils/adminApi';

// Invoice Preview Component
const InvoicePreview = ({ receipt, onDownload }) => {
  const totalValue = receipt.lines?.reduce((total, line) => {
    return total + (parseFloat(line.quantity || 0) * parseFloat(line.unitCost || 0));
  }, 0) || 0;

  const totalTax = totalValue * 0.1; // 10% tax example
  const grandTotal = totalValue + totalTax;

  return (
    <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto" id="invoice-preview">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              SM
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">StockMaster</h1>
              <p className="text-gray-600">Inventory Management System</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>123 Business Street</p>
            <p>Business City, BC 12345</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: admin@stockmaster.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">RECEIPT</h2>
          <div className="text-sm">
            <p><span className="font-semibold">Receipt #:</span> {receipt.reference}</p>
            <p><span className="font-semibold">Date:</span> {new Date(receipt.createdAt || receipt.scheduledDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                receipt.status === 'DONE' ? 'bg-green-100 text-green-800' :
                receipt.status === 'READY' ? 'bg-blue-100 text-blue-800' :
                receipt.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {receipt.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">From (Supplier)</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">{receipt.contact || receipt.source || 'Supplier Information'}</p>
            <p className="text-gray-600">{receipt.source || 'Source Location'}</p>
            {receipt.notes && (
              <p className="text-sm text-gray-500 mt-2">Note: {receipt.notes}</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">To (Destination)</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">{receipt.destination || 'Main Warehouse'}</p>
            <p className="text-gray-600">Receiving Location</p>
            <p className="text-sm text-gray-500 mt-2">
              Created by: {receipt.createdBy?.name || receipt.createdBy || 'System User'}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Received</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-semibold">Item</th>
                <th className="text-center py-3 px-4 font-semibold">UOM</th>
                <th className="text-center py-3 px-4 font-semibold">Qty</th>
                <th className="text-right py-3 px-4 font-semibold">Unit Cost</th>
                <th className="text-right py-3 px-4 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.lines?.map((line, index) => {
                const lineTotal = (parseFloat(line.quantity || 0) * parseFloat(line.unitCost || 0));
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{line.product?.name || line.product}</p>
                        <p className="text-sm text-gray-500">{line.product?.sku || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{line.uom || 'PIECE'}</td>
                    <td className="py-3 px-4 text-center">{line.quantity || 0}</td>
                    <td className="py-3 px-4 text-right">${parseFloat(line.unitCost || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium">${lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80">
          <div className="bg-gray-50 p-6 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%):</span>
              <span className="font-medium">${totalTax.toFixed(2)}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Payment Terms</h4>
            <p className="text-gray-600">Net 30 days from receipt date</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-gray-600">
              {receipt.notes || 'Thank you for your business. All items have been received and inspected.'}
            </p>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          Generated by StockMaster on {new Date().toLocaleString()}
        </div>
      </div>

      {/* Download Button */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={onDownload}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Invoice PDF
        </button>
      </div>
    </div>
  );
};

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id;

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  useEffect(() => {
    if (receiptId) {
      fetchReceiptDetails();
    }
  }, [receiptId]);

  const fetchReceiptDetails = async () => {
    try {
      setLoading(true);
      // Fetch receipt details using admin API
      const response = await adminApi.documents.getById(receiptId);
      const data = response.data || response;
      setReceipt(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipt details:', err);
      setError(err.message || 'Failed to fetch receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    // Generate PDF using browser print functionality
    const printContent = document.getElementById('invoice-preview');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.outerHTML;
      
      // Add print styles
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body { margin: 0; padding: 20px; }
          .print\\:hidden { display: none !important; }
        }
      `;
      document.head.appendChild(style);
      
      window.print();
      
      // Restore original content
      document.body.innerHTML = originalContent;
      // Reload to restore React functionality
      window.location.reload();
    }
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

  const getTotalValue = (receipt) => {
    if (!receipt?.lines || !Array.isArray(receipt.lines)) return 0;
    return receipt.lines.reduce((total, line) => {
      return total + (parseFloat(line.quantity || 0) * parseFloat(line.unitCost || 0));
    }, 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-500">Loading receipt details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
          <Link 
            href="/admin/receipts" 
            className="mt-2 inline-block text-red-600 hover:text-red-800 underline"
          >
            ← Back to Receipts
          </Link>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900">Receipt Not Found</h3>
          <p className="text-gray-600 mt-2">The requested receipt could not be found.</p>
          <Link 
            href="/admin/receipts" 
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Receipts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/receipts"
            className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Receipts
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receipt Details</h1>
            <p className="text-gray-600">{receipt.reference}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowInvoicePreview(!showInvoicePreview)}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
              showInvoicePreview 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {showInvoicePreview ? 'Hide' : 'Show'} Invoice Preview
          </button>
        </div>
      </div>

      {/* Receipt Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                {receipt.status}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Value</div>
              <div className="text-2xl font-bold text-gray-900">${getTotalValue(receipt).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Items</div>
              <div className="text-2xl font-bold text-gray-900">{receipt.lines?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(receipt.scheduledDate || receipt.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Reference</dt>
              <dd className="text-sm text-gray-900 font-mono">{receipt.reference}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Document Type</dt>
              <dd className="text-sm text-gray-900">{receipt.documentType || 'RECEIPT'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact/Supplier</dt>
              <dd className="text-sm text-gray-900">{receipt.contact || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Source</dt>
              <dd className="text-sm text-gray-900">{receipt.source || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Destination</dt>
              <dd className="text-sm text-gray-900">{receipt.destination || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Dates and Status */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
              <dd className="text-sm text-gray-900">
                {receipt.scheduledDate ? new Date(receipt.scheduledDate).toLocaleDateString() : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900">
                {receipt.updatedAt ? new Date(receipt.updatedAt).toLocaleString() : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="text-sm text-gray-900">{receipt.createdBy?.name || receipt.createdBy || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <p className="text-sm text-gray-700">
            {receipt.notes || 'No additional notes provided.'}
          </p>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow border mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">UOM</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipt.lines?.length > 0 ? receipt.lines.map((line, index) => {
                const lineTotal = (parseFloat(line.quantity || 0) * parseFloat(line.unitCost || 0));
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{line.product?.name || line.product}</div>
                        <div className="text-sm text-gray-500">{line.product?.sku || 'SKU: N/A'}</div>
                        {line.product?.description && (
                          <div className="text-xs text-gray-400 mt-1">{line.product.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{line.uom || 'PIECE'}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{line.quantity || 0}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">${parseFloat(line.unitCost || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${lineTotal.toFixed(2)}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No line items found for this receipt.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-right font-semibold text-gray-900">Total Value:</td>
                <td className="px-6 py-4 text-right font-bold text-lg text-blue-600">${getTotalValue(receipt).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Invoice Preview */}
      {showInvoicePreview && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Invoice Preview</h2>
          <InvoicePreview receipt={receipt} onDownload={handleDownloadInvoice} />
        </div>
      )}
    </div>
  );
}