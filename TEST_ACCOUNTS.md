# ClinicLink - Test Accounts & Credentials

## Live URLs
- **Frontend:** https://michelevens.github.io/ClinicLink/
- **Backend API:** https://cliniclink-api-production.up.railway.app/api

---

## Demo User Accounts

All demo accounts use the password: `password`

| Role | Email | Password | Name | Description |
|------|-------|----------|------|-------------|
| **Student** | student@cliniclink.com | password | Sarah Chen | Primary student demo account with full profile, credentials, applications, and hour logs |
| **Preceptor** | preceptor@cliniclink.com | password | James Wilson | Clinical preceptor at Mercy General Hospital. Supervises students, reviews hours and evaluations |
| **Site Manager** | site@cliniclink.com | password | Maria Garcia | Manages Mercy General, Sunshine FHC, Children's Wellness, and Coastal Rehab. Creates/manages rotation slots |
| **Coordinator** | coordinator@cliniclink.com | password | Lisa Thompson | University coordinator at University of Miami. Manages student placements and affiliation agreements |
| **Professor** | professor@cliniclink.com | password | Robert Martinez | Faculty member overseeing students in the program |
| **Admin** | admin@cliniclink.com | password | Admin User | Platform administrator with full access to user management and system settings |

---

## Additional Student Accounts

| Email | Password | Name | University | Program |
|-------|----------|------|-----------|---------|
| emily.davis@fiu.edu | password | Emily Davis | Florida International University | MSN - Nurse Practitioner |
| marcus.johnson@nova.edu | password | Marcus Johnson | Nova Southeastern University | PA - Physician Assistant |
| jessica.rodriguez@ucf.edu | password | Jessica Rodriguez | University of Central Florida | DPT - Physical Therapy |
| alex.kim@usf.edu | password | Alex Kim | University of South Florida | MSW - Social Work |
| rachel.thompson@miami.edu | password | Rachel Thompson | University of Miami | BSN - Nursing |

---

## Additional Staff Accounts

| Email | Password | Name | Role | Affiliation |
|-------|----------|------|------|-------------|
| david.park@stpete.com | password | David Park | Site Manager | St. Petersburg Medical Center, Palm Beach Urgent Care |
| angela.brooks@mercy.com | password | Angela Brooks | Preceptor | Mercy General Hospital (ICU) |
| michael.nguyen@coastal.com | password | Michael Nguyen | Preceptor | Coastal Rehabilitation Institute (PT) |

---

## Clinical Sites

| Site | City, State | Specialties | EHR |
|------|------------|-------------|-----|
| Mercy General Hospital | Miami, FL | Emergency Medicine, ICU, Med-Surg, Peds, Oncology | Epic |
| Sunshine Family Health Center | Fort Lauderdale, FL | Family Practice, Behavioral Health, Preventive Care | Athenahealth |
| Children's Wellness Clinic | Orlando, FL | Pediatrics, Developmental Screening, Well-Child | Cerner |
| Coastal Rehabilitation Institute | Tampa, FL | Physical Therapy, OT, Speech Pathology, Neuro Rehab | WebPT |
| Behavioral Health Partners | Jacksonville, FL | Clinical Social Work, Counseling, Substance Abuse | TherapyNotes |
| St. Petersburg Medical Center | St. Petersburg, FL | Emergency Medicine, Surgery, Internal Medicine, OB/GYN | Epic |
| Palm Beach Urgent Care | Palm Beach, FL | Urgent Care, Family Practice, Sports Medicine | eClinicalWorks |

---

## Universities

| University | Programs |
|-----------|----------|
| University of Miami | BSN Nursing, MSN Nurse Practitioner |
| Florida International University | MSN Nurse Practitioner, MSW Social Work |
| Nova Southeastern University | PA Physician Assistant, DNP Nursing Practice |
| University of Central Florida | DPT Physical Therapy |
| University of South Florida | BSN Nursing, MSW Social Work |

---

## API Authentication

### Login
```bash
curl -X POST https://cliniclink-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"student@cliniclink.com","password":"password"}'
```

### Using the token
```bash
curl https://cliniclink-api-production.up.railway.app/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## Database Info (Railway)
- **Project:** ClinicLink
- **Service:** cliniclink-api
- **Database:** PostgreSQL (Railway-managed)
- **Railway Project ID:** 39a183e5-a3e3-4470-acc6-a0671430618b
