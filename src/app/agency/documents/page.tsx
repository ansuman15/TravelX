import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DocumentsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyDocumentsPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    const supabase = await createClient();

    // Fetch documents from database
    const { data: documents, error } = await supabase
        .from('documents')
        .select(`
            *,
            uploader:users!documents_uploaded_by_fkey(id, full_name)
        `)
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching documents:', error);
    }

    // Get distinct folders
    const allFolders = new Set(['All Files']);
    (documents || []).forEach(doc => {
        if (doc.folder) {
            allFolders.add(doc.folder);
        }
    });

    // Transform documents for client
    const formattedDocuments = (documents || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: getFileType(doc.file_type),
        size: formatFileSize(doc.file_size),
        folder: doc.folder || 'General',
        uploaded_at: doc.created_at,
        uploaded_by: doc.uploader?.full_name || 'Unknown',
        file_path: doc.file_path,
    }));

    return (
        <DocumentsPageClient
            documents={formattedDocuments}
            folders={Array.from(allFolders)}
        />
    );
}

function getFileType(mimeType: string | null): 'pdf' | 'image' | 'doc' | 'other' {
    if (!mimeType) return 'other';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    return 'other';
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
