# ClinicLink - Development Plan

## Vision
The marketplace that solves healthcare education's biggest bottleneck — connecting students who need clinical hours with sites that offer them.

---

## Phase 1: MVP ✅ COMPLETE
**Goal:** Two-sided marketplace — students search and apply, sites list and accept

### What Was Built
- React 18 + TypeScript + Vite + Tailwind frontend with premium UI
- Laravel 12 backend with PostgreSQL on Railway
- Auth system with Sanctum (register, login, forgot/reset password)
- 6 user roles: Student, Preceptor, Site Manager, Coordinator, Professor, Admin
- Full onboarding flow per role with profile setup
- Student profile with credential management
- Rotation search with filters (specialty, location, dates, cost)
- Rotation detail and application submission workflow
- Application status tracking (pending, accepted, declined, waitlisted, withdrawn)
- Facility profiles with photos and description
- Rotation slot creation (specialty, dates, capacity, requirements, cost, shift schedule)
- Application review dashboard (accept, decline, waitlist)
- Preceptor assignment to slots
- University and program management
- Student roster with placement status
- Placement overview dashboard
- Site directory and university directory
- Site preceptor management with invite system
- Role-based dashboards (Student, Preceptor, Site Manager, Coordinator, Professor, Admin)
- Preceptor dashboard with site affiliation display
- Landing page, public rotation search
- Certificate verification system with QR codes
- Deploy: GitHub Pages (frontend) + Railway (backend)

---

## Phase 2: Tracking & Compliance ✅ COMPLETE
**Goal:** Clinical hour logging, evaluations, compliance document management

### What Was Built

#### Hour Logging System
- Student hour log submission (date, hours, category, notes)
- Preceptor approval workflow (approve/reject with notes)
- Hour summary with category breakdown
- Export-ready hour reports

#### Evaluation System
- Standardized evaluation rubrics (mid-rotation, final, feedback)
- Preceptor-to-student evaluations with scoring (1-5 scale)
- Evaluation draft/submit workflow
- Evaluation history and tracking

#### Credential & Document Management
- File upload infrastructure (FormData + multipart upload)
- Reusable FileUpload component (drag-drop, progress, file type filtering)
- Student credential file uploads (CPR cards, background checks, immunizations)
- Upload/download with authorization checks
- File metadata tracking (name, size, path)

#### Onboarding Task System
- Site-specific onboarding checklists (templates with required/optional items)
- Student task completion with file attachments
- Site manager verification workflow
- Progress tracking per application

#### Affiliation Agreement Management
- Full CRUD for university-site affiliation agreements
- Document upload/download for agreement files
- Status workflow: Draft → Pending Review → Active (+ Expire/Terminate/Reactivate)
- Role-based access (coordinators see university's, site managers see site's, admin sees all)
- Search and filter by status

#### Compliance Dashboard
- **Site Manager view:** Table of students with traffic-light compliance status (green/amber/red), expandable detail showing every credential, task, and agreement status
- **Coordinator view:** Aggregate cards per site showing % of students compliant, drill-down to individual students
- **Student view:** Personal compliance checklist with alerts for expired/expiring items, progress indicators and category grouping

#### File Storage Infrastructure
- Cloudflare R2 (S3-compatible) for persistent file storage in production
- Environment-based disk switching (local for dev, R2 for production)
- No egress fees, 10GB free tier

---

## Phase 2.5: Security & MFA ✅ COMPLETE
**Goal:** Two-factor authentication for all user accounts

### What Was Built

#### TOTP Two-Factor Authentication
- Optional TOTP-based 2FA for all user roles
- QR code setup flow via Google Authenticator / Authy / 1Password
- Manual secret key entry fallback
- 6-digit TOTP code verification with time-based validation
- MFA-challenged login flow (password → MFA code → session)

#### Backup Codes
- 8 single-use backup codes generated on MFA setup
- Hashed storage (bcrypt) — codes shown only once at generation
- Backup code login support as TOTP fallback
- Regeneration with password confirmation (invalidates old codes)
- Copy-all and download-as-file options

