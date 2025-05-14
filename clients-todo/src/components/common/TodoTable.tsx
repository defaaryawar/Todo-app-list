import React, { useMemo } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type Row,
    type CellContext,
} from '@tanstack/react-table';
import type { Todo, TodoStatus } from '../../types/todo.types';
import Pagination from './Pagination';

interface TodoTableProps {
    todos: Todo[];
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    onToggleTodoStatus: (todo: Todo) => void;
    onDeleteTodo: (id: string) => void;
    isDeleting: boolean;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    onPageChange: (page: number) => void;
}

const getNextStatusButtonText = (currentStatus: TodoStatus): string => {
    switch (currentStatus) {
        case 'pending': return 'Mulai';
        case 'in_progress': return 'Selesai';
        case 'completed': return 'Tunda';
        default: return 'Ubah';
    }
};

const TodoTable: React.FC<TodoTableProps> = ({
    todos,
    sorting,
    setSorting,
    onToggleTodoStatus,
    onDeleteTodo,
    isDeleting,
    meta,
    page,
    onPageChange
}) => {
    // Definisi kolom dengan tipe yang eksplisit dan penyesuaian responsif
    const columns = useMemo<ColumnDef<Todo, unknown>[]>(() => [
        {
            accessorKey: 'title',
            header: 'Judul',
            cell: (info: CellContext<Todo, unknown>) => (
                <div className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-xs">
                    {String(info.getValue() ?? '-')}
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Deskripsi',
            // Menyembunyikan deskripsi pada layar yang sangat kecil
            cell: (info: CellContext<Todo, unknown>) => (
                <span className="hidden sm:inline">
                    {String(info.getValue() ?? '-')}
                </span>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: (info: CellContext<Todo, unknown>) => (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {String(info.getValue() ?? '-')}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Dibuat',
            cell: (info: CellContext<Todo, unknown>) => {
                const raw = info.getValue();
                const dateStr = typeof raw === 'string' ? new Date(raw).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '-';
                return <span className="text-xs">{dateStr}</span>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info: CellContext<Todo, unknown>) => {
                const status = info.getValue() as TodoStatus;
                const statusConfig = {
                    completed: { className: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', label: 'Selesai' },
                    in_progress: { className: 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100', label: 'Proses' },
                    pending: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Tunda' }
                }[status] || { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Tunda' };

                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        {statusConfig.label}
                    </span>
                );
            },
        },
        {
            accessorKey: 'due_date',
            header: 'Tenggat',
            cell: (info: CellContext<Todo, unknown>) => {
                const raw = info.getValue();
                if (typeof raw !== 'string') return <span className="text-xs">-</span>;

                const date = new Date(raw);
                const now = new Date();
                const isPast = date < now;

                return (
                    <div className={`text-xs ${isPast ? 'text-red-600 font-medium dark:text-red-400' : ''}`}>
                        {date.toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: { row: Row<Todo> }) => {
                const todo = row.original;
                const statusClasses = {
                    completed: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300',
                    in_progress: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300',
                    pending: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                };

                return (
                    <div className="flex space-x-1 sm:space-x-2">
                        <button
                            onClick={() => onToggleTodoStatus(todo)}
                            className={`${statusClasses[todo.status] || statusClasses.pending} font-medium transition duration-150 ease-in-out text-xs sm:text-sm flex items-center`}
                        >
                            {getNextStatusButtonText(todo.status)}
                        </button>
                        <button
                            onClick={() => onDeleteTodo(todo.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition duration-150 ease-in-out text-xs sm:text-sm flex items-center"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </button>
                    </div>
                );
            },
        },
    ], [onToggleTodoStatus, onDeleteTodo, isDeleting]);

    const table = useReactTable({
        data: todos,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: meta?.last_page || 1,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
    });

    if (todos.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center cursor-pointer">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' 🔼',
                                                desc: ' 🔽',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {meta && meta.last_page > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={meta.last_page}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default TodoTable;