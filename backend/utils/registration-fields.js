/**
 * Validate participant `more_details` against council-defined registration fields.
 * Returns { ok: true } or { ok: false, message: string }.
 */
function validateMoreDetails(event, moreDetails) {
    if (!event.more_details_enabled) {
        return { ok: true };
    }

    const fields = Array.isArray(event.registration_fields)
        ? event.registration_fields
        : [];

    if (fields.length === 0) {
        return { ok: true };
    }

    const answers =
        moreDetails && typeof moreDetails === "object" && !Array.isArray(moreDetails)
            ? moreDetails
            : {};

    for (const field of fields) {
        const key = field.id;
        if (!key) continue;

        const raw = answers[key];
        const value =
            raw === null || raw === undefined ? "" : String(raw).trim();
        const required = field.required !== false;

        if (required && !value) {
            return {
                ok: false,
                message: `"${field.label || key}" is required`,
            };
        }

        if (!value) continue;

        switch (field.type) {
            case "url":
                try {
                    new URL(value);
                } catch {
                    return {
                        ok: false,
                        message: `"${field.label || key}" must be a valid URL`,
                    };
                }
                break;
            case "number":
                if (Number.isNaN(Number(value))) {
                    return {
                        ok: false,
                        message: `"${field.label || key}" must be a number`,
                    };
                }
                break;
            case "select": {
                const options = Array.isArray(field.options)
                    ? field.options.map(String)
                    : [];
                if (options.length > 0 && !options.includes(value)) {
                    return {
                        ok: false,
                        message: `"${field.label || key}" has an invalid selection`,
                    };
                }
                break;
            }
            default:
                break;
        }
    }

    return { ok: true };
}

/**
 * Trim and keep only answers for known registration field ids.
 * Returns null when additional details are not enabled / have no fields.
 */
function sanitizeMoreDetails(event, moreDetails) {
    if (!event.more_details_enabled) {
        return null;
    }

    const fields = Array.isArray(event.registration_fields)
        ? event.registration_fields
        : [];

    if (fields.length === 0) {
        return null;
    }

    const answers =
        moreDetails && typeof moreDetails === "object" && !Array.isArray(moreDetails)
            ? moreDetails
            : {};

    const cleaned = {};
    for (const field of fields) {
        const key = field.id;
        if (!key) continue;
        const raw = answers[key];
        cleaned[key] =
            raw === null || raw === undefined ? "" : String(raw).trim();
    }
    return cleaned;
}

function normalizeRegistrationFields(fields) {
    if (!Array.isArray(fields)) return [];

    const seen = new Set();
    return fields
        .map((field) => {
            const label = String(field.label ?? "").trim();
            if (!label) return null;

            let id = String(field.id ?? "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
            if (!id) {
                id = label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_|_$/g, "");
            }

            let uniqueId = id;
            let n = 2;
            while (seen.has(uniqueId)) {
                uniqueId = `${id}_${n++}`;
            }
            seen.add(uniqueId);

            const type = ["text", "textarea", "url", "number", "select"].includes(
                field.type,
            )
                ? field.type
                : "text";

            const normalized = {
                id: uniqueId,
                label,
                type,
                required: field.required !== false,
            };

            const placeholder = String(field.placeholder ?? "").trim();
            if (placeholder) normalized.placeholder = placeholder;

            if (type === "select") {
                const options = Array.isArray(field.options)
                    ? field.options
                          .map((o) => String(o).trim())
                          .filter(Boolean)
                    : [];
                if (options.length > 0) normalized.options = options;
            }

            return normalized;
        })
        .filter(Boolean);
}

module.exports = {
    validateMoreDetails,
    sanitizeMoreDetails,
    normalizeRegistrationFields,
};
