import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - maxVisible + 1, 2);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <BSPagination className="mb-0">
        <BSPagination.Prev
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <BSPagination.Ellipsis key={`ellipsis-${index}`} disabled />
          ) : (
            <BSPagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </BSPagination.Item>
          )
        )}
        <BSPagination.Next
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </BSPagination>
    </div>
  );
};

export default Pagination;
