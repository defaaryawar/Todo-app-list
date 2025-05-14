// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useSignup, useLogout, useAuthUser } from '../api/authApi';
import type { LoginCredentials, SignupCredentials } from '../types/auth.types';

export const useAuth = () => {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState<Error | null>(null);
    const [signupError, setSignupError] = useState<Error | null>(null);

    // Menggunakan custom hooks dari authApi
    const loginMutation = useLogin();
    const signupMutation = useSignup();
    const logoutMutation = useLogout();
    const { data: userData, isLoading: isLoadingUser, error: userError, refetch: refetchUser } = useAuthUser();

    // Pengguna saat ini
    const user = userData?.user || null;
    const isAuthenticated = !!user;

    // Function untuk login
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setLoginError(null);
            await loginMutation.mutateAsync(credentials);
            await refetchUser();
            navigate('/dashboard');
        } catch (error) {
            setLoginError(error instanceof Error ? error : new Error('Login failed'));
        }
    }, [loginMutation, navigate, refetchUser]);

    // Function untuk signup
    const signup = useCallback(async (credentials: SignupCredentials) => {
        try {
            setSignupError(null);
            await signupMutation.mutateAsync(credentials);
            await refetchUser();
            navigate('/dashboard');
        } catch (error) {
            setSignupError(error instanceof Error ? error : new Error('Signup failed'));
        }
    }, [signupMutation, navigate, refetchUser]);

    // Function untuk logout
    const logout = useCallback(async () => {
        try {
            await logoutMutation.mutateAsync();
            navigate('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if server logout fails, clear local state
            localStorage.clear();
            navigate('/auth');
        }
    }, [logoutMutation, navigate]);

    // Cek apakah user authenticated pada mount
    useEffect(() => {
        if (localStorage.getItem('access_token') && !isAuthenticated && !isLoadingUser) {
            refetchUser();
        }
    }, [isAuthenticated, isLoadingUser, refetchUser]);

    return {
        user,
        isAuthenticated,
        isLoadingUser,
        userError,
        login,
        isLoggingIn: loginMutation.isPending,
        loginError,
        signup,
        isSigningUp: signupMutation.isPending,
        signupError,
        logout,
        isLoggingOut: logoutMutation.isPending
    };
};