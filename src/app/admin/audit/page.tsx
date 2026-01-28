import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AuditPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    const supabase = await createClient();

    // Fetch recent audit logs
    const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select(`
            *,
            user:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    return <AuditPageClient logs={auditLogs || []} />;
}
