'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function ManagerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    router.push('/(auth)/login');
  };

  const isActive = (path) => pathname.startsWith(path);

  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <div className="text-xl font-bold">
          <Link href="/manager/dashboard">📦 Inventory Manager</Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/manager/dashboard"
            className={`px-4 py-2 rounded ${
              isActive('/manager/dashboard') ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
            }`}
          >
            Dashboard
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
              className="px-4 py-2 bg-blue-800 rounded hover:bg-blue-700"
            >
              Documents ▼
            </button>

            {isDocumentsOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10">
                <Link
                  href="/manager/receipts"
                  className={`block px-4 py-2 hover:bg-gray-100 ${
                    isActive('/manager/receipts') ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setIsDocumentsOpen(false)}
                >
                  📥 Receipts
                </Link>
                <Link
                  href="/manager/deliveries"
                  className={`block px-4 py-2 hover:bg-gray-100 ${
                    isActive('/manager/deliveries') ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setIsDocumentsOpen(false)}
                >
                  📤 Deliveries
                </Link>
                <Link
                  href="/manager/transfers"
                  className={`block px-4 py-2 hover:bg-gray-100 ${
                    isActive('/manager/transfers') ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setIsDocumentsOpen(false)}
                >
                  🔄 Transfers
                </Link>
                <Link
                  href="/manager/adjustments"
                  className={`block px-4 py-2 hover:bg-gray-100 ${
                    isActive('/manager/adjustments') ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setIsDocumentsOpen(false)}
                >
                  ⚙️ Adjustments
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/manager/approvals"
            className={`px-4 py-2 rounded ${
              isActive('/manager/approvals') ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
            }`}
          >
            ✅ Approvals
          </Link>

          <Link
            href="/manager/stock-balance"
            className={`px-4 py-2 rounded ${
              isActive('/manager/stock-balance') ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
            }`}
          >
            Stock Balance
          </Link>

          <Link
            href="/manager/ledger"
            className={`px-4 py-2 rounded ${
              isActive('/manager/ledger') ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
            }`}
          >
            📜 Ledger
          </Link>

          <Link
            href="/manager/reorder"
            className={`px-4 py-2 rounded ${
              isActive('/manager/reorder') ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
            }`}
          >
            🔔 Reorder
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-700 rounded hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
