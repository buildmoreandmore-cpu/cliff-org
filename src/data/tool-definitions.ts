import type { MiniMaxTool } from '@/lib/minimax'

export const toolDefinitions: MiniMaxTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description:
        "Read the family's full profile including active benefits, applications, reminders, and saved documents. Use this to understand the user's current situation before making recommendations.",
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_to_profile',
      description:
        'Save or update data in the user\'s profile. Use for email drafts, application updates, reminders, benefit tracking, and documents.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: [
              'save_email_draft',
              'update_application',
              'add_reminder',
              'update_benefit',
              'add_document',
              'update_profile',
            ],
            description: 'The type of save action to perform.',
          },
          data: {
            type: 'object',
            description: 'The data to save. Structure depends on the action.',
            properties: {
              parent_name: { type: 'string' },
              child_name: { type: 'string' },
              child_dob: { type: 'string' },
              county: { type: 'string' },
              phone: { type: 'string' },
              benefit_name: { type: 'string' },
              status: { type: 'string' },
              start_date: { type: 'string' },
              end_date: { type: 'string' },
              notes: { type: 'string' },
              program_name: { type: 'string' },
              planning_list_date: { type: 'string' },
              application_date: { type: 'string' },
              denial_reason: { type: 'string' },
              appeal_deadline: { type: 'string' },
              case_number: { type: 'string' },
              coordinator_name: { type: 'string' },
              coordinator_email: { type: 'string' },
              coordinator_phone: { type: 'string' },
              title: { type: 'string' },
              due_date: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              notify_30_days: { type: 'boolean' },
              notify_7_days: { type: 'boolean' },
              notify_1_day: { type: 'boolean' },
              doc_type: { type: 'string' },
              content: { type: 'string' },
              recipient_name: { type: 'string' },
              recipient_email: { type: 'string' },
              recipient_role: { type: 'string' },
              subject: { type: 'string' },
              body: { type: 'string' },
            },
          },
        },
        required: ['action', 'data'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_content',
      description:
        'Search CLIFF\'s content library for program information, eligibility criteria, contacts, and guides. Use when you need to look up specific Georgia disability program details.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for content blocks.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'research',
      description:
        'Request real-time research on Georgia disability policy, contacts, waitlist numbers, or regional office info. Use when content library doesn\'t have current info.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Research question to investigate.',
          },
        },
        required: ['query'],
      },
    },
  },
]
