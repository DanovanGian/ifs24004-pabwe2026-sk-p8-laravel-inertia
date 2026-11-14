<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Services\AdminUserService;
use App\Features\Post\Services\PostService;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController
{
    public function __construct(private AdminUserService $users, private PostService $posts) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:120']]);

        return Inertia::render('Admin/UserList', [
            'users' => $this->users->index($filters['search'] ?? null),
            'search' => $filters['search'] ?? '',
        ]);
    }

    public function posts(User $user): Response
    {
        return Inertia::render('Admin/UserPostList', [
            'user' => $user->only('id', 'name', 'username', 'email'),
            'posts' => $this->posts->adminAuthorIndex($user),
        ]);
    }
}
