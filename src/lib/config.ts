/**
 * Production configuration and environment validation
 */

// Required environment variables for production
const REQUIRED_ENV_VARS = {
    // Core
    NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',

    // Optional but recommended
    // SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (for admin operations)',
    // RESEND_API_KEY: 'Resend API key for emails',
    // TWILIO_ACCOUNT_SID: 'Twilio account SID for SMS',
    // TWILIO_AUTH_TOKEN: 'Twilio auth token',
    // TWILIO_PHONE_NUMBER: 'Twilio phone number',
};

// Validate environment on startup
export function validateEnvironment(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
        if (!process.env[key]) {
            missing.push(`${key} - ${description}`);
        }
    }

    if (missing.length > 0) {
        console.warn('⚠️ Missing environment variables:');
        missing.forEach(m => console.warn(`  - ${m}`));
    }

    return { valid: missing.length === 0, missing };
}

// Feature flags
export const features = {
    // Notifications
    emailNotifications: !!process.env.RESEND_API_KEY,
    smsNotifications: !!process.env.TWILIO_ACCOUNT_SID,

    // Integrations
    webhooks: true,

    // Limits
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    maxLeadsPerAgency: 10000,
    maxCustomersPerAgency: 10000,
    maxBookingsPerAgency: 10000,
};

// Rate limiting configuration
export const rateLimits = {
    api: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
    },
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // For login attempts
    },
    upload: {
        windowMs: 60 * 1000,
        maxRequests: 10,
    },
};

// Cache configuration
export const cacheConfig = {
    // Static data (packages, templates)
    staticTTL: 60 * 60, // 1 hour

    // Dynamic data (leads, bookings)
    dynamicTTL: 60, // 1 minute

    // User data
    userTTL: 5 * 60, // 5 minutes
};

// Security headers for API responses
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Production-safe error message
export function getSafeErrorMessage(error: unknown): string {
    if (process.env.NODE_ENV === 'production') {
        return 'An unexpected error occurred. Please try again.';
    }
    return String(error);
}

// Check if running in production
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

// Check if running on Vercel
export function isVercel(): boolean {
    return !!process.env.VERCEL;
}

// Get app version
export function getAppVersion(): string {
    return process.env.npm_package_version || '1.0.0';
}

// Health check data
export function getHealthCheckData() {
    return {
        status: 'healthy',
        version: getAppVersion(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        features: {
            email: features.emailNotifications,
            sms: features.smsNotifications,
        },
    };
}
