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
use App\Models\AffiliationAgreement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================
        // DEMO USERS (predictable login credentials)
        // =========================================

        $demoStudent = User::create([
            'first_name' => 'Sarah',
            'last_name' => 'Chen',
            'email' => 'student@cliniclink.com',
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
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '(305) 555-0100',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // =========================================
        // UNIVERSITIES & PROGRAMS
        // =========================================

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

        // Programs
        $bsnMiami = Program::create(['university_id' => $umiami->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['Medical-Surgical', 'Pediatrics', 'OB/GYN', 'Community Health']]);
        $msnFnpMiami = Program::create(['university_id' => $umiami->id, 'name' => 'Master of Science in Nursing - FNP', 'degree_type' => 'MSN', 'required_hours' => 500, 'specialties' => ['Family Practice', 'Adult Health', 'Geriatrics']]);
        $dnpMiami = Program::create(['university_id' => $umiami->id, 'name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Acute Care', 'Psychiatric Mental Health', 'Leadership']]);

        $bsnFiu = Program::create(['university_id' => $fiu->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['Medical-Surgical', 'Pediatrics', 'Community Health']]);
        $paFiu = Program::create(['university_id' => $fiu->id, 'name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Emergency Medicine', 'Surgery', 'Internal Medicine', 'Pediatrics']]);

        $mswNova = Program::create(['university_id' => $nova->id, 'name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Behavioral Health', 'Substance Abuse']]);
        $dptNova = Program::create(['university_id' => $nova->id, 'name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurological', 'Sports Rehab']]);

        $npUcf = Program::create(['university_id' => $ucf->id, 'name' => 'Nurse Practitioner - Pediatric', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Pediatrics', 'Adolescent Health', 'Well-Child Care']]);
        $bsnUsf = Program::create(['university_id' => $usf->id, 'name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['ICU/Critical Care', 'Emergency Medicine', 'Medical-Surgical']]);

        // =========================================
        // ROTATION SITES
        // =========================================

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
            'manager_id' => $demoSiteManager->id,
            'rating' => 4.5,
            'review_count' => 31,
            'is_verified' => false,
            'is_active' => true,
        ]);

        // Additional site managers and their sites
        $siteManager2 = User::create([
            'first_name' => 'David',
            'last_name' => 'Rodriguez',
            'email' => 'david.rodriguez@stpete-medical.com',
            'password' => Hash::make('password'),
            'role' => 'site_manager',
            'is_active' => true,
            'email_verified' => true,
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

        // =========================================
        // PRECEPTORS
        // =========================================

        $preceptor2 = User::create([
            'first_name' => 'Angela',
            'last_name' => 'Brooks',
            'email' => 'angela.brooks@mercy.com',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $preceptor3 = User::create([
            'first_name' => 'Michael',
            'last_name' => 'Nguyen',
            'email' => 'michael.nguyen@coastal.com',
            'password' => Hash::make('password'),
            'role' => 'preceptor',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // =========================================
        // ROTATION SLOTS
        // =========================================

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
            'filled' => 0,
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
            'capacity' => 2,
            'filled' => 0,
            'requirements' => ['BLS/CPR', 'ACLS', 'Background Check', 'Drug Screen', 'Liability Insurance', 'Surgical Clearance'],
            'cost' => 0,
            'cost_type' => 'free',
            'status' => 'open',
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

        // =========================================
        // ADDITIONAL STUDENTS
        // =========================================

        $student2 = User::create([
            'first_name' => 'David',
            'last_name' => 'Kim',
            'email' => 'david.kim@fiu.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $student3 = User::create([
            'first_name' => 'Aisha',
            'last_name' => 'Patel',
            'email' => 'aisha.patel@nova.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $student4 = User::create([
            'first_name' => 'Marcus',
            'last_name' => 'Johnson',
            'email' => 'marcus.johnson@ucf.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $student5 = User::create([
            'first_name' => 'Emily',
            'last_name' => 'Torres',
            'email' => 'emily.torres@usf.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // =========================================
        // STUDENT PROFILES
        // =========================================

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

        // =========================================
        // CREDENTIALS (for demo student)
        // =========================================

        Credential::create([
            'user_id' => $demoStudent->id,
            'type' => 'cpr',
            'name' => 'BLS/CPR - American Heart Association',
            'expiration_date' => '2027-06-15',
            'status' => 'valid',
        ]);

        Credential::create([
            'user_id' => $demoStudent->id,
            'type' => 'background_check',
            'name' => 'Level 2 Background Check - FDLE',
            'expiration_date' => '2027-01-20',
            'status' => 'valid',
        ]);

        Credential::create([
            'user_id' => $demoStudent->id,
            'type' => 'immunization',
            'name' => 'Hepatitis B Series + Titer',
            'expiration_date' => null,
            'status' => 'valid',
        ]);

        Credential::create([
            'user_id' => $demoStudent->id,
            'type' => 'drug_screen',
            'name' => '10-Panel Drug Screen',
            'expiration_date' => '2026-08-15',
            'status' => 'valid',
        ]);

        Credential::create([
            'user_id' => $demoStudent->id,
            'type' => 'liability_insurance',
            'name' => 'Nursing Students Professional Liability',
            'expiration_date' => '2027-01-01',
            'status' => 'valid',
        ]);

        Credential::create([
            'user_id' => $demoStudent->id,
            'type' => 'other',
            'name' => 'HIPAA Training Certificate',
            'expiration_date' => '2027-02-28',
            'status' => 'valid',
        ]);

        // Credentials for student 2 (one expiring soon)
        Credential::create([
            'user_id' => $student2->id,
            'type' => 'cpr',
            'name' => 'BLS/CPR - American Heart Association',
            'expiration_date' => '2026-03-01',
            'status' => 'expiring_soon',
        ]);

        Credential::create([
            'user_id' => $student2->id,
            'type' => 'background_check',
            'name' => 'Level 2 Background Check',
            'expiration_date' => '2026-12-15',
            'status' => 'valid',
        ]);

        // =========================================
        // APPLICATIONS
        // =========================================

        Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotED->id,
            'status' => 'pending',
            'cover_letter' => 'I am highly interested in emergency medicine and have completed my ACLS certification. My previous clinical experience in urgent care has prepared me well for the fast-paced ED environment. I am bilingual in English and Mandarin, which would be an asset when caring for diverse patient populations.',
            'submitted_at' => '2026-02-01 09:30:00',
        ]);

        Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotFNP->id,
            'status' => 'accepted',
            'cover_letter' => 'My passion for community health nursing drives my interest in your program. I believe Sunshine Family Health Center\'s mission aligns perfectly with my career goals of serving underserved populations.',
            'submitted_at' => '2026-01-28 14:00:00',
            'reviewed_at' => '2026-02-03 10:00:00',
            'reviewed_by' => $demoSiteManager->id,
            'notes' => 'Strong candidate. Bilingual is a plus for our patient population.',
        ]);

        Application::create([
            'student_id' => $demoStudent->id,
            'slot_id' => $slotPT->id,
            'status' => 'waitlisted',
            'cover_letter' => 'As an FNP student with a keen interest in rehabilitation medicine, I would value the opportunity to gain exposure to physical therapy approaches.',
            'submitted_at' => '2026-02-06 11:00:00',
            'reviewed_at' => '2026-02-07 09:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        // Other students' applications
        Application::create([
            'student_id' => $student2->id,
            'slot_id' => $slotICU->id,
            'status' => 'accepted',
            'cover_letter' => 'With my CNA background and strong academic performance, I am well-prepared for the critical care environment.',
            'submitted_at' => '2026-01-25 10:00:00',
            'reviewed_at' => '2026-01-30 14:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        Application::create([
            'student_id' => $student2->id,
            'slot_id' => $slotED->id,
            'status' => 'pending',
            'cover_letter' => 'I would love the opportunity to rotate through the ED to complement my ICU experience.',
            'submitted_at' => '2026-02-05 08:00:00',
        ]);

        Application::create([
            'student_id' => $student3->id,
            'slot_id' => $slotMSW->id,
            'status' => 'accepted',
            'cover_letter' => 'My research focus on trauma-informed care and experience with diverse populations makes this practicum an ideal fit.',
            'submitted_at' => '2026-01-20 11:00:00',
            'reviewed_at' => '2026-01-25 16:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        Application::create([
            'student_id' => $student4->id,
            'slot_id' => $slotPeds->id,
            'status' => 'accepted',
            'cover_letter' => 'As a former school nurse with 5 years of experience, I bring unique perspective to pediatric care.',
            'submitted_at' => '2026-01-15 09:00:00',
            'reviewed_at' => '2026-01-18 10:00:00',
            'reviewed_by' => $demoSiteManager->id,
        ]);

        Application::create([
            'student_id' => $student5->id,
            'slot_id' => $slotED->id,
            'status' => 'pending',
            'cover_letter' => 'Senior BSN student seeking my final clinical placement. I have strong assessment skills and thrive in high-acuity settings.',
            'submitted_at' => '2026-02-07 14:00:00',
        ]);

        Application::create([
            'student_id' => $student5->id,
            'slot_id' => $slotUrgent->id,
            'status' => 'accepted',
            'cover_letter' => 'The urgent care setting is perfect for building my rapid assessment and triage skills before graduation.',
            'submitted_at' => '2026-02-01 10:00:00',
            'reviewed_at' => '2026-02-04 11:00:00',
            'reviewed_by' => $siteManager2->id,
        ]);

        // =========================================
        // HOUR LOGS (for demo student at Family NP rotation)
        // =========================================

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

        // Hour logs for other students
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

        // =========================================
        // EVALUATIONS
        // =========================================

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

        // =========================================
        // AFFILIATION AGREEMENTS
        // =========================================

        AffiliationAgreement::create([
            'university_id' => $umiami->id,
            'site_id' => $mercyGeneral->id,
            'status' => 'active',
            'start_date' => '2025-08-01',
            'end_date' => '2027-07-31',
            'notes' => 'Covers BSN, MSN, and DNP programs. Maximum 8 students per semester.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $umiami->id,
            'site_id' => $sunshineFhc->id,
            'status' => 'active',
            'start_date' => '2025-09-01',
            'end_date' => '2027-08-31',
            'notes' => 'FNP and DNP students only. Maximum 4 students per semester.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $fiu->id,
            'site_id' => $mercyGeneral->id,
            'status' => 'active',
            'start_date' => '2025-06-01',
            'end_date' => '2027-05-31',
            'notes' => 'BSN and PA programs. Maximum 6 students per semester.',
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
            'university_id' => $nova->id,
            'site_id' => $coastalRehab->id,
            'status' => 'pending_review',
            'start_date' => '2026-01-01',
            'end_date' => '2028-12-31',
            'notes' => 'DPT program clinical rotation agreement. Under legal review.',
        ]);

        AffiliationAgreement::create([
            'university_id' => $ucf->id,
            'site_id' => $childrensWellness->id,
            'status' => 'active',
            'start_date' => '2025-09-01',
            'end_date' => '2027-08-31',
            'notes' => 'Pediatric NP program. Maximum 3 students per rotation cycle.',
        ]);
    }
}
