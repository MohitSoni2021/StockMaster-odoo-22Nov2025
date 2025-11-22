'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from './Documents.module.css';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
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
    fetchReceipts();
  }, [filters]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getReceipts(filters);
      setReceipts(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch receipts');
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
        fetchReceipts();
      }
    } catch (err) {
      alert('Error updating document: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading && receipts.length === 0) {
    return <div className={styles.loading}>Loading receipts...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>📥 Receipts Management</h1>

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

      {receipts.length > 0 ? (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>From</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt._id}>
                    <td className={styles.reference}>{receipt.reference}</td>
                    <td>{receipt.from?.name || 'N/A'}</td>
                    <td>{receipt.warehouse?.name}</td>
                    <td>
                      <span className={`${styles.status} ${styles[receipt.status]}`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td>{receipt.createdBy?.name}</td>
                    <td>{new Date(receipt.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      {receipt.status === 'DRAFT' && (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(receipt._id, 'READY')}
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {receipt.status === 'READY' && (
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => handleStatusChange(receipt._id, 'DONE')}
                        >
                          Complete
                        </button>
                      )}
                      {(receipt.status === 'DRAFT' || receipt.status === 'READY') && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => handleStatusChange(receipt._id, 'CANCELED')}
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
        <div className={styles.noData}>No receipts found</div>
      )}
    </div>
  );
}
