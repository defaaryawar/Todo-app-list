import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTodos, useUpdateTodo, useCategories } from '../api/todoApi';
import { Link } from 'react-router-dom';
import type { Todo, TodoStatus } from '../types/todo.types';
import { toast } from '../components/ui/use-toast';
import TodoFilters from '../components/common/TodoFilters';
import { Button } from '../components/ui/button';
import {
    ClipboardList,
    CheckCircle,
    Loader2,
    Clock,
    Eye,
    Plus,
    ChevronDown,
    ChevronUp,
    Sliders,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'desc'
    });

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        category: '',
    });

    // State for statistics
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
    });

    const direction = ['asc', 'desc'].includes(sortConfig.direction)
        ? sortConfig.direction
        : undefined;

    // Fetch todos for statistics with increased limit
    const { data: todosResponse, isLoading } = useTodos({
        limit: 100,
        sort_by: sortConfig.key,
        sort_direction: direction as 'asc' | 'desc' | undefined,
        page: 0,
    });

    // Fetch categories
    const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategories();
    const categories = useMemo(() => {
        return Array.isArray(categoriesResponse) ? categoriesResponse : [];
    }, [categoriesResponse]);

    // Update todo mutation
    const updateTodoMutation = useUpdateTodo();

    // Calculate statistics whenever todos change
    useEffect(() => {
        if (todosResponse?.data) {
            const todos = todosResponse.data;
            setStats({
                total: todos.length,
                completed: todos.filter((t) => t.status === 'completed').length,
                pending: todos.filter((t) => t.status === 'pending').length,
                inProgress: todos.filter((t) => t.status === 'in_progress').length,
            });
        }
    }, [todosResponse]);

    // Handle sorting
    const handleSort = useCallback((key: string) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    // Handle status change
    const handleStatusChange = async (todo: Todo, newStatus: TodoStatus) => {
        try {
            await updateTodoMutation.mutateAsync({
                id: todo.id,
                status: newStatus
            });
            setIsEditing(null);
            toast({
                title: 'Success',
                description: `Tugas ditandai sebagai ${newStatus.replace('_', ' ')}`,
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal memperbarui status tugas',
            });
        }
    };

    // Handle filter changes
    const handleFilterChange = (newFilters: React.SetStateAction<{ search: string; status: string; category: string; }>) => {
        setFilters(newFilters);
    };

    // Filter todos based on filters
    const filteredTodos = useMemo(() => {
        if (!todosResponse?.data) return [];

        return todosResponse.data.filter(todo => {
            const matchesSearch = filters.search === '' ||
                todo.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                (todo.description && todo.description.toLowerCase().includes(filters.search.toLowerCase()));

            const matchesCategory = filters.category === '' || todo.category === filters.category;

            const matchesStatus = filters.status === '' || todo.status === filters.status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [todosResponse?.data, filters]);

    // Get recent and in-progress todos
    const recentTodos = useMemo(() => {
        return filteredTodos.slice(0, 6);
    }, [filteredTodos]);

    const inProgressTodos = useMemo(() => {
        return filteredTodos
            .filter(todo => todo.status === 'in_progress' || (filters.status && todo.status === filters.status))
            .sort((a, b) => {
                if (a.due_date && b.due_date) {
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                }
                return 0;
            });
    }, [filteredTodos, filters.status]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full py-20">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Selamat datang kembali, {user?.name || 'Pengguna'}!</h1>
                <p className="text-gray-600 dark:text-gray-300">Berikut adalah ringkasan tugas Anda.</p>
            </div>
            <div className='md:mb-4 mb-4'>
                {/* Filters Section */}
                <TodoFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    categories={categories}
                    isLoading={isLoadingCategories}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {[
                    { label: 'Total Tugas', value: stats.total, color: 'bg-indigo-500', icon: <ClipboardList className="h-5 w-5" /> },
                    { label: 'Selesai', value: stats.completed, color: 'bg-green-500', icon: <CheckCircle className="h-5 w-5" /> },
                    { label: 'Dalam Proses', value: stats.inProgress, color: 'bg-blue-500', icon: <Loader2 className="h-5 w-5 animate-spin" /> },
                    { label: 'Tertunda', value: stats.pending, color: 'bg-yellow-500', icon: <Clock className="h-5 w-5" /> },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="flex items-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow hover:shadow-lg transition-shadow"
                    >
                        <div
                            className={`p-2 sm:p-4 rounded-full text-lg sm:text-2xl text-white mr-3 sm:mr-4 ${card.color}`}
                        >
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                            <p className="text-xl sm:text-3xl font-semibold">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link to="/todos" className="flex items-center justify-center w-full">
                        <Eye className="mr-2 h-4 w-4" /> Lihat Semua Tugas
                    </Link>
                </Button>
                <Button asChild variant="blue" className="w-full sm:w-auto">
                    <Link to="/todos" state={{ openNewTodoForm: true }} className="flex items-center justify-center w-full">
                        <Plus className="mr-2 h-4 w-4" /> Buat Tugas Baru
                    </Link>
                </Button>
            </div>

            {/* In Progress Tasks with Sort */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Tugas Dalam Proses
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSort('due_date')}
                            className="ml-2"
                            title="Urutkan berdasarkan tanggal jatuh tempo"
                        >
                            {sortConfig.key === 'due_date' ?
                                (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) :
                                <Sliders className="h-4 w-4" />}
                        </Button>
                    </h2>
                </div>
                {inProgressTodos.length === 0 ? (
                    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow text-center text-gray-500 dark:text-gray-400">
                        Tidak ada tugas dalam proses. Pertahankan kerja bagus!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Tugas</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Kategori</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Tanggal Jatuh Tempo</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inProgressTodos.map((todo) => (
                                    <tr key={todo.id} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{todo.title}</div>
                                            {todo.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    {todo.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                                                {todo.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {todo.due_date ?
                                                new Date(todo.due_date).toLocaleDateString() :
                                                "Tidak ada tanggal jatuh tempo"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing === todo.id ? (
                                                <div className="flex gap-2">
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(todo, 'completed')} color="green">
                                                        Selesai
                                                    </Button>
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(todo, 'in_progress')} color="blue">
                                                        Dalam Proses
                                                    </Button>
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(todo, 'pending')} color="yellow">
                                                        Tertunda
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => setIsEditing(null)}>
                                                        Batal
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => setIsEditing(todo.id)}>
                                                    Ubah Status
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Tasks */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                        <Clock className="mr-2 h-6 w-6" /> Tugas Terbaru
                    </h2>
                    <Button asChild variant="link" size="sm">
                        <Link to="/todos">
                            Lihat Semua
                        </Link>
                    </Button>
                </div>
                {recentTodos.length === 0 ? (
                    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow text-center text-gray-500 dark:text-gray-400">
                        Belum ada tugas. Mulailah dengan membuat tugas baru!
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentTodos.map((todo) => (
                            <li
                                key={todo.id}
                                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow p-4 sm:p-5 hover:shadow-lg transition"
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-1">
                                        <h3
                                            className={`text-base sm:text-lg font-semibold mb-1 ${todo.status === 'completed'
                                                ? 'line-through text-gray-400'
                                                : ''
                                                }`}
                                        >
                                            {todo.title}
                                        </h3>
                                        {todo.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {todo.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center mt-3 gap-2">
                                            <div>
                                                {todo.due_date ? (
                                                    <span className="text-xs sm:text-sm text-gray-500">Batas Waktu: {new Date(todo.due_date).toLocaleDateString()}</span>
                                                ) : (
                                                    <span className="text-xs sm:text-sm text-gray-500">Tidak ada batas waktu</span>
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${todo.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : todo.status === 'in_progress'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {todo.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                                                {todo.category}
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            {isEditing === todo.id ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(todo, 'completed')} color="green">
                                                        Selesai
                                                    </Button>
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(todo, 'in_progress')} color="blue">
                                                        Dalam Proses
                                                    </Button>
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(todo, 'pending')} color="yellow">
                                                        Tertunda
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}>
                                                        Batal
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => setIsEditing(todo.id)}>
                                                    Ubah Status
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* No Categories Warning */}
            {categories.length === 0 && (
                <div className="mb-6 p-4 text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                    Belum ada kategori yang dibuat. Contoh kategori yang bisa Anda buat: <strong>Umum</strong>, <strong>Mendesak</strong>, atau <strong>Penting</strong>.
                </div>
            )}
        </div>
    );
};

export default DashboardPage;