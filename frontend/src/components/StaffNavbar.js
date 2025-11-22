'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const StaffNavbar = ({ currentPage }) => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const navItems = [
    { label: 'Dashboard', href: '/staff/dashboard', icon: '📊' },
    { label: 'Tasks', href: '/staff/tasks', icon: '📋' },
    { label: 'Receipts', href: '/staff/receipts', icon: '📥' },
    { label: 'Deliveries', href: '/staff/deliveries', icon: '📦' },
    { label: 'Transfers', href: '/staff/transfers', icon: '↔️' },
    { label: 'Stock Count', href: '/staff/stock-count', icon: '📊' },
    { label: 'Product Lookup', href: '/staff/product-lookup', icon: '🔍' },
    { label: 'Location Stock', href: '/staff/location-stock', icon: '📍' }
  ]

  return (
    <nav style={{ backgroundColor: '#000000', color: '#FFFFFF' }} className="shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/staff/dashboard" className="text-2xl font-bold">
              📦 Staff Portal
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.label.toLowerCase().replace(/\s+/g, '-')
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              ☰
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.label.toLowerCase().replace(/\s+/g, '-')
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default StaffNavbar
