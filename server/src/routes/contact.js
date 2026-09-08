import { Router } from "express";
import { ContactMessage } from "../models/ContactMessage.js";

const contactRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(value) {
  return typeof value === "string" ? value.trim() : "";
}

contactRouter.post("/", async (request, response, next) => {
  try {
    const name = readText(request.body.name);
    const email = readText(request.body.email).toLowerCase();
    const message = readText(request.body.message);

    if (name.length < 2 || name.length > 100) {
      return response.status(400).json({ message: "Please provide a name between 2 and 100 characters." });
    }

    if (email.length > 254 || !emailPattern.test(email)) {
      return response.status(400).json({ message: "Please provide a valid email address." });
    }

    if (message.length < 10 || message.length > 2_000) {
      return response.status(400).json({ message: "Please provide a message between 10 and 2,000 characters." });
    }

    await ContactMessage.create({ name, email, message });
    return response.status(201).json({ message: "Thank you. Your message has been sent." });
  } catch (error) {
    return next(error);
  }
});

export { contactRouter };
