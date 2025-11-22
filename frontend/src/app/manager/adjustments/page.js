'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from '../receipts/Documents.module.css';

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
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
    fetchAdjustments();
  }, [filters]);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getAdjustments(filters);
      setAdjustments(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch adjustments');
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
        fetchAdjustments();
      }
    } catch (err) {
      alert('Error updating document: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading && adjustments.length === 0) {
    return <div className={styles.loading}>Loading adjustments...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>⚙️ Stock Adjustments</h1>

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

      {adjustments.length > 0 ? (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Warehouse</th>
                  <th>From Location</th>
                  <th>To Location</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adjustment) => (
                  <tr key={adjustment._id}>
                    <td className={styles.reference}>{adjustment.reference}</td>
                    <td>{adjustment.warehouse?.name || 'N/A'}</td>
                    <td>{adjustment.fromLocation?.name || 'N/A'}</td>
                    <td>{adjustment.toLocation?.name || 'N/A'}</td>
                    <td>
                      <span className={`${styles.status} ${styles[adjustment.status]}`}>
                        {adjustment.status}
                      </span>
                    </td>
                    <td>{adjustment.createdBy?.name}</td>
                    <td className={styles.actions}>
                      {adjustment.status === 'DRAFT' && (
                        <>
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(adjustment._id, 'READY')}
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {adjustment.status === 'READY' && (
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => handleStatusChange(adjustment._id, 'DONE')}
                        >
                          Complete
                        </button>
                      )}
                      {(adjustment.status === 'DRAFT' || adjustment.status === 'READY') && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => handleStatusChange(adjustment._id, 'CANCELED')}
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
        <div className={styles.noData}>No adjustments found</div>
      )}
    </div>
  );
}
