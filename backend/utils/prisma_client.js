const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let prisma;

if (connectionString.includes("neon.tech")) {
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const ws = require("ws");

    neonConfig.webSocketConstructor = ws;

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ adapter });
} else {
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
}

module.exports = prisma;
