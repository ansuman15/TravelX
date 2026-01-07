'use client';

import { ReactNode, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    footer?: ReactNode;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    footer,
}: ModalProps) {
    if (!isOpen) return null;

    const sizeClass = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}

// ============================================
// CONFIRM DIALOG
// ============================================
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    loading = false,
}: ConfirmDialogProps) {
    const buttonClass = variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn-warning' : 'btn-primary';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${buttonClass}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : confirmText}
                    </button>
                </>
            }
        >
            <p className="text-secondary">{message}</p>
        </Modal>
    );
}
