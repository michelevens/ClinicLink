<?php

bnamespace Database\Seeders;

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
use App\Models\PreceptorProfile;
use App\Models\SiteInvite;
use App\Models\UniversityCePolicy;
use App\Models\CeCertificate;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\PreceptorReview;
use App\Models\MatchingPreference;
use App\Models\SavedSearch;
use App\Models\SlotBookmark;
use App\Models\EvaluationTemplate;
use App\Models\AgreementTemplate;
use App\Models\Signature;
use App\Models\StudentInvite;
use App\Models\SiteJoinRequest;
use App\Models\AnalyticsSnapshot;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // =====================================================================
        // 1. DEMO USERS — Predictable login credentials (all use "ClinicLink2026!")
        // =====================================================================

        $demoPassword = Hash::make('ClinicLink2026!');

        $demoStudent = User::create([
            'first_name' => 'Sarah',
            'last_name' => 'Chen',
            'email' => 'student@cliniclink.health',
            'username' => 'sarahchen',
            'password' => $demoPassword,
            'role' => 'student',
            'phone' => '(407) 555-0101',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoPreceptor = User::create([
            'first_name' => 'James',
            'last_name' => 'Wilson',
            'email' => 'preceptor@cliniclink.health',
            'username' => 'drwilson',
            'password' => $demoPassword,
            'role' => 'preceptor',
            'phone' => '(407) 555-0102',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoSiteManager = User::create([
            'first_name' => 'Maria',
            'last_name' => 'Garcia',
            'email' => 'site@cliniclink.health',
            'username' => 'mariagarcia',
            'password' => $demoPassword,
            'role' => 'site_manager',
            'phone' => '(407) 555-0103',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoCoordinator = User::create([
            'first_name' => 'Lisa',
            'last_name' => 'Thompson',
            'email' => 'coordinator@cliniclink.health',
            'username' => 'lisathompson',
            'password' => $demoPassword,
            'role' => 'coordinator',
            'phone' => '(407) 555-0104',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoProfessor = User::create([
            'first_name' => 'Robert',
            'last_name' => 'Martinez',
            'email' => 'professor@cliniclink.health',
            'username' => 'profmartinez',
            'password' => $demoPassword,
            'role' => 'professor',
            'phone' => '(407) 555-0105',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoAdmin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@cliniclink.health',
            'username' => 'admin',
            'password' => $demoPassword,
            'role' => 'admin',
            'phone' => '(305) 555-0100',
            'is_active' => true,
            'email_verified' => true,
        ]);

        $demoPractitioner = User::create([
            'first_name' => 'Emily',
            'last_name' => 'Reyes',
            'email' => 'practitioner@cliniclink.health',
            'username' => 'emilyreyes',
            'password' => $demoPassword,
            'role' => 'practitioner',
            'phone' => '(407) 555-0107',
            'is_active' => true,
            'email_verified' => true,
        ]);

        \App\Models\PractitionerProfile::create([
            'user_id' => $demoPractitioner->id,
            'profession_type' => 'np',
            'licensed_states' => ['FL', 'NY'],
            'primary_specialty' => 'Family Practice',
            'years_in_practice' => 5,
            'current_employer' => 'Memorial Healthcare',
            'malpractice_confirmed' => true,
            'bio' => 'Experienced NP seeking collaborative practice agreement for independent practice in Florida.',
            'is_active' => true,
        ]);

        // =====================================================================
        // COLLABORATE MODULE — Physician vs Non-Physician Preceptor Distinction
        // =====================================================================

        // 1. Physician Preceptor (MD) — Has BOTH preceptor AND physician profiles
        // This user can supervise students (rotations) AND provide NP/PA supervision (Collaborate)
        PreceptorProfile::create([
            'user_id' => $demoPreceptor->id,
            'specialties' => ['Emergency Medicine', 'Family Medicine'],
            'years_experience' => 15,
            'bio' => 'Board-certified Emergency Medicine physician with 15 years of experience. Available for clinical supervision and collaborative practice agreements.',
            'credentials' => [
                ['type' => 'MD', 'name' => 'Doctor of Medicine', 'issuer' => 'University of Florida', 'year' => 2009],
                ['type' => 'Board Certification', 'name' => 'Emergency Medicine', 'issuer' => 'ABEM', 'year' => 2013],
            ],
            'availability_status' => 'available',
            'max_students' => 4,
            'profile_visibility' => 'public',
            'npi_number' => '1234567890',
            'npi_verified_at' => now(),
            'npi_data' => [
                'taxonomies' => [
                    ['code' => '207P00000X', 'desc' => 'Emergency Medicine', 'primary' => true],
                ],
            ],
        ]);

        \App\Models\PhysicianProfile::create([
            'user_id' => $demoPreceptor->id,
            'licensed_states' => ['FL', 'GA', 'AL'],
            'specialties' => ['Emergency Medicine', 'Family Medicine'],
            'max_supervisees' => 3,
            'supervision_model' => 'hybrid',
            'malpractice_confirmed' => true,
            'bio' => 'Available for collaborative practice agreements with NPs and PAs. Experienced in telehealth supervision and in-person consultation.',
            'is_active' => true,
        ]);

        // 2. Non-Physician Preceptor (NP) — Has ONLY preceptor profile
        // This user can supervise students (rotations) but CANNOT provide NP/PA supervision (no Collaborate access)
        $npPreceptor = User::create([
            'first_name' => 'Amanda',
            'last_name' => 'Rodriguez',
            'email' => 'np-preceptor@cliniclink.health',
            'username' => 'amandarodriguez',
            'password' => $demoPassword,
            'role' => 'preceptor',
            'phone' => '(407) 555-0108',
            'is_active' => true,
            'email_verified' => true,
        ]);

        PreceptorProfile::create([
            'user_id' => $npPreceptor->id,
            'specialties' => ['Family Practice', 'Pediatrics'],
            'years_experience' => 8,
            'bio' => 'Nurse Practitioner with 8 years of experience in family practice. Available to supervise NP and PA students for clinical rotations.',
            'credentials' => [
                ['type' => 'MSN', 'name' => 'Master of Science in Nursing', 'issuer' => 'UCF', 'year' => 2016],
                ['type' => 'FNP-BC', 'name' => 'Family Nurse Practitioner', 'issuer' => 'ANCC', 'year' => 2017],
            ],
            'availability_status' => 'available',
            'max_students' => 2,
            'profile_visibility' => 'public',
            'npi_number' => '9876543210',
            'npi_verified_at' => now(),
            'npi_data' => [
                'taxonomies' => [
                    ['code' => '363LF0000X', 'desc' => 'Nurse Practitioner, Family', 'primary' => true],
                ],
            ],
        ]);

        // NOTE: Amanda (npPreceptor) does NOT have a PhysicianProfile
        // Her NPI taxonomy (363LF0000X) is NP, not MD/DO (207*/208*)
        // Therefore, she will NOT see the Collaborate module in the navigation

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

        // Preceptor profiles (so they appear in the directory)
        PreceptorProfile::create(['user_id' => $demoPreceptor->id, 'specialties' => ['Family Medicine', 'Internal Medicine'], 'bio' => 'Board-certified family medicine physician with 15 years of clinical teaching experience.', 'credentials' => [['type' => 'MD', 'name' => 'Doctor of Medicine', 'issuer' => 'Johns Hopkins', 'year' => 2005]], 'availability_status' => 'available', 'max_students' => 4, 'years_experience' => 15, 'teaching_philosophy' => 'I believe in hands-on learning with graduated autonomy.', 'profile_visibility' => 'public']);
        PreceptorProfile::create(['user_id' => $preceptor2->id, 'specialties' => ['Pediatrics', 'Geriatrics'], 'bio' => 'Pediatric specialist passionate about mentoring the next generation of healthcare professionals.', 'credentials' => [['type' => 'DO', 'name' => 'Doctor of Osteopathic Medicine', 'issuer' => 'LECOM', 'year' => 2010]], 'availability_status' => 'available', 'max_students' => 3, 'years_experience' => 10, 'profile_visibility' => 'public']);
        PreceptorProfile::create(['user_id' => $preceptor3->id, 'specialties' => ['Emergency Medicine', 'Surgery'], 'bio' => 'Emergency medicine attending with extensive trauma experience.', 'credentials' => [['type' => 'MD', 'name' => 'Doctor of Medicine', 'issuer' => 'UF College of Medicine', 'year' => 2008]], 'availability_status' => 'limited', 'max_students' => 2, 'years_experience' => 12, 'profile_visibility' => 'public']);
        PreceptorProfile::create(['user_id' => $preceptor4->id, 'specialties' => ['OB/GYN', 'Family Medicine'], 'bio' => 'OB/GYN specialist committed to women\'s health education and clinical training.', 'credentials' => [['type' => 'MD', 'name' => 'Doctor of Medicine', 'issuer' => 'USF Morsani', 'year' => 2012]], 'availability_status' => 'available', 'max_students' => 5, 'years_experience' => 8, 'profile_visibility' => 'public']);
        PreceptorProfile::create(['user_id' => $preceptor5->id, 'specialties' => ['Cardiology'], 'bio' => 'Retired cardiologist.', 'credentials' => [['type' => 'MD', 'name' => 'Doctor of Medicine', 'issuer' => 'Emory', 'year' => 1998]], 'availability_status' => 'unavailable', 'max_students' => 0, 'years_experience' => 20, 'profile_visibility' => 'public']);

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

        // =====================================================================
        // CONVERSATIONS & MESSAGES
        // =====================================================================

        // --- 1. Student ↔ Preceptor: Rotation questions ---
        $conv1 = Conversation::create(['subject' => 'Question about ER rotation schedule']);
        ConversationParticipant::create(['conversation_id' => $conv1->id, 'user_id' => $demoStudent->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv1->id, 'user_id' => $demoPreceptor->id, 'last_read_at' => now()]);
        Message::create(['conversation_id' => $conv1->id, 'sender_id' => $demoStudent->id, 'body' => 'Hi Dr. Wilson! I\'m confirmed for the ER rotation starting March 3rd. Is there anything I should prepare before day one?', 'created_at' => now()->subDays(5)->setHour(9)]);
        Message::create(['conversation_id' => $conv1->id, 'sender_id' => $demoPreceptor->id, 'body' => 'Welcome, Sarah! Please review BLS/ACLS protocols and bring your stethoscope, badge, and comfortable shoes. We start rounds at 7 AM sharp.', 'created_at' => now()->subDays(5)->setHour(10)]);
        Message::create(['conversation_id' => $conv1->id, 'sender_id' => $demoStudent->id, 'body' => 'Got it — I\'ll review the protocols this weekend. Should I also review the EMR system beforehand?', 'created_at' => now()->subDays(4)->setHour(14)]);
        Message::create(['conversation_id' => $conv1->id, 'sender_id' => $demoPreceptor->id, 'body' => 'Good thinking! We use Epic. The hospital IT team will set up your access on day one, but watching a few tutorial videos won\'t hurt. See you Monday!', 'created_at' => now()->subDays(4)->setHour(15)]);

        // --- 2. Coordinator ↔ Site Manager: Agreement discussion ---
        $conv2 = Conversation::create(['subject' => 'Affiliation Agreement renewal — UCF ↔ Orlando Health']);
        ConversationParticipant::create(['conversation_id' => $conv2->id, 'user_id' => $demoCoordinator->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv2->id, 'user_id' => $demoSiteManager->id, 'last_read_at' => now()]);
        Message::create(['conversation_id' => $conv2->id, 'sender_id' => $demoCoordinator->id, 'body' => 'Hi Maria, our affiliation agreement expires next month. I\'ve uploaded a draft renewal in the Agreements section. Could you review the updated liability language?', 'created_at' => now()->subDays(7)->setHour(11)]);
        Message::create(['conversation_id' => $conv2->id, 'sender_id' => $demoSiteManager->id, 'body' => 'Thanks Lisa, I\'ll review it today. We may need our legal team to look at the new HIPAA addendum. I\'ll have feedback by Friday.', 'created_at' => now()->subDays(7)->setHour(13)]);
        Message::create(['conversation_id' => $conv2->id, 'sender_id' => $demoSiteManager->id, 'body' => 'Legal approved with one minor change — they want the indemnification clause to reference our updated insurance policy number. I\'ll send the redline.', 'created_at' => now()->subDays(3)->setHour(10)]);
        Message::create(['conversation_id' => $conv2->id, 'sender_id' => $demoCoordinator->id, 'body' => 'Perfect, that\'s a simple update. I\'ll revise and upload the final version for e-signature. Thank you for the quick turnaround!', 'created_at' => now()->subDays(3)->setHour(11)]);

        // --- 3. Student ↔ Coordinator: Hour log question ---
        $conv3 = Conversation::create(['subject' => 'Hour log submission question']);
        ConversationParticipant::create(['conversation_id' => $conv3->id, 'user_id' => $student2->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv3->id, 'user_id' => $demoCoordinator->id, 'last_read_at' => now()->subDays(2)]);
        Message::create(['conversation_id' => $conv3->id, 'sender_id' => $student2->id, 'body' => 'Dr. Thompson, I accidentally logged 12 hours instead of 8 for last Tuesday. Can I edit it or do I need to submit a new entry?', 'created_at' => now()->subDays(2)->setHour(16)]);
        Message::create(['conversation_id' => $conv3->id, 'sender_id' => $demoCoordinator->id, 'body' => 'Hi David, if it hasn\'t been approved yet by your preceptor, you can still edit it from your Hour Log page. If it was already approved, let me know and I\'ll have it returned for correction.', 'created_at' => now()->subDays(2)->setHour(17)]);
        Message::create(['conversation_id' => $conv3->id, 'sender_id' => $student2->id, 'body' => 'It\'s still pending — I was able to fix it. Thanks for the quick reply!', 'created_at' => now()->subDays(1)->setHour(8)]);

        // --- 4. Admin broadcast: Platform update ---
        $conv4 = Conversation::create([
            'subject' => 'New Feature: Calendar & Scheduling',
            'is_broadcast' => true,
            'broadcast_by' => $demoAdmin->id,
        ]);
        ConversationParticipant::create(['conversation_id' => $conv4->id, 'user_id' => $demoAdmin->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv4->id, 'user_id' => $demoStudent->id]);
        ConversationParticipant::create(['conversation_id' => $conv4->id, 'user_id' => $demoPreceptor->id]);
        ConversationParticipant::create(['conversation_id' => $conv4->id, 'user_id' => $demoSiteManager->id]);
        ConversationParticipant::create(['conversation_id' => $conv4->id, 'user_id' => $demoCoordinator->id]);
        ConversationParticipant::create(['conversation_id' => $conv4->id, 'user_id' => $demoProfessor->id]);
        Message::create(['conversation_id' => $conv4->id, 'sender_id' => $demoAdmin->id, 'body' => "We're excited to announce the new Calendar feature! You can now view all your rotations, deadlines, evaluations, and hour logs in one unified calendar view.\n\nKey highlights:\n• Monthly, weekly, and list views\n• Color-coded event types\n• Click any event to navigate to details\n\nAccess it from the Calendar link in your sidebar. Happy scheduling!", 'created_at' => now()->subDays(3)->setHour(9)]);

        // --- 5. Group chat: Rotation cohort ---
        $conv5 = Conversation::create(['subject' => 'Spring 2026 ER Cohort', 'is_group' => true]);
        ConversationParticipant::create(['conversation_id' => $conv5->id, 'user_id' => $demoStudent->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv5->id, 'user_id' => $student2->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv5->id, 'user_id' => $student3->id, 'last_read_at' => now()->subDays(1)]);
        ConversationParticipant::create(['conversation_id' => $conv5->id, 'user_id' => $demoPreceptor->id, 'last_read_at' => now()]);
        Message::create(['conversation_id' => $conv5->id, 'sender_id' => $demoPreceptor->id, 'body' => 'Welcome to the Spring 2026 ER cohort group! Use this chat for scheduling questions and peer support. Looking forward to working with all of you.', 'created_at' => now()->subDays(6)->setHour(8)]);
        Message::create(['conversation_id' => $conv5->id, 'sender_id' => $demoStudent->id, 'body' => 'Thanks Dr. Wilson! Quick question — is parking in Lot C or Lot D for students?', 'created_at' => now()->subDays(6)->setHour(9)]);
        Message::create(['conversation_id' => $conv5->id, 'sender_id' => $student2->id, 'body' => 'I parked in Lot D last semester and it was fine. Just bring your student badge for the gate.', 'created_at' => now()->subDays(6)->setHour(9)->addMinutes(30)]);
        Message::create(['conversation_id' => $conv5->id, 'sender_id' => $demoPreceptor->id, 'body' => 'Lot D is correct. I\'ll send the parking validation form to your emails by end of day.', 'created_at' => now()->subDays(6)->setHour(10)]);
        Message::create(['conversation_id' => $conv5->id, 'sender_id' => $student3->id, 'body' => 'Thanks everyone! Excited to start 🎉', 'created_at' => now()->subDays(5)->setHour(11)]);

        // --- 6. Professor ↔ Coordinator: Student progress ---
        $conv6 = Conversation::create(['subject' => 'Student progress — Sarah Chen']);
        ConversationParticipant::create(['conversation_id' => $conv6->id, 'user_id' => $demoProfessor->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv6->id, 'user_id' => $demoCoordinator->id, 'last_read_at' => now()]);
        Message::create(['conversation_id' => $conv6->id, 'sender_id' => $demoProfessor->id, 'body' => 'Lisa, I noticed Sarah Chen has completed 120 of her 200 required hours. She\'s ahead of schedule — any concerns from the site about her performance?', 'created_at' => now()->subDays(4)->setHour(14)]);
        Message::create(['conversation_id' => $conv6->id, 'sender_id' => $demoCoordinator->id, 'body' => 'No concerns at all. Dr. Wilson gave her excellent marks on her midpoint evaluation. She\'s one of our strongest students this semester.', 'created_at' => now()->subDays(4)->setHour(15)]);
        Message::create(['conversation_id' => $conv6->id, 'sender_id' => $demoProfessor->id, 'body' => 'Great to hear. I\'ll note that in my semester report. Thanks for the update!', 'created_at' => now()->subDays(4)->setHour(16)]);

        // --- 7. Site Manager ↔ Preceptor: Site logistics ---
        $conv7 = Conversation::create(['subject' => 'New student orientation — March cohort']);
        ConversationParticipant::create(['conversation_id' => $conv7->id, 'user_id' => $demoSiteManager->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv7->id, 'user_id' => $demoPreceptor->id, 'last_read_at' => now()]);
        ConversationParticipant::create(['conversation_id' => $conv7->id, 'user_id' => $preceptor2->id, 'last_read_at' => now()->subDays(1)]);
        Message::create(['conversation_id' => $conv7->id, 'sender_id' => $demoSiteManager->id, 'body' => 'Heads up — we have 4 new students starting March 3rd. I\'ve assigned 2 to Dr. Wilson (ER) and 2 to Dr. Brooks (Peds). Orientation is at 8 AM in Conference Room B.', 'created_at' => now()->subDays(8)->setHour(15)]);
        Message::create(['conversation_id' => $conv7->id, 'sender_id' => $demoPreceptor->id, 'body' => 'Confirmed. I\'ll prepare the ER orientation packet and have badge access set up by Friday.', 'created_at' => now()->subDays(8)->setHour(16)]);
        Message::create(['conversation_id' => $conv7->id, 'sender_id' => $preceptor2->id, 'body' => 'Same here — Peds orientation materials are ready. Maria, can you confirm the students have completed their onboarding checklists?', 'created_at' => now()->subDays(7)->setHour(9)]);
        Message::create(['conversation_id' => $conv7->id, 'sender_id' => $demoSiteManager->id, 'body' => 'Checking now... 3 of 4 are complete. I\'ll follow up with the remaining student today.', 'created_at' => now()->subDays(7)->setHour(10)]);

        // =====================================================================
        // 18. PRECEPTOR REVIEWS — students rating preceptors after rotations
        // =====================================================================

        // Jessica rates Dr. Okafor after completed IM rotation (excellent)
        PreceptorReview::create([
            'student_id' => $student7->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotInternalMed->id,
            'ratings' => [
                'teaching_quality' => 5,
                'clinical_knowledge' => 5,
                'communication' => 4,
                'availability' => 4,
                'feedback_quality' => 5,
                'professionalism' => 5,
                'learning_environment' => 5,
            ],
            'comments' => 'Dr. Okafor is an outstanding preceptor. She gave me increasing autonomy as I demonstrated competence. Her case presentations were incredibly educational. I feel well-prepared for my surgical rotation thanks to her mentorship.',
            'overall_score' => 4.7,
            'is_anonymous' => false,
        ]);

        // Emily rates Dr. Okafor after completed IM rotation (good)
        PreceptorReview::create([
            'student_id' => $student5->id,
            'preceptor_id' => $preceptor4->id,
            'slot_id' => $slotInternalMed->id,
            'ratings' => [
                'teaching_quality' => 4,
                'clinical_knowledge' => 5,
                'communication' => 4,
                'availability' => 3,
                'feedback_quality' => 4,
                'professionalism' => 5,
                'learning_environment' => 4,
            ],
            'comments' => 'Dr. Okafor is very knowledgeable and professional. Sometimes hard to reach on off-days, but always thorough during clinical hours. Would recommend to other students.',
            'overall_score' => 4.1,
            'is_anonymous' => false,
        ]);

        // Marcus rates Dr. Wilson after Peds rotation (very good)
        PreceptorReview::create([
            'student_id' => $student4->id,
            'preceptor_id' => $demoPreceptor->id,
            'slot_id' => $slotPeds->id,
            'ratings' => [
                'teaching_quality' => 4,
                'clinical_knowledge' => 5,
                'communication' => 5,
                'availability' => 5,
                'feedback_quality' => 4,
                'professionalism' => 5,
                'learning_environment' => 5,
            ],
            'comments' => 'Wonderful pediatric rotation. Dr. Wilson creates a supportive learning environment. Would have liked more autonomy with patient encounters, but overall an excellent experience.',
            'overall_score' => 4.7,
            'is_anonymous' => false,
        ]);

        // Aisha rates Dr. Wilson at MSW (anonymous review, constructive)
        PreceptorReview::create([
            'student_id' => $student3->id,
            'preceptor_id' => $demoPreceptor->id,
            'slot_id' => $slotMSW->id,
            'ratings' => [
                'teaching_quality' => 4,
                'clinical_knowledge' => 4,
                'communication' => 5,
                'availability' => 4,
                'feedback_quality' => 4,
                'professionalism' => 5,
                'learning_environment' => 4,
            ],
            'comments' => 'Good supervision and support. Very approachable. Provided quality feedback during weekly supervision sessions.',
            'overall_score' => 4.3,
            'is_anonymous' => true,
        ]);

        // =====================================================================
        // 19. MATCHING PREFERENCES — student search preferences for matching
        // =====================================================================

        // Demo student: wants ER or primary care in South FL, free only
        MatchingPreference::create([
            'user_id' => $demoStudent->id,
            'preferred_specialties' => ['Emergency Medicine', 'Family Practice', 'Urgent Care'],
            'preferred_states' => ['FL'],
            'preferred_cities' => ['Miami', 'Fort Lauderdale', 'Coral Gables'],
            'max_distance_miles' => 30,
            'preferred_schedule' => '3x12hr shifts/week',
            'cost_preference' => 'free_only',
            'min_preceptor_rating' => 4.0,
            'preferred_start_after' => '2026-03-01',
            'preferred_start_before' => '2026-06-01',
            'exclude_applied' => true,
        ]);

        // Student 2 (David): ICU/critical care, any cost
        MatchingPreference::create([
            'user_id' => $student2->id,
            'preferred_specialties' => ['ICU/Critical Care', 'Emergency Medicine', 'Medical-Surgical'],
            'preferred_states' => ['FL'],
            'preferred_cities' => ['Miami', 'Orlando', 'Tampa'],
            'max_distance_miles' => 50,
            'preferred_schedule' => '2x12hr shifts/week',
            'cost_preference' => 'any',
            'min_preceptor_rating' => 3.5,
            'preferred_start_after' => '2026-03-01',
            'preferred_start_before' => '2026-08-01',
            'exclude_applied' => true,
        ]);

        // Student 3 (Aisha): behavioral health, free only
        MatchingPreference::create([
            'user_id' => $student3->id,
            'preferred_specialties' => ['Clinical Social Work', 'Behavioral Health', 'Substance Abuse', 'Family Therapy'],
            'preferred_states' => ['FL'],
            'preferred_cities' => ['Fort Lauderdale', 'Miami', 'Jacksonville'],
            'max_distance_miles' => 40,
            'cost_preference' => 'free_only',
            'preferred_start_after' => '2026-03-01',
            'preferred_start_before' => '2026-09-01',
            'exclude_applied' => false,
        ]);

        // Student 4 (Marcus): pediatrics, any cost
        MatchingPreference::create([
            'user_id' => $student4->id,
            'preferred_specialties' => ['Pediatrics', 'Adolescent Health', 'Well-Child Care'],
            'preferred_states' => ['FL'],
            'preferred_cities' => ['Orlando', 'Tampa', 'Jacksonville'],
            'max_distance_miles' => 35,
            'cost_preference' => 'paid_ok',
            'min_preceptor_rating' => 4.0,
            'preferred_start_after' => '2026-03-01',
            'preferred_start_before' => '2026-06-01',
            'exclude_applied' => true,
        ]);

        // Student 5 (Emily): ER/ICU, nearing graduation
        MatchingPreference::create([
            'user_id' => $student5->id,
            'preferred_specialties' => ['Emergency Medicine', 'ICU/Critical Care', 'Urgent Care'],
            'preferred_states' => ['FL'],
            'preferred_cities' => ['Tampa', 'St. Petersburg', 'Orlando'],
            'max_distance_miles' => 25,
            'cost_preference' => 'free_only',
            'preferred_start_after' => '2026-04-01',
            'preferred_start_before' => '2026-07-01',
            'exclude_applied' => true,
        ]);

        // =====================================================================
        // 20. SAVED SEARCHES — for rotation search page
        // =====================================================================

        // Demo student: saved ER search
        SavedSearch::create([
            'user_id' => $demoStudent->id,
            'name' => 'ER Rotations in Miami',
            'filters' => [
                'specialty' => 'Emergency Medicine',
                'state' => 'FL',
                'city' => 'Miami',
                'cost_type' => 'free',
            ],
            'alerts_enabled' => true,
            'last_checked_at' => now()->subDays(1),
        ]);

        SavedSearch::create([
            'user_id' => $demoStudent->id,
            'name' => 'FNP Primary Care — South FL',
            'filters' => [
                'specialty' => 'Family Practice',
                'state' => 'FL',
                'cost_type' => 'any',
            ],
            'alerts_enabled' => true,
            'last_checked_at' => now()->subDays(3),
        ]);

        // Student 2: ICU search
        SavedSearch::create([
            'user_id' => $student2->id,
            'name' => 'ICU/Critical Care — FL',
            'filters' => [
                'specialty' => 'ICU/Critical Care',
                'state' => 'FL',
            ],
            'alerts_enabled' => true,
            'last_checked_at' => now()->subDays(2),
        ]);

        // Student 4: Peds search
        SavedSearch::create([
            'user_id' => $student4->id,
            'name' => 'Pediatric NP Rotations',
            'filters' => [
                'specialty' => 'Pediatrics',
                'state' => 'FL',
                'cost_type' => 'any',
            ],
            'alerts_enabled' => false,
        ]);

        // Student 5: urgent care search (alerts off)
        SavedSearch::create([
            'user_id' => $student5->id,
            'name' => 'Urgent Care — Tampa Area',
            'filters' => [
                'specialty' => 'Urgent Care',
                'state' => 'FL',
                'city' => 'Tampa',
            ],
            'alerts_enabled' => false,
        ]);

        // =====================================================================
        // 21. SLOT BOOKMARKS — students bookmarking interesting rotations
        // =====================================================================

        // Demo student bookmarks
        SlotBookmark::create(['user_id' => $demoStudent->id, 'slot_id' => $slotED->id]);
        SlotBookmark::create(['user_id' => $demoStudent->id, 'slot_id' => $slotUrgent->id]);
        SlotBookmark::create(['user_id' => $demoStudent->id, 'slot_id' => $slotPsych->id]);

        // Student 2 bookmarks
        SlotBookmark::create(['user_id' => $student2->id, 'slot_id' => $slotED->id]);
        SlotBookmark::create(['user_id' => $student2->id, 'slot_id' => $slotSurgery->id]);

        // Student 3 bookmarks
        SlotBookmark::create(['user_id' => $student3->id, 'slot_id' => $slotMSW->id]);

        // Student 4 bookmarks
        SlotBookmark::create(['user_id' => $student4->id, 'slot_id' => $slotPeds->id]);
        SlotBookmark::create(['user_id' => $student4->id, 'slot_id' => $slotPsych->id]);

        // Student 5 bookmarks
        SlotBookmark::create(['user_id' => $student5->id, 'slot_id' => $slotED->id]);
        SlotBookmark::create(['user_id' => $student5->id, 'slot_id' => $slotUrgent->id]);
        SlotBookmark::create(['user_id' => $student5->id, 'slot_id' => $slotICU->id]);

        // =====================================================================
        // 22. EVALUATION TEMPLATES — custom rubrics per university
        // =====================================================================

        // UMiami — comprehensive mid-rotation template
        EvaluationTemplate::create([
            'university_id' => $umiami->id,
            'type' => 'mid_rotation',
            'name' => 'UMiami Nursing Mid-Rotation Evaluation',
            'categories' => [
                ['name' => 'Clinical Knowledge', 'description' => 'Understanding of relevant clinical concepts and ability to apply them', 'weight' => 20],
                ['name' => 'Assessment Skills', 'description' => 'Ability to perform thorough, accurate patient assessments', 'weight' => 20],
                ['name' => 'Communication', 'description' => 'Effective communication with patients, families, and healthcare team', 'weight' => 15],
                ['name' => 'Professionalism', 'description' => 'Professional behavior, appearance, punctuality, and ethical conduct', 'weight' => 15],
                ['name' => 'Critical Thinking', 'description' => 'Clinical reasoning and problem-solving ability', 'weight' => 15],
                ['name' => 'Documentation', 'description' => 'Accuracy, timeliness, and completeness of clinical documentation', 'weight' => 10],
                ['name' => 'Time Management', 'description' => 'Ability to prioritize tasks and manage clinical workload', 'weight' => 5],
            ],
            'is_active' => true,
            'created_by' => $demoCoordinator->id,
        ]);

        // UMiami — final evaluation template
        EvaluationTemplate::create([
            'university_id' => $umiami->id,
            'type' => 'final',
            'name' => 'UMiami Nursing Final Rotation Evaluation',
            'categories' => [
                ['name' => 'Clinical Knowledge', 'description' => 'Mastery of clinical concepts for this rotation specialty', 'weight' => 20],
                ['name' => 'Assessment Skills', 'description' => 'Independent ability to perform comprehensive assessments', 'weight' => 20],
                ['name' => 'Communication', 'description' => 'Therapeutic communication and interprofessional collaboration', 'weight' => 15],
                ['name' => 'Professionalism', 'description' => 'Consistent professionalism throughout the rotation', 'weight' => 10],
                ['name' => 'Critical Thinking', 'description' => 'Evidence-based clinical reasoning and decision-making', 'weight' => 15],
                ['name' => 'Documentation', 'description' => 'Meet documentation standards independently', 'weight' => 10],
                ['name' => 'Leadership', 'description' => 'Initiative, self-directed learning, and peer mentoring', 'weight' => 10],
            ],
            'is_active' => true,
            'created_by' => $demoCoordinator->id,
        ]);

        // UMiami — student feedback template
        EvaluationTemplate::create([
            'university_id' => $umiami->id,
            'type' => 'student_feedback',
            'name' => 'UMiami Student Rotation Feedback Form',
            'categories' => [
                ['name' => 'Teaching Quality', 'description' => 'Quality of clinical teaching and instruction', 'weight' => 20],
                ['name' => 'Availability', 'description' => 'Preceptor availability for questions and guidance', 'weight' => 15],
                ['name' => 'Feedback Quality', 'description' => 'Constructive, timely, and actionable feedback', 'weight' => 20],
                ['name' => 'Learning Environment', 'description' => 'Supportive and safe learning environment', 'weight' => 15],
                ['name' => 'Clinical Exposure', 'description' => 'Variety and volume of clinical experiences', 'weight' => 15],
                ['name' => 'Autonomy', 'description' => 'Appropriate level of graduated autonomy', 'weight' => 15],
            ],
            'is_active' => true,
            'created_by' => $demoCoordinator->id,
        ]);

        // FIU — PA program mid-rotation
        EvaluationTemplate::create([
            'university_id' => $fiu->id,
            'type' => 'mid_rotation',
            'name' => 'FIU PA Program Mid-Rotation Assessment',
            'categories' => [
                ['name' => 'Medical Knowledge', 'description' => 'Understanding of pathophysiology, pharmacology, and clinical medicine', 'weight' => 25],
                ['name' => 'Patient Care', 'description' => 'History taking, physical examination, and patient management', 'weight' => 25],
                ['name' => 'Interpersonal Skills', 'description' => 'Communication with patients, families, and team', 'weight' => 15],
                ['name' => 'Professionalism', 'description' => 'Ethics, reliability, and professional conduct', 'weight' => 15],
                ['name' => 'Systems-Based Practice', 'description' => 'Understanding of healthcare systems and quality improvement', 'weight' => 10],
                ['name' => 'Practice-Based Learning', 'description' => 'Self-assessment, lifelong learning, evidence-based practice', 'weight' => 10],
            ],
            'is_active' => true,
            'created_by' => $coordinator2->id,
        ]);

        // Nova — MSW field practicum template (inactive old version)
        EvaluationTemplate::create([
            'university_id' => $nova->id,
            'type' => 'mid_rotation',
            'name' => 'Nova MSW Field Practicum Evaluation (2024 — Retired)',
            'categories' => [
                ['name' => 'Therapeutic Skills', 'weight' => 30],
                ['name' => 'Cultural Competency', 'weight' => 20],
                ['name' => 'Documentation', 'weight' => 20],
                ['name' => 'Professionalism', 'weight' => 30],
            ],
            'is_active' => false,
            'created_by' => $professor2->id,
        ]);

        // =====================================================================
        // 23. AGREEMENT TEMPLATES — reusable agreement boilerplates
        // =====================================================================

        AgreementTemplate::create([
            'university_id' => $umiami->id,
            'name' => 'Standard Clinical Affiliation Agreement',
            'description' => 'Standard 2-year affiliation agreement template for nursing programs (BSN, MSN, DNP). Includes standard liability, HIPAA, and student conduct provisions.',
            'default_notes' => 'This agreement covers clinical rotation placements for University of Miami School of Nursing students. Maximum student capacity to be specified per site.',
            'created_by' => $demoCoordinator->id,
        ]);

        AgreementTemplate::create([
            'university_id' => $umiami->id,
            'name' => 'DNP Acute Care Addendum',
            'description' => 'Supplemental agreement for DNP acute care rotations requiring additional liability coverage and procedural privileges.',
            'default_notes' => 'This addendum supplements the standard affiliation agreement with additional provisions for acute care clinical experiences.',
            'created_by' => $demoCoordinator->id,
        ]);

        AgreementTemplate::create([
            'university_id' => $fiu->id,
            'name' => 'PA Program Clinical Rotation Agreement',
            'description' => 'Standard agreement for FIU Physician Assistant program clinical rotations. Covers surgical, medical, and specialty rotations.',
            'default_notes' => 'Agreement for FIU Herbert Wertheim College of Medicine PA Studies program. Students require ACLS certification for ED and surgical rotations.',
            'created_by' => $coordinator2->id,
        ]);

        AgreementTemplate::create([
            'university_id' => $nova->id,
            'name' => 'MSW Field Practicum Agreement',
            'description' => 'Standard agreement for Nova Southeastern University Master of Social Work field practicum placements.',
            'default_notes' => 'MSW field practicum placement agreement. Students supervised by licensed clinical social worker (LCSW) on site.',
        ]);

        // =====================================================================
        // 24. E-SIGNATURES — on affiliation agreements
        // =====================================================================

        // Get the first active UMiami-Mercy agreement for signatures
        $agreementUmiamiMercy = AffiliationAgreement::where('university_id', $umiami->id)
            ->where('site_id', $mercyGeneral->id)
            ->where('status', 'active')
            ->first();

        if ($agreementUmiamiMercy) {
            // University coordinator signed
            Signature::create([
                'signable_type' => 'App\\Models\\AffiliationAgreement',
                'signable_id' => $agreementUmiamiMercy->id,
                'signer_role' => 'university',
                'signer_name' => 'Lisa Thompson',
                'signer_email' => 'coordinator@cliniclink.health',
                'signer_id' => $demoCoordinator->id,
                'requested_by' => $demoCoordinator->id,
                'status' => 'signed',
                'signature_data' => 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiPjx0ZXh0IHg9IjEwIiB5PSIzNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMwMDAiPkxpc2EgVGhvbXBzb248L3RleHQ+PC9zdmc+',
                'ip_address' => '198.51.100.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'request_message' => 'Please review and sign the clinical affiliation agreement for Mercy General Hospital.',
                'requested_at' => '2025-07-15 09:00:00',
                'signed_at' => '2025-07-16 10:30:00',
            ]);

            // Site manager signed
            Signature::create([
                'signable_type' => 'App\\Models\\AffiliationAgreement',
                'signable_id' => $agreementUmiamiMercy->id,
                'signer_role' => 'site',
                'signer_name' => 'Maria Garcia',
                'signer_email' => 'site@cliniclink.health',
                'signer_id' => $demoSiteManager->id,
                'requested_by' => $demoCoordinator->id,
                'status' => 'signed',
                'signature_data' => 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiPjx0ZXh0IHg9IjEwIiB5PSIzNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMwMDAiPk1hcmlhIEdhcmNpYTwvdGV4dD48L3N2Zz4=',
                'ip_address' => '203.0.113.5',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'requested_at' => '2025-07-15 09:00:00',
                'signed_at' => '2025-07-18 14:00:00',
            ]);
        }

        // Pending signature request on the UMiami-St Pete pending agreement
        $agreementUmiamiStPete = AffiliationAgreement::where('university_id', $umiami->id)
            ->where('site_id', $stPeteMedical->id)
            ->where('status', 'pending_review')
            ->first();

        if ($agreementUmiamiStPete) {
            // University side signed
            Signature::create([
                'signable_type' => 'App\\Models\\AffiliationAgreement',
                'signable_id' => $agreementUmiamiStPete->id,
                'signer_role' => 'university',
                'signer_name' => 'Lisa Thompson',
                'signer_email' => 'coordinator@cliniclink.health',
                'signer_id' => $demoCoordinator->id,
                'requested_by' => $demoCoordinator->id,
                'status' => 'signed',
                'signature_data' => 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiPjx0ZXh0IHg9IjEwIiB5PSIzNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMwMDAiPkxpc2EgVGhvbXBzb248L3RleHQ+PC9zdmc+',
                'ip_address' => '198.51.100.1',
                'requested_at' => '2026-02-01 10:00:00',
                'signed_at' => '2026-02-01 10:15:00',
            ]);

            // Site side: still requested (awaiting signature)
            Signature::create([
                'signable_type' => 'App\\Models\\AffiliationAgreement',
                'signable_id' => $agreementUmiamiStPete->id,
                'signer_role' => 'site',
                'signer_name' => 'David Rodriguez',
                'signer_email' => 'david.rodriguez@stpete-medical.com',
                'signer_id' => $siteManager2->id,
                'requested_by' => $demoCoordinator->id,
                'status' => 'requested',
                'request_message' => 'Please review and sign the new affiliation agreement for DNP acute care rotations at St. Petersburg Medical Center.',
                'requested_at' => '2026-02-01 10:00:00',
            ]);
        }

        // =====================================================================
        // 25. STUDENT INVITES — university coordinators inviting students
        // =====================================================================

        // UMiami coordinator invites
        StudentInvite::create([
            'university_id' => $umiami->id,
            'program_id' => $bsnMiami->id,
            'invited_by' => $demoCoordinator->id,
            'token' => Str::random(64),
            'email' => 'newstudent1@miami.edu',
            'status' => 'pending',
            'expires_at' => '2026-03-31 23:59:59',
        ]);

        StudentInvite::create([
            'university_id' => $umiami->id,
            'program_id' => $msnFnpMiami->id,
            'invited_by' => $demoCoordinator->id,
            'token' => Str::random(64),
            'email' => 'newstudent2@miami.edu',
            'status' => 'pending',
            'expires_at' => '2026-03-31 23:59:59',
        ]);

        // Accepted student invite (Sarah was invited)
        StudentInvite::create([
            'university_id' => $umiami->id,
            'program_id' => $msnFnpMiami->id,
            'invited_by' => $demoCoordinator->id,
            'token' => Str::random(64),
            'email' => 'student@cliniclink.health',
            'status' => 'accepted',
            'accepted_by' => $demoStudent->id,
            'accepted_at' => '2025-12-15 14:00:00',
            'expires_at' => '2026-01-15 23:59:59',
        ]);

        // FIU coordinator invite (open — no email)
        StudentInvite::create([
            'university_id' => $fiu->id,
            'program_id' => $paFiu->id,
            'invited_by' => $coordinator2->id,
            'token' => Str::random(64),
            'email' => null,
            'status' => 'pending',
            'expires_at' => '2026-04-30 23:59:59',
        ]);

        // Expired invite
        StudentInvite::create([
            'university_id' => $nova->id,
            'program_id' => $mswNova->id,
            'invited_by' => $professor2->id,
            'token' => Str::random(64),
            'email' => 'expired.student@nova.edu',
            'status' => 'pending',
            'expires_at' => '2025-12-31 23:59:59',
        ]);

        // =====================================================================
        // 26. SITE JOIN REQUESTS — preceptors requesting to join sites
        // =====================================================================

        // Approved request: Dr. Nguyen joined Coastal Rehab
        SiteJoinRequest::create([
            'site_id' => $coastalRehab->id,
            'preceptor_id' => $preceptor3->id,
            'message' => 'I am an emergency medicine physician with rehabilitation medicine interests. I would like to precept PT/OT students at Coastal Rehab to support interdisciplinary education.',
            'status' => 'approved',
            'reviewed_by' => $demoSiteManager->id,
            'reviewed_at' => '2026-01-20 14:00:00',
            'review_notes' => 'Approved. Credentials verified. Welcome to the team.',
        ]);

        // Pending request: new preceptor wants to join Mercy
        SiteJoinRequest::create([
            'site_id' => $mercyGeneral->id,
            'preceptor_id' => $preceptor3->id,
            'message' => 'I have 12 years of emergency medicine experience and would like to precept nursing and PA students at Mercy General. I am board-certified and currently practicing at a nearby facility.',
            'status' => 'pending',
        ]);

        // Rejected request: inactive preceptor tried to join St Pete
        SiteJoinRequest::create([
            'site_id' => $stPeteMedical->id,
            'preceptor_id' => $preceptor5->id,
            'message' => 'I am interested in returning to precepting after my retirement.',
            'status' => 'rejected',
            'reviewed_by' => $siteManager2->id,
            'reviewed_at' => '2026-01-10 11:00:00',
            'review_notes' => 'Thank you for your interest. We require active clinical practice for preceptors. Please reapply if you return to practice.',
        ]);

        // =====================================================================
        // 27. ANALYTICS SNAPSHOTS — historical platform metrics
        // =====================================================================

        // Platform-level daily snapshots (last 7 days)
        foreach (range(7, 1) as $daysAgo) {
            AnalyticsSnapshot::create([
                'type' => 'platform',
                'entity_id' => null,
                'period' => 'daily',
                'date' => now()->subDays($daysAgo)->toDateString(),
                'metrics' => [
                    'total_users' => 24 + (7 - $daysAgo) * 2,
                    'active_users' => 18 + (7 - $daysAgo),
                    'total_applications' => 20 + (7 - $daysAgo) * 3,
                    'accepted_applications' => 10 + (7 - $daysAgo),
                    'total_hours_logged' => 380 + (7 - $daysAgo) * 45,
                    'hours_approved' => 310 + (7 - $daysAgo) * 38,
                    'total_evaluations' => 8 + (7 - $daysAgo),
                    'certificates_issued' => 3 + intdiv(7 - $daysAgo, 2),
                    'new_registrations' => rand(1, 4),
                    'messages_sent' => 15 + (7 - $daysAgo) * 5,
                ],
                'created_at' => now()->subDays($daysAgo)->setHour(1),
            ]);
        }

        // Platform-level monthly snapshots (last 3 months)
        foreach (range(3, 1) as $monthsAgo) {
            AnalyticsSnapshot::create([
                'type' => 'platform',
                'entity_id' => null,
                'period' => 'monthly',
                'date' => now()->subMonths($monthsAgo)->startOfMonth()->toDateString(),
                'metrics' => [
                    'total_users' => 15 + (3 - $monthsAgo) * 8,
                    'active_users' => 12 + (3 - $monthsAgo) * 6,
                    'total_applications' => 8 + (3 - $monthsAgo) * 12,
                    'accepted_applications' => 4 + (3 - $monthsAgo) * 5,
                    'placement_rate' => 45 + (3 - $monthsAgo) * 8,
                    'avg_time_to_place_days' => 14 - (3 - $monthsAgo) * 2,
                    'total_hours_logged' => 200 + (3 - $monthsAgo) * 180,
                    'total_revenue' => 0,
                    'new_sites' => 2 + (3 - $monthsAgo),
                    'new_universities' => 1 + intdiv(3 - $monthsAgo, 2),
                ],
                'created_at' => now()->subMonths($monthsAgo)->startOfMonth()->setHour(2),
            ]);
        }

        // University-level snapshots (UMiami)
        AnalyticsSnapshot::create([
            'type' => 'university',
            'entity_id' => $umiami->id,
            'period' => 'monthly',
            'date' => now()->subMonth()->startOfMonth()->toDateString(),
            'metrics' => [
                'total_students' => 3,
                'placed_students' => 2,
                'placement_rate' => 67,
                'avg_hours_per_student' => 42,
                'total_applications' => 8,
                'accepted_applications' => 3,
                'active_agreements' => 2,
                'expiring_agreements' => 0,
                'compliance_rate' => 85,
            ],
            'created_at' => now()->subMonth()->startOfMonth()->setHour(2),
        ]);

        // Site-level snapshot (Mercy General)
        AnalyticsSnapshot::create([
            'type' => 'site',
            'entity_id' => $mercyGeneral->id,
            'period' => 'monthly',
            'date' => now()->subMonth()->startOfMonth()->toDateString(),
            'metrics' => [
                'total_slots' => 3,
                'open_slots' => 1,
                'total_applications' => 6,
                'accepted_students' => 3,
                'avg_student_rating' => 4.4,
                'total_hours_logged' => 156,
                'preceptors_active' => 2,
                'occupancy_rate' => 75,
            ],
            'created_at' => now()->subMonth()->startOfMonth()->setHour(2),
        ]);

        // =====================================================================
        // 28. NOTIFICATIONS — populate the bell icon for demo users
        // =====================================================================

        // Using raw DB inserts for notifications to avoid triggering mail
        $notifications = [
            // Demo student notifications
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\ApplicationReviewedNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoStudent->id,
                'data' => json_encode([
                    'message' => 'Your application for Family NP Primary Care Rotation at Sunshine Family Health Center has been accepted!',
                    'application_id' => $appSarahFNP->id,
                    'status' => 'accepted',
                    'slot_title' => 'Family NP Primary Care Rotation',
                    'site_name' => 'Sunshine Family Health Center',
                ]),
                'read_at' => now()->subDays(10),
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\HourLogReviewedNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoStudent->id,
                'data' => json_encode([
                    'message' => 'Your hour log for Feb 3 (8 hours, direct care) has been approved by Dr. Wilson.',
                    'status' => 'approved',
                    'date' => '2026-02-03',
                    'hours' => 8,
                ]),
                'read_at' => now()->subDays(8),
                'created_at' => now()->subDays(9),
                'updated_at' => now()->subDays(9),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\HourLogReviewedNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoStudent->id,
                'data' => json_encode([
                    'message' => 'Your hour log for Feb 2 (12 hours) was rejected. Reason: Hours exceed maximum allowed per shift.',
                    'status' => 'rejected',
                    'date' => '2026-02-02',
                    'hours' => 12,
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\NewMessageNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoStudent->id,
                'data' => json_encode([
                    'message' => 'New message from Dr. Wilson in "Question about ER rotation schedule"',
                    'sender_name' => 'James Wilson',
                    'conversation_subject' => 'Question about ER rotation schedule',
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
            ],

            // Demo preceptor notifications
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\HourLogSubmittedNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoPreceptor->id,
                'data' => json_encode([
                    'message' => 'Sarah Chen submitted 8 hours (direct care) for Feb 6 at Family NP Primary Care Rotation.',
                    'student_name' => 'Sarah Chen',
                    'date' => '2026-02-06',
                    'hours' => 8,
                    'slot_title' => 'Family NP Primary Care Rotation',
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(6),
                'updated_at' => now()->subDays(6),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\HourLogSubmittedNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoPreceptor->id,
                'data' => json_encode([
                    'message' => 'Sarah Chen submitted 4 hours (simulation) for Feb 7 at Family NP Primary Care Rotation.',
                    'student_name' => 'Sarah Chen',
                    'date' => '2026-02-07',
                    'hours' => 4,
                    'slot_title' => 'Family NP Primary Care Rotation',
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],

            // Demo site manager notifications
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\NewApplicationNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoSiteManager->id,
                'data' => json_encode([
                    'message' => 'New application from Sarah Chen for Emergency Department - NP Clinical Rotation.',
                    'student_name' => 'Sarah Chen',
                    'slot_title' => 'Emergency Department - NP Clinical Rotation',
                    'site_name' => 'Mercy General Hospital',
                ]),
                'read_at' => now()->subDays(11),
                'created_at' => now()->subDays(14),
                'updated_at' => now()->subDays(14),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\NewApplicationNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoSiteManager->id,
                'data' => json_encode([
                    'message' => 'New application from Emily Torres for Emergency Department - NP Clinical Rotation.',
                    'student_name' => 'Emily Torres',
                    'slot_title' => 'Emergency Department - NP Clinical Rotation',
                    'site_name' => 'Mercy General Hospital',
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7),
            ],

            // Demo coordinator notifications
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\NewMessageNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoCoordinator->id,
                'data' => json_encode([
                    'message' => 'New message from Prof. Martinez about "Student progress — Sarah Chen"',
                    'sender_name' => 'Robert Martinez',
                    'conversation_subject' => 'Student progress — Sarah Chen',
                ]),
                'read_at' => now()->subDays(3),
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
            ],

            // Demo admin notifications
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\NewUserRegisteredNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoAdmin->id,
                'data' => json_encode([
                    'message' => 'New user registered: Kenji Tanaka (student) from Nova Southeastern University.',
                    'user_name' => 'Kenji Tanaka',
                    'role' => 'student',
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\\Notifications\\SiteJoinRequestNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $demoAdmin->id,
                'data' => json_encode([
                    'message' => 'Dr. Michael Nguyen has requested to join Mercy General Hospital as a preceptor.',
                    'preceptor_name' => 'Michael Nguyen',
                    'site_name' => 'Mercy General Hospital',
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
        ];

        DB::table('notifications')->insert($notifications);

        // ================================================================
        // === SECTION 29: STRIPE CONNECT & PAYMENT DATA ===
        // ================================================================

        // Give site managers Stripe Connect accounts (fake IDs for demo)
        $demoSiteManager->update([
            'stripe_account_id' => 'acct_demo_mariagarcia',
            'stripe_onboarded' => true,
        ]);
        $siteManager2->update([
            'stripe_account_id' => 'acct_demo_davidrodriguez',
            'stripe_onboarded' => true,
        ]);

        // Give demo student a Pro subscription
        $demoStudent->update([
            'plan' => 'pro',
            'stripe_customer_id' => 'cus_demo_sarahchen',
            'stripe_subscription_id' => 'sub_demo_sarahchen_pro',
            'subscription_status' => 'active',
            'trial_ends_at' => now()->subDays(14), // trial already ended
        ]);

        // Give another student free tier with trial
        $student2->update([
            'plan' => 'free',
            'stripe_customer_id' => 'cus_demo_davidkim',
            'trial_ends_at' => now()->addDays(7),
            'free_rotations_used' => 2,
        ]);

        // Payment 1: Sarah paid for FNP rotation ($500) — completed
        $paymentSarahFNP = Payment::create([
            'payer_id' => $demoStudent->id,
            'payee_id' => $demoSiteManager->id,
            'application_id' => $appSarahFNP->id,
            'slot_id' => $slotFNP->id,
            'amount' => 500.00,
            'platform_fee' => 50.00,
            'currency' => 'usd',
            'stripe_payment_intent_id' => 'pi_demo_sarah_fnp_' . Str::random(10),
            'stripe_transfer_id' => 'tr_demo_sarah_fnp_' . Str::random(10),
            'status' => 'completed',
            'paid_at' => now()->subDays(30),
            'metadata' => ['slot_title' => 'Family NP Primary Care Rotation', 'site_name' => 'Orlando Health Family Medicine'],
        ]);
        $appSarahFNP->update(['payment_status' => 'paid', 'payment_id' => $paymentSarahFNP->id]);

        // Payment 2: Emily paid for Urgent Care rotation ($250) — completed
        $paymentEmilyUrgent = Payment::create([
            'payer_id' => $student5->id,
            'payee_id' => $demoSiteManager->id,
            'application_id' => $appEmilyUrgent->id,
            'slot_id' => $slotUrgent->id,
            'amount' => 250.00,
            'platform_fee' => 25.00,
            'currency' => 'usd',
            'stripe_payment_intent_id' => 'pi_demo_emily_urgent_' . Str::random(10),
            'stripe_transfer_id' => 'tr_demo_emily_urgent_' . Str::random(10),
            'status' => 'completed',
            'paid_at' => now()->subDays(15),
            'metadata' => ['slot_title' => 'Urgent Care NP Clinical', 'site_name' => 'MinuteClinic South Orlando'],
        ]);
        $appEmilyUrgent->update(['payment_status' => 'paid', 'payment_id' => $paymentEmilyUrgent->id]);

        // Payment 3: Marcus pending for Psych rotation ($1,200) — pending
        Payment::create([
            'payer_id' => $student4->id,
            'payee_id' => $siteManager2->id,
            'application_id' => $appMarcusPsych->id,
            'slot_id' => $slotPsych->id,
            'amount' => 1200.00,
            'platform_fee' => 120.00,
            'currency' => 'usd',
            'stripe_payment_intent_id' => 'pi_demo_marcus_psych_' . Str::random(10),
            'status' => 'pending',
            'metadata' => ['slot_title' => 'Psychiatric Mental Health NP Rotation', 'site_name' => 'Behavioral Health Associates'],
        ]);

        // Payment 4: A refunded payment (Jessica's completed IM rotation)
        $paymentJessicaIM = Payment::create([
            'payer_id' => $student7->id,
            'payee_id' => $demoSiteManager->id,
            'application_id' => $appJessicaIM->id,
            'slot_id' => $slotInternalMed->id,
            'amount' => 350.00,
            'platform_fee' => 35.00,
            'currency' => 'usd',
            'stripe_payment_intent_id' => 'pi_demo_jessica_im_' . Str::random(10),
            'stripe_transfer_id' => 'tr_demo_jessica_im_' . Str::random(10),
            'status' => 'refunded',
            'paid_at' => now()->subDays(45),
            'refunded_at' => now()->subDays(10),
            'metadata' => ['slot_title' => 'Internal Medicine PA Rotation', 'site_name' => 'Orlando Health', 'refund_reason' => 'Schedule conflict — rotation rescheduled'],
        ]);

        // =====================================================================
        // STATE RULES — Collaborate module
        // =====================================================================
        $this->call(StateRulesSeeder::class);
    }
}
