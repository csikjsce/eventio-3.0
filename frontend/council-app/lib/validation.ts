import * as yup from "yup";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Validation context supplied via `useForm({ context })`.
 * `originalStart` is the start datetime already saved on the event being
 * edited — an unchanged start stays valid even after the event has begun, so
 * a council can still fix the description of a running or finished event.
 */
export interface EventFormContext {
  originalStart?: string | Date | null;
}

function sameMinute(a: Date, b: Date) {
  return Math.floor(a.getTime() / 60000) === Math.floor(b.getTime() / 60000);
}

export const newEventSchema = yup.object({
  name: yup.string().trim().min(3).max(100).required("Event name is required"),
  description: yup.string().trim().min(10).max(1000).required("Description is required"),
  long_description: yup.string().trim().min(20).max(5000).required("Long description is required"),
  tag_line: yup
    .string()
    .trim()
    .max(255)
    .required("Tagline is required")
    .test(
      "not-same-as-name",
      "Tagline should be different from the event name",
      function (value) {
        const name = String(this.parent?.name ?? "").trim().toLowerCase();
        const tag = String(value ?? "").trim().toLowerCase();
        if (!name || !tag) return true;
        if (tag === name) return false;
        if (tag === `${name}${name}`) return false;
        return true;
      },
    ),
  fee: yup.number().min(0).required("Fee is required"),
  event_type: yup
    .string()
    .oneOf(["COMPETETION", "WORKSHOP", "SPEAKER_SESSION", "ONLINE", "FEST"])
    .required("Event type is required"),
  online_event_link: yup.string().url().when("event_type", (et, s) =>
    (Array.isArray(et) ? et[0] : et) === "ONLINE" ? s.required("Online link required") : s.notRequired()
  ),
  dates: yup
    .array()
    .of(yup.date().required())
    .min(1)
    .required("Dates required")
    .test("in-future", "Event date must be in the future", function (v) {
      if (!v || v.length === 0) return true;
      const start = new Date(v[0]);
      const original = (this.options.context as EventFormContext | undefined)?.originalStart;
      if (original) {
        const originalStart = new Date(original);
        if (!Number.isNaN(originalStart.getTime()) && sameMinute(originalStart, start)) {
          return true;
        }
      }
      return start >= startOfToday();
    })
    .test("start-before-end", "Please select an end time that occurs after the start time.", (v) => {
      if (!v || v.length < 2) return true;
      return new Date(v[0]) < new Date(v[v.length - 1]);
    }),
  venue: yup.string().trim().when("event_type", (et, s) =>
    (Array.isArray(et) ? et[0] : et) === "ONLINE" ? s.notRequired() : s.required("Venue is required")
  ),
  tags: yup
    .array()
    .transform((v: string | undefined) =>
      v && typeof v === "string" ? v.split(",").map((t) => t.trim()).filter(Boolean) : []
    )
    .test("max-5", "Max 5 tags", (v) => Array.isArray(v) && v.length <= 5)
    .required(),
  state: yup.string().required().default("DRAFT"),
  banner_url: yup.string().trim().url().required("Banner URL is required"),
  logo_image_url: yup.string().trim().url().notRequired(),
  event_page_image_url: yup.string().trim().url().required("Image URL is required"),
  parent_id: yup.number().nullable().notRequired(),
  is_feedback_enabled: yup.boolean().default(false).notRequired(),
  is_only_somaiya: yup.boolean().default(true).required(),
  in_event_activity: yup.string().nullable().trim().notRequired(),
  start_in_event_activity: yup.boolean().nullable().notRequired(),
  attendance_type: yup.string().oneOf(["TICKET", "BLE"]).nullable(),
  registration_type: yup.string().oneOf(["EXTERNAL", "ONPLATFORM"]).default("ONPLATFORM").required(),
  external_registration_link: yup.string().trim().url().when("registration_type", (rt, s) =>
    (Array.isArray(rt) ? rt[0] : rt) === "EXTERNAL" ? s.required("External link required") : s.notRequired()
  ),
  is_ticket_feature_enabled: yup.boolean().default(true).notRequired(),
  ticket_count: yup.number().min(1).default(500).required(),
  min_ppt: yup.number().min(1).required(),
  ma_ppt: yup
    .number()
    .min(1)
    .required()
    .test(
      "max-gte-min",
      "Max members cannot be less than min members",
      function (value) {
        const { min_ppt } = this.parent;
        if (value == null || min_ppt == null) return true;
        return value >= min_ppt;
      },
    ),
  urls: yup.object().shape({
    instagram: yup.string().url().optional(),
    facebook: yup.string().url().optional(),
    linkedin: yup.string().url().optional(),
    other: yup.string().url().optional(),
  }).optional(),
  female_requirement: yup
    .number()
    .min(0, "Cannot be negative")
    .nullable()
    .notRequired()
    .test(
      "is-less-than-total",
      "Reserved female seats cannot exceed the total ticket count",
      (value: number | null | undefined, context: yup.TestContext) => {
        const { ticket_count } = context.parent as { ticket_count: number };
        if (value === undefined || value === null) return true;
        return value <= ticket_count;
      }
    ),
  more_details_enabled: yup.boolean().default(false).notRequired(),
  registration_fields: yup
    .array()
    .of(
      yup.object({
        id: yup.string().trim().notRequired(),
        // Only enforced while the toggle is on — a leftover half-filled row must
        // never block the form once extra fields are switched off.
        label: yup
          .string()
          .trim()
          .when("$moreDetailsEnabled", {
            is: true,
            then: (s) => s.required("Give every custom registration field a label"),
            otherwise: (s) => s.notRequired(),
          }),
        type: yup
          .string()
          .oneOf(["text", "textarea", "url", "number", "select"])
          .default("text"),
        required: yup.boolean().default(true),
        placeholder: yup.string().trim().notRequired(),
        options: yup.array().of(yup.string().trim()).optional(),
      }),
    )
    .default([])
    .when("more_details_enabled", {
      is: true,
      then: (s) =>
        s.min(1, "Add at least one custom registration field"),
      otherwise: (s) => s.notRequired(),
    }),
  is_submission_enabled: yup.boolean().default(false).notRequired(),
  report_url: yup.string().trim().url().nullable().notRequired(),
});

export type NewEventSchema = yup.InferType<typeof newEventSchema>;
