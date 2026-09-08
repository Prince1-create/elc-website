import dns from "node:dns/promises";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { contactRouter } from "./routes/contact.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";

dotenv.config();

const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many authentication attempts. Please try again later." },
  }),
  authRouter,
);

app.use("/api/users", usersRouter);

app.use(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many contact requests. Please try again later." },
  }),
  contactRouter,
);

app.use((_request, response) => {
  response.status(404).json({ message: "The requested API route was not found." });
});

app.use((error, _request, response, _next) => {
  if (error?.type === "entity.parse.failed") {
    return response.status(400).json({ message: "The request body is not valid JSON." });
  }

  if (error?.code === 11000) {
    return response.status(409).json({ message: "An account with that email already exists." });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return response.status(400).json({ message: "Please check the form fields and try again." });
  }

  if (error instanceof mongoose.Error.CastError) {
    return response.status(400).json({ message: "The request contains an invalid identifier." });
  }

  if (error?.message === "Origin is not allowed by CORS.") {
    return response.status(403).json({ message: error.message });
  }

  console.error("Unhandled API error:", error);
  return response.status(500).json({ message: "Unable to process your request. Please try again later." });
});

async function expandSrvUri(mongodbUri) {
  const srvPrefix = "mongodb+srv://";

  if (!mongodbUri.startsWith(srvPrefix)) {
    return mongodbUri;
  }

  try {
    const withoutScheme = mongodbUri.slice(srvPrefix.length);
    const hostAndRest = withoutScheme.slice(withoutScheme.indexOf("@") + 1);
    const hostname = hostAndRest.split(/[/?]/)[0];
    const credentials = withoutScheme.slice(0, withoutScheme.indexOf("@") + 1);
    const rest = hostAndRest.slice(hostname.length);
    const records = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
    const hosts = records.map((record) => `${record.name}:${record.port}`).join(",");

    let options = "";
    try {
      const txtRecords = await dns.resolveTxt(hostname);
      options = txtRecords.flat().join("&");
    } catch {
      try {
        const dohResponse = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${hostname}&type=TXT`,
          { headers: { accept: "application/dns-json" } },
        );
        const dohData = await dohResponse.json();
        options = (dohData.Answer ?? [])
          .filter((answer) => answer.type === 16)
          .map((answer) => answer.data.replace(/^"|"$/g, ""))
          .join("&");
      } catch {
        options = "";
      }
    }

    const params = new URLSearchParams();
    const optionSources = [rest.includes("?") ? rest.slice(rest.indexOf("?") + 1) : "", options];
    for (const source of optionSources) {
      for (const pair of source.split("&")) {
        const [key, value] = pair.split("=");
        if (key && !params.has(key)) {
          params.set(key, value ?? "");
        }
      }
    }
    if (!params.has("tls") && !params.has("ssl")) {
      params.set("tls", "true");
    }
    const dbPath = rest.startsWith("/") ? rest.slice(1).split("?")[0] : "";
    return `mongodb://${credentials}${hosts}/${dbPath}?${params.toString()}`;
  } catch (error) {
    console.warn("Could not expand mongodb+srv URI, using it as-is:", error.message);
    return mongodbUri;
  }
}

async function startServer() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("MONGODB_URI must be set.");
  }

  await mongoose.connect(await expandSrvUri(mongodbUri), { dbName: "elc" });
  app.listen(port, () => {
    console.log(`ELC API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start ELC API:", error);
  process.exitCode = 1;
});
