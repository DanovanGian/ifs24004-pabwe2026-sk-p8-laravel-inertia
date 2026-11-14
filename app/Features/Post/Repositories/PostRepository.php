<?php

namespace App\Features\Post\Repositories;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PostRepository implements PostRepositoryInterface
{
    /** @param array{search?: string|null, category?: string|null} $filters */
    public function published(array $filters = []): LengthAwarePaginator
    {
        $query = Post::query()
            ->published()
            ->with('user:id,name')
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $term = '%'.mb_strtolower($search).'%';
            $query->where(function ($posts) use ($term): void {
                $posts->where(DB::raw('LOWER(title)'), 'like', $term)
                    ->orWhere(DB::raw('LOWER(content)'), 'like', $term)
                    ->orWhere(DB::raw('LOWER(excerpt)'), 'like', $term);
            });
        }

        if (($filters['category'] ?? '') !== '') {
            $query->where('category', $filters['category']);
        }

        return $query->paginate(9)->withQueryString();
    }

    public function findPublishedBySlug(string $slug): Post
    {
        return Post::query()->published()->with('user:id,name')->where('slug', $slug)->firstOrFail();
    }

    public function forUser(User $user, ?string $search = null): LengthAwarePaginator
    {
        return $this->search(Post::query()->where('user_id', $user->id)->with('user:id,name'), $search)
            ->orderByDesc('updated_at')->orderByDesc('id')->paginate(12)->withQueryString();
    }

    public function all(?string $search = null): LengthAwarePaginator
    {
        return $this->search(Post::query()->with('user:id,name'), $search)
            ->orderByDesc('created_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function allForExport(): Collection
    {
        return Post::query()->with('user:id,name')->orderByDesc('created_at')->orderByDesc('id')->get();
    }

    public function forAuthorExport(User $user): Collection
    {
        return $user->posts()->with('user:id,name')->orderByDesc('created_at')->orderByDesc('id')->get();
    }

    public function forAuthor(User $user): LengthAwarePaginator
    {
        return $user->posts()->with('user:id,name')->orderByDesc('created_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function findOwned(User $user, Post $post): Post
    {
        return $user->posts()->with('user:id,name')->findOrFail($post->id);
    }

    public function createForUser(User $user, array $attributes): Post
    {
        return $user->posts()->create($attributes);
    }

    public function update(Post $post, array $attributes): Post
    {
        $post->update($attributes);

        return $post->refresh();
    }

    public function delete(Post $post): void
    {
        $post->delete();
    }

    /** @param Builder<Post> $query
     * @return Builder<Post>
     */
    private function search(Builder $query, ?string $search): Builder
    {
        $search = trim((string) $search);
        if ($search !== '') {
            $term = '%'.mb_strtolower($search).'%';
            $query->where(function ($posts) use ($term): void {
                $posts->where(DB::raw('LOWER(title)'), 'like', $term)
                    ->orWhere(DB::raw('LOWER(content)'), 'like', $term)
                    ->orWhere(DB::raw('LOWER(excerpt)'), 'like', $term);
            });
        }

        return $query;
    }
}
