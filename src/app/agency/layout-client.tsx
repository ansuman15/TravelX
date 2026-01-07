'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface AgencyLayoutClientProps {
    children: ReactNode;
    user: {
        name: string;
        role: string;
        email: string;
    };
    agencyName: string;
}

export function AgencyLayoutClient({ children, user, agencyName }: AgencyLayoutClientProps) {
    return (
        <DashboardLayout
            type="agency"
            title="Dashboard"
            user={user}
            agencyName={agencyName}
        >
            {children}
        </DashboardLayout>
    );
}
