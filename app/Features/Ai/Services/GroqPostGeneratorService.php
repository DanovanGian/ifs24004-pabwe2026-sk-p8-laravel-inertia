<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GroqPostGeneratorService implements AiClientInterface
{
    public function generate(int $count, string $topic, string $category): array
    {
        $apiKey = (string) config('groq.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('Kunci Groq belum diatur. Tambahkan GROQ_API_KEY pada file .env.');
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout((int) config('groq.timeout', 60))
            ->post(rtrim((string) config('groq.base_url'), '/').'/chat/completions', [
                'model' => config('groq.model'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Buat artikel blog berbahasa Indonesia yang faktual, jelas, orisinal, dan siap disunting. Balas dengan JSON valid berisi properti articles, berupa array objek title, category, excerpt, content. Isi content dalam Markdown. Jangan sertakan markup selain JSON.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Buat tepat {$count} ide artikel bertema: {$topic}. Gunakan kategori {$category}. Setiap artikel harus punya judul menarik, ringkasan 1-2 kalimat, dan isi Markdown sekitar 4-6 paragraf.",
                    ],
                ],
                'response_format' => ['type' => 'json_object'],
            ])
            ->throw()
            ->json();

        $text = $response['choices'][0]['message']['content'] ?? null;
        if (! is_string($text) || $text === '') {
            throw new RuntimeException('Groq tidak mengembalikan teks artikel. Coba ulangi permintaan.');
        }

        $decoded = json_decode($text, true);
        $items = $decoded['articles'] ?? null;
        if (! is_array($items)) {
            throw new RuntimeException('Format hasil Groq tidak sesuai. Coba ulangi permintaan.');
        }

        $generated = [];
        foreach (array_slice($items, 0, $count) as $item) {
            if (is_array($item) && isset($item['title'], $item['category'], $item['excerpt'], $item['content'])) {
                $generated[] = GeneratedPostItem::fromArray($item);
            }
        }

        if (count($generated) !== $count) {
            throw new RuntimeException('Groq belum menghasilkan jumlah artikel yang diminta. Coba ulangi permintaan.');
        }

        return $generated;
    }
}
