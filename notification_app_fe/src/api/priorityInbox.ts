import { Log } from "logging_middleware";
import { Notification, NotificationType } from "../types";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export async function fetchPriorityInbox(
  limit: number,
  notificationType?: NotificationType
): Promise<Notification[]> {
  const params = new URLSearchParams({ limit: String(limit) });

  if (notificationType) {
    params.set("notification_type", notificationType);
  }

  Log(
    "frontend",
    "info",
    "api",
    `Fetching priority inbox limit=${limit} type=${notificationType || "all"}`
  );

  const response = await fetch(
    `${BACKEND_URL}/api/priority-inbox?${params}`
  );

  if (!response.ok) {
    Log("frontend", "error", "api", `Priority inbox failed with status ${response.status}`);
    throw new Error(`Failed to fetch priority inbox: ${response.status}`);
  }

  const data = (await response.json()) as { notifications: Notification[] };
  return data.notifications;
}
