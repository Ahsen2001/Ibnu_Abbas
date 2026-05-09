<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

trait SignsMediaUrls
{
    protected function signedMediaLinks(?string $path, ?string $downloadName = null, int $ttlMinutes = 120): array
    {
        if (! $path) {
            return [
                'preview_url' => null,
                'download_url' => null,
                'expires_at' => null,
            ];
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return [
                'preview_url' => $path,
                'download_url' => $path,
                'expires_at' => null,
            ];
        }

        $expiresAt = now()->addMinutes($ttlMinutes);
        $downloadName = $downloadName ?: basename($path);

        return [
            'preview_url' => URL::temporarySignedRoute('signed-files.show', $expiresAt, [
                'path' => $path,
                'name' => $downloadName,
                'download' => 0,
            ]),
            'download_url' => URL::temporarySignedRoute('signed-files.show', $expiresAt, [
                'path' => $path,
                'name' => $downloadName,
                'download' => 1,
            ]),
            'expires_at' => $expiresAt->toISOString(),
        ];
    }
}
