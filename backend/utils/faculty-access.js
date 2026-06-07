const prisma = require("./prisma_client");

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function normalizeAssignedFacultyEmails(emails) {
    if (!Array.isArray(emails)) return [];
    return [
        ...new Set(emails.map(normalizeEmail).filter(Boolean)),
    ];
}

/** On APPLIED_FOR_APPROVAL: empty list = any advisor of the council may review. */
function facultyIsAssignedToEvent(userEmail, assignedEmails) {
    const list = assignedEmails ?? [];
    if (list.length === 0) return true;
    const norm = normalizeEmail(userEmail);
    return list.some((e) => normalizeEmail(e) === norm);
}

async function getCouncilOrganizerIdsForFaculty(facultyEmail) {
    const email = String(facultyEmail || "").trim();
    if (!email) return [];

    const advisors = await prisma.facultyAdvisor.findMany({
        where: {
            email: { equals: email, mode: "insensitive" },
        },
        select: {
            council: { select: { user_id: true } },
        },
    });

    return [...new Set(advisors.map((a) => a.council.user_id))];
}

async function getCouncilAdvisorEmails(councilUserId) {
    const profile = await prisma.councilProfile.findUnique({
        where: { user_id: councilUserId },
        include: {
            faculty_advisors: { select: { email: true } },
        },
    });
    return (profile?.faculty_advisors ?? []).map((a) =>
        normalizeEmail(a.email),
    );
}

async function resolveAssignedFacultyReviewers(councilUserId, assignedEmails) {
    const emails = normalizeAssignedFacultyEmails(assignedEmails);
    if (emails.length === 0) return [];

    const profile = await prisma.councilProfile.findUnique({
        where: { user_id: councilUserId },
        include: { faculty_advisors: true },
    });

    const byEmail = new Map(
        (profile?.faculty_advisors ?? []).map((a) => [
            normalizeEmail(a.email),
            a,
        ]),
    );

    return emails.map((email) => {
        const advisor = byEmail.get(email);
        if (!advisor) {
            return { email, name: email, designation: "", dept: "" };
        }
        return {
            email,
            name: advisor.name,
            designation: advisor.designation ?? "",
            dept: advisor.dept ?? "",
        };
    });
}

async function isListedFacultyAdvisor(email) {
    const trimmed = String(email || "").trim();
    if (!trimmed) return false;

    const count = await prisma.facultyAdvisor.count({
        where: {
            email: { equals: trimmed, mode: "insensitive" },
        },
    });
    return count > 0;
}

/**
 * Council adds a faculty email before first login — on sign-in, promote USER → FACULTY
 * so the faculty portal accepts them and council-scoped events appear.
 * Does not change COUNCIL, PRINCIPAL, or ADMIN roles.
 */
async function ensureFacultyRoleForAdvisor(user) {
    if (!user?.email || user.role !== "USER") return user;
    if (!(await isListedFacultyAdvisor(user.email))) return user;

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: "FACULTY" },
    });

    try {
        const { del, keys } = require("./cache");
        if (user.google_id) del(keys.user(user.google_id));
    } catch {
        /* cache optional */
    }

    return updated;
}

/** Role for a brand-new account (Admins table wins, then faculty advisor list). */
async function resolveRoleForNewUser(email, adminRole) {
    if (adminRole) return adminRole;
    if (await isListedFacultyAdvisor(email)) return "FACULTY";
    return "USER";
}

async function facultyCanAccessEvent(facultyUser, event) {
    if (!facultyUser || facultyUser.role !== "FACULTY") return true;

    const councilIds = await getCouncilOrganizerIdsForFaculty(facultyUser.email);
    if (!councilIds.includes(event.organizer_id)) return false;

    if (event.state === "APPLIED_FOR_APPROVAL") {
        return facultyIsAssignedToEvent(
            facultyUser.email,
            event.assigned_faculty_emails,
        );
    }

    return true;
}

function filterEventsForFaculty(events, facultyEmail, councilIds) {
    const ids = councilIds ?? [];
    if (ids.length === 0) return [];

    return events.filter((e) => {
        if (!ids.includes(e.organizer_id)) return false;
        if (e.state === "APPLIED_FOR_APPROVAL") {
            return facultyIsAssignedToEvent(
                facultyEmail,
                e.assigned_faculty_emails,
            );
        }
        return true;
    });
}

module.exports = {
    normalizeEmail,
    normalizeAssignedFacultyEmails,
    facultyIsAssignedToEvent,
    getCouncilOrganizerIdsForFaculty,
    getCouncilAdvisorEmails,
    resolveAssignedFacultyReviewers,
    isListedFacultyAdvisor,
    ensureFacultyRoleForAdvisor,
    resolveRoleForNewUser,
    facultyCanAccessEvent,
    filterEventsForFaculty,
};
