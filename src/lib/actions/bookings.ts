'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireAgencyAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Booking state machine - allowed transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    'enquiry': ['confirmed', 'cancelled'],
    'confirmed': ['documents_pending', 'ticketed', 'cancelled'],
    'documents_pending': ['ticketed', 'cancelled'],
    'ticketed': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
};

// ============================================
// BOOKINGS MANAGEMENT
// ============================================

export async function createBooking(formData: {
    customer_id: string;
    enquiry_id?: string;
    itinerary_id?: string;
    travel_start: string;
    travel_end: string;
    destination?: string;
    adults?: number;
    children?: number;
    total_cost?: number;
    total_amount: number;
    assigned_to?: string;
    notes?: string;
}) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Generate booking number
    const { data: bookingNumber } = await supabase
        .rpc('generate_booking_number', { agency_id: user.agency_id });

    const { data, error } = await supabase
        .from('bookings')
        .insert({
            agency_id: user.agency_id,
            booking_number: bookingNumber || `BK-${Date.now()}`,
            created_by: user.id,
            assigned_to: formData.assigned_to || user.id,
            ...formData,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Create initial status history
    await supabase
        .from('booking_status_history')
        .insert({
            booking_id: data.id,
            old_status: null,
            new_status: 'enquiry',
            changed_by: user.id,
            notes: 'Booking created',
        });

    revalidatePath('/agency/bookings');
    return { data };
}

export async function updateBookingStatus(
    bookingId: string,
    newStatus: string,
    notes?: string
) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Get current booking status
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .single();

    if (fetchError || !booking) {
        return { error: 'Booking not found' };
    }

    // Validate state transition
    const allowedNextStates = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowedNextStates.includes(newStatus)) {
        return {
            error: `Cannot transition from '${booking.status}' to '${newStatus}'. Allowed: ${allowedNextStates.join(', ')}`
        };
    }

    // Update booking status
    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_by = user.id;
        updateData.cancellation_reason = notes;
    }

    const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Record status history
    await supabase
        .from('booking_status_history')
        .insert({
            booking_id: bookingId,
            old_status: booking.status,
            new_status: newStatus,
            changed_by: user.id,
            notes,
        });

    revalidatePath('/agency/bookings');
    return { data };
}

export async function updateBooking(
    bookingId: string,
    formData: {
        travel_start?: string;
        travel_end?: string;
        destination?: string;
        adults?: number;
        children?: number;
        total_cost?: number;
        total_amount?: number;
        assigned_to?: string;
        notes?: string;
    }
) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('bookings')
        .update(formData)
        .eq('id', bookingId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/bookings');
    return { data };
}

// ============================================
// BOOKING SERVICES
// ============================================

export async function addBookingService(formData: {
    booking_id: string;
    service_type: 'flight' | 'hotel' | 'transfer' | 'activity' | 'visa' | 'insurance' | 'other';
    supplier_id?: string;
    description: string;
    service_date?: string;
    cost_price?: number;
    sell_price?: number;
    quantity?: number;
    notes?: string;
}) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('booking_services')
        .insert(formData)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/bookings');
    return { data };
}

export async function updateBookingService(
    serviceId: string,
    formData: {
        description?: string;
        service_date?: string;
        cost_price?: number;
        sell_price?: number;
        quantity?: number;
        status?: 'pending' | 'confirmed' | 'cancelled';
        confirmation_number?: string;
        notes?: string;
    }
) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('booking_services')
        .update(formData)
        .eq('id', serviceId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/bookings');
    return { data };
}

// ============================================
// PAYMENTS (APPEND-ONLY LEDGER)
// ============================================

export async function recordPayment(formData: {
    booking_id: string;
    amount: number;
    payment_mode: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'other';
    payment_date?: string;
    reference_number?: string;
    notes?: string;
}) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Get booking to verify agency
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('agency_id')
        .eq('id', formData.booking_id)
        .single();

    if (bookingError || !booking) {
        return { error: 'Booking not found' };
    }

    const { data, error } = await supabase
        .from('payments')
        .insert({
            agency_id: booking.agency_id,
            booking_id: formData.booking_id,
            amount: formData.amount,
            payment_mode: formData.payment_mode,
            payment_date: formData.payment_date || new Date().toISOString(),
            reference_number: formData.reference_number,
            notes: formData.notes,
            recorded_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Note: amount_paid is updated automatically via database trigger

    revalidatePath('/agency/bookings');
    revalidatePath('/agency/payments');
    return { data };
}

export async function recordRefund(formData: {
    booking_id: string;
    amount: number; // Will be stored as negative
    payment_mode: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'other';
    reference_number?: string;
    notes?: string;
}) {
    // Record as negative amount
    return recordPayment({
        ...formData,
        amount: -Math.abs(formData.amount),
        notes: formData.notes || 'Refund',
    });
}

// ============================================
// INVOICES
// ============================================

export async function createInvoice(formData: {
    booking_id: string;
    amount: number;
    tax_amount?: number;
    due_date?: string;
    notes?: string;
}) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Get booking to verify agency and generate invoice number
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('agency_id')
        .eq('id', formData.booking_id)
        .single();

    if (bookingError || !booking) {
        return { error: 'Booking not found' };
    }

    // Generate invoice number
    const { data: invoiceNumber } = await supabase
        .rpc('generate_invoice_number', { agency_id: booking.agency_id });

    const taxAmount = formData.tax_amount || 0;
    const totalAmount = formData.amount + taxAmount;

    const { data, error } = await supabase
        .from('invoices')
        .insert({
            agency_id: booking.agency_id,
            booking_id: formData.booking_id,
            invoice_number: invoiceNumber || `INV-${Date.now()}`,
            amount: formData.amount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            due_date: formData.due_date,
            notes: formData.notes,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/invoices');
    return { data };
}

export async function issueInvoice(invoiceId: string) {
    await requireAgencyAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('invoices')
        .update({
            status: 'issued',
            issued_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('status', 'draft') // Can only issue draft invoices
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/invoices');
    return { data };
}

export async function markInvoicePaid(invoiceId: string) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('invoices')
        .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/invoices');
    return { data };
}
