/** Scalar Events columns allowed through POST /event/p/update/:id (relations excluded). */
const EVENT_UPDATE_KEYS = new Set([
    "name",
    "description",
    "long_description",
    "tag_line",
    "fee",
    "event_type",
    "online_event_link",
    "dates",
    "venue",
    "ma_ppt",
    "min_ppt",
    "tags",
    "state",
    "banner_url",
    "logo_image__url",
    "event_page_image_url",
    "parent_id",
    "is_feedback_enabled",
    "is_only_somaiya",
    "attendance_type",
    "registration_type",
    "external_registration_link",
    "is_ticket_feature_enabled",
    "in_event_activity",
    "start_in_event_activity",
    "comment",
    "ticket_count",
    "female_requirement",
    "more_details_enabled",
    "registration_fields",
    "is_submission_enabled",
    "report_url",
    "urls",
    "state_history",
]);

/**
 * Keep only valid Prisma Events update fields.
 * UI/computed payloads (children, organizer, pipeline_stage, …) are dropped.
 */
function pickEventUpdateData(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const data = {};

    for (const key of EVENT_UPDATE_KEYS) {
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
            data[key] = source[key];
        }
    }

    return data;
}

module.exports = { EVENT_UPDATE_KEYS, pickEventUpdateData };
