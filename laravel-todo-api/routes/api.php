<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

/*
|---------------------------------------------------------------------------
| API Routes
|---------------------------------------------------------------------------
*/

// Mendapatkan cookie CSRF (penting untuk autentikasi menggunakan Sanctum)
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show'])->name('csrf-cookie');

// Auth routes (public routes, tidak memerlukan autentikasi)
Route::prefix('auth')->group(function () {

    // Rute untuk registrasi pengguna baru
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');

    // Rute untuk login pengguna
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

    // Rute untuk refresh token
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');

    // Rute yang dilindungi autentikasi (menggunakan Sanctum)
    Route::middleware('auth:sanctum')->group(function () {

        // Rute untuk logout pengguna
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

        // Rute untuk mendapatkan data pengguna yang sedang login
        Route::get('/user', [AuthController::class, 'user'])->name('auth.user');
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Rute untuk kategori
    Route::prefix('categories')->group(function () {
        // Mendapatkan semua kategori pengguna
        Route::get('/', [TodoController::class, 'categories'])->name('categories.index');
        
        // Menambahkan kategori baru
        Route::post('/', [TodoController::class, 'addCategory'])->name('categories.store');

        Route::delete('/{name}', [TodoController::class, 'deleteCategory'])->name('categories.destroy');
    });

    // Rute CRUD untuk tugas (Create, Read, Update, Delete)
    Route::apiResource('todos', TodoController::class)->names('todos');
});