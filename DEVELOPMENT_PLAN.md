# ClinicLink - Development Plan

## Vision
The marketplace that solves healthcare education's biggest bottleneck — connecting students who need clinical hours with sites that offer them.

---

## Phase 1: MVP (Weeks 1-8)
**Goal:** Two-sided marketplace — students search and apply, sites list and accept

### Week 1-2: Project Setup & Auth
- Scaffold React 18 + TypeScript + Vite + Tailwind frontend
- Scaffold Laravel 12 backend with PostgreSQL
- Auth system with role-based access (Student, Preceptor, Site Manager, Coordinator, Professor, Admin)
- Profile setup flows per role
- University and facility verification

### Week 3-4: Student Side
- Student profile with credential uploads
- Rotation search with filters (specialty, location, dates, cost)
- Map-based search (Mapbox/Google Maps)
- Rotation detail pages
- Application submission workflow
- Application status tracking
- Saved searches and bookmarks

### Week 5-6: Site/Clinic Side
- Facility profiles with photos and description
- Rotation slot creation (specialty, dates, capacity, requirements, cost)
- Application review dashboard (accept, decline, waitlist)
- Preceptor assignment
- Requirements checklist per slot

### Week 7-8: University Dashboard & Launch
- University program setup
- Student roster with placement status tracking
- Placement overview dashboard
- Email/SMS notifications (application updates, reminders)
- Performance optimization
- Deploy: Vercel + Railway

**MVP Deliverable:** Students can search rotation sites, apply, and track status. Sites can list slots and manage applications. Universities can monitor placements.

---

## Phase 2: Tracking & Compliance (Weeks 9-16)
- Clinical hour logging with preceptor approval
- Mid-rotation and final evaluations (standardized rubrics)
- Compliance document management (credentials, expiration tracking)
- Affiliation agreement management with e-signatures
- In-app messaging between all parties
- Hour summary reports and exports

---

## Phase 3: Payments & Intelligence (Weeks 17-24)
- Stripe Connect for paid rotation placements
- Preceptor management and recognition system
- Smart matching algorithm (student prefs × site requirements)
- Advanced analytics (placement rates, time-to-place, demand heat maps)
- Accreditation-ready report generation

---

## Phase 4: Scale (Weeks 25+)
- Multi-discipline expansion (nursing, PA, NP, PT, OT, social work, pharmacy, MD)
- Post-graduation job board ("rotation to hire" pipeline)
- React Native mobile app
- LMS integration (Canvas, Blackboard)
- Background check provider integration

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind |
| Backend | Laravel 12 + PHP 8.4 |
| Database | PostgreSQL |
| Search | Algolia / Meilisearch |
| Maps | Google Maps / Mapbox |
| Payments | Stripe Connect |
| E-Signatures | HelloSign / DocuSign API |
| Notifications | Twilio (SMS) + SendGrid (Email) |
| Calendar | FullCalendar |
| Hosting | Vercel + Railway |
| Mobile | React Native (Phase 4) |

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
