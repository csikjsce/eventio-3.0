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
    };
}

function councilSignatoriesFromDocument(document) {
    if (!document || typeof document !== "object") return [];
    const list = document.signatories;
    if (!Array.isArray(list)) return [];
    return list.filter((s) => s && String(s.name || "").trim());
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

module.exports = {
    signatoryKey,
    normalizeProposal,
    councilSignatoriesFromDocument,
    allCouncilSignatoriesSigned,
    getSignaturePngUrl,
};
