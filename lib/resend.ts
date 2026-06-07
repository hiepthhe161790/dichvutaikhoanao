import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

// Only initialize if the key is present to avoid crashing if it's missing
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
