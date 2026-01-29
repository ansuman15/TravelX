import { Suspense } from 'react';
import { FeedbackClient } from './page-client';
import { getFeedbackList, getFeedbackStats } from '@/lib/actions/feedback';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Feedback | TravelX',
    description: 'View and manage customer feedback and reviews',
};

export default async function FeedbackPage() {
    const [feedbackResult, statsResult] = await Promise.all([
        getFeedbackList(),
        getFeedbackStats(),
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FeedbackClient
                feedback={feedbackResult.data}
                stats={statsResult}
            />
        </Suspense>
    );
}
