import React from 'react';
import BreadcrumbNav from '../../components/common/Breadcrumb';

export default function ReturnPolicy() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <div className="container py-5" style={{ maxWidth: 800 }}>
        <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'Return & Refund Policy' }]} />
        <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Return & Refund Policy</h1>
        
        <div className="custom-card p-4 p-md-5 mb-5" style={{ borderRadius: 16 }}>
          <h4 className="fw-bold mb-3">1. Return Window</h4>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            We offer a generous 30-day return window for most products. If you are not completely satisfied with your purchase, you may return the item within 30 days of delivery for a full refund or exchange. Electronics have a specific 7-day replacement guarantee in case of defects.
          </p>

          <h4 className="fw-bold mb-3">2. Eligibility Conditions</h4>
          <ul className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li>Items must be unused and in the same condition that you received them.</li>
            <li>Items must be in the original packaging with all tags intact.</li>
            <li>A valid receipt or proof of purchase is required.</li>
          </ul>

          <h4 className="fw-bold mb-3">3. Refund Process</h4>
          <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within 5-7 business days.
          </p>

          <h4 className="fw-bold mb-3">4. Non-Returnable Items</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Certain types of goods are exempt from being returned, including perishable goods, intimate or sanitary goods, hazardous materials, and downloadable software products.
          </p>
        </div>
      </div>
    </div>
  );
}
