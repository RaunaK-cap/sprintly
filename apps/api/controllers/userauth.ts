import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema } from "../types";
import { prisma_client } from "database";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

function publicUser(user: {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}) {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  };
}

export const signup = async (req: Request, res: Response) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: parseResult.error.issues,
      });
    }

    const { firstname, lastname, password } = parseResult.data;
    // Always store emails in the same shape so signin/invites match.
    const email = parseResult.data.email.trim().toLowerCase();

    const existingUser = await prisma_client.users.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create (not upsert) — signup must never change an existing password.
    const user = await prisma_client.users.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: publicUser(user),
    });
  } catch (error) {
    // Handles the race when two signups use the same email at once.
    if ((error as { code?: string })?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Signup Error", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const parseResult = signinSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    const email = parseResult.data.email.trim().toLowerCase();
    const { password } = parseResult.data;

    const user = await prisma_client.users.findUnique({
      where: { email },
    });

    // Same message for unknown email and wrong password.
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Signed in successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
