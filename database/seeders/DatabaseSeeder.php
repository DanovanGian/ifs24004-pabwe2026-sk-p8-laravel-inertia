<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@blogverse.test'],
            ['name' => 'Admin BlogVerse', 'username' => 'admin', 'password' => Hash::make('admin'), 'role' => 'admin'],
        );

        $writer = User::query()->updateOrCreate(
            ['email' => 'penulis@blogverse.test'],
            ['name' => 'Penulis BlogVerse', 'username' => 'penulis', 'password' => Hash::make('penulis'), 'role' => 'member'],
        );

        if (! Post::query()->exists()) {
            Post::factory()->published()->for($writer)->create([
                'title' => 'Menulis dengan rasa ingin tahu',
                'slug' => 'menulis-dengan-rasa-ingin-tahu',
                'category' => 'Opini',
                'excerpt' => 'Catatan tentang kebiasaan kecil yang membuat tulisan terasa hidup.',
                'content' => "# Mulai dari pertanyaan\n\nTulisan yang baik sering berawal dari rasa ingin tahu. Amati hal kecil, cari konteksnya, lalu bagikan dengan bahasa yang jernih.\n\n## Beri ruang untuk pembaca\n\nSampaikan gagasan dengan sederhana dan dukung dengan pengalaman atau sumber yang dapat dipercaya.",
            ]);
        }
    }
}
