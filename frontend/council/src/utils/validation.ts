import * as yup from 'yup';

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

export const newEventSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name can be at most 100 characters')
    .required('Event name is required'),

  description: yup
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description can be at most 1000 characters')
    .required('Description is required'),

  long_description: yup
    .string()
    .trim()
    .min(50, 'Long description must be at least 50 characters')
    .max(5000, 'Long description can be at most 5000 characters')
    .required('Long description is required'),

  tag_line: yup
    .string()
    .trim()
    .max(255, 'Tagline can be at most 255 characters')
    .required('Tagline is required'),

  fee: yup
    .number()
    .min(0, 'Fee cannot be negative')
    .required('Fee is required'),

  event_type: yup
    .string()
    .oneOf(
      ['COMPETETION', 'WORKSHOP', 'SPEAKER_SESSION', 'ONLINE', 'FEST'],
      'Invalid event type',
    )
    .required('Event type is required'),

  online_event_link: yup
    .string()
    .url('Must be a valid URL')
    .when('event_type', (event_type, schema) => {
      const eventTypeValue = Array.isArray(event_type)
        ? event_type[0]
        : event_type;
      if (eventTypeValue === 'ONLINE') {
        return schema.required(
          'Online event link is required for online events',
        );
      }
      return schema.notRequired();
    }),

  dates: yup
    .array()
    .of(
      yup
        .date()
        .min(yesterday(), 'Event dates must be in the future')
        .required('Each date must be valid'),
    )
    .min(1, 'At least one event date is required')
    .required('Event dates are required')
    .test(
      'start-before-end',
      'Start date must be before end date',
      function (value) {
        console.log(value);
        if (!value || value.length < 2) return true;
        const [startDate, endDate] = value;
        return new Date(startDate) < new Date(endDate);
      },
    ),

  venue: yup
    .string()
    .trim()
    .when('event_type', (event_type, schema) => {
      const eventTypeValue = Array.isArray(event_type)
        ? event_type[0]
        : event_type;
      if (eventTypeValue === 'ONLINE') {
        return schema.notRequired();
      }
      return schema.required('Venue is required');
    }),

  tags: yup
    .array()
    .transform((value: string | undefined) =>
      value && typeof value === 'string'
        ? value
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    )
    .test(
      'is-valid-array',
      'Tags must be between 0 and 5 items',
      function (value) {
        return Array.isArray(value) && value.length >= 0 && value.length <= 5;
      },
    )
    .required('Maximum 5 tags are allowed'),

  state: yup
    .string()
    .required('State is required')
    .test('is-valid-state', 'Invalid state', function (value) {
      const draftStates = ['DRAFT', 'APPLIED_FOR_APPROVAL', 'APPLIED_FOR_PRINCI_APPROVAL'];
      const otherStates = [
        'UNLISTED',
        'UPCOMING',
        'REGISTRATION_OPEN',
        'REGISTRATION_CLOSED',
        'TICKET_OPEN',
        'TICKET_CLOSED',
        'ONGOING',
        'COMPLETED',
        'PRIVATE',
      ];
      if (draftStates.includes(this.parent.state)) {
        return draftStates.includes(value);
      }
      return otherStates.includes(value);
    })
    .default('DRAFT'),

  banner_url: yup
    .string()
    .trim()
    .url('Must be a valid URL')
    .required('Banner URL is required'),

  logo_image_url: yup.string().trim().url('Must be a valid URL').notRequired(),

  event_page_image_url: yup
    .string()
    .trim()
    .url('Must be a valid URL')
    .required('Event page image URL is required'),

  parent_id: yup.number().nullable().notRequired(),

  is_feedback_enabled: yup.boolean().default(false).notRequired(),

  is_only_somaiya: yup
    .boolean()
    .default(true)
    .required('This field is required'),

  in_event_activity: yup.string().nullable().trim().notRequired(),

  start_in_event_activity: yup.boolean().nullable().notRequired(),

  attendance_type: yup.string().oneOf(['TICKET', 'BLE']).nullable(),

  registration_type: yup
    .string()
    .oneOf(['EXTERNAL', 'ONPLATFORM'], 'Invalid registration type')
    .default('ONPLATFORM')
    .required('Registration type is required'),

  external_registration_link: yup
    .string()
    .trim()
    .url('Must be a valid URL')
    .when('registration_type', (registration_type, schema) => {
      const registration_typeValue = Array.isArray(registration_type)
        ? registration_type[0]
        : registration_type;
      if (registration_typeValue === 'EXTERNAL') {
        return schema.required(
          'External registration link is required for EXTERNAL registration type',
        );
      }
      return schema.notRequired();
    }),

  is_ticket_feature_enabled: yup.boolean().default(true).notRequired(),

  ticket_count: yup
    .number()
    .min(1, 'Ticket count cannot be less than 1')
    .default(500)
    .required('Ticket count required'),

  ma_ppt: yup
    .number()
    .min(1, 'Max Paricipants cannot be less than 1')
    .required('Max Paricipants required'),

  min_ppt: yup
    .number()
    .min(1, 'Min Paricipants cannot be less than 1')
    .required('Min Paricipants required'),

  urls: yup
    .object()
    .shape({
      instagram: yup.string().url('Must be a valid Instagram URL').optional(),
      facebook: yup.string().url('Must be a valid Facebook URL').optional(),
      linkedin: yup.string().url('Must be a valid LinkedIn URL').optional(),
      other: yup.string().url('Must be a valid URL').optional(),
    })
    .optional(),

  female_requirement: yup
    .number()
    .min(0, 'Cannot be negative')
    .nullable()
    .notRequired(),

  more_details_enabled: yup.boolean().default(false).notRequired(),

  is_submission_enabled: yup.boolean().default(false).notRequired(),

  report_url: yup
    .string()
    .trim()
    .url('Must be a valid URL')
    .nullable()
    .notRequired(),
});

export type NewEventSchema = yup.InferType<typeof newEventSchema>;
