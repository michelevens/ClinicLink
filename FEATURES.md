# ClinicLink - Feature Tracker

## Status Legend
- [x] Planned and scoped
- [ ] Not yet started

---

## Phase 1: Core Marketplace (MVP - Weeks 1-8)

### Authentication & Users
- [x] Email/password registration and login
- [x] Role-based access (Student, Preceptor, Site Manager, University Coordinator, Professor, Admin)
- [x] Profile setup per role (credentials, program, facility)
- [ ] University affiliation verification
- [ ] Email verification and identity confirmation
- [x] MFA option for all users (TOTP + backup codes)
- [x] NIST 800-63B password policy (min 12, mixed case, numbers, symbols, HaveIBeenPwned)
- [x] Account lockout (5 failed attempts → 30min lock)

### Student Profile & Search
- [x] Student profile (program, school, graduation date, certifications, clinical interests)
- [x] Credential upload (CPR, background check, immunizations, liability insurance)
- [x] Rotation search with filters (specialty, location, dates, cost, availability)
- [ ] Map-based search (clinics near me / near school)
- [ ] Saved searches and alerts (notify when new matching slots open)
- [ ] Rotation bookmarking/favorites
- [x] Application submission (cover letter, preferences)
- [x] Application status tracking

### Clinic/Site Listings
- [x] Facility profile (name, address, specialties, size, EHR system used)
- [x] Rotation slot creation (specialty, dates, capacity, requirements, cost)
- [ ] Slot availability calendar
- [x] Requirements checklist per slot (onboarding templates)
- [x] Application review dashboard
- [x] Accept/decline/waitlist applicants
- [x] Site photos and description
- [x] Preceptor assignment per rotation

### University Dashboard
- [x] Program setup (degree type, required hours, specialties)
- [x] Student roster with placement status
- [ ] Bulk student import (CSV)
- [x] Placement overview (placed vs unplaced vs in-progress)
- [x] Quick stats (placement rate, average time to place)

### Basic Dashboard (All Roles)
- [x] Role-specific dashboard (6 dashboards)
- [x] Notification feed
- [x] Upcoming rotations/deadlines
- [x] Quick actions

---

## Phase 2: Management & Tracking (Weeks 9-16)

### Clinical Hour Logging
- [x] Student daily/weekly hour entry
- [x] Preceptor approval of logged hours
- [x] Running total vs required hours
- [x] Hour categories (direct patient care, indirect, simulation, etc.)
- [ ] GPS check-in/check-out (optional, for verification)
- [x] Hour summary reports (by week, month, rotation, total)
- [ ] Export hours log (PDF, CSV)

### Evaluations
- [x] Mid-rotation evaluation (preceptor → student)
- [x] Final rotation evaluation (preceptor → student)
- [x] Student feedback evaluation
- [x] Standardized rubrics (1-5 scale scoring)
- [ ] Custom evaluation templates per university
- [ ] Evaluation reminders and deadlines
- [x] Evaluation history and trends

### Compliance & Document Management
- [x] Student credential tracking (expiration dates, renewal reminders)
- [x] Required document checklist per site (onboarding templates)
- [x] Document upload with verification status
- [x] Automated compliance alerts (credential expiration emails at 30/14/7 days)
- [x] Bulk compliance status view (site manager + coordinator dashboards)
- [x] Site-specific requirements mapping (onboarding templates)
- [x] Agreement expiration email reminders

### Affiliation Agreements
- [ ] Agreement template library
- [x] Agreement creation between university and site (CRUD)
- [ ] E-signature integration
- [x] Agreement status tracking (draft → pending review → active → expired/terminated)
- [x] Renewal reminders (scheduled email alerts)
- [x] Agreement document storage (upload/download)

### Communication
- [ ] In-app messaging (student ↔ preceptor, coordinator ↔ site manager)
- [ ] Announcement broadcasts (university → all students)
- [x] In-app notifications (bell icon, mark read/unread)
- [x] Email notifications (11 mail classes for applications, hours, credentials, agreements, onboarding)
- [ ] Message templates for common communications

### Security & Compliance
- [x] TOTP Two-Factor Authentication with backup codes
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- [x] API rate limiting (global + auth endpoint throttling)
- [x] 24hr token expiration + daily pruning
- [x] Account lockout (5 failed attempts → 30min)
- [x] PHI encryption (mfa_secret, mfa_backup_codes)
- [x] Platform-wide immutable audit logging
- [x] Admin audit log viewer with filters
- [x] NIST 800-63B password policy
- [x] CE audit trail (immutable CeAuditEvent model)

---

## Phase 3: Payments & Advanced Features (Weeks 17-24)

### Payment System
- [ ] Paid rotation listing with Stripe Connect
- [ ] Student payment for rotation fees (if applicable)
- [ ] University payment on behalf of students (batch)
- [ ] Platform fee processing (10% marketplace fee)
- [ ] Payment receipts and invoices
- [ ] Refund management
- [ ] Financial reporting for sites

### Preceptor Management
- [ ] Preceptor profiles (credentials, specialties, CE credits, teaching history)
- [ ] Availability calendar
- [ ] Student capacity management
- [ ] Teaching portfolio (evaluations received, students mentored)
- [ ] CE credit tracking for precepting
- [ ] Preceptor ratings and reviews (from students)
- [ ] Preceptor recognition program

### Advanced Analytics
- [ ] University reports: placement rates, time-to-place, site utilization
- [ ] Site reports: application volume, acceptance rates, student satisfaction
- [ ] Program accreditation data export
- [ ] Preceptor effectiveness metrics
- [ ] Geographic demand heat maps
- [ ] Specialty availability trends

### Matching Algorithm
- [ ] Smart matching (student preferences + site requirements + availability)
- [ ] Match score and recommendations
- [ ] Automated waitlist management
- [ ] Priority matching for underserved specialties/locations

---

## Phase 4: Scale & Ecosystem (Weeks 25+)

### Multi-Discipline Expansion
- [ ] Nursing (BSN, MSN, DNP)
- [ ] Physician Assistant (PA)
- [ ] Nurse Practitioner (NP)
- [ ] Physical Therapy (PT/DPT)
- [ ] Occupational Therapy (OT)
- [ ] Social Work (MSW)
- [ ] Counseling/Psychology
- [ ] Pharmacy
- [ ] Medical students (MD/DO rotations)
- [ ] Dental hygiene
- [ ] Respiratory therapy
- [ ] Speech-language pathology

### Job Board Integration
- [ ] Post-graduation job board
- [ ] "Rotation to hire" pipeline (sites hire students they trained)
- [ ] Resume builder from clinical experience
- [ ] Employer profiles for hiring

### Mobile App (React Native)
- [ ] Student app: search, apply, log hours, evaluations
- [ ] Preceptor app: approve hours, evaluate, schedule
- [ ] Push notifications
- [ ] Offline hour logging

### API & Integrations
- [ ] University LMS integration (Canvas, Blackboard)
- [ ] EHR system integration for onboarding
- [ ] Background check provider integration (CastleBranch, Complio)
- [ ] State licensing board verification
