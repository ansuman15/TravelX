'use client';

import { ReactNode } from 'react';

// ============================================
// TABLE COMPONENT
// ============================================
interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
    width?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    keyExtractor: (row: T) => string;
}

export function Table<T>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available',
    onRowClick,
    keyExtractor,
}: TableProps<T>) {
    if (loading) {
        return (
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} style={{ width: column.width }}>
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i}>
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        <div className="skeleton" style={{ height: '20px', width: '80%' }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} style={{ width: column.width }}>
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                </table>
                <div className="table-empty">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} style={{ width: column.width }}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr
                            key={keyExtractor(row)}
                            onClick={() => onRowClick?.(row)}
                            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                        >
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {column.render
                                        ? column.render(row)
                                        : String((row as Record<string, unknown>)[column.key] ?? '-')
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============================================
// PAGINATION COMPONENT
// ============================================
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (showEllipsisStart) {
                pages.push('...');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (showEllipsisEnd) {
                pages.push('...');
            }

            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                className="btn btn-ghost btn-sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-ghost'
                            }`}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        disabled={typeof page !== 'number'}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                className="btn btn-ghost btn-sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
}
