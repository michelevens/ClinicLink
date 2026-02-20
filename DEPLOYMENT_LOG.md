# ClinicLink Deployment & Operations Log

## Railway Production Environment
- **API URL:** https://api.cliniclink.health/api
- **Frontend URL:** https://cliniclink.health
- **Railway Direct:** https://cliniclink-api-production.up.railway.app

---

## 2026-02-20: Physician vs Non-Physician Preceptor Feature

### Features Deployed
1. ✅ Physician vs Non-Physician preceptor distinction
2. ✅ Email notifications for hour log submissions (to preceptor + site manager)
3. ✅ In-app notifications for hour logs
4. ✅ Student Pro upgrade CTA banner
5. ✅ PWA service worker registration

### Migrations Run
- `create_preceptor_profiles_table`
- `create_physician_profiles_table`

### Database Seeders Run
- `DatabaseSeeder` - Created base demo accounts
- `EnnHealthPreceptorsSeeder` - Created EnnHealth test accounts

### Test Accounts Created

#### Standard Test Accounts (from DatabaseSeeder)
- **Physician Preceptor:** `preceptor@cliniclink.health` / `ClinicLink2026!`
  - Has both `preceptor_profile` AND `physician_profile`
  - **CAN** access Collaborate module

- **Non-Physician Preceptor:** `np-preceptor@cliniclink.health` / `ClinicLink2026!`
  - Has only `preceptor_profile` (no physician_profile)
  - **CANNOT** access Collaborate module

#### EnnHealth Test Accounts (from EnnHealthPreceptorsSeeder)
- **MD Preceptor:** `contact+md-preceptor@ennhealth.com` / `ClinicLink2026!`
  - Physician with Collaborate access

- **NP Preceptor:** `contact+np-preceptor@ennhealth.com` / `ClinicLink2026!`
  - Nurse Practitioner without Collaborate access

### How to Run Seeders on Railway

**Option 1: Run specific seeder**
```bash
php artisan db:seed --class=EnnHealthPreceptorsSeeder --force
```

**Option 2: Run all seeders**
```bash
php artisan db:seed --force
```

**Option 3: Fresh migration + seed (⚠️ DESTRUCTIVE)**
```bash
php artisan migrate:fresh --seed --force
```

### Deployment Process
1. Push code to GitHub (master branch)
2. Railway auto-deploys (usually takes 2-3 minutes)
3. Migrations run automatically via `railway.json` start command
4. Seeders must be run manually in Railway terminal

### Files Modified
- Backend: `AuthController.php`, `HourLogController.php`, `PhysicianProfileController.php`
- Frontend: `Sidebar.tsx`, `Dashboard.tsx`, `main.tsx`, `vite.config.ts`
- Email: `HourLogSubmittedMail.php`, `hour-log-submitted.blade.php`
- Seeders: `DatabaseSeeder.php`, `EnnHealthPreceptorsSeeder.php`

---

## Operations Checklist

### After Every Deployment
- [ ] Verify API health: https://api.cliniclink.health/api/health
- [ ] Check Railway deployment logs for errors
- [ ] Verify migrations ran successfully
- [ ] Run database seeders if new test accounts needed
- [ ] Test new features on production

### Creating New Test Users
1. Create seeder file in `database/seeders/`
2. Run: `php artisan db:seed --class=YourSeederName --force`
3. Document credentials in this file
4. Commit seeder to git for future use

---

## Common Issues

### "Users not showing in admin panel"
- Users created via tinker won't appear unless script completes successfully
- Check if users exist: `User::whereIn('email', ['email1', 'email2'])->get();`
- Refresh admin page and clear any role filters

### "Railway not auto-deploying"
- Verify auto-deploy is enabled in Railway settings
- Check GitHub webhook is connected
- Manually trigger: Railway Dashboard → Deploy → Redeploy Latest

### "PWA not working"
- Check browser console for service worker registration
- Look for: "ClinicLink is ready to work offline"
- Clear cache and reload

---

**Last Updated:** 2026-02-20 by Claude
