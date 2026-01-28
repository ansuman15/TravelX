/**
 * SMS notification service
 * Uses Twilio for SMS (or MSG91 for India)
 */

interface SmsOptions {
    to: string;
    message: string;
}

interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// SMS templates
export const smsTemplates = {
    // OTP verification
    otp: (code: string) => `Your TravelX verification code is ${code}. Valid for 10 minutes.`,

    // New lead notification
    newLead: (leadName: string, phone: string) =>
        `New lead assigned: ${leadName} (${phone}). Check your dashboard.`,

    // Booking confirmation
    bookingConfirmed: (bookingNumber: string, destination: string, date: string) =>
        `Booking ${bookingNumber} confirmed! ${destination} on ${date}. Thank you for choosing TravelX.`,

    // Payment received
    paymentReceived: (amount: number, bookingNumber: string) =>
        `Payment of ₹${amount.toLocaleString('en-IN')} received for booking ${bookingNumber}. Thank you!`,

    // Payment reminder
    paymentReminder: (dueAmount: number, dueDate: string, bookingNumber: string) =>
        `Reminder: ₹${dueAmount.toLocaleString('en-IN')} due on ${dueDate} for booking ${bookingNumber}.`,

    // Travel reminder
    travelReminder: (destination: string, daysLeft: number) =>
        `Your trip to ${destination} is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}! Safe travels!`,
};

// Format phone number for SMS
function formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Add India country code if not present
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    // Add + prefix
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
}

// Send SMS using Twilio or MSG91
export async function sendSms(options: SmsOptions): Promise<NotificationResult> {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const formattedPhone = formatPhoneNumber(options.to);

    // Development mode - log to console
    if (!twilioAccountSid || process.env.NODE_ENV === 'development') {
        console.log('📱 SMS (Dev Mode):', {
            to: formattedPhone,
            message: options.message,
        });
        return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    try {
        // Using Twilio REST API directly
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    To: formattedPhone,
                    From: twilioPhoneNumber || '',
                    Body: options.message,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'SMS send failed' };
        }

        const result = await response.json();
        return { success: true, messageId: result.sid };
    } catch (error) {
        console.error('SMS send error:', error);
        return { success: false, error: String(error) };
    }
}

// Convenience functions
export async function sendOtp(phone: string, code: string) {
    return sendSms({
        to: phone,
        message: smsTemplates.otp(code),
    });
}

export async function notifyNewLeadSms(phone: string, leadName: string, leadPhone: string) {
    return sendSms({
        to: phone,
        message: smsTemplates.newLead(leadName, leadPhone),
    });
}

export async function sendBookingConfirmationSms(phone: string, bookingNumber: string, destination: string, date: string) {
    return sendSms({
        to: phone,
        message: smsTemplates.bookingConfirmed(bookingNumber, destination, date),
    });
}

export async function sendPaymentReceivedSms(phone: string, amount: number, bookingNumber: string) {
    return sendSms({
        to: phone,
        message: smsTemplates.paymentReceived(amount, bookingNumber),
    });
}

export async function sendPaymentReminderSms(phone: string, dueAmount: number, dueDate: string, bookingNumber: string) {
    return sendSms({
        to: phone,
        message: smsTemplates.paymentReminder(dueAmount, dueDate, bookingNumber),
    });
}

export async function sendTravelReminderSms(phone: string, destination: string, daysLeft: number) {
    return sendSms({
        to: phone,
        message: smsTemplates.travelReminder(destination, daysLeft),
    });
}
