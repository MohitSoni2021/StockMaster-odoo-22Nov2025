'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/utils/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWarehouses: 0,
    usersByRole: {},
    documentsByType: {},
  });
  const [documents, setDocuments] = useState({
    receipts: [],
    transfers: [],
    deliveries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDocumentTab, setActiveDocumentTab] = useState('receipts');

  const fetchDocuments = useCallback(async () => {
    try {
      const [receiptsRes, transfersRes, deliveriesRes] = await Promise.all([
        adminApi.documents.getByType('RECEIPT'),
        adminApi.documents.getByType('TRANSFER'),
        adminApi.documents.getByType('DELIVERY'),
      ]);

      setDocuments({
        receipts: receiptsRes.data || [],
        transfers: transfersRes.data || [],
        deliveries: deliveriesRes.data || [],
      });
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.stats.getSummary();
      setStats(data);
      await fetchDocuments();
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStatusChange = async (documentId, newStatus, type) => {
    try {
      await adminApi.documents.updateStatus(documentId, newStatus);
      // Refresh documents after status update
      await fetchDocuments();
    } catch (err) {
      setError('Failed to update document status');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Warehouses"
          value={stats.totalWarehouses}
          icon="📦"
          color="bg-green-500"
        />
        <StatCard
          title="Managers"
          value={stats.usersByRole?.manager || 0}
          icon="👔"
          color="bg-purple-500"
        />
        <StatCard
          title="Staff Members"
          value={stats.usersByRole?.staff || 0}
          icon="🧑‍💼"
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Receipts"
          value={stats.documentsByType?.RECEIPT || 0}
          icon="📄"
          color="bg-indigo-500"
        />
        <StatCard
          title="Transfers"
          value={stats.documentsByType?.TRANSFER || 0}
          icon="🔄"
          color="bg-teal-500"
        />
        <StatCard
          title="Deliveries"
          value={stats.documentsByType?.DELIVERY || 0}
          icon="🚚"
          color="bg-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <QuickActionCard
          title="Manage Users"
          description="Create, edit, and delete users with warehouse assignments"
          link="/admin/users"
          icon="👥"
          color="bg-blue-50 border-blue-200"
        />
        <QuickActionCard
          title="Manage Warehouses"
          description="View, create, and configure warehouses"
          link="/admin/warehouses"
          icon="📦"
          color="bg-green-50 border-green-200"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Document Management</h2>

        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveDocumentTab('receipts')}
              className={`px-6 py-3 font-medium ${
                activeDocumentTab === 'receipts'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Receipts ({documents.receipts.length})
            </button>
            <button
              onClick={() => setActiveDocumentTab('transfers')}
              className={`px-6 py-3 font-medium ${
                activeDocumentTab === 'transfers'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Transfers ({documents.transfers.length})
            </button>
            <button
              onClick={() => setActiveDocumentTab('deliveries')}
              className={`px-6 py-3 font-medium ${
                activeDocumentTab === 'deliveries'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deliveries ({documents.deliveries.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeDocumentTab === 'receipts' && (
            <DocumentTable
              documents={documents.receipts}
              onStatusChange={(id, status) => handleStatusChange(id, status, 'receipts')}
            />
          )}
          {activeDocumentTab === 'transfers' && (
            <DocumentTable
              documents={documents.transfers}
              onStatusChange={(id, status) => handleStatusChange(id, status, 'transfers')}
            />
          )}
          {activeDocumentTab === 'deliveries' && (
            <DocumentTable
              documents={documents.deliveries}
              onStatusChange={(id, status) => handleStatusChange(id, status, 'deliveries')}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Users by Role</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role} className="bg-gray-50 p-4 rounded text-center">
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{role}s</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} text-white rounded-lg shadow p-6`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function QuickActionCard({ title, description, link, icon, color }) {
  return (
    <Link href={link}>
      <div className={`${color} border-2 rounded-lg p-6 cursor-pointer hover:shadow-lg transition`}>
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="mt-4 text-blue-600 font-semibold">View →</div>
      </div>
    </Link>
  );
}

function DocumentTable({ documents, onStatusChange }) {
  const documentStatuses = ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'];

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No documents found
      </div>
    );
  }

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Warehouse</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {documents.map(doc => (
          <tr key={doc._id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono text-gray-900">{doc.reference}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{doc.type}</td>
            <td className="px-4 py-3 text-sm">
              <select
                value={doc.status}
                onChange={(e) => onStatusChange(doc._id, e.target.value)}
                className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${
                  doc.status === 'DONE'
                    ? 'bg-green-100 text-green-800'
                    : doc.status === 'CANCELED'
                      ? 'bg-red-100 text-red-800'
                      : doc.status === 'READY'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {documentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">{doc.warehouse?.name || '-'}</td>
            <td className="px-4 py-3 text-sm text-gray-500">
              {new Date(doc.createdAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-3 text-sm">
              <div className="flex space-x-2">
                {doc.type === 'RECEIPT' && doc.from && (
                  <span className="text-xs text-gray-500">From: {doc.from.name}</span>
                )}
                {doc.type === 'DELIVERY' && doc.to && (
                  <span className="text-xs text-gray-500">To: {doc.to.name}</span>
                )}
                {doc.type === 'TRANSFER' && doc.toWarehouse && (
                  <span className="text-xs text-gray-500">To: {doc.toWarehouse.name}</span>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
