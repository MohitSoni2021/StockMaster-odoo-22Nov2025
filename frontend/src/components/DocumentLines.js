'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/utils/api';

// Simple, dependency-free searchable combobox for selecting products
const ProductCombo = ({ line, products, onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (line && line.product) {
      const p = products.find(pr => (pr._id || pr.id) === line.product);
      if (p) setQuery(`${p.sku || ''} - ${p.name || ''}`);
    }
  }, [line.product, products]);

  const filtered = products.filter(p => {
    const label = `${p.sku || ''} ${p.name || ''}`.toLowerCase();
    return label.includes(query.toLowerCase());
  });

  const attemptMatch = () => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    // try exact SKU - name match
    let found = products.find(p => (`${p.sku || ''} - ${p.name || ''}`).toLowerCase() === q);
    if (!found) {
      // try contains match on sku or name
      found = products.find(p => {
        const label = `${p.sku || ''} ${p.name || ''}`.toLowerCase();
        return label.includes(q);
      });
    }
    if (found) {
      const pid = found._id || found.id;
      onSelect(pid);
      setQuery(`${found.sku || ''} - ${found.name || ''}`);
      return pid;
    }
    return null;
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // delay to allow click selection to fire first; then try to match typed text
          setTimeout(() => {
            setOpen(false);
            attemptMatch();
          }, 150);
        }}
        placeholder="Search product by SKU or name"
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            zIndex: 50,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '8px', color: '#666' }}>No products match "{query}"</div>
          ) : (
            filtered.map(p => {
              const pid = p._id || p.id;
              return (
                <div
                  key={pid}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(pid);
                    setQuery(`${p.sku || ''} - ${p.name || ''}`);
                    setOpen(false);
                  }}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #f1f1f1' }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.sku} — {p.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{p.description || ''}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const DocumentLines = ({ lines, onChange, error }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getProducts();
        const productsData = response.data || response.data?.data || response || [];
        console.log('Fetched products:', productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addLine = () => {
    const newLine = {
      product: '',
      uom: 'PIECE',
      quantity: 1,
      unitCost: 0,
      meta: {}
    };
    console.log('Adding new line:', newLine);
    onChange([...lines, newLine]);
  };

  const removeLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    onChange(newLines);
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    console.log('Updating line', index, field, 'to', value, 'new lines:', newLines);
    onChange(newLines);
  };

  const getProductById = (id) => {
    const product = products.find(p => (p._id || p.id) === id);
    console.log('Finding product by id:', id, 'found:', product);
    return product;
  };

  const handleProductChange = (index, productId) => {
    console.log('Handling product change for line', index, 'productId:', productId);
    const product = getProductById(productId);
    updateLine(index, 'product', productId);
    if (product) {
      updateLine(index, 'uom', product.defaultUom || 'PIECE');
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (products.length === 0) {
    return <div style={{ color: '#dc3545', padding: '10px', border: '1px solid #dc3545', borderRadius: '4px' }}>
      No products available. Please add products first.
    </div>;
  }

  console.log('DocumentLines render - lines:', lines, 'products:', products.length);

  return (
    <div style={{ marginTop: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Document Lines</h4>
        <button
          type="button"
          onClick={addLine}
          style={{
            padding: '5px 10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Add Line
        </button>
      </div>

      {lines.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666', border: '1px dashed #ccc', borderRadius: '4px' }}>
          No lines added yet. Click "Add Line" to add products.
        </div>
      )}

      {lines.map((line, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '10px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <div style={{ flex: 2, position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Product</label>

            {/* Searchable combobox to improve UX and avoid native select problems */}
            <ProductCombo
              line={line}
              products={products}
              onSelect={(productId) => handleProductChange(index, productId)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>UOM</label>
            <select
              value={line.uom}
              onChange={(e) => updateLine(index, 'uom', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="PIECE">PIECE</option>
              <option value="KG">KG</option>
              <option value="LTR">LTR</option>
              <option value="MTR">MTR</option>
              <option value="BOX">BOX</option>
              <option value="PACK">PACK</option>
              <option value="CASE">CASE</option>
              <option value="BUNDLE">BUNDLE</option>
              <option value="UNIT">UNIT</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Quantity</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={line.quantity}
              onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Unit Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={line.unitCost}
              onChange={(e) => updateLine(index, 'unitCost', parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={() => removeLine(index)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {error && (
        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentLines;