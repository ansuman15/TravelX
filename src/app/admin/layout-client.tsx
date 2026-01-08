'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface AdminLayoutClientProps {
    children: ReactNode;
    user: {
        name: string;
        role: string;
        email: string;
    };
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
    return (
        <DashboardLayout
            type="admin"
            title="Admin Dashboard"
            user={user}
        >
            {children}
        </DashboardLayout>
    );
}
