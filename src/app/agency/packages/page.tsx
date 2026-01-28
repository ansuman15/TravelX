import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { PackagesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
    await requireAuth();
    const supabase = await createClient();

    // Fetch packages with itinerary count
    const { data: packages, error } = await supabase
        .from('packages')
        .select(`
      *,
      itineraries:itineraries(count),
      creator:users!packages_created_by_fkey(full_name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching packages:', error);
    }

    return (
        <PackagesPageClient initialPackages={packages || []} />
    );
}
