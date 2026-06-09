import { Notification } from "./types";

const NOTIFICATIONS_URL =
  "http://4.224.186.213/evaluation-service/notifications";

export async function fetchNotifications(
  token: string
): Promise<Notification[]> {
  const response = await fetch(NOTIFICATIONS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  const data = (await response.json()) as { notifications: Notification[] };
  console.log("Notifications API response:", JSON.stringify(data, null, 2));
  return data.notifications;
}
