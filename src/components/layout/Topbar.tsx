'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search,
    Bell,
    ChevronDown,
    Settings,
    LogOut,
    User,
    HelpCircle,
    Loader2,
    X,
    Menu,
    AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TopbarProps {
    title: string;
    subtitle?: string;
    user?: {
        name: string;
        role: string;
        avatar?: string;
        email?: string;
    };
    agencyName?: string;
    onMenuToggle?: () => void;
}

export function Topbar({ title, subtitle, user, agencyName, onMenuToggle }: TopbarProps) {
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
    const [confirmText, setConfirmText] = useState('');

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close logout modal on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowLogoutConfirm(false);
            }
        };

        if (showLogoutConfirm) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [showLogoutConfirm]);

    const userInitials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    // Determine if this is admin or agency context
    const isAdmin = user?.role === 'super_admin';
    const basePath = isAdmin ? '/admin' : '/agency';

    const handleLogoutClick = () => {
        setShowProfileMenu(false);
        setConfirmStep(1);
        setConfirmText('');
        setShowLogoutConfirm(true);
    };

    const handleLogoutProceed = () => {
        setConfirmStep(2);
    };

    const handleLogoutConfirm = async () => {
        if (confirmText.toLowerCase() !== 'logout') return;

        setLoggingOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            setLoggingOut(false);
            setShowLogoutConfirm(false);
            setConfirmStep(1);
            setConfirmText('');
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
        setConfirmStep(1);
        setConfirmText('');
    };

    const handleProfileClick = () => {
        setShowNotifications(false);
        setShowProfileMenu(!showProfileMenu);
    };

    const handleNotificationClick = () => {
        setShowProfileMenu(false);
        setShowNotifications(!showNotifications);
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                {/* Mobile menu button */}
                {onMenuToggle && (
                    <button
                        className="mobile-menu-btn show-mobile"
                        onClick={onMenuToggle}
                        type="button"
                        aria-label="Toggle menu"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <div>
                    <h1 className="topbar-title">{title}</h1>
                    {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
                </div>
            </div>

            <div className="topbar-right">
                {/* Search */}
                <div className="topbar-search">
                    <Search className="topbar-search-icon" size={18} />
                    <input
                        type="text"
                        className="topbar-search-input"
                        placeholder="Search anything..."
                    />
                </div>

                {/* Help */}
                <button className="topbar-icon-btn" title="Help" type="button">
                    <HelpCircle size={20} />
                </button>

                {/* Notifications */}
                <div className="dropdown" ref={notificationRef}>
                    <button
                        className="topbar-icon-btn"
                        onClick={handleNotificationClick}
                        type="button"
                    >
                        <Bell size={20} />
                        <span className="notification-dot" />
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu notification-dropdown">
                            <div className="dropdown-header">
                                <span className="font-semibold">Notifications</span>
                                <button className="btn-text" type="button">Mark all read</button>
                            </div>
                            <div className="dropdown-body">
                                <NotificationItem
                                    title="New Booking"
                                    message="John Doe confirmed booking for Bali trip"
                                    time="5 min ago"
                                    unread
                                />
                                <NotificationItem
                                    title="Payment Received"
                                    message="₹50,000 received for booking #1234"
                                    time="1 hour ago"
                                    unread
                                />
                                <NotificationItem
                                    title="Task Due"
                                    message="Visa application for Sarah pending"
                                    time="2 hours ago"
                                />
                            </div>
                            <div className="dropdown-footer">
                                <button className="btn-text" type="button">View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="dropdown" ref={profileRef}>
                    <button
                        className="topbar-profile"
                        onClick={handleProfileClick}
                        type="button"
                    >
                        <div className="topbar-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                userInitials
                            )}
                        </div>
                        <div className="topbar-user-info">
                            <span className="topbar-user-name">{user?.name || 'User'}</span>
                            <span className="topbar-user-role">
                                {agencyName || user?.role || 'Agency'}
                            </span>
                        </div>
                        <ChevronDown size={16} className="chevron-icon" />
                    </button>

                    {showProfileMenu && (
                        <div className="dropdown-menu profile-dropdown">
                            <Link
                                href={`${basePath}/profile`}
                                className="dropdown-item"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <User size={16} />
                                <span>My Profile</span>
                            </Link>
                            <Link
                                href={`${basePath}/settings`}
                                className="dropdown-item"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <Settings size={16} />
                                <span>Settings</span>
                            </Link>
                            <div className="dropdown-divider" />
                            <button
                                className="dropdown-item danger"
                                onClick={handleLogoutClick}
                                type="button"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal - Double Confirmation */}
            {showLogoutConfirm && (
                <div className="logout-modal-overlay" onClick={handleLogoutCancel}>
                    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Step Indicator */}
                        <div className="logout-step-indicator">
                            <div className={`step-dot ${confirmStep >= 1 ? 'active' : ''}`} />
                            <div className="step-line" />
                            <div className={`step-dot ${confirmStep >= 2 ? 'active' : ''}`} />
                        </div>

                        {confirmStep === 1 ? (
                            <>
                                {/* Step 1: Initial Warning */}
                                <div className="logout-modal-icon warning">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3>Are you sure?</h3>
                                <p>You are about to sign out of your account. You will need to login again to access your dashboard.</p>
                                <div className="logout-modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleLogoutCancel}
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-warning"
                                        onClick={handleLogoutProceed}
                                        type="button"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Step 2: Final Confirmation with Type-to-Confirm */}
                                <div className="logout-modal-icon danger">
                                    <LogOut size={32} />
                                </div>
                                <h3>Final Confirmation</h3>
                                <p>To confirm logout, please type <strong>LOGOUT</strong> below:</p>
                                <div className="confirm-input-wrapper">
                                    <input
                                        type="text"
                                        className="confirm-input"
                                        placeholder="Type LOGOUT to confirm"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        autoFocus
                                        disabled={loggingOut}
                                    />
                                    {confirmText.toLowerCase() === 'logout' && (
                                        <span className="confirm-check">✓</span>
                                    )}
                                </div>
                                <div className="logout-modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleLogoutCancel}
                                        disabled={loggingOut}
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleLogoutConfirm}
                                        disabled={loggingOut || confirmText.toLowerCase() !== 'logout'}
                                        type="button"
                                    >
                                        {loggingOut ? (
                                            <>
                                                <Loader2 size={16} className="spin" />
                                                Signing out...
                                            </>
                                        ) : (
                                            'Yes, Sign Out'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                    background: white;
                    border-bottom: 1px solid var(--border-light);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .topbar-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }
                .topbar-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .topbar-search {
                    position: relative;
                    display: none;
                }
                @media (min-width: 768px) {
                    .topbar-search {
                        display: block;
                    }
                }
                .topbar-search-input {
                    width: 240px;
                    padding: 8px 12px 8px 36px;
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    font-size: 14px;
                    background: var(--bg-secondary);
                    transition: all 0.2s ease;
                }
                .topbar-search-input:focus {
                    outline: none;
                    border-color: var(--primary-500);
                    background: white;
                    box-shadow: 0 0 0 3px var(--primary-100);
                }
                .topbar-icon-btn {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                .topbar-icon-btn:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .notification-dot {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 8px;
                    height: 8px;
                    background: var(--error-500);
                    border-radius: 50%;
                    border: 2px solid white;
                }
                .dropdown {
                    position: relative;
                }
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    min-width: 200px;
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
                    z-index: 1000;
                    overflow: hidden;
                    animation: dropdownFadeIn 0.15s ease;
                }
                @keyframes dropdownFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .notification-dropdown {
                    width: 340px;
                }
                .profile-dropdown {
                    min-width: 180px;
                }
                .dropdown-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-light);
                }
                .dropdown-body {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .dropdown-footer {
                    padding: 8px 16px;
                    border-top: 1px solid var(--border-light);
                    text-align: center;
                }
                .btn-text {
                    background: none;
                    border: none;
                    color: var(--primary-600);
                    font-size: 13px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s ease;
                }
                .btn-text:hover {
                    background: var(--primary-50);
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    color: var(--text-primary);
                    text-decoration: none;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                }
                .dropdown-item:hover {
                    background: var(--bg-secondary);
                }
                .dropdown-item.danger {
                    color: var(--error-600);
                }
                .dropdown-item.danger:hover {
                    background: var(--error-50);
                }
                .dropdown-divider {
                    height: 1px;
                    background: var(--border-light);
                    margin: 4px 0;
                }
                .topbar-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 12px 6px 6px;
                    border: 1px solid var(--border-light);
                    border-radius: 40px;
                    cursor: pointer;
                    background: white;
                    transition: all 0.2s ease;
                }
                .topbar-profile:hover {
                    border-color: var(--primary-200);
                    background: var(--bg-secondary);
                }
                .topbar-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 600;
                }
                .topbar-avatar img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .topbar-user-info {
                    display: flex;
                    flex-direction: column;
                }
                .topbar-user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                    line-height: 1.3;
                }
                .topbar-user-role {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    text-transform: capitalize;
                }
                .chevron-icon {
                    color: var(--text-tertiary);
                    transition: transform 0.2s ease;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .logout-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .logout-modal {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.2s ease;
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .logout-modal-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--warning-100);
                    color: var(--warning-600);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                .logout-modal h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 8px;
                }
                .logout-modal p {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin: 0 0 24px;
                    line-height: 1.5;
                }
                .logout-modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .logout-modal-actions .btn {
                    flex: 1;
                    max-width: 140px;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                .logout-modal-actions .btn-secondary {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .logout-modal-actions .btn-secondary:hover {
                    background: var(--border-light);
                }
                .logout-modal-actions .btn-danger {
                    background: var(--error-500);
                    color: white;
                }
                .logout-modal-actions .btn-danger:hover {
                    background: var(--error-600);
                }
                .logout-modal-actions .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .logout-modal-actions .btn-warning {
                    background: var(--warning-500, #f59e0b);
                    color: white;
                }
                .logout-modal-actions .btn-warning:hover {
                    background: var(--warning-600, #d97706);
                }
                .logout-step-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .step-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--border-light);
                    transition: all 0.3s ease;
                }
                .step-dot.active {
                    background: var(--primary-500);
                    box-shadow: 0 0 0 4px var(--primary-100);
                }
                .step-line {
                    width: 40px;
                    height: 2px;
                    background: var(--border-light);
                }
                .logout-modal-icon.warning {
                    background: var(--warning-100, #fef3c7);
                    color: var(--warning-600, #d97706);
                }
                .logout-modal-icon.danger {
                    background: var(--error-100, #fee2e2);
                    color: var(--error-600, #dc2626);
                }
                .confirm-input-wrapper {
                    position: relative;
                    margin-bottom: 24px;
                }
                .confirm-input {
                    width: 100%;
                    padding: 12px 40px 12px 16px;
                    border: 2px solid var(--border-light);
                    border-radius: 8px;
                    font-size: 14px;
                    text-align: center;
                    letter-spacing: 1px;
                    transition: all 0.2s ease;
                }
                .confirm-input:focus {
                    outline: none;
                    border-color: var(--primary-500);
                    box-shadow: 0 0 0 3px var(--primary-100);
                }
                .confirm-input:disabled {
                    background: var(--bg-secondary);
                    cursor: not-allowed;
                }
                .confirm-check {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--success-500, #22c55e);
                    font-size: 18px;
                    font-weight: bold;
                    animation: checkPop 0.2s ease;
                }
                @keyframes checkPop {
                    from { transform: translateY(-50%) scale(0); }
                    to { transform: translateY(-50%) scale(1); }
                }
            `}</style>
        </header>
    );
}

// Notification Item Component
interface NotificationItemProps {
    title: string;
    message: string;
    time: string;
    unread?: boolean;
}

function NotificationItem({ title, message, time, unread }: NotificationItemProps) {
    return (
        <div className={`notification-item ${unread ? 'unread' : ''}`}>
            <div className="notification-header">
                <span className="notification-title">{title}</span>
                <span className="notification-time">{time}</span>
            </div>
            <p className="notification-message">{message}</p>

            <style jsx>{`
                .notification-item {
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    border-bottom: 1px solid var(--border-light);
                }
                .notification-item:last-child {
                    border-bottom: none;
                }
                .notification-item:hover {
                    background: var(--bg-secondary);
                }
                .notification-item.unread {
                    background: var(--primary-50);
                }
                .notification-item.unread:hover {
                    background: var(--primary-100);
                }
                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .notification-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .notification-time {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }
                .notification-message {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}
