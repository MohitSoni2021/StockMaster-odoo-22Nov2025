'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { contactAPI } from '../../utils/api'

const Contact = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    type: 'vendor',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN'
    },
    meta: {}
  })

  const contactTypes = ['vendor', 'customer', 'internal']

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('address_')) {
      const addressField = name.replace('address_', '')
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      alert('Please fill in the contact name')
      return
    }

    try {
      setSubmitLoading(true)

      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        mobileNo: formData.mobileNo || undefined,
        type: formData.type,
        address: Object.keys(formData.address).some(key => formData.address[key])
          ? formData.address
          : undefined,
        meta: formData.meta
      }

      if (editingId) {
        await contactAPI.updateContact(editingId, payload)
        alert('Contact updated successfully!')
      } else {
        await contactAPI.createContact(payload)
        alert('Contact created successfully!')
      }

      setFormData({
        name: '',
        email: '',
        mobileNo: '',
        type: 'vendor',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'IN'
        },
        meta: {}
      })
      setEditingId(null)
      fetchContacts()
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      email: contact.email || '',
      mobileNo: contact.mobileNo || '',
      type: contact.type,
      address: contact.address || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN'
      },
      meta: contact.meta || {}
    })
    setEditingId(contact._id)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactAPI.deleteContact(id)
        alert('Contact deleted successfully!')
        fetchContacts()
      } catch (error) {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      mobileNo: '',
      type: 'vendor',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN'
      },
      meta: {}
    })
    setEditingId(null)
  }

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await contactAPI.getContacts()
      setContacts(result.data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setError('Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return (
    <div>
      <Navbar />
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Contact Management</h1>

        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>{editingId ? 'Edit Contact' : 'Create New Contact'}</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Contact Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., John Doe'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Type</label>
                <select
                  name='type'
                  value={formData.type}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                >
                  {contactTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., john@example.com'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Mobile Number</label>
                <input
                  type='tel'
                  name='mobileNo'
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded-md'
                  placeholder='e.g., +91-9999999999'
                />
              </div>
            </div>

            <div className='border-t pt-4 mt-4'>
              <h3 className='font-semibold mb-3'>Address</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Line 1</label>
                  <input
                    type='text'
                    name='address_line1'
                    value={formData.address.line1}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Street address'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Line 2</label>
                  <input
                    type='text'
                    name='address_line2'
                    value={formData.address.line2}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Building, suite, etc.'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>City</label>
                  <input
                    type='text'
                    name='address_city'
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='City'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>State</label>
                  <input
                    type='text'
                    name='address_state'
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='State'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Postal Code</label>
                  <input
                    type='text'
                    name='address_postalCode'
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    placeholder='Postal code'
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={submitLoading}
                className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400'
              >
                {submitLoading ? 'Saving...' : editingId ? 'Update Contact' : 'Create Contact'}
              </button>
              {editingId && (
                <button
                  type='button'
                  onClick={handleCancel}
                  className='bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600'
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Contacts</h2>

          {loading ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <p className='mt-2 text-gray-600'>Loading contacts...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-500 mb-4'>{error}</p>
              <button
                onClick={fetchContacts}
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
              >
                Try Again
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No contacts created yet.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Type</th>
                    <th className='px-4 py-2 text-left'>Email</th>
                    <th className='px-4 py-2 text-left'>Mobile</th>
                    <th className='px-4 py-2 text-left'>City</th>
                    <th className='px-4 py-2 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact._id} className='border-t hover:bg-gray-50'>
                      <td className='px-4 py-2 font-medium'>{contact.name}</td>
                      <td className='px-4 py-2'>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contact.type === 'vendor'
                            ? 'bg-blue-100 text-blue-800'
                            : contact.type === 'customer'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}>
                          {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                        </span>
                      </td>
                      <td className='px-4 py-2 text-sm'>{contact.email || '-'}</td>
                      <td className='px-4 py-2 text-sm'>{contact.mobileNo || '-'}</td>
                      <td className='px-4 py-2 text-sm'>{contact.address?.city || '-'}</td>
                      <td className='px-4 py-2 text-sm'>
                        <button
                          onClick={() => handleEdit(contact)}
                          className='text-blue-500 hover:text-blue-700 mr-3'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className='text-red-500 hover:text-red-700'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact
