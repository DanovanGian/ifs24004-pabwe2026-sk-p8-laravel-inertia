<?php

namespace App\Features\Post\Enums;

enum PostCategory: string
{
    case Technology = 'Teknologi';
    case Education = 'Pendidikan';
    case Lifestyle = 'Gaya Hidup';
    case Business = 'Bisnis';
    case Opinion = 'Opini';
    case General = 'Umum';

    /** @return array<string, string> */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $category) {
            $options[$category->value] = $category->value;
        }

        return $options;
    }
}
