'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from './Dashboard.module.css';

export default function ManagerDashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await managerAPI.getDashboardKPIs();
        setKpis(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch KPIs');
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const overview = kpis?.overview || {};
  const documentsByStatus = kpis?.documentsByStatus || {};
  const documentsByType = kpis?.documentsByType || {};
  const inventory = kpis?.inventory || {};
  const recentMovements = kpis?.recentMovements || [];

  return (
    <div className={styles.dashboard}>
      <h1>📊 Inventory Manager Dashboard</h1>

      <div className={styles.kpiContainer}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{overview.totalDocuments || 0}</div>
          <div className={styles.kpiLabel}>Total Documents</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{overview.pendingValidations || 0}</div>
          <div className={styles.kpiLabel}>Pending Approvals</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{overview.completedDocuments || 0}</div>
          <div className={styles.kpiLabel}>Completed</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{overview.totalProducts || 0}</div>
          <div className={styles.kpiLabel}>Total Products</div>
        </div>
      </div>

      <div className={styles.analyticsSection}>
        <div className={styles.card}>
          <h2>Documents by Status</h2>
          <div className={styles.statusBreakdown}>
            {Object.entries(documentsByStatus).map(([status, count]) => (
              <div key={status} className={styles.statusItem}>
                <span className={styles.statusLabel}>{status}</span>
                <div className={styles.statusBar}>
                  <div
                    className={styles.statusFill}
                    style={{
                      width: `${(count / (overview.totalDocuments || 1)) * 100}%`,
                      backgroundColor: getStatusColor(status)
                    }}
                  />
                </div>
                <span className={styles.count}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2>Documents by Type</h2>
          <div className={styles.typeBreakdown}>
            {Object.entries(documentsByType).map(([type, count]) => (
              <div key={type} className={styles.typeItem}>
                <span className={styles.typeLabel}>{type}</span>
                <span className={styles.typeCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.inventorySection}>
        <h2>Inventory Overview</h2>
        <div className={styles.inventoryGrid}>
          <div className={styles.inventoryCard}>
            <div className={styles.inventoryLabel}>Total Quantity</div>
            <div className={styles.inventoryValue}>
              {inventory.totalQuantity?.toFixed(2) || 0}
            </div>
          </div>

          <div className={styles.inventoryCard}>
            <div className={styles.inventoryLabel}>Reserved Quantity</div>
            <div className={styles.inventoryValue}>
              {inventory.totalReserved?.toFixed(2) || 0}
            </div>
          </div>

          <div className={styles.inventoryCard}>
            <div className={styles.inventoryLabel}>Available Quantity</div>
            <div className={styles.inventoryValue}>
              {(
                (inventory.totalQuantity || 0) - (inventory.totalReserved || 0)
              ).toFixed(2)}
            </div>
          </div>

          <div className={styles.inventoryCard}>
            <div className={styles.inventoryLabel}>Unique Products</div>
            <div className={styles.inventoryValue}>{inventory.totalProducts || 0}</div>
          </div>
        </div>
      </div>

      <div className={styles.recentMovementsSection}>
        <h2>Recent Stock Movements</h2>
        {recentMovements.length > 0 ? (
          <div className={styles.movementsList}>
            {recentMovements.map((movement) => (
              <div key={movement._id} className={styles.movementItem}>
                <div className={styles.movementType}>
                  {movement.movementType === 'IN' ? '📥' : 'OUT' ? '📤' : '🔄'}
                </div>
                <div className={styles.movementDetails}>
                  <div className={styles.product}>
                    {movement.product?.sku} - {movement.product?.name}
                  </div>
                  <div className={styles.warehouse}>
                    {movement.fromWarehouse?.name} → {movement.toWarehouse?.name}
                  </div>
                </div>
                <div className={styles.movementQty}>{movement.quantity} units</div>
                <div className={styles.movementDate}>
                  {new Date(movement.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noData}>No recent movements</div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    DRAFT: '#ffc107',
    WAITING: '#17a2b8',
    READY: '#28a745',
    DONE: '#6c757d',
    CANCELED: '#dc3545'
  };
  return colors[status] || '#999';
}
