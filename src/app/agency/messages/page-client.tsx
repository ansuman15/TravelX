'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Briefcase,
    CreditCard,
    CheckSquare,
    Settings,
    MessageSquare,
    Circle,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification as deleteNotificationAction
} from '@/lib/actions/notifications';

interface Notification {
    id: string;
    type: 'booking' | 'payment' | 'task' | 'system' | 'message';
    title: string;
    message: string | null;
    time: string;
    read: boolean;
    data?: Record<string, unknown>;
}

interface MessagesPageClientProps {
    notifications: Notification[];
    currentUser: string;
}

export function MessagesPageClient({ notifications: initialNotifications, currentUser }: MessagesPageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [notifications, setNotifications] = useState(initialNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [error, setError] = useState('');

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' ? true : !n.read
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        setError('');
        startTransition(async () => {
            const result = await markNotificationAsRead(id);
            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const markAllAsRead = async () => {
        setError('');
        startTransition(async () => {
            const result = await markAllNotificationsAsRead();
            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const deleteNotification = async (id: string) => {
        setError('');
        startTransition(async () => {
            const result = await deleteNotificationAction(id);
            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Briefcase size={18} />;
            case 'payment': return <CreditCard size={18} />;
            case 'task': return <CheckSquare size={18} />;
            case 'system': return <Settings size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'booking': return 'primary';
            case 'payment': return 'success';
            case 'task': return 'warning';
            case 'system': return 'gray';
            default: return 'gray';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-secondary text-sm">Stay updated with your agency activities</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" onClick={markAllAsRead}>
                        <CheckCheck size={18} />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon">
                                <Bell size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{notifications.length}</div>
                                <div className="text-sm text-secondary">Total</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon warning">
                                <Circle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{unreadCount}</div>
                                <div className="text-sm text-secondary">Unread</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon success">
                                <Check size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{notifications.length - unreadCount}</div>
                                <div className="text-sm text-secondary">Read</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs mb-4">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={filter === 'unread' ? 'active' : ''}
                    onClick={() => setFilter('unread')}
                >
                    Unread
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>No notifications</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? '' : 'unread'}`}
                        >
                            <div className={`notification-icon ${getTypeColor(notification.type)}`}>
                                {getTypeIcon(notification.type)}
                            </div>

                            <div className="notification-content">
                                <div className="notification-header">
                                    <span className="notification-title">{notification.title}</span>
                                    <span className="notification-time">{formatTime(notification.time)}</span>
                                </div>
                                <p className="notification-message">{notification.message}</p>
                            </div>

                            <div className="notification-actions">
                                {!notification.read && (
                                    <button
                                        title="Mark as read"
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                                <button
                                    title="Delete"
                                    onClick={() => deleteNotification(notification.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon.warning {
                    background: var(--warning-50);
                    color: var(--warning-600);
                }
                .stat-icon.success {
                    background: var(--success-50);
                    color: var(--success-600);
                }
                .filter-tabs {
                    display: flex;
                    gap: var(--spacing-2);
                    background: var(--bg-secondary);
                    padding: 4px;
                    border-radius: var(--radius-lg);
                    width: fit-content;
                }
                .filter-tabs button {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-2) var(--spacing-4);
                    border: none;
                    background: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 14px;
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                .filter-tabs button:hover {
                    color: var(--text-primary);
                }
                .filter-tabs button.active {
                    background: white;
                    color: var(--text-primary);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .filter-tabs .badge {
                    background: var(--error-500);
                    color: white;
                    font-size: 11px;
                    padding: 2px 6px;
                    border-radius: 10px;
                }
                .notifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }
                .notification-item {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-3);
                    padding: var(--spacing-4);
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    transition: all 0.2s ease;
                }
                .notification-item:hover {
                    border-color: var(--primary-200);
                }
                .notification-item.unread {
                    background: var(--primary-50);
                    border-color: var(--primary-200);
                }
                .notification-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .notification-icon.primary {
                    background: var(--primary-100);
                    color: var(--primary-600);
                }
                .notification-icon.success {
                    background: var(--success-100);
                    color: var(--success-600);
                }
                .notification-icon.warning {
                    background: var(--warning-100);
                    color: var(--warning-600);
                }
                .notification-icon.gray {
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                }
                .notification-content {
                    flex: 1;
                    min-width: 0;
                }
                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .notification-title {
                    font-weight: 600;
                    font-size: 14px;
                }
                .notification-time {
                    font-size: 12px;
                    color: var(--text-tertiary);
                }
                .notification-message {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 0;
                }
                .notification-actions {
                    display: flex;
                    gap: var(--spacing-1);
                }
                .notification-actions button {
                    padding: 6px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: var(--text-tertiary);
                    border-radius: var(--radius-md);
                    transition: all 0.2s ease;
                }
                .notification-actions button:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-8);
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    color: var(--text-tertiary);
                    gap: var(--spacing-3);
                }
            `}</style>
        </div>
    );
}
