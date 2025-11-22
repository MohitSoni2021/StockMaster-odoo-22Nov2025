'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from './Ledger.module.css';

export default function LedgerPage() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    movementType: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchLedger();
  }, [filters]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getStockLedger(filters);
      setLedgers(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ledger');
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

  if (loading && ledgers.length === 0) {
    return <div className={styles.loading}>Loading stock ledger...</div>;
  }

  const getMovementIcon = (type) => {
    const icons = {
      IN: '📥',
      OUT: '📤',
      TRANSFER: '🔄',
      ADJUSTMENT: '⚙️'
    };
    return icons[type] || '📦';
  };

  const getMovementColor = (type) => {
    const colors = {
      IN: '#28a745',
      OUT: '#dc3545',
      TRANSFER: '#17a2b8',
      ADJUSTMENT: '#ffc107'
    };
    return colors[type] || '#999';
  };

  return (
    <div className={styles.container}>
      <h1>📜 Stock Ledger / Movement History</h1>

      <div className={styles.filters}>
        <select
          value={filters.movementType}
          onChange={(e) => handleFilterChange('movementType', e.target.value)}
          className={styles.select}
        >
          <option value="">All Movement Types</option>
          <option value="IN">Incoming (IN)</option>
          <option value="OUT">Outgoing (OUT)</option>
          <option value="TRANSFER">Transfer</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {ledgers.length > 0 ? (
        <>
          <div className={styles.ledgerList}>
            {ledgers.map((entry) => (
              <div
                key={entry._id}
                className={styles.ledgerEntry}
                style={{ borderLeftColor: getMovementColor(entry.movementType) }}
              >
                <div className={styles.entryHeader}>
                  <div className={styles.movementIcon}>
                    {getMovementIcon(entry.movementType)}
                  </div>
                  <div className={styles.movementInfo}>
                    <div className={styles.movementType}>
                      {entry.movementType}
                    </div>
                    <div className={styles.reference}>
                      {entry.document?.reference || 'Manual Entry'}
                    </div>
                  </div>
                  <div className={styles.dateTime}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                    <br />
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className={styles.entryDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Product:</span>
                    <span className={styles.value}>
                      {entry.product?.sku} - {entry.product?.name}
                    </span>
                  </div>

                  {entry.fromWarehouse && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>From Warehouse:</span>
                      <span className={styles.value}>{entry.fromWarehouse?.name}</span>
                    </div>
                  )}

                  {entry.toWarehouse && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>To Warehouse:</span>
                      <span className={styles.value}>{entry.toWarehouse?.name}</span>
                    </div>
                  )}

                  {entry.fromLocation && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>From Location:</span>
                      <span className={styles.value}>{entry.fromLocation?.name}</span>
                    </div>
                  )}

                  {entry.toLocation && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>To Location:</span>
                      <span className={styles.value}>{entry.toLocation?.name}</span>
                    </div>
                  )}

                  <div className={styles.quantityRow}>
                    <div className={styles.quantityItem}>
                      <span className={styles.label}>Before Qty:</span>
                      <span className={styles.value}>{entry.beforeQty.toFixed(2)}</span>
                    </div>
                    <div className={styles.quantityChange}>
                      {entry.quantity > 0 ? '+' : ''}
                      {entry.quantity.toFixed(2)}
                    </div>
                    <div className={styles.quantityItem}>
                      <span className={styles.label}>After Qty:</span>
                      <span className={styles.value}>{entry.afterQty.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.label}>Performed By:</span>
                    <span className={styles.value}>{entry.performedBy?.name}</span>
                  </div>
                </div>
              </div>
            ))}
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
        <div className={styles.noData}>No ledger entries found</div>
      )}
    </div>
  );
}
