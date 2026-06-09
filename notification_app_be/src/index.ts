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

app.use(expressLoggingMiddleware());

app.get("/api/priority-inbox", async (_req, res) => {
  if (!token) {
    Log("backend", "error", "config", "EVALUATION_ACCESS_TOKEN is not set");
    res.status(500).json({ error: "EVALUATION_ACCESS_TOKEN is not set" });
    return;
  }

  try {
    const notifications = await fetchNotifications(token);
    const inbox = new PriorityInbox();
    inbox.addMany(notifications);
    const top = inbox.getTop10();

    console.log(`Fetched ${notifications.length} notifications`);
    console.log("Top 10 priority inbox:", JSON.stringify(top, null, 2));

    Log(
      "backend",
      "info",
      "handler",
      `Returning ${top.length} priority notifications`
    );
    res.json({ notifications: top });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Fetch failed:", message);
    Log("backend", "error", "service", `Failed to fetch notifications: ${message}`);
    res.status(502).json({ error: message });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
  console.log(`Hit from Postman: GET http://localhost:${port}/api/priority-inbox`);
  Log("backend", "info", "config", `Server started on port ${port}`);
});
