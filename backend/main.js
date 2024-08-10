require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const httpLogger = require("./utils/logger_middleware");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const logger = require("./utils/logger");

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ url: connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

//middlewares
app.use(httpLogger);
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// routes
app.get("/gg", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: "aryan",
        about: "gg",
        brach: "Computer_Engineering",
        college: "gg",
        degree: "gg",
        email: "ary.dev0114@gmail.com",
        gender: "MALE",
        is_somaiya_student: true,
        phone_number: 9512388235,
        photo_url: "fef",
        roll_number: 16010121137,
        year: 2025,
        interests: ["fe"],
        council_type: "fe",
      },
    });
    logger.info(user);
  } catch (er) {
    console.log(er)
  }
  res.send("hiee");
});
// app.use("/api/orders", orderRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started on port ${port}`));
