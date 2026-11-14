<?php

namespace App\Features\Post\Services;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostExcelService
{
    public function __construct(private PostService $posts) {}

    /** @param Collection<int, Post> $posts */
    public function download(Collection $posts, string $filename): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray(['Judul', 'Slug', 'Kategori', 'Ringkasan', 'Konten Markdown', 'Status Publikasi', 'Waktu Publikasi', 'Penulis'], null, 'A1');

        foreach ($posts as $index => $post) {
            $sheet->fromArray([
                $post->title,
                $post->slug,
                $post->category->value,
                $post->excerpt,
                $post->content,
                $post->is_published ? 'Terbit' : 'Draf',
                $post->published_at?->toDateTimeString(),
                $post->user?->name,
            ], null, 'A'.($index + 2));
        }
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        foreach (range('A', 'H') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return response()->streamDownload(function () use ($spreadsheet): void {
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    public function import(UploadedFile $file, User $user): int
    {
        $sheet = IOFactory::load($file->getRealPath())->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);
        $count = 0;

        foreach (array_slice($rows, 1) as $row) {
            $title = trim((string) ($row['A'] ?? ''));
            $content = trim((string) ($row['E'] ?? ''));
            if ($title === '' || $content === '') {
                continue;
            }

            $this->posts->create($user, [
                'title' => Str::limit($title, 255, ''),
                'category' => in_array(($row['C'] ?? ''), ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'], true) ? $row['C'] : 'Umum',
                'excerpt' => isset($row['D']) ? Str::limit((string) $row['D'], 2000, '') : null,
                'content' => Str::limit($content, 100000, ''),
            ]);
            $count++;
        }

        return $count;
    }
}
