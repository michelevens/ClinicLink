import { describe, it, expect } from 'vitest'
import type {
  UserRole, User, Credential, RotationSite, RotationSlot,
  Application, HourLog, Evaluation, University, Program, DashboardStats,
} from '../../types/index.ts'

describe('Type definitions', () => {
  it('UserRole accepts all valid roles', () => {
    const roles: UserRole[] = ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin']
    expect(roles).toHaveLength(6)
    roles.forEach(role => expect(typeof role).toBe('string'))
  })

  it('User interface has required fields', () => {
    const user: User = {
      id: '1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      createdAt: '2024-01-01',
      onboardingCompleted: true,
    }
    expect(user.id).toBe('1')
    expect(user.email).toBe('test@test.com')
    expect(user.role).toBe('student')
  })

  it('User interface supports optional fields', () => {
    const user: User = {
      id: '1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      createdAt: '2024-01-01',
      onboardingCompleted: true,
      username: 'johndoe',
      avatar: '/avatar.png',
      phone: '555-0100',
      universityId: 'uni-1',
      programId: 'prog-1',
    }
    expect(user.username).toBe('johndoe')
    expect(user.avatar).toBe('/avatar.png')
  })

  it('Credential interface has correct structure', () => {
    const cred: Credential = {
      id: 'c1',
      type: 'cpr',
      name: 'CPR Certification',
      status: 'valid',
    }
    expect(cred.type).toBe('cpr')
    expect(cred.status).toBe('valid')
  })

  it('Credential types are restricted', () => {
    const validTypes: Credential['type'][] = ['cpr', 'background_check', 'immunization', 'liability_insurance', 'drug_screen', 'license', 'other']
    expect(validTypes).toHaveLength(7)
  })

  it('Credential status types are restricted', () => {
    const validStatuses: Credential['status'][] = ['valid', 'expiring_soon', 'expired', 'pending']
    expect(validStatuses).toHaveLength(4)
  })

  it('Application status types are restricted', () => {
    const statuses: Application['status'][] = ['pending', 'accepted', 'declined', 'waitlisted', 'withdrawn']
    expect(statuses).toHaveLength(5)
  })

  it('HourLog category types are restricted', () => {
    const categories: HourLog['category'][] = ['direct_care', 'indirect_care', 'simulation', 'observation', 'other']
    expect(categories).toHaveLength(5)
  })

  it('RotationSlot status types are restricted', () => {
    const statuses: RotationSlot['status'][] = ['open', 'filled', 'closed']
    expect(statuses).toHaveLength(3)
  })

  it('Evaluation types are restricted', () => {
    const types: Evaluation['type'][] = ['mid_rotation', 'final', 'student_feedback']
    expect(types).toHaveLength(3)
  })

  it('Program degreeType covers healthcare programs', () => {
    const degrees: Program['degreeType'][] = ['BSN', 'MSN', 'DNP', 'PA', 'NP', 'DPT', 'OTD', 'MSW', 'PharmD', 'other']
    expect(degrees).toHaveLength(10)
  })

  it('RotationSite has required fields', () => {
    const site: RotationSite = {
      id: 's1',
      name: 'City Hospital',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      phone: '555-0100',
      description: 'A great hospital',
      specialties: ['Nursing'],
      photos: [],
      managerId: 'mgr-1',
      rating: 4.5,
      reviewCount: 10,
      isVerified: true,
    }
    expect(site.name).toBe('City Hospital')
    expect(site.isVerified).toBe(true)
  })

  it('DashboardStats has all optional fields', () => {
    const stats: DashboardStats = {}
    expect(stats.totalStudents).toBeUndefined()

    const fullStats: DashboardStats = {
      totalStudents: 100,
      placedStudents: 80,
      pendingApplications: 15,
      openSlots: 25,
      totalHours: 5000,
      activeRotations: 60,
      averageRating: 4.2,
      completionRate: 85,
    }
    expect(fullStats.totalStudents).toBe(100)
    expect(fullStats.completionRate).toBe(85)
  })
})
