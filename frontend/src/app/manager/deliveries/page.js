'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import { contactAPI } from '@/utils/api';
import DocumentLines from '@/components/DocumentLines';
import styles from '../receipts/Documents.module.css';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [form, setForm] = useState({
    to: '',
    contact: null,
    contactRef: '',
    scheduleDate: '',
    notes: '',
    meta: {},
    lines: []
  });

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

  useEffect(() => {
    // fetch customer contacts for create form
    const fetchMeta = async () => {
      try {
        const ct = await contactAPI.getContactsByType('customer');
        setContacts(ct.data || ct.data?.data || ct);
      } catch (e) {
        // ignore
      }
    };

    fetchMeta();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getDeliveries(filters);
      setDeliveries(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      let response;
      if (newStatus === 'READY') {
        response = await managerAPI.approveDocument(id, {
          validatedBy: 'current-user-id'
        });
      } else if (newStatus === 'DONE') {
        response = await managerAPI.completeDocument(id);
      } else if (newStatus === 'CANCELED') {
        response = await managerAPI.cancelDocument(id);
      }

      if (response) {
        fetchDeliveries();
      }
    } catch (err) {
      alert('Error updating document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const createDelivery = async (e) => {
    e?.preventDefault?.();
    setCreateError(null);
    if (!form.to) {
      setCreateError('To (customer) is required');
      return;
    }

    if (!form.lines || form.lines.length === 0) {
      setCreateError('At least one document line is required');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        to: form.to,
        contact: form.contact,
        contactRef: form.contactRef,
        scheduleDate: form.scheduleDate || undefined,
        notes: form.notes || undefined,
        meta: form.meta,
        lines: form.lines
      };

      const res = await managerAPI.createDelivery(payload);
      // success
      setShowCreate(false);
      setForm({
        to: '',
        contact: null,
        contactRef: '',
        scheduleDate: '',
        notes: '',
        meta: {},
        lines: []
      });
      // refresh list
      fetchDeliveries();
      alert('Delivery created successfully');
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create delivery');
    } finally {
      setCreating(false);
    }
  };

  const updateDelivery = async (e) => {
    e?.preventDefault?.();
    setUpdateError(null);
    if (!form.to) {
      setUpdateError('To (customer) is required');
      return;
    }

    if (!form.lines || form.lines.length === 0) {
      setUpdateError('At least one document line is required');
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        to: form.to,
        contact: form.contact,
        contactRef: form.contactRef,
        scheduleDate: form.scheduleDate || undefined,
        notes: form.notes || undefined,
        meta: form.meta,
        lines: form.lines
      };

      const res = await managerAPI.updateDelivery(editingDelivery._id, payload);
      // success
      setShowEdit(false);
      setEditingDelivery(null);
      setForm({
        to: '',
        contact: null,
        contactRef: '',
        scheduleDate: '',
        notes: '',
        meta: {},
        lines: []
      });
      // refresh list
      fetchDeliveries();
      alert('Delivery updated successfully');
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.message || 'Failed to update delivery');
    } finally {
      setUpdating(false);
    }
  };

  const deleteDelivery = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
      return;
    }

    try {
      await managerAPI.deleteDelivery(id);
      fetchDeliveries();
      alert('Delivery deleted successfully');
    } catch (err) {
      alert('Error deleting delivery: ' + (err.response?.data?.message || err.message));
    }
  };

  const startEdit = (delivery) => {
    setEditingDelivery(delivery);
    setForm({
      to: delivery.to?._id || delivery.to,
      contact: delivery.contact,
      contactRef: delivery.contactRef,
      scheduleDate: delivery.scheduleDate ? delivery.scheduleDate.split('T')[0] : '',
      notes: delivery.notes || '',
      meta: delivery.meta || {},
      lines: delivery.lines || []
    });
    setShowEdit(true);
    setUpdateError(null);
  };

  if (loading && deliveries.length === 0) {
    return <div className={styles.loading}>Loading deliveries...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>📤 Deliveries Management</h1>

      <div className={styles.filters}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setShowCreate(!showCreate)}
        >
          + New Delivery
        </button>

        <input
          type="text"
          placeholder="Search by reference..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={styles.input}
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.select}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="READY">Ready</option>
          <option value="DONE">Done</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showCreate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3>Create New Delivery</h3>
            <form onSubmit={createDelivery}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Customer (To) *
                </label>
                <select
                  value={form.to}
                  onChange={(e) => handleFormChange('to', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select Customer</option>
                  {contacts && contacts.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={form.scheduleDate}
                  onChange={(e) => handleFormChange('scheduleDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Optional notes"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <DocumentLines
                lines={form.lines}
                onChange={(lines) => handleFormChange('lines', lines)}
                error={createError && createError.includes('line') ? createError : null}
              />

              {createError && !createError.includes('line') && (
                <div style={{ color: '#dc3545', marginTop: '10px' }}>{createError}</div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  type="submit"
                  disabled={creating}
                  style={{ flex: 1 }}
                >
                  {creating ? 'Creating...' : 'Create Delivery'}
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                    setForm({
                      to: '',
                      contact: null,
                      contactRef: '',
                      scheduleDate: '',
                      notes: '',
                      meta: {},
                      lines: []
                    });
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3>Edit Delivery - {editingDelivery?.reference}</h3>
            <form onSubmit={updateDelivery}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Customer (To) *
                </label>
                <select
                  value={form.to}
                  onChange={(e) => handleFormChange('to', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select Customer</option>
                  {contacts && contacts.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={form.scheduleDate}
                  onChange={(e) => handleFormChange('scheduleDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Optional notes"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <DocumentLines
                lines={form.lines}
                onChange={(lines) => handleFormChange('lines', lines)}
                error={updateError && updateError.includes('line') ? updateError : null}
              />

              {updateError && !updateError.includes('line') && (
                <div style={{ color: '#dc3545', marginTop: '10px' }}>{updateError}</div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  type="submit"
                  disabled={updating}
                  style={{ flex: 1 }}
                >
                  {updating ? 'Updating...' : 'Update Delivery'}
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => {
                    setShowEdit(false);
                    setEditingDelivery(null);
                    setUpdateError(null);
                    setForm({
                      to: '',
                      contact: null,
                      contactRef: '',
                      scheduleDate: '',
                      notes: '',
                      meta: {},
                      lines: []
                    });
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deliveries.length > 0 ? (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>To</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery._id}>
                    <td className={styles.reference}>{delivery.reference}</td>
                    <td>{delivery.to?.name || 'N/A'}</td>
                    <td>{delivery.warehouse?.name}</td>
                    <td>
                      <span className={`${styles.status} ${styles[delivery.status]}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td>{delivery.createdBy?.name}</td>
                    <td>{new Date(delivery.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      {delivery.status === 'DRAFT' && (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => startEdit(delivery)}
                            style={{ marginRight: '5px' }}
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(delivery._id, 'READY')}
                            style={{ marginRight: '5px' }}
                          >
                            Approve
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => deleteDelivery(delivery._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {delivery.status === 'READY' && (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => handleStatusChange(delivery._id, 'DONE')}
                            style={{ marginRight: '5px' }}
                          >
                            Complete
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => handleStatusChange(delivery._id, 'CANCELED')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {delivery.status === 'DONE' && (
                        <span className={styles.completed}>Completed</span>
                      )}
                      {delivery.status === 'CANCELED' && (
                        <span className={styles.canceled}>Canceled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              disabled={!pagination.hasPrev}
              onClick={() => handleFilterChange('page', filters.page - 1)}
              className={styles.paginationBtn}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalDocuments} total)
            </span>
            <button
              disabled={!pagination.hasNext}
              onClick={() => handleFilterChange('page', filters.page + 1)}
              className={styles.paginationBtn}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className={styles.noData}>No deliveries found</div>
      )}
    </div>
  );
}
