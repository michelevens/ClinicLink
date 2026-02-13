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

## Phase 3: Payments & Intelligence — NEXT
- Stripe Connect for paid rotation placements
- Preceptor management and recognition system
- Smart matching algorithm (student prefs × site requirements)
- Advanced analytics (placement rates, time-to-place, demand heat maps)
- Accreditation-ready report generation
- Email notifications (application updates, credential expirations, agreement reminders)

---

## Phase 4: Scale
- Multi-discipline expansion (nursing, PA, NP, PT, OT, social work, pharmacy, MD)
- Post-graduation job board ("rotation to hire" pipeline)
- React Native mobile app
- LMS integration (Canvas, Blackboard)
- Background check provider integration
- In-app messaging between all parties

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
| Search | Algolia / Meilisearch | Planned |
| Maps | Google Maps / Mapbox | Planned |
| Payments | Stripe Connect | Planned |
| Calendar | FullCalendar | Planned |
| Mobile | React Native | Planned |

---

## Architecture

### Frontend Pages (19+ routes)
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
| Admin Users | `/admin/users` | Admin |

### Backend API Endpoints (50+)
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
- **Admin:** user management, dashboard stats
- **Certificates:** generation with QR, public verification

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