#### Security Features
- Temporary MFA challenge tokens (5-min TTL, cache-based)
- Rate limiting: 5 MFA attempts per challenge session
- Password required to disable MFA or regenerate backup codes
- MFA secret encrypted at rest (Laravel encrypted cast)
- No Sanctum token issued until MFA is verified

#### Frontend Integration
- Settings > Security tab: full MFA management (setup, status, disable, backup codes)
- Login page: MFA verification step with TOTP and backup code modes
- AuthContext: `mfaPending`, `verifyMfa()`, `cancelMfa()` state management
- QR code rendering via qrcode.react

#### Backend Endpoints
- `GET /auth/mfa/status` — Check MFA status
- `POST /auth/mfa/setup` — Generate TOTP secret + provisioning URI
- `POST /auth/mfa/confirm` — Verify code to enable MFA
- `POST /auth/mfa/disable` — Disable MFA (requires password)
- `POST /auth/mfa/backup-codes` — Regenerate backup codes
- `POST /auth/mfa/verify` — Verify MFA during login (public, rate-limited)

---

## Phase 2.7: Security Hardening ✅ COMPLETE
**Goal:** Address all security gaps from SECURITY_COMPLIANCE_PLAN.md

### What Was Built

#### Security Headers Middleware
- Custom `SecurityHeaders` middleware applied globally to all responses
- X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=31536000 (production only)

#### API Rate Limiting
- Global rate limiter: 120 requests/min (authenticated), 60/min (guests)
- Stricter auth endpoint limiter: 10 requests/min on login, register, forgot-password, MFA verify
- Rate limit headers returned in all API responses

#### Token Expiration & Lifecycle
- Sanctum tokens expire after 24 hours (was: never expire)
- Automated daily pruning of expired tokens (`sanctum:prune-expired --hours=48`)

#### Account Lockout
- 5 failed login attempts triggers 30-minute account lockout
- `failed_login_attempts` + `locked_until` columns on users table
- Auto-resets on successful login
- Lockout attempts logged in audit trail with IP/user agent

#### PHI Field Encryption
- `mfa_backup_codes` cast changed from `array` to `encrypted:array`
- Data migration to re-encrypt existing plain-text backup codes
- Credential file content protected by Cloudflare R2 encryption at rest

#### Platform-Wide Audit Logging
- Immutable `AuditLog` model (same pattern as CE audit trail)
- Polymorphic design: auditable_type + auditable_id (User, Credential, HourLog, etc.)
- Sensitive field masking (password, mfa_secret, mfa_backup_codes → [REDACTED])
- `record()` and `recordFromRequest()` static factories — never throw, always log errors
- Override `save()` and `delete()` to enforce immutability

#### Audit Events Covered
- **Auth:** login, login_failed (with reason: invalid_credentials/locked), logout, registered
- **Admin:** user created, updated (with old/new values), deleted, role_changed, password_reset
- **Credentials:** created, updated, deleted, uploaded, downloaded (PHI access tracking)
- **Hour Logs:** created, approved, rejected (with reason)
- **CE Certificates:** issued, approved, rejected, revoked, verified, downloaded, policy_changed

#### Admin Audit Log Viewer
- `GET /api/admin/audit-logs` with filters: auditable_type, event_type, actor_id, date_from, date_to
- Paginated, ordered by most recent, includes actor relationship

---

## Phase 2.8: Landing Page Accuracy & Password Hardening ✅ COMPLETE
**Goal:** Fix false claims on landing page, enforce NIST 800-63B password policy

### What Was Built

#### Landing Page Overhaul
- Removed all false blockchain/AI/GPS claims from landing page
- Replaced hardcoded fake stats (2,500+ sites, 18K students) with real capability highlights
- Rewrote 4 key feature cards (GPS→Digital Hour Logging, Blockchain→Verified Credentials, AI Matching→Multi-Criteria Search, Automated Compliance→Compliance Tracking)
- Fixed competitive edge section (Blockchain-Verified→Instantly Verifiable, AI-Powered→Purpose-Built)
- Removed nonexistent features (rotation-to-hire, e-sign, accreditation reports, program benchmarking)
- Replaced fake testimonials with "Demo Example" badges
- Fixed lifecycle steps (removed "Match" and "Hire" — now 6 steps: Discover, Apply, Onboard, Track, Evaluate, Certify)

