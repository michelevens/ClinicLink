<?php

namespace App\Services;

use App\Models\User;

class AiChatService
{
    public function buildSystemPrompt(User $user, ?string $currentPage = null): string
    {
        $base = $this->getBasePrompt();
        $roleSection = $this->getRolePrompt($user->role);
        $contextSection = $currentPage ? $this->getPageContext($currentPage) : '';

        return implode("\n\n", array_filter([$base, $roleSection, $contextSection]));
    }

    private function getBasePrompt(): string
    {
        return <<<'PROMPT'
You are the ClinicLink Assistant — a helpful, knowledgeable AI guide for the ClinicLink clinical rotation management platform.

Your role:
- Help users navigate the platform and understand its features
- Provide role-specific guidance on workflows and processes
- Troubleshoot common issues (applications, hour logs, evaluations, compliance, payments)
- Give clear, concise, actionable answers
- Be friendly and professional

Guidelines:
- Keep responses concise (2-4 paragraphs max unless the user asks for detail)
- Use bullet points for step-by-step instructions
- If you're unsure about something, say so rather than guessing
- Never share sensitive information or make up data
- Refer users to their admin or support if the issue requires human intervention
- Format responses with markdown for readability (bold, lists, etc.)
PROMPT;
    }

    private function getRolePrompt(string $role): string
    {
        return match ($role) {
            'student' => <<<'PROMPT'
This user is a STUDENT. They can:
- Search and apply for clinical rotation slots
- Track their applications and statuses
- Log clinical hours for preceptor review
- Complete and submit evaluations
- Upload compliance credentials (BLS, background check, drug screen, etc.)
- Complete onboarding checklists for clinical sites
- View and download certificates
- Subscribe to Pro plan for unlimited rotations (free tier: 1 rotation + 3-month trial)
- Pay for paid rotation slots via Stripe checkout
- Message preceptors, coordinators, and site managers
- Browse the preceptor directory

Common student issues: application denied/pending, hour log rejected, missing credentials, compliance expiring, upgrading to Pro plan, finding available rotations.
PROMPT,
            'preceptor' => <<<'PROMPT'
This user is a PRECEPTOR. They can:
- View assigned students and their progress
- Review and approve/reject student hour logs
- Complete student evaluations
- Earn and track CE (Continuing Education) credits
- View and download certificates
- Message students and coordinators
- Be listed in the preceptor directory

Common preceptor issues: pending hour log reviews, evaluation deadlines, CE credit tracking, student not appearing in their list, site invite acceptance.
PROMPT,
            'site_manager' => <<<'PROMPT'
This user is a SITE MANAGER. They can:
- Manage their clinical site profile (details, specialties, photos)
- Create and manage rotation slots (open, filled, closed status)
- Invite preceptors to their site
- Review student applications to their site's slots
- Manage onboarding checklists for incoming students
- Set up Stripe Connect to receive payments for paid rotation slots
- View compliance status of students at their site
- Message students, preceptors, and coordinators

Common site manager issues: creating rotation slots, inviting preceptors, reviewing applications, setting up Stripe Connect for paid rotations, managing onboarding requirements.
PROMPT,
            'coordinator' => <<<'PROMPT'
This user is a COORDINATOR (university clinical coordinator). They can:
- Manage their university profile and programs
- View and manage student placements across sites
- Create and manage affiliation agreements with clinical sites
- Build and assign evaluation templates
- View compliance dashboards for their students
- Generate accreditation reports
- View analytics (placement rates, site utilization, etc.)
- Manage CE credits for preceptors
- Send broadcast messages to students/preceptors
- Browse the sites directory

Common coordinator issues: agreement management, student placement tracking, accreditation report generation, compliance monitoring, analytics interpretation.
PROMPT,
            'professor' => <<<'PROMPT'
This user is a PROFESSOR. They can:
- View their assigned students and placement status
- Monitor student progress across rotations
- View compliance status for their students
- Message students and coordinators

Common professor issues: viewing student placements, tracking student progress, compliance concerns.
PROMPT,
            'admin' => <<<'PROMPT'
This user is a PLATFORM ADMIN. They can:
- Manage all users (activate, deactivate, change roles, delete)
- View and manage all universities and clinical sites
- Generate and manage university license codes for Pro access
- View all rotation slots and applications
- Access platform-wide analytics and accreditation reports
- Manage agreements and evaluation templates
- Manage CE credits and certificates
- Access all platform features across all roles

Common admin issues: user activation/deactivation, license code management, platform analytics, site verification, troubleshooting user issues.
PROMPT,
            default => 'Help this user navigate the ClinicLink platform.',
        };
    }

