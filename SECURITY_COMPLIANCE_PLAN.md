# ClinicLink Security & Compliance Certification Plan

## Goal: SOC 2 Type II Certified | HIPAA Compliant | Security Audited & Verified

> This document is the master plan for achieving the highest security certifications for the ClinicLink platform. It covers every control, policy, technical safeguard, and organizational process required to pass SOC 2 Type II audits, HIPAA compliance assessments, and third-party security verification.

---

## Table of Contents

1. [Certification Targets](#1-certification-targets)
2. [Current State Assessment](#2-current-state-assessment)
3. [SOC 2 Type II Compliance](#3-soc-2-type-ii-compliance)
4. [HIPAA Compliance](#4-hipaa-compliance)
5. [FERPA Compliance](#5-ferpa-compliance)
6. [Technical Security Controls](#6-technical-security-controls)
7. [Infrastructure Security](#7-infrastructure-security)
8. [Application Security](#8-application-security)
9. [Data Protection & Encryption](#9-data-protection--encryption)
10. [Identity & Access Management](#10-identity--access-management)
11. [Logging, Monitoring & Incident Response](#11-logging-monitoring--incident-response)
12. [Organizational Policies & Procedures](#12-organizational-policies--procedures)
13. [Vendor & Third-Party Risk Management](#13-vendor--third-party-risk-management)
14. [Penetration Testing & Vulnerability Management](#14-penetration-testing--vulnerability-management)
15. [Business Continuity & Disaster Recovery](#15-business-continuity--disaster-recovery)
16. [Employee Security & Training](#16-employee-security--training)
17. [Privacy & Data Governance](#17-privacy--data-governance)
18. [Compliance Documentation Artifacts](#18-compliance-documentation-artifacts)
19. [Implementation Roadmap](#19-implementation-roadmap)
20. [Audit Preparation Checklist](#20-audit-preparation-checklist)
21. [Budget Estimates](#21-budget-estimates)

---

## 1. Certification Targets

### Primary Certifications

| Certification | Scope | Timeline | Priority |
|--------------|-------|----------|----------|
| **SOC 2 Type I** | Trust Services Criteria (Security, Availability, Confidentiality) | Month 6 | Critical |
| **SOC 2 Type II** | 6-12 month observation period after Type I | Month 12-18 | Critical |
| **HIPAA Compliance** | PHI handling for student health records | Month 3 | Critical |
| **FERPA Compliance** | Student educational records protection | Month 3 | Critical |

### Secondary Certifications (Post-SOC 2)

| Certification | Scope | Timeline | Priority |
|--------------|-------|----------|----------|
| **ISO 27001** | Information Security Management System (ISMS) | Month 18-24 | High |
| **HITRUST CSF** | Healthcare-specific security framework | Month 24-30 | High |
| **PCI DSS Level 4** | Payment card data (if processing payments) | Month 12 | Medium |
| **CCPA/GDPR** | Privacy regulations (if expanding markets) | Month 18 | Medium |

### Why These Matter for ClinicLink

- **Hospitals and health systems** require SOC 2 + HIPAA before integrating any platform
- **Universities** require FERPA compliance for student data
- **Enterprise sales** are gated by security questionnaires that demand these certifications
- **Investor confidence** — SOC 2 certification increases valuation by 15-25%
- **Insurance** — cyber liability premiums drop 30-40% with SOC 2
- **Competitive moat** — most competitors lack formal certifications

---

## 2. Current State Assessment

### What We Have

| Area | Current State | Gap |
|------|--------------|-----|
| Authentication | Sanctum + MFA (TOTP) + account lockout (5 fails → 30min) | ✅ Done — Need SSO for enterprise |
| Authorization | Role-based (6 roles) at API level | Need attribute-based access control (ABAC) |
| Encryption in transit | HTTPS via Railway (TLS 1.3) + HSTS header | ✅ Done — HSTS enforced in production |
| Encryption at rest | Railway PostgreSQL + app-level encryption (mfa_secret, mfa_backup_codes) | Need encryption for additional PHI fields |
| Password policy | bcrypt hashing | Need complexity rules, rotation, breach detection |
| Security headers | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, HSTS | ✅ Done |
| Token management | 24hr Sanctum token expiry + daily pruning of expired tokens | ✅ Done |
| Logging | Platform-wide immutable AuditLog + CE-specific CeAuditEvent | ✅ Done — Need SIEM integration |
| Rate limiting | Global API throttle (120/min auth, 60/min guest) + 10/min on auth endpoints | ✅ Done — Need WAF |
| CORS | Configured for specific origins | Good baseline, needs review |
| CSRF | Disabled for API (token auth instead) | Acceptable for SPA + token auth |
| Dependency management | npm + composer | Need automated vulnerability scanning |
| Backup | Railway automatic | Need documented RPO/RTO, tested restores |
| Incident response | None | Need formal IR plan, team, runbooks |

### Risk Assessment Summary

| Risk | Likelihood | Impact | Current Mitigation | Remaining |
|------|-----------|--------|-------------------|----------|
| Data breach (PHI) | Medium | Critical | RBAC + MFA + encrypted PHI fields + audit logging | Need DLP, monitoring alerts |
| Account takeover | Low | High | MFA + account lockout (5 fails → 30min) + rate limiting | Need anomaly detection |
| SQL injection | Low | Critical | Eloquent ORM | Need WAF, parameterized queries audit |
| XSS | Low | High | React auto-escaping + security headers (X-XSS-Protection, X-Content-Type-Options) | Need CSP header |
| Insider threat | Low | High | Immutable audit trail (AuditLog + CeAuditEvent) with IP/UA tracking | Need SIEM alerting |
| DDoS | Low | Medium | Global rate limiting (120/min auth, 60/min guest) | Need CDN, WAF |
| Supply chain attack | Low | High | No dependency scanning | Need automated SCA, lockfile audits |

---

## 3. SOC 2 Type II Compliance

SOC 2 is built on 5 Trust Services Criteria. ClinicLink must address at minimum: **Security** (required), **Availability**, and **Confidentiality**.

### 3.1 Security (Common Criteria — CC)

#### CC1: Control Environment

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC1.1 | Board/management oversight of security | Appoint a Security Officer; quarterly security reviews |
| CC1.2 | Organizational structure with security accountability | Org chart with security roles; RACI matrix |
| CC1.3 | Commitment to competence | Security training program; hiring standards |
| CC1.4 | Accountability for security responsibilities | Job descriptions include security duties |
| CC1.5 | Board independence and expertise | Advisory board with security expertise |

#### CC2: Communication and Information

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC2.1 | Internal security communication | Monthly security newsletters; Slack #security channel |
| CC2.2 | External security communication | Security page on website; responsible disclosure policy |
| CC2.3 | Security policies communicated to third parties | Vendor security requirements; BAAs for healthcare data |

#### CC3: Risk Assessment

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC3.1 | Risk assessment process | Annual risk assessment; risk register maintained |
| CC3.2 | Fraud risk assessment | Background checks; separation of duties |
| CC3.3 | Risk from changes | Change management process; security review for changes |
| CC3.4 | Risk appetite defined | Risk tolerance matrix approved by leadership |

#### CC4: Monitoring Activities

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC4.1 | Ongoing monitoring of controls | Automated monitoring dashboards; weekly reviews |
| CC4.2 | Remediation of deficiencies | Issue tracking; SLA for remediation |

#### CC5: Control Activities

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC5.1 | Logical access controls | RBAC + ABAC; principle of least privilege |
| CC5.2 | Technology infrastructure controls | Hardened servers; network segmentation |
| CC5.3 | Security policies enforced | Automated policy enforcement; exception process |

#### CC6: Logical and Physical Access Controls

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC6.1 | Logical access security software | MFA for all users; SSO for enterprise |
| CC6.2 | New user registration and authorization | Onboarding checklist; manager approval |
| CC6.3 | Access removal on termination | Automated deprovisioning; access reviews |
| CC6.4 | Access review and reauthorization | Quarterly access reviews |
| CC6.5 | Physical access restrictions | Cloud-hosted; provider SOC 2 relied upon |
| CC6.6 | Manage access credentials | Password policy; credential rotation |
| CC6.7 | Restrict access to assets | Network segmentation; firewall rules |
| CC6.8 | Prevent unauthorized access | IDS/IPS; WAF; anomaly detection |

#### CC7: System Operations

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC7.1 | Detect and manage vulnerabilities | Automated scanning; patch management |
| CC7.2 | Monitor for anomalies | SIEM; alerting; on-call rotation |
| CC7.3 | Evaluate security events | Incident classification; triage process |
| CC7.4 | Respond to security incidents | IR plan; tabletop exercises |
| CC7.5 | Recover from incidents | Recovery procedures; post-mortem process |

#### CC8: Change Management

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC8.1 | Change management process | PR reviews; staging environment; approval gates |

#### CC9: Risk Mitigation

| Control | Requirement | Implementation |
|---------|------------|----------------|
| CC9.1 | Vendor risk management | Vendor assessment questionnaires; annual reviews |
| CC9.2 | Vendor agreements | BAAs; DPAs; SLAs with security clauses |

### 3.2 Availability (A)

| Control | Requirement | Implementation |
|---------|------------|----------------|
| A1.1 | Capacity planning | Auto-scaling; resource monitoring; load testing |
| A1.2 | Backup and recovery | Automated backups; RPO < 1hr; RTO < 4hr |
| A1.3 | Recovery testing | Quarterly backup restore tests; documented results |

### 3.3 Confidentiality (C)

| Control | Requirement | Implementation |
|---------|------------|----------------|
| C1.1 | Identify confidential information | Data classification policy; PHI/PII inventory |
| C1.2 | Dispose of confidential information | Data retention policy; secure deletion |

---

## 4. HIPAA Compliance

ClinicLink handles student health records (immunizations, drug screenings, background checks, clinical credentials) which may constitute PHI.

### 4.1 Administrative Safeguards

| Safeguard | Requirement | Implementation |
|-----------|------------|----------------|
| Security Officer | Designated HIPAA Security Officer | Assign named individual; document role |
| Privacy Officer | Designated HIPAA Privacy Officer | Assign named individual; document role |
| Risk Analysis | Formal risk analysis of ePHI | Annual risk assessment with NIST framework |
| Risk Management | Risk mitigation plan | Remediation tracking; risk register |
| Sanction Policy | Workforce sanctions for violations | HR policy; progressive discipline |
| Information System Activity Review | Regular review of audit logs | Weekly log reviews; automated alerts |
| Workforce Training | HIPAA training for all workforce | Annual training; new hire orientation |
| Contingency Plan | Emergency mode operation plan | DR plan; data backup plan; testing |
| Business Associate Agreements | BAAs with all vendors handling PHI | Railway BAA; any subprocessor BAAs |

### 4.2 Technical Safeguards

| Safeguard | Requirement | Implementation |
|-----------|------------|----------------|
| Access Control | Unique user identification | UUID-based user IDs; unique credentials |
| Emergency Access | Emergency access procedure | Break-glass accounts; documented process |
| Automatic Logoff | Session timeout | 30-minute idle timeout; token expiration |
| Encryption | Encrypt ePHI at rest and in transit | AES-256 at rest; TLS 1.3 in transit |
| Audit Controls | Hardware/software/procedural logging | Comprehensive audit trail for all PHI access |
| Integrity Controls | Protect ePHI from improper alteration | Checksums; database constraints; immutable logs |
| Authentication | Verify identity of users | MFA; strong password policy |
| Transmission Security | Encrypt ePHI in transit | TLS 1.3; certificate pinning |

### 4.3 Physical Safeguards

| Safeguard | Requirement | Implementation |
|-----------|------------|----------------|
| Facility Access | Control physical access | Cloud-hosted; rely on Railway/AWS SOC 2 |
| Workstation Security | Secure workstations accessing ePHI | Endpoint security policy; MDM |
| Device Controls | Media disposal and reuse | Encrypted volumes; secure deletion |

### 4.4 PHI Data Inventory for ClinicLink

| Data Element | Classification | Storage | Encryption | Access |
|-------------|---------------|---------|------------|--------|
| Student immunization records | PHI | credentials table | AES-256 required | Student, Site Manager, Admin |
| Drug screening results | PHI | credentials table | AES-256 required | Student, Site Manager, Admin |
| Background check results | PHI | credentials table | AES-256 required | Student, Site Manager, Admin |
| Health insurance info | PHI | student_profiles | AES-256 required | Student, Admin |
| Clinical evaluation scores | Education Record | evaluations table | Encrypted | Student, Preceptor, Coordinator |
| Hour logs | Education Record | hour_logs table | Standard | Student, Preceptor |
| Email/phone | PII | users table | Standard | User, Admin |
| Passwords | Credential | users table | bcrypt hashed | System only |

---

## 5. FERPA Compliance

ClinicLink processes student educational records through university partnerships.

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Written consent for disclosure | Consent captured during registration; stored in audit log |
| Directory information policy | Define which fields are directory vs. protected |
| Right to inspect records | Student can view all their data via profile/dashboard |
| Right to request amendment | Settings page allows profile updates; support process for disputes |
| Annual notification | Universities notified of FERPA practices |
| Legitimate educational interest | Access limited to roles with educational need-to-know |
| Minimum necessary standard | API returns only data needed for each role |
| Audit trail | Log all access to student records |

---

## 6. Technical Security Controls

### 6.1 Authentication Hardening

```
Priority: CRITICAL | Timeline: Month 1-2
```

| Control | Current | Target | Status |
|---------|---------|--------|--------|
| Multi-Factor Authentication | ✅ TOTP (Google Auth/Authy) + 8 backup codes | Required for all users | **DONE** — Optional per user, enforced for admin planned |
| Password complexity | ✅ NIST 800-63B: min 12 chars, mixed case, numbers, symbols, HaveIBeenPwned | NIST 800-63B compliant | **DONE** — `Password::defaults()` in AppServiceProvider with `uncompromised()` check |
| Password rotation | None | Encourage, not force rotation | Need compromised password notifications |
| Account lockout | ✅ 5 failed attempts = 30min lockout | 5 failed = 30min lockout | **DONE** — `failed_login_attempts` + `locked_until` on User model |
| Session management | ✅ 24hr token expiry + daily pruning | 24hr token expiry, 30min idle | **DONE** — `sanctum.expiration = 1440`, `sanctum:prune-expired` scheduled daily |
| Brute force protection | ✅ Rate limiting (10/min auth, 120/min API) | Rate limiting + CAPTCHA | **PARTIAL** — Rate limiting done, CAPTCHA not yet |
| Security headers | ✅ X-Content-Type-Options, X-Frame-Options, HSTS, X-XSS-Protection, Referrer-Policy, Permissions-Policy | All OWASP recommended headers | **DONE** — SecurityHeaders middleware |
| Audit logging | ✅ Platform-wide AuditLog + CE-specific CeAuditEvent | Comprehensive audit trail for all actions | **DONE** — Auth, admin CRUD, credentials, hour logs, CE certificates |
| PHI encryption | ✅ mfa_secret (encrypted), mfa_backup_codes (encrypted:array) | App-level encryption for all PHI | **PARTIAL** — MFA fields done, other PHI uses storage-level encryption (R2) |
| SSO (Enterprise) | Not implemented | SAML 2.0 / OIDC for universities | Planned for enterprise phase |

#### MFA Implementation Plan

```php
// Backend: MFA verification flow
// 1. Add 'two_factor_secret' and 'two_factor_confirmed_at' to users table
// 2. Use pragmarx/google2fa-laravel package
// 3. Enrollment: Generate secret → show QR → verify code → confirm
// 4. Login: After password check → if MFA enabled → require TOTP code
// 5. Recovery codes: Generate 8 one-time codes, stored hashed
```

```typescript
// Frontend: MFA enrollment + challenge screens
// 1. Settings page: "Enable Two-Factor Authentication" button
// 2. Show QR code + manual entry key
// 3. Verification input (6-digit code)
// 4. Recovery codes display (one-time view, download option)
// 5. Login flow: After credentials → MFA challenge screen
```

### 6.2 Authorization Hardening

```
Priority: HIGH | Timeline: Month 2-3
```

| Control | Implementation |
|---------|----------------|
| Principle of least privilege | Review all API endpoints; restrict to minimum required roles |
| Attribute-based access control | Add ownership checks (e.g., site_manager can only manage their sites) |
| API authorization middleware | Create Laravel policies for every model |
| Admin privilege escalation protection | Require re-authentication for admin actions |
| Role change auditing | Log all role changes with before/after values |

### 6.3 API Security

```
Priority: HIGH | Timeline: Month 1-3
```

| Control | Implementation |
|---------|----------------|
| Rate limiting | Global: 60/min unauthenticated, 120/min authenticated; Sensitive: 5/min for login/register |
| Request size limits | Max 10MB request body; max 1MB JSON payload |
| Input validation | Strict validation on every endpoint; reject unexpected fields |
| Output encoding | JSON responses with proper Content-Type; no HTML in API responses |
| CORS hardening | Strict origin allowlist; no wildcards |
| Security headers | X-Content-Type-Options, X-Frame-Options, CSP, HSTS, Referrer-Policy |
| API versioning | Version all endpoints (/api/v1/) for controlled deprecation |
| Request signing | HMAC signature for webhook payloads |

### 6.4 Frontend Security

```
Priority: HIGH | Timeline: Month 2-3
```

| Control | Implementation |
|---------|----------------|
| Content Security Policy | Strict CSP headers; nonce-based script loading |
| Subresource Integrity | SRI hashes on external scripts/styles |
| XSS prevention | React auto-escaping + DOMPurify for any user HTML |
| Clickjacking protection | X-Frame-Options: DENY |
| Secure cookie flags | HttpOnly, Secure, SameSite=Strict |
| Local storage security | Never store PHI in localStorage; encrypt sensitive tokens |
| Dependency security | npm audit; Snyk; Dependabot |

---

## 7. Infrastructure Security

### 7.1 Cloud Infrastructure (Railway)

| Control | Implementation |
|---------|----------------|
| Provider compliance | Verify Railway's SOC 2 Type II report; document reliance |
| Network isolation | Private networking between services; no public database |
| Environment separation | Separate Railway environments for dev, staging, production |
| Secrets management | Railway environment variables; never in code; rotate quarterly |
| Container security | Minimal base images; no root processes; read-only filesystems |
| Infrastructure as Code | Define infrastructure in code; version controlled |

### 7.2 Database Security

| Control | Implementation |
|---------|----------------|
| Encryption at rest | PostgreSQL with AES-256 (Railway default) |
| Encryption in transit | SSL/TLS connections required |
| Access control | Database credentials rotated quarterly; principle of least privilege |
| Connection pooling | PgBouncer for connection management |
| Query logging | Log slow queries; log all admin queries |
| Backup encryption | Encrypted backups; tested monthly |
| Data masking | Mask PHI in non-production environments |

### 7.3 Network Security

| Control | Implementation |
|---------|----------------|
| WAF | Cloudflare WAF or AWS WAF in front of API |
| DDoS protection | Cloudflare DDoS mitigation |
| TLS configuration | TLS 1.3 only; strong cipher suites; HSTS preload |
| Certificate management | Auto-renewal via Let's Encrypt; certificate monitoring |
| DNS security | DNSSEC enabled; DNS monitoring |

---

## 8. Application Security

### 8.1 Secure Development Lifecycle (SDL)

| Phase | Activities |
|-------|-----------|
| **Requirements** | Security requirements in user stories; threat modeling |
| **Design** | Architecture security review; data flow diagrams |
| **Development** | Secure coding standards; linting rules; pre-commit hooks |
| **Code Review** | Mandatory PR reviews; security-focused review checklist |
| **Testing** | SAST (static analysis); DAST (dynamic analysis); unit tests for auth |
| **Deployment** | Automated CI/CD; no manual deployments; approval gates |
| **Operations** | Monitoring; alerting; incident response |

### 8.2 Code Security Standards

```
Enforce via ESLint, PHPStan, and pre-commit hooks:
```

| Standard | Enforcement |
|----------|-------------|
| No hardcoded secrets | git-secrets pre-commit hook; detect-secrets |
| No eval() or dynamic code execution | ESLint rules; PHPStan rules |
| Parameterized queries only | Eloquent ORM enforced; no raw queries without review |
| Input validation on all endpoints | Laravel Form Requests required |
| Output encoding | JSON responses; no HTML interpolation |
| Error handling | No stack traces in production; generic error messages |
| Dependency pinning | Lock files committed; exact versions only |
| No console.log in production | ESLint rule; build-time stripping |

### 8.3 CI/CD Security Pipeline

```yaml
# GitHub Actions Security Pipeline
security-checks:
  - name: Secret scanning (git-secrets)
  - name: Dependency audit (npm audit + composer audit)
  - name: SAST scan (Semgrep or SonarQube)
  - name: License compliance check
  - name: Container image scan (Trivy)
  - name: OWASP ZAP baseline scan (on staging)
  - name: Unit tests (with auth/authz tests)
  - name: Integration tests
  - name: Build verification
```

---

## 9. Data Protection & Encryption

### 9.1 Encryption Standards

| Data State | Standard | Implementation |
|-----------|----------|----------------|
| Data at rest (database) | AES-256 | PostgreSQL TDE + application-level encryption for PHI |
| Data at rest (backups) | AES-256 | Encrypted backup storage |
| Data at rest (files) | AES-256 | Encrypted file storage (S3 SSE-KMS) |
| Data in transit (API) | TLS 1.3 | HTTPS enforced; HSTS preload |
| Data in transit (database) | TLS 1.2+ | SSL-only database connections |
| Data in transit (internal) | TLS 1.2+ | Service mesh encryption |
| Data in use (memory) | N/A | Minimize PHI in memory; no swap |

### 9.2 Application-Level Encryption for PHI

```php
// Laravel encrypted casting for PHI fields
// In Credential model:
protected function casts(): array
{
    return [
        'credential_data' => 'encrypted',     // Immunization records, drug screens
        'file_path' => 'encrypted',            // Document storage paths
        'verification_notes' => 'encrypted',   // Verification details
    ];
}

// In StudentProfile model:
protected function casts(): array
{
    return [
        'health_insurance_info' => 'encrypted',
        'ssn_last_four' => 'encrypted',
        'emergency_contact' => 'encrypted',
    ];
}
```

### 9.3 Key Management

| Requirement | Implementation |
|-------------|----------------|
| Key generation | Cryptographically secure random generation |
| Key storage | AWS KMS or Railway environment variables (never in code) |
| Key rotation | Quarterly rotation; automated re-encryption |
| Key access | Principle of least privilege; audited access |
| Key backup | Encrypted key escrow; split knowledge |
| Key destruction | Secure deletion; documented process |

### 9.4 Data Classification Policy

| Level | Label | Examples | Controls |
|-------|-------|----------|----------|
| 1 | **Public** | Marketing content, feature descriptions | No special controls |
| 2 | **Internal** | Aggregated analytics, system configs | Access control; no public exposure |
| 3 | **Confidential** | User PII (email, phone, name) | Encryption; access logging; need-to-know |
| 4 | **Restricted** | PHI, credentials, passwords, keys | AES-256 encryption; MFA access; full audit trail; DLP |

---

## 10. Identity & Access Management

### 10.1 User Lifecycle Management

| Phase | Process |
|-------|---------|
| **Provisioning** | Registration → email verification → role assignment → access granted |
| **Access review** | Quarterly reviews; automated inactive account detection |
| **Role changes** | Approval workflow; audit logged; immediate access update |
| **Deprovisioning** | Immediate token revocation; data retention per policy |
| **Dormant accounts** | 90-day inactivity → warning; 180-day → suspension |

### 10.2 Admin Access Controls

| Control | Implementation |
|---------|----------------|
| Separate admin accounts | Admin actions require dedicated admin account |
| Admin MFA | Mandatory TOTP MFA for all admin accounts |
| Admin session duration | 1-hour max session; re-auth for sensitive actions |
| Admin audit trail | Every admin action logged with before/after state |
| Break-glass procedure | Emergency access with mandatory incident report |
| Admin access review | Monthly review of all admin accounts |

### 10.3 Service Account Management

| Control | Implementation |
|---------|----------------|
| Unique service accounts | Each integration gets unique credentials |
| Minimal permissions | Service accounts have only required permissions |
| Credential rotation | Automated quarterly rotation |
| Usage monitoring | Alert on unusual service account activity |

---

## 11. Logging, Monitoring & Incident Response

### 11.1 Audit Logging Requirements

**Every auditable event must capture:**
- Timestamp (UTC, ISO 8601)
- User ID (or "system" for automated actions)
- IP address
- User agent
- Action performed
- Resource type and ID
- Before/after values (for modifications)
- Success/failure status

**Events to log:**

| Category | Events |
|----------|--------|
| Authentication | Login, logout, failed login, MFA challenge, password reset, token refresh |
| Authorization | Access denied, role change, permission change |
| Data access | PHI viewed, PHI exported, PHI modified, PHI deleted |
| Admin actions | User created/modified/deleted, role assigned, system config changed |
| System | Application start/stop, deployment, migration, error |
| Security | Rate limit hit, WAF block, suspicious activity, vulnerability detected |

### 11.2 Implementation: Audit Trail System

```php
// New migration: create_audit_logs_table
Schema::create('audit_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('action');           // e.g., 'user.login', 'credential.viewed', 'slot.updated'
    $table->string('resource_type');    // e.g., 'User', 'Credential', 'RotationSlot'
    $table->uuid('resource_id')->nullable();
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->string('status');           // 'success', 'failure', 'denied'
    $table->json('metadata')->nullable();
    $table->timestamp('created_at');
    $table->index(['user_id', 'created_at']);
    $table->index(['resource_type', 'resource_id']);
    $table->index(['action', 'created_at']);
});
```

```php
// AuditService - centralized audit logging
class AuditService
{
    public static function log(
        string $action,
        ?string $resourceType = null,
        ?string $resourceId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        string $status = 'success',
        ?array $metadata = null
    ): void {
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => $status,
            'metadata' => $metadata,
        ]);
    }
}
```

### 11.3 Monitoring & Alerting

| Monitor | Tool | Alert Threshold |
|---------|------|----------------|
| Application errors | Sentry / Bugsnag | Any 5xx error |
| API response time | Railway metrics + custom | P95 > 2s |
| Database connections | PostgreSQL monitoring | > 80% pool utilization |
| Failed logins | Custom audit log query | > 10 failed logins from same IP in 5 min |
| Rate limiting | Custom middleware | > 100 rate-limited requests in 10 min |
| PHI access patterns | Custom audit log query | Unusual volume or off-hours access |
| Uptime | Uptime Robot / Better Stack | Any downtime > 30s |
| SSL certificate | Certificate monitoring | < 30 days to expiry |
| Dependency vulnerabilities | Dependabot / Snyk | Any critical/high severity |

### 11.4 Incident Response Plan

#### Severity Levels

| Level | Description | Examples | Response Time | Resolution Target |
|-------|------------|----------|---------------|-------------------|
| **SEV-1** | Critical security incident | Data breach, system compromise | 15 minutes | 4 hours |
| **SEV-2** | High security incident | Unauthorized access attempt, DDoS | 1 hour | 24 hours |
| **SEV-3** | Medium security issue | Vulnerability discovered, policy violation | 4 hours | 72 hours |
| **SEV-4** | Low security issue | Failed audit control, minor misconfiguration | 24 hours | 1 week |

#### Incident Response Phases

1. **Detection & Identification**
   - Automated monitoring alerts
   - Manual report via security@cliniclink.com
   - Classify severity level
   - Assign incident commander

2. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs
   - Preserve evidence (forensic snapshots)

3. **Eradication**
   - Remove root cause
   - Patch vulnerabilities
   - Reset affected credentials
   - Verify removal of attacker access

4. **Recovery**
   - Restore from clean backups if needed
   - Gradually restore services
   - Verify system integrity
   - Monitor for reoccurrence

5. **Post-Incident**
   - Blameless post-mortem within 72 hours
   - Update incident timeline
   - Identify improvement actions
   - Update runbooks and monitoring
   - Notify affected parties per HIPAA breach notification rules

#### HIPAA Breach Notification Requirements

| Breach Size | Notification Timeline | Notify |
|-------------|----------------------|--------|
| < 500 individuals | Within 60 days of discovery | Affected individuals + HHS annual log |
| >= 500 individuals | Within 60 days of discovery | Affected individuals + HHS + media |

---

## 12. Organizational Policies & Procedures

### Required Policy Documents

| Policy | Purpose | Review Cycle |
|--------|---------|-------------|
| **Information Security Policy** | Master security policy; scope, objectives, responsibilities | Annual |
| **Acceptable Use Policy** | Rules for using company systems and data | Annual |
| **Access Control Policy** | User provisioning, authentication, authorization | Annual |
| **Data Classification Policy** | How data is categorized and handled | Annual |
| **Data Retention & Disposal Policy** | How long data is kept; how it's destroyed | Annual |
| **Encryption Policy** | Encryption standards for data at rest and in transit | Annual |
| **Incident Response Policy** | How security incidents are handled | Annual + post-incident |
| **Business Continuity Plan** | How operations continue during disruptions | Annual + tested |
| **Disaster Recovery Plan** | How systems are recovered after disasters | Annual + tested |
| **Change Management Policy** | How changes to production are approved and deployed | Annual |
| **Vendor Management Policy** | How third-party vendors are assessed and managed | Annual |
| **Privacy Policy** | How user data is collected, used, and shared | Annual + on change |
| **Password Policy** | Password complexity, rotation, storage standards | Annual |
| **Remote Work Security Policy** | Security requirements for remote workers | Annual |
| **Physical Security Policy** | Physical access controls (or cloud reliance documentation) | Annual |
| **Risk Management Policy** | How risks are identified, assessed, and mitigated | Annual |
| **Code of Conduct** | Expected behavior; reporting violations | Annual |
| **Whistleblower Policy** | Protection for reporting security concerns | Annual |

---

## 13. Vendor & Third-Party Risk Management

### Current Vendors to Assess

| Vendor | Data Handled | SOC 2? | BAA Needed? | Status |
|--------|-------------|--------|-------------|--------|
| **Railway** | All application data, database | Verify | Yes (PHI) | Needs assessment |
| **GitHub** | Source code, CI/CD | Yes | No | Compliant |
| **GitHub Pages** | Static frontend files | Yes | No | Compliant |
| **Google Fonts** | User IP addresses | Yes | No | Consider self-hosting |
| **Stripe** (future) | Payment data | Yes (PCI DSS) | No | Compliant when added |
| **Sentry** (planned) | Error data (may include PII) | Yes | Evaluate | Needs assessment |
| **SendGrid/Mailgun** (email) | Email addresses, names | Yes | Evaluate | Needs assessment |

### Vendor Assessment Process

1. **Initial Assessment** — Security questionnaire (SIG Lite or custom)
2. **SOC 2 Review** — Request and review vendor's SOC 2 Type II report
3. **BAA Execution** — For any vendor handling PHI
4. **Contractual Controls** — Security clauses in all vendor contracts
5. **Annual Review** — Re-assess all vendors annually
6. **Continuous Monitoring** — Monitor vendor security posture (SecurityScorecard)

---

## 14. Penetration Testing & Vulnerability Management

### 14.1 Penetration Testing Program

| Test Type | Frequency | Scope | Provider |
|-----------|-----------|-------|----------|
| External penetration test | Annual | All public-facing systems | Third-party firm (e.g., Cobalt, Synack) |
| Internal penetration test | Annual | Internal APIs, admin functions | Third-party firm |
| Web application assessment | Semi-annual | Full OWASP Top 10 coverage | Third-party firm |
| API security assessment | Semi-annual | All API endpoints | Third-party firm |
| Social engineering test | Annual | Phishing simulation | Third-party firm |
| Red team exercise | Annual (post SOC 2) | Full-scope adversary simulation | Third-party firm |

### 14.2 Vulnerability Management

| Phase | Process |
|-------|---------|
| **Discovery** | Automated scanning (weekly); dependency audits (daily); bug bounty (ongoing) |
| **Classification** | CVSS scoring; business context; exploitability assessment |
| **Prioritization** | Critical: 24hr; High: 7 days; Medium: 30 days; Low: 90 days |
| **Remediation** | Patch, mitigate, or accept (with documented risk acceptance) |
| **Verification** | Re-scan to verify fix; regression testing |
| **Reporting** | Monthly vulnerability report; trend analysis |

### 14.3 Bug Bounty Program (Phase 2)

```
Platform: HackerOne or Bugcrowd
Scope: All production systems
Rewards: $100 - $5,000 based on severity
Launch: After SOC 2 Type I certification
```

---

## 15. Business Continuity & Disaster Recovery

### 15.1 Recovery Objectives

| Metric | Target | Current |
|--------|--------|---------|
| **RPO** (Recovery Point Objective) | < 1 hour | Railway auto-backup (verify schedule) |
| **RTO** (Recovery Time Objective) | < 4 hours | Not formally tested |
| **MTTR** (Mean Time to Recovery) | < 2 hours | Not measured |
| **Uptime SLA** | 99.9% (8.76 hrs/year downtime) | Not formally measured |

### 15.2 Backup Strategy

| Data | Backup Method | Frequency | Retention | Encryption |
|------|--------------|-----------|-----------|------------|
| PostgreSQL database | Automated snapshots | Every 1 hour | 30 days | AES-256 |
| Application code | Git repository | On every commit | Indefinite | At rest on GitHub |
| Configuration | Environment variables | On change | Version history | Railway encrypted |
| Uploaded documents | S3/object storage backup | Daily | Per retention policy | AES-256 SSE-KMS |
| Audit logs | Separate backup stream | Daily | 7 years (HIPAA) | AES-256 |

### 15.3 Disaster Recovery Procedures

| Scenario | Recovery Procedure | RTO |
|----------|-------------------|-----|
| Database corruption | Restore from latest snapshot; replay WAL logs | 1 hour |
| Application server failure | Railway auto-restart; manual redeploy if needed | 15 minutes |
| Full region outage | Deploy to backup region; update DNS | 4 hours |
| Ransomware/compromise | Isolate; restore from clean backup; full credential rotation | 8 hours |
| DNS failure | Failover to backup DNS provider | 1 hour |

### 15.4 Testing Schedule

| Test | Frequency | Last Tested | Next Due |
|------|-----------|-------------|----------|
| Backup restore | Monthly | Not yet | Month 1 |
| Failover test | Quarterly | Not yet | Month 3 |
| Full DR exercise | Annually | Not yet | Month 6 |
| Tabletop exercise | Semi-annually | Not yet | Month 3 |

---

## 16. Employee Security & Training

### 16.1 Security Training Program

| Training | Audience | Frequency | Content |
|----------|----------|-----------|---------|
| Security awareness | All employees | Annual + onboarding | Phishing, social engineering, data handling |
| HIPAA training | All employees | Annual + onboarding | PHI handling, breach reporting, patient rights |
| Secure coding | Developers | Annual + onboarding | OWASP Top 10, secure design patterns |
| Incident response | IR team | Semi-annual | Tabletop exercises, runbook walkthroughs |
| Admin security | System administrators | Annual | Access management, logging, compliance |

### 16.2 Background Checks

| Check | When | Scope |
|-------|------|-------|
| Criminal background | Pre-hire | All employees |
| Reference check | Pre-hire | All employees |
| Education verification | Pre-hire | Engineering roles |
| Ongoing monitoring | Annual | Employees with PHI access |

### 16.3 Security Onboarding/Offboarding

**Onboarding:**
- [ ] Sign acceptable use policy
- [ ] Complete security awareness training
- [ ] Complete HIPAA training
- [ ] Set up MFA on all accounts
- [ ] Receive role-appropriate access (principle of least privilege)
- [ ] Review security policies
- [ ] Acknowledge data handling responsibilities

**Offboarding:**
- [ ] Revoke all system access immediately
- [ ] Revoke API tokens and sessions
- [ ] Remove from all groups and channels
- [ ] Collect company devices
- [ ] Review access logs for anomalies
- [ ] Confirm data is not retained on personal devices
- [ ] Document offboarding completion

---

## 17. Privacy & Data Governance

### 17.1 Data Retention Schedule

| Data Type | Retention Period | Justification | Disposal Method |
|-----------|-----------------|---------------|-----------------|
| User accounts | Active + 3 years after deactivation | Business need + legal | Anonymize or delete |
| Student credentials/PHI | Active + 7 years | HIPAA requirement | Secure deletion |
| Hour logs | Active + 7 years | HIPAA + educational record | Secure deletion |
| Evaluations | Active + 7 years | Educational record | Secure deletion |
| Certificates | Indefinite | Verification requirement | N/A |
| Audit logs | 7 years | HIPAA + SOC 2 requirement | Secure deletion |
| Application data | Active + 3 years | Business need | Secure deletion |
| Session/auth tokens | 24 hours after expiry | Technical | Automatic deletion |
| Backup data | 30 days | Recovery requirement | Encrypted deletion |

### 17.2 Data Subject Rights

| Right | Implementation |
|-------|----------------|
| Right to access | User can view all their data via dashboard/settings |
| Right to rectification | User can update profile; support process for other data |
| Right to deletion | Account deletion feature; cascade to related records (honor retention) |
| Right to portability | Data export feature (JSON/CSV) |
| Right to restrict processing | Account suspension option |
| Right to withdraw consent | Opt-out mechanisms; account deletion |

### 17.3 Privacy by Design Principles

1. **Proactive not reactive** — Build privacy into the architecture from day one
2. **Privacy as default** — Most restrictive settings by default
3. **Privacy embedded in design** — Not an add-on; core to every feature
4. **Full functionality** — Privacy without sacrificing user experience
5. **End-to-end security** — Lifecycle protection of all data
6. **Visibility and transparency** — Clear privacy notices; open practices
7. **Respect for user privacy** — User-centric; granular controls

---

## 18. Compliance Documentation Artifacts

### Documents to Produce for SOC 2 Audit

| # | Document | Status | Owner |
|---|----------|--------|-------|
| 1 | Information Security Policy | To create | Security Officer |
| 2 | Risk Assessment Report | To create | Security Officer |
| 3 | Risk Treatment Plan | To create | Security Officer |
| 4 | System Description (for auditor) | To create | CTO |
| 5 | Network Architecture Diagram | To create | CTO |
| 6 | Data Flow Diagrams | To create | CTO |
| 7 | Access Control Policy | To create | Security Officer |
| 8 | Change Management Policy | To create | CTO |
| 9 | Incident Response Plan | To create | Security Officer |
| 10 | Business Continuity Plan | To create | COO |
| 11 | Disaster Recovery Plan | To create | CTO |
| 12 | Vendor Management Policy | To create | Security Officer |
| 13 | Employee Handbook (security sections) | To create | HR |
| 14 | HIPAA Compliance Documentation | To create | Privacy Officer |
| 15 | Data Classification Policy | To create | Security Officer |
| 16 | Data Retention Policy | To create | Privacy Officer |
| 17 | Encryption Policy | To create | CTO |
| 18 | Password/Authentication Policy | To create | Security Officer |
| 19 | Physical Security Policy (cloud reliance) | To create | Security Officer |
| 20 | Privacy Policy (public) | To create | Privacy Officer |
| 21 | Terms of Service | To create | Legal |
| 22 | BAAs with vendors | To execute | Legal |
| 23 | Penetration Test Report | To commission | Security Officer |
| 24 | Vulnerability Scan Reports | To implement | CTO |
| 25 | Training Completion Records | To implement | HR |

---

## 19. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)

**Goal: Establish baseline security controls and policies**

| Month | Tasks |
|-------|-------|
| **Month 1** | - Appoint Security Officer and Privacy Officer |
| | - Conduct initial risk assessment |
| | - Implement MFA for all users |
| | - Implement comprehensive audit logging |
| | - Add rate limiting to all API endpoints |
| | - Add security headers (CSP, HSTS, etc.) |
| | - Begin writing core policies (InfoSec, Access Control, IR) |
| | - Set up automated dependency scanning |
| **Month 2** | - Implement application-level encryption for PHI |
| | - Add session management (idle timeout, token expiry) |
| | - Implement account lockout and brute force protection |
| | - Set up SIEM/centralized logging |
| | - Complete all 20+ policy documents |
| | - Implement data classification tagging |
| | - Start employee security training program |
| **Month 3** | - Commission first penetration test |
| | - Implement all findings from pen test |
| | - Set up vulnerability scanning pipeline |
| | - Execute BAAs with all vendors handling PHI |
| | - Complete HIPAA risk assessment |
| | - Test backup and restore procedures |
| | - Conduct first tabletop incident response exercise |

### Phase 2: SOC 2 Type I Preparation (Months 4-6)

**Goal: Implement all controls; prepare for Type I audit**

| Month | Tasks |
|-------|-------|
| **Month 4** | - Engage SOC 2 auditor (Vanta, Drata, or traditional CPA firm) |
| | - Gap assessment with auditor |
| | - Implement automated compliance monitoring (Vanta/Drata) |
| | - Finalize all policy documentation |
| | - Implement remaining technical controls |
| **Month 5** | - Internal audit of all controls |
| | - Remediate any gaps found |
| | - Collect evidence for all controls |
| | - Prepare system description for auditor |
| | - Complete network/data flow diagrams |
| **Month 6** | - SOC 2 Type I audit |
| | - Address any findings |
| | - Publish SOC 2 Type I report |
| | - Begin observation period for Type II |

### Phase 3: SOC 2 Type II Observation (Months 7-12)

**Goal: Demonstrate controls operating effectively over 6+ months**

| Activity | Frequency |
|----------|-----------|
| Access reviews | Quarterly |
| Vulnerability scans | Weekly |
| Penetration tests | Semi-annually |
| Backup restore tests | Monthly |
| Incident response exercises | Semi-annually |
| Policy reviews | As scheduled |
| Employee training | Ongoing |
| Compliance monitoring | Daily (automated) |
| Evidence collection | Continuous (automated) |

### Phase 4: SOC 2 Type II Certification (Months 12-18)

| Month | Tasks |
|-------|-------|
| **Month 12** | - Engage auditor for Type II examination |
| | - Final evidence collection |
| | - Internal readiness assessment |
| **Month 13-14** | - SOC 2 Type II audit fieldwork |
| | - Address any findings in real-time |
| **Month 15** | - Receive SOC 2 Type II report |
| | - Remediate any noted exceptions |
| | - Publish certification status |

### Phase 5: Advanced Certifications (Months 18-30)

| Certification | Timeline |
|--------------|----------|
| ISO 27001 | Months 18-24 |
| HITRUST CSF | Months 24-30 |
| SOC 2 Type II renewal | Month 24 (annual) |

---

## 20. Audit Preparation Checklist

### Pre-Audit Readiness (Complete before engaging auditor)

**Technical Controls:**
- [ ] MFA implemented for all users
- [ ] Encryption at rest for all PHI (AES-256)
- [ ] TLS 1.3 enforced for all connections
- [ ] Comprehensive audit logging operational
- [ ] Rate limiting on all API endpoints
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Automated vulnerability scanning in CI/CD
- [ ] WAF deployed and configured
- [ ] Session management (idle timeout, token expiry)
- [ ] Account lockout / brute force protection
- [ ] Input validation on all endpoints
- [ ] Secrets management (no hardcoded secrets)
- [ ] Environment separation (dev/staging/prod)
- [ ] Database access restricted (no public access)
- [ ] Backup encryption verified
- [ ] Monitoring and alerting operational

**Policy Documents:**
- [ ] Information Security Policy (approved, distributed)
- [ ] Access Control Policy
- [ ] Change Management Policy
- [ ] Incident Response Plan
- [ ] Business Continuity Plan
- [ ] Disaster Recovery Plan
- [ ] Data Classification Policy
- [ ] Data Retention Policy
- [ ] Encryption Policy
- [ ] Vendor Management Policy
- [ ] Acceptable Use Policy
- [ ] Password Policy
- [ ] Privacy Policy
- [ ] HIPAA policies and procedures

**Operational Evidence:**
- [ ] Risk assessment completed and documented
- [ ] Penetration test report (within last 12 months)
- [ ] Vulnerability scan reports (ongoing)
- [ ] Access review records (at least 1 quarterly review)
- [ ] Backup restore test records
- [ ] Incident response exercise records
- [ ] Employee training completion records
- [ ] Vendor assessment records
- [ ] Change management records (PR history)
- [ ] Signed BAAs with PHI-handling vendors

---

## 21. Budget Estimates

### Year 1 Costs

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| **Compliance Platform** (Vanta or Drata) | $10,000 - $25,000/yr | Automates evidence collection; highly recommended |
| **SOC 2 Type I Audit** | $20,000 - $50,000 | CPA firm; depends on scope |
| **SOC 2 Type II Audit** | $30,000 - $75,000 | 6-month observation + audit |
| **Penetration Testing** | $10,000 - $30,000/yr | Two tests per year |
| **WAF / DDoS Protection** | $0 - $5,000/yr | Cloudflare Pro/Business |
| **SIEM / Monitoring** | $0 - $10,000/yr | Datadog, Sentry, or open-source |
| **Security Training** | $2,000 - $5,000/yr | KnowBe4 or similar |
| **Legal** (policies, BAAs) | $5,000 - $15,000 | Attorney review of all policies |
| **Cyber Insurance** | $3,000 - $10,000/yr | Required for healthcare |
| **Bug Bounty** (Phase 2) | $5,000 - $20,000/yr | HackerOne managed program |
| **Total Year 1** | **$85,000 - $245,000** | |

### Cost Optimization Strategies

1. **Use Vanta or Drata** — Automates 80% of SOC 2 evidence collection; reduces audit cost
2. **Start with SOC 2 Type I** — Faster, cheaper; proves controls exist
3. **Bundle audits** — SOC 2 + HIPAA with same auditor for discount
4. **Open-source tools** — Use free SAST/DAST tools (Semgrep, OWASP ZAP) initially
5. **Cloudflare free tier** — Basic WAF and DDoS protection at no cost
6. **Self-service training** — HIPAA and security training via free/low-cost platforms initially

### ROI Justification

| Benefit | Value |
|---------|-------|
| Unlock enterprise hospital contracts | $50K-500K+ per contract |
| Unlock university partnerships requiring FERPA | $10K-100K per partnership |
| Reduce cyber insurance premiums | 30-40% reduction |
| Prevent data breach costs | Average healthcare breach: $10.9M (IBM 2023) |
| Investor confidence | 15-25% valuation premium |
| Competitive differentiation | Only certified platform in clinical rotation space |

---

## Summary: The Path to "SOC 2 Certified, Security Audited & Verified"

```
Month 1-3:   Build the foundation (MFA, encryption, logging, policies)
Month 4-6:   Prepare and pass SOC 2 Type I audit
Month 7-12:  Observation period (prove controls work over time)
Month 12-15: Pass SOC 2 Type II audit
Month 15+:   Display "SOC 2 Type II Certified" badge everywhere
Month 18-30: Pursue ISO 27001 and HITRUST CSF
```

**The result:** ClinicLink becomes the most trusted, security-certified clinical rotation platform in the market — a requirement for every hospital, university, and health system partnership.

---

*Document Version: 1.0*
*Created: February 2026*
*Review Cycle: Quarterly*
*Owner: Security Officer*
*Classification: Internal - Confidential*
