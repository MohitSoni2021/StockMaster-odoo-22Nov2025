'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
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

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

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

  if (loading && deliveries.length === 0) {
    return <div className={styles.loading}>Loading deliveries...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>📤 Deliveries Management</h1>

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
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(delivery._id, 'READY')}
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {delivery.status === 'READY' && (
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => handleStatusChange(delivery._id, 'DONE')}
                        >
                          Complete
                        </button>
                      )}
                      {(delivery.status === 'DRAFT' || delivery.status === 'READY') && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => handleStatusChange(delivery._id, 'CANCELED')}
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
        <div className={styles.noData}>No deliveries found</div>
      )}
    </div>
  );
}
