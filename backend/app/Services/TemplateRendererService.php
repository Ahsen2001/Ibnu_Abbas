<?php

namespace App\Services;

class TemplateRendererService
{
    public function render(string $content, array $variables = []): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function (array $matches) use ($variables) {
            $key = $matches[1];

            return array_key_exists($key, $variables)
                ? (string) $variables[$key]
                : '';
        }, $content) ?? $content;
    }

    public function dummyVariables(?array $variables = []): array
    {
        return collect($variables ?? [])
            ->filter()
            ->mapWithKeys(function (string $variable) {
                $normalized = trim(str_replace(['{{', '}}'], '', $variable));

                return [$normalized => match ($normalized) {
                    'name' => 'Ahsen Ameen',
                    'date' => now()->format('d M Y'),
                    'department' => 'Shareea',
                    'batch' => (string) now()->year,
                    'college' => 'IBNU ABBAS ARABIC COLLEGE',
                    default => ucfirst(str_replace('_', ' ', $normalized)),
                }];
            })
            ->all();
    }
}
