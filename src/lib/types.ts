export interface Profile {
  id: string
  email: string
  full_name: string | null
  child_name: string | null
  child_age: number | null
  child_dob: string | null
  county: string | null
  current_programs: string[]
  phone: string | null
  contacts: ProfileContact[] | null
}

export interface ProfileContact {
  name: string
  role: string
  phone: string
  email: string
  agency: string
  notes: string
}

export type BenefitStatus = 'active' | 'pending' | 'denied' | 'expired' | 'ending_soon'

export interface ChildBenefit {
  id: string
  user_id: string
  program_name: string
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
  user_id: string
  program_name: string
  status: ApplicationStatus
  submitted_date: string | null
  decision_date: string | null
  case_number: string | null
  notes: string | null
  next_step: string | null
}

export type DocType = 'email_draft' | 'letter' | 'form_notes' | 'checklist' | 'other'

export interface SavedDocument {
  id: string
  user_id: string
  doc_type: DocType
  title: string
  content: string
  metadata: Record<string, unknown> | null
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string
  is_completed: boolean
  program_name: string | null
}

export type EmailProvider = 'gmail' | 'outlook' | 'smtp'

export interface EmailConnection {
  id: string
  user_id: string
  provider: EmailProvider
  email_address: string
  encrypted_tokens: string
  is_active: boolean
}

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
