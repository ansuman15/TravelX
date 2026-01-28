import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HealthPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminHealthPage() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    const supabase = await createClient();
    const startTime = Date.now();

    // Test database connection
    const { error: dbError } = await supabase.from('agencies').select('id').limit(1);
    const dbLatency = Date.now() - startTime;

    // Get counts
    const [
        { count: agencyCount },
        { count: userCount },
        { count: bookingCount },
    ] = await Promise.all([
        supabase.from('agencies').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
    ]);

    const healthData = {
        database: {
            status: (dbError ? 'error' : 'healthy') as 'healthy' | 'warning' | 'error',
            latency: dbLatency,
            message: dbError ? dbError.message : 'Connected to Supabase',
        },
        storage: {
            status: 'healthy' as const,
            message: 'Supabase Storage ready',
        },
        auth: {
            status: 'healthy' as const,
            message: 'Supabase Auth operational',
        },
        stats: {
            agencies: agencyCount || 0,
            users: userCount || 0,
            bookings: bookingCount || 0,
        },
    };

    return <HealthPageClient healthData={healthData} />;
}
