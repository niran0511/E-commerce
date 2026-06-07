import React from 'react';
import { FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import StarRating from '../common/StarRating';

const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  if (!review) return null;

  const {
    _id,
    user,
    rating = 5,
    title = '',
    comment = '',
    createdAt,
    isVerified = false
  } = review;

  const userName = user?.name || 'Anonymous';
  const userInitial = userName.charAt(0).toUpperCase();
  const isOwner = currentUserId && (user?._id === currentUserId || user === currentUserId);
  const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  }) : '';

  return (
    <div className="custom-card-static p-3 mb-3 fade-in">
      <div className="d-flex gap-3">
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            flexShrink: 0
          }}
        >
          {userInitial}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center justify-content-between mb-1 flex-wrap gap-1">
            <div>
              <span className="fw-semibold" style={{ fontSize: '0.9rem', marginRight: 8 }}>{userName}</span>
              {isVerified && (
                <span className="d-inline-flex align-items-center gap-1" style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <FiCheckCircle size={12} /> Verified Purchase
                </span>
              )}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{dateStr}</span>
          </div>

          {/* Stars */}
          <div className="mb-2">
            <StarRating rating={rating} size={14} />
          </div>

          {/* Title */}
          {title && (
            <h6 className="mb-1 fw-semibold" style={{ fontSize: '0.9rem' }}>{title}</h6>
          )}

          {/* Comment */}
          <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {comment}
          </p>

          {/* Owner Actions */}
          {isOwner && (
            <div className="d-flex gap-2">
              {onEdit && (
                <button
                  className="btn btn-sm d-flex align-items-center gap-1"
                  onClick={() => onEdit(review)}
                  style={{
                    color: 'var(--primary)',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    padding: '2px 8px'
                  }}
                >
                  <FiEdit2 size={12} /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="btn btn-sm d-flex align-items-center gap-1"
                  onClick={() => onDelete(_id)}
                  style={{
                    color: 'var(--danger)',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    padding: '2px 8px'
                  }}
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
