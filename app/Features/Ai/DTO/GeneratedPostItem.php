<?php

namespace App\Features\Ai\DTO;

final readonly class GeneratedPostItem
{
    public function __construct(
        public string $title,
        public string $category,
        public string $excerpt,
        public string $content,
    ) {}

    /** @param array{title: mixed, category: mixed, excerpt: mixed, content: mixed} $data */
    public static function fromArray(array $data): self
    {
        return new self(
            trim((string) $data['title']),
            trim((string) $data['category']),
            trim((string) $data['excerpt']),
            trim((string) $data['content']),
        );
    }

    /** @return array{title: string, category: string, excerpt: string, content: string} */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'category' => $this->category,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
        ];
    }
}
