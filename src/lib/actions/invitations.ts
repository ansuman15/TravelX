'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// ============================================
// INVITATION TYPES
// ============================================
export interface StaffInvitation {
    id: string;
    agency_id: string;
    email: string;
    full_name: string | null;
    role: string;
    staff_role: string | null;
    invited_by: string | null;
    token: string;
    status: 'pending' | 'accepted' | 'expired';
    expires_at: string;
    created_at: string;
}

// ============================================
// GET INVITATIONS
// ============================================
export async function getInvitations() {
    const user = await requireAuth();

    if (!user.agency_id || user.role !== 'agency_admin') {
        return { error: 'Unauthorized', data: [] };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('staff_invitations')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

// ============================================
// CREATE INVITATION
// ============================================
export async function createInvitation(formData: {
    email: string;
    full_name?: string;
    role?: string;
    staff_role?: string;
}) {
    const user = await requireAuth();

    if (!user.agency_id || user.role !== 'agency_admin') {
        return { error: 'Only agency admins can invite staff' };
    }

    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single();

    if (existing) {
        return { error: 'User with this email already exists' };
    }

    // Check for pending invitation
    const { data: pendingInvite } = await supabase
        .from('staff_invitations')
        .select('id')
        .eq('email', formData.email)
        .eq('status', 'pending')
        .single();

    if (pendingInvite) {
        return { error: 'Invitation already sent to this email' };
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
        .from('staff_invitations')
        .insert({
            agency_id: user.agency_id,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role || 'agency_staff',
            staff_role: formData.staff_role,
            invited_by: user.id,
            token: token,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // TODO: Send invitation email
    // For now, return the invitation link
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?invite=${token}`;

    revalidatePath('/agency/staff');
    return {
        data,
        inviteLink,
        message: 'Invitation created. Share the link with the staff member.',
    };
}

// ============================================
// RESEND INVITATION
// ============================================
export async function resendInvitation(invitationId: string) {
    const user = await requireAuth();

    if (!user.agency_id || user.role !== 'agency_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Generate new token and extend expiry
    const token = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
        .from('staff_invitations')
        .update({
            token: token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
        })
        .eq('id', invitationId)
        .eq('agency_id', user.agency_id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?invite=${token}`;

    revalidatePath('/agency/staff');
    return { data, inviteLink };
}

// ============================================
// CANCEL INVITATION
// ============================================
export async function cancelInvitation(invitationId: string) {
    const user = await requireAuth();

    if (!user.agency_id || user.role !== 'agency_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('staff_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/staff');
    return { success: true };
}

// ============================================
// VALIDATE INVITATION (Used during signup)
// ============================================
export async function validateInvitation(token: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('staff_invitations')
        .select(`
            *,
            agency:agencies(id, name)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .single();

    if (error || !data) {
        return { error: 'Invalid or expired invitation' };
    }

    return { data };
}

// ============================================
// ACCEPT INVITATION (After user signs up)
// ============================================
export async function acceptInvitation(token: string, userId: string) {
    const supabase = await createClient();

    // Get invitation
    const { data: invitation } = await supabase
        .from('staff_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

    if (!invitation) {
        return { error: 'Invalid invitation' };
    }

    // Update user with agency
    const { error: userError } = await supabase
        .from('users')
        .update({
            agency_id: invitation.agency_id,
            role: invitation.role,
            staff_role: invitation.staff_role,
        })
        .eq('id', userId);

    if (userError) {
        return { error: userError.message };
    }

    // Mark invitation as accepted
    await supabase
        .from('staff_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

    return { success: true, agencyId: invitation.agency_id };
}
