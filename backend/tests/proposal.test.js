const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const express = require('express');
const {
    allCouncilSignatoriesSigned, normalizeProposal, embedFacultyReviewersInDocument,
    validateProposalDocument, clearFacultySignatures,
} = require('../utils/proposal-document');

const council = { id: 10, role: 'COUNCIL', name: 'Council' };
const faculty = { id: 20, role: 'FACULTY', name: 'Advisor', email: 'advisor@example.test', signature: { png_url: 'https://example.test/faculty.png' } };
const advisor = { name: faculty.name, email: faculty.email, designation: 'Professor', dept: 'CS', council: { user_id: council.id } };
function draft() {
    return {
        kind: 'permission_letter', permissionTemplate: 'event', eventId: '1',
        permission: { subject: 'Permission for event', body: 'Please approve.' },
        signatories: [{ memberId: 3, name: 'Head', role: 'President', signatureUrl: 'https://example.test/head.png' }],
        assignedFacultyReviewers: [advisor],
    };
}
function proposal() {
    return { version: 1, document: draft(), councilSignatures: [], facultySignatures: [], returnHistory: [] };
}

// Exercise the real Express handlers and faculty-access helpers, replacing only
// external boundaries. Never import prisma_client or load a database URL.
async function fixture(t, overrides = {}) {
    let row = {
        id: 1, organizer_id: council.id, state: 'DRAFT', state_history: ['DRAFT'],
        assigned_faculty_emails: [], proposal_document: proposal(),
        updated_at: new Date('2026-01-01T00:00:00Z'), ...overrides,
    };
    let user = council, readHook = null, writes = 0, reads = 0;
    const invalidations = [];
    const prisma = {
        events: {
            async findUnique({ where }) {
                reads++;
                const snapshot = where.id === row.id ? structuredClone(row) : null;
                if (readHook) await readHook();
                return snapshot;
            },
            async updateMany({ where, data }) {
                if (where.id !== row.id || where.state !== row.state ||
                    +where.updated_at !== +row.updated_at) return { count: 0 };
                assert.ok(data.updated_at > row.updated_at, 'successful writes must advance the version');
                row = { ...row, ...structuredClone(data) };
                writes++;
                return { count: 1 };
            },
            async update({ data }) {
                row = { ...row, ...structuredClone(data), updated_at: new Date(+row.updated_at + 1) };
                writes++;
                return structuredClone(row);
            },
        },
        councilProfile: { async findUnique() { return { faculty_advisors: [advisor] }; } },
        facultyAdvisor: { async findMany({ where }) { return where.email.equals.toLowerCase() === faculty.email ? [advisor] : []; } },
    };
    const cache = new Map();
    const mocks = {
        '../utils/prisma_client': prisma,
        './prisma_client': prisma,
        '@prisma/client': { Prisma: {} },
        '../utils/logger': { error() {} },
        '../utils/mailer': {},
        '../middleware/auth.middleware': (req, res, next) => {
            if (!user) return res.status(401).json({ error: true });
            req.user = user;
            next();
        },
        '../utils/cache': { invalidateEvent: (...args) => invalidations.push(args), keys: {}, TTL: {} },
    };
    function load(filename) {
        if (cache.has(filename)) return cache.get(filename).exports;
        const module = { exports: {} };
        cache.set(filename, module);
        const nativeRequire = createRequire(filename);
        const requireMock = (id) => {
            if (Object.hasOwn(mocks, id)) return mocks[id];
            if (id === '../utils/faculty-access' || id === '../middleware/field-validator.middlware') {
                return load(nativeRequire.resolve(id));
            }
            return nativeRequire(id);
        };
        const wrapper = vm.runInThisContext(`(function(require,module,exports,console){${fs.readFileSync(filename, 'utf8')}\n})`, { filename });
        wrapper(requireMock, module, module.exports, { log() {}, error() {} });
        return module.exports;
    }
    const app = express();
    app.use(express.json());
    app.use('/api/v1/event', load(path.resolve(__dirname, '../routes/event.route.js')));
    const server = await new Promise(resolve => {
        const server = app.listen(0, '127.0.0.1', () => resolve(server));
    });
    t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
    return {
        get row() { return row; }, get writes() { return writes; }, get reads() { return reads; }, invalidations,
        user(value) { user = value; }, onRead(value) { readHook = value; },
        async request(method, suffix = '', body, endpoint = 'proposal/1') {
            const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/event/p/${endpoint}${suffix}`, {
                method, headers: { 'Content-Type': 'application/json' },
                ...(body === undefined ? {} : { body: JSON.stringify(body) }),
            });
            return { status: response.status, body: await response.json() };
        },
    };
}

test('unsigned or malformed signature records never satisfy signing', () => {
    const p = proposal();
    delete p.document.signatories[0].signatureUrl;
    for (const signatures of [[null], [{ memberId: 3, name: 'Head' }], [{ memberId: 3, png_url: ' ' }]]) {
        p.councilSignatures = signatures;
        assert.equal(allCouncilSignatoriesSigned(p), false);
    }
    p.councilSignatures = [{ memberId: 3, png_url: 'https://example.test/sign.png' }];
    assert.equal(allCouncilSignatoriesSigned(p), true);
    p.document.signatories = [];
    assert.equal(allCouncilSignatoriesSigned(p), false);
});

test('legacy malformed arrays normalize without throwing; empty reviewer selection removes slots', () => {
    assert.deepEqual(normalizeProposal({ document: [], facultySignatures: [null] }).facultySignatures, []);
    assert.equal(normalizeProposal({ document: [] }).document, null);
    assert.equal(embedFacultyReviewersInDocument({ signatories: {} }, [advisor]).signatories.length, 1);
    const document = embedFacultyReviewersInDocument(draft(), [advisor]);
    assert.equal(embedFacultyReviewersInDocument(document, []).signatories.length, 1);
    assert.equal(validateProposalDocument(draft()), null);
});

test('invalid IDs return 400 before any database lookup', async t => {
    const f = await fixture(t);
    for (const id of ['1abc', '0', '-1', '1.5', '1e2', '2147483648']) {
        assert.equal((await f.request('GET', '', undefined, `proposal/${id}`)).status, 400);
    }
    assert.equal(f.reads, 0);
});

test('authentication, ownership and missing events are enforced', async t => {
    const f = await fixture(t);
    f.user(null);
    assert.equal((await f.request('GET')).status, 401);
    f.user({ ...council, id: 99 });
    assert.equal((await f.request('GET')).status, 403);
    assert.equal((await f.request('PUT', '', { document: draft() })).status, 403);
    assert.equal((await f.request('POST', '/submit', { assigned_faculty_emails: [faculty.email] })).status, 403);
    f.user(council);
    assert.equal((await f.request('GET', '', undefined, 'proposal/999')).status, 404);
    f.user({ ...faculty, email: 'unrelated@example.test' });
    assert.equal((await f.request('GET')).status, 403);
    assert.equal(f.writes, 0);
});

test('malformed documents and signature payloads are rejected without writes', async t => {
    const f = await fixture(t);
    for (const document of [null, [], {}, { ...draft(), signatories: {} }, { ...draft(), signatories: [null] }, { ...draft(), permission: { body: 7 } }]) {
        assert.equal((await f.request('PUT', '', { document })).status, 400);
    }
    assert.equal((await f.request('PUT', '', { document: draft(), councilSignatures: [{ name: 'Head' }] })).status, 400);
    assert.equal(f.writes, 0);
});

test('save/load preserves draft reviewers, removes injected faculty signatures and stale council records', async t => {
    const f = await fixture(t);
    const document = embedFacultyReviewersInDocument(draft(), [advisor]);
    document.signatories[1].signatureUrl = 'https://example.test/injected.png';
    delete document.signatories[0].signatureUrl;
    document.eventId = '999';
    assert.equal((await f.request('PUT', '', { document })).status, 200);
    const loaded = (await f.request('GET')).body.proposal;
    assert.equal(loaded.document.eventId, '1');
    assert.equal(loaded.document.assignedFacultyReviewers[0].email, faculty.email);
    assert.equal(loaded.document.signatories[1].signatureUrl, undefined);
    assert.deepEqual(loaded.councilSignatures, []);
    assert.equal(allCouncilSignatoriesSigned(loaded), false);
    assert.deepEqual(f.invalidations.at(-1), [1, council.id]);
});

test('submitted proposals cannot be edited and cannot submit twice', async t => {
    const f = await fixture(t);
    assert.equal((await f.request('POST', '/submit', { assigned_faculty_emails: ['other@example.test'] })).status, 400);
    assert.equal((await f.request('POST', '/submit', { assigned_faculty_emails: [` ${faculty.email.toUpperCase()} `] })).status, 200);
    assert.equal(f.row.state, 'APPLIED_FOR_APPROVAL');
    assert.deepEqual(f.row.assigned_faculty_emails, [faculty.email]);
    assert.ok(f.row.proposal_document.submittedAt);
    assert.equal((await f.request('PUT', '', { document: draft() })).status, 400);
    assert.equal((await f.request('POST', '/submit', { assigned_faculty_emails: [faculty.email] })).status, 400);
    assert.equal(f.writes, 1);
});

test('faculty signing and approval invalidate the council cache', async t => {
    const f = await fixture(t, { state: 'APPLIED_FOR_APPROVAL', assigned_faculty_emails: [faculty.email] });
    f.user(faculty);
    assert.equal((await f.request('POST', '/faculty-sign', { approve: true })).status, 400);
    assert.equal((await f.request('POST', '/faculty-sign', {})).status, 200);
    assert.equal((await f.request('POST', '/faculty-sign', { approve: true })).status, 200);
    assert.equal(f.row.state, 'UNLISTED');
    assert.deepEqual(f.invalidations, [[1, council.id], [1, council.id]]);
});

test('return and resubmit clear old reviewer signatures and keep return history', async t => {
    const p = proposal();
    p.document = embedFacultyReviewersInDocument(p.document, [advisor]);
    p.document.signatories[1].signatureUrl = faculty.signature.png_url;
    p.facultySignatures = [{ user_id: faculty.id, email: faculty.email, png_url: faculty.signature.png_url }];
    const f = await fixture(t, { state: 'APPLIED_FOR_APPROVAL', proposal_document: p, assigned_faculty_emails: [faculty.email] });
    f.user(faculty);
    assert.equal((await f.request('POST', '', { state: 'DRAFT', comment: 'Fix venue' }, 'update/1')).status, 200);
    assert.equal(f.row.proposal_document.document.signatories[1].signatureUrl, undefined);
    assert.deepEqual(f.row.proposal_document.facultySignatures, []);
    assert.equal(f.row.proposal_document.returnHistory[0].note, 'Fix venue');
    f.user(council);
    assert.equal((await f.request('POST', '', { state: 'APPLIED_FOR_APPROVAL' }, 'update/1')).status, 200);
    assert.ok(f.row.proposal_document.submittedAt);
    assert.equal(f.row.proposal_document.returnHistory[0].note, 'Fix venue');
    f.user(faculty);
    assert.equal((await f.request('POST', '/faculty-sign', { approve: true })).status, 400);
});

test('withdraw clears embedded signatures even without a matching signature record', async t => {
    const p = proposal();
    p.document = embedFacultyReviewersInDocument(p.document, [advisor]);
    p.document.signatories[1].signatureUrl = faculty.signature.png_url;
    const f = await fixture(t, { state: 'APPLIED_FOR_APPROVAL', proposal_document: p });
    assert.equal((await f.request('POST', '/unsubmit', {})).status, 200);
    assert.equal(f.row.state, 'DRAFT');
    assert.equal(f.row.proposal_document.document.signatories[1].signatureUrl, undefined);
    assert.ok(f.row.proposal_document.document.signatories[0].signatureUrl);
    assert.deepEqual(clearFacultySignatures(p).facultySignatures, []);
});

test('general event update cannot bypass proposal save validation', async t => {
    const f = await fixture(t, { state: 'APPLIED_FOR_APPROVAL' });
    const before = structuredClone(f.row.proposal_document);
    assert.equal((await f.request('POST', '', { proposal_document: { document: 'invalid' } }, 'update/1')).status, 200);
    assert.deepEqual(f.row.proposal_document, before);
});

test('council cannot reset an approved event to draft to unlock proposal editing', async t => {
    const f = await fixture(t, { state: 'UNLISTED' });
    const before = structuredClone(f.row.proposal_document);
    const reset = await f.request('POST', '', { state: 'DRAFT' }, 'update/1');
    assert.equal(reset.status, 403);
    assert.equal((await f.request('PUT', '', {
        document: { ...draft(), permission: { subject: 'Changed after approval' } },
    })).status, 400);
    assert.equal(f.row.state, 'UNLISTED');
    assert.deepEqual(f.row.proposal_document, before);
    assert.equal(f.writes, 0);
});

test('council cannot bypass review by assigning approval or publishing states', async t => {
    for (const state of ['DRAFT', 'APPLIED_FOR_APPROVAL', 'APPLIED_FOR_PRINCI_APPROVAL']) {
        const f = await fixture(t, { state });
        for (const newState of ['UNLISTED', 'UPCOMING', 'REGISTRATION_OPEN', 'APPLIED_FOR_PRINCI_APPROVAL']) {
            if (state === newState) continue;
            assert.equal((await f.request('POST', '', { state: newState }, 'update/1')).status, 403);
        }
        assert.equal(f.row.state, state);
        assert.equal(f.writes, 0);
    }
});

test('state update operators cannot bypass transition checks', async t => {
    const f = await fixture(t, { state: 'UNLISTED' });
    for (const state of [{ set: 'DRAFT' }, null, ['DRAFT']]) {
        assert.equal((await f.request('POST', '', { state }, 'update/1')).status, 400);
    }
    assert.equal(f.row.state, 'UNLISTED');
    assert.equal(f.writes, 0);
});

test('council can manage approved events but cannot move them back into proposal editing', async t => {
    const f = await fixture(t, { state: 'UNLISTED' });
    const before = structuredClone(f.row.proposal_document);
    for (const state of ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'PRIVATE']) {
        assert.equal((await f.request('POST', '', { state }, 'update/1')).status, 200);
        assert.equal(f.row.state, state);
    }
    for (const state of ['DRAFT', 'APPLIED_FOR_APPROVAL', 'APPLIED_FOR_PRINCI_APPROVAL']) {
        assert.equal((await f.request('POST', '', { state }, 'update/1')).status, 403);
    }
    assert.equal((await f.request('POST', '/unsubmit', {})).status, 400);
    assert.equal(f.row.state, 'PRIVATE');
    assert.deepEqual(f.row.proposal_document, before);
});

test('pending council withdrawals must use the route that clears reviewer signatures', async t => {
    const f = await fixture(t, { state: 'APPLIED_FOR_APPROVAL' });
    assert.equal((await f.request('POST', '', { state: 'DRAFT' }, 'update/1')).status, 403);
    assert.equal((await f.request('POST', '/unsubmit', {})).status, 200);
    assert.equal(f.row.state, 'DRAFT');
});

test('overlapping save and submit requests produce a conflict instead of overwriting', async t => {
    const f = await fixture(t);
    let count = 0, release;
    const gate = new Promise(resolve => { release = resolve; });
    f.onRead(async () => { if (++count === 2) release(); await gate; });
    const results = await Promise.all([
        f.request('PUT', '', { document: { ...draft(), permission: { subject: 'New revision' } } }),
        f.request('POST', '/submit', { assigned_faculty_emails: [faculty.email] }),
    ]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
    assert.equal(f.writes, 1);
    assert.equal(f.row.state === 'APPLIED_FOR_APPROVAL' && f.row.proposal_document.document.permission.subject === 'New revision', false);
});
