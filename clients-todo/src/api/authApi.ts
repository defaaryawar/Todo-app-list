// src/api/authApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getCsrfCookie } from './apiClient';
import type { AuthResponse, LoginCredentials, SignupCredentials, User } from '../types/auth.types';

// Constants for query keys
const AUTH_QUERY_KEYS = {
    user: ['authUser']
};

// Define context types for mutations
interface LogoutMutationContext {
    isLoggedIn?: boolean;
}

/**
 * Hook untuk login
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, LoginCredentials>({
        mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            await getCsrfCookie(); // Mendapatkan CSRF cookie sebelum login
            return apiClient.post<AuthResponse>('/auth/login', credentials);
        },
        onSuccess: (data) => {
            // Simpan token
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Pra-cache data user untuk menghindari request tambahan
            queryClient.setQueryData(AUTH_QUERY_KEYS.user, { user: data.user });
        },
        onError: (error) => {
            // Bersihkan token jika ada kesalahan
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            // Throw dengan pesan yang lebih informatif
            if (error instanceof Error) {
                throw new Error(`Login gagal: ${error.message}`);
            }
        }
    });
};

/**
 * Hook untuk registrasi
 */
export const useSignup = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, SignupCredentials>({
        mutationFn: async (credentials: SignupCredentials): Promise<AuthResponse> => {
            await getCsrfCookie(); // Mendapatkan CSRF cookie sebelum registrasi
            return apiClient.post<AuthResponse>('/auth/register', credentials);
        },
        onSuccess: (data) => {
            // Simpan token
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Pra-cache data user untuk menghindari request tambahan
            queryClient.setQueryData(AUTH_QUERY_KEYS.user, { user: data.user });
        },
        onError: (error) => {
            if (error instanceof Error) {
                throw new Error(`Registrasi gagal: ${error.message}`);
            }
        }
    });
};

/**
 * Hook untuk logout
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, void, LogoutMutationContext>({
        mutationFn: (): Promise<void> => {
            return apiClient.post<void>('/auth/logout');
        },
        onMutate: async () => {
            // Simpan snapshot status login sebelumnya untuk rollback jika error
            const isLoggedIn = !!localStorage.getItem('access_token');

            // Optimistic update - hapus data user dari cache
            queryClient.setQueryData(AUTH_QUERY_KEYS.user, null);

            return { isLoggedIn };
        },
        onSuccess: () => {
            // Hapus token dan bersihkan cache
            localStorage.clear();
            queryClient.clear();
        },
        onError: (_error, _variables, context) => {
            // Kembalikan state jika logout gagal
            if (context?.isLoggedIn) {
                queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
            }
        }
    });
};

/**
 * Hook untuk mendapatkan data user yang terautentikasi
 */
export const useAuthUser = () => {
    return useQuery<{ user: User }, Error>({
        queryKey: AUTH_QUERY_KEYS.user,
        queryFn: async (): Promise<{ user: User }> => {
            try {
                return await apiClient.get<{ user: User }>('/auth/user');
            } catch (error: any) {
                if (error?.status === 401) {
                    localStorage.removeItem('access_token');
                }
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error: any) => {
            if (error?.status === 401) return false;
            return failureCount < 3;
        },
        enabled: !!localStorage.getItem('access_token'),
    });
};

/**
 * Hook untuk mengubah password
 */
export const useChangePassword = () => {
    return useMutation<void, Error, { current_password: string; new_password: string; new_password_confirmation: string }>({
        mutationFn: async (data): Promise<void> => {
            return apiClient.post<void>('/auth/password/change', data);
        }
    });
};

/**
 * Hook untuk request reset password
 */
export const useForgotPassword = () => {
    return useMutation<void, Error, { email: string }>({
        mutationFn: async (data): Promise<void> => {
            await getCsrfCookie();
            return apiClient.post<void>('/auth/password/forgot', data);
        }
    });
};

/**
 * Hook untuk reset password
 */
export const useResetPassword = () => {
    return useMutation<void, Error, { token: string; email: string; password: string; password_confirmation: string }>({
        mutationFn: async (data): Promise<void> => {
            await getCsrfCookie();
            return apiClient.post<void>('/auth/password/reset', data);
        }
    });
};