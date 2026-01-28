'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
    children: ReactNode;
    type: 'agency' | 'admin';
    title: string;
    subtitle?: string;
    user?: {
        name: string;
        role: string;
        avatar?: string;
        email?: string;
    };
    agencyName?: string;
    badgeCounts?: {
        leads?: number;
        tasks?: number;
        messages?: number;
    };
}

export function DashboardLayout({
    children,
    type,
    title,
    subtitle,
    user,
    agencyName,
    badgeCounts,
}: DashboardLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="dashboard-layout">
            {/* Mobile overlay backdrop */}
            <div
                className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`}
                onClick={closeMobileMenu}
            />

            <Sidebar
                type={type}
                mobileOpen={mobileMenuOpen}
                onClose={closeMobileMenu}
                badgeCounts={badgeCounts}
            />
            <main className="main-content">
                <Topbar
                    title={title}
                    subtitle={subtitle}
                    user={user}
                    agencyName={agencyName}
                    onMenuToggle={toggleMobileMenu}
                />
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Re-export components for convenient imports
export { Sidebar } from './Sidebar';
export { Topbar } from './Topbar';