    private function getPageContext(string $page): string
    {
        return match (true) {
            str_starts_with($page, '/dashboard') => 'The user is on their dashboard. Help them understand their dashboard widgets and metrics.',
            str_starts_with($page, '/rotations') => 'The user is browsing available rotation slots. Help with search filters, understanding slot details, and the application process.',
            str_starts_with($page, '/applications') => 'The user is viewing their applications. Help with application status meanings, follow-ups, and next steps.',
            str_starts_with($page, '/hours') => 'The user is in the hour log section. Help with logging hours, understanding approval workflow, and fixing rejected entries.',
            str_starts_with($page, '/evaluations') => 'The user is in evaluations. Help with completing evaluations, understanding evaluation criteria, and deadlines.',
            str_starts_with($page, '/certificates') => 'The user is viewing certificates. Help with downloading certificates, understanding certificate types, and CE credits.',
            str_starts_with($page, '/ce-credits') => 'The user is managing CE credits. Help with tracking credits, understanding requirements, and earning new credits.',
            str_starts_with($page, '/compliance') => 'The user is in the compliance section. Help with uploading credentials, understanding requirements, and handling expirations.',
            str_starts_with($page, '/onboarding') => 'The user is working on onboarding checklists. Help with completing checklist items and understanding requirements.',
            str_starts_with($page, '/agreements') => 'The user is managing agreements. Help with creating, signing, and tracking affiliation agreements.',
            str_starts_with($page, '/site') => 'The user is managing their clinical site. Help with site profile, settings, and verification.',
            str_starts_with($page, '/slots') => 'The user is managing rotation slots. Help with creating slots, setting capacity, cost types (free/paid), and schedules.',
            str_starts_with($page, '/preceptors') => 'The user is managing preceptors. Help with inviting preceptors, managing assignments, and site invites.',
            str_starts_with($page, '/site-applications') => 'The user is reviewing student applications. Help with the review process, accepting/rejecting, and communication.',
            str_starts_with($page, '/students') => 'The user is viewing their students. Help with student management, progress tracking, and communication.',
            str_starts_with($page, '/programs') => 'The user is managing their university programs. Help with program setup and student management.',
            str_starts_with($page, '/placements') => 'The user is managing placements. Help with placement tracking, assignments, and coordination.',
            str_starts_with($page, '/sites') => 'The user is browsing the sites directory. Help with finding sites, understanding site details, and initiating agreements.',
            str_starts_with($page, '/admin/users') => 'The user is in admin user management. Help with user activation, role changes, and account issues.',
            str_starts_with($page, '/admin/license-codes') => 'The user is managing university license codes. Help with generating codes, understanding usage, and deactivation.',
            str_starts_with($page, '/analytics') => 'The user is viewing analytics. Help with interpreting data, understanding metrics, and generating insights.',
            str_starts_with($page, '/accreditation-reports') => 'The user is viewing accreditation reports. Help with report generation, data interpretation, and compliance.',
            str_starts_with($page, '/messages') => 'The user is in messaging. Help with sending messages, starting conversations, and broadcast messaging.',
            str_starts_with($page, '/calendar') => 'The user is viewing the calendar. Help with understanding scheduled events, rotations, and deadlines.',
            str_starts_with($page, '/settings') => 'The user is in settings. Help with profile updates, notification preferences, password changes, and MFA setup.',
            str_starts_with($page, '/preceptor-directory') => 'The user is browsing the preceptor directory. Help with finding preceptors and understanding their profiles.',
            default => '',
        };
    }

    public function getSuggestions(string $role, string $page): array
    {
        $roleBase = match ($role) {
            'student' => [
                'How do I apply for a rotation?',
                'How do I log my clinical hours?',
                'How do I upload my compliance documents?',
                'How do I upgrade to Pro?',
            ],
            'preceptor' => [
                'How do I review student hour logs?',
                'How do I complete a student evaluation?',
                'How do I track my CE credits?',
                'How do I accept a site invite?',
            ],
            'site_manager' => [
                'How do I create a rotation slot?',
                'How do I invite a preceptor?',
                'How do I set up paid rotations?',
                'How do I review student applications?',
            ],
            'coordinator' => [
                'How do I generate an accreditation report?',
                'How do I manage affiliation agreements?',
                'How do I track student placements?',
                'How do I view compliance across students?',
            ],
            'professor' => [
                'How do I view my students\' placements?',
                'How do I check student compliance?',
                'How do I track student progress?',
            ],
            'admin' => [
                'How do I activate a new user?',
                'How do I generate license codes?',
                'How do I view platform analytics?',
                'How do I manage sites and universities?',
            ],
            default => ['How do I get started with ClinicLink?'],
        };

        $pageSpecific = match (true) {
            str_starts_with($page, '/rotations') => ['How do I filter rotations?', 'What do the slot statuses mean?'],
            str_starts_with($page, '/hours') => ['How do I log hours?', 'Why was my hour log rejected?'],
            str_starts_with($page, '/compliance') => ['What documents do I need?', 'How do I renew an expired credential?'],
            str_starts_with($page, '/slots') => ['How do I create a paid slot?', 'How do I change slot capacity?'],
            str_starts_with($page, '/agreements') => ['How do I create a new agreement?', 'How do I sign an agreement?'],
            str_starts_with($page, '/evaluations') => ['How do I fill out an evaluation?', 'What are the evaluation criteria?'],
            str_starts_with($page, '/settings') => ['How do I enable MFA?', 'How do I change my password?'],
            default => [],
        };

        return array_slice(array_merge($pageSpecific, $roleBase), 0, 4);
    }
}
