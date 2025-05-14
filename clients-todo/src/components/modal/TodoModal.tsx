import React, { useState, useEffect } from 'react';
import { X, FilePlus, Calendar, Tag, File } from 'lucide-react';
import type { TodoModalProps, TodoFormData } from '../../types/todo.types';

const TodoModal: React.FC<TodoModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    categories,
    isLoading,
    isSubmitting,
    initialData,
    title = 'Tugas Baru'
}) => {
    // Form state
    const [formData, setFormData] = useState<TodoFormData>({
        title: '',
        description: '',
        category: '',
        due_date: null
    });

    // Validation errors
    const [errors, setErrors] = useState<{
        title?: string;
        category?: string;
    }>({});

    // Today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                category: initialData.category || '',
                due_date: initialData.due_date || null
            });
            setErrors({});
        } else if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                title: '',
                description: '',
                category: '',
                due_date: null
            });
            setErrors({});
        }
    }, [isOpen, initialData]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user types
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Form validation
    const validate = (): boolean => {
        const newErrors: { title?: string; category?: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Judul harus diisi';
        }

        if (!formData.category) {
            newErrors.category = 'Silakan pilih kategori';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit({
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category || 'Umum',
                due_date: formData.due_date
            });

            // Form will be reset when modal closes via the useEffect
        } catch (err) {
            console.error('Error saat mengirim data:', err);
        }
    };

    // Don't render anything if modal is closed
    if (!isOpen) return null;

    return (
        <>
            {/* Modal backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 flex items-center justify-center p-4 overflow-y-auto">
                {/* Modal content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md transform transition-all animate-fade-in-up">
                    {/* Modal header */}
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <FilePlus className="h-5 w-5 text-blue-500" />
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                            disabled={isSubmitting}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Modal body */}
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Judul <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Masukkan judul tugas"
                                    className={`w-full p-2 pl-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all ${errors.title ? 'border-red-500 focus:ring-red-500' : ''
                                        }`}
                                    disabled={isSubmitting || isLoading}
                                />
                                <File className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" />
                            </div>
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Deskripsi
                            </label>
                            <div className="relative">
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Masukkan deskripsi tugas"
                                    className="w-full p-2 pl-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all"
                                    rows={3}
                                    disabled={isSubmitting || isLoading}
                                />
                                <File className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={`w-full p-2 pl-8 text-sm border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all ${errors.category ? 'border-red-500 focus:ring-red-500' : ''
                                            }`}
                                        disabled={isSubmitting || isLoading || categories.length === 0}
                                    >
                                        <option value="">Pilih kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <Tag className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 absolute right-2.5 top-3 text-gray-400 pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                {categories.length === 0 && (
                                    <p className="text-amber-600 text-xs mt-1">Harap buat kategori terlebih dahulu</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="due_date" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Tenggat Waktu
                                </label>
                                <div className="relative">
                                    <input
                                        id="due_date"
                                        name="due_date"
                                        type="date"
                                        value={formData.due_date || ''}
                                        onChange={handleChange}
                                        min={today}
                                        className="w-full p-2 pl-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all"
                                        disabled={isSubmitting || isLoading}
                                    />
                                    <Calendar className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-xs mt-1 dark:text-gray-400">
                                    Opsional. Biarkan kosong jika tidak ada tenggat.
                                </p>
                            </div>
                        </div>

                        {/* Modal footer with actions */}
                        <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-gray-500 transition-all"
                                disabled={isSubmitting}
                            >
                                <span className="flex items-center justify-center gap-1">
                                    <X className="h-4 w-4" />
                                    Batal
                                </span>
                            </button>

                            <button
                                type="submit"
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300 text-sm shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-500 dark:focus:ring-green-400 transition-all"
                                disabled={isSubmitting || isLoading || categories.length === 0}
                            >
                                <span className="flex items-center justify-center gap-1">
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Simpan Tugas
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default TodoModal;