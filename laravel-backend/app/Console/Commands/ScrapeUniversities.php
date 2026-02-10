<?php

namespace App\Console\Commands;

use App\Models\Program;
use App\Models\University;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ScrapeUniversities extends Command
{
    protected $signature = 'scrape:universities
        {--source=scorecard : Data source (scorecard or curated)}
        {--api-key= : College Scorecard API key (get free at api.data.gov)}
        {--state= : Filter by state (e.g. FL, TX, NY)}
        {--limit=50 : Max universities to fetch}
        {--with-programs : Also create healthcare programs for each university}
        {--dry-run : Preview without saving to database}';

    protected $description = 'Scrape healthcare/nursing universities from public data sources';

    private int $created = 0;
    private int $skipped = 0;
    private int $programsCreated = 0;

    public function handle(): int
    {
        $source = $this->option('source');
        $dryRun = $this->option('dry-run');

        $this->info("=== ClinicLink University Scraper ===");
        $this->info("Source: {$source}" . ($dryRun ? ' (DRY RUN)' : ''));
        $this->newLine();

        $universities = match ($source) {
            'scorecard' => $this->fetchFromScorecard(),
            'curated' => $this->getCuratedData(),
            default => $this->error("Unknown source: {$source}") ?? [],
        };

        if (empty($universities)) {
            $this->warn('No universities fetched. Try --source=curated for offline data.');
            return self::FAILURE;
        }

        $this->info("Found " . count($universities) . " universities to process.");
        $this->newLine();

        $bar = $this->output->createProgressBar(count($universities));
        $bar->start();

        foreach ($universities as $uniData) {
            $this->processUniversity($uniData, $dryRun);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Results:");
        $this->table(
            ['Metric', 'Count'],
            [
                ['Universities Created', $this->created],
                ['Universities Skipped (already exist)', $this->skipped],
                ['Programs Created', $this->programsCreated],
            ]
        );

        return self::SUCCESS;
    }

    private function fetchFromScorecard(): array
    {
        $apiKey = $this->option('api-key') ?: env('SCORECARD_API_KEY', 'YOUR_API_KEY');

        if ($apiKey === 'YOUR_API_KEY') {
            $this->warn('No College Scorecard API key provided.');
            $this->warn('Get a free key at: https://api.data.gov/signup/');
            $this->warn('Usage: php artisan scrape:universities --api-key=YOUR_KEY');
            $this->newLine();

            if ($this->confirm('Fall back to curated dataset instead?', true)) {
                return $this->getCuratedData();
            }
            return [];
        }

        $this->info("Fetching from College Scorecard API...");

        $limit = (int) $this->option('limit');
        $state = $this->option('state');
        $universities = [];
        $page = 0;
        $perPage = min($limit, 100);

        // CIP codes for health-related programs
        // 51 = Health Professions, 51.38 = Nursing, 51.09 = Allied Health
        $healthCipCodes = ['51'];

        while (count($universities) < $limit) {
            $params = [
                'api_key' => $apiKey,
                'fields' => implode(',', [
                    'school.name',
                    'school.city',
                    'school.state',
                    'school.zip',
                    'school.school_url',
                    'school.address',
                    'school.accreditor',
                    'school.ownership',
                    'latest.programs.cip_4_digit',
                ]),
                'school.degrees_awarded.predominant' => '3', // Bachelor's
                'school.operating' => 1,
                'school.main_campus' => 1,
                'per_page' => $perPage,
                'page' => $page,
                '_per_page' => $perPage,
            ];

            if ($state) {
                $params['school.state'] = $state;
            }

            // Filter for schools with health programs
            $params['latest.programs.cip_4_digit.code__range'] = '5100..5199';

            try {
                $response = Http::timeout(30)
                    ->get('https://api.data.gov/ed/collegescorecard/v1/schools', $params);

                if ($response->failed()) {
                    $this->error("API request failed: " . $response->status());
                    Log::error('Scorecard API error', ['status' => $response->status(), 'body' => $response->body()]);
                    break;
                }

                $data = $response->json();
                $results = $data['results'] ?? [];

                if (empty($results)) {
                    break;
                }

                foreach ($results as $school) {
                    if (count($universities) >= $limit) break;

                    $mapped = $this->mapScorecardSchool($school);
                    if ($mapped) {
                        $universities[] = $mapped;
                    }
                }

                $page++;

                // Rate limiting
                usleep(200000); // 200ms between requests

            } catch (\Exception $e) {
                $this->error("API error: " . $e->getMessage());
                Log::error('Scorecard scrape error', ['error' => $e->getMessage()]);
                break;
            }
        }

        $this->info("Fetched " . count($universities) . " universities from College Scorecard.");
        return $universities;
    }

    private function mapScorecardSchool(array $school): ?array
    {
        $name = $school['school.name'] ?? null;
        if (!$name) return null;

        // Extract health program info from CIP codes
        $programs = [];
        $cipPrograms = $school['latest.programs.cip_4_digit'] ?? [];

        foreach ($cipPrograms as $cip) {
            $code = $cip['code'] ?? '';
            $title = $cip['title'] ?? '';

            // Map CIP codes to our degree types
            if (str_starts_with($code, '5138') || str_starts_with($code, '5116')) {
                $programs[] = ['name' => $title ?: 'Nursing Program', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']];
            } elseif (str_starts_with($code, '5109')) {
                $programs[] = ['name' => $title ?: 'Allied Health', 'degree_type' => 'other', 'required_hours' => 500, 'specialties' => ['Allied Health']];
            } elseif (str_starts_with($code, '5120')) {
                $programs[] = ['name' => $title ?: 'Pharmacy Program', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Pharmacy']];
            } elseif (str_starts_with($code, '5123')) {
                $programs[] = ['name' => $title ?: 'Rehabilitation Sciences', 'degree_type' => 'DPT', 'required_hours' => 1200, 'specialties' => ['Physical Therapy']];
            } elseif (str_starts_with($code, '5115')) {
                $programs[] = ['name' => $title ?: 'Mental Health Services', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Behavioral Health']];
            }
        }

        // If no specific programs found, add a generic nursing program
        if (empty($programs)) {
            $programs[] = ['name' => 'Health Professions Program', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']];
        }

        $website = $school['school.school_url'] ?? null;
        if ($website && !str_starts_with($website, 'http')) {
            $website = 'https://' . $website;
        }

        return [
            'name' => $name,
            'address' => $school['school.address'] ?? '',
            'city' => $school['school.city'] ?? '',
            'state' => $school['school.state'] ?? '',
            'zip' => $school['school.zip'] ?? '',
            'phone' => null,
            'website' => $website,
            'is_verified' => false,
            'programs' => $programs,
        ];
    }

    private function processUniversity(array $data, bool $dryRun): void
    {
        $exists = University::where('name', $data['name'])
            ->where('state', $data['state'])
            ->exists();

        if ($exists) {
            $this->skipped++;
            return;
        }

        if ($dryRun) {
            $this->created++;
            $programCount = count($data['programs'] ?? []);
            $this->programsCreated += $programCount;
            return;
        }

        $university = University::create([
            'name' => $data['name'],
            'address' => $data['address'],
            'city' => $data['city'],
            'state' => $data['state'],
            'zip' => $data['zip'],
            'phone' => $data['phone'],
            'website' => $data['website'],
            'is_verified' => $data['is_verified'] ?? false,
        ]);

        $this->created++;

        if ($this->option('with-programs') && !empty($data['programs'])) {
            foreach ($data['programs'] as $prog) {
                Program::create([
                    'university_id' => $university->id,
                    'name' => $prog['name'],
                    'degree_type' => $prog['degree_type'],
                    'required_hours' => $prog['required_hours'],
                    'specialties' => $prog['specialties'] ?? [],
                    'is_active' => true,
                ]);
                $this->programsCreated++;
            }
        }
    }

    private function getCuratedData(): array
    {
        $state = $this->option('state');
        $limit = (int) $this->option('limit');

        $this->info("Loading curated healthcare university dataset...");

        $all = $this->curatedUniversities();

        if ($state) {
            $all = array_filter($all, fn($u) => $u['state'] === strtoupper($state));
            $all = array_values($all);
        }

        return array_slice($all, 0, $limit);
    }

    private function curatedUniversities(): array
    {
        return [
            // === FLORIDA ===
            [
                'name' => 'Barry University',
                'address' => '11300 NE 2nd Ave',
                'city' => 'Miami Shores',
                'state' => 'FL',
                'zip' => '33161',
                'phone' => '(305) 899-3000',
                'website' => 'https://www.barry.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Community Health']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Behavioral Health']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Advanced Practice', 'Leadership']],
                ],
            ],
            [
                'name' => 'Jacksonville University',
                'address' => '2800 University Blvd N',
                'city' => 'Jacksonville',
                'state' => 'FL',
                'zip' => '32211',
                'phone' => '(904) 256-8000',
                'website' => 'https://www.ju.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Science in Nursing - FNP', 'degree_type' => 'MSN', 'required_hours' => 540, 'specialties' => ['Family Practice', 'Primary Care']],
                ],
            ],
            [
                'name' => 'Florida Atlantic University',
                'address' => '777 Glades Rd',
                'city' => 'Boca Raton',
                'state' => 'FL',
                'zip' => '33431',
                'phone' => '(561) 297-3000',
                'website' => 'https://www.fau.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Critical Care']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Executive Leadership', 'Adult-Gerontology']],
                ],
            ],
            [
                'name' => 'Florida A&M University',
                'address' => '1601 S Martin Luther King Jr Blvd',
                'city' => 'Tallahassee',
                'state' => 'FL',
                'zip' => '32307',
                'phone' => '(850) 599-3000',
                'website' => 'https://www.famu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Community Pharmacy']],
                ],
            ],
            [
                'name' => 'Florida Gulf Coast University',
                'address' => '10501 FGCU Blvd S',
                'city' => 'Fort Myers',
                'state' => 'FL',
                'zip' => '33965',
                'phone' => '(239) 590-1000',
                'website' => 'https://www.fgcu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Science in Nursing', 'degree_type' => 'MSN', 'required_hours' => 540, 'specialties' => ['Nurse Educator', 'Family NP']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurologic']],
                ],
            ],
            [
                'name' => 'Florida State University',
                'address' => '600 W College Ave',
                'city' => 'Tallahassee',
                'state' => 'FL',
                'zip' => '32306',
                'phone' => '(850) 644-2525',
                'website' => 'https://www.fsu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Community Practice']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Surgery']],
                ],
            ],
            [
                'name' => 'University of North Florida',
                'address' => '1 UNF Dr',
                'city' => 'Jacksonville',
                'state' => 'FL',
                'zip' => '32224',
                'phone' => '(904) 620-1000',
                'website' => 'https://www.unf.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Nurse Practitioner - Adult/Gerontology', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Adult-Gerontology', 'Primary Care']],
                ],
            ],
            [
                'name' => 'University of West Florida',
                'address' => '11000 University Pkwy',
                'city' => 'Pensacola',
                'state' => 'FL',
                'zip' => '32514',
                'phone' => '(850) 474-2000',
                'website' => 'https://www.uwf.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Science in Nursing', 'degree_type' => 'MSN', 'required_hours' => 540, 'specialties' => ['Family NP', 'Psychiatric Mental Health']],
                ],
            ],
            [
                'name' => 'Keiser University',
                'address' => '1500 NW 49th St',
                'city' => 'Fort Lauderdale',
                'state' => 'FL',
                'zip' => '33309',
                'phone' => '(954) 776-4456',
                'website' => 'https://www.keiseruniversity.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric OT', 'Adult Rehabilitation']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],
            [
                'name' => 'Adventist University of Health Sciences',
                'address' => '671 Winyah Dr',
                'city' => 'Orlando',
                'state' => 'FL',
                'zip' => '32803',
                'phone' => '(407) 303-7747',
                'website' => 'https://www.adu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Critical Care']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Sports Medicine']],
                ],
            ],

            // === GEORGIA ===
            [
                'name' => 'Emory University',
                'address' => '201 Dowman Dr',
                'city' => 'Atlanta',
                'state' => 'GA',
                'zip' => '30322',
                'phone' => '(404) 727-6123',
                'website' => 'https://www.emory.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Science in Nursing - NP', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Adult-Gerontology', 'Pediatric', 'Family']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Executive Leadership', 'Anesthesia']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Emergency Medicine']],
                ],
            ],
            [
                'name' => 'Georgia State University',
                'address' => '33 Gilmer St SE',
                'city' => 'Atlanta',
                'state' => 'GA',
                'zip' => '30303',
                'phone' => '(404) 413-2000',
                'website' => 'https://www.gsu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Community Practice', 'Clinical Social Work']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Geriatric PT', 'Cardiopulmonary']],
                ],
            ],
            [
                'name' => 'Augusta University',
                'address' => '1120 15th St',
                'city' => 'Augusta',
                'state' => 'GA',
                'zip' => '30912',
                'phone' => '(706) 721-0211',
                'website' => 'https://www.augusta.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Acute Care']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                ],
            ],
            [
                'name' => 'Mercer University',
                'address' => '1501 Mercer University Dr',
                'city' => 'Macon',
                'state' => 'GA',
                'zip' => '31207',
                'phone' => '(478) 301-2700',
                'website' => 'https://www.mercer.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Community Pharmacy', 'Hospital Pharmacy']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === TEXAS ===
            [
                'name' => 'University of Texas at Austin',
                'address' => '110 Inner Campus Dr',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78712',
                'phone' => '(512) 471-3434',
                'website' => 'https://www.utexas.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Health Social Work']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Psychiatric Mental Health', 'Family NP']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Research']],
                ],
            ],
            [
                'name' => 'Baylor University',
                'address' => '1311 S 5th St',
                'city' => 'Waco',
                'state' => 'TX',
                'zip' => '76706',
                'phone' => '(254) 710-1011',
                'website' => 'https://www.baylor.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Neonatal']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Community Practice']],
                ],
            ],
            [
                'name' => 'Texas A&M University',
                'address' => '400 Bizzell St',
                'city' => 'College Station',
                'state' => 'TX',
                'zip' => '77843',
                'phone' => '(979) 845-3211',
                'website' => 'https://www.tamu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Military Social Work', 'Health']],
                ],
            ],
            [
                'name' => 'University of Texas Health Science Center at Houston',
                'address' => '7000 Fannin St',
                'city' => 'Houston',
                'state' => 'TX',
                'zip' => '77030',
                'phone' => '(713) 500-4472',
                'website' => 'https://www.uth.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Critical Care']],
                    ['name' => 'Master of Science in Nursing - FNP', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Family Practice', 'Adult-Gerontology']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Nurse Anesthesia', 'Executive Leadership']],
                ],
            ],
            [
                'name' => 'Texas Tech University Health Sciences Center',
                'address' => '3601 4th St',
                'city' => 'Lubbock',
                'state' => 'TX',
                'zip' => '79430',
                'phone' => '(806) 743-3111',
                'website' => 'https://www.ttuhsc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Rural Health']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Rural Medicine']],
                ],
            ],

            // === NEW YORK ===
            [
                'name' => 'New York University',
                'address' => '70 Washington Square S',
                'city' => 'New York',
                'state' => 'NY',
                'zip' => '10012',
                'phone' => '(212) 998-1212',
                'website' => 'https://www.nyu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Global Health']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Community Organizing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Psychiatric NP']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurologic']],
                ],
            ],
            [
                'name' => 'Columbia University',
                'address' => '116th St & Broadway',
                'city' => 'New York',
                'state' => 'NY',
                'zip' => '10027',
                'phone' => '(212) 854-1754',
                'website' => 'https://www.columbia.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Science in Nursing - NP', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Adult-Gerontology', 'Oncology']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Nurse Anesthesia', 'Midwifery']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Advanced Clinical Practice', 'Policy Practice']],
                ],
            ],
            [
                'name' => 'University of Rochester',
                'address' => '500 Joseph C Wilson Blvd',
                'city' => 'Rochester',
                'state' => 'NY',
                'zip' => '14627',
                'phone' => '(585) 275-2121',
                'website' => 'https://www.rochester.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Nurse Practitioner - Pediatric', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Pediatric Primary Care', 'Pediatric Acute Care']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Psychiatric Mental Health']],
                ],
            ],
            [
                'name' => 'Stony Brook University',
                'address' => '100 Nicolls Rd',
                'city' => 'Stony Brook',
                'state' => 'NY',
                'zip' => '11794',
                'phone' => '(631) 632-6000',
                'website' => 'https://www.stonybrook.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Health Social Work']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === CALIFORNIA ===
            [
                'name' => 'University of California, San Francisco',
                'address' => '505 Parnassus Ave',
                'city' => 'San Francisco',
                'state' => 'CA',
                'zip' => '94143',
                'phone' => '(415) 476-9000',
                'website' => 'https://www.ucsf.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Science in Nursing - NP', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Family Practice', 'Adult-Gerontology']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Executive Leadership']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Research']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Neurologic', 'Orthopedic']],
                ],
            ],
            [
                'name' => 'University of California, Los Angeles',
                'address' => '405 Hilgard Ave',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip' => '90095',
                'phone' => '(310) 825-4321',
                'website' => 'https://www.ucla.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Health Social Work', 'Mental Health']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Acute Care NP', 'Adult-Gerontology']],
                ],
            ],
            [
                'name' => 'University of Southern California',
                'address' => '3551 Trousdale Pkwy',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip' => '90089',
                'phone' => '(213) 740-2311',
                'website' => 'https://www.usc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Community Organization', 'Mental Health']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric OT', 'Mental Health OT']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Sports Medicine', 'Neurologic']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],
            [
                'name' => 'Samuel Merritt University',
                'address' => '3100 Telegraph Ave',
                'city' => 'Oakland',
                'state' => 'CA',
                'zip' => '94609',
                'phone' => '(510) 869-6511',
                'website' => 'https://www.samuelmerritt.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice - FNP', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family Practice']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Adult Rehabilitation']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === ILLINOIS ===
            [
                'name' => 'Rush University',
                'address' => '600 S Paulina St',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip' => '60612',
                'phone' => '(312) 942-5000',
                'website' => 'https://www.rushu.rush.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Critical Care']],
                    ['name' => 'Master of Science in Nursing', 'degree_type' => 'MSN', 'required_hours' => 540, 'specialties' => ['Clinical Nurse Specialist', 'Nurse Educator']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Pediatric NP']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric', 'Adult Rehab']],
                ],
            ],
            [
                'name' => 'University of Illinois at Chicago',
                'address' => '601 S Morgan St',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip' => '60607',
                'phone' => '(312) 996-7000',
                'website' => 'https://www.uic.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Mental Health', 'Child & Family']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Neurologic', 'Geriatric']],
                ],
            ],

            // === PENNSYLVANIA ===
            [
                'name' => 'University of Pennsylvania',
                'address' => '3451 Walnut St',
                'city' => 'Philadelphia',
                'state' => 'PA',
                'zip' => '19104',
                'phone' => '(215) 898-5000',
                'website' => 'https://www.upenn.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Social Policy']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Nurse Anesthesia', 'Adult-Gerontology']],
                ],
            ],
            [
                'name' => 'University of Pittsburgh',
                'address' => '4200 Fifth Ave',
                'city' => 'Pittsburgh',
                'state' => 'PA',
                'zip' => '15260',
                'phone' => '(412) 624-4141',
                'website' => 'https://www.pitt.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Nurse Practitioner - Psychiatric', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Psychiatric Mental Health']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Sports Medicine']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Surgery']],
                ],
            ],

            // === NORTH CAROLINA ===
            [
                'name' => 'Duke University',
                'address' => '2138 Campus Dr',
                'city' => 'Durham',
                'state' => 'NC',
                'zip' => '27708',
                'phone' => '(919) 684-8111',
                'website' => 'https://www.duke.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Acute Care NP', 'Family NP', 'Nurse Anesthesia']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurologic']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Surgery']],
                ],
            ],
            [
                'name' => 'University of North Carolina at Chapel Hill',
                'address' => '103 South Bldg',
                'city' => 'Chapel Hill',
                'state' => 'NC',
                'zip' => '27599',
                'phone' => '(919) 962-2211',
                'website' => 'https://www.unc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Community Practice']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Research']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric', 'Adult Rehab']],
                ],
            ],

            // === MICHIGAN ===
            [
                'name' => 'University of Michigan',
                'address' => '500 S State St',
                'city' => 'Ann Arbor',
                'state' => 'MI',
                'zip' => '48109',
                'phone' => '(734) 764-1817',
                'website' => 'https://www.umich.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Community Organizing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Nurse Midwifery']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                ],
            ],

            // === OHIO ===
            [
                'name' => 'Ohio State University',
                'address' => '281 W Lane Ave',
                'city' => 'Columbus',
                'state' => 'OH',
                'zip' => '43210',
                'phone' => '(614) 292-6446',
                'website' => 'https://www.osu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Pediatric NP']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Sports Medicine']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Health Social Work']],
                ],
            ],
            [
                'name' => 'Case Western Reserve University',
                'address' => '10900 Euclid Ave',
                'city' => 'Cleveland',
                'state' => 'OH',
                'zip' => '44106',
                'phone' => '(216) 368-2000',
                'website' => 'https://www.case.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Community Practice']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Nurse Anesthesia', 'Adult-Gerontology']],
                ],
            ],

            // === MASSACHUSETTS ===
            [
                'name' => 'Boston University',
                'address' => '1 Silber Way',
                'city' => 'Boston',
                'state' => 'MA',
                'zip' => '02215',
                'phone' => '(617) 353-2000',
                'website' => 'https://www.bu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Macro Practice']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Rehabilitation', 'Community Health']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Neurologic', 'Pediatric']],
                ],
            ],
            [
                'name' => 'MGH Institute of Health Professions',
                'address' => '36 1st Ave',
                'city' => 'Boston',
                'state' => 'MA',
                'zip' => '02129',
                'phone' => '(617) 726-2947',
                'website' => 'https://www.mghihp.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Family NP']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurologic']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric', 'Mental Health']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === MARYLAND ===
            [
                'name' => 'Johns Hopkins University',
                'address' => '3400 N Charles St',
                'city' => 'Baltimore',
                'state' => 'MD',
                'zip' => '21218',
                'phone' => '(410) 516-8000',
                'website' => 'https://www.jhu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Master of Science in Nursing - NP', 'degree_type' => 'NP', 'required_hours' => 600, 'specialties' => ['Adult-Gerontology', 'Pediatric']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Executive Leadership', 'Health Systems']],
                ],
            ],
            [
                'name' => 'University of Maryland, Baltimore',
                'address' => '620 W Lexington St',
                'city' => 'Baltimore',
                'state' => 'MD',
                'zip' => '21201',
                'phone' => '(410) 706-3100',
                'website' => 'https://www.umaryland.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Community Action']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic']],
                ],
            ],

            // === TENNESSEE ===
            [
                'name' => 'Vanderbilt University',
                'address' => '2201 West End Ave',
                'city' => 'Nashville',
                'state' => 'TN',
                'zip' => '37235',
                'phone' => '(615) 322-7311',
                'website' => 'https://www.vanderbilt.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Master of Science in Nursing', 'degree_type' => 'MSN', 'required_hours' => 540, 'specialties' => ['Family NP', 'Acute Care NP', 'Nurse Midwifery']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Nurse Anesthesia', 'Emergency NP']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                ],
            ],

            // === WASHINGTON ===
            [
                'name' => 'University of Washington',
                'address' => '1410 NE Campus Pkwy',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip' => '98195',
                'phone' => '(206) 543-2100',
                'website' => 'https://www.uw.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Advanced Practice']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Psychiatric NP']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Research']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Sports Medicine']],
                ],
            ],

            // === MINNESOTA ===
            [
                'name' => 'University of Minnesota',
                'address' => '100 Church St SE',
                'city' => 'Minneapolis',
                'state' => 'MN',
                'zip' => '55455',
                'phone' => '(612) 625-5000',
                'website' => 'https://www.umn.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Nurse Midwifery']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                ],
            ],

            // === COLORADO ===
            [
                'name' => 'University of Colorado Anschutz Medical Campus',
                'address' => '13001 E 17th Pl',
                'city' => 'Aurora',
                'state' => 'CO',
                'zip' => '80045',
                'phone' => '(303) 724-5000',
                'website' => 'https://www.cuanschutz.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Psychiatric NP', 'Nurse Midwifery']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Pediatric']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Surgery']],
                ],
            ],

            // === VIRGINIA ===
            [
                'name' => 'University of Virginia',
                'address' => '1826 University Ave',
                'city' => 'Charlottesville',
                'state' => 'VA',
                'zip' => '22904',
                'phone' => '(434) 924-0311',
                'website' => 'https://www.virginia.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing', 'Research']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Psychiatric NP']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                ],
            ],

            // === ARIZONA ===
            [
                'name' => 'Arizona State University',
                'address' => '500 E Veterans Way',
                'city' => 'Tempe',
                'state' => 'AZ',
                'zip' => '85281',
                'phone' => '(480) 965-9011',
                'website' => 'https://www.asu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Behavioral Health', 'Community Practice']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Adult-Gerontology']],
                ],
            ],

            // === LOUISIANA ===
            [
                'name' => 'Louisiana State University Health Sciences Center',
                'address' => '433 Bolivar St',
                'city' => 'New Orleans',
                'state' => 'LA',
                'zip' => '70112',
                'phone' => '(504) 568-4808',
                'website' => 'https://www.lsuhsc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Disaster Response']],
                ],
            ],

            // === INDIANA ===
            [
                'name' => 'Indiana University - Purdue University Indianapolis',
                'address' => '420 University Blvd',
                'city' => 'Indianapolis',
                'state' => 'IN',
                'zip' => '46202',
                'phone' => '(317) 274-5555',
                'website' => 'https://www.iupui.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Health Social Work']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Pediatric NP']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Sports Medicine']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric', 'Hand Therapy']],
                ],
            ],

            // === SOUTH CAROLINA ===
            [
                'name' => 'Medical University of South Carolina',
                'address' => '171 Ashley Ave',
                'city' => 'Charleston',
                'state' => 'SC',
                'zip' => '29425',
                'phone' => '(843) 792-2300',
                'website' => 'https://www.musc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Nurse Anesthesia', 'Adult-Gerontology']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Neurologic']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === OREGON ===
            [
                'name' => 'Oregon Health & Science University',
                'address' => '3181 SW Sam Jackson Park Rd',
                'city' => 'Portland',
                'state' => 'OR',
                'zip' => '97239',
                'phone' => '(503) 494-8311',
                'website' => 'https://www.ohsu.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Nurse Midwifery']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === WISCONSIN ===
            [
                'name' => 'University of Wisconsin-Madison',
                'address' => '500 Lincoln Dr',
                'city' => 'Madison',
                'state' => 'WI',
                'zip' => '53706',
                'phone' => '(608) 263-2400',
                'website' => 'https://www.wisc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Health Social Work', 'Children & Families']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Adult-Gerontology', 'Pediatric NP']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy', 'Research']],
                ],
            ],

            // === CONNECTICUT ===
            [
                'name' => 'Yale University',
                'address' => '100 Church St S',
                'city' => 'New Haven',
                'state' => 'CT',
                'zip' => '06519',
                'phone' => '(203) 432-4771',
                'website' => 'https://www.yale.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Master of Science in Nursing', 'degree_type' => 'MSN', 'required_hours' => 540, 'specialties' => ['Adult-Gerontology', 'Family NP', 'Nurse Midwifery']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Psychiatric NP', 'Executive Leadership']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care']],
                ],
            ],

            // === MISSOURI ===
            [
                'name' => 'Washington University in St. Louis',
                'address' => '1 Brookings Dr',
                'city' => 'St. Louis',
                'state' => 'MO',
                'zip' => '63130',
                'phone' => '(314) 935-5000',
                'website' => 'https://www.wustl.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Master of Social Work', 'degree_type' => 'MSW', 'required_hours' => 900, 'specialties' => ['Clinical Social Work', 'Social & Economic Development']],
                    ['name' => 'Doctor of Occupational Therapy', 'degree_type' => 'OTD', 'required_hours' => 1200, 'specialties' => ['Pediatric', 'Mental Health', 'Adult Rehab']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic', 'Neurologic', 'Pediatric']],
                ],
            ],

            // === NEBRASKA ===
            [
                'name' => 'University of Nebraska Medical Center',
                'address' => '42nd and Emile',
                'city' => 'Omaha',
                'state' => 'NE',
                'zip' => '68198',
                'phone' => '(402) 559-4000',
                'website' => 'https://www.unmc.edu',
                'is_verified' => true,
                'programs' => [
                    ['name' => 'Bachelor of Science in Nursing', 'degree_type' => 'BSN', 'required_hours' => 720, 'specialties' => ['General Nursing']],
                    ['name' => 'Doctor of Nursing Practice', 'degree_type' => 'DNP', 'required_hours' => 1000, 'specialties' => ['Family NP', 'Adult-Gerontology']],
                    ['name' => 'Doctor of Pharmacy', 'degree_type' => 'PharmD', 'required_hours' => 1500, 'specialties' => ['Clinical Pharmacy']],
                    ['name' => 'Doctor of Physical Therapy', 'degree_type' => 'DPT', 'required_hours' => 1500, 'specialties' => ['Orthopedic']],
                    ['name' => 'Physician Assistant Studies', 'degree_type' => 'PA', 'required_hours' => 2000, 'specialties' => ['Primary Care', 'Rural Medicine']],
                ],
            ],
        ];
    }
}
