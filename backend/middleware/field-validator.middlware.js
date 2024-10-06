const restrictedFieldsByRole = {
    id: {
        unrestrictedRoles: [],
        restrictedRole: ["all"],
    },
    role: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    fee: {
        unrestrictedRoles: ["ADMIN", "COUNCIL"],
        restrictedRole: ["all"],
    },
    amount: {
        unrestrictedRoles: ["ADMIN", "COUNCIL"],
        restrictedRole: ["all"],
    },
    organizer_id: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    comment: {
        unrestrictedRoles: ["ADMIN", "FACULTY"],
        restrictedRole: ["all"],
    },
    state: {
        unrestrictedRoles: ["ADMIN", "COUNCIL", "FACULTY"],
        restrictedRole: ["all"],
    },
    state_history: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    created_at: {
        unrestrictedRoles: [],
        restrictedRole: ["all"],
    },
    updated_at: {
        unrestrictedRoles: [],
        restrictedRole: ["all"],
    },
    payment_status: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    paid_on: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    registered_on: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    attended: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    council_type: {
        unrestrictedRoles: ["ADMIN", "COUNCIL"],
        restrictedRole: ["all"],
    },
    is_somaiya_student: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    google_id: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    email: {
        unrestrictedRoles: ["ADMIN"],
        restrictedRole: ["all"],
    },
    refresh_token: {
        unrestrictedRoles: [],
        restrictedRole: ["all"],
    },
};
const validateUpdateFields = (req, res, next) => {
    const { role } = req.user;
    const field = req.body;
    console.log(field, role);
    Object.keys(field).forEach((key) => {
        if (
            restrictedFieldsByRole[key] &&
            (restrictedFieldsByRole[key].restrictedRole.includes(role) ||
                restrictedFieldsByRole[key].restrictedRole.includes("all")) &&
            !restrictedFieldsByRole[key].unrestrictedRoles.includes(role)
        ) {
            delete field[key];
            console.log(field);
        }
    });
    req.body = field;
    next();
};

module.exports = validateUpdateFields;
