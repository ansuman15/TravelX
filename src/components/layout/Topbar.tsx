'use client';

import { useState } from 'react';
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
}

export function Topbar({ title, subtitle, user, agencyName }: TopbarProps) {
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const userInitials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    // Determine if this is admin or agency context
    const isAdmin = user?.role === 'super_admin';
    const basePath = isAdmin ? '/admin' : '/agency';

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            setLoggingOut(false);
        }
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
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
                <button className="topbar-icon-btn" title="Help">
                    <HelpCircle size={20} />
                </button>

                {/* Notifications */}
                <div className="dropdown">
                    <button
                        className="topbar-icon-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        <span className="notification-dot" />
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu" style={{ width: '320px', right: 0 }}>
                            <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--border-light)' }}>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Notifications</span>
                                    <button className="btn btn-ghost btn-sm">Mark all read</button>
                                </div>
                            </div>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
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
                            <div style={{ padding: 'var(--spacing-3)', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
                                <button className="btn btn-ghost btn-sm">View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="dropdown">
                    <div
                        className="topbar-profile"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
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
                        <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
                    </div>

                    {showProfileMenu && (
                        <div className="dropdown-menu" style={{ right: 0 }}>
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
                                onClick={handleLogout}
                                disabled={loggingOut}
                                style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                {loggingOut ? (
                                    <>
                                        <Loader2 size={16} className="spin" />
                                        <span>Logging out...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
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
        <div
            className="dropdown-item"
            style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                background: unread ? 'var(--primary-50)' : 'transparent',
                padding: 'var(--spacing-3) var(--spacing-4)',
            }}
        >
            <div className="flex justify-between items-center" style={{ width: '100%' }}>
                <span className="font-semibold text-sm">{title}</span>
                <span className="text-xs text-tertiary">{time}</span>
            </div>
            <span className="text-sm text-secondary">{message}</span>
        </div>
    );
}
