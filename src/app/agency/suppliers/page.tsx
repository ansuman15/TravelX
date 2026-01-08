import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { SuppliersPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch suppliers
    const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching suppliers:', error);
    }

    // Group by category
    const categories = ['airline', 'hotel', 'dmc', 'transport', 'activity', 'visa', 'insurance', 'other'];
    const suppliersCount = categories.map(cat => ({
        category: cat,
        count: suppliers?.filter(s => s.category === cat).length || 0,
    }));

    return (
        <SuppliersPageClient
            initialSuppliers={suppliers || []}
            suppliersCount={suppliersCount}
            currentUserId={user.id}
        />
    );
}
