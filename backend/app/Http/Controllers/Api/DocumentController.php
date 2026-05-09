<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Research\UploadOfficialDocumentRequest;
use App\Models\Application;
use App\Models\IssuedDocument;
use App\Models\ShareeaRecord;
use App\Models\Student;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function generateBiodata(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudentDocumentAccess($request, $student, allowTeacher: true);

        return $this->generatePdfDocument(
            request: $request,
            view: 'pdf.biodata',
            filePath: sprintf('documents/biodata/%s-%s.pdf', $student->student_id, Str::uuid()),
            fileName: sprintf('biodata-%s.pdf', $student->student_id),
            documentType: 'biodata',
            title: "{$student->full_name} Biodata",
            student: $student,
            metadata: ['student_id' => $student->student_id],
            viewData: [
                'student' => $student->load(['user.role', 'application']),
                'documentHeading' => 'Student Biodata',
                'documentReference' => $student->student_id,
            ],
        );
    }

    public function generateApplication(Request $request, Application $application): JsonResponse
    {
        $this->authorizeApplicationDocumentAccess($request, $application);

        return $this->generatePdfDocument(
            request: $request,
            view: 'pdf.application-form',
            filePath: sprintf('documents/applications/%s-%s.pdf', $application->application_no, Str::uuid()),
            fileName: sprintf('application-%s.pdf', $application->application_no),
            documentType: 'application',
            title: "Application {$application->application_no}",
            application: $application,
            metadata: ['application_no' => $application->application_no],
            viewData: [
                'application' => $application->load(['applicant.role', 'reviewer']),
                'documentHeading' => 'Admission Application Form',
                'documentReference' => $application->application_no,
            ],
        );
    }

    public function generateOfferLetter(Request $request, Application $application): JsonResponse
    {
        $this->authorizeApplicationDocumentAccess($request, $application);

        abort_unless(
            in_array($application->status, [Application::STATUS_OFFERED, Application::STATUS_ACCEPTED], true),
            422,
            'Offer letters are available only for offered or accepted applications.'
        );

        return $this->generatePdfDocument(
            request: $request,
            view: 'pdf.offer-letter',
            filePath: sprintf('documents/offers/%s-%s.pdf', $application->application_no, Str::uuid()),
            fileName: sprintf('offer-letter-%s.pdf', $application->application_no),
            documentType: 'offer_letter',
            title: "Offer Letter {$application->application_no}",
            application: $application,
            metadata: ['application_no' => $application->application_no],
            viewData: [
                'application' => $application->load(['applicant.role', 'reviewer']),
                'documentHeading' => 'Admission Offer Letter',
                'documentReference' => $application->application_no,
            ],
        );
    }

    public function generateInterviewList(Request $request): JsonResponse
    {
        $this->authorizeRole($request, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER], 'You are not allowed to generate interview lists.');

        $filters = $request->validate([
            'department' => ['nullable', 'in:shareea,hifl'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $applications = Application::query()
            ->with(['applicant.role', 'reviewer'])
            ->where('status', Application::STATUS_INTERVIEW_SCHEDULED)
            ->when($filters['department'] ?? null, fn ($query, $department) => $query->where('department', $department))
            ->when($filters['date_from'] ?? null, fn ($query, $dateFrom) => $query->whereDate('interview_date', '>=', $dateFrom))
            ->when($filters['date_to'] ?? null, fn ($query, $dateTo) => $query->whereDate('interview_date', '<=', $dateTo))
            ->orderBy('interview_date')
            ->orderBy('interview_time')
            ->get();

        return $this->generatePdfDocument(
            request: $request,
            view: 'pdf.interview-list',
            filePath: sprintf('documents/interview-lists/interview-list-%s.pdf', Str::uuid()),
            fileName: 'interview-list.pdf',
            documentType: 'interview_list',
            title: 'Interview Schedule List',
            metadata: $filters,
            viewData: [
                'applications' => $applications,
                'filters' => $filters,
                'documentHeading' => 'Interview List',
                'documentReference' => 'INTERVIEW-LIST',
            ],
        );
    }

    public function generateCertificate(Request $request, Student $student, string $type): JsonResponse
    {
        abort_unless(in_array($type, ['completion', 'graduation'], true), 422, 'Certificate type is invalid.');

        $this->authorizeStudentDocumentAccess($request, $student);

        return $this->generatePdfDocument(
            request: $request,
            view: 'pdf.certificate',
            filePath: sprintf('certificates/%s/%s-%s.pdf', $type, $student->student_id, Str::uuid()),
            fileName: sprintf('%s-certificate-%s.pdf', $type, $student->student_id),
            documentType: 'certificate',
            title: ucfirst($type) . " Certificate {$student->student_id}",
            student: $student,
            metadata: ['type' => $type],
            viewData: [
                'student' => $student->load(['user.role', 'application']),
                'certificateType' => $type,
                'documentHeading' => ucfirst($type) . ' Certificate',
                'documentReference' => $student->student_id,
            ],
        );
    }

    public function generateTranscript(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudentDocumentAccess($request, $student, allowTeacher: true);

        $validated = $request->validate([
            'semester' => ['nullable', 'string', 'max:50'],
        ]);

        $records = ShareeaRecord::query()
            ->where('student_id', $student->id)
            ->when($validated['semester'] ?? null, fn ($query, $semester) => $query->where('academic_level', $semester))
            ->orderBy('academic_level')
            ->orderBy('subject_name')
            ->get();

        $averageMarks = $records->avg('marks');
        $gradePoints = $records
            ->filter(fn (ShareeaRecord $record) => $record->grade !== null)
            ->map(fn (ShareeaRecord $record) => $this->gradeToPoint($record->grade));
        $gpa = $gradePoints->count() ? round($gradePoints->avg(), 2) : null;

        return $this->generatePdfDocument(
            request: $request,
            view: 'pdf.transcript',
            filePath: sprintf('documents/transcripts/%s-%s.pdf', $student->student_id, Str::uuid()),
            fileName: sprintf('transcript-%s.pdf', $student->student_id),
            documentType: 'transcript',
            title: "Transcript {$student->student_id}",
            student: $student,
            metadata: ['semester' => $validated['semester'] ?? 'all'],
            viewData: [
                'student' => $student->load(['user.role', 'application']),
                'records' => $records,
                'semester' => $validated['semester'] ?? null,
                'averageMarks' => $averageMarks ? round($averageMarks, 2) : null,
                'gpa' => $gpa,
                'documentHeading' => 'Academic Transcript',
                'documentReference' => $student->student_id,
            ],
        );
    }

    public function upload(UploadOfficialDocumentRequest $request): JsonResponse
    {
        $this->authorizeRole($request, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF], 'Only administrators can upload official documents.');

        $student = Student::findOrFail($request->validated('student_id'));
        $file = $request->file('file');
        $path = $file->storeAs(
            sprintf('documents/official/student-%s', $student->student_id),
            sprintf('%s-%s.pdf', Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)), Str::uuid()),
            'public'
        );

        $document = IssuedDocument::create([
            'student_id' => $student->id,
            'created_by' => $request->user()->id,
            'document_type' => $request->validated('document_type'),
            'title' => $request->validated('title'),
            'file_disk' => 'public',
            'file_path' => $path,
            'metadata' => [
                'notes' => $request->validated('notes'),
                'original_name' => $file->getClientOriginalName(),
            ],
            'issued_at' => now(),
        ]);

        return response()->json([
            'message' => 'Official document uploaded successfully.',
            'document' => $this->serializeIssuedDocument($document->load(['student', 'application', 'creator.role'])),
        ], 201);
    }

    public function issued(Request $request): JsonResponse
    {
        $this->authorizeRole($request, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF], 'Only administrators can view issued documents.');

        $documents = IssuedDocument::query()
            ->with(['student', 'application', 'creator.role'])
            ->when($request->query('document_type'), fn ($query, $type) => $query->where('document_type', $type))
            ->when($request->query('student_id'), fn ($query, $studentId) => $query->where('student_id', $studentId))
            ->latest('issued_at')
            ->paginate((int) $request->query('per_page', 15))
            ->through(fn (IssuedDocument $document) => $this->serializeIssuedDocument($document));

        return response()->json($documents);
    }

    private function generatePdfDocument(
        Request $request,
        string $view,
        string $filePath,
        string $fileName,
        string $documentType,
        string $title,
        array $viewData = [],
        ?Student $student = null,
        ?Application $application = null,
        array $metadata = [],
    ): JsonResponse {
        $pdf = Pdf::loadView($view, [
            ...$viewData,
            'generatedAt' => now(),
            'logoDataUri' => $this->getLogoDataUri(),
            'collegeAddress' => 'Main Road, Addalaichenai, Sri Lanka',
            'collegeContact' => '+94 67 227 7654 | info@ibnuabbascollege.edu',
        ])->setPaper('a4');

        Storage::disk('public')->put($filePath, $pdf->output());

        $document = IssuedDocument::create([
            'student_id' => $student?->id,
            'application_id' => $application?->id,
            'created_by' => $request->user()->id,
            'document_type' => $documentType,
            'title' => $title,
            'file_disk' => 'public',
            'file_path' => $filePath,
            'metadata' => $metadata,
            'issued_at' => now(),
        ]);

        return response()->json([
            'message' => 'Document generated successfully.',
            'document' => $this->serializeIssuedDocument($document->load(['student', 'application', 'creator.role'])),
        ]);
    }

    private function serializeIssuedDocument(IssuedDocument $document): array
    {
        return [
            ...$document->toArray(),
            ...$this->buildSecureFileLinks($document->file_path, $this->resolveDownloadName($document)),
        ];
    }

    private function resolveDownloadName(IssuedDocument $document): string
    {
        return Str::slug($document->title) . '.pdf';
    }

    private function authorizeStudentDocumentAccess(Request $request, Student $student, bool $allowTeacher = false): void
    {
        $role = $request->user()?->role?->slug;

        if (in_array($role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF], true)) {
            return;
        }

        if ($allowTeacher && $role === User::ROLE_TEACHER) {
            return;
        }

        if ($role === User::ROLE_STUDENT && $request->user()?->student?->id === $student->id) {
            return;
        }

        abort(403, 'You are not allowed to generate this document.');
    }

    private function authorizeApplicationDocumentAccess(Request $request, Application $application): void
    {
        $user = $request->user();
        $role = $user?->role?->slug;

        if (in_array($role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER], true)) {
            return;
        }

        if ($role === User::ROLE_APPLICANT && $application->applicant_user_id === $user?->id) {
            return;
        }

        if ($role === User::ROLE_STUDENT && $application->student?->user_id === $user?->id) {
            return;
        }

        abort(403, 'You are not allowed to generate this document.');
    }

    private function authorizeRole(Request $request, array $roles, string $message): void
    {
        abort_unless(in_array($request->user()?->role?->slug, $roles, true), 403, $message);
    }

    private function gradeToPoint(string $grade): float
    {
        return match (Str::upper(trim($grade))) {
            'A+', 'A' => 4.00,
            'B+' => 3.50,
            'B' => 3.00,
            'C' => 2.00,
            'D' => 1.00,
            default => 0.00,
        };
    }

    private function buildSecureFileLinks(string $path, string $downloadName): array
    {
        $expiresAt = now()->addMinutes(20);

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

    private function getLogoDataUri(): ?string
    {
        $logoPath = public_path('logo.jpeg');

        if (! is_file($logoPath)) {
            return null;
        }

        $contents = file_get_contents($logoPath);

        if ($contents === false) {
            return null;
        }

        return 'data:image/jpeg;base64,' . base64_encode($contents);
    }
}
