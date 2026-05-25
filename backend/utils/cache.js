const NodeCache = require("node-cache");

// TTL values in seconds
const TTL = {
    USER: 120,          // 2 min  – auth user lookup
    EVENT: 300,         // 5 min  – single event detail
    EVENT_LIST: 90,     // 90 sec – event lists (invalidated on mutate)
    STATS: 300,         // 5 min  – statistics
    COUNCIL: 600,       // 10 min – council list / profiles
    SEARCH: 60,         // 1 min  – search results
    BUDGET: 120,        // 2 min  – budget items
    DOCS: 120,          // 2 min  – event documents
    ANNOUNCEMENTS: 120, // 2 min  – announcements
};

const cache = new NodeCache({ stdTTL: TTL.EVENT, checkperiod: 60, useClones: false });

// ─── Generic helpers ────────────────────────────────────────────────

function get(key) {
    return cache.get(key);
}

function set(key, value, ttl) {
    if (ttl !== undefined) {
        cache.set(key, value, ttl);
    } else {
        cache.set(key, value);
    }
}

function del(...keys) {
    cache.del(keys);
}

function flush() {
    cache.flushAll();
}

// ─── Key builders ───────────────────────────────────────────────────

const keys = {
    user: (googleId)         => `user:${googleId}`,
    event: (id)              => `event:${id}`,
    eventListCouncil: (uid)  => `events:council:${uid}`,
    eventListStudent: ()     => `events:student:all`,
    eventListCalendar: ()    => `events:calendar`,
    stats: (councilUserId) =>
        councilUserId ? `stats:council:${councilUserId}` : `stats:all`,
    councilList: ()          => `councils:all`,
    councilProfile: (id)     => `council:profile:${id}`,
    search: (q)              => `search:${q}`,
    budget: (eventId)        => `budget:${eventId}`,
    docs: (eventId)          => `docs:${eventId}`,
    announcements: (eventId) => `announcements:${eventId}`,
};

// ─── Invalidation helpers ────────────────────────────────────────────

/** Call whenever an event is created or updated */
function invalidateEvent(eventId, councilUserId) {
    const toDelete = [keys.event(eventId), keys.eventListStudent(), keys.eventListCalendar(), keys.stats()];
    if (councilUserId) {
        toDelete.push(keys.eventListCouncil(councilUserId), keys.stats(councilUserId));
    }
    del(...toDelete);
}

/** Call whenever a council profile is updated */
function invalidateCouncil(councilId) {
    del(keys.councilList(), keys.councilProfile(councilId));
}

// ─── Express cache middleware factory ────────────────────────────────

/**
 * Returns Express middleware that caches the response for `ttl` seconds.
 * The cache key is derived from `keyFn(req)`.
 */
function middleware(keyFn, ttl) {
    return (req, res, next) => {
        const key = keyFn(req);
        const cached = get(key);
        if (cached !== undefined) {
            return res.json(cached);
        }
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200) {
                set(key, body, ttl);
            }
            return originalJson(body);
        };
        next();
    };
}

module.exports = { get, set, del, flush, keys, TTL, invalidateEvent, invalidateCouncil, middleware };
