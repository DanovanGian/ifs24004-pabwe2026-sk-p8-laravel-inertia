<?php

namespace App\Features\Profile\Controllers;

use App\Features\Profile\Services\ProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController
{
    public function __construct(private ProfileService $profiles) {}

    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', ['user' => $request->user()->only('id', 'name', 'username', 'email', 'profile_photo_path')]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'alpha_dash', 'min:3', 'max:30', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);
        $this->profiles->update($user, $data);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function photo(Request $request): RedirectResponse
    {
        $data = $request->validate(['photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048']]);
        $this->profiles->replacePhoto($request->user(), $data['photo']);

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    public function removePhoto(Request $request): RedirectResponse
    {
        $this->profiles->removePhoto($request->user());

        return back()->with('success', 'Foto profil dihapus.');
    }
}
