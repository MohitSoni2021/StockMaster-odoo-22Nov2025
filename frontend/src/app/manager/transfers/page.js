'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import { warehouseAPI } from '@/utils/api';
import DocumentLines from '@/components/DocumentLines';
import styles from '../receipts/Documents.module.css';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
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
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [form, setForm] = useState({
    toWarehouse: '',
    fromLocation: '',
    toLocation: '',
    scheduleDate: '',
    notes: '',
    meta: {},
    lines: []
  });

  useEffect(() => {
    fetchTransfers();
  }, [filters]);

  useEffect(() => {
    // fetch warehouses for create form
    const fetchMeta = async () => {
      try {
        const wh = await warehouseAPI.getWarehouses();
        const allWarehouses = wh.data || wh.data?.data || wh || [];
        setWarehouses(allWarehouses);
      } catch (e) {
        // ignore
      }
    };

    fetchMeta();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getTransfers(filters);
      setTransfers(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transfers');
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
        fetchTransfers();
      }
    } catch (err) {
      alert('Error updating document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const createTransfer = async (e) => {
    e?.preventDefault?.();
    setCreateError(null);
    if (!form.toWarehouse) {
      setCreateError('Destination warehouse is required');
      return;
    }

    if (!form.lines || form.lines.length === 0) {
      setCreateError('At least one document line is required');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        toWarehouse: form.toWarehouse,
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        scheduleDate: form.scheduleDate || undefined,
        notes: form.notes || undefined,
        meta: form.meta,
        lines: form.lines
      };

      const res = await managerAPI.createTransfer(payload);
      // success
      setShowCreate(false);
      setForm({
        toWarehouse: '',
        fromLocation: '',
        toLocation: '',
        scheduleDate: '',
        notes: '',
        meta: {},
        lines: []
      });
      // refresh list
      fetchTransfers();
      alert('Transfer created successfully');
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create transfer');
    } finally {
      setCreating(false);
    }
  };

  const updateTransfer = async (e) => {
    e?.preventDefault?.();
    setUpdateError(null);
    if (!form.toWarehouse) {
      setUpdateError('Destination warehouse is required');
      return;
    }

    if (!form.lines || form.lines.length === 0) {
      setUpdateError('At least one document line is required');
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        toWarehouse: form.toWarehouse,
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        scheduleDate: form.scheduleDate || undefined,
        notes: form.notes || undefined,
        meta: form.meta,
        lines: form.lines
      };

      const res = await managerAPI.updateTransfer(editingTransfer._id, payload);
      // success
      setShowEdit(false);
      setEditingTransfer(null);
      setForm({
        toWarehouse: '',
        fromLocation: '',
        toLocation: '',
        scheduleDate: '',
        notes: '',
        meta: {},
        lines: []
      });
      // refresh list
      fetchTransfers();
      alert('Transfer updated successfully');
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.message || 'Failed to update transfer');
    } finally {
      setUpdating(false);
    }
  };

  const deleteTransfer = async (id) => {
    if (!confirm('Are you sure you want to delete this transfer? This action cannot be undone.')) {
      return;
    }

    try {
      await managerAPI.deleteTransfer(id);
      fetchTransfers();
      alert('Transfer deleted successfully');
    } catch (err) {
      alert('Error deleting transfer: ' + (err.response?.data?.message || err.message));
    }
  };

  const startEdit = (transfer) => {
    setEditingTransfer(transfer);
    setForm({
      toWarehouse: transfer.toWarehouse?._id || transfer.toWarehouse,
      fromLocation: transfer.fromLocation?._id || transfer.fromLocation,
      toLocation: transfer.toLocation?._id || transfer.toLocation,
      scheduleDate: transfer.scheduleDate ? transfer.scheduleDate.split('T')[0] : '',
      notes: transfer.notes || '',
      meta: transfer.meta || {},
      lines: transfer.lines || []
    });
    setShowEdit(true);
    setUpdateError(null);
  };

  if (loading && transfers.length === 0) {
    return <div className={styles.loading}>Loading transfers...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>🔄 Internal Transfers</h1>

      <div className={styles.filters}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setShowCreate(!showCreate)}
        >
          + New Transfer
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
            <h3>Create New Transfer</h3>
            <form onSubmit={createTransfer}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Destination Warehouse *
                </label>
                <select
                  value={form.toWarehouse}
                  onChange={(e) => handleFormChange('toWarehouse', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select Destination Warehouse</option>
                  {warehouses && warehouses.map(w => (
                    <option key={w._id || w.id} value={w._id || w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  From Location
                </label>
                <input
                  type="text"
                  value={form.fromLocation}
                  onChange={(e) => handleFormChange('fromLocation', e.target.value)}
                  placeholder="Optional from location"
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
                  To Location
                </label>
                <input
                  type="text"
                  value={form.toLocation}
                  onChange={(e) => handleFormChange('toLocation', e.target.value)}
                  placeholder="Optional to location"
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
                  {creating ? 'Creating...' : 'Create Transfer'}
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                    setForm({
                      toWarehouse: '',
                      fromLocation: '',
                      toLocation: '',
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
            <h3>Edit Transfer - {editingTransfer?.reference}</h3>
            <form onSubmit={updateTransfer}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Destination Warehouse *
                </label>
                <select
                  value={form.toWarehouse}
                  onChange={(e) => handleFormChange('toWarehouse', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">Select Destination Warehouse</option>
                  {warehouses && warehouses.map(w => (
                    <option key={w._id || w.id} value={w._id || w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  From Location
                </label>
                <input
                  type="text"
                  value={form.fromLocation}
                  onChange={(e) => handleFormChange('fromLocation', e.target.value)}
                  placeholder="Optional from location"
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
                  To Location
                </label>
                <input
                  type="text"
                  value={form.toLocation}
                  onChange={(e) => handleFormChange('toLocation', e.target.value)}
                  placeholder="Optional to location"
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
                  {updating ? 'Updating...' : 'Update Transfer'}
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => {
                    setShowEdit(false);
                    setEditingTransfer(null);
                    setUpdateError(null);
                    setForm({
                      toWarehouse: '',
                      fromLocation: '',
                      toLocation: '',
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

      {transfers.length > 0 ? (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>From Location</th>
                  <th>To Location</th>
                  <th>To Warehouse</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer._id}>
                    <td className={styles.reference}>{transfer.reference}</td>
                    <td>{transfer.fromLocation?.name || 'N/A'}</td>
                    <td>{transfer.toLocation?.name || 'N/A'}</td>
                    <td>{transfer.toWarehouse?.name || 'N/A'}</td>
                    <td>
                      <span className={`${styles.status} ${styles[transfer.status]}`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td>{transfer.createdBy?.name}</td>
                    <td className={styles.actions}>
                      {transfer.status === 'DRAFT' && (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => startEdit(transfer)}
                            style={{ marginRight: '5px' }}
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(transfer._id, 'READY')}
                            style={{ marginRight: '5px' }}
                          >
                            Approve
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => deleteTransfer(transfer._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {transfer.status === 'READY' && (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => handleStatusChange(transfer._id, 'DONE')}
                            style={{ marginRight: '5px' }}
                          >
                            Complete
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => handleStatusChange(transfer._id, 'CANCELED')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {transfer.status === 'DONE' && (
                        <span className={styles.completed}>Completed</span>
                      )}
                      {transfer.status === 'CANCELED' && (
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
        <div className={styles.noData}>No transfers found</div>
      )}
    </div>
  );
}
