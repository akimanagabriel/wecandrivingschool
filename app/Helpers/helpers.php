<?php

if (!function_exists('getImageUrl')) {
    function getImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // If it's already a full URL
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // If it starts with 'storage/', add leading slash
        if (str_starts_with($path, 'storage/')) {
            return '/' . $path;
        }

        // If it starts with '/', return as is
        if (str_starts_with($path, '/')) {
            return $path;
        }

        // Otherwise, prepend /storage/
        return '/storage/' . $path;
    }
}