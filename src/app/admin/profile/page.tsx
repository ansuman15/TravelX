import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfilePageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    return (
        <ProfilePageClient
            user={{
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                phone: user.phone || null,
                avatar_url: user.avatar_url || null,
            }}
        />
    );
}
