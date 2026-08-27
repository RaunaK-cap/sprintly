import path from "path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma_client = new PrismaClient({ adapter });

export { prisma_client };