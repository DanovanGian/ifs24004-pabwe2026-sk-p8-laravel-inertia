<?php

namespace App\Features\Post\Services;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public function __construct(private PostRepositoryInterface $posts) {}

    /** @param array{search?: string|null, category?: string|null} $filters */
    public function publicIndex(array $filters = []): LengthAwarePaginator
    {
        return $this->posts->published($filters);
    }

    public function publicShow(string $slug): Post
    {
        return $this->posts->findPublishedBySlug($slug);
    }

    public function indexForUser(User $user, ?string $search = null): LengthAwarePaginator
    {
        return $this->posts->forUser($user, $search);
    }

    public function adminIndex(?string $search = null): LengthAwarePaginator
    {
        return $this->posts->all($search);
    }

    public function adminAuthorIndex(User $user): LengthAwarePaginator
    {
        return $this->posts->forAuthor($user);
    }

    /** @return Collection<int, Post> */
    public function allForExport(): Collection
    {
        return $this->posts->allForExport();
    }

    /** @return Collection<int, Post> */
    public function authorForExport(User $user): Collection
    {
        return $this->posts->forAuthorExport($user);
    }

    public function owned(User $user, Post $post): Post
    {
        return $this->posts->findOwned($user, $post);
    }

    /** @param array{title: string, category: string, excerpt?: string|null, content: string} $data */
    public function create(User $user, array $data): Post
    {
        $slug = Str::slug($data['title']);
        $slug = $slug !== '' ? $slug : 'artikel';
        $base = $slug;
        $suffix = 2;
        while (Post::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $this->posts->createForUser($user, [...$data, 'slug' => $slug, 'is_published' => false]);
    }

    /** @param array{title: string, category: string, excerpt?: string|null, content: string} $data */
    public function update(Post $post, array $data): Post
    {
        return $this->posts->update($post, $data);
    }

    public function togglePublication(Post $post): Post
    {
        $isPublishing = ! $post->is_published;

        return $this->posts->update($post, [
            'is_published' => $isPublishing,
            'published_at' => $isPublishing ? now() : null,
        ]);
    }

    public function delete(Post $post): void
    {
        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }
        $this->posts->delete($post);
    }

    public function replaceCover(Post $post, UploadedFile $cover): Post
    {
        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }

        return $this->posts->update($post, ['cover_image_path' => $cover->store('covers', 'public')]);
    }

    public function removeCover(Post $post): Post
    {
        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }

        return $this->posts->update($post, ['cover_image_path' => null]);
    }
}
