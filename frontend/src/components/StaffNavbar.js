'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  CheckSquare,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Barcode,
  Search,
  MapPin,
  LogOut,
  Menu,
  X
} from 'lucide-react'

const StaffNavbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; max-age=0'
    document.cookie = 'userRole=; path=/; max-age=0'
    router.push('/(auth)/login')
  }

  const isActive = (path) => pathname === path

  const navItems = [
    { label: 'Dashboard', href: '/staff/dashboard', icon: Home },
    { label: 'Tasks', href: '/staff/tasks', icon: CheckSquare },
    { label: 'Receipts', href: '/staff/receipts', icon: ArrowDownToLine },
    { label: 'Deliveries', href: '/staff/deliveries', icon: ArrowUpFromLine },
    { label: 'Transfers', href: '/staff/transfers', icon: ArrowLeftRight },
    { label: 'Stock Count', href: '/staff/stock-count', icon: Barcode },
    { label: 'Product Lookup', href: '/staff/product-lookup', icon: Search },
    { label: 'Location Stock', href: '/staff/location-stock', icon: MapPin },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/staff/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              S
            </div>
            <span className="hidden sm:block font-semibold text-xl text-gray-800">Staff Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive(item.href)
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                  <span>{item.label}</span>

                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="ml-6 flex items-center gap-2.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top duration-200">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 mt-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default StaffNavbar