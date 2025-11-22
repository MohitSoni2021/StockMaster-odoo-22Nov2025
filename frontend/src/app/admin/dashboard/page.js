'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/utils/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWarehouses: 0,
    usersByRole: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.stats.getSummary();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
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
