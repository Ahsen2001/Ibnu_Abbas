<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmailTemplates\StoreEmailTemplateRequest;
use App\Http\Requests\EmailTemplates\UpdateEmailTemplateRequest;
use App\Models\EmailTemplate;
use App\Services\TemplateRendererService;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function __construct(private readonly TemplateRendererService $renderer)
    {
    }

    public function index(Request $request)
    {
        $templates = EmailTemplate::query()
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json($templates);
    }

    public function store(StoreEmailTemplateRequest $request)
    {
        $template = EmailTemplate::create($request->validated());

        return response()->json($template, 201);
    }

    public function update(UpdateEmailTemplateRequest $request, EmailTemplate $emailTemplate)
    {
        $emailTemplate->update($request->validated());

        return response()->json($emailTemplate->fresh());
    }

    public function destroy(EmailTemplate $emailTemplate)
    {
        $emailTemplate->delete();

        return response()->noContent();
    }

    public function preview(EmailTemplate $emailTemplate)
    {
        $variables = $this->renderer->dummyVariables($emailTemplate->variables);

        return response()->json([
            'template' => $emailTemplate,
            'variables' => $variables,
            'preview' => [
                'subject' => $this->renderer->render($emailTemplate->subject, $variables),
                'body' => $this->renderer->render($emailTemplate->body, $variables),
            ],
        ]);
    }
}
