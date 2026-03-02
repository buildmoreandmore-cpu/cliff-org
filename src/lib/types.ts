// ============================================================
// Types matching Supabase schema exactly
// ============================================================

export interface Profile {
  id: string
  user_id: string
  child_name: string | null
  child_dob: string | null
  parent_name: string | null
  phone: string | null
  county: string | null
  notification_breaking_news: boolean
  notification_milestones: boolean
  notification_digest: boolean
  notification_email: boolean
  notification_sms: boolean
  notification_phone: string | null
  disability_track: string | null
  medically_fragile: boolean
  medicaid_cmo: string | null
  diagnosis: string | null
  primary_concern: string | null
  household_income: string | null   // 'under_25k' | '25k_50k' | '50k_75k' | '75k_100k' | 'over_100k'
  household_size: number | null
  relationship: string | null       // 'parent' | 'self' | 'guardian' | 'other'
  has_medicaid: boolean | null
  citizenship_status: string | null // 'citizen' | 'permanent_resident' | 'other'
  living_situation: string | null   // 'home' | 'group_home' | 'nursing_facility' | 'independent'
  employment_status: string | null  // 'employed' | 'seeking' | 'not_working'
  waiver_waitlist: string | null    // 'now' | 'comp' | 'both' | 'none'
  is_admin: boolean
}

export type BenefitStatus = 'active' | 'pending' | 'denied' | 'expired' | 'ending_soon'

export interface ChildBenefit {
  id: string
  profile_id: string
  benefit_name: string
  status: BenefitStatus
  start_date: string | null
  end_date: string | null
  notes: string | null
}

export type ApplicationStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'appealing'

export interface Application {
  id: string
  profile_id: string
  program_name: string
  planning_list_date: string | null
  application_date: string | null
  status: ApplicationStatus
  denial_reason: string | null
  appeal_deadline: string | null
  case_number: string | null
  coordinator_name: string | null
  coordinator_email: string | null
  coordinator_phone: string | null
  notes: string | null
}

export type DocType = 'email_draft' | 'letter' | 'form_notes' | 'checklist' | 'other'

export type SubmissionStatus = 'draft' | 'ready' | 'submitted' | 'expired'

export interface SavedDocument {
  id: string
  profile_id: string
  doc_type: DocType
  title: string
  recipient_name: string | null
  recipient_email: string | null
  recipient_role: string | null
  subject: string | null
  content: string
  is_sent: boolean
  sent_at: string | null
  sent_via: string | null
  submission_status: SubmissionStatus | null
  submission_deadline: string | null
  last_nudge_at: string | null
  nudge_count: number
  snoozed_until: string | null
  signed_at: string | null
  signature_data: string | null
  recipient_agency: string | null
  filing_url: string | null
}

export interface Reminder {
  id: string
  profile_id: string
  title: string
  due_date: string
  description: string | null
  category: string | null
  is_complete: boolean
  completed_at: string | null
  notify_30_days: boolean
  notify_7_days: boolean
  notify_1_day: boolean
  notified_30: boolean
  notified_7: boolean
  notified_1: boolean
}

export type EmailProvider = 'gmail' | 'outlook' | 'smtp'

export interface EmailIntegration {
  id: string
  profile_id: string
  provider: EmailProvider
  email_address: string
  is_active: boolean
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  smtp_host: string | null
  smtp_port: number | null
  smtp_username: string | null
  smtp_password: string | null
  connected_at: string | null
  last_used_at: string | null
}

export interface ContentBlock {
  id: string
  slug: string
  title: string
  body: string
  source_url: string | null
  source_name: string | null
  last_verified: string | null
  last_changed: string | null
  is_published: boolean
}

export type ContentChangeSeverity = 'critical' | 'high' | 'medium' | 'low'
export type ContentChangeStatus = 'pending' | 'approved' | 'dismissed' | 'snoozed'

export interface ContentChange {
  id: string
  content_block_id: string
  detected_at: string
  topic: string | null
  severity: ContentChangeSeverity
  current_text: string | null
  proposed_text: string | null
  source_url: string | null
  source_name: string | null
  confidence: number | null
  status: ContentChangeStatus
  reviewed_at: string | null
  reviewed_by: string | null
  reviewer_notes: string | null
  snooze_until: string | null
}

export interface Notification {
  id: string
  profile_id: string
  trigger_type: string
  trigger_id: string | null
  subject: string
  body: string
  sent_at: string | null
  opened_at: string | null
  unsubscribed: boolean
}

// ============================================================
// Backward-compat aliases (used by frontend components)
// ============================================================

export interface ProfileContact {
  name: string
  role: string
  phone: string
  email: string
  agency: string
  notes: string
}

// ============================================================
// Frontend / Chat types (unchanged for frontend compatibility)
// ============================================================

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallInfo[]
  emailDraft?: EmailDraft
}

export interface ToolCallInfo {
  name: string
  status: 'running' | 'complete' | 'error'
  result?: string
}

export interface EmailDraft {
  to: string
  subject: string
  body: string
  cc?: string
}

export type NavigatorMode = 'explore' | 'apply' | 'email'

export interface NavigatorModeConfig {
  id: NavigatorMode
  title: string
  description: string
  icon: string
}

export interface ChatSession {
  id: string
  user_id: string
  mode: NavigatorMode
  messages: ChatMessage[]
}
