import React, { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { PlusCircle, X, Loader2 } from 'lucide-react'; // Impor ikon dari lucide-react

interface CategoryListProps {
    categories: string[];
    isLoading: boolean;
    onAddCategory: (categoryName: string) => void;
    isAddingCategory: boolean;
    onDeleteCategory: (categoryName: string) => void;
    isDeletingCategory: boolean;
    defaultCategories?: string[];
}

const CategoryList: React.FC<CategoryListProps> = ({
    categories,
    isLoading,
    onAddCategory,
    isAddingCategory,
    onDeleteCategory,
    isDeletingCategory,
    defaultCategories = ['General', 'Urgent', 'Important']
}) => {
    const { toast } = useToast();
    const [newCategory, setNewCategory] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState<boolean>(true); // State untuk accordion

    // Menangani penambahan kategori baru
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Nama kategori tidak boleh kosong',
            });
            return;
        }

        if (categories.includes(newCategory)) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Kategori sudah ada',
            });
            return;
        }

        try {
            await onAddCategory(newCategory);
            setNewCategory('');
            toast({
                title: 'Berhasil',
                description: 'Kategori berhasil ditambahkan',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal menambahkan kategori',
            });
        }
    };

    // Menangani penghapusan kategori
    const handleDeleteCategory = async (categoryName: string) => {
        if (defaultCategories.includes(categoryName)) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Kategori default tidak dapat dihapus',
            });
            return;
        }

        try {
            await onDeleteCategory(categoryName);
            toast({
                title: 'Berhasil',
                description: 'Kategori berhasil dihapus',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal menghapus kategori',
            });
        }
    };

    // Tampilan loading
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600 dark:text-gray-300">Memuat kategori...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 mb-6 overflow-hidden">
            {/* Header dengan toggle */}
            <div
                className="flex justify-between items-center p-6 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Kategori</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {categories.length}
                    </span>
                </div>

                <button className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors">
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Konten yang dapat ditoggle */}
            <div className={`px-6 pb-6 transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {/* Input untuk menambahkan kategori baru dengan desain modern */}
                <div className="mb-6">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Tambahkan kategori baru"
                            className="p-2.5 pl-3.5 pr-11 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all text-sm" // Sesuaikan padding dan ukuran teks
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <button
                            onClick={handleAddCategory}
                            disabled={isAddingCategory || !newCategory.trim()}
                            className="absolute right-1.5 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400 transition-colors" // Sesuaikan posisi tombol
                            title="Tambah kategori"
                        >
                            {isAddingCategory ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <PlusCircle className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Pesan saran jika tidak ada kategori */}
                {categories.length === 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Belum ada kategori. Contoh kategori yang bisa kamu buat:
                            <span className="font-medium ml-1">General, Urgent, Important</span>
                        </p>
                    </div>
                )}

                {/* Grid kategori dengan desain kartu modern */}
                {categories.length > 0 && (
                    <div>
                        <div className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                            Kategori Tersedia:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {categories.map((category) => (
                                <div
                                    key={category}
                                    className={`group relative flex justify-between items-center p-3 rounded-lg hover:shadow-md transition-all duration-200 ${defaultCategories.includes(category)
                                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/50'
                                        : ' dark:bg-gray-700 dark:hover:bg-gray-650 border border-gray-100 dark:border-gray-600'
                                        }`}
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {category}
                                    </span>
                                    {!defaultCategories.includes(category) && (
                                        <button
                                            onClick={() => handleDeleteCategory(category)}
                                            disabled={isDeletingCategory}
                                            className="text-gray-400 group-hover:text-red-500 hover:text-red-600 disabled:text-gray-300 transition-colors rounded-full cursor-pointer"
                                            title="Hapus kategori"
                                        >
                                            {isDeletingCategory ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryList;