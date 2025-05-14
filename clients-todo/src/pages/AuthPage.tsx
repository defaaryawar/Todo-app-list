import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useState } from 'react';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    const switchAuthModeHandler = () => {
        setIsLogin((prevState) => !prevState);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome {isLogin ? 'Back' : ''}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {isLogin ? 'Sign in to your account' : 'Create a new account to get started'}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden dark:shadow-gray-900/50">
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isLogin 
                                            ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                                    }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        !isLogin 
                                            ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                                    }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        {isLogin ? <LoginForm /> : <SignupForm />}

                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            {isLogin ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={switchAuthModeHandler}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={switchAuthModeHandler}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;