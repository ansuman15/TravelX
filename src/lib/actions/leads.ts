'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// LEADS MANAGEMENT
// ============================================

export async function createLead(formData: {
    full_name: string;
    email?: string;
    phone?: string;
    source: 'website' | 'google_ads' | 'meta_ads' | 'call' | 'referral' | 'walk_in' | 'other';
    destination?: string;
    travel_start?: string;
    travel_end?: string;
    adults?: number;
    children?: number;
    budget_range?: string;
    message?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
}) {
    const user = await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('leads')
        .insert({
            agency_id: user.agency_id,
            ...formData,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/leads');
    return { data };
}

export async function updateLead(
    leadId: string,
    formData: {
        full_name?: string;
        email?: string;
        phone?: string;
        destination?: string;
        travel_start?: string;
        travel_end?: string;
        adults?: number;
        children?: number;
        budget_range?: string;
        message?: string;
        status?: 'new' | 'contacted' | 'quoted' | 'negotiating' | 'booked' | 'lost';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        assigned_to?: string;
        lost_reason?: string;
    }
) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated with user' };
    }

    const supabase = await createClient();

    // SECURITY: Ensure lead belongs to user's agency (prevents IDOR)
    const { data, error } = await supabase
        .from('leads')
        .update(formData)
        .eq('id', leadId)
        .eq('agency_id', user.agency_id) // Agency ownership check
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    if (!data) {
        return { error: 'Lead not found or access denied' };
    }

    revalidatePath('/agency/leads');
    return { data };
}

export async function assignLead(leadId: string, userId: string) {
    return updateLead(leadId, { assigned_to: userId });
}

export async function updateLeadStatus(
    leadId: string,
    status: 'new' | 'contacted' | 'quoted' | 'negotiating' | 'booked' | 'lost',
    lostReason?: string
) {
    return updateLead(leadId, { status, lost_reason: lostReason });
}

export async function convertLeadToCustomer(leadId: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    // Get lead data
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (leadError || !lead) {
        return { error: 'Lead not found' };
    }

    // Create customer from lead
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
            agency_id: user.agency_id,
            full_name: lead.full_name,
            email: lead.email,
            phone: lead.phone,
            created_by: user.id,
        })
        .select()
        .single();

    if (customerError) {
        return { error: customerError.message };
    }

    // Update lead with customer reference
    await supabase
        .from('leads')
        .update({
            status: 'booked',
            converted_to_customer_id: customer.id
        })
        .eq('id', leadId);

    revalidatePath('/agency/leads');
    revalidatePath('/agency/customers');
    return { data: customer };
}

// ============================================
// CUSTOMERS MANAGEMENT
// ============================================

export async function createCustomer(formData: {
    full_name: string;
    email?: string;
    phone?: string;
    alternate_phone?: string;
    passport_number?: string;
    passport_expiry?: string;
    date_of_birth?: string;
    nationality?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    notes?: string;
}) {
    const user = await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('customers')
        .insert({
            agency_id: user.agency_id,
            created_by: user.id,
            ...formData,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/customers');
    return { data };
}

export async function updateCustomer(
    customerId: string,
    formData: {
        full_name?: string;
        email?: string;
        phone?: string;
        alternate_phone?: string;
        passport_number?: string;
        passport_expiry?: string;
        date_of_birth?: string;
        nationality?: string;
        gender?: 'male' | 'female' | 'other';
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
        notes?: string;
        preferences?: Record<string, unknown>;
    }
) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated with user' };
    }

    const supabase = await createClient();

    // SECURITY: Ensure customer belongs to user's agency (prevents IDOR)
    const { data, error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', customerId)
        .eq('agency_id', user.agency_id) // Agency ownership check
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    if (!data) {
        return { error: 'Customer not found or access denied' };
    }

    revalidatePath('/agency/customers');
    return { data };
}

// ============================================
// FOLLOW-UPS
// ============================================

export async function createFollowup(formData: {
    lead_id?: string;
    customer_id?: string;
    due_date: string;
    type?: 'call' | 'email' | 'whatsapp' | 'meeting' | 'other';
    notes?: string;
    assigned_to?: string;
}) {
    const user = await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('followups')
        .insert({
            agency_id: user.agency_id,
            assigned_to: formData.assigned_to || user.id,
            ...formData,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/leads');
    return { data };
}

export async function completeFollowup(followupId: string, outcome: string) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('followups')
        .update({
            status: 'completed',
            outcome,
            completed_at: new Date().toISOString(),
        })
        .eq('id', followupId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/leads');
    return { data };
}
