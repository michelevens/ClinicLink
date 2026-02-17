<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\PreceptorProfile;
use App\Models\StudentProfile;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SamlController extends Controller
{
    /**
     * List SSO-enabled universities (public).
     */
    public function universities(): JsonResponse
    {
        $universities = University::where('sso_enabled', true)
            ->whereNotNull('saml_entity_id')
            ->whereNotNull('saml_sso_url')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($universities);
    }

    /**
     * Initiate SAML login — redirect user to IdP.
     */
    public function login(University $university)
    {
        if (!$university->sso_enabled || !$university->saml_sso_url) {
            return response()->json(['message' => 'SSO is not enabled for this university.'], 400);
        }

        $requestId = '_' . Str::uuid()->toString();
        $issuer = url('/api/sso/metadata');
        $acsUrl = url('/api/sso/acs/' . $university->id);
        $nameIdFormat = $university->saml_name_id_format ?: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';

        $authnRequest = $this->buildAuthnRequest($requestId, $issuer, $acsUrl, $university->saml_sso_url, $nameIdFormat);

        // Store request ID in session for InResponseTo validation
        session(['saml_request_id' => $requestId, 'saml_university_id' => $university->id]);

        // Redirect to IdP with SAMLRequest as GET parameter
        $encodedRequest = base64_encode(gzdeflate($authnRequest));
        $redirectUrl = $university->saml_sso_url . '?' . http_build_query([
            'SAMLRequest' => $encodedRequest,
            'RelayState' => url('/api/sso/acs/' . $university->id),
        ]);

        return redirect($redirectUrl);
    }

    /**
     * Assertion Consumer Service — receive and validate SAML response from IdP.
     */
    public function acs(University $university, Request $request)
    {
        if (!$university->sso_enabled) {
            return $this->ssoError('SSO is not enabled for this university.');
        }

        $samlResponse = $request->input('SAMLResponse');
        if (!$samlResponse) {
            return $this->ssoError('No SAML response received.');
        }

        try {
            $xml = base64_decode($samlResponse);
            $doc = new \DOMDocument();
            $doc->loadXML($xml);

            // Validate signature if certificate is configured
            if ($university->saml_certificate) {
                if (!$this->validateSignature($doc, $university->saml_certificate)) {
                    return $this->ssoError('SAML signature validation failed.');
                }
            }

            // Parse assertion
            $xpath = new \DOMXPath($doc);
            $xpath->registerNamespace('saml', 'urn:oasis:names:tc:SAML:2.0:assertion');
            $xpath->registerNamespace('samlp', 'urn:oasis:names:tc:SAML:2.0:protocol');

            // Check status
            $statusCode = $xpath->query('//samlp:Response/samlp:Status/samlp:StatusCode/@Value')->item(0)?->nodeValue;
            if ($statusCode !== 'urn:oasis:names:tc:SAML:2.0:status:Success') {
                return $this->ssoError('SAML authentication was not successful.');
            }

            // Extract NameID (email)
            $nameId = $xpath->query('//saml:Assertion/saml:Subject/saml:NameID')->item(0)?->nodeValue;
            if (!$nameId) {
                return $this->ssoError('No NameID found in SAML assertion.');
            }

            // Extract attributes
            $attributes = $this->extractAttributes($xpath);

            // Find or create user
            $user = $this->findOrCreateUser($nameId, $attributes, $university);

            // Issue Sanctum token
            $token = $user->createToken('sso-session', ['*'], now()->addHours(24))->plainTextToken;

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'sso_login',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'metadata' => [
                    'provider' => 'saml',
                    'university_id' => $university->id,
                    'university_name' => $university->name,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Redirect to frontend with token
            $frontendUrl = config('app.frontend_url');
            return redirect("{$frontendUrl}/sso/callback?token={$token}");

        } catch (\Throwable $e) {
            Log::error('SAML ACS error: ' . $e->getMessage(), [
                'university_id' => $university->id,
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->ssoError('An error occurred processing your SSO login.');
        }
    }

    /**
     * SP metadata endpoint for IdP configuration.
     */
    public function metadata()
    {
        $entityId = url('/api/sso/metadata');
        $acsUrl = url('/api/sso/acs/{university}');

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="{$entityId}">
    <md:SPSSODescriptor AuthnRequestsSigned="false"
                        WantAssertionsSigned="true"
                        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                    Location="{$acsUrl}"
                                    index="1" />
    </md:SPSSODescriptor>
</md:EntityDescriptor>
XML;

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * Admin: update SAML configuration for a university.
     */
    public function updateSaml(University $university, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sso_enabled' => ['required', 'boolean'],
            'saml_entity_id' => ['required_if:sso_enabled,true', 'nullable', 'string', 'max:2048'],
            'saml_sso_url' => ['required_if:sso_enabled,true', 'nullable', 'url', 'max:2048'],
            'saml_slo_url' => ['nullable', 'url', 'max:2048'],
            'saml_certificate' => ['required_if:sso_enabled,true', 'nullable', 'string'],
            'saml_name_id_format' => ['nullable', 'string', 'max:255'],
            'saml_attribute_map' => ['nullable', 'array'],
            'sso_auto_approve' => ['nullable', 'boolean'],
            'sso_default_role' => ['nullable', 'in:student,preceptor,coordinator,professor,site_manager'],
        ]);

        // Validate certificate format if provided
        if (!empty($validated['saml_certificate'])) {
            $cert = $validated['saml_certificate'];
            // Strip PEM headers if included
            $cert = preg_replace('/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/', '', $cert);
            $decoded = base64_decode($cert, true);
            if ($decoded === false) {
                return response()->json(['message' => 'Invalid certificate format. Provide a valid X.509 certificate.'], 422);
            }
            // Store clean base64 certificate
            $validated['saml_certificate'] = $cert;
        }

        $university->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_saml_config',
            'entity_type' => 'University',
            'entity_id' => $university->id,
            'metadata' => [
                'sso_enabled' => $validated['sso_enabled'],
                'university_name' => $university->name,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($university->fresh());
    }

    // ─── Private helpers ─────────────────────────────────────────

    private function buildAuthnRequest(string $id, string $issuer, string $acsUrl, string $destination, string $nameIdFormat): string
    {
        $issueInstant = gmdate('Y-m-d\TH:i:s\Z');

        return <<<XML
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                    ID="{$id}"
                    Version="2.0"
                    IssueInstant="{$issueInstant}"
                    Destination="{$destination}"
                    AssertionConsumerServiceURL="{$acsUrl}"
                    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    <saml:Issuer>{$issuer}</saml:Issuer>
    <samlp:NameIDPolicy Format="{$nameIdFormat}" AllowCreate="true" />
</samlp:AuthnRequest>
XML;
    }

    private function validateSignature(\DOMDocument $doc, string $certificate): bool
    {
        $xpath = new \DOMXPath($doc);
        $xpath->registerNamespace('ds', 'http://www.w3.org/2000/09/xmldsig#');

        $signatureNode = $xpath->query('//ds:Signature')->item(0);
        if (!$signatureNode) {
            // No signature present — could be acceptable for some IdPs
            Log::warning('SAML response has no signature');
            return true;
        }

        // Extract signed info and signature value
        $signedInfo = $xpath->query('.//ds:SignedInfo', $signatureNode)->item(0);
        $signatureValue = $xpath->query('.//ds:SignatureValue', $signatureNode)->item(0)?->nodeValue;

        if (!$signedInfo || !$signatureValue) {
            return false;
        }

        // Build the certificate in PEM format
        $pemCert = "-----BEGIN CERTIFICATE-----\n" . chunk_split($certificate, 64, "\n") . "-----END CERTIFICATE-----";

        // Extract public key from certificate
        $pubKey = openssl_pkey_get_public($pemCert);
        if (!$pubKey) {
            Log::error('Failed to extract public key from IdP certificate');
            return false;
        }

        // Canonicalize SignedInfo
        $c14n = $signedInfo->C14N(true, false);

        // Determine algorithm
        $algorithmNode = $xpath->query('.//ds:SignatureMethod/@Algorithm', $signatureNode)->item(0)?->nodeValue;
        $algorithm = match ($algorithmNode) {
            'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256' => OPENSSL_ALGO_SHA256,
            'http://www.w3.org/2001/04/xmldsig-more#rsa-sha384' => OPENSSL_ALGO_SHA384,
            'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512' => OPENSSL_ALGO_SHA512,
            default => OPENSSL_ALGO_SHA256,
        };

        $result = openssl_verify($c14n, base64_decode($signatureValue), $pubKey, $algorithm);

        return $result === 1;
    }

    private function extractAttributes(\DOMXPath $xpath): array
    {
        $attributes = [];
        $attrNodes = $xpath->query('//saml:Assertion/saml:AttributeStatement/saml:Attribute');

        foreach ($attrNodes as $attrNode) {
            $name = $attrNode->getAttribute('Name');
            $values = [];
            $valueNodes = $xpath->query('.//saml:AttributeValue', $attrNode);
            foreach ($valueNodes as $valueNode) {
                $values[] = $valueNode->nodeValue;
            }
            $attributes[$name] = count($values) === 1 ? $values[0] : $values;
        }

        return $attributes;
    }

    private function findOrCreateUser(string $email, array $attributes, University $university): User
    {
        $email = strtolower(trim($email));

        // Try to find by SSO identity first
        $user = User::where('sso_provider', 'saml')
            ->where('sso_id', $email)
            ->where('sso_university_id', $university->id)
            ->first();

        if ($user) {
            // Update name from IdP if available
            $this->updateUserFromAttributes($user, $attributes, $university);
            return $user;
        }

        // Try to find by email
        $user = User::where('email', $email)->first();

        if ($user) {
            // Link existing account to SSO
            $user->update([
                'sso_provider' => 'saml',
                'sso_id' => $email,
                'sso_university_id' => $university->id,
            ]);

            // Auto-verify email for SSO users
            if ($university->sso_auto_approve && !$user->email_verified) {
                $user->update([
                    'email_verified' => true,
                    'email_verified_at' => now(),
                ]);
            }

            return $user;
        }

        // Create new user from SAML assertion
        $attributeMap = $university->saml_attribute_map ?? [];
        $role = $this->resolveRole($attributes, $attributeMap, $university);

        $firstName = $this->resolveAttribute($attributes, $attributeMap, 'first_name', [
            'urn:oid:2.5.4.42',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            'givenName',
            'firstName',
        ]) ?: 'SSO';

        $lastName = $this->resolveAttribute($attributes, $attributeMap, 'last_name', [
            'urn:oid:2.5.4.4',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
            'sn',
            'lastName',
        ]) ?: 'User';

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => null,
            'role' => $role,
            'is_active' => true,
            'sso_provider' => 'saml',
            'sso_id' => $email,
            'sso_university_id' => $university->id,
            'email_verified' => true,
            'email_verified_at' => now(),
            'trial_ends_at' => $role === 'student' ? now()->addMonths(3) : null,
        ]);

        // Create student profile linked to university
        if (in_array($role, ['student', 'coordinator', 'professor'])) {
            StudentProfile::create([
                'user_id' => $user->id,
                'university_id' => $university->id,
            ]);
        }

        // Create preceptor profile
        if ($role === 'preceptor') {
            PreceptorProfile::create([
                'user_id' => $user->id,
                'specialties' => [],
                'availability_status' => 'available',
                'profile_visibility' => 'public',
            ]);
        }

        return $user;
    }

    private function updateUserFromAttributes(User $user, array $attributes, University $university): void
    {
        $attributeMap = $university->saml_attribute_map ?? [];
        $updates = [];

        $firstName = $this->resolveAttribute($attributes, $attributeMap, 'first_name', [
            'urn:oid:2.5.4.42', 'givenName', 'firstName',
        ]);
        if ($firstName && $firstName !== $user->first_name) {
            $updates['first_name'] = $firstName;
        }

        $lastName = $this->resolveAttribute($attributes, $attributeMap, 'last_name', [
            'urn:oid:2.5.4.4', 'sn', 'lastName',
        ]);
        if ($lastName && $lastName !== $user->last_name) {
            $updates['last_name'] = $lastName;
        }

        if ($updates) {
            $user->update($updates);
        }
    }

    private function resolveAttribute(array $attributes, array $attributeMap, string $field, array $defaultKeys): ?string
    {
        // Check custom attribute map first
        if (isset($attributeMap[$field])) {
            $key = $attributeMap[$field];
            if (isset($attributes[$key])) {
                return is_array($attributes[$key]) ? $attributes[$key][0] : $attributes[$key];
            }
        }

        // Fall back to common SAML attribute names
        foreach ($defaultKeys as $key) {
            if (isset($attributes[$key])) {
                return is_array($attributes[$key]) ? $attributes[$key][0] : $attributes[$key];
            }
        }

        return null;
    }

    private function resolveRole(array $attributes, array $attributeMap, University $university): string
    {
        // Check if attribute map defines a role mapping
        if (isset($attributeMap['role'])) {
            $roleAttrKey = $attributeMap['role'];
            if (isset($attributes[$roleAttrKey])) {
                $roleValue = is_array($attributes[$roleAttrKey]) ? $attributes[$roleAttrKey][0] : $attributes[$roleAttrKey];
                $roleValue = strtolower(trim($roleValue));

                // Map common eduPerson/SAML role values to ClinicLink roles
                $roleMapping = [
                    'student' => 'student',
                    'faculty' => 'coordinator',
                    'staff' => 'coordinator',
                    'preceptor' => 'preceptor',
                    'coordinator' => 'coordinator',
                    'professor' => 'professor',
                    'site_manager' => 'site_manager',
                    'admin' => 'student', // Never auto-assign admin from SSO
                ];

                if (isset($roleMapping[$roleValue])) {
                    return $roleMapping[$roleValue];
                }
            }
        }

        // Check eduPersonAffiliation attribute
        $affiliation = $attributes['urn:oid:1.3.6.1.4.1.5923.1.1.1.1']
            ?? $attributes['eduPersonAffiliation']
            ?? null;

        if ($affiliation) {
            $affValue = strtolower(is_array($affiliation) ? $affiliation[0] : $affiliation);
            if (in_array($affValue, ['student', 'alum'])) return 'student';
            if (in_array($affValue, ['faculty', 'staff', 'employee'])) return 'coordinator';
        }

        return $university->sso_default_role ?: 'student';
    }

    private function ssoError(string $message)
    {
        $frontendUrl = config('app.frontend_url');
        $encodedMessage = urlencode($message);
        return redirect("{$frontendUrl}/sso/callback?error={$encodedMessage}");
    }
}
