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
  {
    type: 'function',
    function: {
      name: 'generate_hipaa_complaint',
      description:
        'Generate a pre-filled HIPAA complaint draft for the family. Use when a family describes a situation that may be a HIPAA violation — provider refusing records, unauthorized disclosure of medical info, CMO sharing data improperly, or records access denied. Collects the details and produces a ready-to-file complaint with HHS OCR.',
      parameters: {
        type: 'object',
        properties: {
          violation_type: {
            type: 'string',
            enum: [
              'records_access_denied',
              'unauthorized_disclosure',
              'minimum_necessary_violation',
              'retaliation',
              'security_breach',
              'other',
            ],
            description: 'The type of HIPAA violation.',
          },
          entity_name: {
            type: 'string',
            description: 'Name of the provider, hospital, CMO, or entity that violated HIPAA.',
          },
          entity_type: {
            type: 'string',
            enum: ['provider', 'hospital', 'cmo', 'pharmacy', 'school_contractor', 'telehealth', 'other'],
            description: 'Type of entity.',
          },
          description: {
            type: 'string',
            description: 'Detailed description of what happened — extracted from the conversation.',
          },
          approximate_date: {
            type: 'string',
            description: 'Approximate date the violation occurred (YYYY-MM-DD or description like "last month").',
          },
          records_requested: {
            type: 'boolean',
            description: 'Whether the family has already formally requested records in writing.',
          },
        },
        required: ['violation_type', 'entity_name', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'flag_community_submission',
      description:
        'Flag a program, resource, or contact that a family mentions during conversation that CLIFF doesn\'t currently cover. Use when a user mentions a program name, resource, or contact you don\'t recognize. This saves it for the CLIFF team to research and potentially add to the resource library.',
      parameters: {
        type: 'object',
        properties: {
          program_name: {
            type: 'string',
            description: 'Name of the program or resource mentioned.',
          },
          description: {
            type: 'string',
            description: 'What the user said about it — key details extracted from conversation.',
          },
          source_heard_from: {
            type: 'string',
            description: 'How the user heard about it (caseworker, parent group, doctor, attorney, school, other).',
          },
        },
        required: ['description'],
      },
    },
  },
]
