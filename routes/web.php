<?php

use App\Features\Admin\Controllers\AdminPostController;
use App\Features\Admin\Controllers\AdminUserController;
use App\Features\Ai\Controllers\AiPostController;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Post\Controllers\PostController;
use App\Features\Post\Controllers\PublicPostController;
use App\Features\Profile\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'createLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
    Route::get('/register', [AuthController::class, 'createRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->prefix('profile')->name('profile.')->group(function (): void {
    Route::get('/', [ProfileController::class, 'edit'])->name('edit');
    Route::put('/', [ProfileController::class, 'update'])->name('update');
    Route::post('/photo', [ProfileController::class, 'photo'])->name('photo');
    Route::delete('/photo', [ProfileController::class, 'removePhoto'])->name('photo.destroy');
});

Route::middleware(['auth', 'role:member'])->prefix('dashboard')->name('dashboard.')->group(function (): void {
    Route::get('/posts/ai', [AiPostController::class, 'index'])->name('posts.ai');
    Route::post('/posts/ai-generate', [AiPostController::class, 'generate'])->name('posts.ai-generate');
    Route::post('/posts/ai-save', [AiPostController::class, 'save'])->name('posts.ai-save');
    Route::get('/posts/export', [PostController::class, 'export'])->name('posts.export');
    Route::post('/posts/import', [PostController::class, 'import'])->name('posts.import');
    Route::patch('/posts/{post}/publish', [PostController::class, 'publish'])->name('posts.publish');
    Route::post('/posts/{post}/cover', [PostController::class, 'cover'])->name('posts.cover');
    Route::delete('/posts/{post}/cover', [PostController::class, 'removeCover'])->name('posts.cover.destroy');
    Route::resource('/posts', PostController::class)->except(['create', 'edit']);
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/posts/export', [AdminPostController::class, 'export'])->name('posts.export');
    Route::get('/users/{user}/posts/export', [AdminPostController::class, 'exportUser'])->name('users.posts.export');
    Route::get('/posts', [AdminPostController::class, 'index'])->name('posts.index');
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}/posts', [AdminUserController::class, 'posts'])->name('users.posts.index');
});

Route::get('/', [PublicPostController::class, 'index'])->name('home');
Route::get('/articles', [PublicPostController::class, 'index'])->name('articles.index');
Route::get('/articles/{slug}', [PublicPostController::class, 'show'])->name('articles.show');
