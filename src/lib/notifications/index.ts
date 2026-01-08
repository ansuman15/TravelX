/**
 * Notifications barrel export
 */

export * from './email';
export * from './sms';

// Notification type for database/queue
export interface NotificationRecord {
    id: string;
    type: 'email' | 'sms' | 'push';
    recipient: string;
    subject?: string;
    content: string;
    status: 'pending' | 'sent' | 'failed';
    attempts: number;
    error?: string;
    sent_at?: string;
    created_at: string;
    agency_id?: string;
    booking_id?: string;
    lead_id?: string;
}

// Webhook event types
export type WebhookEventType =
    | 'lead.created'
    | 'lead.assigned'
    | 'lead.converted'
    | 'booking.created'
    | 'booking.confirmed'
    | 'booking.cancelled'
    | 'payment.received'
    | 'payment.refunded'
    | 'invoice.issued'
    | 'customer.created';

export interface WebhookPayload {
    event: WebhookEventType;
    timestamp: string;
    data: Record<string, unknown>;
    agency_id: string;
}

// Send webhook notification
export async function sendWebhook(
    webhookUrl: string,
    payload: WebhookPayload,
    secret?: string
): Promise<{ success: boolean; error?: string }> {
    if (!webhookUrl) {
        return { success: false, error: 'No webhook URL configured' };
    }

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add signature if secret is provided
        if (secret) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(secret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            const signature = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(JSON.stringify(payload))
            );
            headers['X-Webhook-Signature'] = Buffer.from(signature).toString('hex');
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error('Webhook send error:', error);
        return { success: false, error: String(error) };
    }
}
