<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\LoginUserAction;
use App\Features\Auth\Actions\RegisterUserAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController
{
    public function createLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request, LoginUserAction $login): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        if (! $login->handle($credentials)) {
            return back()->withErrors(['username' => 'Nama pengguna atau kata sandi tidak cocok.'])->onlyInput('username');
        }

        $request->session()->regenerate();
        $user = $request->user();

        return redirect()->intended($user->isAdmin() ? route('admin.posts.index') : route('dashboard.posts.index'));
    }

    public function createRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request, RegisterUserAction $register): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'alpha_dash', 'min:3', 'max:30', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $register->handle($data);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard.posts.index');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
