import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { X } from 'lucide-react'; // Import ikon close

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800 dark:bg-gray-900 dark:text-white transition-colors">
            {/* Header */}
            <header className="bg-blue-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-semibold hover:opacity-90 transition duration-300">
                        📝 Todo App
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden sm:flex items-center gap-4 text-sm sm:text-base">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="hover:text-blue-200 transition">
                                    Dashboard
                                </Link>
                                <Link to="/todos" className="hover:text-blue-200 transition">
                                    Todos
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="hover:text-blue-200 transition"
                                >
                                    Logout
                                </Button>
                                <span className="ml-2 bg-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                                    {user.email}
                                </span>
                            </>
                        ) : (
                            <Link to="/auth" className="hover:text-blue-200 transition">
                                Login
                            </Link>
                        )}
                    </nav>

                    {/* Hamburger Icon for Mobile */}
                    <button
                        onClick={toggleMenu}
                        className="sm:hidden text-white focus:outline-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="sm:hidden bg-blue-600 text-white shadow-md py-3 rounded-b-lg transition transform origin-top duration-300">
                    <div className="flex justify-end px-4 mb-2">
                        <button onClick={toggleMenu} className="text-white focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col items-start px-4 space-y-2">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block py-2 px-4 text-lg hover:bg-blue-500 hover:bg-opacity-20 rounded-md transition"
                                    onClick={toggleMenu}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/todos"
                                    className="block py-2 px-4 text-lg hover:bg-blue-500 hover:bg-opacity-20 rounded-md transition"
                                    onClick={toggleMenu}
                                >
                                    Todos
                                </Link>
                                <Button
                                    onClick={() => {
                                        handleLogout();
                                        toggleMenu();
                                    }}
                                    variant="destructive"
                                    className="block py-2 px-4 text-lg hover:bg-blue-500 hover:bg-opacity-20 rounded-md transition"
                                >
                                    Logout
                                </Button>
                                <span className="bg-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm ml-4">
                                    {user.email}
                                </span>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="block py-2 px-4 text-lg hover:bg-blue-500 hover:bg-opacity-20 rounded-md transition"
                                onClick={toggleMenu}
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}

            {/* Main content */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Todo App. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;