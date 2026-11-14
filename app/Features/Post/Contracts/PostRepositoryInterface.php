<?php

namespace App\Features\Post\Contracts;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PostRepositoryInterface
{
    /** @param array{search?: string|null, category?: string|null} $filters */
    public function published(array $filters = []): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): Post;

    public function forUser(User $user, ?string $search = null): LengthAwarePaginator;

    public function all(?string $search = null): LengthAwarePaginator;

    /** @return Collection<int, Post> */
    public function allForExport(): Collection;

    /** @return Collection<int, Post> */
    public function forAuthorExport(User $user): Collection;

    public function forAuthor(User $user): LengthAwarePaginator;

    public function findOwned(User $user, Post $post): Post;

    /** @param array<string, mixed> $attributes */
    public function createForUser(User $user, array $attributes): Post;

    /** @param array<string, mixed> $attributes */
    public function update(Post $post, array $attributes): Post;

    public function delete(Post $post): void;
}
