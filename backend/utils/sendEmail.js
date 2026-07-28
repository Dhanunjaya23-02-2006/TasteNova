const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Basic configured generic Nodemailer test transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io', // Placeholder host
        port: process.env.SMTP_PORT || 2525,
        auth: {
            user: process.env.SMTP_EMAIL || 'test_user',
            pass: process.env.SMTP_PASSWORD || 'test_password'
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'TasteNova'} <${process.env.FROM_EMAIL || 'noreply@tastenova.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    try {
        await transporter.sendMail(message);
    } catch (error) {
        console.error("Email failed to send. Check SMTP credentials. Falling back to console log:");
        console.log(`\n\n[FALLBACK-EMAIL-LOG]: Sending email to: ${options.email}`);
        console.log(`[FALLBACK-EMAIL-LOG]: Subject: ${options.subject}`);
        console.log(`[FALLBACK-EMAIL-LOG]: Content: ${options.message}\n\n`);
    }
};

module.exports = sendEmail;
