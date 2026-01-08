import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DocumentsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyDocumentsPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    // Mock documents - TODO: Implement with Supabase Storage
    const mockDocuments = [
        { id: '1', name: 'Visa Application Guide.pdf', type: 'pdf' as const, size: '2.4 MB', folder: 'Templates', uploaded_at: new Date().toISOString() },
        { id: '2', name: 'Travel Insurance Policy.pdf', type: 'pdf' as const, size: '1.8 MB', folder: 'Templates', uploaded_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', name: 'Bali Package Brochure.pdf', type: 'pdf' as const, size: '5.2 MB', folder: 'Brochures', uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: '4', name: 'Client Passport - John Doe.jpg', type: 'image' as const, size: '450 KB', folder: 'Client Documents', uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: '5', name: 'Invoice Template.docx', type: 'doc' as const, size: '125 KB', folder: 'Templates', uploaded_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    ];

    const folders = ['All Files', 'Templates', 'Brochures', 'Client Documents'];

    return (
        <DocumentsPageClient
            documents={mockDocuments}
            folders={folders}
        />
    );
}
