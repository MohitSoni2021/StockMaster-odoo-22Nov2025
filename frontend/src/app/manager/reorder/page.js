'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from './Reorder.module.css';

export default function ReorderPage() {
  const [needsReplenishment, setNeedsReplenishment] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('replenishment');

  useEffect(() => {
    fetchReorderItems();
  }, []);

  const fetchReorderItems = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getReorderItems();
      setNeedsReplenishment(response.data.data.needsReplenishment);
      setOutOfStock(response.data.data.outOfStock);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reorder items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading reorder information...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>🔔 Inventory Replenishment & Reorder Points</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'replenishment' ? styles.active : ''}`}
          onClick={() => setActiveTab('replenishment')}
        >
          Needs Replenishment
          <span className={styles.badge}>{needsReplenishment.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'outofstock' ? styles.active : ''}`}
          onClick={() => setActiveTab('outofstock')}
        >
          Out of Stock
          <span className={styles.badge}>{outOfStock.length}</span>
        </button>
      </div>

      {activeTab === 'replenishment' && (
        <div className={styles.tabContent}>
          {needsReplenishment.length > 0 ? (
            <>
              <div className={styles.alert}>
                <span className={styles.alertIcon}>⚠️</span>
                <span>
                  {needsReplenishment.length} item(s) need replenishment. Current quantity is at or below
                  reorder point.
                </span>
              </div>

              <div className={styles.itemsGrid}>
                {needsReplenishment.map((item) => (
                  <div key={item._id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.productInfo}>
                        <div className={styles.sku}>{item.product?.sku}</div>
                        <div className={styles.name}>{item.product?.name}</div>
                      </div>
                      <div className={styles.status}>⚠️ REPLENISH</div>
                    </div>

                    <div className={styles.itemBody}>
                      {item.product?.category && (
                        <div className={styles.field}>
                          <span className={styles.label}>Category:</span>
                          <span className={styles.value}>{item.product.category}</span>
                        </div>
                      )}

                      <div className={styles.field}>
                        <span className={styles.label}>Warehouse:</span>
                        <span className={styles.value}>{item.warehouse?.name}</span>
                      </div>

                      <div className={styles.field}>
                        <span className={styles.label}>Location:</span>
                        <span className={styles.value}>{item.location?.name || 'N/A'}</span>
                      </div>

                      <div className={styles.quantitySection}>
                        <div className={styles.quantityRow}>
                          <div className={styles.qty}>
                            <span className={styles.label}>Current Qty</span>
                            <span className={styles.qtyValue}>{item.quantity.toFixed(2)}</span>
                          </div>
                          <div className={styles.qty}>
                            <span className={styles.label}>Reorder Point</span>
                            <span className={styles.qtyValue}>
                              {item.product?.reorderPoint?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className={styles.qty}>
                            <span className={styles.label}>Reserved</span>
                            <span className={styles.qtyValue}>
                              {item.reservedQuantity.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.alert} style={{ marginTop: '15px' }}>
                        <span style={{ fontSize: '0.9rem' }}>
                          Shortage: {Math.max(
                            0,
                            (item.product?.reorderPoint || 0) - item.quantity
                          ).toFixed(2)}{' '}
                          units
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.noData}>
              <span className={styles.successIcon}>✓</span>
              All items are well stocked above reorder points
            </div>
          )}
        </div>
      )}

      {activeTab === 'outofstock' && (
        <div className={styles.tabContent}>
          {outOfStock.length > 0 ? (
            <>
              <div className={styles.alert} style={{ background: '#f8d7da', color: '#721c24' }}>
                <span className={styles.alertIcon}>🚨</span>
                <span>
                  {outOfStock.length} item(s) are completely out of stock. Immediate action required.
                </span>
              </div>

              <div className={styles.itemsGrid}>
                {outOfStock.map((item) => (
                  <div key={item._id} className={`${styles.itemCard} ${styles.critical}`}>
                    <div className={styles.itemHeader}>
                      <div className={styles.productInfo}>
                        <div className={styles.sku}>{item.product?.sku}</div>
                        <div className={styles.name}>{item.product?.name}</div>
                      </div>
                      <div className={`${styles.status} ${styles.critical}`}>🚨 OUT OF STOCK</div>
                    </div>

                    <div className={styles.itemBody}>
                      {item.product?.category && (
                        <div className={styles.field}>
                          <span className={styles.label}>Category:</span>
                          <span className={styles.value}>{item.product.category}</span>
                        </div>
                      )}

                      <div className={styles.field}>
                        <span className={styles.label}>Warehouse:</span>
                        <span className={styles.value}>{item.warehouse?.name}</span>
                      </div>

                      <div className={styles.field}>
                        <span className={styles.label}>Location:</span>
                        <span className={styles.value}>{item.location?.name || 'N/A'}</span>
                      </div>

                      <div className={styles.quantitySection}>
                        <div className={styles.quantityRow}>
                          <div className={styles.qty}>
                            <span className={styles.label}>Current Qty</span>
                            <span className={styles.qtyValue}>0.00</span>
                          </div>
                          <div className={styles.qty}>
                            <span className={styles.label}>Reorder Point</span>
                            <span className={styles.qtyValue}>
                              {item.product?.reorderPoint?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className={styles.qty}>
                            <span className={styles.label}>Reserved</span>
                            <span className={styles.qtyValue}>
                              {item.reservedQuantity.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.alert} style={{ marginTop: '15px', background: '#f8d7da' }}>
                        <span style={{ fontSize: '0.9rem' }}>
                          Needed: {(item.product?.reorderPoint || 0).toFixed(2)} units
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.noData}>
              <span className={styles.successIcon}>✓</span>
              No items are out of stock
            </div>
          )}
        </div>
      )}
    </div>
  );
}
