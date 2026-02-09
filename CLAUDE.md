# ClinicLink - Clinical Rotation & Practicum Matching Platform

## Overview
ClinicLink connects healthcare students needing clinical hours/practicum rotations with clinics and providers offering rotation sites. It links all parties: students, preceptors, universities, clinics, site managers, and professors — for free or paid rotations.

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite 6.x
- **Styling:** Tailwind CSS 4.x with custom design system
- **Routing:** React Router v7
- **State:** React Query + Context API (Split Context pattern from Solarera/CareManagerIO)
- **UI:** Custom premium components (same design language as CareManagerIO & Solarera)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Notifications:** Sonner
- **Search:** Algolia / Meilisearch
- **Calendar:** FullCalendar
- **Maps:** Google Maps / Mapbox

### Backend
- **Framework:** Laravel 12 (PHP 8.4)
- **Auth:** Laravel Sanctum
- **Payments:** Stripe Connect
- **Database:** PostgreSQL (Railway-ready)

## Design System — MUST MATCH CareManagerIO / Solarera Look & Feel

### Color Palette (Healthcare Education Inspired)
- **Primary Blue:** `#0ea5e9` — Trust, professionalism (sky-500)
- **Secondary Teal:** `#14b8a6` — Healthcare, growth (teal-500)
- **Accent Amber:** `#f59e0b` — Warmth, attention (amber-500)
- **Success Green:** `#22c55e` — Completion, approved (green-500)
- **Error Red:** `#ef4444` — Alerts, expired credentials (red-500)
- **Warm Neutrals:** Stone-50 to Stone-900 (same as Solarera)

### Design Principles (Inherited from CareManagerIO & Solarera)
- Glass morphism with backdrop blur on cards and modals
- Premium shadows with subtle colored glows
- Hover lift effects on interactive cards
- Smooth transitions (300ms ease)
- Gradient headers and hero sections
- Rounded corners (lg/xl) for modern feel
- Clean typography with clear hierarchy
- Role-specific color accents in dashboards
- Mobile-first responsive design

### Component Patterns (Same as Solarera)
- Split Context pattern (separate State/Dispatch contexts)
- useReducer for complex state management
- Custom Button, Input, Card, Modal components
- Sonner for toast notifications
- Role-based dashboard layouts
- Sidebar navigation with collapsible sections
- Data tables with search, filter, sort, pagination
- Form validation with Zod schemas

## Project Structure
```
cliniclink/
├── frontend/              # React frontend
│   └── src/
│       ├── components/
│       │   ├── ui/        # Button, Input, Card, Modal (premium design)
│       │   ├── layout/    # MainLayout, Sidebar, Header
│       │   ├── student/   # Student search, apply, hours
│       │   ├── site/      # Site listings, applications
│       │   ├── university/# Program dashboard, compliance
│       │   ├── preceptor/ # Evaluations, scheduling
│       │   └── dashboard/ # Role-specific dashboards
│       ├── contexts/      # AuthContext, PlacementContext
│       ├── hooks/         # useAuth, useSearch, useHours
│       ├── services/      # api.ts, search.ts
│       ├── types/         # TypeScript types
│       ├── lib/           # utils.ts, validators.ts
│       └── pages/         # Route pages
└── laravel-backend/       # Laravel API
    ├── app/
    │   ├── Http/Controllers/
    │   └── Models/
    ├── database/migrations/
    └── routes/api.php
```

## User Roles
1. **Student** — Search rotations, apply, log hours, complete evaluations
2. **Preceptor** — Manage students, approve hours, write evaluations
3. **Site Manager** — List rotation slots, manage applications, track compliance
4. **University Coordinator** — Oversee program placements, manage affiliations
5. **Professor/Faculty** — Monitor student progress, review evaluations
6. **Admin** — Platform management, analytics, support

## Key Design Decisions
- Students are ALWAYS free (never charge students for the platform)
- Same React + Laravel + PostgreSQL stack as all other portfolio projects
- Same premium visual design language (glass morphism, shadows, gradients)
- Same Split Context state management pattern
- Same API service architecture (typed client + domain service objects)
- Mobile-first but web-primary (React Native in Phase 4)
