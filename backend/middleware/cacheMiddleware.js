const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default 5 minutes

const clearCache = (prefix) => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.startsWith(prefix)) {
            cache.del(key);
        }
    });
};

const cacheMiddleware = (durationStr = '5m') => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Calculate TTL in seconds
        let duration = 300; // 5 mins
        if (durationStr.endsWith('m')) {
            duration = parseInt(durationStr) * 60;
        } else if (durationStr.endsWith('h')) {
            duration = parseInt(durationStr) * 3600;
        }

        const key = req.originalUrl;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        } else {
            const originalJson = res.json;
            res.json = (body) => {
                // If it's a successful response, cache it
                if (res.statusCode === 200) {
                    cache.set(key, body, duration);
                }
                originalJson.call(res, body);
            };
            next();
        }
    };
};

module.exports = { cacheMiddleware, clearCache, cache };