#### NIST 800-63B Password Policy
- Backend: `Password::defaults()` with min(12), letters, mixedCase, numbers, symbols, uncompromised (HaveIBeenPwned)
- Frontend Register page: Updated from 8→12 char minimum, strength meter, validation
- Frontend Reset Password page: Updated from 8→12 char minimum

---

## Phase 2.9: Email Notifications ✅ COMPLETE
**Goal:** Scheduled email reminders for expiring credentials and agreements

### What Was Built

#### Credential Expiration Reminders
- `reminders:credentials` Artisan command — runs daily at 04:00
- Queries credentials expiring within 30 days, groups by student
- Sends premium email with color-coded urgency table (red ≤7 days, orange ≤14, amber ≤30)

#### Agreement Expiration Reminders
- `reminders:agreements` Artisan command — runs daily at 04:30
- Queries active agreements expiring within 30 days
- Notifies coordinators (by university) and site managers (by site)
- Premium email template with university/site breakdown table

#### Application Review Email Resilience
- Wrapped ApplicationController review email + notification in try/catch
- Prevents mail failures from breaking the review workflow

#### Existing Email System (already built)
- 11 Mail classes: ApplicationStatusMail, HourLogReviewedMail, WelcomeMail, RegistrationReceivedMail, AccountApprovedMail, ForgotPasswordMail, PasswordResetMail, NewUserRegistrationMail, SiteInviteMail, CredentialExpirationMail, AgreementExpirationMail
- 11 Notification classes for in-app notifications
- 13 premium Blade email templates with gradient headers and inline CSS

---

## Phase 3.0: In-App Messaging & Calendar ✅ COMPLETE
**Goal:** Thread-based messaging between all user roles and a calendar view for rotations, hours, evaluations, and deadlines

### What Was Built

#### In-App Messaging System
- Thread-based conversations (1-on-1 and group)
- Relationship-based authorization (students ↔ preceptors from accepted rotations, coordinators ↔ site managers with affiliations, etc.)
- Two-panel responsive layout: conversation list (left) + message thread (right)
- Conversation search and filtering
- New conversation modal with user search (only messageable users shown)
- Unread message count with sidebar badge
- Polling-based updates (10s for active threads, 30s for unread count)
- Mobile-friendly single-panel mode (`/messages/:id`)
- Database notifications for new messages

#### Calendar View (FullCalendar)
- FullCalendar integration with 3 views: month grid, week time grid, week list
- Role-scoped event loading (each role sees relevant events)
- Color-coded event types: rotations (blue), hour logs (green), evaluations (orange), deadlines (red), completed (muted)
- Filter toggles to show/hide event types (client-side)
- Event click navigation to related pages
- Event detail popover
- Responsive: mobile defaults to list view, desktop to month grid
- Date range–based API fetching via `datesSet` callback

#### Backend
- 3 new migrations: conversations, conversation_participants, messages tables (UUID PKs)
- 3 new models: Conversation, ConversationParticipant, Message
- MessageController: 6 endpoints (conversations list, messages, send, create, unread count, user search)
- CalendarController: role-scoped event aggregation across rotations, hour logs, evaluations, deadlines
- NewMessageNotification for database notifications
- User model updated with `conversations()` and `sentMessages()` relations

#### Frontend
- Messages page with ConversationList, MessageThread, MessageBubble, NewConversationModal components
- Calendar page with EventDetailPopover, filter toggles, color legend
- 6 FullCalendar packages installed
- 7 new React Query hooks + API service methods
- Sidebar navigation updated with Messages (unread badge) and Calendar items
- 3 new routes: `/messages`, `/messages/:id`, `/calendar`

---

