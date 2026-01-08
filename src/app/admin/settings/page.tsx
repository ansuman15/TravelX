import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    return <SettingsPageClient />;
}
