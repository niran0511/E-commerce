import React from 'react';
import BreadcrumbNav from '../../components/common/Breadcrumb';

export default function ShippingInfo() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <div className="container py-5" style={{ maxWidth: 800 }}>
        <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'Shipping Information' }]} />
        <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Shipping Information</h1>
        
        <div className="custom-card p-4 p-md-5 mb-5" style={{ borderRadius: 16 }}>
          <h4 className="fw-bold mb-3">1. Free Shipping</h4>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            We provide Free Standard Shipping on all orders over ₹500 across India. For orders below ₹500, a nominal flat-rate shipping fee of ₹40 applies.
          </p>

          <h4 className="fw-bold mb-3">2. Processing Time</h4>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped, complete with tracking details.
          </p>

          <h4 className="fw-bold mb-3">3. Estimated Delivery Times</h4>
          <ul className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Express Shipping (Metro Cities):</strong> 1-2 business days</li>
            <li><strong>Remote Locations:</strong> Up to 7 business days</li>
          </ul>

          <h4 className="fw-bold mb-3">4. Order Tracking</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 24 hours for the tracking information to become available.
          </p>
        </div>
      </div>
    </div>
  );
}
