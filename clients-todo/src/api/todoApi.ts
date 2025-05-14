// src/api/todoApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type {
    Todo,
    TodosResponse,
    CreateTodoInput,
    UpdateTodoInput,
    TodoQueryParams,
    CategoriesResponse,
    Category,
} from '../types/todo.types';

// Interface for category creation if not in types file
interface CreateCategoryInput {
    name: string;
}

// Define context types for mutations
interface TodoMutationContext {
    previousTodos?: TodosResponse;
    previousTodo?: { data: Todo };
}

interface CategoryMutationContext {
    previousCategories?: string[];
}

// Constants for query keys
const TODO_QUERY_KEYS = {
    todos: ['todos'],
    todo: (id: string) => ['todo', id],
    categories: ['categories']
};

/**
 * Hook to fetch todos with filtering and pagination
 */
export const useTodos = (params: TodoQueryParams = { page: 1, limit: 10 }) => {
    return useQuery<TodosResponse, Error>({
        queryKey: [...TODO_QUERY_KEYS.todos, params],
        queryFn: async (): Promise<TodosResponse> => {
            return apiClient.get<TodosResponse>('/todos', { params });
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        placeholderData: (previousData) => previousData,
        retry: (failureCount, error: any) => {
            // Don't retry on certain errors
            if (error?.status === 400 || error?.status === 404) return false;
            return failureCount < 3;
        }
    });
};

/**
 * Hook to fetch a single todo by ID
 */
export const useTodo = (id: string) => {
    return useQuery<{ data: Todo }, Error>({
        queryKey: TODO_QUERY_KEYS.todo(id),
        queryFn: async (): Promise<{ data: Todo }> => {
            return apiClient.get<{ data: Todo }>(`/todos/${id}`);
        },
        enabled: !!id, // Only fetch if ID exists
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.status === 404) return false;
            return failureCount < 2;
        }
    });
};

/**
 * Hook to create a new todo with optimistic updates
 */
export const useCreateTodo = () => {
    const queryClient = useQueryClient();

    return useMutation<{ data: Todo }, Error, CreateTodoInput, TodoMutationContext>({
        mutationFn: async (todo: CreateTodoInput): Promise<{ data: Todo }> => {
            return apiClient.post<{ data: Todo }>('/todos', todo);
        },
        // Optimistic update
        onMutate: async (newTodo) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.todos });
            
            // Snapshot the previous value
            const previousTodos = queryClient.getQueryData<TodosResponse>([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }]);
            
            // Optimistically update to the new value
            if (previousTodos) {
                queryClient.setQueryData<TodosResponse>([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }], {
                    ...previousTodos,
                    data: [
                        // Add fake ID for optimistic update
                        { id: `temp-${Date.now()}`, ...newTodo, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Todo,
                        ...previousTodos.data
                    ],
                    meta: previousTodos.meta
                });
            }
            
            // Return a context object with the snapshot
            return { previousTodos };
        },
        onError: (_error, _newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousTodos) {
                queryClient.setQueryData([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }], context.previousTodos);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.todos });
        }
    });
};

/**
 * Hook to update an existing todo with optimistic updates
 */
export const useUpdateTodo = () => {
    const queryClient = useQueryClient();

    return useMutation<{ data: Todo }, Error, UpdateTodoInput, TodoMutationContext>({
        mutationFn: async ({ id, ...data }: UpdateTodoInput): Promise<{ data: Todo }> => {
            return apiClient.put<{ data: Todo }>(`/todos/${id}`, data);
        },
        // Optimistic update
        onMutate: async (updatedTodo) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.todos });
            await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.todo(updatedTodo.id) });
            
            // Snapshot the previous values
            const previousTodos = queryClient.getQueryData<TodosResponse>([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }]);
            const previousTodo = queryClient.getQueryData<{ data: Todo }>(TODO_QUERY_KEYS.todo(updatedTodo.id));
            
            // Optimistically update to the new value
            if (previousTodos) {
                queryClient.setQueryData<TodosResponse>([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }], {
                    ...previousTodos,
                    data: previousTodos.data.map(todo => 
                        todo.id === updatedTodo.id ? { ...todo, ...updatedTodo, updated_at: new Date().toISOString() } : todo
                    )
                });
            }
            
            if (previousTodo) {
                queryClient.setQueryData<{ data: Todo }>(TODO_QUERY_KEYS.todo(updatedTodo.id), {
                    data: { ...previousTodo.data, ...updatedTodo, updated_at: new Date().toISOString() }
                });
            }
            
            // Return a context with the snapshot
            return { previousTodos, previousTodo };
        },
        onError: (_error, variables, context) => {
            // If the mutation fails, use the context to roll back
            if (context?.previousTodos) {
                queryClient.setQueryData([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }], context.previousTodos);
            }
            if (context?.previousTodo) {
                queryClient.setQueryData(TODO_QUERY_KEYS.todo(variables.id), context.previousTodo);
            }
        },
        onSettled: (_data, _error, variables) => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.todos });
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.todo(variables.id) });
        }
    });
};

