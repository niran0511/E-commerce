import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({
  rating = 0,
  count = null,
  size = 16,
  interactive = false,
  onRate = null,
  showValue = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  const renderStar = (index) => {
    const activeRating = interactive ? (hoverRating || rating) : rating;
    const filled = index <= Math.floor(activeRating);
    const half = !filled && index === Math.ceil(activeRating) && activeRating % 1 >= 0.25;

    const StarComponent = filled ? FaStar : half ? FaStarHalfAlt : FaRegStar;
    const className = filled || half ? 'star-filled' : 'star-empty';

    return (
      <span
        key={index}
        className={`star ${className}`}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          transform: interactive && hoverRating === index ? 'scale(1.3)' : 'scale(1)',
          display: 'inline-flex'
        }}
        onClick={() => handleClick(index)}
        onMouseEnter={() => interactive && setHoverRating(index)}
        onMouseLeave={() => interactive && setHoverRating(0)}
      >
        <StarComponent size={size} />
      </span>
    );
  };

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''} d-inline-flex align-items-center gap-1`}>
      <div className="d-flex gap-0" style={{ gap: '1px' }}>
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {showValue && rating > 0 && (
        <span style={{ fontSize: size * 0.75, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span style={{ fontSize: size * 0.7, color: 'var(--text-muted)', marginLeft: 2 }}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