## Phase 3.1: CE Credits Frontend Enhancement ✅ COMPLETE
**Goal:** Expose all backend CE audit trail, revocation, and policy versioning features in the frontend

### What Was Built

#### Audit & Compliance Tab
- New "Audit & Compliance" tab for coordinators and admins
- Summary stat cards (total certificates, revoked count, active count, avg hours)
- Immutability notice explaining audit trail integrity
- Expandable certificate rows with full detail (verification UUID, dates, approved/revoked by)

#### Certificate Revocation UI
- Revoke button with confirmation form
- Permanent action warning with reason input
- Revoked status badge with ring styling
- Revoked certificate detail (revoked_at, revoked_by, revocation_reason)

#### Audit Trail Viewer
- On-demand per-certificate audit trail loading
- Timeline-based display with icons per event type
- Event metadata display (old/new values for policy changes, certificate details, etc.)
- Actor info, IP address, and timestamp for each event
- Immutable record indicator

#### Policy Version Display
- Version info bar on CE Policy editor (version number, effective dates, last updated by)
- Effective date range fields (effective_from / effective_to)
- Audit trail notice on policy save

#### API Integration
- `revoke()` and `auditTrail()` methods added to ceCertificatesApi
- `useRevokeCeCertificate()` and `useCeAuditTrail()` React Query hooks
- `ApiCeAuditEvent` type definition
- `ApiCeCertificate` updated with revoked status and revocation fields
- `ApiCePolicy` updated with version and effective date fields

---

## Phase 3.2: Exports, Broadcasts, Reminders, Bulk Import ✅ COMPLETE
**Goal:** CSV/PDF exports, coordinator broadcasts, evaluation reminders, bulk student import

### What Was Built

#### CSV/PDF Exports (6 Endpoints)
- ExportController with role-scoped queries (student, preceptor, site_manager, coordinator, admin)
- Hour logs CSV/PDF export with date/status/slot filters
- Evaluations CSV/PDF export with type filter
- Compliance CSV/PDF export with site filter
- Premium DomPDF templates with gradient headers, stats boxes, and data tables
- Token-based auth for browser downloads (window.open pattern)
- Export dropdown buttons on Hour Log, Evaluations, and Compliance Dashboard pages

#### Announcement Broadcasts
- Migration: `is_broadcast` + `broadcast_by` fields on conversations table
- Coordinator/admin broadcast messaging with audience targeting
- Audience options: all students, by program, by role (admin-only)
- Coordinator scoped to their university's students
- BroadcastModal component with audience selector, subject, message body
- Megaphone icon + "Broadcast" badge in conversation list
- Chunked participant insertion (100) and notification delivery (50)

#### Evaluation Reminders (Scheduled Command)
- `reminders:evaluations` daily command at 05:00
- Identifies active rotations with upcoming mid-rotation and final evaluation dates
- Sends reminders at 7-days-before and on-due-date windows
- Dedup table (`evaluation_reminders_sent`) prevents duplicate sends
- Premium amber-themed email template with urgency badge and student info
- In-app notification via EvaluationDueNotification
- `--dry-run` mode for testing

#### Bulk Student Import
- CSV template download endpoint with sample row
- Bulk import endpoint: parses CSV, validates headers, creates User + StudentProfile
- Per-row error handling (missing fields, invalid email, duplicate detection)
- Welcome email with password reset link for each new student
- Audit log for each import
- BulkImportModal component with template download, file upload, results table
- Import Students button on My Students page (coordinator/admin only)

---

## Phase 3.2.5: Database Seeder & Email Verification ✅ COMPLETE
**Goal:** Comprehensive demo data seeder and email verification enforcement

### What Was Built

