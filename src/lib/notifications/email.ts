/**
 * Email notification service
 * Uses Resend for transactional emails
 */

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
}

interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Email templates
export const emailTemplates = {
    // Lead notification for agent
    newLeadAssigned: (data: { agentName: string; leadName: string; source: string; phone: string }) => ({
        subject: `New Lead Assigned: ${data.leadName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Assigned</h1>
                </div>
                <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="color: #374151; font-size: 16px;">Hi ${data.agentName},</p>
                    <p style="color: #374151; font-size: 16px;">A new lead has been assigned to you:</p>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Name:</strong> ${data.leadName}</p>
                        <p style="margin: 4px 0;"><strong>Source:</strong> ${data.source}</p>
                        <p style="margin: 4px 0;"><strong>Phone:</strong> ${data.phone}</p>
                    </div>
                    <p style="color: #374151; font-size: 16px;">Please follow up at your earliest convenience.</p>
                </div>
            </div>
        `,
    }),

    // Booking confirmation for customer
    bookingConfirmation: (data: {
        customerName: string;
        bookingNumber: string;
        destination: string;
        travelDate: string;
        agencyName: string;
        totalAmount: number;
    }) => ({
        subject: `Booking Confirmed: ${data.destination} - ${data.bookingNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #22c55e, #10b981); padding: 24px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed ✓</h1>
                </div>
                <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="color: #374151; font-size: 16px;">Dear ${data.customerName},</p>
                    <p style="color: #374151; font-size: 16px;">Your booking has been confirmed!</p>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Booking #:</strong> ${data.bookingNumber}</p>
                        <p style="margin: 4px 0;"><strong>Destination:</strong> ${data.destination}</p>
                        <p style="margin: 4px 0;"><strong>Travel Date:</strong> ${data.travelDate}</p>
                        <p style="margin: 4px 0;"><strong>Total Amount:</strong> ₹${data.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Thank you for choosing ${data.agencyName}!</p>
                </div>
            </div>
        `,
    }),

    // Payment receipt
    paymentReceipt: (data: {
        customerName: string;
        bookingNumber: string;
        amount: number;
        paymentMode: string;
        transactionId: string;
        balanceDue: number;
        agencyName: string;
    }) => ({
        subject: `Payment Received: ₹${data.amount.toLocaleString('en-IN')} - ${data.bookingNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Payment Receipt</h1>
                </div>
                <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="color: #374151; font-size: 16px;">Dear ${data.customerName},</p>
                    <p style="color: #374151; font-size: 16px;">Thank you for your payment.</p>
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Amount Paid:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
                        <p style="margin: 4px 0;"><strong>Payment Mode:</strong> ${data.paymentMode}</p>
                        <p style="margin: 4px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
                        <p style="margin: 4px 0;"><strong>Booking #:</strong> ${data.bookingNumber}</p>
                        <p style="margin: 4px 0;"><strong>Balance Due:</strong> ₹${data.balanceDue.toLocaleString('en-IN')}</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">${data.agencyName}</p>
                </div>
            </div>
        `,
    }),

    // Password reset
    passwordReset: (data: { userName: string; resetLink: string }) => ({
        subject: 'Reset Your Password - TravelX',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
                </div>
                <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="color: #374151; font-size: 16px;">Hi ${data.userName},</p>
                    <p style="color: #374151; font-size: 16px;">You requested to reset your password. Click the button below:</p>
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="${data.resetLink}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset Password</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                </div>
            </div>
        `,
    }),
};

// Send email using Resend API (or fallback to console in dev)
export async function sendEmail(options: EmailOptions): Promise<NotificationResult> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = options.from || process.env.EMAIL_FROM || 'noreply@travelx.app';

    // Development mode - log to console
    if (!resendApiKey || process.env.NODE_ENV === 'development') {
        console.log('📧 Email (Dev Mode):', {
            to: options.to,
            subject: options.subject,
            from: fromEmail,
        });
        return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromEmail,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: options.html,
                text: options.text,
                reply_to: options.replyTo,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'Email send failed' };
        }

        const result = await response.json();
        return { success: true, messageId: result.id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: String(error) };
    }
}

// Convenience functions for common notifications
export async function notifyNewLeadAssigned(
    agentEmail: string,
    agentName: string,
    leadName: string,
    source: string,
    phone: string
) {
    const template = emailTemplates.newLeadAssigned({ agentName, leadName, source, phone });
    return sendEmail({
        to: agentEmail,
        subject: template.subject,
        html: template.html,
    });
}

export async function notifyBookingConfirmation(
    customerEmail: string,
    customerName: string,
    bookingNumber: string,
    destination: string,
    travelDate: string,
    agencyName: string,
    totalAmount: number
) {
    const template = emailTemplates.bookingConfirmation({
        customerName,
        bookingNumber,
        destination,
        travelDate,
        agencyName,
        totalAmount,
    });
    return sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
    });
}

export async function notifyPaymentReceived(
    customerEmail: string,
    data: {
        customerName: string;
        bookingNumber: string;
        amount: number;
        paymentMode: string;
        transactionId: string;
        balanceDue: number;
        agencyName: string;
    }
) {
    const template = emailTemplates.paymentReceipt(data);
    return sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
    });
}
