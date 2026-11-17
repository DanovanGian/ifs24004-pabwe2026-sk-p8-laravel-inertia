<?php

namespace Tests\Feature;

use App\Features\Post\Services\PostService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostServiceCoverTest extends TestCase
{
    use RefreshDatabase;

    private function data(array $extra = []): array
    {
        return [
            'title' => 'Judul Tes',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkasan',
            'content' => 'Isi artikel',
            ...$extra,
        ];
    }

    public function test_create_with_cover_stores_image(): void
    {
        Storage::fake('public');
        $post = app(PostService::class)->create(
            User::factory()->create(),
            $this->data(['cover' => UploadedFile::fake()->image('a.jpg')])
        );

        Storage::disk('public')->assertExists($post->cover_image_path);
        $this->assertNull($post->cover_template);
    }

    public function test_update_with_new_cover_replaces_old_one(): void
    {
        Storage::fake('public');
        $service = app(PostService::class);
        $post = $service->create(
            User::factory()->create(),
            $this->data(['cover' => UploadedFile::fake()->image('a.jpg')])
        );
        $old = $post->cover_image_path;

        $updated = $service->update($post, $this->data([
            'cover' => UploadedFile::fake()->image('b.jpg'),
        ]));

        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($updated->cover_image_path);
    }

    public function test_update_with_template_removes_existing_cover(): void
    {
        Storage::fake('public');
        $service = app(PostService::class);
        $post = $service->create(
            User::factory()->create(),
            $this->data(['cover' => UploadedFile::fake()->image('a.jpg')])
        );
        $old = $post->cover_image_path;

        $updated = $service->update($post, $this->data(['cover_template' => 'template-1']));

        Storage::disk('public')->assertMissing($old);
        $this->assertNull($updated->cover_image_path);
    }
}
