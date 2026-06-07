import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import StarRating from '../common/StarRating';

const ReviewForm = ({ onSubmit, initialData = null, loading = false }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review');
      return;
    }

    onSubmit({ rating, title: title.trim(), comment: comment.trim() });

    if (!initialData) {
      setRating(0);
      setTitle('');
      setComment('');
    }
  };

  return (
    <div className="custom-card-static p-4 mb-4">
      <h6 className="mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
        {initialData ? 'Edit Your Review' : 'Write a Review'}
      </h6>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-3">
          <label className="form-label">Rating *</label>
          <div>
            <StarRating
              rating={rating}
              interactive
              onRate={setRating}
              size={28}
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title (Optional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Sum up your review in a line"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Comment */}
        <div className="mb-3">
          <label className="form-label">Your Review *</label>
          <textarea
            className="form-control"
            placeholder="Share your experience with this product..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            style={{ resize: 'vertical' }}
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {comment.length}/1000
          </small>
        </div>

        {error && (
          <div className="mb-3" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-gradient d-flex align-items-center gap-2"
          disabled={loading}
        >
          <FiSend size={16} />
          {loading ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
