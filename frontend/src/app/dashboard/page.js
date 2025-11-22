import React from 'react'
import Navbar from '../../components/Navbar'

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
        {/* Dashboard content will be added here */}
      </div>
    </div>
  )
}

export default Dashboard