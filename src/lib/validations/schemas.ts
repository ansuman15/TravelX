import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

export const uuidSchema = z.string().uuid('Invalid ID format');

export const emailSchema = z.string().email('Invalid email format').optional().or(z.literal(''));

export const phoneSchema = z.string()
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal(''));

export const dateSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format (YYYY-MM-DD)')
    .optional()
    .or(z.literal(''));

// ============================================
// LEAD SCHEMAS
// ============================================

export const createLeadSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailSchema,
    phone: phoneSchema,
    source: z.enum(['website', 'google_ads', 'meta_ads', 'call', 'referral', 'walk_in', 'other']),
    destination: z.string().max(200).optional(),
    travel_start: dateSchema,
    travel_end: dateSchema,
    adults: z.number().min(1).max(50).optional(),
    children: z.number().min(0).max(50).optional(),
    budget_range: z.string().max(100).optional(),
    message: z.string().max(2000).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigned_to: uuidSchema.optional(),
});

export const updateLeadSchema = z.object({
    full_name: z.string().min(2).max(100).optional(),
    email: emailSchema,
    phone: phoneSchema,
    destination: z.string().max(200).optional(),
    travel_start: dateSchema,
    travel_end: dateSchema,
    adults: z.number().min(1).max(50).optional(),
    children: z.number().min(0).max(50).optional(),
    budget_range: z.string().max(100).optional(),
    message: z.string().max(2000).optional(),
    status: z.enum(['new', 'contacted', 'quoted', 'negotiating', 'booked', 'lost']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigned_to: uuidSchema.optional().nullable(),
    lost_reason: z.string().max(500).optional(),
});

// ============================================
// CUSTOMER SCHEMAS
// ============================================

export const createCustomerSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailSchema,
    phone: phoneSchema,
    alternate_phone: phoneSchema,
    passport_number: z.string().max(50).optional(),
    passport_expiry: dateSchema,
    date_of_birth: dateSchema,
    nationality: z.string().max(50).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    pincode: z.string().max(20).optional(),
    notes: z.string().max(2000).optional(),
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const createBookingSchema = z.object({
    customer_id: uuidSchema,
    package_id: uuidSchema.optional().nullable(),
    enquiry_id: uuidSchema.optional().nullable(),
    itinerary_id: uuidSchema.optional().nullable(),
    travel_start: z.string().min(1, 'Travel start date is required'),
    travel_end: z.string().min(1, 'Travel end date is required'),
    destination: z.string().max(200).optional(),
    adults: z.number().min(1).max(50).optional(),
    children: z.number().min(0).max(50).optional(),
    total_cost: z.number().min(0).optional(),
    total_amount: z.number().min(0, 'Total amount must be positive'),
    assigned_to: uuidSchema.optional(),
    notes: z.string().max(2000).optional(),
});

export const updateBookingSchema = z.object({
    package_id: uuidSchema.optional().nullable(),
    itinerary_id: uuidSchema.optional().nullable(),
    travel_start: dateSchema,
    travel_end: dateSchema,
    destination: z.string().max(200).optional(),
    adults: z.number().min(1).max(50).optional(),
    children: z.number().min(0).max(50).optional(),
    total_cost: z.number().min(0).optional(),
    total_amount: z.number().min(0).optional(),
    assigned_to: uuidSchema.optional().nullable(),
    notes: z.string().max(2000).optional(),
});

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const recordPaymentSchema = z.object({
    booking_id: uuidSchema,
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    payment_mode: z.enum(['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other']),
    payment_date: dateSchema,
    reference_number: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
});

// ============================================
// AGENCY SCHEMAS (Admin)
// ============================================

export const createAgencySchema = z.object({
    name: z.string().min(2, 'Agency name must be at least 2 characters').max(200),
    phone: phoneSchema,
    email: emailSchema,
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    gst_number: z.string().max(50).optional(),
    adminName: z.string().max(100).optional(),
    adminEmail: z.string().email('Invalid admin email').optional(),
    adminPassword: z.string().min(8).max(100).optional(),
});

// ============================================
// HELPER FUNCTION
// ============================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errorMessages };
}
