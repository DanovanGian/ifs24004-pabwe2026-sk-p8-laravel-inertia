<?php

namespace App\Features\Profile\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    /** @param array{name: string, username: string, email: string} $data */
    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->refresh();
    }

    public function replacePhoto(User $user, UploadedFile $photo): User
    {
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }
        $user->update(['profile_photo_path' => $photo->store('profile-photos', 'public')]);

        return $user->refresh();
    }

    public function removePhoto(User $user): User
    {
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }
        $user->update(['profile_photo_path' => null]);

        return $user->refresh();
    }
}
