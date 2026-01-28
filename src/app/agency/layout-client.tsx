'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface AgencyLayoutClientProps {
    children: ReactNode;
    user: {
        name: string;
        role: string;
        email: string;
    };
    agencyName: string;
    badgeCounts?: {
        leads?: number;
        tasks?: number;
        messages?: number;
    };
}

export function AgencyLayoutClient({ children, user, agencyName, badgeCounts }: AgencyLayoutClientProps) {
    const router = useRouter();

    // Handle auth error hash fragments (e.g., from expired email links)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const error = params.get('error');

            if (error) {
                console.warn('Auth error detected in URL:', error, params.get('error_description'));
                // Clear the hash fragment to prevent confusion
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }, []);

    return (
        <DashboardLayout
            type="agency"
            title="Dashboard"
            user={user}
            agencyName={agencyName}
            badgeCounts={badgeCounts}
        >
            {children}
        </DashboardLayout>
    );
}

