import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/ui/use-toast";
import {
    useTodos as useTodosQuery,
    useCategories as useCategoriesQuery,
    useCreateTodo as useCreateTodoMutation,
    useUpdateTodo as useUpdateTodoMutation,
    useDeleteTodo as useDeleteTodoMutation
} from "../api/todoApi";
import type { CreateTodoInput, TodoQueryParams, UpdateTodoInput, Todo, TodosResponse, } from "../types/todo.types";

export const useTodos = (params: TodoQueryParams) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Menggunakan hooks dari todoApi.ts
    const todosQuery = useTodosQuery(params);
    const categoriesQuery = useCategoriesQuery();

    // Mutation untuk membuat todo baru
    const createTodoMutation = useCreateTodoMutation();

    // Mutation untuk mengupdate todo
    const updateTodoMutation = useUpdateTodoMutation();

    // Mutation untuk menghapus todo
    const deleteTodoMutation = useDeleteTodoMutation();

    // Wrapper untuk membuat todo dengan toast notifications
    const createTodo = async (todo: CreateTodoInput) => {
        try {
            await createTodoMutation.mutateAsync(todo);
            toast({
                title: "Success",
                description: "Todo created successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create todo",
            });
            throw error;
        }
    };

    // Wrapper untuk update todo dengan optimistic updates
    const updateTodo = async (updatedTodo: UpdateTodoInput) => {
        const previousTodos = queryClient.getQueryData<TodosResponse>(["todos", params]);

        // Optimistically update to the new value
        queryClient.setQueryData(["todos", params], (old: TodosResponse | undefined) => {
            if (!old) return old;
            return {
                ...old,
                data: old.data.map((todo: Todo) =>
                    todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
                ),
            };
        });

        try {
            await updateTodoMutation.mutateAsync(updatedTodo);
            toast({
                title: "Success",
                description: "Todo updated successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update todo",
            });

            // Roll back to the previous value if available
            if (previousTodos) {
                queryClient.setQueryData(["todos", params], previousTodos);
            }
            throw error;
        }
    };

    // Wrapper untuk delete todo dengan optimistic updates
    const deleteTodo = async (id: string) => {
        const previousTodos = queryClient.getQueryData<TodosResponse>(["todos", params]);

        // Optimistically remove the todo
        queryClient.setQueryData(["todos", params], (old: TodosResponse | undefined) => {
            if (!old) return old;
            return {
                ...old,
                data: old.data.filter((todo: Todo) => todo.id !== id),
            };
        });

        try {
            await deleteTodoMutation.mutateAsync(id);
            toast({
                title: "Success",
                description: "Todo deleted successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete todo",
            });

            // Roll back to the previous value if available
            if (previousTodos) {
                queryClient.setQueryData(["todos", params], previousTodos);
            }
            throw error;
        }
    };

    return {
        todos: todosQuery.data?.data || [],
        meta: todosQuery.data?.meta,
        isLoading: todosQuery.isLoading,
        isFetching: todosQuery.isFetching,
        error: todosQuery.error,

        categories: categoriesQuery.data || [],
        isLoadingCategories: categoriesQuery.isLoading,

        createTodo,
        isCreating: createTodoMutation.isPending,

        updateTodo,
        isUpdating: updateTodoMutation.isPending,

        deleteTodo,
        isDeleting: deleteTodoMutation.isPending,
    };
};
