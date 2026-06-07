import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmModal = ({
  show = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Body className="text-center p-4">
        <div
          className="mx-auto mb-3"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: variant === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FiAlertTriangle
            size={28}
            style={{ color: variant === 'danger' ? 'var(--danger)' : 'var(--primary)' }}
          />
        </div>
        <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 8 }}>
          {title}
        </h5>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
          {message}
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Button
            variant="light"
            onClick={onCancel}
            disabled={loading}
            style={{
              borderRadius: 'var(--radius-md)',
              padding: '8px 24px',
              fontWeight: 500,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
            style={{
              borderRadius: 'var(--radius-md)',
              padding: '8px 24px',
              fontWeight: 500
            }}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
