<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostController
{
    public function __construct(private PostService $posts, private PostExcelService $excel) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:120']]);
        $user = $request->user();
        $query = $user->posts();
        $stats = [
            'total' => (clone $query)->count(),
            'published' => (clone $query)->where('is_published', true)->count(),
            'drafts' => (clone $query)->where('is_published', false)->count(),
        ];

        return Inertia::render('Dashboard/PostIndex', [
            'posts' => $this->posts->indexForUser($user, $filters['search'] ?? null),
            'stats' => $stats,
            'search' => $filters['search'] ?? '',
            'categories' => PostCategory::options(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:'.implode(',', array_keys(PostCategory::options()))],
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'content' => ['required', 'string', 'max:100000'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        $this->posts->create($request->user(), $data);

        return back()->with('success', 'Artikel berhasil disimpan sebagai draf.');
    }

    public function show(Request $request, Post $post): Response
    {
        $this->authorize($request, 'view', $post);

        return Inertia::render('Dashboard/PostShow', [
            'post' => $this->posts->owned($request->user(), $post),
            'categories' => PostCategory::options(),
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $this->authorize($request, 'update', $post);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:'.implode(',', array_keys(PostCategory::options()))],
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'content' => ['required', 'string', 'max:100000'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        $this->posts->update($post, $data);

        return back()->with('success', 'Perubahan artikel berhasil disimpan.');
    }

    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $this->authorize($request, 'delete', $post);
        $this->posts->delete($post);

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil dihapus.');
    }

    public function publish(Request $request, Post $post): RedirectResponse
    {
        $this->authorize($request, 'update', $post);
        $updatedPost = $this->posts->togglePublication($post);

        return back()->with('success', $updatedPost->is_published ? 'Artikel berhasil dipublikasikan.' : 'Artikel dikembalikan menjadi draf.');
    }

    public function cover(Request $request, Post $post): RedirectResponse
    {
        $this->authorize($request, 'update', $post);
        $data = $request->validate(['cover' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);
        $this->posts->replaceCover($post, $data['cover']);

        return back()->with('success', 'Sampul artikel berhasil diperbarui.');
    }

    public function removeCover(Request $request, Post $post): RedirectResponse
    {
        $this->authorize($request, 'update', $post);
        $this->posts->removeCover($post);

        return back()->with('success', 'Sampul artikel dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->excel->download($this->posts->authorForExport($request->user()), 'blogverse-artikel-saya.xlsx');
    }

    public function import(Request $request): RedirectResponse
    {
        $data = $request->validate(['file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240']]);
        $count = $this->excel->import($data['file'], $request->user());

        return back()->with('success', $count.' artikel berhasil diimpor sebagai draf.');
    }

    private function authorize(Request $request, string $ability, Post $post): void
    {
        abort_unless($request->user()->can($ability, $post), 403);
    }
}
