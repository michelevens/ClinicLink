# ClinicLink - Test Accounts & Credentials

## Live URLs
- **Frontend:** https://michelevens.github.io/ClinicLink/
- **Backend API:** https://cliniclink-api-production.up.railway.app/api

---

## Demo User Accounts

All demo accounts use the password: `password`

You can log in with **email**, **username**, or **phone number**.

| Role | Email | Username | Phone | Password | Name |
|------|-------|----------|-------|----------|------|
| **Student** | student@cliniclink.com | sarahchen | (305) 555-0101 | password | Sarah Chen |
| **Preceptor** | preceptor@cliniclink.com | drwilson | (305) 555-0102 | password | James Wilson |
| **Site Manager** | site@cliniclink.com | mariagarcia | (305) 555-0103 | password | Maria Garcia |
| **Coordinator** | coordinator@cliniclink.com | lisathompson | (305) 555-0104 | password | Lisa Thompson |
| **Professor** | professor@cliniclink.com | profmartinez | (305) 555-0105 | password | Robert Martinez |
| **Admin** | admin@cliniclink.com | admin | (305) 555-0100 | password | Admin User |

---

## Additional Student Accounts

| Email | Username | Password | Name | University | Program |
|-------|----------|----------|------|-----------|---------|
| david.kim@fiu.edu | davidkim | password | David Kim | Florida International University | BSN - Nursing |
| aisha.patel@nova.edu | aishapatel | password | Aisha Patel | Nova Southeastern University | MSW - Social Work |
| marcus.johnson@ucf.edu | marcusjohnson | password | Marcus Johnson | University of Central Florida | NP - Pediatric |
| emily.torres@usf.edu | emilytorres | password | Emily Torres | University of South Florida | BSN - Nursing |

---

## Additional Staff Accounts

| Email | Username | Password | Name | Role | Affiliation |
|-------|----------|----------|------|------|-------------|
| david.rodriguez@stpete-medical.com | davidrodriguez | password | David Rodriguez | Site Manager | St. Petersburg Medical Center, Palm Beach Urgent Care |
| angela.brooks@mercy.com | angelabrooks | password | Angela Brooks | Preceptor | Mercy General Hospital (ICU) |
| michael.nguyen@coastal.com | michaelnguyen | password | Michael Nguyen | Preceptor | Coastal Rehabilitation Institute (PT) |

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

### Login (by email, username, or phone)
```bash
# Login with email
curl -X POST https://cliniclink-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"student@cliniclink.com","password":"password"}'

# Login with username
curl -X POST https://cliniclink-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"sarahchen","password":"password"}'

# Login with phone
curl -X POST https://cliniclink-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"(305) 555-0101","password":"password"}'
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
