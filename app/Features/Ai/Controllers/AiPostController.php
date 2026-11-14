<?php

namespace App\Features\Ai\Controllers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class AiPostController
{
    public function __construct(private AiClientInterface $ai, private PostService $posts) {}

    public function index(): Response
    {
        return Inertia::render('Dashboard/AiGenerator', ['categories' => PostCategory::options()]);
    }

    public function generate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:5'],
            'topic' => ['required', 'string', 'min:3', 'max:300'],
            'category' => ['required', 'string', 'in:'.implode(',', array_keys(PostCategory::options()))],
        ]);

        try {
            $generated = $this->ai->generate((int) $data['count'], $data['topic'], $data['category']);
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors(['generation' => $exception instanceof RuntimeException ? $exception->getMessage() : 'Artikel gagal dibuat. Periksa konfigurasi OpenAI lalu coba kembali.']);
        }

        return back()->with('generatedPosts', array_map(fn ($item) => $item->toArray(), $generated));
    }

    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'posts' => ['required', 'array', 'min:1', 'max:5'],
            'posts.*.title' => ['required', 'string', 'max:255'],
            'posts.*.category' => ['required', 'string', 'in:'.implode(',', array_keys(PostCategory::options()))],
            'posts.*.excerpt' => ['required', 'string', 'max:2000'],
            'posts.*.content' => ['required', 'string', 'max:100000'],
        ]);

        foreach ($data['posts'] as $post) {
            $this->posts->create($request->user(), $post);
        }

        return redirect()->route('dashboard.posts.index')->with('success', count($data['posts']).' artikel AI tersimpan sebagai draf.');
    }
}
