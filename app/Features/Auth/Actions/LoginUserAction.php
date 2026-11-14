<?php

namespace App\Features\Auth\Actions;

use Illuminate\Support\Facades\Auth;

class LoginUserAction
{
    /** @param array{username: string, password: string, remember?: bool} $credentials */
    public function handle(array $credentials): bool
    {
        return Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ], $credentials['remember'] ?? false);
    }
}
