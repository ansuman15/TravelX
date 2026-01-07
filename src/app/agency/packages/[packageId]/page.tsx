import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ItineraryBuilderClient } from './page-client';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ packageId: string }>;
}

export default async function PackageItineraryPage({ params }: PageProps) {
    const { packageId } = await params;
    await requireAuth();
    const supabase = await createClient();

    // Fetch package
    const { data: pkg, error: pkgError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single();

    if (pkgError || !pkg) {
        notFound();
    }

    // Fetch itineraries for this package
    const { data: itineraries } = await supabase
        .from('itineraries')
        .select(`
      *,
      days:itinerary_days(*)
    `)
        .eq('package_id', packageId)
        .order('created_at', { ascending: false });

    // Fetch suppliers for mapping
    const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');

    return (
        <ItineraryBuilderClient
            pkg={pkg}
            initialItineraries={itineraries || []}
            suppliers={suppliers || []}
        />
    );
}
