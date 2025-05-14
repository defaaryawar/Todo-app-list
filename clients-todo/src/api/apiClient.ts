// src/api/apiClient.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

// Definisikan tipe untuk response error
interface ApiErrorResponse {
    message?: string;
    [key: string]: any; // Untuk properti tambahan
}

// URL basis sesuai dengan konfigurasi Laravel
const BASE_URL = 'http://localhost:8000';

// Membuat instance axios
const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true // Penting untuk mengirim cookies
});

// Fungsi untuk mendapatkan CSRF cookie
export const getCsrfCookie = async (): Promise<void> => {
    try {
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
            withCredentials: true
        });
    } catch (error) {
        throw new Error('Gagal mendapatkan CSRF cookie');
    }
};

// Request Interceptor - menambahkan token ke setiap request
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - handling refresh token jika terjadi 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                
                if (!refreshToken) {
                    localStorage.clear();
                    window.location.href = '/auth';
                    return Promise.reject(new Error('Tidak ada refresh token'));
                }
                
                const response = await axios.post<{
                    access_token: string;
                    refresh_token: string;
                }>(
                    `${BASE_URL}/api/auth/refresh`,
                    { refresh_token: refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        withCredentials: true
                    }
                );
                
                const { access_token, refresh_token } = response.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                
                // Ulangi request dengan token baru
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }
                
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }
        
        // Format error untuk memudahkan handling di sisi client
        const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan pada server';
        const formattedError = new Error(errorMessage);
        
        // Tambahkan informasi tambahan ke objek error
        Object.assign(formattedError, {
            status: error.response?.status,
            data: error.response?.data,
            originalError: error
        });
        
        return Promise.reject(formattedError);
    }
);

// Helper methods untuk berbagai HTTP methods
export const apiClient = {
    get: async <T>(url: string, options?: { params?: Record<string, any> }): Promise<T> => {
        try {
            await getCsrfCookie();
            
            const queryConfig: AxiosRequestConfig = { params: {} };
            
            if (options?.params) {
                Object.entries(options.params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        // Handle special cases for Spatie QueryBuilder
                        if (key === 'title' || key === 'search') {
                            queryConfig.params['filter[title]'] = value.toString();
                        } else if (key === 'status' || key === 'category') {
                            queryConfig.params[`filter[${key}]`] = value.toString();
                        } else if (key === 'sort_by' && options.params?.sort_direction) {
                            const prefix = options.params?.sort_direction === 'desc' ? '-' : '';
                            queryConfig.params['sort'] = `${prefix}${value}`;
                        } else if (key !== 'sort_direction') {
                            queryConfig.params[key] = value.toString();
                        }
                    }
                });
            }
            
            console.log('Final API request params:', queryConfig.params); // Debug log
            
            const response: AxiosResponse<T> = await axiosInstance.get(url, queryConfig);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    post: async <T>(url: string, data?: any): Promise<T> => {
        try {
            await getCsrfCookie();
            const response: AxiosResponse<T> = await axiosInstance.post(url, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    put: async <T>(url: string, data?: any): Promise<T> => {
        try {
            await getCsrfCookie();
            const response: AxiosResponse<T> = await axiosInstance.put(url, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    patch: async <T>(url: string, data?: any): Promise<T> => {
        try {
            await getCsrfCookie();
            const response: AxiosResponse<T> = await axiosInstance.patch(url, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async <T>(url: string): Promise<T> => {
        try {
            await getCsrfCookie();
            const response: AxiosResponse<T> = await axiosInstance.delete(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};