<?php

namespace App\Features\Admin\Controllers;

use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPostController
{
    public function __construct(private PostService $posts, private PostExcelService $excel) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:120']]);

        return Inertia::render('Admin/PostList', [
            'posts' => $this->posts->adminIndex($filters['search'] ?? null),
            'search' => $filters['search'] ?? '',
        ]);
    }

    public function export(): StreamedResponse
    {
        return $this->excel->download($this->posts->allForExport(), 'blogverse-semua-artikel.xlsx');
    }

    public function exportUser(User $user): StreamedResponse
    {
        return $this->excel->download($this->posts->authorForExport($user), 'blogverse-'.$user->username.'-artikel.xlsx');
    }
}
