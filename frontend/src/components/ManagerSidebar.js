"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ManagerSidebar() {
  const pathname = usePathname() || '';

  const isActive = (p) => pathname === p || pathname.startsWith(p + '/');

  return (
    <aside className="bg-white rounded-xl p-5 h-[calc(100vh-4rem)] shadow sticky top-5">
      <div className="flex items-center gap-3 mb-4">
  <div className="w-11 h-11 rounded-lg bg-linear-to-br from-green-400 to-teal-300 flex items-center justify-center text-white font-bold">SM</div>
        <div className="font-bold text-slate-900">StockMaster</div>
      </div>

      <nav className="flex flex-col gap-2 mt-3">
  <Link href="/manager/dashboard" className={`px-3 py-2 rounded-md font-semibold text-sm ${isActive('/manager/dashboard') ? 'bg-linear-to-r from-indigo-500 to-purple-500 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
          Dashboard
        </Link>

        <Link href="/manager/receipts" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/manager/receipts') ? 'font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
          Receipts
        </Link>

        <Link href="/manager/deliveries" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/manager/deliveries') ? 'font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
          Deliveries
        </Link>

        <Link href="/manager/transfers" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/manager/transfers') ? 'font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
          Transfers
        </Link>

        <Link href="/manager/stock-balance" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/manager/stock-balance') ? 'font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
          Stock Balance
        </Link>
      </nav>

      <div className="mt-6 text-sm text-slate-500">Manager</div>
    </aside>
  );
}
