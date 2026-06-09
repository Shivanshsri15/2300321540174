import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  Log,
  expressLoggingMiddleware,
  setAccessToken,
} from "logging_middleware";
import { fetchNotifications } from "./fetchNotifications";
import { PriorityInbox } from "./priorityInbox";

dotenv.config();

const token = process.env.EVALUATION_ACCESS_TOKEN?.trim();
if (token) {
  setAccessToken(token);
  console.log("Access token loaded");
} else {
  console.log("Warning: EVALUATION_ACCESS_TOKEN is not set");
}

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(expressLoggingMiddleware());

app.get("/api/notifications", async (req, res) => {
  if (!token) {
    res.status(500).json({ error: "EVALUATION_ACCESS_TOKEN is not set" });
    return;
  }

  const limit = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;
  const notificationType = req.query.notification_type as string | undefined;

  try {
    const notifications = await fetchNotifications(
      token,
      limit,
      page,
      notificationType
    );
    Log(
      "backend",
      "info",
      "handler",
      `Returned ${notifications.length} notifications page=${page} limit=${limit}`
    );
    res.json({ notifications });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    Log("backend", "error", "service", `Failed to fetch notifications: ${message}`);
    res.status(502).json({ error: message });
  }
});

app.get("/api/priority-inbox", async (req, res) => {
  if (!token) {
    Log("backend", "error", "config", "EVALUATION_ACCESS_TOKEN is not set");
    res.status(500).json({ error: "EVALUATION_ACCESS_TOKEN is not set" });
    return;
  }

  const limit = Number(req.query.limit) || 10;
  const notificationType = req.query.notification_type as string | undefined;

  try {
    let notifications = await fetchNotifications(token);

    if (notificationType) {
      notifications = notifications.filter(
        (n) => n.Type.toLowerCase() === notificationType.toLowerCase()
      );
    }

    const inbox = new PriorityInbox();
    inbox.addMany(notifications);
    const top = inbox.getTop(limit);

    Log(
      "backend",
      "info",
      "handler",
      `Returning ${top.length} priority notifications limit=${limit} type=${notificationType || "all"}`
    );
    res.json({ notifications: top });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Fetch failed:", message);
    Log("backend", "error", "service", `Failed to fetch notifications: ${message}`);
    res.status(502).json({ error: message });
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
  console.log(`GET http://localhost:${port}/api/notifications?limit=20&page=1`);
  console.log(`GET http://localhost:${port}/api/priority-inbox?limit=10`);
  Log("backend", "info", "config", `Server started on port ${port}`);
});
