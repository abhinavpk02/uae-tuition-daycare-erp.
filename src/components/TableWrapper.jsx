import React from 'react';

/**
 * Standardized TableWrapper Component
 * Enforces responsive horizontal scrolling for mobile devices with clean border and shadow styling.
 * 
 * Usage:
 * <TableWrapper>
 *   <table className="w-full border-collapse custom-table">
 *     ...
 *   </table>
 * </TableWrapper>
 */
export default function TableWrapper({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm table-responsive-wrapper ${className}`}>
      {children}
    </div>
  );
}
