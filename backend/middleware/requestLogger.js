const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
        };

        if (process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(logData));
        } else {
            const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, Green for success
            const reset = '\x1b[0m';
            console.log(`[${new Date().toISOString()}] ${logData.method} ${logData.url} ${color}${logData.status}${reset} - ${logData.duration}`);
        }
    });

    next();
};

module.exports = requestLogger;
