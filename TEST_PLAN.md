# ClinicLink — Comprehensive Test Plan
## Full-Stack Testing Across All 6 User Roles with Proposed Screenshots

**Date:** 2026-02-15 (Updated)
**Platform:** ClinicLink Clinical Education Platform
**URL:** https://cliniclink.health | API: https://api.cliniclink.health
**Scope:** Functional testing, security testing, flow validation, and screenshot documentation for all 6 user roles

---

## Table of Contents

### Part A: Role-Based Functional Testing & Screenshots
1. [Student Role](#1-student-role)
2. [Preceptor Role](#2-preceptor-role)
3. [Site Manager Role](#3-site-manager-role)
4. [Coordinator Role](#4-coordinator-role)
5. [Professor Role](#5-professor-role)
6. [Admin Role](#6-admin-role)

### Part B: Cross-Cutting Feature Tests
7. [Authentication & Registration](#7-authentication--registration)
8. [Subscription & Payments](#8-subscription--payments)
9. [Messaging & Notifications](#9-messaging--notifications)
10. [Calendar & Scheduling](#10-calendar--scheduling)

### Part C: Security & Data Integrity
11. [Role-Based Access Control (RBAC)](#11-role-based-access-control-rbac)
12. [Data Isolation & Leak Prevention](#12-data-isolation--leak-prevention)
13. [API Security](#13-api-security)
14. [Frontend Security](#14-frontend-security)
15. [Critical Vulnerabilities Checklist](#15-critical-vulnerabilities-checklist)

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@cliniclink.health | ClinicLink2026! |
| Preceptor | preceptor@cliniclink.health | ClinicLink2026! |
| Site Manager | site@cliniclink.health | ClinicLink2026! |
| Coordinator | coordinator@cliniclink.health | ClinicLink2026! |
| Professor | professor@cliniclink.health | ClinicLink2026! |
| Admin | admin@cliniclink.health | ClinicLink2026! |

---

# PART A: ROLE-BASED FUNCTIONAL TESTING & SCREENSHOTS

---

## 1. Student Role

**Login:** student@cliniclink.health / ClinicLink2026!
**Sidebar Pages:** Dashboard, Search Rotations, Applications, Hour Log, Evaluations, Certificates, Onboarding, Compliance, Messages, Calendar, Preceptor Directory, Settings

### 1.1 Student Dashboard

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-01 | Dashboard loads with correct stats | Login → /dashboard | Shows hours completed, applications count, active rotations, pending reviews | |
| S-02 | Credential compliance section | Check compliance widget | Shows expired/expiring/valid credential counts with colored badges | |
| S-03 | Quick action buttons work | Click each quick action | Navigates to Search Rotations, Log Hours, My Applications, Evaluations | |
| S-04 | Active rotations list | Check rotation list | Shows site name, location, dates for current placements | |
| S-05 | Recent evaluations | Check evaluations section | Shows latest evaluations with scores and preceptor names | |
| S-06 | Action required banner | Trigger conditions | Shows alerts for expired credentials, pending hour logs, unfinished onboarding | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-DASH-1 | Student Dashboard — full view | Full page showing stats cards, compliance, quick actions, active rotations |
| S-DASH-2 | Student Dashboard — action required banner | Banner showing "You have expired credentials" or "Hours pending review" |
| S-DASH-3 | Student Dashboard — empty state | New student with no rotations, 0 hours, no evaluations |

### 1.2 Search Rotations

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-07 | Search page loads | Navigate to /rotations | Shows filter panel + rotation slot cards | |
| S-08 | Filter by specialty | Select "Family Practice" | Only matching slots shown | |
| S-09 | Filter by location | Enter city/state | Geographically filtered results | |
| S-10 | Filter by date range | Set start/end dates | Only slots within range shown | |
| S-11 | Slot detail modal | Click a slot card | Shows full details: site, preceptor, schedule, requirements, capacity | |
| S-12 | Apply button (within free tier) | Click "Apply" on slot | Application form/modal opens | |
| S-13 | Apply button (upgrade required) | Exhaust free tier → try to apply | Upgrade modal appears with Pro pricing ($9.99/month, $86/year) | |
| S-14 | Bookmark slot | Click bookmark icon | Slot saved, appears in bookmarks | |
| S-15 | Search as unauthenticated | Visit /rotations without login | Can browse but "Apply" requires login | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-SRCH-1 | Rotation search — filters + results | Left filter panel, right side showing rotation cards with site info |
| S-SRCH-2 | Rotation slot detail | Expanded detail view showing preceptor, schedule, capacity, requirements |
| S-SRCH-3 | Apply modal | Application form with cover letter, preferred dates |
| S-SRCH-4 | Upgrade required modal | Modal showing "You've used your free rotation" with Pro plan options |
| S-SRCH-5 | Search — no results | Empty state when filters return no matches |

### 1.3 Applications

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-16 | Applications list | Navigate to /applications | Shows all submitted applications with status badges | |
| S-17 | Filter by status | Filter pending/accepted/declined | Correct filtering | |
| S-18 | Application detail | Click an application | Shows full details: slot info, status history, messages | |
| S-19 | Withdraw application | Click withdraw on pending application | Status changes to withdrawn, slot capacity restored | |
| S-20 | Cannot apply to same slot twice | Try applying again | Error: "Already applied" | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-APP-1 | Applications list — multiple statuses | List showing pending (yellow), accepted (green), declined (red) badges |
| S-APP-2 | Application detail — accepted | Detail view with acceptance info, onboarding tasks |
| S-APP-3 | Application detail — pending | Detail view showing "Pending Review" status |

### 1.4 Hour Log

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-21 | Hour log list | Navigate to /hours | Shows logged hours with status badges (pending/approved/rejected) | |
| S-22 | Log new hours | Click "Log Hours" | Form: date, hours, slot, description, activity type | |
| S-23 | Hours summary | Check summary section | Total approved, total pending, hours by rotation | |
| S-24 | Edit pending hours | Click edit on pending log | Can modify until approved | |
| S-25 | Cannot edit approved hours | Try editing approved log | Edit button disabled or hidden | |
| S-26 | Cannot log negative hours | Enter -5 hours | Validation error | |
| S-27 | Cannot log >24 hours | Enter 25 hours | Validation error | |
| S-28 | Cannot log future date | Select future date | Validation error | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-HOUR-1 | Hour log list — mixed statuses | List with approved (green), pending (yellow), rejected (red) entries |
| S-HOUR-2 | Log hours form | Form showing date picker, hours input, slot dropdown, description |
| S-HOUR-3 | Hours summary | Summary card with total hours, progress bar toward required hours |

### 1.5 Evaluations

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-29 | Evaluations list | Navigate to /evaluations | Shows evaluations received with scores | |
| S-30 | Evaluation detail | Click an evaluation | Full evaluation form with ratings, comments, preceptor info | |
| S-31 | Student cannot create evaluation | Verify no "Create" button | Only preceptors can create evaluations | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-EVAL-1 | Evaluations received | List of evaluations with star ratings, preceptor names |
| S-EVAL-2 | Evaluation detail | Full evaluation showing all criteria scores and written feedback |

### 1.6 Certificates

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-32 | Certificates list | Navigate to /certificates | Shows earned rotation completion certificates | |
| S-33 | Download certificate PDF | Click download | Valid PDF with student name, rotation, dates, hours, certificate # | |
| S-34 | Certificate verification link | Copy verification link | Public verification page shows valid cert | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-CERT-1 | Certificates list | Cards showing certificate info with download button |
| S-CERT-2 | Certificate PDF | Generated PDF document showing completion details |

### 1.7 Credentials & Compliance

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-35 | Upload credential | Settings → Credentials → Upload | File uploaded, shown in list with expiry | |
| S-36 | Credential expiry warnings | Have an expiring credential | Yellow/red badge appears on dashboard + compliance page | |
| S-37 | Compliance dashboard | Navigate to /compliance | Shows compliance status for active rotations | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-CRED-1 | Credentials tab in Settings | List of uploaded credentials with expiry dates and status badges |
| S-CRED-2 | Compliance dashboard — student view | Compliance checklist with green checks and red X marks |

### 1.8 Subscription & Upgrade

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-38 | Subscription tab shows free plan | Settings → Subscription | Shows "Free Plan" with trial days, rotation usage | |
| S-39 | Upgrade to Pro monthly | Click $9.99/month | Redirected to Stripe Checkout, complete with test card 4242... | |
| S-40 | Upgrade to Pro yearly | Click $86/year | Stripe Checkout with yearly price | |
| S-41 | Post-upgrade status | Return from Stripe | Shows "Pro Plan - Active" with "Manage Billing" button | |
| S-42 | Manage billing portal | Click "Manage Billing" | Redirected to Stripe Customer Portal | |
| S-43 | Pricing page | Visit /pricing | Shows student Free Trial vs Pro comparison | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-SUB-1 | Settings → Subscription tab — Free plan | Shows plan status, trial days, rotation usage counter |
| S-SUB-2 | Settings → Subscription tab — Upgrade cards | Monthly ($9.99) and yearly ($86, save 28%) options |
| S-SUB-3 | Stripe Checkout | Stripe-hosted checkout page showing ClinicLink Pro price |
| S-SUB-4 | Settings → Subscription tab — Pro plan | Shows "Pro Plan - Active" with "Manage Billing" button |
| S-SUB-5 | Pricing page — full view | Full pricing page with Student, Sites, University plan sections |

### 1.9 Settings

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| S-44 | Profile tab | Settings → Profile | Edit first/last name, phone, avatar | |
| S-45 | Academic tab | Settings → Academic | University, program, expected graduation | |
| S-46 | Credentials tab | Settings → Credentials | Upload/manage credentials (BLS, HIPAA, etc.) | |
| S-47 | Security tab (MFA) | Settings → Security | Enable/disable 2FA with QR code | |
| S-48 | Notifications tab | Settings → Notifications | Toggle notification preferences per type | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| S-SET-1 | Settings — Profile tab | Profile form with editable fields |
| S-SET-2 | Settings — Academic tab | University/program dropdowns |
| S-SET-3 | Settings — Security tab with MFA QR | QR code for 2FA setup |
| S-SET-4 | Settings — Notifications tab | Toggle switches for each notification type |

---

## 2. Preceptor Role

**Login:** preceptor@cliniclink.health / ClinicLink2026!
**Sidebar Pages:** Dashboard, Hour Log, Evaluations, Certificates, CE Credits, Messages, Calendar, My Site, Preceptor Directory, Settings

### 2.1 Preceptor Dashboard

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| P-01 | Dashboard loads | Login → /dashboard | Shows current students, hours to review, evaluations due, total hours supervised | |
| P-02 | Pending site invites | Check invites section | Shows accept/decline buttons for site invitations | |
| P-03 | My site affiliation | Check site section | Shows affiliated site with active slot count | |
| P-04 | Pending hour reviews | Check reviews section | Lists student hour logs awaiting approval | |
| P-05 | Quick actions work | Click each action | Navigate to Review Hours, Evaluations, My Students, Settings | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| P-DASH-1 | Preceptor Dashboard — full view | Stats cards, pending hour reviews, site affiliation, quick actions |
| P-DASH-2 | Preceptor Dashboard — with pending invites | Site invite banner with accept/decline buttons |

### 2.2 Hour Log Review

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| P-06 | View pending hour logs | Navigate to /hours | List of student hour logs pending review | |
| P-07 | Approve hours | Click approve on pending log | Status → approved, student notified | |
| P-08 | Reject hours with reason | Click reject, enter reason | Status → rejected, student notified with reason | |
| P-09 | Cannot review hours from another preceptor's students | Verify scope | Only students assigned to preceptor's slots visible | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| P-HOUR-1 | Hour log review list | List of student-submitted hour logs with approve/reject actions |
| P-HOUR-2 | Hour log review detail | Individual hour log with student info, hours, description, approve/reject buttons |

### 2.3 Create Evaluations

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| P-10 | Create evaluation | Navigate to /evaluations → New | Form: select student, ratings per criteria, comments | |
| P-11 | Submit evaluation | Fill form, submit | Evaluation saved, student notified | |
| P-12 | Can only evaluate assigned students | Check student dropdown | Only students in preceptor's slots appear | |
| P-13 | View past evaluations | Check evaluations list | Shows all evaluations created by this preceptor | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| P-EVAL-1 | Create evaluation form | Form with student selector, rating sliders/stars, comment boxes |
| P-EVAL-2 | Evaluations list (created) | List of evaluations this preceptor has submitted |

### 2.4 CE Credits

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| P-14 | View CE credits | Navigate to /ce-credits | Shows earned CE credit history | |
| P-15 | CE certificate details | Click on a CE cert | Shows CE credit amount, date, verification link | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| P-CE-1 | CE Credits list | List of earned CE certificates with credit hours |

### 2.5 My Site

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| P-16 | View affiliated site | Navigate to /site | Shows site info, address, current slots, other preceptors | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| P-SITE-1 | My Site page | Site details with address, active slots, preceptor list |

---

## 3. Site Manager Role

**Login:** site@cliniclink.health / ClinicLink2026!
**Sidebar Pages:** Dashboard, My Site, Rotation Slots, Preceptors, Applications, Hour Log, Onboarding, Compliance, Agreements, Messages, Calendar, Analytics, Preceptor Directory, Settings

### 3.1 Site Manager Dashboard

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-01 | Dashboard loads | Login → /dashboard | Shows sites count, open slots, pending apps, active students, avg rating | |
| SM-02 | Slot occupancy chart | Check occupancy section | Visual capacity indicators per slot | |
| SM-03 | Pending applications list | Check applications section | Shows student names, slot info, apply date | |
| SM-04 | Quick actions work | Click each | Navigate to Create Slot, Review Apps, Manage Sites, Settings | |
| SM-05 | Action required banner | Trigger conditions | Shows pending apps count, join requests | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-DASH-1 | Site Manager Dashboard — full view | Stats, slot occupancy, pending applications, quick actions |
| SM-DASH-2 | Site Manager Dashboard — action required | Banner showing "5 pending applications" or "2 join requests" |

### 3.2 My Site Management

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-06 | View/edit site info | Navigate to /site | Site name, address, description, specialties, contact | |
| SM-07 | Update site details | Edit fields, save | Changes persisted | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-SITE-1 | My Site — edit view | Editable site profile with all fields |

### 3.3 Rotation Slot Management

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-08 | Slots list | Navigate to /slots | All slots for this site with status, capacity, dates | |
| SM-09 | Create new slot | Click "Create Slot" | Form: specialty, dates, capacity, requirements, preceptor assignment | |
| SM-10 | Edit existing slot | Click edit on slot | Can modify details | |
| SM-11 | Delete slot | Click delete | Confirmation modal, slot removed (handles existing applications) | |
| SM-12 | Slot capacity tracking | Check filled vs total | Shows "3/5 filled" with progress bar | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-SLOT-1 | Slots list | Cards/table showing all rotation slots with capacity badges |
| SM-SLOT-2 | Create slot form | Full form with specialty, dates, capacity, requirements |
| SM-SLOT-3 | Slot detail with capacity | Detail view showing filled/total students |

### 3.4 Review Applications

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-13 | Applications list | Navigate to /site-applications | Pending applications for this site's slots | |
| SM-14 | Accept application | Click accept | Status → accepted, student notified, slot capacity +1, onboarding tasks generated | |
| SM-15 | Decline application | Click decline with reason | Status → declined, student notified | |
| SM-16 | View student profile from application | Click student name | Shows student credentials, academic info | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-APP-1 | Site applications list | Applications with student info, slot, and accept/decline buttons |
| SM-APP-2 | Application review — student details | Expanded view showing student credentials, cover letter |

### 3.5 Preceptor Management

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-17 | Preceptors list | Navigate to /preceptors | All preceptors at this site | |
| SM-18 | Invite preceptor | Click "Invite" | Send email invitation with link | |
| SM-19 | Review join requests | Check pending requests | Accept/decline preceptor join requests | |
| SM-20 | Assign preceptor to slot | Edit slot, select preceptor | Preceptor linked to rotation slot | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-PREC-1 | Site preceptors list | List of preceptors with status, assigned slots |
| SM-PREC-2 | Invite preceptor modal | Email input with invite button |

### 3.6 Stripe Connect (Payments)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-21 | Connect Stripe account | Settings → Payments → "Connect with Stripe" | Redirect to Stripe Connect onboarding | |
| SM-22 | Stripe onboarded status | After connecting | Shows "Connected" with charges/payouts badges | |
| SM-23 | Payment history | Check payment section | List of received payments with platform fee deductions | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-PAY-1 | Settings — Payments tab — not connected | "Connect with Stripe" button and explanation |
| SM-PAY-2 | Settings — Payments tab — connected | Green "Connected" badge, charges/payouts enabled |
| SM-PAY-3 | Payment history | Table of received payments with amounts and fees |

### 3.7 Onboarding Checklists

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| SM-24 | View onboarding templates | Navigate to /onboarding-checklists | Site's onboarding checklist templates | |
| SM-25 | Create checklist template | Create new template | Define required items (HIPAA, background check, etc.) | |
| SM-26 | Track student onboarding | View student compliance | See which students have completed which items | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| SM-OB-1 | Onboarding checklist templates | List of template items with required/optional flags |
| SM-OB-2 | Student onboarding status | Grid showing students × tasks with completion checks |

---

## 4. Coordinator Role

**Login:** coordinator@cliniclink.health / ClinicLink2026!
**Sidebar Pages:** Dashboard, Evaluations, Certificates, CE Credits, Agreements, Eval Templates, Messages, Calendar, Compliance, My Students, My University, Placements, Sites Directory, Preceptor Directory, Analytics, Accreditation Reports, Settings

### 4.1 Coordinator Dashboard

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-01 | Dashboard loads | Login → /dashboard | Shows total students, active placements, unplaced students, pending apps, available slots | |
| C-02 | Placement pipeline | Check pipeline section | Placement rate %, placed/pending/unplaced breakdown | |
| C-03 | Recent applications | Check applications section | Latest student applications with status | |
| C-04 | Quick actions | Click each | My Students, Placements, Programs, Sites Directory | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-DASH-1 | Coordinator Dashboard — full view | Stats, placement pipeline, recent applications, quick actions |
| C-DASH-2 | Coordinator Dashboard — action required | Banner with unplaced student count, pending CE certs |

### 4.2 My Students

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-05 | Student list | Navigate to /students | All students from coordinator's university | |
| C-06 | Student detail | Click student name | Full profile: credentials, placements, hours, evaluations | |
| C-07 | Filter by program | Filter dropdown | Only students in selected program shown | |
| C-08 | Cannot see other university's students | Verify scope | Only own university's students visible | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-STU-1 | My Students list | Table of students with placement status, program, hours |
| C-STU-2 | Student detail | Comprehensive student profile with all tabs |

### 4.3 Programs & University

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-09 | Programs list | Navigate to /programs | University's clinical programs | |
| C-10 | Create program | Click "Create Program" | Form: name, description, required hours, specialties | |
| C-11 | Edit program | Click edit | Modify program details | |
| C-12 | University profile | Navigate to university detail | University info, programs, coordinators | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-PROG-1 | Programs list | Table of programs with student count, required hours |
| C-PROG-2 | Create/edit program form | Program form with all fields |

### 4.4 Placements

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-13 | Placements overview | Navigate to /placements | All student placements with status | |
| C-14 | Filter by program/status | Use filters | Filtered placement list | |
| C-15 | Placement detail | Click a placement | Student, site, slot, preceptor, dates, hours | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-PLACE-1 | Placements list | Table with student, site, status, hours columns |

### 4.5 Agreements

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-16 | Agreements list | Navigate to /agreements | Affiliation agreements with status | |
| C-17 | Create agreement | Create new agreement | Form: site, dates, terms | |
| C-18 | Sign agreement | Add e-signature | Signature captured and saved | |
| C-19 | View agreement detail | Click agreement | Full terms with signature status | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-AGR-1 | Agreements list | Table with agreement status badges (draft, pending, signed) |
| C-AGR-2 | Agreement detail with e-signature | Full agreement with signature canvas |

### 4.6 Evaluation Templates

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-20 | Templates list | Navigate to /evaluation-templates | Custom evaluation form templates | |
| C-21 | Create template | Define criteria, rating scales | Template saved | |
| C-22 | Template used in evaluations | Preceptor creates eval | Uses coordinator's template | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-TMPL-1 | Evaluation templates list | Templates with criteria count, usage stats |
| C-TMPL-2 | Template builder | Form with draggable criteria, rating scale options |

### 4.7 Analytics & Reports

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-23 | Analytics dashboard | Navigate to /analytics | Placement rates, specialty demand, student outcomes | |
| C-24 | Accreditation reports | Navigate to /accreditation-reports | Program compliance data, hour summaries, pass rates | |
| C-25 | Export reports | Click export | PDF/CSV download of report data | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-ANLY-1 | Analytics dashboard | Charts showing placement rates, specialty distribution |
| C-RPT-1 | Accreditation report | Detailed compliance table with pass/fail indicators |

### 4.8 Sites & Preceptor Directory

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| C-26 | Sites directory | Navigate to /sites | Browse all clinical sites | |
| C-27 | Site detail | Click site | Site info, slots, preceptors, ratings | |
| C-28 | Preceptor directory | Navigate to /preceptor-directory | Browse all preceptors with specialties | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| C-SITES-1 | Sites directory | Grid of site cards with ratings, specialties, slot counts |
| C-PREC-1 | Preceptor directory | Directory with search, filters, specialty badges |

---

## 5. Professor Role

**Login:** professor@cliniclink.health / ClinicLink2026!
**Sidebar Pages:** Dashboard, Messages, Calendar, Compliance, My Students, Placements, Sites Directory, Settings

### 5.1 Professor Dashboard

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| PR-01 | Dashboard loads | Login → /dashboard | Shows total students, active placements, evaluations, available slots | |
| PR-02 | Student placements list | Check placements section | Shows current student placements | |
| PR-03 | Recent evaluations | Check evaluations section | Shows recent evaluations with scores and preceptor attribution | |
| PR-04 | Quick actions | Click each | My Students, Evaluations, Placements, Sites Directory | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| PR-DASH-1 | Professor Dashboard — full view | Stats, student placements, recent evaluations |
| PR-DASH-2 | Professor Dashboard — action required | Banner showing unplaced students count |

### 5.2 My Students

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| PR-05 | View students | Navigate to /students | Students from professor's university | |
| PR-06 | Student detail | Click student | Placement info, hours, evaluations | |
| PR-07 | Scope limited to own university | Verify | Cannot see other university's students | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| PR-STU-1 | My Students list | Table with student names, placement status, hours progress |

### 5.3 Placements & Sites

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| PR-08 | View placements | Navigate to /placements | All student placements from university | |
| PR-09 | Browse sites | Navigate to /sites | Clinical sites directory | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| PR-PLACE-1 | Placements list | Table with student-site-preceptor mappings |

---

## 6. Admin Role

**Login:** admin@cliniclink.health / ClinicLink2026!
**Sidebar Pages:** ALL pages accessible (Dashboard, Hour Log, Evaluations, Certificates, CE Credits, Agreements, Eval Templates, Messages, Calendar, Compliance, Slots, Applications, My Students, Placements, Sites, Universities, All Users, Preceptor Directory, Analytics, Reports, Settings)

### 6.1 Admin Dashboard

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| A-01 | Dashboard loads | Login → /dashboard | Shows total users, active sites, universities, total slots | |
| A-02 | Platform activity | Check activity section | Total applications, pending, open slots, active placements | |
| A-03 | System health | Check health section | API, Database, Auth, Email status indicators | |
| A-04 | Sites overview | Check sites section | Sites with verification status and ratings | |
| A-05 | Quick actions | Click each | Manage Users, Sites Directory, All Slots, Platform Settings | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| A-DASH-1 | Admin Dashboard — full view | Platform-wide stats, system health, activity metrics |
| A-DASH-2 | Admin Dashboard — system health | Green/red status indicators for API, DB, Auth, Email |
| A-DASH-3 | Admin Dashboard — sites overview | Sites table with verification badges and ratings |

### 6.2 User Management

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| A-06 | Users list | Navigate to /admin/users | All platform users with role badges | |
| A-07 | Filter by role | Select role filter | Shows only users of that role | |
| A-08 | Search users | Type in search | Matches by name, email | |
| A-09 | Create new user | Click "Create User" | Form: name, email, role, university/site assignment | |
| A-10 | Edit user | Click edit | Modify user details, role, active status | |
| A-11 | Deactivate user | Toggle active status | User can no longer login | |
| A-12 | Reset user password | Click reset | Sends reset email to user | |
| A-13 | Assign preceptor to site | Select sites in preceptor edit | Auto-creates site invitation | |
| A-14 | Bulk invite | Click "Bulk Invite" | Upload CSV or enter multiple emails | |
| A-15 | User detail page | Click user | Full profile with activity history | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| A-USER-1 | Users list — all roles | Table with name, email, role badge, status, created date |
| A-USER-2 | Users list — filtered by role | Filtered view showing only students (or any role) |
| A-USER-3 | Create user form | Form with role dropdown, university/site assignment |
| A-USER-4 | User detail page | Comprehensive profile with all tabs |
| A-USER-5 | Bulk invite modal | CSV upload or multi-email invite interface |

### 6.3 Admin — All Features Access

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| A-16 | View all slots | /slots | All rotation slots across all sites | |
| A-17 | View all applications | /site-applications | All applications platform-wide | |
| A-18 | View all evaluations | /evaluations | All evaluations across all roles | |
| A-19 | View all hour logs | /hours | All hour logs platform-wide | |
| A-20 | View all certificates | /certificates | All issued certificates | |
| A-21 | View all CE credits | /ce-credits | All CE certificates platform-wide | |
| A-22 | View all agreements | /agreements | All affiliation agreements | |
| A-23 | Universities directory | /universities | All universities with programs | |
| A-24 | Platform analytics | /analytics | Full platform metrics and charts | |
| A-25 | Accreditation reports | /accreditation-reports | System-wide accreditation data | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| A-SLOT-1 | All slots (admin view) | Platform-wide slots table |
| A-UNIV-1 | Universities directory | List of universities with program counts |
| A-ANLY-1 | Platform analytics | Full analytics dashboard with charts |

---

# PART B: CROSS-CUTTING FEATURE TESTS

---

## 7. Authentication & Registration

### 7.1 Registration Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| AUTH-01 | Register as student | /register → fill form → select Student | Account created, redirected to onboarding | |
| AUTH-02 | Register as preceptor | Select Preceptor role | Account created | |
| AUTH-03 | Register as site manager | Select Site Manager role | Account created | |
| AUTH-04 | Register with duplicate email | Use existing email | Error: "Email already registered" | |
| AUTH-05 | Register with weak password | Use "123" | Validation error: min 8 chars | |
| AUTH-06 | Email verification | Check email after register | Verification link sent, works correctly | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| AUTH-REG-1 | Registration form | Clean form with role selector, name, email, password fields |
| AUTH-REG-2 | Registration — validation errors | Form showing inline error messages |
| AUTH-REG-3 | Email verification prompt | "Check your email" page after registration |

### 7.2 Login Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| AUTH-07 | Standard login | /login → enter credentials | Redirected to dashboard | |
| AUTH-08 | Login with MFA | Login → MFA prompt → enter TOTP code | Access granted | |
| AUTH-09 | Wrong password | Enter incorrect password | Error message, no account info leaked | |
| AUTH-10 | Account lockout | 5+ failed attempts | Account locked temporarily | |
| AUTH-11 | Forgot password | Click "Forgot Password" | Reset email sent | |
| AUTH-12 | Reset password | Click link in email, enter new password | Password changed, can login | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| AUTH-LOGIN-1 | Login page | Clean login form with ClinicLink branding |
| AUTH-LOGIN-2 | MFA verification prompt | TOTP code entry screen |
| AUTH-LOGIN-3 | Forgot password page | Email entry form |
| AUTH-LOGIN-4 | Reset password page | New password form |

### 7.3 Onboarding Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| AUTH-13 | Student onboarding | First login after register | Multi-step wizard: academic info, specialties, preferences | |
| AUTH-14 | Preceptor onboarding | First login | Specialties, bio, certifications | |
| AUTH-15 | Site manager onboarding | First login | Site info, address, specialties | |
| AUTH-16 | Skip onboarding | Try to access dashboard | Redirected back to onboarding until complete | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| AUTH-OB-1 | Onboarding — Step 1 | Welcome/role-specific first step |
| AUTH-OB-2 | Onboarding — Step 2 | Academic/professional info entry |
| AUTH-OB-3 | Onboarding — completion | Final step with "Get Started" button |

---

## 8. Subscription & Payments

### 8.1 Student Subscription Flow

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| PAY-01 | Free tier — first rotation | Apply for first rotation | Application submitted (free) | |
| PAY-02 | Free tier — second rotation | Try to apply again after 1 used | Upgrade modal shown | |
| PAY-03 | Free tier — 3 month expiry | Simulate trial expiry | needs_upgrade becomes true | |
| PAY-04 | Checkout — monthly | Click $9.99/month → complete Stripe | Plan upgraded to Pro | |
| PAY-05 | Checkout — yearly | Click $86/year → complete Stripe | Plan upgraded to Pro | |
| PAY-06 | Webhook — subscription.created | After checkout | User plan=pro, subscription_status=active in DB | |
| PAY-07 | Webhook — subscription.deleted | Cancel via Stripe portal | User plan=free, subscription_status=canceled in DB | |
| PAY-08 | Billing portal access | Settings → Subscription → "Manage Billing" | Opens Stripe Customer Portal | |

### 8.2 Site Manager Stripe Connect

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| PAY-09 | Connect account | Settings → Payments → "Connect with Stripe" | Stripe onboarding flow | |
| PAY-10 | Onboarding completion | Complete Stripe verification | stripe_onboarded=true, charges/payouts enabled | |
| PAY-11 | Payment receipt | Student pays for rotation | Site receives 90%, platform gets 10% fee | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| PAY-1 | Pricing page — full | Three audience sections (Students, Sites, Universities) |
| PAY-2 | Pricing page — How it works banner | "1 free rotation" + "3 month trial" + "10% platform fee" |
| PAY-3 | Stripe Checkout page | Checkout form with ClinicLink Pro product |
| PAY-4 | Stripe Customer Portal | Subscription management (cancel, update card) |

---

## 9. Messaging & Notifications

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| MSG-01 | Send message | /messages → New → select recipient → type → send | Message delivered | |
| MSG-02 | Receive message | Check /messages | New message appears with unread badge | |
| MSG-03 | Message thread | Click conversation | Full message history with timestamps | |
| MSG-04 | Unread count badge | Check sidebar/header | Correct unread count displayed | |
| MSG-05 | Notification bell | Click notification bell | Dropdown shows recent notifications | |
| MSG-06 | Notification types | Trigger various events | Application updates, hour reviews, new messages, etc. | |
| MSG-07 | Mark notification read | Click notification | Marked as read, count decremented | |
| MSG-08 | Notification preferences | Settings → Notifications → toggle off | Disabled notifications not sent | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| MSG-1 | Messages — conversation list | Left sidebar with conversations, unread badges |
| MSG-2 | Messages — thread view | Full conversation with message bubbles |
| MSG-3 | Notification dropdown | Bell icon with dropdown showing recent notifications |
| MSG-4 | Notification preferences | Settings toggles for each notification type |

---

## 10. Calendar & Scheduling

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| CAL-01 | Calendar loads | Navigate to /calendar | Monthly view with events | |
| CAL-02 | View rotation dates | Check calendar events | Rotation start/end dates displayed | |
| CAL-03 | Navigate months | Click next/previous | Calendar updates correctly | |
| CAL-04 | Event detail | Click calendar event | Shows event details in modal/popup | |

**📸 Proposed Screenshots:**
| Screenshot # | Description | What to Capture |
|--------------|-------------|-----------------|
| CAL-1 | Calendar — monthly view | Full calendar with colored rotation events |
| CAL-2 | Calendar — event detail | Popup showing event details |

---

# PART C: SECURITY & DATA INTEGRITY

---

## 11. Role-Based Access Control (RBAC)

### 11.1 Cross-Role Access Tests

For each test: Login as Role A, attempt to access Role B's endpoint.

| # | As Role | Try Endpoint | Expected | Severity |
|---|---------|-------------|----------|----------|
| AC-01 | Student | GET /admin/users | 403 Forbidden | CRITICAL |
| AC-02 | Student | POST /api/slots (create slot) | 403 Forbidden | CRITICAL |
| AC-03 | Student | PUT /api/hour-logs/{id}/review | 403 Forbidden | CRITICAL |
| AC-04 | Student | POST /api/evaluations | 403 Forbidden | HIGH |
| AC-05 | Preceptor | POST /api/sites (create site) | 403 Forbidden | HIGH |
| AC-06 | Preceptor | POST /admin/users | 403 Forbidden | CRITICAL |
| AC-07 | Site Manager | GET /admin/users | 403 Forbidden | CRITICAL |
| AC-08 | Coordinator | DELETE /admin/users/{id} | 403 Forbidden | CRITICAL |
| AC-09 | Professor | POST /api/hour-logs | 403 Forbidden | HIGH |
| AC-10 | Unauthenticated | GET /api/auth/me | 401 Unauthorized | HIGH |

### 11.2 Frontend Route Guards

| # | Test Case | Expected | Severity |
|---|-----------|----------|----------|
| RG-01 | Student visits /admin/users URL directly | Redirected to /dashboard | HIGH |
| RG-02 | Student visits /slots URL directly | Redirected to /dashboard | HIGH |
| RG-03 | Unauthenticated visits /dashboard | Redirected to /login | HIGH |
| RG-04 | Back button after logout | Shows login page, not cached content | MEDIUM |

---

## 12. Data Isolation & Leak Prevention

### 12.1 Cross-User Data Access

| # | Test Case | Expected | Severity |
|---|-----------|----------|----------|
| DL-01 | Student A sees only own applications | Student B's apps not visible | CRITICAL |
| DL-02 | Student A sees only own hour logs | Isolated by user | CRITICAL |
| DL-03 | Student A sees only own evaluations | Isolated by user | CRITICAL |
| DL-04 | Preceptor A sees only own students | Only students in own slots | HIGH |
| DL-05 | Site Manager A cannot manage Site B | 403 on other site's resources | CRITICAL |
| DL-06 | Coordinator A sees only own university's students | Scoped by university | CRITICAL |
| DL-07 | Student A downloads Student B's credential | 403 or 404 | CRITICAL |

### 12.2 IDOR Tests

| # | Test Case | Expected | Severity |
|---|-----------|----------|----------|
| ID-01 | Modify another user's hour log | 403 | CRITICAL |
| ID-02 | Delete another user's hour log | 403 | CRITICAL |
| ID-03 | Withdraw another student's application | 403 | CRITICAL |
| ID-04 | Read another user's notification | 403 | CRITICAL |
| ID-05 | Edit another site's slot | 403 | HIGH |

### 12.3 API Response Leakage

| # | Check | Expected | Severity |
|---|-------|----------|----------|
| RL-01 | No passwords in API responses | Hidden from all responses | CRITICAL |
| RL-02 | No MFA secrets in API responses | Hidden from all responses | CRITICAL |
| RL-03 | No stack traces in 500 errors | Generic error messages | HIGH |
| RL-04 | Minimal data in public cert verification | No student PII | CRITICAL |

---

## 13. API Security

| # | Test Case | Expected | Severity |
|---|-----------|----------|----------|
| API-01 | SQL injection in query params | Safe response, no SQL error | CRITICAL |
| API-02 | XSS in stored fields | Escaped in frontend rendering | HIGH |
| API-03 | Mass assignment — add role to profile update | Role field ignored | CRITICAL |
| API-04 | Mass assignment — add is_active to profile | Field ignored | HIGH |
| API-05 | File upload — .exe file | Rejected | CRITICAL |
| API-06 | File upload — .php file | Rejected | CRITICAL |
| API-07 | File upload — oversized (>10MB) | 422 error | MEDIUM |
| API-08 | CORS from unauthorized origin | Blocked | HIGH |
| API-09 | Rate limiting on login | Blocked after threshold | HIGH |
| API-10 | Rate limiting on registration | Blocked after threshold | HIGH |

---

## 14. Frontend Security

| # | Test Case | Expected | Severity |
|---|-----------|----------|----------|
| FE-01 | Token cleared on logout | localStorage cleaned | HIGH |
| FE-02 | No sensitive data in console | Check browser console | MEDIUM |
| FE-03 | React XSS prevention | No dangerouslySetInnerHTML misuse | HIGH |
| FE-04 | HTTPS enforcement | HTTP redirects to HTTPS | HIGH |

---

## 15. Critical Vulnerabilities Checklist

| # | Vulnerability | Location | Status | Fix Priority |
|---|-------------|----------|--------|-------------|
| V-01 | Registration allows coordinator/professor roles | AuthController register | | P0 |
| V-02 | No rate limit on MFA verification | MFA verify endpoint | | P0 |
| V-03 | Auth token in localStorage | AuthContext.tsx | | P1 |
| V-04 | CORS regex potentially too permissive | config/cors.php | | P1 |
| V-05 | File type validation on uploads | Upload endpoints | | P2 |
| V-06 | No audit logging | System-wide | | P2 |

---

## Screenshot Capture Checklist Summary

### Total Proposed Screenshots: 78

| Role / Section | Count | IDs |
|---------------|-------|-----|
| **Student** | 24 | S-DASH-1~3, S-SRCH-1~5, S-APP-1~3, S-HOUR-1~3, S-EVAL-1~2, S-CERT-1~2, S-CRED-1~2, S-SUB-1~5, S-SET-1~4 |
| **Preceptor** | 7 | P-DASH-1~2, P-HOUR-1~2, P-EVAL-1~2, P-CE-1, P-SITE-1 |
| **Site Manager** | 14 | SM-DASH-1~2, SM-SITE-1, SM-SLOT-1~3, SM-APP-1~2, SM-PREC-1~2, SM-PAY-1~3, SM-OB-1~2 |
| **Coordinator** | 13 | C-DASH-1~2, C-STU-1~2, C-PROG-1~2, C-PLACE-1, C-AGR-1~2, C-TMPL-1~2, C-ANLY-1, C-RPT-1, C-SITES-1, C-PREC-1 |
| **Professor** | 4 | PR-DASH-1~2, PR-STU-1, PR-PLACE-1 |
| **Admin** | 9 | A-DASH-1~3, A-USER-1~5, A-SLOT-1, A-UNIV-1, A-ANLY-1 |
| **Auth & Shared** | 7 | AUTH-REG-1~3, AUTH-LOGIN-1~4, AUTH-OB-1~3 |
| **Payments** | 4 | PAY-1~4 |
| **Messaging** | 4 | MSG-1~4 |
| **Calendar** | 2 | CAL-1~2 |

---

## Test Execution Plan

### Phase 1: Authentication & Onboarding (Day 1)
- All AUTH tests (registration, login, MFA, password reset)
- Onboarding flow for each role
- **Screenshots:** AUTH-REG-1~3, AUTH-LOGIN-1~4, AUTH-OB-1~3

### Phase 2: Student Flow (Day 2)
- Full student journey: search → apply → hour log → evaluation → certificate
- Subscription checkout flow
- **Screenshots:** All S-* screenshots

### Phase 3: Preceptor & Site Manager (Day 3)
- Preceptor: review hours, create evaluations, CE credits
- Site Manager: manage slots, review apps, Stripe Connect, onboarding checklists
- **Screenshots:** All P-* and SM-* screenshots

### Phase 4: Coordinator, Professor & Admin (Day 4)
- Coordinator: programs, placements, agreements, analytics, reports
- Professor: students, placements
- Admin: user management, platform-wide access
- **Screenshots:** All C-*, PR-*, A-* screenshots

### Phase 5: Cross-Cutting & Messaging (Day 5)
- Messaging between roles
- Calendar functionality
- Notification flows
- Subscription & payment end-to-end
- **Screenshots:** MSG-*, CAL-*, PAY-*

### Phase 6: Security Testing (Day 6-7)
- RBAC verification (Section 11)
- Data isolation tests (Section 12)
- API security tests (Section 13)
- Frontend security (Section 14)
- Vulnerability remediation verification (Section 15)

---

## Test Results Template

| Test ID | Result | Notes | Screenshot Captured | Date | Tester |
|---------|--------|-------|--------------------:|------|--------|
| S-01 | | | ☐ | | |
| ... | | | | | |

**Total Test Cases: 195+**
**Total Proposed Screenshots: 78**
**Roles Covered: 6 (Student, Preceptor, Site Manager, Coordinator, Professor, Admin)**
