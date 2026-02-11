<?php

namespace App\Services;

use App\Models\Application;
use App\Models\CeCertificate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CECertificateGenerator
{
    /**
     * Create a CE certificate record for the given application.
     */
    public function createFromEligibility(Application $application, array $eligibility, ?string $approvedBy = null): CeCertificate
    {
        $verificationUuid = Str::uuid()->toString();

        $status = $eligibility['approval_required'] ? 'pending' : 'approved';

        $certificate = CeCertificate::create([
            'university_id' => $eligibility['university_id'],
            'preceptor_id' => $eligibility['preceptor_id'],
            'application_id' => $application->id,
            'contact_hours' => $eligibility['contact_hours'],
            'status' => $status,
            'approved_by' => $approvedBy,
            'verification_uuid' => $verificationUuid,
            'issued_at' => $status === 'approved' ? now() : null,
        ]);

        // Auto-generate PDF if no approval needed
        if (!$eligibility['approval_required']) {
            $this->generatePdf($certificate);
            $certificate->update(['status' => 'issued']);
        }

        return $certificate;
    }

    /**
     * Generate the CE certificate PDF and store it.
     */
    public function generatePdf(CeCertificate $certificate): string
    {
        $certificate->load([
            'university',
            'preceptor',
            'application.slot.site.manager',
            'application.slot.preceptor',
            'application.student.studentProfile.university',
            'application.student.studentProfile.program',
            'approvedByUser',
        ]);

        $frontendUrl = config('app.frontend_url', 'https://michelevens.github.io/ClinicLink');
        $verifyUrl = $frontendUrl . '/verify-ce/' . $certificate->verification_uuid;

        // Generate QR code as base64 PNG
        $qrPng = QrCode::format('png')->size(200)->margin(1)->generate($verifyUrl);
        $qrCode = 'data:image/png;base64,' . base64_encode($qrPng);

        $policy = $certificate->university->cePolicy;

        $pdf = Pdf::loadView('certificates.ce-template', [
            'certificate' => $certificate,
            'qrCode' => $qrCode,
            'verifyUrl' => $verifyUrl,
            'policy' => $policy,
        ])->setPaper('letter', 'landscape');

        $filename = "ce-certificates/{$certificate->preceptor_id}/{$certificate->id}.pdf";
        Storage::disk()->put($filename, $pdf->output());

        $certificate->update(['certificate_path' => $filename]);

        return $filename;
    }
}
