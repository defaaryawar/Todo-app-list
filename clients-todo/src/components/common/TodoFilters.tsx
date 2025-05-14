import React, { useEffect, useState, useCallback } from 'react';
import type { TodoFiltersProps } from '../../types/todo.types';

const TodoFilters: React.FC<TodoFiltersProps> = ({
    filters,
    onFilterChange,
    categories,
    isLoading
}) => {
    // State lokal untuk debounce pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search);

    // Handler untuk memperbarui filter
    const handleFilterChange = useCallback((key: string, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value
        });
    }, [filters, onFilterChange]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                console.log('Memperbarui filter pencarian: ', searchTerm); // Log untuk debug
                handleFilterChange('search', searchTerm);
            }
        }, 500); // 500ms debounce delay

        return () => clearTimeout(timer);
    }, [searchTerm, filters.search, handleFilterChange]);

    // Handler untuk reset semua filter
    const handleResetFilters = () => {
        setSearchTerm(''); // Reset pencarian lokal
        onFilterChange({
            status: '',
            category: '',
            search: '',
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-md transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
                <h2 className="font-semibold text-base md:text-lg text-gray-800 dark:text-white">Filter Tugas</h2>
                {(filters.status || filters.category || filters.search) && (
                    <button
                        onClick={handleResetFilters}
                        className="text-xs md:text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        aria-label="Reset semua filter"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reset Filter
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4">
                {/* Input Pencarian */}
                <div className="flex flex-col">
                    <label htmlFor="search" className="text-xs md:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Cari
                    </label>
                    <div className="relative">
                        <input
                            id="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari berdasarkan judul..."
                            className="w-full p-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400 transition-all"
                            disabled={isLoading}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Kontainer untuk Status dan Kategori */}
                <div className="flex gap-3 md:gap-4">
                    {/* Filter Status */}
                    <div className="flex flex-col flex-1">
                        <label htmlFor="status" className="text-xs md:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                id="status"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full p-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400 transition-all"
                                disabled={isLoading}
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Tertunda</option>
                                <option value="in_progress">Dalam Proses</option>
                                <option value="completed">Selesai</option>
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-2.5 top-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Filter Kategori */}
                    <div className="flex flex-col flex-1">
                        <label htmlFor="category" className="text-xs md:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Kategori
                        </label>
                        <div className="relative">
                            <select
                                id="category"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full p-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400 transition-all"
                                disabled={isLoading || !categories.length}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-2.5 top-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center text-gray-500 dark:text-gray-400 mt-4 text-xs md:text-sm col-span-full">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat kategori...
                </div>
            )}
        </div>
    );
};

export default TodoFilters;