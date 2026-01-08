import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const user = await requireAuth();

    // Check if user is super admin
    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    return (
        <AdminLayoutClient
            user={{
                name: user.full_name,
                role: user.role,
                email: user.email,
            }}
        >
            {children}
        </AdminLayoutClient>
    );
}