#### Expanded Database Seeder (3,261 lines → full demo coverage)
- Added 11 missing models: PreceptorReviews, MatchingPreferences, SavedSearches, SlotBookmarks, EvaluationTemplates, AgreementTemplates, Signatures, StudentInvites, SiteJoinRequests, AnalyticsSnapshots, Notifications
- Preceptor reviews with 1-5 rating rubrics (anonymous + named reviews)
- Student matching preferences for smart matching demo
- Saved searches with alert toggles
- Slot bookmarks across students
- Custom evaluation templates per university (mid-rotation, final, student feedback)
- Agreement templates (4 boilerplates for UMiami, FIU, Nova)
- E-signature records on affiliation agreements (signed + pending)
- Student invites (pending, accepted, expired)
- Site join requests (approved, pending, rejected)
- Platform/university/site analytics snapshots (daily + monthly)
- 12 database notifications for all demo users (bell icon populated)

#### Email Verification Enforcement
- Login now blocks unverified users with `email_not_verified` response
- Frontend LoginPage catches the 403 and redirects to `/verify-email?email=...`
- VerifyEmailPrompt page shows resend option and instructions
- VerifyEmailCallback handles token verification from email link
- User model updated with `email_verified` in fillable array and boolean cast
- API error objects now include full response body for richer error handling

#### SEO & Page Titles
- Open Graph, Twitter Card, canonical meta tags in index.html
- `usePageTitle` hook across all 40 pages for dynamic browser tab titles
- robots.txt and sitemap.xml for search engine crawling

---

## Phase 3.3: Payments & Intelligence — NEXT
- Stripe Connect for paid rotation placements
- Preceptor management and recognition system
- Smart matching algorithm (student prefs × site requirements)
- Advanced analytics (placement rates, time-to-place, demand heat maps)
- Accreditation-ready report generation

---

## Phase 4: Scale
- Multi-discipline expansion (nursing, PA, NP, PT, OT, social work, pharmacy, MD)
- Post-graduation job board ("rotation to hire" pipeline)
- React Native mobile app
- LMS integration (Canvas, Blackboard)
- Background check provider integration

---

## Tech Stack
| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 18 + TypeScript + Vite + Tailwind | ✅ |
| Backend | Laravel 12 + PHP 8.4 | ✅ |
| Database | PostgreSQL (Railway) | ✅ |
| Auth | Laravel Sanctum | ✅ |
| File Storage | Cloudflare R2 (S3-compatible) | ✅ |
| PDF Generation | DomPDF | ✅ |
| QR Codes | Simple QRCode | ✅ |
| Email | Resend | ✅ |
| 2FA/MFA | pragmarx/google2fa + qrcode.react | ✅ |
| Hosting | GitHub Pages + Railway | ✅ |
| Scheduled Jobs | Laravel Scheduler (5 daily commands) | ✅ |
| Search | Algolia / Meilisearch | Planned |
| Maps | Google Maps / Mapbox | Planned |
| Payments | Stripe Connect | Planned |
| Calendar | FullCalendar (6 packages) | ✅ |
| Real-time | Polling (10s threads, 30s notifications) | ✅ |
| Mobile | React Native | Planned |

---

## Architecture

### Frontend Pages (25+ routes)
| Page | Route | Roles |
|------|-------|-------|
| Landing | `/` | Public |
| Login / Register | `/login`, `/register` | Public |
| Forgot / Reset Password | `/forgot-password`, `/reset-password` | Public |
| Rotation Search | `/rotations` | Semi-protected |
| Verify Certificate | `/verify/:id` | Public |
| Accept Invite | `/invite/:token` | Public |
| Onboarding | `/onboarding` | Auth (pre-onboarding) |
| Dashboard | `/dashboard` | All roles |
| Applications | `/applications` | Student |
| Hour Log | `/hours` | Student, Preceptor |
| Evaluations | `/evaluations` | Student, Preceptor |
| Certificates | `/certificates` | Student |
| Settings | `/settings` | All roles |
| Slot Management | `/slots` | Site Manager |
| Site Applications | `/site-applications` | Site Manager |
| Site Preceptors | `/preceptors` | Site Manager |
| My Site | `/site` | Site Manager |
| My Students | `/students` | Preceptor, Coordinator |
| Programs | `/programs` | Coordinator |
| Placements | `/placements` | Coordinator |
| Sites Directory | `/sites` | Coordinator, Admin |
| University Directory | `/universities` | Admin |
| Onboarding Checklists | `/onboarding-checklists` | Site Manager |
| Agreements | `/agreements` | Coordinator, Site Manager, Admin |
| Compliance Dashboard | `/compliance` | Student, Site Manager, Coordinator, Professor, Admin |
| Messages | `/messages` | All authenticated roles |
| Message Thread | `/messages/:id` | All authenticated roles |
| Calendar | `/calendar` | All authenticated roles |
| CE Credits | `/ce-credits` | Preceptor, Coordinator, Admin |
| Admin Users | `/admin/users` | Admin |

