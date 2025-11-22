'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from './StockBalance.module.css';

export default function StockBalancePage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchStockBalance();
  }, [filters]);

  const fetchStockBalance = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getStockBalance(filters);
      setBalances(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stock balance');
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

  if (loading && balances.length === 0) {
    return <div className={styles.loading}>Loading stock balance...</div>;
  }

  const totalQuantity = balances.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalReserved = balances.reduce((sum, b) => sum + (b.reservedQuantity || 0), 0);
  const totalAvailable = totalQuantity - totalReserved;

  return (
    <div className={styles.container}>
      <h1>📦 Stock Balance</h1>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.label}>Total Quantity</div>
          <div className={styles.value}>{totalQuantity.toFixed(2)}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>Reserved</div>
          <div className={styles.value}>{totalReserved.toFixed(2)}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>Available</div>
          <div className={styles.value}>{totalAvailable.toFixed(2)}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>Total Items</div>
          <div className={styles.value}>{balances.length}</div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {balances.length > 0 ? (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Reserved</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance) => (
                  <tr key={balance._id}>
                    <td className={styles.sku}>{balance.product?.sku}</td>
                    <td>{balance.product?.name}</td>
                    <td>{balance.product?.category || '-'}</td>
                    <td>{balance.warehouse?.name || '-'}</td>
                    <td>{balance.location?.name || 'N/A'}</td>
                    <td className={styles.qty}>{balance.quantity.toFixed(2)}</td>
                    <td className={styles.reserved}>{balance.reservedQuantity.toFixed(2)}</td>
                    <td className={styles.available}>
                      {(balance.quantity - balance.reservedQuantity).toFixed(2)}
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
        <div className={styles.noData}>No stock balance data available</div>
      )}
    </div>
  );
}
