import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function requireAuth(request, response, next) {
  const authorization = request.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return response.status(401).json({ message: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return response.status(401).json({ message: "Your account could not be found." });
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ message: "Your session has expired. Please log in again." });
    }

    return next(error);
  }
}
