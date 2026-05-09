<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SignedFileController extends Controller
{
    public function __invoke(Request $request)
    {
        $path = trim((string) $request->query('path'));
        $downloadName = trim((string) $request->query('name', basename($path)));
        $shouldDownload = $request->boolean('download');

        abort_if($path === '', 404, 'File not found.');
        abort_unless($this->isAllowedPath($path), 403, 'This file path is not allowed.');
        abort_unless(Storage::disk('public')->exists($path), 404, 'File not found.');

        $mimeType = Storage::disk('public')->mimeType($path) ?: 'application/octet-stream';
        $headers = ['Content-Type' => $mimeType];

        if ($shouldDownload) {
            return Storage::disk('public')->download($path, $downloadName, $headers);
        }

        return Storage::disk('public')->response($path, $downloadName, $headers);
    }

    private function isAllowedPath(string $path): bool
    {
        return str_starts_with($path, 'research/')
            || str_starts_with($path, 'documents/')
            || str_starts_with($path, 'certificates/')
            || str_starts_with($path, 'gallery/')
            || str_starts_with($path, 'publications/')
            || str_starts_with($path, 'islamic/')
            || str_starts_with($path, 'guestbook/')
            || str_starts_with($path, 'videos/');
    }
}