/**
 * Hook to delete a todo with optimistic updates
 */
export const useDeleteTodo = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string, TodoMutationContext>({
        mutationFn: async (id: string): Promise<void> => {
            return apiClient.delete<void>(`/todos/${id}`);
        },
        // Optimistic update
        onMutate: async (deletedId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.todos });
            
            // Snapshot the previous value
            const previousTodos = queryClient.getQueryData<TodosResponse>([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }]);
            
            // Optimistically update by removing the todo
            if (previousTodos) {
                queryClient.setQueryData<TodosResponse>([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }], {
                    ...previousTodos,
                    data: previousTodos.data.filter(todo => todo.id !== deletedId)
                });
            }
            
            // Also remove from cache
            queryClient.removeQueries({ queryKey: TODO_QUERY_KEYS.todo(deletedId) });
            
            // Return a context with the snapshot
            return { previousTodos };
        },
        onError: (_error, _deletedId, context) => {
            // If the mutation fails, use the context to roll back
            if (context?.previousTodos) {
                queryClient.setQueryData([...TODO_QUERY_KEYS.todos, { page: 1, limit: 10 }], context.previousTodos);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.todos });
        }
    });
};

/**
 * Hook to fetch categories
 */
export const useCategories = () => {
    return useQuery<string[]>({
        queryKey: TODO_QUERY_KEYS.categories,
        queryFn: async (): Promise<string[]> => {
            const res = await apiClient.get<CategoriesResponse>('/categories');
            return res.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour cache
        retry: (failureCount) => failureCount < 2
    });
};

/**
 * Hook to add a new category with optimistic updates
 */
export const useAddCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<Category, Error, CreateCategoryInput, CategoryMutationContext>({
        mutationFn: async (category: CreateCategoryInput): Promise<Category> => {
            const res = await apiClient.post<{ data: Category }>('/categories', category);
            return res.data;
        },
        // Optimistic update
        onMutate: async (newCategory) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.categories });
            
            // Snapshot the previous value
            const previousCategories = queryClient.getQueryData<string[]>(TODO_QUERY_KEYS.categories);
            
            // Optimistically update to the new value
            if (previousCategories) {
                queryClient.setQueryData<string[]>(TODO_QUERY_KEYS.categories, [...previousCategories, newCategory.name]);
            }
            
            // Return a context with the snapshot
            return { previousCategories };
        },
        onError: (_error, _newCategory, context) => {
            // If the mutation fails, use the context to roll back
            if (context?.previousCategories) {
                queryClient.setQueryData(TODO_QUERY_KEYS.categories, context.previousCategories);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.categories });
        }
    });
};

/**
 * Hook to delete a category with optimistic updates
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string, CategoryMutationContext>({
        mutationFn: async (name: string): Promise<void> => {
            return apiClient.delete<void>(`/categories/${encodeURIComponent(name)}`);
        },
        // Optimistic update
        onMutate: async (deletedName) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.categories });
            
            // Snapshot the previous value
            const previousCategories = queryClient.getQueryData<string[]>(TODO_QUERY_KEYS.categories);
            
            // Optimistically update by removing the category
            if (previousCategories) {
                queryClient.setQueryData<string[]>(TODO_QUERY_KEYS.categories, 
                    previousCategories.filter(category => category !== deletedName)
                );
            }
            
            // Return a context with the snapshot
            return { previousCategories };
        },
        onError: (_error, _deletedName, context) => {
            // If the mutation fails, use the context to roll back
            if (context?.previousCategories) {
                queryClient.setQueryData(TODO_QUERY_KEYS.categories, context.previousCategories);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.categories });
            queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEYS.todos });
        }
    });
};