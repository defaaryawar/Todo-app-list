import React from 'react';
import type { PaginationProps } from '../../types/todo.types';
import { ArrowRight } from 'lucide-react'; // Import ikon yang diinginkan

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        pages.push(1);

        if (currentPage > 2) {
            pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages.filter((page, index, self) => self.indexOf(page) === index);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="w-full py-3 sm:py-5 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center">
            <div className="flex items-center space-x-2">
                {/* Tombol First */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-all ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    aria-label="Halaman pertama"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Tombol Previous */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-all ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    aria-label="Halaman sebelumnya"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Nomor Halaman */}
                <div className="inline-flex items-center justify-center rounded-md shadow-sm bg-white dark:bg-gray-800 p-1">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={`page-${index}`}>
                            {page === '...' ? (
                                <span className="px-2 flex items-center text-gray-500 dark:text-gray-400">
                                    &#8230;
                                </span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm rounded-md mx-0.5 focus:outline-none transition-all ${currentPage === page
                                            ? 'bg-blue-500 text-white font-medium shadow dark:bg-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    aria-label={`Halaman ${page}`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Tombol Next */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-all ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    aria-label="Halaman berikutnya"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Tombol Last */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-all ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    aria-label="Halaman terakhir"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Info Halaman (Mobile) */}
                <span className="text-sm text-gray-700 dark:text-gray-300 sm:hidden">
                    {currentPage} / {totalPages}
                </span>

                {/* Jump to Page (Desktop) */}
                <div className="hidden sm:flex items-center space-x-2 ml-4">
                    <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Halaman:</span>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            defaultValue={1} // Set default value to 1
                            className="w-16 p-1 pl-2 pr-2 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    const value = parseInt(target.value);
                                    if (!isNaN(value) && value >= 1 && value <= totalPages) {
                                        onPageChange(value);
                                        target.value = ''; // Clear input after navigating
                                    } else if (isNaN(value) || value < 1) {
                                        target.value = '1'; // Reset to 1 if invalid
                                        onPageChange(1);
                                    } else if (value > totalPages) {
                                        target.value = String(totalPages);
                                        onPageChange(totalPages);
                                    }
                                }
                            }}
                        />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">/ {totalPages}</span>
                </div>
            </div>
        </div>
    );
};

export default Pagination;