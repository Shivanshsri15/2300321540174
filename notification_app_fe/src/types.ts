export interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export type NotificationType = "Event" | "Result" | "Placement" | "";
