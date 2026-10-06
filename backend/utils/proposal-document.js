function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonemptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function parseProposalEventId(value) {
    if (!/^[1-9]\d*$/.test(String(value))) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

// Draft text may be empty, but its structure must be safe for the document renderer.
function validateProposalDocument(document) {
    if (!isRecord(document) || document.kind !== "permission_letter") {
        return "A permission-letter document is required.";
    }
    if (!isRecord(document.permission) || typeof document.permission.subject !== "string" ||
        Object.values(document.permission).some((value) => typeof value !== "string")) {
        return "Proposal permission fields must be text.";
    }
    if (document.report !== undefined && (!isRecord(document.report) ||
        Object.values(document.report).some((value) => typeof value !== "string"))) {
        return "Proposal report fields must be text.";
    }
    if (document.permissionTemplate !== undefined &&
        !["event", "venue", "banner", "pr", "custom"].includes(document.permissionTemplate)) {
        return "Invalid permission template.";
    }
    if (document.letterheadUrl !== undefined && typeof document.letterheadUrl !== "string") {
        return "Letterhead URL must be text.";
    }
    if (!Array.isArray(document.signatories) || document.signatories.some((s) =>
        !isRecord(s) || typeof s.name !== "string" || typeof s.role !== "string" ||
        (s.memberId !== undefined && parseProposalEventId(s.memberId) === null) ||
        (s.facultyReviewer !== undefined && typeof s.facultyReviewer !== "boolean") ||
        ["email", "signatureUrl", "signedAt"].some((key) => s[key] !== undefined && typeof s[key] !== "string")
    )) {
        return "Proposal signatories must be a list of valid signatories.";
    }
    if (document.assignedFacultyReviewers !== undefined &&
        (!Array.isArray(document.assignedFacultyReviewers) || document.assignedFacultyReviewers.some((r) =>
            !isRecord(r) || !nonemptyString(r.email) || typeof r.name !== "string" ||
            ["designation", "dept"].some((key) => r[key] !== undefined && typeof r[key] !== "string")
        ))) {
        return "Faculty reviewers must be a list of names and email addresses.";
    }
    return null;
}

function validateCouncilSignatures(signatures) {
    if (signatures === undefined) return null;
    if (!Array.isArray(signatures) || signatures.some((s) =>
        !isRecord(s) || !nonemptyString(s.name) || !getSignaturePngUrl(s) ||
        (s.memberId !== undefined && parseProposalEventId(s.memberId) === null) ||
        ["role", "email", "signed_at"].some((key) => s[key] !== undefined && typeof s[key] !== "string")
    )) {
        return "Council signatures must include a name and signature image URL.";
    }
    return null;
}

function clearFacultySignatures(proposal) {
    const document = proposal.document;
    return {
        ...proposal,
        facultySignatures: [],
        submittedAt: null,
        document: isRecord(document) && Array.isArray(document.signatories)
            ? {
                ...document,
                signatories: document.signatories.map((s) => {
                    if (!s?.facultyReviewer) return s;
                    const { signatureUrl, signedAt, ...unsigned } = s;
                    return unsigned;
                }),
            }
            : document,
    };
}

function signatoryKey(sig) {
    if (sig.memberId != null) return `member:${sig.memberId}`;
    if (sig.email) return `email:${String(sig.email).trim().toLowerCase()}`;
    return `name:${String(sig.name || "").trim().toLowerCase()}`;
}

function removeFacultySignatureFromDocument(document, email) {
    if (!document || typeof document !== "object" || !email) {
        return document;
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!Array.isArray(document.signatories)) return document;

    return {
        ...document,
        signatories: document.signatories.map((s) => {
            if (!s?.facultyReviewer) return s;
            if (String(s.email || "").trim().toLowerCase() !== normalizedEmail) return s;
            const { signatureUrl, signedAt, ...rest } = s;
            return rest;
        }),
    };
}

function normalizeProposal(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return {
            version: 1,
            document: null,
            councilSignatures: [],
            facultySignatures: [],
        };
    }

    return {
        version: 1,
        document: isRecord(raw.document) ? raw.document : null,
        councilSignatures: Array.isArray(raw.councilSignatures)
            ? raw.councilSignatures.filter(isRecord)
            : [],
        facultySignatures: Array.isArray(raw.facultySignatures)
            ? raw.facultySignatures.filter(isRecord)
            : [],
        submittedAt: raw.submittedAt ?? null,
        // Keep reviewer return notes across normalize/save cycles
        returnHistory: Array.isArray(raw.returnHistory) ? raw.returnHistory : [],
    };
}

