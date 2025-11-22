'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/utils/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWarehouses: 0,
    totalProducts: 0,
    usersByRole: {},
    documentsByType: {},
    documentsByStatus: {},
    recentDocuments: [],
  });
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await adminApi.products.getAll({ limit: 10, sort: '-createdAt' });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      const response = await adminApi.documents.getByType('RECEIPT', { limit: 10, sort: '-createdAt' });
      setReceipts(response.data?.documents || []);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.stats.getSummary();
      setStats(data);
      
      // Fetch additional data
      await Promise.all([
        fetchProducts(),
        fetchReceipts(),
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchReceipts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStatusChange = async (documentId, newStatus) => {
    try {
      await adminApi.documents.updateStatus(documentId, newStatus);
      // Refresh receipts after status update
      await fetchReceipts();
    } catch (err) {
      setError('Failed to update document status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">System overview and management</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-3"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="from-blue-500 to-blue-600"
            textColor="text-blue-600"
          />
          <StatCard
            title="Total Warehouses"
            value={stats.totalWarehouses}
            icon="🏢"
            color="from-green-500 to-green-600"
            textColor="text-green-600"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="📦"
            color="from-purple-500 to-purple-600"
            textColor="text-purple-600"
          />
          <StatCard
            title="Total Documents"
            value={Object.values(stats.documentsByType).reduce((sum, count) => sum + count, 0)}
            icon="📄"
            color="from-orange-500 to-orange-600"
            textColor="text-orange-600"
          />
        </div>

        {/* Document Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Receipts"
            value={stats.documentsByType?.RECEIPT || 0}
            icon="📥"
            color="from-indigo-500 to-indigo-600"
            textColor="text-indigo-600"
          />
          <StatCard
            title="Transfers"
            value={stats.documentsByType?.TRANSFER || 0}
            icon="↔️"
            color="from-teal-500 to-teal-600"
            textColor="text-teal-600"
          />
          <StatCard
            title="Deliveries"
            value={stats.documentsByType?.DELIVERY || 0}
            icon="📦"
            color="from-cyan-500 to-cyan-600"
            textColor="text-cyan-600"
          />
        </div>

        {/* Tabs for different sections */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'products', label: '📦 Recent Products', icon: '📦' },
                { id: 'receipts', label: '📥 Recent Receipts', icon: '📥' },
                { id: 'actions', label: '⚡ Quick Actions', icon: '⚡' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Users by Role</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.usersByRole).map(([role, count]) => (
                        <div key={role} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="capitalize text-gray-700">{role}</span>
                          <span className="font-semibold text-gray-800">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Document Status</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.documentsByStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="capitalize text-gray-700">{status.replace('_', ' ')}</span>
                          <span className="font-semibold text-gray-800">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Products</h3>
                  <Link href="/admin/products">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      View All Products
                    </button>
                  </Link>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl text-gray-600 mb-2">No products found</p>
                    <p className="text-gray-500">Products will appear here once they are created</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product, index) => (
                      <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <span className="text-lg">📦</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{product.sku}</h4>
                                <p className="text-gray-600">{product.name}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Category:</span>
                                <span className="ml-1 font-medium">{product.category || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Cost Price:</span>
                                <span className="ml-1 font-medium">${product.costPrice || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Selling Price:</span>
                                <span className="ml-1 font-medium">${product.sellingPrice || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">UoM:</span>
                                <span className="ml-1 font-medium">{product.uom || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Created</div>
                            <div className="font-medium">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'receipts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Receipts</h3>
                  <Link href="/admin/receipts">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      View All Receipts
                    </button>
                  </Link>
                </div>
                {receipts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📥</div>
                    <p className="text-xl text-gray-600 mb-2">No receipts found</p>
                    <p className="text-gray-500">Receipts will appear here once they are created</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receipts.slice(0, 5).map((receipt) => (
                      <div key={receipt._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <span className="text-lg">📥</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{receipt.documentNumber || receipt.reference}</h4>
                                <p className="text-gray-600">Receipt Document</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  receipt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  receipt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  receipt.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {receipt.status}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Created By:</span>
                                <span className="ml-1 font-medium">{receipt.createdBy?.loginid || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Warehouse:</span>
                                <span className="ml-1 font-medium">{receipt.warehouse?.name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Type:</span>
                                <span className="ml-1 font-medium">{receipt.documentType}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={receipt.status}
                              onChange={(e) => handleStatusChange(receipt._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="draft">Draft</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <Link href={`/admin/receipts/${receipt._id}`}>
                              <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                                <span className="text-lg">👁️</span>
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard
                  title="Manage Users"
                  description="Create, edit, and delete users with warehouse assignments"
                  link="/admin/users"
                  icon="👥"
                />
                <QuickActionCard
                  title="Manage Warehouses"
                  description="View, create, and configure warehouses"
                  link="/admin/warehouses"
                  icon="🏢"
                />
                <QuickActionCard
                  title="Manage Products"
                  description="Add, edit, and organize product catalog"
                  link="/admin/products"
                  icon="📦"
                />
                <QuickActionCard
                  title="Manage Locations"
                  description="Configure warehouse locations and zones"
                  link="/admin/locations"
                  icon="📍"
                />
                <QuickActionCard
                  title="View Receipts"
                  description="Monitor and manage incoming stock receipts"
                  link="/admin/receipts"
                  icon="📥"
                />
                <QuickActionCard
                  title="System Settings"
                  description="Configure system-wide settings and preferences"
                  link="/admin/settings"
                  icon="⚙️"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color, textColor }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 bg-linear-to-r ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, link, icon }) => (
  <Link href={link}>
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  </Link>
);
