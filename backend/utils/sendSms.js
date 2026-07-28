const twilio = require('twilio');

const sendVerifySms = async (phone) => {
    let formattedPhone = phone;

    // Ensure phone number starts with + and country code for Twilio (E.164 format)
    if (formattedPhone && !formattedPhone.startsWith('+')) {
        const strippedPhone = formattedPhone.replace(/\s+/g, '');
        if (strippedPhone.length === 10) {
            formattedPhone = '+91' + strippedPhone;
        } else {
            formattedPhone = '+' + strippedPhone;
        }
    }

    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
            console.warn('Twilio Verify credentials not fully set in .env. Falling back to console log for SMS:');
            // We generate a temp 6-digit code just for logging local dev tests. Twilio Verify will handle generation in prod.
            const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`\n\n[FALLBACK-VERIFY-LOG]: Twilio Verify triggered for ${formattedPhone}. Dev Code: ${fallbackOtp}\n\n`);
            return fallbackOtp; // Return the fallback OTP so the controller can save it temporarily for local dev.
        }

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications
            .create({ to: formattedPhone, channel: 'sms' });

        return null; // Null indicates Twilio is handling it

    } catch (error) {
        console.error('Failed to trigger Twilio Verify. Falling back to console log:', error.message);
        const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`\n\n[FALLBACK-VERIFY-LOG]: Twilio Verify triggered for ${formattedPhone || phone}. Dev Code: ${fallbackOtp}\n\n`);
        return fallbackOtp;
    }
};

module.exports = sendVerifySms;
