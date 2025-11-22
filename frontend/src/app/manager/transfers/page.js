'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
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

  useEffect(() => {
    fetchTransfers();
  }, [filters]);

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

  if (loading && transfers.length === 0) {
    return <div className={styles.loading}>Loading transfers...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>🔄 Internal Transfers</h1>

      <div className={styles.filters}>
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
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(transfer._id, 'READY')}
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {transfer.status === 'READY' && (
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => handleStatusChange(transfer._id, 'DONE')}
                        >
                          Complete
                        </button>
                      )}
                      {(transfer.status === 'DRAFT' || transfer.status === 'READY') && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => handleStatusChange(transfer._id, 'CANCELED')}
                        >
                          Cancel
                        </button>
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
