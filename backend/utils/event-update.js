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
    "assigned_faculty_emails",
    "proposal_document",
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

function validateTeamSize(min_ppt, ma_ppt) {
    const min = Number(min_ppt);
    const max = Number(ma_ppt);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return { ok: false, message: "Team size must be valid numbers." };
    }
    if (min < 1 || max < 1) {
        return { ok: false, message: "Team size must be at least 1." };
    }
    if (max < min) {
        return {
            ok: false,
            message: "Max team size cannot be less than min team size.",
        };
    }
    return { ok: true };
}

module.exports = { EVENT_UPDATE_KEYS, pickEventUpdateData, validateTeamSize };
