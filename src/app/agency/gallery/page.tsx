import { Suspense } from 'react';
import { GalleryClient } from './page-client';
import { getGalleryItems } from '@/lib/actions/gallery';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Gallery | TravelX',
    description: 'Browse and manage your travel photos and videos',
};

export default async function GalleryPage() {
    const result = await getGalleryItems();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GalleryClient items={result.data} />
        </Suspense>
    );
}
