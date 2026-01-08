'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// DOCUMENT TYPES
// ============================================
export interface Document {
    id: string;
    agency_id: string;
    name: string;
    file_path: string;
    file_type: string | null;
    file_size: number | null;
    folder: string;
    uploaded_by: string | null;
    created_at: string;
}

// ============================================
// GET DOCUMENTS
// ============================================
export async function getDocuments() {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated', data: [] };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

// ============================================
// GET FOLDERS
// ============================================
export async function getFolders() {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { data: ['All Files', 'General'] };
    }

    const supabase = await createClient();

    const { data } = await supabase
        .from('documents')
        .select('folder')
        .eq('agency_id', user.agency_id);

    const folders = new Set(['All Files', 'General']);
    data?.forEach(doc => {
        if (doc.folder) folders.add(doc.folder);
    });

    return { data: Array.from(folders) };
}

// ============================================
// UPLOAD DOCUMENT
// ============================================
export async function uploadDocument(formData: FormData) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'General';

    if (!file) {
        return { error: 'No file provided' };
    }

    const supabase = await createClient();

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.agency_id}/${Date.now()}_${file.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
        .from('agency-documents')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (storageError) {
        return { error: `Upload failed: ${storageError.message}` };
    }

    // Create document record
    const { data, error } = await supabase
        .from('documents')
        .insert({
            agency_id: user.agency_id,
            name: file.name,
            file_path: storageData.path,
            file_type: file.type,
            file_size: file.size,
            folder: folder,
            uploaded_by: user.id,
        })
        .select()
        .single();

    if (error) {
        // Rollback storage upload
        await supabase.storage.from('agency-documents').remove([fileName]);
        return { error: error.message };
    }

    revalidatePath('/agency/documents');
    return { data };
}

// ============================================
// DELETE DOCUMENT
// ============================================
export async function deleteDocument(documentId: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    // Get document first
    const { data: doc } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('agency_id', user.agency_id)
        .single();

    if (!doc) {
        return { error: 'Document not found' };
    }

    // Delete from storage
    await supabase.storage.from('agency-documents').remove([doc.file_path]);

    // Delete record
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/documents');
    return { success: true };
}

// ============================================
// GET DOCUMENT DOWNLOAD URL
// ============================================
export async function getDocumentUrl(filePath: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { data } = await supabase.storage
        .from('agency-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (!data) {
        return { error: 'Could not generate download URL' };
    }

    return { url: data.signedUrl };
}
