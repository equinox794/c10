import React from 'react';

const Table = ({ children, className = '', ...props }) => (
  <table className={`w-full text-sm ${className}`} {...props}>
    {children}
  </table>
);

const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`bg-slate-800 ${className}`} {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`border-b border-slate-700 ${className}`} {...props}>
    {children}
  </tr>
);

const TableHead = ({ children, className = '', ...props }) => (
  <th className={`px-4 py-3 text-left font-medium ${className}`} {...props}>
    {children}
  </th>
);

const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-4 py-3 ${className}`} {...props}>
    {children}
  </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }; 