// src/hooks/useCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';

export const useAddCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<{ data: string }, Error, { name: string }>({
        mutationFn: async (category: { name: string }) => {
            return apiClient.post<{ data: string }>('/categories', category);
        },
        onSuccess: () => {
            // Invalidate categories query setelah berhasil menambah kategori
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
};