import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/User.js";

const authRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenExpiry = "7d";

function issueToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set.");
  return jwt.sign({ sub: user._id.toString(), email: user.email }, secret, { expiresIn: tokenExpiry });
}

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

authRouter.post("/register", async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";

    if (name.length < 2 || name.length > 100 || !emailPattern.test(email) || password.length < 8 || password.length > 128) {
      return response.status(400).json({ message: "Use a valid name, email, and password of 8-128 characters." });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) return response.status(409).json({ message: "An account with that email already exists." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    return response.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body.password === "string" ? request.body.password : "";
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ message: "Email or password is incorrect." });
    }

    return response.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/logout", (_request, response) => {
  response.json({ message: "You have been logged out." });
});

export { authRouter };
