import { Log } from "logging_middleware";
import { Notification, NotificationType } from "../types";

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

export async function fetchNotifications(
  limit: number,
  page: number,
  notificationType?: NotificationType
): Promise<Notification[]> {
  const token = import.meta.env.VITE_EVALUATION_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("VITE_EVALUATION_ACCESS_TOKEN is not set");
  }

  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (notificationType) {
    params.set("notification_type", notificationType);
  }

  Log(
    "frontend",
    "info",
    "api",
    `Fetching notifications limit=${limit} page=${page} type=${notificationType || "all"}`
  );

  const response = await fetch(`${API_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    Log("frontend", "error", "api", `Fetch failed with status ${response.status}`);
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const data = (await response.json()) as { notifications: Notification[] };
  return data.notifications;
}
