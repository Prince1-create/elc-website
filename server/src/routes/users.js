import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";

const usersRouter = Router();

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

usersRouter.use(requireAuth);

usersRouter.get("/me", (request, response) => {
  response.json({ user: publicUser(request.user) });
});

usersRouter.patch("/me", async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const currentPassword = typeof request.body.currentPassword === "string" ? request.body.currentPassword : "";
    const newPassword = typeof request.body.newPassword === "string" ? request.body.newPassword : "";

    if (name && (name.length < 2 || name.length > 100)) {
      return response.status(400).json({ message: "Name must be between 2 and 100 characters." });
    }

    if (newPassword && (newPassword.length < 8 || newPassword.length > 128 || !currentPassword)) {
      return response.status(400).json({ message: "A current password and a new password of 8-128 characters are required." });
    }

    if (newPassword) {
      const userWithPassword = await User.findById(request.user._id).select("+passwordHash");
      const matches = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
      if (!matches) return response.status(401).json({ message: "Current password is incorrect." });
      request.user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (name) request.user.name = name;
    await request.user.save();
    return response.json({ user: publicUser(request.user) });
  } catch (error) {
    return next(error);
  }
});

export { usersRouter };