function councilSignatoriesFromDocument(document) {
    if (!document || typeof document !== "object") return [];
    const list = document.signatories;
    if (!Array.isArray(list)) return [];
    return list.filter(
        (s) => s && String(s.name || "").trim() && !s.facultyReviewer,
    );
}

function allCouncilSignatoriesSigned(proposal) {
    const signatories = councilSignatoriesFromDocument(proposal.document);
    if (signatories.length === 0) return false;

    const signedKeys = new Set(
        (Array.isArray(proposal.councilSignatures) ? proposal.councilSignatures : [])
        .filter((s) => getSignaturePngUrl(s))
        .map((s) =>
            signatoryKey({
                memberId: s.memberId,
                name: s.name,
                email: s.email,
            }),
        ),
    );

    return signatories.every((sig) => {
        if (
            nonemptyString(sig.signatureUrl)
        ) {
            return true;
        }
        return signedKeys.has(
            signatoryKey({
                memberId: sig.memberId,
                name: sig.name,
                email: sig.email,
            }),
        );
    });
}

function getSignaturePngUrl(signature) {
    if (!signature || typeof signature !== "object" || Array.isArray(signature)) {
        return null;
    }
    const url = signature.png_url;
    return typeof url === "string" && url.trim() ? url.trim() : null;
}

function buildFacultyRecipientBlock(reviewers) {
    if (!Array.isArray(reviewers) || reviewers.length === 0) return "";
    return reviewers
        .map((r) => {
            const lines = [r.name || r.email];
            if (r.designation?.trim()) lines.push(r.designation.trim());
            if (r.dept?.trim()) lines.push(r.dept.trim());
            lines.push(
                "K J Somaiya School of Engineering",
                "Somaiya Vidyavihar University",
            );
            return lines.join("\n");
        })
        .join("\n\n");
}

function facultyReviewersToSignatories(reviewers) {
    if (!Array.isArray(reviewers)) return [];
    return reviewers.map((r) => ({
        name: r.name || r.email,
        email: r.email,
        role: (r.designation && String(r.designation).trim()) || "Faculty Advisor",
        facultyReviewer: true,
    }));
}

function embedFacultyReviewersInDocument(document, reviewers) {
    if (!isRecord(document) || !Array.isArray(reviewers)) {
        return document;
    }

    const councilSignatories = Array.isArray(document.signatories)
        ? document.signatories.filter((s) => isRecord(s) && !s.facultyReviewer)
        : [];

    const existingByEmail = new Map(
        (Array.isArray(document.signatories) ? document.signatories : [])
            .filter((s) => s?.facultyReviewer && s?.email)
            .map((s) => [String(s.email).trim().toLowerCase(), s]),
    );

    const facultySignatories = facultyReviewersToSignatories(reviewers).map(
        (f) => {
            const prev = existingByEmail.get(String(f.email).trim().toLowerCase());
            if (!prev?.signatureUrl) return f;
            return {
                ...f,
                signatureUrl: prev.signatureUrl,
                signedAt: prev.signedAt,
            };
        },
    );

    return {
        ...document,
        assignedFacultyReviewers: reviewers,
        signatories: [...councilSignatories, ...facultySignatories],
    };
}

function applyFacultySignatureToDocument(document, facultySig) {
    if (!document || typeof document !== "object" || !facultySig?.email) {
        return document;
    }
    const email = String(facultySig.email).trim().toLowerCase();
    if (!Array.isArray(document.signatories)) return document;

    return {
        ...document,
        signatories: document.signatories.map((s) => {
            if (!s?.facultyReviewer) return s;
            if (String(s.email || "").trim().toLowerCase() !== email) return s;
            return {
                ...s,
                signatureUrl: facultySig.png_url,
                signedAt: facultySig.signed_at,
            };
        }),
    };
}

module.exports = {
    parseProposalEventId,
    validateProposalDocument,
    validateCouncilSignatures,
    clearFacultySignatures,
    signatoryKey,
    normalizeProposal,
    councilSignatoriesFromDocument,
    allCouncilSignatoriesSigned,
    getSignaturePngUrl,
    buildFacultyRecipientBlock,
    embedFacultyReviewersInDocument,
    applyFacultySignatureToDocument,
    removeFacultySignatureFromDocument, 
    facultyReviewersToSignatories,
};
