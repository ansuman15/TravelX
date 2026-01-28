/**
 * Error handling utilities for production
 */

// Custom application error class
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
    }

    toJSON() {
        return {
            error: this.code,
            message: this.message,
            details: this.details,
        };
    }
}

// Common error types
export const Errors = {
    // Authentication errors
    UNAUTHORIZED: () => new AppError('Authentication required', 'UNAUTHORIZED', 401),
    FORBIDDEN: () => new AppError('Access denied', 'FORBIDDEN', 403),
    INVALID_TOKEN: () => new AppError('Invalid or expired token', 'INVALID_TOKEN', 401),

    // Validation errors
    VALIDATION_ERROR: (field: string, message: string) =>
        new AppError(`Validation failed: ${message}`, 'VALIDATION_ERROR', 400, { field }),
    MISSING_REQUIRED: (field: string) =>
        new AppError(`Missing required field: ${field}`, 'MISSING_REQUIRED', 400, { field }),

    // Resource errors
    NOT_FOUND: (resource: string) =>
        new AppError(`${resource} not found`, 'NOT_FOUND', 404, { resource }),
    ALREADY_EXISTS: (resource: string) =>
        new AppError(`${resource} already exists`, 'ALREADY_EXISTS', 409, { resource }),

    // Rate limiting
    RATE_LIMITED: () =>
        new AppError('Too many requests', 'RATE_LIMITED', 429),

    // Server errors
    INTERNAL_ERROR: (message?: string) =>
        new AppError(message || 'An unexpected error occurred', 'INTERNAL_ERROR', 500),
    SERVICE_UNAVAILABLE: () =>
        new AppError('Service temporarily unavailable', 'SERVICE_UNAVAILABLE', 503),
};

// Error handler for API routes
export function handleApiError(error: unknown): Response {
    console.error('API Error:', error);

    if (error instanceof AppError) {
        return new Response(JSON.stringify(error.toJSON()), {
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Handle Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message?: string };
        if (supabaseError.code === 'PGRST116') {
            return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'Resource not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // Default to internal server error
    return new Response(JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : String(error),
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Safe async handler wrapper for server actions
export function safeAction<T extends (...args: never[]) => Promise<unknown>>(
    action: T
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await action(...args);
        } catch (error) {
            console.error('Server action error:', error);

            if (error instanceof AppError) {
                return { error: error.message, code: error.code };
            }

            return {
                error: process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : String(error)
            };
        }
    }) as T;
}

// Validate required fields
export function validateRequired<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[]
): void {
    for (const field of fields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw Errors.MISSING_REQUIRED(String(field));
        }
    }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
}

// Log error to external service (placeholder)
export async function logError(error: Error, context?: Record<string, unknown>): Promise<void> {
    // In production, this would send to Sentry/LogRocket/etc
    console.error('Error logged:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
    });
}
