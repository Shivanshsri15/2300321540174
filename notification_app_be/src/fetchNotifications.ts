import { Notification } from "./types";

const NOTIFICATIONS_URL =
  "http://4.224.186.213/evaluation-service/notifications";

export async function fetchNotifications(
  token: string,
  limit?: number,
  page?: number,
  notificationType?: string
): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (page) params.set("page", String(page));
  if (notificationType) params.set("notification_type", notificationType);

  const url = params.toString()
    ? `${NOTIFICATIONS_URL}?${params}`
    : NOTIFICATIONS_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  const data = (await response.json()) as { notifications: Notification[] };
  return data.notifications;
}
