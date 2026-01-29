import { Suspense } from 'react';
import { GuidesClient } from './page-client';
import { getGuidesList } from '@/lib/actions/guides';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Guides | TravelX',
    description: 'Manage your tour guides and their assignments',
};

export default async function GuidesPage() {
    const result = await getGuidesList();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GuidesClient guides={result.data} />
        </Suspense>
    );
}
