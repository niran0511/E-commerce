import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import StarRating from '../common/StarRating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product, style = {} }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const {
    _id,
    name = 'Product',
    price = 0,
    mrp = 0,
    images = [],
    image = '',
    rating = 0,
    numReviews = 0,
    brand = '',
    stock = 0,
    discount = 0
  } = product;

  const productImage = images?.[0] || image || `https://picsum.photos/seed/${_id || 'product'}/400/400`;
  const discountPercent = discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const inWishlist = isInWishlist(_id);
  const inStock = stock > 0 || stock === undefined;

  const handleClick = () => {
    navigate(`/products/${_id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(_id, 1);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate('/checkout', { state: { buyNowItem: { product, quantity: 1 } } });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(_id);
  };

  return (
    <div className="product-card fade-in" style={style} onClick={handleClick}>
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="discount-badge">-{discountPercent}%</span>
      )}

      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <button
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{ 
            width: 32, height: 32, borderRadius: 8, 
            background: inWishlist ? 'var(--primary)' : 'white', 
            color: inWishlist ? 'white' : 'var(--primary)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          {inWishlist ? <FaHeart size={14} /> : <FiHeart size={14} />}
        </button>
      </div>

      {/* Product Image */}
      <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '24px', position: 'relative' }}>
        <img
          src={productImage}
          alt={name}
          style={{ width: '100%', height: '160px', objectFit: 'contain', mixBlendMode: 'multiply' }}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${_id || Math.random()}/400/400`;
          }}
        />
      </div>

      {/* Product Body */}
      <div className="pt-3 px-2">
        <h6 style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h6>

        {/* Rating */}
        <div className="mb-2">
          <StarRating rating={rating} count={numReviews} size={13} />
        </div>

        {/* Price */}
        <div className="d-flex align-items-baseline flex-wrap gap-1">
          <span className="price-current">₹{price?.toLocaleString('en-IN')}</span>
          {mrp > price && (
            <>
              <span className="price-mrp">₹{mrp?.toLocaleString('en-IN')}</span>
              <span className="price-discount">{discountPercent}% off</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="product-actions d-flex gap-2 mt-2">
        <button
          className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          onClick={handleAddToCart}
          disabled={!inStock}
          title="Add to Cart"
          style={{ 
            background: 'var(--bg-secondary)', 
            color: 'var(--text-primary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 8, 
            opacity: inStock ? 1 : 0.6, 
            fontSize: '0.85rem', 
            padding: '8px',
            transition: 'background 0.2s'
          }}
        >
          <FiShoppingCart size={15} />
        </button>
        <button
          className="btn flex-grow-1 d-flex align-items-center justify-content-center"
          onClick={handleBuyNow}
          disabled={!inStock}
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: 8, 
            opacity: inStock ? 1 : 0.6, 
            fontSize: '0.85rem', 
            padding: '8px',
            fontWeight: 600,
            transition: 'background 0.2s'
          }}
        >
          Buy Now
        </button>
      </div>
      <style jsx="true">{`
        .product-card {
          cursor: pointer;
          background: white;
          border-radius: 24px;
          padding: 8px;
          transition: transform 0.2s;
          position: relative;
        }
        .product-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
