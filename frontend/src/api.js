import axios from 'axios';
import { API_URL } from './config';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor: handle 401 → refresh → retry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh if we're already calling auth endpoints
            if (originalRequest.url?.includes('/auth/')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Read refreshToken from localStorage and send it in the body
                const storedUser = localStorage.getItem('userInfo');
                const refreshToken = storedUser ? JSON.parse(storedUser).refreshToken : null;

                if (!refreshToken) {
                    // No refresh token stored — session is stale, force re-login
                    processQueue(new Error('Session expired'), null);
                    window.dispatchEvent(new Event('auth:logout'));
                    isRefreshing = false;
                    return Promise.reject(error);
                }

                const { data } = await axios.post(
                    `${API_URL}/auth/refresh`,
                    { refreshToken },
                    { withCredentials: true }
                );

                // Update the stored access token in localStorage
                if (data.accessToken && storedUser) {
                    const parsed = JSON.parse(storedUser);
                    parsed.token = data.accessToken;
                    localStorage.setItem('userInfo', JSON.stringify(parsed));
                }

                processQueue(null, data.accessToken);
                // Update the original request's Authorization header with the new token
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Refresh token failed — force logout
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
