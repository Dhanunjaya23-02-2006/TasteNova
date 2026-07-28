const twilio = require('twilio');

const verifySmsCode = async (phone, code) => {
    let formattedPhone = phone;

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
            // In local fallback mode without credentials, we let the controller handle validation 
            // of the code that it stored in the database temporarily. 
            return { status: 'pending' };
        }

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks
            .create({ to: formattedPhone, code: code });

        return verificationCheck;

    } catch (error) {
        console.error('Failed to verify code using Twilio:', error.message);
        return { status: 'failed' };
    }
};

module.exports = verifySmsCode;
