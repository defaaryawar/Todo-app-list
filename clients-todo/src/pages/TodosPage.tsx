import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    useTodos,
    useUpdateTodo,
    useDeleteTodo,
    useCategories,
    useAddCategory,
    useDeleteCategory,
    useCreateTodo
} from '../api/todoApi';
import type { Todo, TodoStatus, TodoQueryParams } from '../types/todo.types';
import type { SortingState } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'; // Import ikon dari lucide-react

// Import components
import TodoFilters from '../components/common/TodoFilters';
import TodoModal from '../components/modal/TodoModal'; // Ganti TodoForm dengan TodoModal
import CategoryList from '../components/common/CategoryList';
import TodoTable from '../components/common/TodoTable';
import { toast } from '../components/ui/use-toast';

// Define FilterState interface
interface FilterState {
    status: string;
    category: string;
    search: string;
}

const TodosPage: React.FC = () => {
    useAuth();
    const [queryParams, setQueryParams] = useState<TodoQueryParams>({
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_direction: 'desc'
    });

    const [filters, setFilters] = useState<FilterState>({
        status: '',
        category: '',
        search: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false); // Ganti showForm dengan isModalOpen
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'created_at', desc: true }
    ]);

    const [showFilters, setShowFilters] = useState(false);
    const [showCategories, setShowCategories] = useState(false);

    // API hooks
    const {
        data: todosResponse,
        isLoading: isLoadingTodos,
        error: todosError
    } = useTodos(queryParams);

    const {
        data: categoriesResponse,
        isLoading: isLoadingCategories
    } = useCategories();

    // Mutations
    const createTodoMutation = useCreateTodo();
    const updateTodoMutation = useUpdateTodo();
    const deleteTodoMutation = useDeleteTodo();
    const { mutate: addCategory, isPending: isAddingCategory } = useAddCategory();
    const { mutate: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory();

    // Data from API
    const todos = todosResponse?.data || [];
    const meta = todosResponse?.meta;

    const availableCategories: string[] = Array.isArray(categoriesResponse) ? categoriesResponse : [];

    const handleCreateTodo: (todoData: {
        title: string;
        description: string;
        category: string;
        due_date: string | null;
    }) => Promise<void> = async (todoData) => {
        try {
            await createTodoMutation.mutateAsync({
                title: todoData.title,
                description: todoData.description,
                category: todoData.category,
                due_date: todoData.due_date,
                status: 'pending',
            });
            setIsModalOpen(false);
            toast({
                title: 'Success',
                description: 'Todo created successfully',
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create todo',
            });
            throw err;
        }
    };

    // Handler for toggling todo status
    const handleToggleTodoStatus = async (todo: Todo) => {
        let newStatus: TodoStatus;

        switch (todo.status) {
            case 'pending':
                newStatus = 'in_progress';
                break;
            case 'in_progress':
                newStatus = 'completed';
                break;
            case 'completed':
                newStatus = 'pending';
                break;
            default:
                newStatus = 'pending';
        }

        try {
            await updateTodoMutation.mutateAsync({
                id: todo.id,
                status: newStatus
            });
            toast({
                title: 'Success',
                description: `Todo marked as ${newStatus.replace('_', ' ')}`,
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update todo status',
            });
            throw err;
        }
    };

    // Handler for deleting todo
    const handleDeleteTodo = async (id: string) => {
        try {
            await deleteTodoMutation.mutateAsync(id);
            toast({
                title: 'Success',
                description: 'Todo deleted successfully',
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete todo',
            });
            throw err;
        }
    };

    // Handler for adding category
    const handleAddCategory = async (categoryName: string) => {
        try {
            await addCategory({ name: categoryName });
            toast({
                title: 'Success',
                description: 'Category added successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add category',
            });
        }
    };

    // Handler for deleting category
    const handleDeleteCategory = async (categoryName: string) => {
        try {
            await deleteCategory(categoryName);
            toast({
                title: 'Success',
                description: 'Category deleted successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete category',
            });
        }
    };

    // Handler for changing page
    const handlePageChange = (newPage: number) => {
        setQueryParams(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleFilterChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);
    }, []);

    useEffect(() => {
        setQueryParams(prev => ({
            ...prev,
            page: 1,
            search: filters.search,
            status: filters.status as TodoStatus || undefined,
            category: filters.category || undefined
        }));
    }, [filters]);

    // Apply sorting changes
    useEffect(() => {
        if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            setQueryParams(prev => ({
                ...prev,
                sort_by: id,
                sort_direction: desc ? 'desc' : 'asc'
            }));
        }
    }, [sorting]);

    // Loading state
    if (isLoadingTodos && !todos.length) {
        return (
            <div className="max-w-7xl mx-auto md:p-4 sm:p-3 p-1.5">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Todos</h1>
                </div>
                <div className="text-center py-10">Loading todos...</div>
            </div>
        );
    }

    // Error state
    if (todosError) {
        return (
            <div className="max-w-7xl mx-auto md:p-4 sm:p-3 p-1.5">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Todos</h1>
                </div>
                <div className="text-center py-10 text-red-500">
                    Error: {todosError.message}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto md:p-4 sm:p-3 p-1.5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Todos</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Todo
                    </button>
                </div>
            </div>

            {/* Tombol untuk membuka filter dan kategori */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm flex items-center"
                >
                    Filter
                    {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                </button>
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm flex items-center"
                >
                    Kategori
                    {showCategories ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                </button>
            </div>

            {/* Container untuk CategoryList dan TodoFilters - dikontrol oleh state showFilters dan showCategories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Category List Component */}
                <div className={`col-span-1 ${showCategories ? 'block' : 'hidden'}`}>
                    <CategoryList
                        categories={availableCategories}
                        isLoading={isLoadingCategories}
                        onAddCategory={handleAddCategory}
                        isAddingCategory={isAddingCategory}
                        onDeleteCategory={handleDeleteCategory}
                        isDeletingCategory={isDeletingCategory}
                    />
                    {!isLoadingCategories && availableCategories.length === 0 && (
                        <div className="mt-4 p-4 text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                            Belum ada kategori. Contoh kategori yang bisa kamu buat: <strong>General</strong>, <strong>Urgent</strong>, atau <strong>Important</strong>.
                        </div>
                    )}
                </div>

                {/* Todo Filters Component */}
                <div className={`col-span-1 ${showFilters ? 'block' : 'hidden'}`}>
                    <TodoFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        categories={availableCategories}
                        isLoading={isLoadingCategories}
                    />
                </div>
            </div>

            {/* Todo Modal */}
            <TodoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTodo}
                categories={availableCategories}
                isLoading={isLoadingCategories}
                isSubmitting={createTodoMutation.isPending}
                title="Tugas Baru"
            />

            {/* Empty state handling */}
            {todos.length === 0 ? (
                <div className="py-10 text-center dark:text-white text-gray-500 dark:bg-gray-800 bg-white rounded shadow p-6">
                    {filters.status || filters.category || filters.search ? (
                        <>
                            <p className="mb-2">No todos match your filters.</p>
                            <button
                                onClick={() => setFilters({ status: '', category: '', search: '' })}
                                className="text-blue-500 underline"
                            >
                                Clear filters
                            </button>
                        </>
                    ) : (
                        <>
                            No todos found. {!isModalOpen && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-blue-500 underline flex items-center justify-center gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add your first todo
                                </button>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* Todo Table Component */
                <TodoTable
                    todos={todos}
                    sorting={sorting}
                    setSorting={setSorting}
                    onToggleTodoStatus={handleToggleTodoStatus}
                    onDeleteTodo={handleDeleteTodo}
                    isDeleting={deleteTodoMutation.isPending}
                    meta={meta}
                    page={queryParams.page}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Todo stats */}
            {meta && todos.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-500">
                        <span>
                            Pending: {todos.filter(t => t.status === 'pending').length}
                        </span>
                    </div>
                    <div className="text-yellow-600">
                        <span>
                            In Progress: {todos.filter(t => t.status === 'in_progress').length}
                        </span>
                    </div>
                    <div className="text-green-600">
                        <span>
                            Completed: {todos.filter(t => t.status === 'completed').length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodosPage;