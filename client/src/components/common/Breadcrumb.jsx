import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb as BSBreadcrumb } from 'react-bootstrap';
import { FiHome } from 'react-icons/fi';

const Breadcrumb = ({ items = [] }) => {
  return (
    <BSBreadcrumb className="mb-4">
      <BSBreadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
        <FiHome size={14} className="me-1" style={{ marginTop: -2 }} />
        Home
      </BSBreadcrumb.Item>
      {items.map((item, index) => (
        <BSBreadcrumb.Item
          key={index}
          active={index === items.length - 1}
          linkAs={index < items.length - 1 ? Link : undefined}
          linkProps={index < items.length - 1 ? { to: item.path } : undefined}
        >
          {item.label}
        </BSBreadcrumb.Item>
      ))}
    </BSBreadcrumb>
  );
};

export default Breadcrumb;
