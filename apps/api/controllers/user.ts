import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema } from "../types";
import { prisma_client } from "../../../packages/database";

const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req: Request, res: Response) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid input data"
      });
    }

    const { firstname, lastname, email, password } = parseResult.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma_client.users.upsert({
      where: {
        email: email,
      },
      update: {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPassword
      },
      create: {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPassword,
      },
    });


    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup Error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const parseResult = signinSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma_client.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }


    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Signed in successfully",
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};