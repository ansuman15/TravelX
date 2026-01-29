'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
    Users,
    Briefcase,
    FileText,
    BookOpen,
    MessageCircle,
    Mail,
    Phone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getNotificationsWithFallback, globalSearch, markAllNotificationsAsRead } from '@/lib/actions/notifications';

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

    // New state for notifications, search, help
    const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; read: boolean; created_at: string }>>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; subtitle: string; type: string; href: string }>>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications on mount
    useEffect(() => {
        async function fetchNotifications() {
            try {
                const result = await getNotificationsWithFallback(8);
                setNotifications(result.data);
                setUnreadCount(result.unreadCount);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        }
        fetchNotifications();
    }, []);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const result = await globalSearch(searchQuery);
                setSearchResults(result.results);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close logout modal on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowLogoutConfirm(false);
                setShowHelpModal(false);
            }
        };

        if (showLogoutConfirm || showHelpModal) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [showLogoutConfirm, showHelpModal]);

    const userInitials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    // Format relative time
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

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
                {/* Search with results dropdown */}
                <div className="topbar-search" ref={searchRef} style={{ position: 'relative' }}>
                    <Search className="topbar-search-icon" size={18} />
                    <input
                        type="text"
                        className="topbar-search-input"
                        placeholder="Search customers, bookings, leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    />
                    {searchLoading && (
                        <Loader2 size={16} className="topbar-search-loading" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />
                    )}

                    {showSearchResults && searchResults.length > 0 && (
                        <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                            {searchResults.map((result) => (
                                <Link
                                    key={result.id}
                                    href={result.href}
                                    className="dropdown-item"
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px' }}
                                    onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: result.type === 'customer' ? '#dbeafe' : result.type === 'booking' ? '#dcfce7' : result.type === 'lead' ? '#fef3c7' : '#f3e8ff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {result.type === 'customer' && <Users size={16} style={{ color: '#3b82f6' }} />}
                                        {result.type === 'booking' && <Briefcase size={16} style={{ color: '#22c55e' }} />}
                                        {result.type === 'lead' && <FileText size={16} style={{ color: '#f59e0b' }} />}
                                        {result.type === 'package' && <BookOpen size={16} style={{ color: '#a855f7' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{result.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{result.subtitle}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                        <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>No results found for &quot;{searchQuery}&quot;</div>
                        </div>
                    )}
                </div>

                {/* Help Button */}
                <button
                    className="topbar-icon-btn"
                    title="Help"
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                >
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
                        {unreadCount > 0 && <span className="notification-dot" />}
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu notification-dropdown">
                            <div className="dropdown-header">
                                <span className="font-semibold">Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                                <button
                                    className="btn-text"
                                    type="button"
                                    onClick={async () => {
                                        await markAllNotificationsAsRead();
                                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                        setUnreadCount(0);
                                    }}
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="dropdown-body">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            title={notification.title}
                                            message={notification.message || ''}
                                            time={formatTimeAgo(notification.created_at)}
                                            unread={!notification.read}
                                        />
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        No notifications
                                    </div>
                                )}
                            </div>
                            <div className="dropdown-footer">
                                <Link href="/agency/messages" className="btn-text" onClick={() => setShowNotifications(false)}>
                                    View all notifications
                                </Link>
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

            {/* Help Modal */}
            {showHelpModal && (
                <div className="logout-modal-overlay" onClick={() => setShowHelpModal(false)}>
                    <div className="logout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Help & Support</h2>
                            <button onClick={() => setShowHelpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={20} style={{ color: '#3b82f6' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>Documentation</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Learn how to use TravelX</div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageCircle size={20} style={{ color: '#22c55e' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>Live Chat</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Chat with our support team</div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={20} style={{ color: '#f59e0b' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>Email Support</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>support@travelx.com</div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={20} style={{ color: '#a855f7' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>Phone Support</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>+91 98765 43210</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '12px', color: 'white' }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Need personalized help?</div>
                            <div style={{ fontSize: '13px', opacity: 0.9 }}>Schedule a call with our experts</div>
                        </div>
                    </div>
                </div>
            )}
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
