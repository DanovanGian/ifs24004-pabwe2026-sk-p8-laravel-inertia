<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiPostGeneratorService implements AiClientInterface
{
    public function generate(int $count, string $topic, string $category): array
    {
        $apiKey = (string) config('openai.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('Kunci OpenAI belum diatur. Tambahkan OPENAI_API_KEY pada file .env.');
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout((int) config('openai.timeout', 60))
            ->post(rtrim((string) config('openai.base_url'), '/').'/responses', [
                'model' => config('openai.model'),
                'instructions' => 'Buat artikel blog berbahasa Indonesia yang faktual, jelas, orisinal, dan siap disunting. Kembalikan JSON dengan properti articles, berupa array objek title, category, excerpt, content. Isi content dalam Markdown. Jangan sertakan markup selain JSON.',
                'input' => "Buat tepat {$count} ide artikel bertema: {$topic}. Gunakan kategori {$category}. Setiap artikel harus punya judul menarik, ringkasan 1-2 kalimat, dan isi Markdown sekitar 4-6 paragraf.",
                'text' => ['format' => ['type' => 'json_object']],
            ])
            ->throw()
            ->json();

        $text = $response['output_text'] ?? null;
        if (! is_string($text)) {
            foreach (($response['output'] ?? []) as $item) {
                foreach (($item['content'] ?? []) as $content) {
                    if (($content['type'] ?? null) === 'output_text') {
                        $text = $content['text'] ?? null;
                        break 2;
                    }
                }
            }
        }

        if (! is_string($text) || $text === '') {
            throw new RuntimeException('OpenAI tidak mengembalikan teks artikel. Coba ulangi permintaan.');
        }

        $decoded = json_decode($text, true);
        $items = $decoded['articles'] ?? null;
        if (! is_array($items)) {
            throw new RuntimeException('Format hasil OpenAI tidak sesuai. Coba ulangi permintaan.');
        }

        $generated = [];
        foreach (array_slice($items, 0, $count) as $item) {
            if (is_array($item) && isset($item['title'], $item['category'], $item['excerpt'], $item['content'])) {
                $generated[] = GeneratedPostItem::fromArray($item);
            }
        }

        if (count($generated) !== $count) {
            throw new RuntimeException('OpenAI belum menghasilkan jumlah artikel yang diminta. Coba ulangi permintaan.');
        }

        return $generated;
    }
}
