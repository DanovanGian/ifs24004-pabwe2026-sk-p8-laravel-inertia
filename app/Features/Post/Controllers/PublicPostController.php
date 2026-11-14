<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Services\PostService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController
{
    public function __construct(private PostService $posts) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'in:'.implode(',', array_keys(PostCategory::options()))],
        ]);

        return Inertia::render('Public/PostIndex', [
            'posts' => $this->posts->publicIndex($filters),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'categories' => PostCategory::options(),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    public function show(string $slug, Request $request): Response
    {
        return Inertia::render('Public/PostShow', [
            'post' => $this->posts->publicShow($slug),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }
}
