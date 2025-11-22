'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    router.push('/(auth)/login');
  };

  const isActive = (path) => pathname.startsWith(path);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <div className="text-xl font-bold">
          <Link href="/admin/dashboard">🔐 Admin Panel</Link>
        </div>

        <div className="hidden md:flex gap-2 flex-wrap">
          <Link
            href="/admin/dashboard"
            className={`px-4 py-2 rounded ${
              isActive('/admin/dashboard') ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className={`px-4 py-2 rounded ${
              isActive('/admin/users') ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            👥 Users
          </Link>

          <Link
            href="/admin/warehouses"
            className={`px-4 py-2 rounded ${
              isActive('/admin/warehouses') ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            📦 Warehouses
          </Link>

          <Link
            href="/admin/products"
            className={`px-4 py-2 rounded ${
              isActive('/admin/products') ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            📦 Products
          </Link>

          <Link
            href="/admin/locations"
            className={`px-4 py-2 rounded ${
              isActive('/admin/locations') ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            📍 Locations
          </Link>

          <Link
            href="/admin/receipts"
            className={`px-4 py-2 rounded ${
              isActive('/admin/receipts') ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            📋 Receipts
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-700 rounded hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden px-4 py-2 bg-gray-800 rounded"
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            👥 Users
          </Link>
          <Link
            href="/admin/warehouses"
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📦 Warehouses
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📦 Products
          </Link>
          <Link
            href="/admin/locations"
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📍 Locations
          </Link>
          <Link
            href="/admin/receipts"
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📋 Receipts
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-red-700 rounded hover:bg-red-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </nav>
  );
}
