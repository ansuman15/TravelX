'use client';

import { ReactNode } from 'react';
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
    };
    agencyName?: string;
}

export function DashboardLayout({
    children,
    type,
    title,
    subtitle,
    user,
    agencyName,
}: DashboardLayoutProps) {
    return (
        <div className="dashboard-layout">
            <Sidebar type={type} />
            <main className="main-content">
                <Topbar
                    title={title}
                    subtitle={subtitle}
                    user={user}
                    agencyName={agencyName}
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
