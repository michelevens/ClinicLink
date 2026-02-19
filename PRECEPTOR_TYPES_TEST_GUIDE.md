# Physician vs Non-Physician Preceptor Testing Guide

## Overview
ClinicLink now distinguishes between two types of preceptors:
1. **Physician Preceptors** (MD/DO) - Can access Collaborate module
2. **Non-Physician Preceptors** (NP/PA/RN) - Cannot access Collaborate module

## Test Users

### 1. Physician Preceptor (Dr. James Wilson)
**Login:** `preceptor@cliniclink.health` / `ClinicLink2026!`

**Profile Details:**
- Role: `preceptor`
- Has **both** `preceptor_profile` AND `physician_profile`
- NPI: `1234567890` (verified)
- NPI Taxonomy: `207P00000X` (Emergency Medicine - MD)
- Licensed States: FL, GA, AL
- Specialties: Emergency Medicine, Family Medicine

**Expected Behavior:**
- ✅ **SEES** Collaborate navigation section
- ✅ Can access `/collaborate` routes
- ✅ Can create physician profile
- ✅ Can receive collaboration requests from NPs/PAs
- ✅ Can create supervision agreements
- ✅ Can set up Stripe Connect for billing
- ✅ Can also supervise students for clinical rotations

### 2. Non-Physician Preceptor (Amanda Rodriguez, NP)
**Login:** `np-preceptor@cliniclink.health` / `ClinicLink2026!`

**Profile Details:**
- Role: `preceptor`
- Has **only** `preceptor_profile` (NO physician_profile)
- NPI: `9876543210` (verified)
- NPI Taxonomy: `363LF0000X` (Nurse Practitioner - NOT MD)
- Specialties: Family Practice, Pediatrics
- Years Experience: 8

**Expected Behavior:**
- ❌ **DOES NOT SEE** Collaborate navigation section
- ❌ Cannot access `/collaborate` routes (not shown in nav)
- ❌ Cannot create physician profile (NPI taxonomy check fails)
- ❌ No access to supervision agreements or billing
- ✅ Can supervise students for clinical rotations
- ✅ Can appear in preceptor directory

## Testing Steps

### Step 1: Seed the Database
```bash
cd laravel-backend
php artisan migrate:fresh --seed
```

### Step 2: Test Physician Preceptor
1. Login as `preceptor@cliniclink.health`
2. Check sidebar navigation - you should see "Collaborate" section with:
   - Collaborate (landing)
   - Physician Directory
   - Physician Profile
   - Matches
   - Supervision Agreements
3. Navigate to `/collaborate` - should load successfully
4. API test: `GET /api/auth/me` should return:
   ```json
   {
     "preceptor_profile": { "id": "...", "npi_verified_at": "..." },
     "physician_profile": { "id": "...", "licensed_states": [...] }
   }
   ```

### Step 3: Test Non-Physician Preceptor
1. Login as `np-preceptor@cliniclink.health`
2. Check sidebar navigation - you should **NOT** see "Collaborate" section
3. Navigate to `/collaborate` manually - should show empty/error (no nav link)
4. API test: `GET /api/auth/me` should return:
   ```json
   {
     "preceptor_profile": { "id": "...", "npi_verified_at": "..." },
     "physician_profile": null
   }
   ```

### Step 4: Test Physician Profile Creation Gating
1. Login as `np-preceptor@cliniclink.health`
2. Try to create physician profile: `POST /api/collaborate/profile`
3. Should receive error:
   ```json
   {
     "message": "Your NPI taxonomy does not indicate MD or DO credentials...",
     "taxonomy_mismatch": true
   }
   ```

## Technical Implementation

### Backend Validation
**File:** `PhysicianProfileController.php:54-88`

```php
// Gate 1: Must be a preceptor
if ($user->role !== 'preceptor') return 403;

// Gate 2: NPI must be verified
if (!$preceptorProfile->npi_verified_at) return 422;

// Gate 3: NPI taxonomy must confirm MD/DO
$taxonomies = collect(data_get($preceptorProfile->npi_data, 'taxonomies', []));
$isMdDo = $taxonomies->contains(function ($t) {
    $code = $t['code'] ?? '';
    return str_starts_with($code, '207')  // Allopathic & Osteopathic Physicians
        || str_starts_with($code, '208')  // Physicians
        || $code === '171100000X';        // Military Health Care Provider
});

if (!$isMdDo) {
    return response()->json([
        'message' => 'Your NPI taxonomy does not indicate MD or DO credentials...',
        'taxonomy_mismatch' => true,
    ], 422);
}
```

### Frontend Navigation Logic
**File:** `Sidebar.tsx:129-140`

```typescript
const filteredItems = NAV_ITEMS.filter(item => {
  if (!user) return false
  if (!item.roles.includes(user.role)) return false

  // Collaborate module: preceptors must have physician_profile (MD/DO only)
  if (item.group === 'Collaborate' && user.role === 'preceptor') {
    return !!user.physicianProfile  // ← Only show to Physician Preceptors
  }

  return true
})
```

## NPI Taxonomy Codes Reference

### Physician Codes (✅ Can access Collaborate)
- `207*` - Allopathic & Osteopathic Physicians
- `208*` - Physicians
- `171100000X` - Military Health Care Provider

### Non-Physician Codes (❌ Cannot access Collaborate)
- `363L*` - Nurse Practitioners
- `363A*` - Physician Assistants
- `164W*` - Licensed Practical Nurse
- `367H*` - Anesthesiologist Assistants

## API Endpoints

### Get Current User (with profiles)
```
GET /api/auth/me
Authorization: Bearer {token}
```

### Create Physician Profile (MD/DO only)
```
POST /api/collaborate/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "licensed_states": ["FL", "GA"],
  "specialties": ["Family Medicine"],
  "max_supervisees": 3,
  "supervision_model": "hybrid",
  "malpractice_confirmed": true,
  "bio": "Available for collaborative agreements"
}
```

### Get Physician Directory
```
GET /api/collaborate/physicians
```

## Troubleshooting

### Issue: Non-physician preceptor sees Collaborate nav
**Solution:** Check that `user.physicianProfile` is properly loaded and mapped in AuthContext

### Issue: Physician preceptor doesn't see Collaborate nav
**Solution:**
1. Verify `preceptor_profile.npi_verified_at` is not null
2. Verify `preceptor_profile.npi_data.taxonomies` includes MD/DO code
3. Verify `physician_profile` record exists for user

### Issue: Both preceptor types can create physician profiles
**Solution:** Check backend validation in `PhysicianProfileController::store()` is enforcing taxonomy check

## Success Criteria

✅ Physician Preceptor (Dr. Wilson) sees Collaborate navigation
✅ Non-Physician Preceptor (Amanda Rodriguez) does NOT see Collaborate navigation
✅ Backend properly validates NPI taxonomy codes
✅ Frontend properly filters navigation based on `user.physicianProfile`
✅ API `/auth/me` returns both profile types when present
✅ Database seeder creates both user types correctly

---

**Created:** 2026-02-19
**Commit:** dfded6f - Add Physician vs Non-Physician Preceptor distinction for Collaborate
