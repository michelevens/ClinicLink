<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\University;
use App\Models\Program;
use App\Models\RotationSite;
use App\Models\RotationSlot;
use App\Models\StudentProfile;
use App\Models\Credential;
use App\Models\Application;
use App\Models\HourLog;
use App\Models\Evaluation;
use App\Models\Certificate;
use App\Models\AffiliationAgreement;
use App\Models\OnboardingTemplate;
use App\Models\OnboardingItem;
use App\Models\OnboardingTask;
use App\Models\SiteInvite;
use App\Models\UniversityCePolicy;
use App\Models\CeCertificate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // =====================================================================
        // 1. DEMO USERS — Predictable login credentials (all use "password")
        // =====================================================================

        $demoStudent = User::create([
            'first_name' => 'Sarah',
            'last_name' => 'Chen',
            'email' => 'student@cliniclink.com',
            'username' => 'sarahchen',
            'password' => Hash::make('password'),
            'role' => 'student',
            'phone' => '(305) 555-0101',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoPreceptor = User::create([
            'first_name' => 'James',
            'last_name' => 'Wilson',
            'email' => 'preceptor@cliniclink.com',
            'username' => 'drwilson',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'phone' => '(305) 555-0102',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoSiteManager = User::create([
            'first_name' => 'Maria',
            'last_name' => 'Garcia',
            'email' => 'site@cliniclink.com',
            'username' => 'mariagarcia',
            'password' => Hash::make('password'),
            'role' => 'site_manager',
            'phone' => '(305) 555-0103',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoCoordinator = User::create([
            'first_name' => 'Lisa',
            'last_name' => 'Thompson',
            'email' => 'coordinator@cliniclink.com',
            'username' => 'lisathompson',
            'password' => Hash::make('password'),
            'role' => 'coordinator',
            'phone' => '(305) 555-0104',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoProfessor = User::create([
            'first_name' => 'Robert',
            'last_name' => 'Martinez',
            'email' => 'professor@cliniclink.com',
            'username' => 'profmartinez',
            'password' => Hash::make('password'),
            'role' => 'professor',
            'phone' => '(305) 555-0105',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoAdmin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@cliniclink.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '(305) 555-0100',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // =====================================================================
        // 2. ADDITIONAL USERS — diverse roles and statuses
        // =====================================================================

        // Additional students
        $student2 = User::create([
            'first_name' => 'David',
            'last_name' => 'Kim',
            'email' => 'david.kim@fiu.edu',
            'username' => 'davidkim',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $student3 = User::create([
            'first_name' => 'Aisha',
            'last_name' => 'Patel',
            'email' => 'aisha.patel@nova.edu',
            'username' => 'aishapatel',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $student4 = User::create([
            'first_name' => 'Marcus',
            'last_name' => 'Johnson',
            'email' => 'marcus.johnson@ucf.edu',
            'username' => 'marcusjohnson',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $student5 = User::create([
            'first_name' => 'Emily',
            'last_name' => 'Torres',
            'email' => 'emily.torres@usf.edu',
            'username' => 'emilytorres',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // Student who has withdrawn from program (inactive)
        $student6 = User::create([
            'first_name' => 'Tyler',
            'last_name' => 'Brooks',
            'email' => 'tyler.brooks@umiami.edu',
            'username' => 'tylerbrooks',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => false,
            'email_verified' => true,
        ]);

        // Student with completed rotation (for CE certificate scenario)
        $student7 = User::create([
            'first_name' => 'Jessica',
            'last_name' => 'Rivera',
            'email' => 'jessica.rivera@fiu.edu',
            'username' => 'jessicarivera',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // Student who hasn't verified email yet
        $student8 = User::create([
            'first_name' => 'Kenji',
            'last_name' => 'Tanaka',
            'email' => 'kenji.tanaka@nova.edu',
            'username' => 'kenjitanaka',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => false,
        ]);

        // Additional preceptors
        $preceptor2 = User::create([
            'first_name' => 'Angela',
            'last_name' => 'Brooks',
            'email' => 'angela.brooks@mercy.com',
            'username' => 'angelabrooks',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $preceptor3 = User::create([
            'first_name' => 'Michael',
            'last_name' => 'Nguyen',
            'email' => 'michael.nguyen@coastal.com',
            'username' => 'michaelnguyen',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $preceptor4 = User::create([
            'first_name' => 'Patricia',
            'last_name' => 'Okafor',
            'email' => 'patricia.okafor@stpete.com',
            'username' => 'patriciaokafor',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // Inactive preceptor (left practice)
        $preceptor5 = User::create([
            'first_name' => 'Harold',
            'last_name' => 'Fleming',
            'email' => 'harold.fleming@mercy.com',
            'username' => 'haroldfleming',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'is_active' => false,
            'email_verified' => true,
        ]);

        // Additional site managers
        $siteManager2 = User::create([
            'first_name' => 'David',
            'last_name' => 'Rodriguez',
            'email' => 'david.rodriguez@stpete-medical.com',
            'username' => 'davidrodriguez',
            'password' => Hash::make('password'),
            'role' => 'site_manager',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $siteManager3 = User::create([
            'first_name' => 'Sandra',
            'last_name' => 'Lee',
            'email' => 'sandra.lee@behavioral.com',
            'username' => 'sandralee',
            'password' => Hash::make('password'),
            'role' => 'site_manager',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // Additional coordinator
        $coordinator2 = User::create([
            'first_name' => 'Rachel',
            'last_name' => 'Green',
            'email' => 'rachel.green@fiu.edu',
            'username' => 'rachelgreen',
            'password' => Hash::make('password'),
            'role' => 'coordinator',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // Additional professor
        $professor2 = User::create([
            'first_name' => 'Catherine',
            'last_name' => 'Walsh',
            'email' => 'catherine.walsh@nova.edu',
            'username' => 'catherinewalsh',
            'password' => Hash::make('password'),
            'role' => 'professor',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // =====================================================================
        // 3. UNIVERSITIES & PROGRAMS
        // =====================================================================

        $umiami = University::create([
            'name' => 'University of Miami',
            'address' => '1320 S Dixie Hwy',
            'city' => 'Coral Gables',
            'state' => 'FL',
            'zip' => '33146',
            'phone' => '(305) 284-2211',
            'website' => 'https://miami.edu',
            'is_verified' => true,
        ]);

        $fiu = University::create([
            'name' => 'Florida International University',
            'address' => '11200 SW 8th St',
            'city' => 'Miami',
            'state' => 'FL',
            'zip' => '33199',
            'phone' => '(305) 348-2000',
            'website' => 'https://fiu.edu',
            'is_verified' => true,
        ]);

        $nova = University::create([
            'name' => 'Nova Southeastern University',
            'address' => '3301 College Ave',
            'city' => 'Fort Lauderdale',
            'state' => 'FL',
            'zip' => '33314',
            'phone' => '(954) 262-7300',
            'website' => 'https://nova.edu',
            'is_verified' => true,
        ]);

        $ucf = University::create([
            'name' => 'University of Central Florida',
            'address' => '4000 Central Florida Blvd',
            'city' => 'Orlando',
            'state' => 'FL',
            'zip' => '32816',
            'phone' => '(407) 823-2000',
            'website' => 'https://ucf.edu',
            'is_verified' => true,
        ]);

        $usf = University::create([
            'name' => 'University of South Florida',
            'address' => '4202 E Fowler Ave',
            'city' => 'Tampa',
            'state' => 'FL',
            'zip' => '33620',
            'phone' => '(813) 974-2011',
            'website' => 'https://usf.edu',
            'is_verified' => true,
        ]);

        // Unverified university (just registered)
        $barryU = University::create([
            'name' => 'Barry University',
            'address' => '11300 NE 2nd Ave',
            'city' => 'Miami Shores',
            'state' => 'FL',
            'zip' => '33161',
            'phone' => '(305) 899-3000',
            'website' => 'https://barry.edu',
            'is_verified' => false,
        ]);

        // Programs
        $bsnMiami = Program::create(['university_id' => $umiami->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['Medical-Surgical', 'Pediatrics', 'OB/GYN', 'Community Health']]);
        $msnFnpMiami = Program::create(['university_id' => $umiami->id, 'name' => 'Master of Science in Nursing - FNP', 'degree_type' => 'MSN', 'required_hours' => 500, 'specialties' => ['Family Practice', 'Adult Health', 'Geriatrics']]);
        $dnpMiami = Program::create(['university_id' => $umiami->id, 'name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Acute Care', 'Psychiatric Mental Health', 'Leadership']]);

        $bsnFiu = Program::create(['university_id' => $fiu->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['Medical-Surgical', 'Pediatrics', 'Community Health']]);
        $paFiu = Program::create(['university_id' => $fiu->id, 'name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Emergency Medicine', 'Surgery', 'Internal Medicine', 'Pediatrics']]);

        $mswNova = Program::create(['university_id' => $nova->id, 'name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Behavioral Health', 'Substance Abuse']]);
        $dptNova = Program::create(['university_id' => $nova->id, 'name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurological', 'Sports Rehab']]);
        $pharmDNova = Program::create(['university_id' => $nova->id, 'name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Ambulatory Care', 'Hospital Pharmacy']]);

        $npUcf = Program::create(['university_id' => $ucf->id, 'name' => 'Nurse Practitioner - Pediatric', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Pediatrics', 'Adolescent Health', 'Well-Child Care']]);
        $otdUcf = Program::create(['university_id' => $ucf->id, 'name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1000, 'specialties' => ['Pediatric OT', 'Hand Therapy', 'Neuro Rehab']]);

        $bsnUsf = Program::create(['university_id' => $usf->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['ICU/Critical Care', 'Emergency Medicine', 'Medical-Surgical']]);

        $bsnBarry = Program::create(['university_id' => $barryU->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['Medical-Surgical', 'Community Health']]);

        // =====================================================================
        // 4. ROTATION SITES
        // =====================================================================

        $mercyGeneral = RotationSite::create([
            'name' => 'Mercy General Hospital',
            'address' => '2175 Rosaline Ave',
            'city' => 'Miami',
            'state' => 'FL',
            'zip' => '33136',
            'phone' => '(305) 555-0100',
            'website' => 'https://mercygeneral.example.com',
            'description' => 'Level I trauma center with 450 beds. Strong nursing education program with dedicated preceptors across all units. Active in community health initiatives.',
            'specialties' => ['Emergency Medicine', 'ICU/Critical Care', 'Medical-Surgical', 'Pediatrics', 'Oncology'],
            'ehr_system' => 'Epic',
            'photos' => [],
            'manager_id' => $demoSiteManager->id,
            'rating' => 4.8,
            'review_count' => 124,
            'is_verified' => true,
            'is_active' => true,
        ]);

        $sunshineFhc = RotationSite::create([
            'name' => 'Sunshine Family Health Center',
            'address' => '890 Palm Boulevard',
            'city' => 'Fort Lauderdale',
            'state' => 'FL',
            'zip' => '33301',
            'phone' => '(954) 555-0200',
            'description' => 'Community health center serving underserved populations. Primary care, behavioral health, and preventive services. Great for students interested in community health nursing.',
            'specialties' => ['Family Practice', 'Behavioral Health', 'Preventive Care', 'Community Health'],
            'ehr_system' => 'Athenahealth',
            'photos' => [],
            'manager_id' => $demoSiteManager->id,
            'rating' => 4.6,
            'review_count' => 87,
            'is_verified' => true,
            'is_active' => true,
        ]);

        $childrensWellness = RotationSite::create([
            'name' => 'Children\'s Wellness Clinic',
            'address' => '445 Pediatric Way',
            'city' => 'Orlando',
            'state' => 'FL',
            'zip' => '32801',
            'phone' => '(407) 555-0300',
            'description' => 'Specialized pediatric outpatient clinic with comprehensive well-child and developmental screening services. Excellent preceptor-to-student ratio.',
            'specialties' => ['Pediatrics', 'Developmental Screening', 'Well-Child Care', 'Adolescent Health'],
            'ehr_system' => 'Cerner',
            'photos' => [],
            'manager_id' => $demoSiteManager->id,
            'rating' => 4.9,
            'review_count' => 56,
            'is_verified' => true,
            'is_active' => true,
        ]);

        $coastalRehab = RotationSite::create([
            'name' => 'Coastal Rehabilitation Institute',
            'address' => '1200 Recovery Drive',
            'city' => 'Tampa',
            'state' => 'FL',
            'zip' => '33602',
            'phone' => '(813) 555-0400',
            'description' => 'Comprehensive rehabilitation facility specializing in physical therapy, occupational therapy, and speech pathology. State-of-the-art equipment and innovative treatment approaches.',
            'specialties' => ['Physical Therapy', 'Occupational Therapy', 'Speech Pathology', 'Neurological Rehab'],
            'ehr_system' => 'WebPT',
            'photos' => [],
            'manager_id' => $demoSiteManager->id,
            'rating' => 4.7,
            'review_count' => 43,
            'is_verified' => true,
            'is_active' => true,
        ]);

        $behavioralHealth = RotationSite::create([
            'name' => 'Behavioral Health Partners',
            'address' => '678 Mindful Lane',
            'city' => 'Jacksonville',
            'state' => 'FL',
            'zip' => '32202',
            'phone' => '(904) 555-0500',
            'description' => 'Outpatient behavioral health practice offering individual, group, and family therapy. Ideal for social work and counseling students. Diverse client population.',
            'specialties' => ['Clinical Social Work', 'Counseling', 'Substance Abuse', 'Family Therapy', 'CBT'],
            'ehr_system' => 'TherapyNotes',
            'photos' => [],
            'manager_id' => $siteManager3->id,
            'rating' => 4.5,
            'review_count' => 31,
            'is_verified' => false,
            'is_active' => true,
        ]);

        $stPeteMedical = RotationSite::create([
            'name' => 'St. Petersburg Medical Center',
            'address' => '2000 Bayshore Blvd',
            'city' => 'St. Petersburg',
            'state' => 'FL',
            'zip' => '33701',
            'phone' => '(727) 555-0600',
            'description' => 'Full-service 320-bed medical center with Level II trauma. Strong academic partnerships and residency programs across specialties.',
            'specialties' => ['Emergency Medicine', 'Surgery', 'Internal Medicine', 'OB/GYN', 'Psychiatry'],
            'ehr_system' => 'Epic',
            'photos' => [],
            'manager_id' => $siteManager2->id,
            'rating' => 4.6,
            'review_count' => 98,
            'is_verified' => true,
            'is_active' => true,
        ]);

        $palmBeachUrgent = RotationSite::create([
            'name' => 'Palm Beach Urgent Care',
            'address' => '3400 Royal Palm Way',
            'city' => 'Palm Beach',
            'state' => 'FL',
            'zip' => '33480',
            'phone' => '(561) 555-0700',
            'description' => 'High-volume urgent care with walk-in clinic. Excellent for fast-paced assessment skills. 60+ patients per day.',
            'specialties' => ['Urgent Care', 'Family Practice', 'Sports Medicine', 'Wound Care'],
            'ehr_system' => 'eClinicalWorks',
            'photos' => [],
            'manager_id' => $siteManager2->id,
            'rating' => 4.3,
            'review_count' => 67,
            'is_verified' => true,
            'is_active' => true,
        ]);

        // Inactive site (closed for renovation)
        $gainesvilleClinic = RotationSite::create([
            'name' => 'Gainesville Community Clinic',
            'address' => '1500 University Ave',
            'city' => 'Gainesville',
            'state' => 'FL',
            'zip' => '32601',
            'phone' => '(352) 555-0800',
            'description' => 'Community clinic currently closed for renovation. Expected to reopen Fall 2026.',
            'specialties' => ['Family Practice', 'Community Health', 'Preventive Care'],
            'ehr_system' => 'NextGen',
            'photos' => [],
            'manager_id' => $siteManager2->id,
            'rating' => 4.1,
            'review_count' => 22,
            'is_verified' => true,
            'is_active' => false,
        ]);

        // =====================================================================
        // 5. ROTATION SLOTS — open, filled, closed statuses + free/paid
        // =====================================================================

        $slotED = RotationSlot::create([
            'site_id' => $mercyGeneral->id,
            'specialty' => 'Emergency Medicine',
            'title' => 'Emergency Department - NP Clinical Rotation',
            'description' => 'Fast-paced ED experience with direct patient assessment, triage, and treatment planning. Students work alongside attending physicians and NPs.',
            'start_date' => '2026-03-01',
            'end_date' => '2026-05-31',
            'capacity' => 4,
            'filled' => 2,
            'requirements' => ['BLS/CPR', 'Background Check', 'Drug Screen', 'Flu Vaccine', 'Liability Insurance'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'open',
            'preceptor_id' => $demoPreceptor->id,
            'shift_schedule' => '3x12hr shifts/week',
        ]);

        $slotICU = RotationSlot::create([
            'site_id' => $mercyGeneral->id,
            'specialty' => 'ICU/Critical Care',
            'title' => 'Critical Care Unit - BSN Clinical',
            'description' => 'Intensive care experience including ventilator management, hemodynamic monitoring, and complex patient care. 1:1 preceptor model.',
            'start_date' => '2026-03-15',
            'end_date' => '2026-06-15',
            'capacity' => 2,
            'filled' => 1,
            'requirements' => ['BLS/CPR', 'ACLS', 'Background Check', 'Drug Screen', 'Liability Insurance'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'open',
            'preceptor_id' => $preceptor2->id,
            'shift_schedule' => '2x12hr shifts/week',
        ]);

        $slotFNP = RotationSlot::create([
            'site_id' => $sunshineFhc->id,
            'specialty' => 'Family Practice',
            'title' => 'Family NP Primary Care Rotation',
            'description' => 'Full-scope primary care experience in a community health setting. Manage your own patient panel under supervision. Spanish-speaking a plus.',
            'start_date' => '2026-04-01',
            'end_date' => '2026-06-30',
            'capacity' => 3,
            'filled' => 1,
            'requirements' => ['BLS/CPR', 'Background Check', 'Immunizations', 'Liability Insurance'],
            'cost' => 500,
            'cost_type' => 'paid',
            'status' => 'open',
            'preceptor_id' => $demoPreceptor->id,
            'shift_schedule' => '4x8hr shifts/week',
        ]);

        $slotPeds = RotationSlot::create([
            'site_id' => $childrensWellness->id,
            'specialty' => 'Pediatrics',
            'title' => 'Pediatric NP Clinical - Spring 2026',
            'description' => 'Well-child visits, developmental assessments, immunization administration, and common childhood illness management. Amazing learning environment.',
            'start_date' => '2026-03-01',
            'end_date' => '2026-05-15',
            'capacity' => 3,
            'filled' => 3,
            'requirements' => ['BLS/CPR', 'Background Check', 'Drug Screen', 'Immunizations'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'filled',
            'shift_schedule' => '3x8hr shifts/week',
        ]);

        $slotPT = RotationSlot::create([
            'site_id' => $coastalRehab->id,
            'specialty' => 'Physical Therapy',
            'title' => 'Outpatient PT Clinical Rotation',
            'description' => 'Diverse caseload including orthopedic, neurological, and sports rehabilitation. Evidence-based practice emphasis with journal clubs.',
            'start_date' => '2026-04-15',
            'end_date' => '2026-07-15',
            'capacity' => 2,
            'filled' => 0,
            'requirements' => ['BLS/CPR', 'Background Check', 'Liability Insurance', 'HIPAA Training'],
            'cost' => 750,
            'cost_type' => 'paid',
            'status' => 'open',
            'preceptor_id' => $preceptor3->id,
            'shift_schedule' => '5x8hr shifts/week',
        ]);

        $slotMSW = RotationSlot::create([
            'site_id' => $behavioralHealth->id,
            'specialty' => 'Clinical Social Work',
            'title' => 'MSW Field Practicum - Behavioral Health',
            'description' => 'Individual and group therapy experience with adults and adolescents. Supervision provided by LCSW. Diverse client base.',
            'start_date' => '2026-03-01',
            'end_date' => '2026-08-31',
            'capacity' => 2,
            'filled' => 1,
            'requirements' => ['Background Check', 'Liability Insurance', 'HIPAA Training'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'open',
            'shift_schedule' => '3x8hr shifts/week',
        ]);

        $slotSurgery = RotationSlot::create([
            'site_id' => $stPeteMedical->id,
            'specialty' => 'Surgery',
            'title' => 'General Surgery PA Rotation',
            'description' => 'Scrub in on surgeries, pre-op assessments, post-op rounding, wound management. Work directly with attending surgeons.',
            'start_date' => '2026-03-15',
            'end_date' => '2026-06-15',
            'capacity' => 4,
            'filled' => 3,
            'requirements' => ['BLS/CPR', 'ACLS', 'Background Check', 'Drug Screen', 'Liability Insurance', 'Surgical Clearance'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'open',
            'preceptor_id' => $preceptor4->id,
            'shift_schedule' => '4x10hr shifts/week',
        ]);

        $slotUrgent = RotationSlot::create([
            'site_id' => $palmBeachUrgent->id,
            'specialty' => 'Urgent Care',
            'title' => 'Urgent Care NP Clinical',
            'description' => 'High-volume urgent care experience. Suturing, splinting, x-ray interpretation, acute illness management. 60+ patient encounters weekly.',
            'start_date' => '2026-04-01',
            'end_date' => '2026-06-30',
            'capacity' => 3,
            'filled' => 1,
            'requirements' => ['BLS/CPR', 'Background Check', 'Drug Screen', 'Liability Insurance'],
            'cost' => 250,
            'cost_type' => 'paid',
            'status' => 'open',
            'shift_schedule' => '3x12hr shifts/week',
        ]);

        // Closed slot (past rotation)
        $slotOncology = RotationSlot::create([
            'site_id' => $mercyGeneral->id,
            'specialty' => 'Oncology',
            'title' => 'Oncology Nursing Clinical - Fall 2025',
            'description' => 'Comprehensive oncology nursing experience. Chemotherapy administration, symptom management, end-of-life care.',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-15',
            'capacity' => 2,
            'filled' => 2,
            'requirements' => ['BLS/CPR', 'Background Check', 'Drug Screen', 'Liability Insurance'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'closed',
            'preceptor_id' => $preceptor2->id,
            'shift_schedule' => '3x8hr shifts/week',
        ]);

        // Slot for completed rotation scenario
        $slotInternalMed = RotationSlot::create([
            'site_id' => $stPeteMedical->id,
            'specialty' => 'Internal Medicine',
            'title' => 'Internal Medicine PA Rotation - Winter 2026',
            'description' => 'Inpatient and outpatient internal medicine. History and physical, differential diagnosis, treatment planning.',
            'start_date' => '2026-01-06',
            'end_date' => '2026-02-28',
            'capacity' => 2,
            'filled' => 2,
            'requirements' => ['BLS/CPR', 'Background Check', 'Drug Screen', 'Liability Insurance'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'closed',
            'preceptor_id' => $preceptor4->id,
            'shift_schedule' => '5x8hr shifts/week',
        ]);

        // High-cost premium slot
        $slotPsych = RotationSlot::create([
            'site_id' => $stPeteMedical->id,
            'specialty' => 'Psychiatry',
            'title' => 'Psychiatric Mental Health NP Rotation',
            'description' => 'Inpatient and outpatient psychiatry. Medication management, psychotherapy observation, crisis intervention.',
            'start_date' => '2026-05-01',
            'end_date' => '2026-07-31',
            'capacity' => 4,
            'filled' => 2,
            'requirements' => ['BLS/CPR', 'Background Check', 'Drug Screen', 'Liability Insurance', 'HIPAA Training'],
            'cost' => 1200,
            'cost_type' => 'paid',
            'status' => 'open',
            'preceptor_id' => $preceptor4->id,
            'shift_schedule' => '4x8hr shifts/week',
        ]);

        // =====================================================================
        // 6. STUDENT PROFILES
        // =====================================================================

        StudentProfile::create([
            'user_id' => $demoStudent->id,
            'university_id' => $umiami->id,
            'program_id' => $msnFnpMiami->id,
            'graduation_date' => '2027-05-15',
            'gpa' => 3.85,
            'clinical_interests' => ['Emergency Medicine', 'Family Practice', 'Urgent Care'],
            'hours_completed' => 22,
            'hours_required' => 500,
            'bio' => 'Second-year FNP student passionate about emergency and primary care. Bilingual (English/Mandarin). CPR instructor certified.',
        ]);

        StudentProfile::create([
            'user_id' => $student2->id,
            'university_id' => $fiu->id,
            'program_id' => $bsnFiu->id,
            'graduation_date' => '2027-12-15',
            'gpa' => 3.62,
            'clinical_interests' => ['ICU/Critical Care', 'Medical-Surgical', 'Emergency Medicine'],
            'hours_completed' => 92,
            'hours_required' => 720,
            'bio' => 'BSN student with previous CNA experience. Interested in critical care nursing.',
        ]);

        StudentProfile::create([
            'user_id' => $student3->id,
            'university_id' => $nova->id,
            'program_id' => $mswNova->id,
            'graduation_date' => '2027-05-15',
            'gpa' => 3.91,
            'clinical_interests' => ['Clinical Social Work', 'Behavioral Health', 'Substance Abuse'],
            'hours_completed' => 340,
            'hours_required' => 900,
            'bio' => 'MSW student specializing in clinical social work with focus on trauma-informed care.',
        ]);

        StudentProfile::create([
            'user_id' => $student4->id,
            'university_id' => $ucf->id,
            'program_id' => $npUcf->id,
            'graduation_date' => '2027-08-15',
            'gpa' => 3.78,
            'clinical_interests' => ['Pediatrics', 'Adolescent Health', 'Well-Child Care'],
            'hours_completed' => 180,
            'hours_required' => 600,
            'bio' => 'Pediatric NP student. Former school nurse. Passionate about child health advocacy.',
        ]);

        StudentProfile::create([
            'user_id' => $student5->id,
            'university_id' => $usf->id,
            'program_id' => $bsnUsf->id,
            'graduation_date' => '2026-12-15',
            'gpa' => 3.45,
            'clinical_interests' => ['Emergency Medicine', 'ICU/Critical Care'],
            'hours_completed' => 420,
            'hours_required' => 720,
            'bio' => 'Senior BSN student seeking final clinical rotation in critical care settings.',
        ]);

        // Withdrawn student profile
        StudentProfile::create([
            'user_id' => $student6->id,
            'university_id' => $umiami->id,
            'program_id' => $bsnMiami->id,
            'graduation_date' => '2027-05-15',
            'gpa' => 2.85,
            'clinical_interests' => ['Medical-Surgical'],
            'hours_completed' => 45,
            'hours_required' => 720,
            'bio' => 'BSN student. Currently on leave of absence.',
        ]);

        // Completed rotation student
        StudentProfile::create([
            'user_id' => $student7->id,
            'university_id' => $fiu->id,
            'program_id' => $paFiu->id,
            'graduation_date' => '2027-08-15',
            'gpa' => 3.72,
            'clinical_interests' => ['Internal Medicine', 'Surgery', 'Emergency Medicine'],
            'hours_completed' => 650,
            'hours_required' => 2000,
            'bio' => 'PA student with prior EMT experience. Recently completed internal medicine rotation.',
        ]);

        // Unverified email student
        StudentProfile::create([
            'user_id' => $student8->id,
            'university_id' => $nova->id,
            'program_id' => $dptNova->id,
            'graduation_date' => '2028-05-15',
            'gpa' => 3.55,
            'clinical_interests' => ['Orthopedic', 'Sports Rehab'],
            'hours_completed' => 0,
            'hours_required' => 1500,
            'bio' => 'First-year DPT student. Former personal trainer.',
        ]);

        // Coordinator student profile (coordinator at UMiami)
        StudentProfile::create([
            'user_id' => $demoCoordinator->id,
            'university_id' => $umiami->id,
            'program_id' => $msnFnpMiami->id,
        ]);

        // Coordinator2 at FIU
        StudentProfile::create([
            'user_id' => $coordinator2->id,
            'university_id' => $fiu->id,
            'program_id' => $paFiu->id,
        ]);

        // Professor profiles
        StudentProfile::create([
            'user_id' => $demoProfessor->id,
            'university_id' => $umiami->id,
            'program_id' => $dnpMiami->id,
        ]);

        StudentProfile::create([
            'user_id' => $professor2->id,
            'university_id' => $nova->id,
            'program_id' => $mswNova->id,
        ]);

        // =====================================================================
        // 7. CREDENTIALS — valid, expiring_soon, expired, pending
        // =====================================================================

        // Demo student — all valid (complete set)
        Credential::create(['user_id' => $demoStudent->id, 'type' => 'cpr', 'name' => 'BLS/CPR - American Heart Association', 'expiration_date' => '2027-06-15', 'status' => 'valid']);
        Credential::create(['user_id' => $demoStudent->id, 'type' => 'background_check', 'name' => 'Level 2 Background Check - FDLE', 'expiration_date' => '2027-01-20', 'status' => 'valid']);
        Credential::create(['user_id' => $demoStudent->id, 'type' => 'immunization', 'name' => 'Hepatitis B Series + Titer', 'expiration_date' => null, 'status' => 'valid']);
        Credential::create(['user_id' => $demoStudent->id, 'type' => 'drug_screen', 'name' => '10-Panel Drug Screen', 'expiration_date' => '2026-08-15', 'status' => 'valid']);
        Credential::create(['user_id' => $demoStudent->id, 'type' => 'liability_insurance', 'name' => 'Nursing Students Professional Liability', 'expiration_date' => '2027-01-01', 'status' => 'valid']);
        Credential::create(['user_id' => $demoStudent->id, 'type' => 'hipaa', 'name' => 'HIPAA Training Certificate', 'expiration_date' => '2027-02-28', 'status' => 'valid']);

        // Student 2 — one expiring soon, one expired
        Credential::create(['user_id' => $student2->id, 'type' => 'cpr', 'name' => 'BLS/CPR - American Heart Association', 'expiration_date' => '2026-03-01', 'status' => 'expiring_soon']);
        Credential::create(['user_id' => $student2->id, 'type' => 'background_check', 'name' => 'Level 2 Background Check', 'expiration_date' => '2026-12-15', 'status' => 'valid']);
        Credential::create(['user_id' => $student2->id, 'type' => 'drug_screen', 'name' => '10-Panel Drug Screen', 'expiration_date' => '2025-11-01', 'status' => 'expired']);
        Credential::create(['user_id' => $student2->id, 'type' => 'liability_insurance', 'name' => 'Student Professional Liability', 'expiration_date' => '2027-01-01', 'status' => 'valid']);

        // Student 3 — all valid
        Credential::create(['user_id' => $student3->id, 'type' => 'background_check', 'name' => 'Level 2 Background Check - FDLE', 'expiration_date' => '2027-03-15', 'status' => 'valid']);
        Credential::create(['user_id' => $student3->id, 'type' => 'liability_insurance', 'name' => 'Social Work Liability Insurance', 'expiration_date' => '2027-01-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student3->id, 'type' => 'hipaa', 'name' => 'HIPAA Training Certificate', 'expiration_date' => '2027-02-28', 'status' => 'valid']);

        // Student 4 — complete set, one pending
        Credential::create(['user_id' => $student4->id, 'type' => 'cpr', 'name' => 'BLS/CPR - American Heart Association', 'expiration_date' => '2027-09-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student4->id, 'type' => 'background_check', 'name' => 'Level 2 Background Check', 'expiration_date' => '2027-06-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student4->id, 'type' => 'immunization', 'name' => 'Flu Vaccine 2025-2026', 'expiration_date' => '2026-09-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student4->id, 'type' => 'drug_screen', 'name' => '10-Panel Drug Screen', 'expiration_date' => null, 'status' => 'pending']);
        Credential::create(['user_id' => $student4->id, 'type' => 'liability_insurance', 'name' => 'NP Student Liability Insurance', 'expiration_date' => '2027-01-01', 'status' => 'valid']);

        // Student 5 — mix of statuses
        Credential::create(['user_id' => $student5->id, 'type' => 'cpr', 'name' => 'BLS/CPR - American Heart Association', 'expiration_date' => '2026-04-15', 'status' => 'expiring_soon']);
        Credential::create(['user_id' => $student5->id, 'type' => 'background_check', 'name' => 'Level 2 Background Check', 'expiration_date' => '2027-01-15', 'status' => 'valid']);
        Credential::create(['user_id' => $student5->id, 'type' => 'immunization', 'name' => 'TB Test - QuantiFERON Gold', 'expiration_date' => '2027-01-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student5->id, 'type' => 'liability_insurance', 'name' => 'BSN Student Liability', 'expiration_date' => '2026-06-01', 'status' => 'expiring_soon']);

        // Student 7 (completed rotation) — all valid
        Credential::create(['user_id' => $student7->id, 'type' => 'cpr', 'name' => 'BLS/CPR + ACLS', 'expiration_date' => '2027-08-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student7->id, 'type' => 'background_check', 'name' => 'Level 2 Background Check', 'expiration_date' => '2027-05-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student7->id, 'type' => 'drug_screen', 'name' => '10-Panel Drug Screen', 'expiration_date' => '2026-07-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student7->id, 'type' => 'liability_insurance', 'name' => 'PA Student Liability', 'expiration_date' => '2027-01-01', 'status' => 'valid']);
        Credential::create(['user_id' => $student7->id, 'type' => 'hipaa', 'name' => 'HIPAA Training', 'expiration_date' => '2027-02-01', 'status' => 'valid']);

        // =====================================================================
        // 8. APPLICATIONS — all statuses: pending, accepted, declined,
        //    waitlisted, withdrawn, completed
        // =====================================================================

        // Demo student: pending
        $appSarahED = Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotED->id,
            'status' => 'pending',
            'cover_letter' => 'I am highly interested in emergency medicine and have completed my ACLS certification. My previous clinical experience in urgent care has prepared me well for the fast-paced ED environment. I am bilingual in English and Mandarin, which would be an asset when caring for diverse patient populations.',
            'submitted_at' => '2026-02-01 09:30:00',
        ]);

        // Demo student: accepted (active rotation)
        $appSarahFNP = Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'status' => 'accepted',
            'cover_letter' => 'My passion for community health nursing drives my interest in your program. I believe Sunshine Family Health Center\'s mission aligns perfectly with my career goals of serving underserved populations.',
            'submitted_at' => '2026-01-28 14:00:00',
            'reviewed_at' => '2026-02-03 10:00:00',
            'reviewed_by' => $demoSiteManager->id,
            'notes' => 'Strong candidate. Bilingual is a plus for our patient population.',
        ]);

        // Demo student: waitlisted
        $appSarahPT = Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotPT->id,
            'status' => 'waitlisted',
            'cover_letter' => 'As an FNP student with a keen interest in rehabilitation medicine, I would value the opportunity to gain exposure to physical therapy approaches.',
            'submitted_at' => '2026-02-06 11:00:00',
            'reviewed_at' => '2026-02-07 09:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        // Student 2: accepted
        $appDavidICU = Application::create([
            'student_id' => $student2->id,
            'slot_id' => $slotICU->id,
            'status' => 'accepted',
            'cover_letter' => 'With my CNA background and strong academic performance, I am well-prepared for the critical care environment.',
            'submitted_at' => '2026-01-25 10:00:00',
            'reviewed_at' => '2026-01-30 14:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        // Student 2: pending
        Application::create([
            'student_id' => $student2->id,
            'slot_id' => $slotED->id,
            'status' => 'pending',
            'cover_letter' => 'I would love the opportunity to rotate through the ED to complement my ICU experience.',
            'submitted_at' => '2026-02-05 08:00:00',
        ]);

        // Student 2: declined (by site)
        Application::create([
            'student_id' => $student2->id,
            'slot_id' => $slotSurgery->id,
            'status' => 'declined',
            'cover_letter' => 'I am interested in surgical experience as a BSN student to broaden my clinical knowledge.',
            'submitted_at' => '2026-01-20 09:00:00',
            'reviewed_at' => '2026-01-22 16:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Position requires PA students. BSN students not eligible for this surgical rotation.',
        ]);

        // Student 3: accepted
        $appAishaMSW = Application::create([
            'student_id' => $student3->id,
            'slot_id' => $slotMSW->id,
            'status' => 'accepted',
            'cover_letter' => 'My research focus on trauma-informed care and experience with diverse populations makes this practicum an ideal fit.',
            'submitted_at' => '2026-01-20 11:00:00',
            'reviewed_at' => '2026-01-25 16:00:00',
            'reviewed_by' => $siteManager3->id,
        ]);

        // Student 4: accepted
        $appMarcusPeds = Application::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPeds->id,
            'status' => 'accepted',
            'cover_letter' => 'As a former school nurse with 5 years of experience, I bring unique perspective to pediatric care.',
            'submitted_at' => '2026-01-15 09:00:00',
            'reviewed_at' => '2026-01-18 10:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        // Student 5: pending
        Application::create([
            'student_id' => $student5->id,
            'slot_id' => $slotED->id,
            'status' => 'pending',
            'cover_letter' => 'Senior BSN student seeking my final clinical placement. I have strong assessment skills and thrive in high-acuity settings.',
            'submitted_at' => '2026-02-07 14:00:00',
        ]);

        // Student 5: accepted
        $appEmilyUrgent = Application::create([
            'student_id' => $student5->id,
            'slot_id' => $slotUrgent->id,
            'status' => 'accepted',
            'cover_letter' => 'The urgent care setting is perfect for building my rapid assessment and triage skills before graduation.',
            'submitted_at' => '2026-02-01 10:00:00',
            'reviewed_at' => '2026-02-04 11:00:00',
            'reviewed_by' => $siteManager2->id,
        ]);

        // Student 6 (Tyler): withdrawn application
        Application::create([
            'student_id' => $student6->id,
            'slot_id' => $slotED->id,
            'status' => 'withdrawn',
            'cover_letter' => 'I am interested in emergency medicine and hope to gain hands-on experience in a trauma center.',
            'submitted_at' => '2026-01-10 11:00:00',
            'notes' => 'Student withdrew due to personal leave of absence from program.',
        ]);

        // Student 6 (Tyler): another withdrawn
        Application::create([
            'student_id' => $student6->id,
            'slot_id' => $slotFNP->id,
            'status' => 'withdrawn',
            'cover_letter' => 'Primary care has always been my interest area.',
            'submitted_at' => '2026-01-10 11:30:00',
            'notes' => 'Withdrawn along with all applications due to leave of absence.',
        ]);

        // Student 7 (Jessica): COMPLETED rotation — full lifecycle
        $appJessicaIM = Application::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'status' => 'completed',
            'cover_letter' => 'My EMT background provides a strong foundation for internal medicine. I am eager to develop differential diagnosis skills in an inpatient setting.',
            'submitted_at' => '2025-12-01 09:00:00',
            'reviewed_at' => '2025-12-05 10:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Excellent candidate. EMT experience is a strong asset. Completed rotation with distinction.',
        ]);

        // Student 7: accepted at surgery (current rotation)
        $appJessicaSurgery = Application::create([
            'student_id' => $student7->id,
            'slot_id' => $slotSurgery->id,
            'status' => 'accepted',
            'cover_letter' => 'Building on my completed internal medicine rotation, I want to expand my surgical skills as a PA student.',
            'submitted_at' => '2026-02-15 09:00:00',
            'reviewed_at' => '2026-02-18 14:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Completed IM rotation with distinction. Strong candidate for surgery.',
        ]);

        // Student 7: declined at psychiatry
        Application::create([
            'student_id' => $student7->id,
            'slot_id' => $slotPsych->id,
            'status' => 'declined',
            'cover_letter' => 'I am interested in psychiatry to complement my PA training.',
            'submitted_at' => '2026-02-10 10:00:00',
            'reviewed_at' => '2026-02-12 15:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'All psych slots reserved for PMHNP students this cycle.',
        ]);

        // --- Additional students for Patricia (preceptor4) to test varied statuses ---

        // Sarah Chen: accepted at Surgery (current rotation under Patricia)
        $appSarahSurgery = Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotSurgery->id,
            'status' => 'accepted',
            'cover_letter' => 'I am an FNP student seeking surgical exposure to complement my primary care training. My bilingual skills could benefit the diverse patient population at St. Petersburg Medical Center.',
            'submitted_at' => '2026-02-10 09:00:00',
            'reviewed_at' => '2026-02-12 14:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Bilingual FNP student. Accepted for surgical observation and perioperative care.',
        ]);

        // Aisha Patel: pending at Surgery (awaiting review)
        Application::create([
            'student_id' => $student3->id,
            'slot_id' => $slotSurgery->id,
            'status' => 'pending',
            'cover_letter' => 'My MSW background has given me strong communication skills for pre-op counseling and post-op patient support.',
            'submitted_at' => '2026-02-14 11:00:00',
        ]);

        // Marcus Johnson: accepted at Psychiatry (current rotation under Patricia)
        $appMarcusPsych = Application::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPsych->id,
            'status' => 'accepted',
            'cover_letter' => 'My pediatric NP background gives me unique insight into child and adolescent psychiatry. I am excited about the medication management component.',
            'submitted_at' => '2026-02-08 10:00:00',
            'reviewed_at' => '2026-02-10 16:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Good fit for child/adolescent psych caseload.',
        ]);

        // David Kim: pending at Psychiatry
        Application::create([
            'student_id' => $student2->id,
            'slot_id' => $slotPsych->id,
            'status' => 'pending',
            'cover_letter' => 'My ICU experience has exposed me to delirium and acute behavioral crises. I want to deepen my psychiatric nursing knowledge.',
            'submitted_at' => '2026-02-15 14:00:00',
        ]);

        // Emily Torres: waitlisted at Psychiatry
        Application::create([
            'student_id' => $student5->id,
            'slot_id' => $slotPsych->id,
            'status' => 'waitlisted',
            'cover_letter' => 'I am a senior BSN student interested in psychiatric nursing. My ICU experience has exposed me to delirium management and acute behavioral emergencies.',
            'submitted_at' => '2026-02-09 15:00:00',
            'reviewed_at' => '2026-02-11 10:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Qualified candidate but slots currently full. Waitlisted for next opening.',
        ]);

        // Emily Torres: completed at Internal Medicine (past rotation)
        $appEmilyIM = Application::create([
            'student_id' => $student5->id,
            'slot_id' => $slotInternalMed->id,
            'status' => 'completed',
            'cover_letter' => 'My BSN training and strong assessment skills make me a good fit for internal medicine.',
            'submitted_at' => '2025-12-05 10:00:00',
            'reviewed_at' => '2025-12-08 14:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Completed rotation satisfactorily.',
        ]);

        // Kenji Tanaka: declined at Surgery (email not verified - can't start)
        Application::create([
            'student_id' => $student8->id,
            'slot_id' => $slotSurgery->id,
            'status' => 'declined',
            'cover_letter' => 'I am a DPT student seeking surgical observation to understand post-operative rehabilitation better.',
            'submitted_at' => '2026-02-06 08:00:00',
            'reviewed_at' => '2026-02-07 11:00:00',
            'reviewed_by' => $siteManager2->id,
            'notes' => 'Student email not verified. DPT program not eligible for this surgical rotation.',
        ]);

        // =====================================================================
        // 9. HOUR LOGS — pending, approved, rejected across categories
        // =====================================================================

        // Demo student at FNP rotation — mix of statuses
        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'date' => '2026-02-03',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Patient assessments (6 patients), vitals, medication administration, patient education on diabetes management',
            'status' => 'approved',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-04 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'date' => '2026-02-04',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Wound care for 3 patients, patient education on medication compliance, discharge planning for 2 patients',
            'status' => 'approved',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-05 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'date' => '2026-02-05',
            'hours_worked' => 6,
            'category' => 'indirect_care',
            'description' => 'Chart reviews, care plan documentation, interdisciplinary team huddle, quality improvement meeting',
            'status' => 'approved',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-06 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'date' => '2026-02-06',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Primary care clinic - 12 patient encounters including 3 well-child visits, 4 chronic disease follow-ups, 5 acute visits',
            'status' => 'pending',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'date' => '2026-02-07',
            'hours_worked' => 4,
            'category' => 'simulation',
            'description' => 'OSCE practice - respiratory assessment, cardiac auscultation, abdominal exam technique',
            'status' => 'pending',
        ]);

        // Rejected hour log (demo student)
        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'date' => '2026-02-02',
            'hours_worked' => 12,
            'category' => 'direct_care',
            'description' => 'Full day at clinic',
            'status' => 'rejected',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-03 08:00:00',
            'rejection_reason' => 'Hours exceed maximum allowed per shift (10 hours). Please correct and resubmit with accurate hours.',
        ]);

        // Student 2 at ICU
        HourLog::create([
            'student_id' => $student2->id,
            'slot_id' => $slotICU->id,
            'date' => '2026-02-03',
            'hours_worked' => 12,
            'category' => 'direct_care',
            'description' => 'ICU orientation, ventilator management basics, hemodynamic monitoring, assisted with central line placement',
            'status' => 'approved',
            'approved_by' => $preceptor2->id,
            'approved_at' => '2026-02-04 08:00:00',
        ]);

        HourLog::create([
            'student_id' => $student2->id,
            'slot_id' => $slotICU->id,
            'date' => '2026-02-05',
            'hours_worked' => 12,
            'category' => 'direct_care',
            'description' => 'Managed 2 ICU patients with preceptor. Arterial line monitoring, ventilator weaning protocol, medication titration.',
            'status' => 'approved',
            'approved_by' => $preceptor2->id,
            'approved_at' => '2026-02-06 08:00:00',
        ]);

        HourLog::create([
            'student_id' => $student2->id,
            'slot_id' => $slotICU->id,
            'date' => '2026-02-07',
            'hours_worked' => 4,
            'category' => 'observation',
            'description' => 'Observed CRRT setup and management. Attended ICU multidisciplinary rounds.',
            'status' => 'pending',
        ]);

        // Student 3 at MSW
        HourLog::create([
            'student_id' => $student3->id,
            'slot_id' => $slotMSW->id,
            'date' => '2026-02-03',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Individual therapy sessions (3), group therapy co-facilitation, intake assessment',
            'status' => 'approved',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-04 10:00:00',
        ]);

        HourLog::create([
            'student_id' => $student3->id,
            'slot_id' => $slotMSW->id,
            'date' => '2026-02-05',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Family therapy session, crisis intervention for adolescent client, treatment plan review with supervisor',
            'status' => 'approved',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-06 10:00:00',
        ]);

        HourLog::create([
            'student_id' => $student3->id,
            'slot_id' => $slotMSW->id,
            'date' => '2026-02-07',
            'hours_worked' => 4,
            'category' => 'indirect_care',
            'description' => 'Case documentation, progress notes, supervision session with LCSW',
            'status' => 'pending',
        ]);

        // Student 4 at Pediatrics
        HourLog::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPeds->id,
            'date' => '2026-02-03',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Well-child visits (6), immunization administration (4), developmental screening (2)',
            'status' => 'approved',
            'approved_by' => $demoPreceptor->id,
            'approved_at' => '2026-02-04 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPeds->id,
            'date' => '2026-02-05',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Sick visits (8) - otitis media, pharyngitis, asthma exacerbation, well-child check (3)',
            'status' => 'pending',
        ]);

        // Student 5 at Urgent Care
        HourLog::create([
            'student_id' => $student5->id,
            'slot_id' => $slotUrgent->id,
            'date' => '2026-02-03',
            'hours_worked' => 12,
            'category' => 'direct_care',
            'description' => 'Urgent care - 18 patient encounters. Laceration repair (2), splinting, rapid strep tests, medication prescribing under supervision',
            'status' => 'approved',
            'approved_by' => $siteManager2->id,
            'approved_at' => '2026-02-04 10:00:00',
        ]);

        // Student 7 (completed rotation) — full hours logged and approved
        HourLog::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-06',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Internal medicine orientation. History & physical on 4 patients. Attended morning report.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-07 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-07',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Rounding on 6 patients. Discharge summaries (2). Admission workup for CHF patient.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-08 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-08',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Managed 8-patient panel. Performed paracentesis assist. Presented at noon conference.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-09 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-09',
            'hours_worked' => 4,
            'category' => 'indirect_care',
            'description' => 'Chart reviews, literature search for journal club, case presentation preparation',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-10 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-10',
            'hours_worked' => 2,
            'category' => 'other',
            'description' => 'End-of-rotation case presentation to attending physicians',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-11 09:00:00',
        ]);

        // --- Hour logs for additional students at Patricia's slots ---

        // Sarah Chen at Surgery (accepted) — approved + pending hours
        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotSurgery->id,
            'date' => '2026-02-17',
            'hours_worked' => 10,
            'category' => 'direct_care',
            'description' => 'Surgical orientation day. Observed 2 laparoscopic cholecystectomies, assisted with wound dressing changes on 4 post-op patients.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-02-18 08:00:00',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotSurgery->id,
            'date' => '2026-02-18',
            'hours_worked' => 10,
            'category' => 'direct_care',
            'description' => 'Pre-op assessments (3 patients), scrubbed in on appendectomy, post-op rounding on 6 patients.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-02-19 08:00:00',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotSurgery->id,
            'date' => '2026-02-19',
            'hours_worked' => 10,
            'category' => 'direct_care',
            'description' => 'Assisted in hernia repair, managed 2 wound vacs, discharged 3 patients.',
            'status' => 'pending',
        ]);

        HourLog::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotSurgery->id,
            'date' => '2026-02-20',
            'hours_worked' => 4,
            'category' => 'indirect_care',
            'description' => 'Surgical case review, documentation, preceptor teaching session on surgical instruments.',
            'status' => 'pending',
        ]);

        // Marcus Johnson at Psychiatry (accepted) — just started, one pending log
        HourLog::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPsych->id,
            'date' => '2026-02-17',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Psychiatry orientation. Observed medication management sessions (3 patients). Reviewed safety protocols.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-02-18 09:00:00',
        ]);

        HourLog::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPsych->id,
            'date' => '2026-02-18',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Co-facilitated group therapy session. Individual patient assessments (2). Attended interdisciplinary team meeting.',
            'status' => 'pending',
        ]);

        // Emily Torres at Internal Medicine (completed rotation) — all approved
        HourLog::create([
            'student_id' => $student5->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-06',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'IM orientation. History & physical on 3 patients. Morning rounds with attending.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-07 10:00:00',
        ]);

        HourLog::create([
            'student_id' => $student5->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-07',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Rounding on 5 patients. Admission workup for COPD exacerbation. Attended grand rounds.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-08 10:00:00',
        ]);

        HourLog::create([
            'student_id' => $student5->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-08',
            'hours_worked' => 8,
            'category' => 'direct_care',
            'description' => 'Managed 6-patient panel. Discharge planning for 2 patients. Presented at noon conference.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-09 10:00:00',
        ]);

        HourLog::create([
            'student_id' => $student5->id,
            'slot_id' => $slotInternalMed->id,
            'date' => '2026-01-09',
            'hours_worked' => 4,
            'category' => 'indirect_care',
            'description' => 'Documentation, case presentation preparation, quality improvement project work.',
            'status' => 'approved',
            'approved_by' => $preceptor4->id,
            'approved_at' => '2026-01-10 10:00:00',
        ]);

        // =====================================================================
        // 10. EVALUATIONS — mid_rotation, final, student_feedback
        // =====================================================================

        // Mid-rotation: Aisha at MSW
        Evaluation::create([
            'type' => 'mid_rotation',
            'student_id' => $student3->id,
            'preceptor_id' => $demoPreceptor->id,
            'slot_id' => $slotMSW->id,
            'ratings' => [
                'clinical_knowledge' => 4,
                'assessment_skills' => 4,
                'communication' => 5,
                'professionalism' => 5,
                'critical_thinking' => 4,
                'documentation' => 3,
                'time_management' => 4,
            ],
            'comments' => 'Aisha has shown excellent progress in her clinical skills. Her empathy and communication with clients is outstanding.',
            'overall_score' => 4.1,
            'strengths' => 'Excellent rapport with clients, strong therapeutic communication, culturally sensitive approach',
            'areas_for_improvement' => 'Documentation timeliness could improve. Would benefit from more assertiveness in team meetings.',
            'is_submitted' => true,
        ]);

        // Mid-rotation: David at ICU
        Evaluation::create([
            'type' => 'mid_rotation',
            'student_id' => $student2->id,
            'preceptor_id' => $preceptor2->id,
            'slot_id' => $slotICU->id,
            'ratings' => [
                'clinical_knowledge' => 3,
                'assessment_skills' => 4,
                'communication' => 4,
                'professionalism' => 5,
                'critical_thinking' => 3,
                'documentation' => 4,
                'time_management' => 3,
            ],
            'comments' => 'David is making good progress for a BSN student in the ICU. His CNA background gives him strong foundational skills.',
            'overall_score' => 3.7,
            'strengths' => 'Strong work ethic, excellent patient rapport, reliable and punctual',
            'areas_for_improvement' => 'Needs more confidence in clinical decision-making. Should review cardiac rhythms and ventilator modes.',
            'is_submitted' => true,
        ]);

        // Final evaluation: Jessica at Internal Medicine (completed rotation)
        Evaluation::create([
            'type' => 'final',
            'student_id' => $student7->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotInternalMed->id,
            'ratings' => [
                'clinical_knowledge' => 5,
                'assessment_skills' => 5,
                'communication' => 4,
                'professionalism' => 5,
                'critical_thinking' => 5,
                'documentation' => 4,
                'time_management' => 5,
            ],
            'comments' => 'Jessica demonstrated exceptional clinical acumen throughout her internal medicine rotation. Her EMT background provided a strong foundation that she built upon impressively.',
            'overall_score' => 4.7,
            'strengths' => 'Outstanding clinical reasoning, excellent procedural skills, strong differential diagnosis ability, natural leadership',
            'areas_for_improvement' => 'Could improve written documentation style. Would benefit from more exposure to outpatient chronic disease management.',
            'is_submitted' => true,
        ]);

        // Mid-rotation: Jessica at Internal Medicine
        Evaluation::create([
            'type' => 'mid_rotation',
            'student_id' => $student7->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotInternalMed->id,
            'ratings' => [
                'clinical_knowledge' => 4,
                'assessment_skills' => 4,
                'communication' => 4,
                'professionalism' => 5,
                'critical_thinking' => 4,
                'documentation' => 3,
                'time_management' => 4,
            ],
            'comments' => 'Jessica is progressing well. Adapting quickly to the inpatient medicine workflow.',
            'overall_score' => 4.0,
            'strengths' => 'Quick learner, strong assessment skills, professional demeanor',
            'areas_for_improvement' => 'Documentation needs improvement. Work on presenting at rounds more concisely.',
            'is_submitted' => true,
        ]);

        // Student feedback: Jessica rates her IM rotation
        Evaluation::create([
            'type' => 'student_feedback',
            'student_id' => $student7->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotInternalMed->id,
            'ratings' => [
                'teaching_quality' => 5,
                'availability' => 4,
                'feedback_quality' => 5,
                'learning_environment' => 5,
                'clinical_exposure' => 5,
                'autonomy' => 4,
                'overall_experience' => 5,
            ],
            'comments' => 'Dr. Okafor is an outstanding preceptor. She gave me increasing autonomy as I demonstrated competence and always provided constructive feedback.',
            'overall_score' => 4.7,
            'strengths' => 'Excellent teaching style, diverse case mix, supportive learning environment, great feedback',
            'areas_for_improvement' => 'More structured didactic sessions would be helpful. Sometimes difficult to reach for questions on off-days.',
            'is_submitted' => true,
        ]);

        // Student feedback: Marcus at Peds
        Evaluation::create([
            'type' => 'student_feedback',
            'student_id' => $student4->id,
            'preceptor_id' => $demoPreceptor->id,
            'slot_id' => $slotPeds->id,
            'ratings' => [
                'teaching_quality' => 4,
                'availability' => 5,
                'feedback_quality' => 4,
                'learning_environment' => 5,
                'clinical_exposure' => 4,
                'autonomy' => 3,
                'overall_experience' => 4,
            ],
            'comments' => 'Great pediatric rotation. The clinic has an amazing culture and the preceptors are very supportive.',
            'overall_score' => 4.1,
            'strengths' => 'Supportive environment, good case variety, excellent staff interactions',
            'areas_for_improvement' => 'Would like more opportunities for independent patient encounters. More exposure to acute pediatric cases.',
            'is_submitted' => true,
        ]);

        // Draft evaluation (not submitted yet)
        Evaluation::create([
            'type' => 'mid_rotation',
            'student_id' => $demoStudent->id,
            'preceptor_id' => $demoPreceptor->id,
            'slot_id' => $slotFNP->id,
            'ratings' => [
                'clinical_knowledge' => 4,
                'assessment_skills' => 4,
                'communication' => 5,
                'professionalism' => 5,
                'critical_thinking' => 4,
            ],
            'comments' => '',
            'overall_score' => 4.4,
            'strengths' => 'Bilingual communication, strong patient rapport',
            'areas_for_improvement' => '',
            'is_submitted' => false,
        ]);

        // --- Evaluations for additional students at Patricia's slots ---

        // Final evaluation: Emily at Internal Medicine (completed, by Patricia)
        Evaluation::create([
            'type' => 'final',
            'student_id' => $student5->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotInternalMed->id,
            'ratings' => [
                'clinical_knowledge' => 4,
                'assessment_skills' => 4,
                'communication' => 4,
                'professionalism' => 5,
                'critical_thinking' => 3,
                'documentation' => 4,
                'time_management' => 4,
            ],
            'comments' => 'Emily performed well in her internal medicine rotation. Strong assessment skills and excellent professionalism. Her ICU interest was evident.',
            'overall_score' => 4.0,
            'strengths' => 'Reliable, strong patient rapport, thorough documentation, punctual',
            'areas_for_improvement' => 'Could improve differential diagnosis depth. Would benefit from more independent clinical decision-making.',
            'is_submitted' => true,
        ]);

        // Mid-rotation: Sarah at Surgery (by Patricia)
        Evaluation::create([
            'type' => 'mid_rotation',
            'student_id' => $demoStudent->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotSurgery->id,
            'ratings' => [
                'clinical_knowledge' => 4,
                'assessment_skills' => 4,
                'communication' => 5,
                'professionalism' => 5,
                'critical_thinking' => 4,
                'documentation' => 4,
                'time_management' => 4,
            ],
            'comments' => 'Sarah is adapting well to the surgical environment. Her bilingual skills have been invaluable with our diverse patient population.',
            'overall_score' => 4.3,
            'strengths' => 'Excellent communication, bilingual asset, strong patient rapport, quick learner',
            'areas_for_improvement' => 'Needs more confidence in the OR setting. Should study surgical anatomy and common procedures more.',
            'is_submitted' => true,
        ]);

        // =====================================================================
        // 11. CERTIFICATES — issued and revoked
        // =====================================================================

        Certificate::create([
            'student_id' => $student3->id,
            'slot_id' => $slotMSW->id,
            'issued_by' => $demoPreceptor->id,
            'certificate_number' => 'CL-ABCD-2026-0001',
            'title' => 'MSW Field Practicum - Behavioral Health Completion',
            'total_hours' => 20.0,
            'overall_score' => 4.1,
            'status' => 'issued',
            'issued_date' => '2026-02-08',
        ]);

        Certificate::create([
            'student_id' => $student2->id,
            'slot_id' => $slotICU->id,
            'issued_by' => $preceptor2->id,
            'certificate_number' => 'CL-EFGH-2026-0002',
            'title' => 'Critical Care Unit - BSN Clinical Completion',
            'total_hours' => 28.0,
            'overall_score' => 3.7,
            'status' => 'issued',
            'issued_date' => '2026-02-09',
        ]);

        // Completed rotation certificate for Jessica
        Certificate::create([
            'student_id' => $student7->id,
            'slot_id' => $slotInternalMed->id,
            'issued_by' => $preceptor4->id,
            'certificate_number' => 'CL-IJKL-2026-0003',
            'title' => 'Internal Medicine PA Rotation - Completed with Distinction',
            'total_hours' => 30.0,
            'overall_score' => 4.7,
            'status' => 'issued',
            'issued_date' => '2026-02-28',
        ]);

        // Emily's completed IM rotation certificate (issued by Patricia)
        Certificate::create([
            'student_id' => $student5->id,
            'slot_id' => $slotInternalMed->id,
            'issued_by' => $preceptor4->id,
            'certificate_number' => 'CL-QRST-2026-0005',
            'title' => 'Internal Medicine BSN Rotation - Completion',
            'total_hours' => 28.0,
            'overall_score' => 4.0,
            'status' => 'issued',
            'issued_date' => '2026-02-28',
        ]);

        // Revoked certificate (scenario: student falsified hours)
        Certificate::create([
            'student_id' => $student6->id,
            'slot_id' => $slotOncology->id,
            'issued_by' => $preceptor2->id,
            'certificate_number' => 'CL-MNOP-2025-0004',
            'title' => 'Oncology Nursing Clinical Completion',
            'total_hours' => 24.0,
            'overall_score' => 3.2,
            'status' => 'revoked',
            'issued_date' => '2025-12-15',
            'revoked_date' => '2026-01-05',
            'revocation_reason' => 'Certificate revoked due to student withdrawing from program during audit of clinical hours.',
        ]);

        // =====================================================================
        // 12. ONBOARDING TEMPLATES, ITEMS, & TASKS
        // =====================================================================

        // Template 1: Mercy General Hospital onboarding
        $templateMercy = OnboardingTemplate::create([
            'site_id' => $mercyGeneral->id,
            'name' => 'Mercy General Hospital - Clinical Orientation Checklist',
            'description' => 'Required onboarding checklist for all clinical students rotating at Mercy General Hospital.',
            'is_active' => true,
            'created_by' => $demoSiteManager->id,
        ]);

        $itemMercy1 = OnboardingItem::create(['template_id' => $templateMercy->id, 'title' => 'Hospital Orientation Video', 'description' => 'Complete the 45-minute online hospital orientation video and submit completion certificate.', 'is_required' => true, 'order' => 1]);
        $itemMercy2 = OnboardingItem::create(['template_id' => $templateMercy->id, 'title' => 'Badge & ID Setup', 'description' => 'Visit Security Office (Building A, Room 102) to get your hospital badge and parking pass.', 'is_required' => true, 'order' => 2]);
        $itemMercy3 = OnboardingItem::create(['template_id' => $templateMercy->id, 'title' => 'Epic EHR Training', 'description' => 'Complete the Epic EHR training module and pass the competency quiz (80% minimum).', 'is_required' => true, 'order' => 3]);
        $itemMercy4 = OnboardingItem::create(['template_id' => $templateMercy->id, 'title' => 'Fire Safety & Emergency Codes', 'description' => 'Review fire safety procedures and hospital emergency codes. Sign acknowledgment form.', 'is_required' => true, 'order' => 4]);
        $itemMercy5 = OnboardingItem::create(['template_id' => $templateMercy->id, 'title' => 'Unit Tour & Introduction', 'description' => 'Schedule and complete unit tour with charge nurse. Meet team members.', 'is_required' => true, 'order' => 5]);
        $itemMercy6 = OnboardingItem::create(['template_id' => $templateMercy->id, 'title' => 'Parking Pass Application', 'description' => 'Submit parking pass application form. $25/month deducted from student account.', 'is_required' => false, 'order' => 6]);

        // Template 2: Sunshine FHC onboarding
        $templateSunshine = OnboardingTemplate::create([
            'site_id' => $sunshineFhc->id,
            'name' => 'Sunshine FHC - Student Onboarding',
            'description' => 'Onboarding requirements for clinical students at Sunshine Family Health Center.',
            'is_active' => true,
            'created_by' => $demoSiteManager->id,
        ]);

        $itemSun1 = OnboardingItem::create(['template_id' => $templateSunshine->id, 'title' => 'Athenahealth EHR Training', 'description' => 'Complete Athenahealth training module and submit completion screenshot.', 'is_required' => true, 'order' => 1]);
        $itemSun2 = OnboardingItem::create(['template_id' => $templateSunshine->id, 'title' => 'Community Health Orientation', 'description' => 'Attend 2-hour community health orientation covering underserved population care principles.', 'is_required' => true, 'order' => 2]);
        $itemSun3 = OnboardingItem::create(['template_id' => $templateSunshine->id, 'title' => 'Cultural Competency Module', 'description' => 'Complete online cultural competency training. Our patient population is 60% Hispanic.', 'is_required' => true, 'order' => 3]);
        $itemSun4 = OnboardingItem::create(['template_id' => $templateSunshine->id, 'title' => 'Sign Confidentiality Agreement', 'description' => 'Read and sign the HIPAA confidentiality and social media policy agreement.', 'is_required' => true, 'order' => 4]);

        // Template 3: Children's Wellness
        $templateChildrens = OnboardingTemplate::create([
            'site_id' => $childrensWellness->id,
            'name' => 'Children\'s Wellness - Pediatric Clinical Prep',
            'description' => 'Preparation checklist for pediatric clinical rotations.',
            'is_active' => true,
            'created_by' => $demoSiteManager->id,
        ]);

        $itemChild1 = OnboardingItem::create(['template_id' => $templateChildrens->id, 'title' => 'Pediatric Growth Chart Review', 'description' => 'Review WHO and CDC growth chart usage. Complete practice quiz.', 'is_required' => true, 'order' => 1]);
        $itemChild2 = OnboardingItem::create(['template_id' => $templateChildrens->id, 'title' => 'Vaccine Schedule Review', 'description' => 'Review current CDC immunization schedule for children 0-18. Pass competency check.', 'is_required' => true, 'order' => 2]);
        $itemChild3 = OnboardingItem::create(['template_id' => $templateChildrens->id, 'title' => 'Cerner EHR Access Setup', 'description' => 'Complete Cerner access request form and training module.', 'is_required' => true, 'order' => 3]);

        // Template 4: Behavioral Health
        $templateBehavioral = OnboardingTemplate::create([
            'site_id' => $behavioralHealth->id,
            'name' => 'Behavioral Health Partners - Clinical Practicum Onboarding',
            'description' => 'Required onboarding for MSW and counseling students.',
            'is_active' => true,
            'created_by' => $siteManager3->id,
        ]);

        $itemBH1 = OnboardingItem::create(['template_id' => $templateBehavioral->id, 'title' => 'Mandated Reporter Training', 'description' => 'Complete Florida mandated reporter training and submit certificate.', 'is_required' => true, 'order' => 1]);
        $itemBH2 = OnboardingItem::create(['template_id' => $templateBehavioral->id, 'title' => 'Safety Plan Protocol Review', 'description' => 'Review clinic\'s safety plan protocol for suicidal ideation. Sign competency acknowledgment.', 'is_required' => true, 'order' => 2]);
        $itemBH3 = OnboardingItem::create(['template_id' => $templateBehavioral->id, 'title' => 'TherapyNotes EHR Training', 'description' => 'Complete TherapyNotes training session with clinical supervisor.', 'is_required' => true, 'order' => 3]);
        $itemBH4 = OnboardingItem::create(['template_id' => $templateBehavioral->id, 'title' => 'Observation of Intake Session', 'description' => 'Observe at least one intake session with your assigned supervisor before conducting your own.', 'is_required' => false, 'order' => 4]);

        // Template 5: Inactive template (old version)
        OnboardingTemplate::create([
            'site_id' => $mercyGeneral->id,
            'name' => 'Mercy General - Legacy Orientation (2024)',
            'description' => 'Previous version of hospital orientation checklist. Replaced September 2025.',
            'is_active' => false,
            'created_by' => $demoSiteManager->id,
        ]);

        // --- Onboarding Tasks for accepted applications ---

        // Sarah at FNP (Sunshine) — mix of completed, verified, and pending
        OnboardingTask::create([
            'application_id' => $appSarahFNP->id,
            'item_id' => $itemSun1->id,
            'title' => 'Athenahealth EHR Training',
            'description' => 'Complete Athenahealth training module and submit completion screenshot.',
            'is_required' => true,
            'order' => 1,
            'completed_at' => '2026-02-01 14:00:00',
            'completed_by' => $demoStudent->id,
            'verified_at' => '2026-02-02 09:00:00',
            'verified_by' => $demoSiteManager->id,
            'verification_notes' => 'Screenshot confirmed. Access granted.',
        ]);

        OnboardingTask::create([
            'application_id' => $appSarahFNP->id,
            'item_id' => $itemSun2->id,
            'title' => 'Community Health Orientation',
            'description' => 'Attend 2-hour community health orientation.',
            'is_required' => true,
            'order' => 2,
            'completed_at' => '2026-02-02 16:00:00',
            'completed_by' => $demoStudent->id,
        ]);

        OnboardingTask::create([
            'application_id' => $appSarahFNP->id,
            'item_id' => $itemSun3->id,
            'title' => 'Cultural Competency Module',
            'description' => 'Complete online cultural competency training.',
            'is_required' => true,
            'order' => 3,
            'completed_at' => '2026-02-03 10:00:00',
            'completed_by' => $demoStudent->id,
            'verified_at' => '2026-02-03 15:00:00',
            'verified_by' => $demoSiteManager->id,
            'verification_notes' => 'Module completion confirmed in LMS.',
        ]);

        OnboardingTask::create([
            'application_id' => $appSarahFNP->id,
            'item_id' => $itemSun4->id,
            'title' => 'Sign Confidentiality Agreement',
            'description' => 'Read and sign the HIPAA confidentiality and social media policy agreement.',
            'is_required' => true,
            'order' => 4,
        ]);

        // David at ICU (Mercy) — partially completed
        OnboardingTask::create([
            'application_id' => $appDavidICU->id,
            'item_id' => $itemMercy1->id,
            'title' => 'Hospital Orientation Video',
            'description' => 'Complete the 45-minute online hospital orientation video.',
            'is_required' => true,
            'order' => 1,
            'completed_at' => '2026-01-31 11:00:00',
            'completed_by' => $student2->id,
            'verified_at' => '2026-01-31 14:00:00',
            'verified_by' => $demoSiteManager->id,
            'verification_notes' => 'Completion certificate verified.',
        ]);

        OnboardingTask::create([
            'application_id' => $appDavidICU->id,
            'item_id' => $itemMercy2->id,
            'title' => 'Badge & ID Setup',
            'description' => 'Visit Security Office to get hospital badge.',
            'is_required' => true,
            'order' => 2,
            'completed_at' => '2026-02-01 10:00:00',
            'completed_by' => $student2->id,
            'verified_at' => '2026-02-01 11:00:00',
            'verified_by' => $demoSiteManager->id,
        ]);

        OnboardingTask::create([
            'application_id' => $appDavidICU->id,
            'item_id' => $itemMercy3->id,
            'title' => 'Epic EHR Training',
            'description' => 'Complete Epic EHR training and pass competency quiz.',
            'is_required' => true,
            'order' => 3,
            'completed_at' => '2026-02-02 15:00:00',
            'completed_by' => $student2->id,
        ]);

        OnboardingTask::create([
            'application_id' => $appDavidICU->id,
            'item_id' => $itemMercy4->id,
            'title' => 'Fire Safety & Emergency Codes',
            'description' => 'Review fire safety procedures and hospital emergency codes.',
            'is_required' => true,
            'order' => 4,
        ]);

        OnboardingTask::create([
            'application_id' => $appDavidICU->id,
            'item_id' => $itemMercy5->id,
            'title' => 'Unit Tour & Introduction',
            'description' => 'Schedule and complete unit tour with charge nurse.',
            'is_required' => true,
            'order' => 5,
        ]);

        OnboardingTask::create([
            'application_id' => $appDavidICU->id,
            'item_id' => $itemMercy6->id,
            'title' => 'Parking Pass Application',
            'description' => 'Submit parking pass application form.',
            'is_required' => false,
            'order' => 6,
        ]);

        // Aisha at MSW (Behavioral Health) — all completed and verified
        OnboardingTask::create([
            'application_id' => $appAishaMSW->id,
            'item_id' => $itemBH1->id,
            'title' => 'Mandated Reporter Training',
            'description' => 'Complete Florida mandated reporter training.',
            'is_required' => true,
            'order' => 1,
            'completed_at' => '2026-01-26 10:00:00',
            'completed_by' => $student3->id,
            'verified_at' => '2026-01-26 14:00:00',
            'verified_by' => $siteManager3->id,
            'verification_notes' => 'Certificate on file.',
        ]);

        OnboardingTask::create([
            'application_id' => $appAishaMSW->id,
            'item_id' => $itemBH2->id,
            'title' => 'Safety Plan Protocol Review',
            'description' => 'Review clinic safety plan protocol for suicidal ideation.',
            'is_required' => true,
            'order' => 2,
            'completed_at' => '2026-01-27 09:00:00',
            'completed_by' => $student3->id,
            'verified_at' => '2026-01-27 11:00:00',
            'verified_by' => $siteManager3->id,
            'verification_notes' => 'Signed competency acknowledgment received.',
        ]);

        OnboardingTask::create([
            'application_id' => $appAishaMSW->id,
            'item_id' => $itemBH3->id,
            'title' => 'TherapyNotes EHR Training',
            'description' => 'Complete TherapyNotes training session.',
            'is_required' => true,
            'order' => 3,
            'completed_at' => '2026-01-28 14:00:00',
            'completed_by' => $student3->id,
            'verified_at' => '2026-01-28 16:00:00',
            'verified_by' => $siteManager3->id,
            'verification_notes' => 'Training completed with supervisor. EHR access provisioned.',
        ]);

        OnboardingTask::create([
            'application_id' => $appAishaMSW->id,
            'item_id' => $itemBH4->id,
            'title' => 'Observation of Intake Session',
            'description' => 'Observe at least one intake session.',
            'is_required' => false,
            'order' => 4,
            'completed_at' => '2026-01-29 11:00:00',
            'completed_by' => $student3->id,
            'verified_at' => '2026-01-29 15:00:00',
            'verified_by' => $siteManager3->id,
        ]);

        // Marcus at Peds (Children's) — not started yet
        OnboardingTask::create(['application_id' => $appMarcusPeds->id, 'item_id' => $itemChild1->id, 'title' => 'Pediatric Growth Chart Review', 'description' => 'Review WHO and CDC growth chart usage.', 'is_required' => true, 'order' => 1]);
        OnboardingTask::create(['application_id' => $appMarcusPeds->id, 'item_id' => $itemChild2->id, 'title' => 'Vaccine Schedule Review', 'description' => 'Review current CDC immunization schedule.', 'is_required' => true, 'order' => 2]);
        OnboardingTask::create(['application_id' => $appMarcusPeds->id, 'item_id' => $itemChild3->id, 'title' => 'Cerner EHR Access Setup', 'description' => 'Complete Cerner access request form.', 'is_required' => true, 'order' => 3]);

        // =====================================================================
        // 13. SITE INVITES — pending, accepted, expired/revoked
        // =====================================================================

        // Pending invite — open link (no specific email)
        SiteInvite::create([
            'site_id' => $mercyGeneral->id,
            'invited_by' => $demoSiteManager->id,
            'token' => Str::random(64),
            'email' => null,
            'status' => 'pending',
            'expires_at' => '2026-03-15 23:59:59',
        ]);

        // Pending invite — targeted email
        SiteInvite::create([
            'site_id' => $sunshineFhc->id,
            'invited_by' => $demoSiteManager->id,
            'token' => Str::random(64),
            'email' => 'newpreceptor@sunshine.com',
            'status' => 'pending',
            'expires_at' => '2026-03-01 23:59:59',
        ]);

        // Accepted invite
        SiteInvite::create([
            'site_id' => $mercyGeneral->id,
            'invited_by' => $demoSiteManager->id,
            'token' => Str::random(64),
            'email' => 'angela.brooks@mercy.com',
            'status' => 'accepted',
            'accepted_by' => $preceptor2->id,
            'accepted_at' => '2026-01-15 10:00:00',
            'expires_at' => '2026-02-15 23:59:59',
        ]);

        // Accepted invite for preceptor3
        SiteInvite::create([
            'site_id' => $coastalRehab->id,
            'invited_by' => $demoSiteManager->id,
            'token' => Str::random(64),
            'email' => 'michael.nguyen@coastal.com',
            'status' => 'accepted',
            'accepted_by' => $preceptor3->id,
            'accepted_at' => '2026-01-20 14:00:00',
            'expires_at' => '2026-02-20 23:59:59',
        ]);

        // Revoked invite
        SiteInvite::create([
            'site_id' => $stPeteMedical->id,
            'invited_by' => $siteManager2->id,
            'token' => Str::random(64),
            'email' => 'harold.fleming@mercy.com',
            'status' => 'revoked',
            'expires_at' => '2026-02-01 23:59:59',
        ]);

        // Expired invite (past expiration date)
        SiteInvite::create([
            'site_id' => $palmBeachUrgent->id,
            'invited_by' => $siteManager2->id,
            'token' => Str::random(64),
            'email' => 'expired.invite@example.com',
            'status' => 'pending',
            'expires_at' => '2025-12-31 23:59:59',
        ]);

        // =====================================================================
        // 14. AFFILIATION AGREEMENTS — all statuses
        // =====================================================================

        // Active agreements
        AffiliationAgreement::create([
            'university_id' => $umiami->id,
            'site_id' => $mercyGeneral->id,
            'status' => 'active',
            'start_date' => '2025-08-01',
            'end_date' => '2027-07-31',
            'notes' => 'Covers BSN, MSN, and DNP programs. Maximum 8 students per semester.',
            'created_by' => $demoCoordinator->id,
        ]);

        AffiliationAgreement::create([
            'university_id' => $umiami->id,
            'site_id' => $sunshineFhc->id,
            'status' => 'active',
            'start_date' => '2025-09-01',
            'end_date' => '2027-08-31',
            'notes' => 'FNP and DNP students only. Maximum 4 students per semester.',
            'created_by' => $demoCoordinator->id,
        ]);

        AffiliationAgreement::create([
            'university_id' => $fiu->id,
            'site_id' => $mercyGeneral->id,
            'status' => 'active',
            'start_date' => '2025-06-01',
            'end_date' => '2027-05-31',
            'notes' => 'BSN and PA programs. Maximum 6 students per semester.',
            'created_by' => $coordinator2->id,
        ]);

        AffiliationAgreement::create([
            'university_id' => $nova->id,
            'site_id' => $behavioralHealth->id,
            'status' => 'active',
            'start_date' => '2025-07-01',
            'end_date' => '2027-06-30',
            'notes' => 'MSW program field practicum placements.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $ucf->id,
            'site_id' => $childrensWellness->id,
            'status' => 'active',
            'start_date' => '2025-09-01',
            'end_date' => '2027-08-31',
            'notes' => 'Pediatric NP program. Maximum 3 students per rotation cycle.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $fiu->id,
            'site_id' => $stPeteMedical->id,
            'status' => 'active',
            'start_date' => '2025-10-01',
            'end_date' => '2027-09-30',
            'notes' => 'PA program surgical and internal medicine rotations.',
            'created_by' => $coordinator2->id,
        ]);

        AffiliationAgreement::create([
            'university_id' => $usf->id,
            'site_id' => $palmBeachUrgent->id,
            'status' => 'active',
            'start_date' => '2025-08-01',
            'end_date' => '2027-07-31',
            'notes' => 'BSN urgent care rotations. Maximum 3 students.',
        ]);

        // Pending review
        AffiliationAgreement::create([
            'university_id' => $nova->id,
            'site_id' => $coastalRehab->id,
            'status' => 'pending_review',
            'start_date' => '2026-01-01',
            'end_date' => '2028-12-31',
            'notes' => 'DPT program clinical rotation agreement. Under legal review.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $umiami->id,
            'site_id' => $stPeteMedical->id,
            'status' => 'pending_review',
            'start_date' => '2026-06-01',
            'end_date' => '2028-05-31',
            'notes' => 'New agreement for DNP acute care rotations. Pending hospital board approval.',
            'created_by' => $demoCoordinator->id,
        ]);

        // Draft
        AffiliationAgreement::create([
            'university_id' => $barryU->id,
            'site_id' => $sunshineFhc->id,
            'status' => 'draft',
            'start_date' => null,
            'end_date' => null,
            'notes' => 'Initial draft. Barry University nursing program is awaiting accreditation verification.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $ucf->id,
            'site_id' => $coastalRehab->id,
            'status' => 'draft',
            'start_date' => '2026-09-01',
            'end_date' => '2028-08-31',
            'notes' => 'Draft agreement for OTD program rotations.',
        ]);

        // Expired
        AffiliationAgreement::create([
            'university_id' => $usf->id,
            'site_id' => $mercyGeneral->id,
            'status' => 'expired',
            'start_date' => '2023-08-01',
            'end_date' => '2025-07-31',
            'notes' => 'Previous agreement expired. Renewal in discussion.',
        ]);

        // Terminated
        AffiliationAgreement::create([
            'university_id' => $nova->id,
            'site_id' => $gainesvilleClinic->id,
            'status' => 'terminated',
            'start_date' => '2024-01-01',
            'end_date' => '2026-12-31',
            'notes' => 'Agreement terminated early due to clinic closure for renovation.',
        ]);

        // =====================================================================
        // 15. UNIVERSITY CE POLICIES
        // =====================================================================

        // UMiami — full CE program with all requirements
        UniversityCePolicy::create([
            'university_id' => $umiami->id,
            'offers_ce' => true,
            'accrediting_body' => 'American Nurses Credentialing Center (ANCC)',
            'contact_hours_per_rotation' => 15.00,
            'max_hours_per_year' => 60.00,
            'requires_final_evaluation' => true,
            'requires_midterm_evaluation' => true,
            'requires_minimum_hours' => true,
            'minimum_hours_required' => 120.00,
            'approval_required' => true,
            'signer_name' => 'Dr. Robert Martinez',
            'signer_credentials' => 'DNP, APRN, FNP-C, Professor of Nursing',
        ]);

        // FIU — CE program with auto-issuance (no approval required)
        UniversityCePolicy::create([
            'university_id' => $fiu->id,
            'offers_ce' => true,
            'accrediting_body' => 'Accreditation Review Commission on Education for the Physician Assistant (ARC-PA)',
            'contact_hours_per_rotation' => 20.00,
            'max_hours_per_year' => 80.00,
            'requires_final_evaluation' => true,
            'requires_midterm_evaluation' => false,
            'requires_minimum_hours' => true,
            'minimum_hours_required' => 80.00,
            'approval_required' => false,
            'signer_name' => 'Dr. Rachel Green',
            'signer_credentials' => 'PhD, PA-C, Program Director',
        ]);

        // Nova — CE not offered
        UniversityCePolicy::create([
            'university_id' => $nova->id,
            'offers_ce' => false,
        ]);

        // UCF — CE program, minimal requirements
        UniversityCePolicy::create([
            'university_id' => $ucf->id,
            'offers_ce' => true,
            'accrediting_body' => 'Commission on Collegiate Nursing Education (CCNE)',
            'contact_hours_per_rotation' => 10.00,
            'max_hours_per_year' => 40.00,
            'requires_final_evaluation' => true,
            'requires_midterm_evaluation' => false,
            'requires_minimum_hours' => false,
            'approval_required' => true,
            'signer_name' => 'Dr. Amanda Foster',
            'signer_credentials' => 'PhD, RN, CNE, Associate Dean',
        ]);

        // =====================================================================
        // 16. CE CERTIFICATES — pending, approved, issued, rejected
        // =====================================================================

        // Issued CE certificate for Jessica (completed IM rotation at FIU — auto-issued, no approval required)
        CeCertificate::create([
            'university_id' => $fiu->id,
            'preceptor_id' => $preceptor4->id,
            'application_id' => $appJessicaIM->id,
            'contact_hours' => 20.00,
            'status' => 'issued',
            'issued_at' => '2026-02-28 15:00:00',
            'verification_uuid' => Str::uuid(),
        ]);

        // Pending CE certificate (for demo student at FNP — UMiami requires approval)
        CeCertificate::create([
            'university_id' => $umiami->id,
            'preceptor_id' => $demoPreceptor->id,
            'application_id' => $appSarahFNP->id,
            'contact_hours' => 15.00,
            'status' => 'pending',
            'verification_uuid' => Str::uuid(),
        ]);

        // Approved CE certificate (waiting to be officially issued)
        CeCertificate::create([
            'university_id' => $ucf->id,
            'preceptor_id' => $demoPreceptor->id,
            'application_id' => $appMarcusPeds->id,
            'contact_hours' => 10.00,
            'status' => 'approved',
            'approved_by' => $demoCoordinator->id,
            'verification_uuid' => Str::uuid(),
        ]);

        // Rejected CE certificate
        CeCertificate::create([
            'university_id' => $umiami->id,
            'preceptor_id' => $preceptor2->id,
            'application_id' => $appDavidICU->id,
            'contact_hours' => 15.00,
            'status' => 'rejected',
            'rejection_reason' => 'Student is from FIU, not UMiami. CE certificate must be issued under the student\'s own university CE policy.',
            'verification_uuid' => Str::uuid(),
        ]);

        // --- Additional CE certificates for Patricia ---

        // Issued CE for supervising Emily's completed IM rotation (USF — no CE policy, so using FIU policy as nearest match)
        CeCertificate::create([
            'university_id' => $fiu->id,
            'preceptor_id' => $preceptor4->id,
            'application_id' => $appEmilyIM->id,
            'contact_hours' => 20.00,
            'status' => 'issued',
            'issued_at' => '2026-02-28 16:00:00',
            'verification_uuid' => Str::uuid(),
        ]);

        // Pending CE for supervising Sarah at Surgery (UMiami — requires approval)
        CeCertificate::create([
            'university_id' => $umiami->id,
            'preceptor_id' => $preceptor4->id,
            'application_id' => $appSarahSurgery->id,
            'contact_hours' => 15.00,
            'status' => 'pending',
            'verification_uuid' => Str::uuid(),
        ]);
    }
}
