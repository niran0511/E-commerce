import React, { useState } from 'react';

const ProductGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const imageList = images.length > 0
    ? images
    : ['https://picsum.photos/seed/product/500/500'];

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div>
      {/* Main Image */}
      <div
        className="custom-card-static mb-3"
        style={{
          overflow: 'hidden',
          cursor: isZoomed ? 'zoom-out' : 'zoom-in',
          position: 'relative'
        }}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <div
          style={{
            height: 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            overflow: 'hidden'
          }}
        >
          <img
            src={imageList[activeIndex]}
            alt={`Product ${activeIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              padding: 24,
              transition: 'transform 0.3s ease',
              transform: isZoomed ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://picsum.photos/seed/noimgmain/500/500';
            }}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="d-flex gap-2 overflow-auto pb-1">
          {imageList.map((img, index) => (
            <div
              key={index}
              onClick={() => { setActiveIndex(index); setIsZoomed(false); }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${index === activeIndex ? 'var(--primary)' : 'var(--border-color)'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: index === activeIndex ? 'scale(1.05)' : 'scale(1)',
                boxShadow: index === activeIndex ? 'var(--shadow-primary)' : 'none'
              }}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  padding: 4
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://picsum.photos/seed/noimg/100/100';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
