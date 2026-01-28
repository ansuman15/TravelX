'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

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
            { href: '/agency/leads', label: 'Leads & Enquiries', icon: UserPlus, badge: 12 },
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
            { href: '/agency/tasks', label: 'Tasks', icon: CheckSquare, badge: 5 },
        ],
    },
    {
        section: 'Management',
        items: [
            { href: '/agency/reports', label: 'Reports', icon: BarChart3 },
            { href: '/agency/staff', label: 'Staff', icon: UserCog },
            { href: '/agency/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
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
}

export function Sidebar({ type, mobileOpen, onClose }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = type === 'admin' ? adminNavItems : agencyNavItems;

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

            {/* Collapse Toggle */}
            <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--border-light)' }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!collapsed && <span style={{ marginLeft: '8px' }}>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
