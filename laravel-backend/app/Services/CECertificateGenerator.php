<?php

namespace App\Services;

use App\Models\Application;
use App\Models\CeAuditEvent;
use App\Models\CeCertificate;
use App\Models\CeEvidenceSnapshot;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CECertificateGenerator
{
    /**
     * Create a CE certificate record for the given application.
     */
    public function createFromEligibility(
        Application $application,
        array $eligibility,
        ?string $approvedBy = null,
        ?string $actorId = null,
        string $actorRole = 'system',
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): CeCertificate {
        $verificationUuid = Str::uuid()->toString();

        $status = $eligibility['approval_required'] ? 'pending' : 'approved';

        // Determine policy version reference
        $policy = $eligibility['policy'] ?? null;
        $policyVersionId = $policy ? ($policy->id . ':v' . ($policy->version ?? 1)) : null;

        $certificate = CeCertificate::create([
            'university_id' => $eligibility['university_id'],
            'preceptor_id' => $eligibility['preceptor_id'],
            'application_id' => $application->id,
            'contact_hours' => $eligibility['contact_hours'],
            'status' => $status,
            'approved_by' => $approvedBy,
            'verification_uuid' => $verificationUuid,
            'issued_at' => $status === 'approved' ? now() : null,
            'policy_version_id' => $policyVersionId,
        ]);

        // Capture evidence snapshot
        CeEvidenceSnapshot::capture($certificate->id, $eligibility, $application);
        CeAuditEvent::record(
            $certificate->id, 'evidence_snapshot',
            $actorId, $actorRole,
            ['captured_at' => now()->toIso8601String()],
            $ipAddress, $userAgent,
        );

        // Record certificate_created audit event
        CeAuditEvent::record(
            $certificate->id, 'certificate_created',
            $actorId, $actorRole,
            [
                'application_id' => $application->id,
                'contact_hours' => $eligibility['contact_hours'],
                'status' => $status,
                'policy_version_id' => $policyVersionId,
            ],
            $ipAddress, $userAgent,
        );

        if ($eligibility['approval_required']) {
            CeAuditEvent::record(
                $certificate->id, 'pending_approval',
                $actorId, $actorRole,
                null, $ipAddress, $userAgent,
            );
        }

        // Auto-generate PDF if no approval needed
        if (!$eligibility['approval_required']) {
            $this->generatePdf($certificate);
            $certificate->update(['status' => 'issued']);

            CeAuditEvent::record(
                $certificate->id, 'issued',
                $actorId, $actorRole,
                ['auto_issued' => true],
                $ipAddress, $userAgent,
            );
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

        $frontendUrl = config('app.frontend_url');
        $verifyUrl = $frontendUrl . '/verify-ce/' . $certificate->verification_uuid;

        // Generate QR code as SVG (no imagick extension required)
        $qrSvg = QrCode::size(200)->margin(1)->generate($verifyUrl);
        $qrCode = 'data:image/svg+xml;base64,' . base64_encode($qrSvg);

        $policy = $certificate->university?->cePolicy;

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
