// src/types/todo.types.ts
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export interface Todo {
    id: string;
    title: string;
    description?: string;
    status: TodoStatus;
    category: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface CreateTodoInput {
    title: string;
    description: string;
    status: TodoStatus;
    category: string;
    due_date?: string | null;
}

export interface UpdateTodoInput extends Partial<CreateTodoInput> {
    id: string;
}

export interface TodoFilters {
    status?: TodoStatus;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface TodosResponse {
    data: Todo[];
    meta: {
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
}

export interface TodoQueryParams {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    status?: TodoStatus;
    category?: string;
    start_date?: string;
    end_date?: string;
}

export type CategoriesResponse = {
    data: string[];
};

export interface Category {
    id: number;
    name: string;
    created_at: string;
}

// Add the missing CreateCategoryInput type
export interface CreateCategoryInput {
    name: string;
}

//props todo
export interface FilterState {
    status: string;
    category: string;
    search: string;
}

export interface TodoFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    categories: string[];
    isLoading: boolean;
}

export interface TodoFormProps {
    categories: string[];
    isLoading: boolean;
    isCreating: boolean;
    onCreateTodo: (todoData: {
        title: string;
        description: string;
        category: string;
        due_date: string | null;
    }) => Promise<void>;
    onCancel: () => void;
}

export interface TodoFormData {
    title: string;
    description: string;
    category: string;
    due_date: string | null;
}

export interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TodoFormData) => Promise<void>;
    categories: string[];
    isLoading: boolean;
    isSubmitting: boolean;
    initialData?: Partial<TodoFormData>;
    title?: string;
}

export interface TodoItemProps {
    todo: Todo;
    onToggleStatus: (todo: Todo) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isDeleting: boolean;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface CategoryListProps {
    categories: string[];
    isLoading: boolean;
}