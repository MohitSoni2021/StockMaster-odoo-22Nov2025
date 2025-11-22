'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <nav className='bg-gray-800 text-white p-4'>
      <div className='container mx-auto flex justify-between items-center'>
        <div className='text-xl font-bold'>
          <Link href='/dashboard'>MyApp</Link>
        </div>

        <div className='relative'>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className='px-4 py-2 bg-gray-700 rounded hover:bg-gray-600'
          >
            Settings ▼
          </button>

          {isSettingsOpen && (
            <div className='absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10'>
              <Link
                href='/warehouse'
                className='block px-4 py-2 hover:bg-gray-100'
                onClick={() => setIsSettingsOpen(false)}
              >
                Warehouse
              </Link>
              <Link
                href='/location'
                className='block px-4 py-2 hover:bg-gray-100'
                onClick={() => setIsSettingsOpen(false)}
              >
                Location
              </Link>
              <Link
                href='/product'
                className='block px-4 py-2 hover:bg-gray-100'
                onClick={() => setIsSettingsOpen(false)}
              >
                Product
              </Link>
              <Link
                href='/stock-balance'
                className='block px-4 py-2 hover:bg-gray-100'
                onClick={() => setIsSettingsOpen(false)}
              >
                Stock Balance
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar