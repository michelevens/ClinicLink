# ClinicLink - Feature Tracker

## Status Legend
- [x] Planned and scoped
- [ ] Not yet started

---

## Phase 1: Core Marketplace (MVP - Weeks 1-8)

### Authentication & Users
- [ ] Email/password registration and login
- [ ] Role-based access (Student, Preceptor, Site Manager, University Coordinator, Professor, Admin)
- [ ] Profile setup per role (credentials, program, facility)
- [ ] University affiliation verification
- [ ] Email verification and identity confirmation
- [ ] MFA option for site managers and coordinators

### Student Profile & Search
- [ ] Student profile (program, school, graduation date, certifications, clinical interests)
- [ ] Credential upload (CPR, background check, immunizations, liability insurance)
- [ ] Rotation search with filters (specialty, location, dates, cost, availability)
- [ ] Map-based search (clinics near me / near school)
- [ ] Saved searches and alerts (notify when new matching slots open)
- [ ] Rotation bookmarking/favorites
- [ ] Application submission (cover letter, resume, preferences)
- [ ] Application status tracking

### Clinic/Site Listings
- [ ] Facility profile (name, address, specialties, size, EHR system used)
- [ ] Rotation slot creation (specialty, dates, capacity, requirements, cost)
- [ ] Slot availability calendar
- [ ] Requirements checklist per slot (credentials, clearances needed)
- [ ] Application review dashboard
- [ ] Accept/decline/waitlist applicants
- [ ] Site photos and description
- [ ] Preceptor assignment per rotation

### University Dashboard
- [ ] Program setup (degree type, required hours, specialties)
- [ ] Student roster with placement status
- [ ] Bulk student import (CSV)
- [ ] Placement overview (placed vs unplaced vs in-progress)
- [ ] Quick stats (placement rate, average time to place)

### Basic Dashboard (All Roles)
- [ ] Role-specific dashboard
- [ ] Notification feed
- [ ] Upcoming rotations/deadlines
- [ ] Quick actions

---

## Phase 2: Management & Tracking (Weeks 9-16)

### Clinical Hour Logging
- [ ] Student daily/weekly hour entry
- [ ] Preceptor approval of logged hours
- [ ] Running total vs required hours
- [ ] Hour categories (direct patient care, indirect, simulation, etc.)
- [ ] GPS check-in/check-out (optional, for verification)
- [ ] Hour summary reports (by week, month, rotation, total)
- [ ] Export hours log (PDF, CSV)

### Evaluations
- [ ] Mid-rotation evaluation (preceptor → student)
- [ ] Final rotation evaluation (preceptor → student)
- [ ] Student evaluation of site/preceptor
- [ ] Standardized rubrics by discipline (AACN, PAEA standards)
- [ ] Custom evaluation templates per university
- [ ] Evaluation reminders and deadlines
- [ ] Evaluation history and trends

### Compliance & Document Management
- [ ] Student credential tracking (expiration dates, renewal reminders)
- [ ] Required document checklist per site
- [ ] Document upload with verification status
- [ ] Automated compliance alerts (expired CPR, background check due)
- [ ] Bulk compliance status view (university coordinator)
- [ ] Site-specific requirements mapping

### Affiliation Agreements
- [ ] Agreement template library
- [ ] Digital agreement creation between university and site
- [ ] E-signature integration
- [ ] Agreement status tracking (draft → review → active → expired)
- [ ] Renewal reminders
- [ ] Agreement document storage

### Communication
- [ ] In-app messaging (student ↔ preceptor, coordinator ↔ site manager)
- [ ] Announcement broadcasts (university → all students)
- [ ] Notification preferences (email, SMS, in-app)
- [ ] Message templates for common communications

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
