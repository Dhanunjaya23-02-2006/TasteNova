const validateEnv = () => {
    const requiredVars = [
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];

    if (process.env.NODE_ENV === 'production') {
        requiredVars.push(
            'CORS_ORIGINS',
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET',
            'RAZORPAY_KEY_ID',
            'RAZORPAY_KEY_SECRET',
            'RAZORPAY_WEBHOOK_SECRET'
        );
    }

    const optionalVars = ['TWILIO_ACCOUNT_SID', 'SMTP_HOST'];

    const missingVars = requiredVars.filter(envVar => !process.env[envVar]);
    const missingOptional = optionalVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }

    if (missingOptional.length > 0 && process.env.NODE_ENV === 'production') {
        console.warn(`[WARNING] Missing optional environment variables (Features may be degraded): ${missingOptional.join(', ')}`);
    }
};

module.exports = validateEnv;
