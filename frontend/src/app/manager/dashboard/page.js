'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import Link from 'next/link';

export default function ManagerDashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await managerAPI.getDashboardKPIs();
        setKpis(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch KPIs');
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const overview = kpis?.overview || {};
  const documentsByStatus = kpis?.documentsByStatus || {};
  const documentsByType = kpis?.documentsByType || {};
  const inventory = kpis?.inventory || {};
  const recentMovements = kpis?.recentMovements || [];

  return (
    <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
      <aside className="bg-white rounded-xl p-5 h-[calc(100vh-4rem)] shadow sticky top-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-linear-to-br from-green-400 to-teal-300 flex items-center justify-center text-white font-bold">SM</div>
          <div className="font-bold text-slate-900">StockMaster</div>
        </div>

        <nav className="flex flex-col gap-2 mt-3">
          <Link href="/manager/dashboard" className="px-3 py-2 rounded-md font-semibold text-sm bg-linear-to-r from-indigo-500 to-purple-500 text-white">Dashboard</Link>
          <Link href="/manager/receipts" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Receipts</Link>
          <Link href="/manager/deliveries" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Deliveries</Link>
          <Link href="/manager/transfers" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Transfers</Link>
          <Link href="/manager/stock-balance" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Stock Balance</Link>
        </nav>

        <div className="mt-6 text-sm text-slate-500">Manager</div>
      </aside>

      <main className="space-y-6">
        <header className="flex justify-between items-center gap-4 mb-2">
          <div className="flex-1">
            <input placeholder="Search something..." className="w-full rounded-lg border border-gray-200 px-4 py-2 shadow-sm" />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow">🔔</div>
            <div className="w-9 h-9 rounded-lg bg-linear-to-r from-pink-400 to-red-500 flex items-center justify-center text-white font-bold">JS</div>
          </div>
        </header>

        <h1 className="text-2xl font-bold text-slate-900">📊 Inventory Manager Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-3xl font-extrabold text-slate-800">{overview.totalDocuments || 0}</div>
            <div className="text-sm text-gray-500 uppercase font-semibold">Total Documents</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-3xl font-extrabold text-slate-800">{overview.pendingValidations || 0}</div>
            <div className="text-sm text-gray-500 uppercase font-semibold">Pending Approvals</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-3xl font-extrabold text-slate-800">{overview.completedDocuments || 0}</div>
            <div className="text-sm text-gray-500 uppercase font-semibold">Completed</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-3xl font-extrabold text-slate-800">{overview.totalProducts || 0}</div>
            <div className="text-sm text-gray-500 uppercase font-semibold">Total Products</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-bold mb-4">Documents by Status</h2>
            <div className="flex flex-col gap-3">
              {Object.entries(documentsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-28 text-xs font-semibold uppercase text-slate-600">{status}</div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded overflow-hidden">
                      <div className="h-3 rounded" style={{ width: `${(count / (overview.totalDocuments || 1)) * 100}%`, backgroundColor: getStatusColor(status) }} />
                    </div>
                  </div>
                  <div className="w-12 text-right font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-bold mb-4">Documents by Type</h2>
            <div className="flex flex-col gap-3">
              {Object.entries(documentsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-linear-to-r from-white to-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-700">{type}</div>
                  <div className="px-3 py-1 rounded-full bg-indigo-500 text-white font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-lg font-bold">Inventory Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-500">Total Quantity</div>
              <div className="text-2xl font-bold text-blue-600">{inventory.totalQuantity?.toFixed(2) || 0}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-500">Reserved Quantity</div>
              <div className="text-2xl font-bold text-blue-600">{inventory.totalReserved?.toFixed(2) || 0}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-500">Available Quantity</div>
              <div className="text-2xl font-bold text-blue-600">{((inventory.totalQuantity || 0) - (inventory.totalReserved || 0)).toFixed(2)}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-500">Unique Products</div>
              <div className="text-2xl font-bold text-blue-600">{inventory.totalProducts || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-bold mb-4">Recent Stock Movements</h2>
          {recentMovements.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentMovements.map((movement) => (
                <div key={movement._id} className="grid grid-cols-[40px_1fr_100px_150px] items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="text-center text-xl">{movement.movementType === 'IN' ? '📥' : movement.movementType === 'OUT' ? '📤' : '🔄'}</div>
                  <div className="flex flex-col">
                    <div className="font-semibold">{movement.product?.sku} - {movement.product?.name}</div>
                    <div className="text-sm text-gray-500">{movement.fromWarehouse?.name} → {movement.toWarehouse?.name}</div>
                  </div>
                  <div className="text-center font-bold text-blue-600">{movement.quantity} units</div>
                  <div className="text-right text-sm text-gray-500">{new Date(movement.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 italic">No recent movements</div>
          )}
        </div>
      </main>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    DRAFT: '#ffc107',
    WAITING: '#17a2b8',
    READY: '#28a745',
    DONE: '#6c757d',
    CANCELED: '#dc3545'
  };
  return colors[status] || '#999';
}
