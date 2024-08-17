// const { Pool } = require("pg");
// const { PrismaPg } = require("@prisma/adapter-pg");
// const { PrismaClient } = require("@prisma/client");

// const connectionString = `${process.env.DATABASE_URL}`;
// const pool = new Pool({
//     connectionString: connectionString,
// });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// module.exports = prisma;

const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const ws = require('ws');

dotenv.config();
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });


module.exports = prisma;