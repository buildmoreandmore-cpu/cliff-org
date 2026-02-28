import type Anthropic from '@anthropic-ai/sdk'

export const toolDefinitions: Anthropic.Messages.Tool[] = [
  {
    name: 'get_user_profile',
    description:
      "Read the family's profile, active benefits, pending applications, deadlines, and reminders from the database. Use this when you need to check the user's current situation before making recommendations.",
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'save_to_profile',
    description:
      'Save data to the user\'s profile. Use this to save email drafts, update application status, add reminders, or update benefit information. Specify the action and the data to save.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: [
            'save_email_draft',
            'update_application',
            'add_reminder',
            'update_benefit',
            'add_document',
          ],
          description: 'The type of save action to perform.',
        },
        data: {
          type: 'object',
          description: 'The data to save. Structure depends on the action.',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            program_name: { type: 'string' },
            status: { type: 'string' },
            due_date: { type: 'string' },
            description: { type: 'string' },
            notes: { type: 'string' },
            next_step: { type: 'string' },
            doc_type: { type: 'string' },
            to: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' },
          },
        },
      },
      required: ['action', 'data'],
    },
  },
]
