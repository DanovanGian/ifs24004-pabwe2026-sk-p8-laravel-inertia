<?php

namespace App\Features\Admin\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminUserService
{
    public function index(?string $search = null): LengthAwarePaginator
    {
        return User::query()
            ->withCount('posts')
            ->when($search, function ($users, string $search): void {
                $users->where(function ($query) use ($search): void {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('username', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('name')->orderBy('id')->paginate(20)->withQueryString();
    }
}