### Backend API Endpoints (65+)
- **Auth:** register, login, logout, me, forgot-password, reset-password, mfa/setup, mfa/confirm, mfa/disable, mfa/verify, mfa/backup-codes, mfa/status
- **Students:** profile, credentials (CRUD + file upload/download), hour logs, evaluations
- **Slots:** CRUD with search/filter, preceptor assignment
- **Sites:** CRUD, my-sites (manager + preceptor), directory
- **Applications:** submit, review, status tracking
- **Evaluations:** CRUD with scoring rubrics
- **Onboarding:** templates, tasks (CRUD + file upload/download), progress
- **Agreements:** CRUD + document upload/download + status workflow
- **Compliance:** site aggregation, student checklist, coordinator overview
- **Universities:** CRUD, programs
- **Admin:** user management, dashboard stats, audit logs
- **Certificates:** generation with QR, public verification
- **CE Credits:** policy CRUD, certificate approve/reject/revoke, download, audit trail, eligibility check
- **Messages:** conversations (list, create), messages (list, send), unread count, user search
- **Calendar:** role-scoped events with date range filtering

---

## Revenue Projections (Year 1)
| Month | Universities | Sites | Students | MRR |
|-------|-------------|-------|----------|-----|
| 3 | 3 | 20 | 200 | $2K |
| 6 | 10 | 80 | 1,000 | $8K |
| 9 | 25 | 200 | 3,000 | $20K |
| 12 | 50 | 500 | 8,000 | $45K |

Revenue mix: 60% university subscriptions, 25% site subscriptions, 15% placement transaction fees.

---

## Competitive Landscape
| Competitor | What They Do | Gap We Fill |
|-----------|-------------|-------------|
| Exxat | Clinical placement mgmt | Expensive ($$$), no marketplace, university-only |
| Typhon | Clinical tracking/logging | Hour logging only, no matching/marketplace |
| Core ELMS | Clinical education mgmt | Enterprise pricing, complex, no marketplace |
| InPlace | Work-integrated learning | Generic (not healthcare-specific) |
| Spreadsheets + cold calls | Manual process | No visibility, months wasted, no tracking |

**Our edge:** True two-sided marketplace (not just management), affordable, student-free, healthcare-specific, beautiful modern UX.

---

## Why This Wins
1. **Real pain point:** Clinical placement is THE #1 complaint from healthcare students and programs
2. **Network effects:** More sites attract more students attract more universities attract more sites
3. **Compliance moat:** Once a university standardizes on ClinicLink for compliance/tracking, switching cost is high
4. **Revenue certainty:** Semester-based subscriptions = predictable revenue
5. **Expansion path:** Start with nursing (largest), expand to all healthcare disciplines
6. **Synergy:** CareManagerIO customers ARE the clinical sites — built-in distribution

---

## Funding Path
1. **Bootstrap** (Months 1-6): Build MVP, pilot with 3 local nursing programs
2. **EdTech / HealthTech Accelerators** (Month 4+): Techstars, StartUp Health, Reach Capital, Imagine K12
3. **Seed Round** ($500K-1M, Month 9+): Scale to 50 programs, hire sales
4. **Target Investors:** Reach Capital, NewSchools, GSV Ventures, Owl Ventures (edtech), Rock Health (healthtech)
5. **Strategic partners:** State nursing boards, AACN (American Association of Colleges of Nursing)
