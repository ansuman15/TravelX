export { createClient, getSupabase } from './client';
export { createClient as createServerClient, createAdminClient } from './server';

// Types
export type UserRole = 'super_admin' | 'agency_admin' | 'agency_staff';
export type StaffRole = 'sales' | 'operations' | 'visa' | 'accountant';

export interface User {
    id: string;
    agency_id: string | null;
    email: string;
    full_name: string;
    role: UserRole;
    staff_role: StaffRole | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Agency {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    address: string | null;
    logo_url: string | null;
    subscription_plan: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Lead {
    id: string;
    agency_id: string;
    source: 'website' | 'google_ads' | 'meta_ads' | 'call' | 'referral';
    full_name: string;
    email: string | null;
    phone: string | null;
    destination: string | null;
    travel_dates: string | null;
    budget_range: string | null;
    message: string | null;
    status: 'new' | 'contacted' | 'quoted' | 'booked' | 'lost';
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    agency_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    passport_number: string | null;
    passport_expiry: string | null;
    date_of_birth: string | null;
    nationality: string | null;
    address: string | null;
    preferences: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    agency_id: string;
    booking_number: string;
    customer_id: string;
    enquiry_id: string | null;
    itinerary_id: string | null;
    status: 'enquiry' | 'confirmed' | 'ticketed' | 'completed' | 'cancelled';
    travel_start: string;
    travel_end: string;
    total_amount: number;
    amount_paid: number;
    assigned_to: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: string;
    agency_id: string;
    booking_id: string;
    amount: number;
    payment_mode: 'cash' | 'card' | 'bank_transfer' | 'upi';
    payment_date: string;
    reference_number: string | null;
    notes: string | null;
    recorded_by: string;
    created_at: string;
}

export interface Invoice {
    id: string;
    agency_id: string;
    booking_id: string;
    invoice_number: string;
    amount: number;
    tax_amount: number;
    total_amount: number;
    status: 'draft' | 'issued' | 'paid' | 'cancelled';
    issued_at: string | null;
    due_date: string | null;
    pdf_url: string | null;
    created_at: string;
}

export interface Supplier {
    id: string;
    agency_id: string;
    name: string;
    type: 'airline' | 'hotel' | 'dmc' | 'transport';
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
}

export interface Task {
    id: string;
    agency_id: string;
    booking_id: string | null;
    title: string;
    description: string | null;
    assigned_to: string | null;
    due_date: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
}
