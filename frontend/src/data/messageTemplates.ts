export interface MessageTemplate {
  id: string
  label: string
  body: string
  roles: string[]
  category: string
}

export const messageTemplates: MessageTemplate[] = [
  // Student templates
  { id: 'student-hour-review', label: 'Request Hour Review', body: 'Hi, I have submitted my clinical hours for review. Could you please take a look at them when you have a chance? Thank you!', roles: ['student'], category: 'Requests' },
  { id: 'student-thank', label: 'Thank Preceptor', body: 'Thank you so much for your guidance and mentorship during my rotation. I really appreciate the time you spent teaching me and the clinical experiences you provided.', roles: ['student'], category: 'General' },
  { id: 'student-rotation-question', label: 'Ask About Rotation', body: 'Hi, I had a question about my upcoming rotation. Could you provide more details about the schedule, expectations, and any preparation I should do beforehand? Thank you!', roles: ['student'], category: 'Requests' },

  // Preceptor templates
  { id: 'preceptor-hours-approved', label: 'Hours Approved', body: 'I have reviewed and approved your submitted clinical hours. Keep up the great work!', roles: ['preceptor'], category: 'Reviews' },
  { id: 'preceptor-hours-revision', label: 'Hours Need Revision', body: 'I reviewed your submitted hours and noticed some discrepancies. Could you please review and resubmit with the necessary corrections? Let me know if you have any questions.', roles: ['preceptor'], category: 'Reviews' },
  { id: 'preceptor-eval-reminder', label: 'Evaluation Reminder', body: 'This is a friendly reminder that your evaluation is coming up soon. Please make sure your hours are up to date and reach out if you have any questions about the evaluation process.', roles: ['preceptor'], category: 'Reminders' },

  // Coordinator templates
  { id: 'coord-announcement', label: 'Program Announcement', body: 'Dear students, I wanted to share an important update regarding our clinical rotation program. Please review the following information carefully.', roles: ['coordinator'], category: 'Announcements' },
  { id: 'coord-app-update', label: 'Application Update', body: 'I wanted to provide an update on your rotation application. Please log in to ClinicLink to check the latest status and any required actions on your part.', roles: ['coordinator'], category: 'Updates' },
  { id: 'coord-compliance', label: 'Compliance Reminder', body: 'This is a reminder to ensure all your credentials and documentation are current. Please review your compliance status in ClinicLink and upload any missing or expired documents as soon as possible.', roles: ['coordinator'], category: 'Reminders' },

  // General templates
  { id: 'general-thank-you', label: 'Thank You', body: 'Thank you for your help and support. I really appreciate it!', roles: ['student', 'preceptor', 'coordinator', 'site_manager', 'professor', 'admin'], category: 'General' },
  { id: 'general-follow-up', label: 'Follow Up', body: 'Hi, I wanted to follow up on our previous conversation. Could you please provide an update when you get a chance? Thank you!', roles: ['student', 'preceptor', 'coordinator', 'site_manager', 'professor', 'admin'], category: 'General' },
  { id: 'general-intro', label: 'Introduction', body: 'Hi, I wanted to introduce myself. I look forward to working with you this rotation. Please don\'t hesitate to reach out if there\'s anything I should know or prepare.', roles: ['student', 'preceptor', 'coordinator', 'site_manager', 'professor', 'admin'], category: 'General' },
]
