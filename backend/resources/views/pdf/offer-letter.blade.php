@extends('pdf.layouts.college-document')

@php($documentHeading = $documentHeading ?? 'Admission Offer Letter')
@php($documentReference = $documentReference ?? $application->application_no)

@section('content')
    <div class="content-card">
        <p>Dear {{ $application->applicant_name }},</p>

        <p>
            We are pleased to confirm that you have been selected for admission to
            <strong>IBNU ABBAS ARABIC COLLEGE</strong> in the
            <strong>{{ strtoupper($application->department) }}</strong> department.
            This offer is issued based on the information supplied in your application and remains
            subject to document verification and compliance with college regulations.
        </p>

        <table class="summary-table" style="margin-top: 16px;">
            <tr>
                <td class="label">Application Number</td>
                <td>{{ $application->application_no }}</td>
                <td class="label">Offer Date</td>
                <td>{{ optional($application->offer_issued_at)->format('d M Y') ?: $generatedAt->format('d M Y') }}</td>
            </tr>
            <tr>
                <td class="label">Applicant Name</td>
                <td>{{ $application->applicant_name }}</td>
                <td class="label">Department</td>
                <td>{{ strtoupper($application->department) }}</td>
            </tr>
        </table>

        <div class="section-title">Conditions of Offer</div>
        <ol style="margin: 0; padding-left: 18px;">
            <li>Present all original certificates, identity documents, and guardian records during final admission.</li>
            <li>Complete registration formalities and fee clearance within the time stated by the administration office.</li>
            <li>Adhere to the academic, disciplinary, and attendance policies of the college from the first day of enrollment.</li>
            <li>This offer may be withdrawn if any supplied information is found to be inaccurate or incomplete.</li>
        </ol>

        <p style="margin-top: 18px;">
            We look forward to welcoming you into the college community and pray that your studies
            here become a source of knowledge, character, and service.
        </p>
    </div>
@endsection
