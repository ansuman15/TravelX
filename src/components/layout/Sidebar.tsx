'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    Calendar,
    CreditCard,
    FileText,
    Truck,
    CheckSquare,
    BarChart3,
    UserCog,
    Settings,
    ChevronLeft,
    ChevronRight,
    MapPin,
    UserPlus,
    MessageSquare,
    Briefcase,
    LucideIcon,
    LogOut,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Define nav item type
interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
}

interface NavSection {
    section: string;
    items: NavItem[];
}

// Navigation items for Agency Dashboard
const agencyNavItems: NavSection[] = [
    {
        section: 'Main',
        items: [
            { href: '/agency', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/agency/leads', label: 'Leads & Enquiries', icon: UserPlus },
            { href: '/agency/customers', label: 'Customers', icon: Users },
        ],
    },
    {
        section: 'Operations',
        items: [
            { href: '/agency/packages', label: 'Packages', icon: Package },
            { href: '/agency/itineraries', label: 'Itineraries', icon: MapPin },
            { href: '/agency/bookings', label: 'Bookings', icon: Briefcase },
            { href: '/agency/calendar', label: 'Calendar', icon: Calendar },
        ],
    },
    {
        section: 'Finance',
        items: [
            { href: '/agency/payments', label: 'Payments', icon: CreditCard },
            { href: '/agency/invoices', label: 'Invoices', icon: FileText },
        ],
    },
    {
        section: 'Resources',
        items: [
            { href: '/agency/documents', label: 'Documents', icon: FileText },
            { href: '/agency/suppliers', label: 'Suppliers', icon: Truck },
            { href: '/agency/tasks', label: 'Tasks', icon: CheckSquare },
        ],
    },
    {
        section: 'Management',
        items: [
            { href: '/agency/reports', label: 'Reports', icon: BarChart3 },
            { href: '/agency/staff', label: 'Staff', icon: UserCog },
            { href: '/agency/messages', label: 'Messages', icon: MessageSquare },
            { href: '/agency/settings', label: 'Settings', icon: Settings },
        ],
    },
];

// Navigation items for Super Admin Dashboard
const adminNavItems: NavSection[] = [
    {
        section: 'Platform',
        items: [
            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
            { href: '/admin/agencies', label: 'Agencies', icon: Briefcase },
            { href: '/admin/users', label: 'Users', icon: Users },
        ],
    },
    {
        section: 'Finance',
        items: [
            { href: '/admin/revenue', label: 'Revenue', icon: CreditCard },
            { href: '/admin/subscriptions', label: 'Subscriptions', icon: Package },
        ],
    },
    {
        section: 'System',
        items: [
            { href: '/admin/health', label: 'System Health', icon: BarChart3 },
            { href: '/admin/audit', label: 'Audit Logs', icon: FileText },
            { href: '/admin/settings', label: 'Settings', icon: Settings },
        ],
    },
];

interface SidebarProps {
    type: 'agency' | 'admin';
    mobileOpen?: boolean;
    onClose?: () => void;
    badgeCounts?: {
        leads?: number;
        tasks?: number;
        messages?: number;
    };
}

export function Sidebar({ type, mobileOpen, onClose, badgeCounts }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Logout state
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
    const [confirmText, setConfirmText] = useState('');

    // Compute dynamic nav items with real badge counts
    const getNavItems = () => {
        const items = type === 'admin' ? adminNavItems : agencyNavItems;

        if (type === 'agency' && badgeCounts) {
            // Update agency nav items with real counts
            return items.map(section => ({
                ...section,
                items: section.items.map(item => {
                    if (item.href === '/agency/leads') {
                        return { ...item, badge: badgeCounts.leads || undefined };
                    }
                    if (item.href === '/agency/tasks') {
                        return { ...item, badge: badgeCounts.tasks || undefined };
                    }
                    if (item.href === '/agency/messages') {
                        return { ...item, badge: badgeCounts.messages || undefined };
                    }
                    return item;
                })
            }));
        }

        return items;
    };

    const navItems = getNavItems();

    const isActive = (href: string) => {
        if (href === '/agency' || href === '/admin') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    // Close mobile menu on navigation
    const handleNavClick = () => {
        if (onClose) {
            onClose();
        }
    };

    // Logout handlers
    const handleLogoutClick = () => {
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

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <MapPin size={20} />
                    </div>
                    {!collapsed && (
                        <>
                            <span className="sidebar-logo-text">TravelX</span>
                            <span className="sidebar-logo-version">v1.0</span>
                        </>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section} className="sidebar-section">
                        {!collapsed && (
                            <div className="sidebar-section-title">{section.section}</div>
                        )}
                        {section.items.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <IconComponent className="sidebar-nav-icon" size={20} />
                                    {!collapsed && (
                                        <>
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span className="sidebar-nav-badge">{item.badge}</span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                {/* Logout Button */}
                <button
                    className="sidebar-logout-btn"
                    onClick={handleLogoutClick}
                    title="Sign Out"
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                {/* Collapse Toggle */}
                <button
                    className="btn btn-ghost"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!collapsed && <span style={{ marginLeft: '8px' }}>Collapse</span>}
                </button>
            </div>

            {/* Logout Confirmation Modal - Double Confirmation */}
            {showLogoutConfirm && (
                <div className="sidebar-logout-overlay" onClick={handleLogoutCancel}>
                    <div className="sidebar-logout-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Step Indicator */}
                        <div className="logout-step-indicator">
                            <div className={`step-dot ${confirmStep >= 1 ? 'active' : ''}`} />
                            <div className="step-line" />
                            <div className={`step-dot ${confirmStep >= 2 ? 'active' : ''}`} />
                        </div>

                        {confirmStep === 1 ? (
                            <>
                                <div className="logout-icon warning">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3>Are you sure?</h3>
                                <p>You are about to sign out of your account. You will need to login again to access your dashboard.</p>
                                <div className="logout-actions">
                                    <button className="btn btn-secondary" onClick={handleLogoutCancel}>
                                        Cancel
                                    </button>
                                    <button className="btn btn-warning" onClick={handleLogoutProceed}>
                                        Continue
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="logout-icon danger">
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
                                <div className="logout-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleLogoutCancel}
                                        disabled={loggingOut}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleLogoutConfirm}
                                        disabled={loggingOut || confirmText.toLowerCase() !== 'logout'}
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
                .sidebar-footer {
                    padding: var(--spacing-4);
                    border-top: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .sidebar-logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: var(--error-600);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                .sidebar-logout-btn:hover {
                    background: var(--error-50);
                }
                .sidebar-logout-overlay {
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
                .sidebar-logout-modal {
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
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
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
                .logout-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                .logout-icon.warning {
                    background: var(--warning-100, #fef3c7);
                    color: var(--warning-600, #d97706);
                }
                .logout-icon.danger {
                    background: var(--error-100, #fee2e2);
                    color: var(--error-600, #dc2626);
                }
                .sidebar-logout-modal h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 8px;
                }
                .sidebar-logout-modal p {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin: 0 0 24px;
                    line-height: 1.5;
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
                    box-sizing: border-box;
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
                .logout-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .logout-actions .btn {
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
                .logout-actions .btn-secondary {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .logout-actions .btn-secondary:hover {
                    background: var(--border-light);
                }
                .logout-actions .btn-warning {
                    background: var(--warning-500, #f59e0b);
                    color: white;
                }
                .logout-actions .btn-warning:hover {
                    background: var(--warning-600, #d97706);
                }
                .logout-actions .btn-danger {
                    background: var(--error-500);
                    color: white;
                }
                .logout-actions .btn-danger:hover {
                    background: var(--error-600);
                }
                .logout-actions .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </aside>
    );
}
