import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin, FiClock, FiShoppingBag, FiSend, FiCreditCard, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing! 🎉');
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <Container>
        {/* Newsletter Section */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h3 className="text-white mb-2" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              Stay Updated with Latest Deals
            </h3>
            <p className="mb-4" style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Subscribe to our newsletter and get exclusive offers, new arrivals, and AI-powered recommendations directly in your inbox.
            </p>
            <form onSubmit={handleNewsletter} className="d-flex gap-2 justify-content-center flex-wrap">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ maxWidth: 360 }}
              />
              <button type="submit" className="btn-gradient d-flex align-items-center gap-2">
                <FiSend /> Subscribe
              </button>
            </form>
          </Col>
        </Row>

        <hr style={{ borderColor: 'rgba(255,255,255,0.08)', marginBottom: '40px' }} />

        {/* Main Footer Content */}
        <Row className="g-4 mb-4">
          {/* Brand */}
          <Col lg={3} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.1rem'
              }}>
                <FiShoppingBag />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.3rem',
                color: 'white'
              }}>
                ShopSmart AI
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '20px' }}>
              Your AI-powered shopping companion. Discover products tailored just for you with intelligent recommendations and seamless shopping.
            </p>
            <div className="d-flex gap-1">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="YouTube">
                <FiYoutube />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} sm={6}>
            <h5>Quick Links</h5>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/products" className="footer-link">Products</Link>
            <Link to="/products?category=Electronics" className="footer-link">Electronics</Link>
            <Link to="/products?category=Fashion" className="footer-link">Fashion</Link>
            <Link to="/products?sort=createdAt" className="footer-link">New Arrivals</Link>
          </Col>

          {/* Customer Service */}
          <Col lg={3} md={6} sm={6}>
            <h5>Customer Service</h5>
            <Link to="/products" className="footer-link">FAQ</Link>
            <Link to="/return-policy" className="footer-link">Returns & Refunds</Link>
            <Link to="/shipping-info" className="footer-link">Shipping Info</Link>
            <Link to="/orders" className="footer-link">Track Order</Link>
            <Link to="/contact" className="footer-link">Contact Support</Link>
          </Col>

          {/* Contact Info */}
          <Col lg={4} md={6}>
            <h5>Contact Us</h5>
            <div className="d-flex align-items-start gap-3 mb-3">
              <FiMapPin style={{ color: 'var(--primary-light)', marginTop: 4, flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                123 Tech Park, Koramangala, Bangalore, Karnataka 560034
              </span>
            </div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <FiPhone style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>+91 98765 43210</span>
            </div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <FiMail style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>support@shopsmartai.com</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <FiClock style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Mon-Sat: 9AM - 8PM IST</span>
            </div>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div className="footer-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <p className="mb-0" style={{ color: '#64748b', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} ShopSmart AI. All rights reserved.
          </p>
          <div className="d-flex align-items-center gap-3">
            <FiCreditCard className="payment-icon" title="Credit Card" />
            <FiShield className="payment-icon" title="Secure Payment" />
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Secure Payments • 256-bit SSL
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
