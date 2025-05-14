<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\CreateCategoryRequest;
use App\Http\Requests\Todo\CreateTodoRequest;
use App\Http\Requests\Todo\UpdateTodoRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\TodoResource;
use App\Models\Category;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\Support\Facades\Log;


class TodoController extends Controller
{
    /**
     * Display a listing of the todos.
     */
    public function index(Request $request): AnonymousResourceCollection
{
    // Log semua parameter yang diterima dari request
    Log::info('Incoming request parameters:', $request->all());

    // Mengambil nilai filter 'search' (title)
    $filters = $request->input('filter', []);
    $titleFilter = isset($filters['status']) ? $filters['status'] : '';

    // Membuat query builder dengan filter yang diizinkan
    $todosQuery = QueryBuilder::for(Todo::class)
        ->where('user_id', $request->user()->id)
        ->allowedFilters([
            AllowedFilter::partial('title'), // Untuk pencarian
            AllowedFilter::exact('category'),
            AllowedFilter::exact('status'),
            AllowedFilter::scope('due_date_between'),
        ])
        ->allowedSorts(['title', 'created_at', 'due_date', 'status'])
        ->defaultSort('-created_at');
    
    // Log query yang dihasilkan (tanpa dieksekusi)
    Log::info('Generated query (before pagination):', ['query' => $todosQuery->toSql()]);

    // Paginasi hasil
    $todos = $todosQuery->paginate($request->input('per_page', 10))
        ->appends($request->query());

    return TodoResource::collection($todos);
}


    /**
     * Store a newly created todo.
     */
    public function store(CreateTodoRequest $request): JsonResponse
    {
        $todo = Todo::create([
            'user_id' => $request->user()->id,
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'Todo created successfully',
            'data' => new TodoResource($todo),
        ], 201);
    }

    /**
     * Display the specified todo.
     */
    public function show(Request $request, Todo $todo): JsonResponse
    {
        // Ensure user can only access their own todos
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'data' => new TodoResource($todo),
        ]);
    }

    /**
     * Update the specified todo.
     */
    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        // Authorization is handled in the form request

        $todo->update($request->validated());

        return response()->json([
            'message' => 'Todo updated successfully',
            'data' => new TodoResource($todo),
        ]);
    }

    /**
     * Remove the specified todo (soft delete).
     */
    public function destroy(Request $request, Todo $todo): JsonResponse
    {
        // Ensure user can only delete their own todos
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully',
        ]);
    }

    /**
     * Get all categories for the authenticated user
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = Category::where('user_id', $request->user()->id)
            ->orderBy('name')
            ->pluck('name')
            ->values();

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Add a new category for the authenticated user
     */
    public function addCategory(CreateCategoryRequest $request): JsonResponse
    {
        $category = Category::create([
            'user_id' => $request->user()->id,
            'name' => $request->validated()['name'],
        ]);

        return response()->json([
            'message' => 'Category added successfully',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function deleteCategory(Request $request, $name): JsonResponse
    {
        // Mencari kategori berdasarkan nama dan user_id
        $category = Category::where('user_id', $request->user()->id)
                            ->where('name', $name)
                            ->firstOrFail();

        // Menghapus kategori yang ditemukan
        $category->delete();

        // Mengembalikan respons sukses
        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}