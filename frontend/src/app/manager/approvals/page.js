'use client';

import { useEffect, useState } from 'react';
import managerAPI from '@/utils/managerApi';
import styles from './Approvals.module.css';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchApprovals();
  }, [filters]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getPendingApprovals(filters);
      setApprovals(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await managerAPI.approveDocument(id, {
        validatedBy: 'current-user-id'
      });
      alert('Document approved successfully');
      fetchApprovals();
      setSelectedDoc(null);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await managerAPI.rejectDocument(id, { reason });
      alert('Document rejected successfully');
      fetchApprovals();
      setSelectedDoc(null);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  if (loading && approvals.length === 0) {
    return <div className={styles.loading}>Loading pending approvals...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>✅ Pending Approvals</h1>

      <div className={styles.filters}>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className={styles.select}
        >
          <option value="">All Document Types</option>
          <option value="RECEIPT">Receipts</option>
          <option value="DELIVERY">Deliveries</option>
          <option value="TRANSFER">Transfers</option>
          <option value="ADJUSTMENT">Adjustments</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <div className={styles.documentList}>
          {approvals.length > 0 ? (
            <>
              {approvals.map((doc) => (
                <div
                  key={doc._id}
                  className={`${styles.documentCard} ${selectedDoc?._id === doc._id ? styles.active : ''}`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className={styles.docHeader}>
                    <div className={styles.docType}>{doc.type}</div>
                    <div className={styles.docRef}>{doc.reference}</div>
                  </div>
                  <div className={styles.docContent}>
                    <div className={styles.docField}>
                      <span className={styles.label}>Warehouse:</span>
                      <span>{doc.warehouse?.name}</span>
                    </div>
                    <div className={styles.docField}>
                      <span className={styles.label}>Created By:</span>
                      <span>{doc.createdBy?.name}</span>
                    </div>
                    <div className={styles.docField}>
                      <span className={styles.label}>Date:</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.pagination}>
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  className={styles.paginationBtn}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
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
            <div className={styles.noData}>No pending approvals</div>
          )}
        </div>

        <div className={styles.detailPanel}>
          {selectedDoc ? (
            <div className={styles.details}>
              <h2>Document Details</h2>

              <div className={styles.detailGroup}>
                <label>Document Type</label>
                <p>{selectedDoc.type}</p>
              </div>

              <div className={styles.detailGroup}>
                <label>Reference</label>
                <p className={styles.reference}>{selectedDoc.reference}</p>
              </div>

              <div className={styles.detailGroup}>
                <label>Warehouse</label>
                <p>{selectedDoc.warehouse?.name}</p>
              </div>

              {selectedDoc.from && (
                <div className={styles.detailGroup}>
                  <label>From (Vendor)</label>
                  <div className={styles.contactInfo}>
                    <p className={styles.contactName}>{selectedDoc.from?.name}</p>
                    <p className={styles.contactEmail}>{selectedDoc.from?.email}</p>
                    {selectedDoc.from?.mobileNo && (
                      <p className={styles.contactPhone}>{selectedDoc.from?.mobileNo}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedDoc.to && (
                <div className={styles.detailGroup}>
                  <label>To (Customer)</label>
                  <div className={styles.contactInfo}>
                    <p className={styles.contactName}>{selectedDoc.to?.name}</p>
                    <p className={styles.contactEmail}>{selectedDoc.to?.email}</p>
                    {selectedDoc.to?.mobileNo && (
                      <p className={styles.contactPhone}>{selectedDoc.to?.mobileNo}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedDoc.toWarehouse && (
                <div className={styles.detailGroup}>
                  <label>Destination Warehouse</label>
                  <p>{selectedDoc.toWarehouse?.name}</p>
                </div>
              )}

              <div className={styles.detailGroup}>
                <label>Created By</label>
                <p>{selectedDoc.createdBy?.name} ({selectedDoc.createdBy?.email})</p>
              </div>

              <div className={styles.detailGroup}>
                <label>Created At</label>
                <p>{new Date(selectedDoc.createdAt).toLocaleString()}</p>
              </div>

              {selectedDoc.notes && (
                <div className={styles.detailGroup}>
                  <label>Notes</label>
                  <p className={styles.notes}>{selectedDoc.notes}</p>
                </div>
              )}

              <div className={styles.actions}>
                <button
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={() => handleApprove(selectedDoc._id)}
                >
                  ✓ Approve
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleReject(selectedDoc._id)}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noSelection}>
              Select a document to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
