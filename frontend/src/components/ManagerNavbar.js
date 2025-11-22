'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function ManagerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    router.push('/(auth)/login');
  };

  const isActive = (path) => pathname.startsWith(path);

  return (
    <nav className="bg-white border-b text-gray-800">
      <div className="container mx-auto flex items-center justify-between p-2">
        <div>
          <Link href="/manager/dashboard" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="text-blue-600 font-bold">SM</span>
            <span className="hidden sm:inline">Inventory</span>
          </Link>
        </div>

        <div className="hidden md:block text-sm text-gray-600">{/* optional center title */}</div>

        <div className="relative">
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 6h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-20">
              <Link
                href="/manager/dashboard"
                className={`block px-4 py-2 text-sm hover:bg-gray-50 ${isActive('/manager/dashboard') ? 'font-semibold' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/manager/receipts"
                className={`block px-4 py-2 text-sm hover:bg-gray-50 ${isActive('/manager/receipts') ? 'font-semibold' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Receipts
              </Link>

              <Link
                href="/manager/approvals"
                className={`block px-4 py-2 text-sm hover:bg-gray-50 ${isActive('/manager/approvals') ? 'font-semibold' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Approvals
              </Link>

              <Link
                href="/manager/stock-balance"
                className={`block px-4 py-2 text-sm hover:bg-gray-50 ${isActive('/manager/stock-balance') ? 'font-semibold' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Stock Balance
              </Link>

              <div className="border-t mt-1" />
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
