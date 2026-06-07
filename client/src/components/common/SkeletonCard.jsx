import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="custom-card-static" style={{ overflow: 'hidden' }}>
      {/* Image skeleton */}
      <div className="skeleton" style={{ height: 220, borderRadius: 0 }} />
      
      {/* Body */}
      <div style={{ padding: 16 }}>
        {/* Brand */}
        <div className="skeleton" style={{ height: 10, width: '30%', marginBottom: 10 }} />
        
        {/* Title */}
        <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
        
        {/* Stars */}
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 12 }} />
        
        {/* Price */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="skeleton" style={{ height: 20, width: '25%' }} />
          <div className="skeleton" style={{ height: 14, width: '20%' }} />
          <div className="skeleton" style={{ height: 14, width: '15%' }} />
        </div>
      </div>

      {/* Button */}
      <div style={{ padding: '0 16px 16px' }}>
        <div className="skeleton" style={{ height: 40, width: '100%' }} />
      </div>
    </div>
  );
};

export default SkeletonCard;
