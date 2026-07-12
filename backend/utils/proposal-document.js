function signatoryKey(sig) {
    if (sig.memberId != null) return `member:${sig.memberId}`;
    if (sig.email) return `email:${String(sig.email).trim().toLowerCase()}`;
    return `name:${String(sig.name || "").trim().toLowerCase()}`;
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
        document: raw.document ?? null,
        councilSignatures: Array.isArray(raw.councilSignatures)
            ? raw.councilSignatures
            : [],
        facultySignatures: Array.isArray(raw.facultySignatures)
            ? raw.facultySignatures
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
        (proposal.councilSignatures ?? []).map((s) =>
            signatoryKey({
                memberId: s.memberId,
                name: s.name,
                email: s.email,
            }),
        ),
    );

    return signatories.every((sig) => {
        if (
            sig.signatureUrl &&
            String(sig.signatureUrl).trim()
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
    if (!document || typeof document !== "object" || !reviewers?.length) {
        return document;
    }

    const councilSignatories = Array.isArray(document.signatories)
        ? document.signatories.filter((s) => !s?.facultyReviewer)
        : [];

    const existingByEmail = new Map(
        (document.signatories ?? [])
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
    signatoryKey,
    normalizeProposal,
    councilSignatoriesFromDocument,
    allCouncilSignatoriesSigned,
    getSignaturePngUrl,
    buildFacultyRecipientBlock,
    embedFacultyReviewersInDocument,
    applyFacultySignatureToDocument,
    facultyReviewersToSignatories,
};
