# ClinicLink - Clinical Rotation & Practicum Matching Platform

## Overview
ClinicLink is a SaaS marketplace that connects healthcare students needing clinical hours/practicum rotations with clinics, hospitals, and providers offering rotation sites. It bridges the gap between universities, students, site managers, preceptors, and clinical facilities — replacing the chaotic, manual process of finding, managing, and tracking clinical placements.

## The Problem
- Healthcare students (nursing, PA, NP, PT, OT, social work, counseling, pharmacy) MUST complete hundreds of clinical hours to graduate
- Finding rotation sites is the **#1 bottleneck** in healthcare education — students spend months cold-calling clinics
- Universities maintain outdated spreadsheets of "approved sites" with no real-time availability
- Site managers are overwhelmed with placement requests from dozens of schools
- No standardized system for affiliation agreements, compliance docs, or hour tracking
- Some sites charge fees ($500-5,000/rotation) but there's no transparent marketplace
- Preceptors get zero recognition or compensation for teaching
- Students sometimes can't graduate on time because they can't find placements

## The Solution
A two-sided marketplace + management platform:

### For Students
- **Search & Match** — Browse available rotation sites by specialty, location, dates, cost
- **Apply** — Submit applications with credentials, preferences, and availability
- **Track Hours** — Digital time logging with preceptor sign-off
- **Evaluations** — Complete and receive evaluations digitally
- **Portfolio** — Build clinical experience portfolio for job applications

### For Clinics / Site Managers
- **List Availability** — Post rotation slots with specialty, capacity, dates, requirements
- **Manage Applications** — Review, accept, waitlist student applications
- **Compliance** — Track student credentials, background checks, immunizations
- **Preceptor Management** — Assign and manage preceptors per student
- **Revenue** — Charge fees for premium placements (optional)

### For Universities / Programs
- **Program Dashboard** — Track all students' placement status
- **Affiliation Agreements** — Digital agreement management with sites
- **Compliance Monitoring** — Ensure all students meet site requirements
- **Faculty Oversight** — Professor/coordinator view of student progress
- **Reporting** — Accreditation-ready reports on clinical hours completed

### For Preceptors
- **Profile** — Credentials, specialties, teaching interests
- **Schedule** — Availability calendar for student supervision
- **Evaluations** — Evaluate students with standardized rubrics
- **Recognition** — CE credits, teaching portfolio, reviews from students

## Target Market
- 3.8M+ healthcare students in the US
- 300K+ nursing students graduate annually (each needs 500-1000+ clinical hours)
- 100K+ NP/PA students (each needs 500-2000+ clinical hours)
- 5,000+ nursing programs in the US
- Thousands of clinics, hospitals, and private practices that host rotations
- $1B+ spent annually on clinical placement coordination

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Laravel 12 + PHP 8.4
- **Database:** PostgreSQL
- **Search:** Algolia or Meilisearch (site/rotation search)
- **Payments:** Stripe Connect (rotation fees, platform fees)
- **Documents:** Digital signatures, document upload/verification
- **Notifications:** Twilio (SMS) + SendGrid (Email)
- **Calendar:** FullCalendar integration

## User Roles
1. **Student** — Search rotations, apply, log hours, complete evaluations
2. **Preceptor** — Manage students, approve hours, write evaluations
3. **Site Manager** — List rotation slots, manage applications, track compliance
4. **University Coordinator** — Oversee program placements, manage affiliations
5. **Professor/Faculty** — Monitor student progress, review evaluations
6. **Admin** — Platform management, analytics, support

## Revenue Model
- **University Subscription:**
  - Free: 1 program, 25 students, basic tracking
  - Standard ($499/program/semester): Unlimited students, compliance, reporting
  - Enterprise ($999/program/semester): Multi-program, API, custom workflows, accreditation reports
- **Clinic/Site Listing:**
  - Free: Basic listing, 5 slots/semester
  - Pro ($99/mo): Unlimited slots, application management, compliance tools
  - Network ($249/mo): Multi-location, analytics, priority placement
- **Transaction Fees:** 10% platform fee on paid rotation placements
- **Student:** Free (always — students should never pay for the platform itself)

## Quick Start
```bash
cd frontend && npm install && npm run dev
cd laravel-backend && composer install && php artisan serve
```
