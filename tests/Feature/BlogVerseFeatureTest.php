<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use App\Providers\AppServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class BlogVerseFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_and_published_article_are_visible_without_login(): void
    {
        $post = Post::factory()->published()->for(User::factory())->create([
            'title' => 'Belajar Laravel',
            'slug' => 'belajar-laravel',
            'category' => 'Teknologi',
        ]);
        Post::factory()->for(User::factory())->create(['slug' => 'artikel-draf']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostIndex')
                ->has('posts.data', 1)
                ->where('posts.data.0.slug', 'belajar-laravel'));

        $this->get('/articles/'.$post->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/PostShow')->where('post.slug', $post->slug));

        $this->get('/articles/artikel-draf')->assertNotFound();
    }

    public function test_public_search_and_category_filter_only_return_matching_posts(): void
    {
        Post::factory()->published()->for(User::factory())->create(['title' => 'Produktivitas Belajar', 'slug' => 'produktivitas-belajar', 'category' => 'Pendidikan']);
        Post::factory()->published()->for(User::factory())->create(['title' => 'Produktivitas Kerja', 'slug' => 'produktivitas-kerja', 'category' => 'Bisnis']);

        $this->get('/articles?search=belajar&category=Pendidikan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 1)->where('posts.data.0.slug', 'produktivitas-belajar'));

        $this->get('/articles?category=not-real')->assertSessionHasErrors('category');
    }

    public function test_guests_can_register_and_members_can_log_in_by_username(): void
    {
        $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
        $this->get('/register')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Register'));

        $this->post('/register', [
            'name' => 'Rina Penulis',
            'username' => 'rina',
            'email' => 'rina@example.test',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ])->assertRedirect('/dashboard/posts');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['username' => 'rina', 'role' => 'member']);
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();

        $this->post('/login', ['username' => 'rina', 'password' => 'secret-password'])->assertRedirect('/dashboard/posts');
        $this->assertAuthenticated();
        $this->post('/logout');
        $this->post('/login', ['username' => 'rina', 'password' => 'wrong-password'])->assertSessionHasErrors('username');
    }

    public function test_member_can_manage_draft_and_publish_only_their_own_posts(): void
    {
        $writer = User::factory()->create();
        $otherWriter = User::factory()->create();
        $this->actingAs($writer);

        $this->get('/dashboard/posts')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Dashboard/PostIndex')->where('stats.total', 0));
        $this->post('/dashboard/posts', [
            'title' => 'Catatan Produktivitas',
            'category' => 'Gaya Hidup',
            'excerpt' => 'Ringkasan yang menarik.',
            'content' => '# Gagasan\n\nIsi artikel.',
        ])->assertSessionHas('success');
        $this->post('/dashboard/posts', [
            'title' => 'Catatan Produktivitas', 'category' => 'Gaya Hidup', 'excerpt' => '', 'content' => 'Versi dua.',
        ])->assertSessionHas('success');
        $this->assertDatabaseHas('posts', ['user_id' => $writer->id, 'slug' => 'catatan-produktivitas-2']);
        $post = $writer->posts()->firstOrFail();
        $this->assertSame('catatan-produktivitas', $post->slug);

        $this->get('/dashboard/posts/'.$post->id)->assertOk()->assertInertia(fn (Assert $page) => $page->component('Dashboard/PostShow'));
        $this->put('/dashboard/posts/'.$post->id, [
            'title' => 'Catatan Produktivitas Baru', 'category' => 'Opini', 'excerpt' => 'Ringkasan baru.', 'content' => '# Isi baru',
        ])->assertSessionHas('success');
        $this->patch('/dashboard/posts/'.$post->id.'/publish')->assertSessionHas('success');
        $post->refresh();
        $this->assertTrue($post->is_published);
        $this->get('/articles/'.$post->slug)->assertOk();
        $this->patch('/dashboard/posts/'.$post->id.'/publish')->assertSessionHas('success');
        $this->assertFalse($post->fresh()->is_published);

        $foreignPost = Post::factory()->for($otherWriter)->create();
        $this->get('/dashboard/posts/'.$foreignPost->id)->assertForbidden();
        $this->put('/dashboard/posts/'.$foreignPost->id, [
            'title' => 'Tidak boleh', 'category' => 'Umum', 'excerpt' => '', 'content' => 'Isi',
        ])->assertForbidden();
        $this->delete('/dashboard/posts/'.$foreignPost->id)->assertForbidden();
        $this->delete('/dashboard/posts/'.$post->id)->assertRedirect('/dashboard/posts');
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_member_can_upload_and_remove_cover_images(): void
    {
        Storage::fake('public');
        $writer = User::factory()->create();
        $post = Post::factory()->for($writer)->create();
        $this->actingAs($writer)->post('/dashboard/posts/'.$post->id.'/cover', ['cover' => UploadedFile::fake()->image('cover.jpg')])->assertSessionHas('success');
        $path = $post->fresh()->cover_image_path;
        Storage::disk('public')->assertExists($path);
        $this->post('/dashboard/posts/'.$post->id.'/cover', ['cover' => UploadedFile::fake()->image('cover-replacement.png')])->assertSessionHas('success');
        Storage::disk('public')->assertMissing($path);
        $path = $post->fresh()->cover_image_path;
        $this->delete('/dashboard/posts/'.$post->id.'/cover')->assertSessionHas('success');
        Storage::disk('public')->assertMissing($path);
        $this->assertNull($post->fresh()->cover_image_path);
        $this->delete('/dashboard/posts/'.$post->id.'/cover')->assertSessionHas('success');
    }

    public function test_admin_can_monitor_users_posts_and_export_excel_without_edit_routes(): void
    {
        $admin = User::factory()->create(['username' => 'admin', 'role' => 'admin']);
        $writer = User::factory()->create();
        Post::factory()->published()->for($writer)->create();
        $this->actingAs($admin);

        $this->get('/admin/users')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/UserList')->has('users.data'));
        $this->get('/admin/users/'.$writer->id.'/posts')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/UserPostList')->where('user.id', $writer->id));
        $this->get('/admin/posts')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/PostList')->has('posts.data'));
        $this->get('/admin/posts/export')->assertDownload('blogverse-semua-artikel.xlsx');
        $this->get('/admin/users/'.$writer->id.'/posts/export')->assertDownload('blogverse-'.$writer->username.'-artikel.xlsx');
        $this->get('/dashboard/posts')->assertForbidden();
        $this->assertSame('admin', $admin->fresh()->role);
    }

    public function test_member_excel_export_and_import_create_private_drafts(): void
    {
        $writer = User::factory()->create();
        Post::factory()->for($writer)->create();
        $export = $this->actingAs($writer)->get('/dashboard/posts/export');
        $export->assertDownload('blogverse-artikel-saya.xlsx');
        $this->assertNotEmpty($export->streamedContent());

        $spreadsheet = new Spreadsheet;
        $spreadsheet->getActiveSheet()->fromArray([
            ['Judul', 'Slug', 'Kategori', 'Ringkasan', 'Konten Markdown'],
            ['Impor Blog', '', 'Teknologi', 'Ringkasan impor', '# Konten impor'],
            ['Artikel kategori salah', '', 'Tidak dikenal', 'Ringkasan', '# Isi'],
            ['Lewati konten kosong', '', 'Umum', '', ''],
        ], null, 'A1');
        $temporaryFile = tempnam(sys_get_temp_dir(), 'blogverse-import-');
        (new Xlsx($spreadsheet))->save($temporaryFile);
        $spreadsheet->disconnectWorksheets();
        $file = UploadedFile::fake()->createWithContent('artikel.xlsx', file_get_contents($temporaryFile));

        $this->post('/dashboard/posts/import', ['file' => $file])->assertSessionHas('success');
        $this->assertDatabaseHas('posts', ['user_id' => $writer->id, 'title' => 'Impor Blog', 'is_published' => false]);
        $this->assertDatabaseHas('posts', ['user_id' => $writer->id, 'title' => 'Artikel kategori salah', 'category' => 'Umum']);
        @unlink($temporaryFile);
    }

    public function test_member_can_update_profile_and_admin_role_is_required(): void
    {
        $writer = User::factory()->create();
        $this->actingAs($writer)->get('/profile')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Profile/Edit'));
        $this->put('/profile', ['name' => 'Nama Baru', 'username' => 'nama-baru', 'email' => $writer->email])->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['id' => $writer->id, 'name' => 'Nama Baru', 'username' => 'nama-baru']);
        $this->get('/admin/users')->assertForbidden();
    }

    public function test_ai_generator_validates_input_and_saves_generated_posts_as_drafts(): void
    {
        config(['openai.api_key' => 'test-key']);
        Http::fake(['api.openai.com/v1/responses' => Http::response([
            'output_text' => json_encode(['articles' => [[
                'title' => 'Belajar Fokus', 'category' => 'Pendidikan', 'excerpt' => 'Cara menjaga fokus.', 'content' => '# Fokus',
            ]]], JSON_THROW_ON_ERROR),
        ])]);
        $writer = User::factory()->create();
        $this->actingAs($writer)->get('/dashboard/posts/ai')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Dashboard/AiGenerator'));
        $this->post('/dashboard/posts/ai-generate', ['count' => 0, 'topic' => 'Belajar', 'category' => 'Pendidikan'])->assertSessionHasErrors('count');
        $this->post('/dashboard/posts/ai-generate', ['count' => 1, 'topic' => 'Belajar fokus', 'category' => 'Pendidikan'])
            ->assertRedirect('/dashboard/posts/ai')
            ->assertSessionHas('generatedPosts');
        $this->post('/dashboard/posts/ai-save', ['posts' => [[
            'title' => 'Belajar Fokus', 'category' => 'Pendidikan', 'excerpt' => 'Cara menjaga fokus.', 'content' => '# Fokus',
        ]]])->assertRedirect('/dashboard/posts');
        $this->assertDatabaseHas('posts', ['user_id' => $writer->id, 'slug' => 'belajar-fokus', 'is_published' => false]);
    }

    public function test_admin_and_author_search_filters_are_applied(): void
    {
        $writer = User::factory()->create(['name' => 'Penulis Unik']);
        Post::factory()->for($writer)->create(['title' => 'Kata Kunci', 'slug' => 'kata-kunci']);
        Post::factory()->for($writer)->create(['title' => 'Tulisan Lain', 'slug' => 'tulisan-lain']);

        $this->actingAs($writer)->get('/dashboard/posts?search=kata')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->has('posts.data', 1)->where('posts.data.0.slug', 'kata-kunci'));

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/admin/posts?search=kata')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->has('posts.data', 1)->where('posts.data.0.slug', 'kata-kunci'));
        $this->get('/admin/users?search=Penulis+Unik')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.data.0.id', $writer->id));
    }

    public function test_profile_photo_can_be_replaced_removed_and_validated(): void
    {
        Storage::fake('public');
        $writer = User::factory()->create(['profile_photo_path' => 'profile-photos/old.png']);
        Storage::disk('public')->put('profile-photos/old.png', 'old photo');

        $this->actingAs($writer)->post('/profile/photo', ['photo' => UploadedFile::fake()->image('new.jpg')])->assertSessionHas('success');
        $newPath = $writer->fresh()->profile_photo_path;
        Storage::disk('public')->assertMissing('profile-photos/old.png');
        Storage::disk('public')->assertExists($newPath);
        $this->delete('/profile/photo')->assertSessionHas('success');
        Storage::disk('public')->assertMissing($newPath);
        $this->delete('/profile/photo')->assertSessionHas('success');
        $this->post('/profile/photo', ['photo' => UploadedFile::fake()->create('bad.txt')])->assertSessionHasErrors('photo');
    }

    public function test_post_delete_removes_its_cover_file(): void
    {
        Storage::fake('public');
        $writer = User::factory()->create();
        Storage::disk('public')->put('covers/delete-me.jpg', 'cover');
        $post = Post::factory()->for($writer)->create(['cover_image_path' => 'covers/delete-me.jpg']);

        $this->actingAs($writer)->delete('/dashboard/posts/'.$post->id)->assertRedirect('/dashboard/posts');
        Storage::disk('public')->assertMissing('covers/delete-me.jpg');
    }

    public function test_force_https_setting_applies_https_scheme(): void
    {
        URL::forceScheme('http');
        config(['app.force_https' => true]);
        (new AppServiceProvider(app()))->boot();

        $this->assertStringStartsWith('https://', URL::to('/'));
        config(['app.force_https' => false]);
        URL::forceScheme('http');
    }

    public function test_ai_response_fallback_and_error_formats_are_handled(): void
    {
        config(['openai.api_key' => 'test-key']);
        $validText = json_encode(['articles' => [[
            'title' => 'Artikel Nested', 'category' => 'Opini', 'excerpt' => 'Ringkas', 'content' => '# Isi',
        ]]], JSON_THROW_ON_ERROR);
        $sequence = Http::sequence()
            ->push(['output' => [['content' => [['type' => 'output_text', 'text' => $validText]]]]])
            ->push(['output' => []])
            ->push(['output_text' => 'bukan json'])
            ->push(['output_text' => json_encode(['articles' => []], JSON_THROW_ON_ERROR)]);
        Http::fake(['api.openai.com/v1/responses' => $sequence]);
        $writer = User::factory()->create();

        $this->actingAs($writer)->post('/dashboard/posts/ai-generate', ['count' => 1, 'topic' => 'Topik valid', 'category' => 'Opini'])->assertSessionHas('generatedPosts');
        $this->post('/dashboard/posts/ai-generate', ['count' => 1, 'topic' => 'Topik valid', 'category' => 'Opini'])->assertSessionHasErrors('generation');
        $this->post('/dashboard/posts/ai-generate', ['count' => 1, 'topic' => 'Topik valid', 'category' => 'Opini'])->assertSessionHasErrors('generation');
        $this->post('/dashboard/posts/ai-generate', ['count' => 1, 'topic' => 'Topik valid', 'category' => 'Opini'])->assertSessionHasErrors('generation');
    }

    public function test_ai_generator_reports_missing_key(): void
    {
        config(['openai.api_key' => null]);
        $writer = User::factory()->create();
        $this->actingAs($writer)->post('/dashboard/posts/ai-generate', ['count' => 1, 'topic' => 'Tema belajar', 'category' => 'Pendidikan'])
            ->assertSessionHasErrors('generation');
    }
}
