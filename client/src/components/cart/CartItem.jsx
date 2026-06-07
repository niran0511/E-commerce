import React from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiBookmark } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQty, onRemove, onSaveForLater }) => {
  if (!item) return null;

  const product = item.product || item;
  const {
    _id: productId,
    name = 'Product',
    price = 0,
    mrp = 0,
    images = [],
    image = '',
    brand = ''
  } = product;

  const quantity = item.quantity || 1;
  const itemTotal = price * quantity;
  const productImage = images?.[0] || image || 'https://via.placeholder.com/120x120?text=No+Image';

  return (
    <div
      className="p-3 mb-3 fade-in"
      style={{ display: 'flex', gap: 16, flexWrap: 'wrap', background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Image */}
      <Link to={`/products/${productId || item._id}`} style={{ flexShrink: 0 }}>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 8,
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={productImage}
            alt={name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 8, mixBlendMode: 'multiply' }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/120x120?text=No+Image'; }}
          />
        </div>
      </Link>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <Link
          to={`/products/${productId || item._id}`}
          style={{ textDecoration: 'none', color: '#111827' }}
        >
          <h6 className="mb-1 fw-semibold line-clamp-2" style={{ fontSize: '0.95rem' }}>{name}</h6>
        </Link>
        {brand && <p className="mb-2" style={{ color: '#6b7280', fontSize: '0.8rem' }}>{brand}</p>}

        {/* Price */}
        <div className="d-flex align-items-baseline gap-2 mb-3">
          <span className="price-current" style={{ fontSize: '1.1rem' }}>₹{price?.toLocaleString('en-IN')}</span>
          {mrp > price && <span className="price-mrp">₹{mrp?.toLocaleString('en-IN')}</span>}
        </div>

        {/* Actions Row */}
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Quantity Stepper */}
          <div className="d-flex align-items-center rounded-pill" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px' }}>
            <button onClick={() => onUpdateQty(item._id, quantity - 1)} disabled={quantity <= 1} style={{ background: 'transparent', color: '#4b5563', border: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMinus size={12} />
            </button>
            <span style={{ color: '#111827', fontWeight: 600, minWidth: 20, textAlign: 'center', fontSize: 13 }}>{quantity}</span>
            <button onClick={() => onUpdateQty(item._id, quantity + 1)} style={{ background: 'transparent', color: '#4b5563', border: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiPlus size={12} />
            </button>
          </div>

          <div className="d-flex gap-2">
            {onSaveForLater && (
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                onClick={() => onSaveForLater(item._id)}
                style={{
                  color: '#ea580c',
                  background: 'none',
                  border: '1px solid #ea580c',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  padding: '4px 12px'
                }}
              >
                <FiBookmark size={14} /> Save for Later
              </button>
            )}
            <button
              className="btn btn-sm d-flex align-items-center gap-1"
              onClick={() => onRemove(item._id)}
              style={{
                color: '#ef4444',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                fontSize: '0.8rem',
                padding: '6px 12px'
              }}
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-end" style={{ minWidth: 80 }}>
        <p className="mb-0 fw-bold" style={{ fontSize: '1.1rem', color: '#111827' }}>
          ₹{itemTotal?.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
