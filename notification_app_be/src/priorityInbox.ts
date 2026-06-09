import { Notification } from "./types";

const WEIGHT: Record<string, number> = {
  placement: 3,
  result: 2,
  event: 1,
};

function score(n: Notification): number {
  const weight = WEIGHT[n.Type.toLowerCase()] ?? 0;
  const time = new Date(n.Timestamp.replace(" ", "T")).getTime();
  return weight * 1e15 + time;
}

export class PriorityInbox {
  private items = new Map<string, Notification>();

  addMany(notifications: Notification[]): void {
    for (const n of notifications) {
      this.items.set(n.ID, n);
    }
  }

  getTop10(): Notification[] {
    return [...this.items.values()]
      .sort((a, b) => score(b) - score(a))
      .slice(0, 10);
  }
}
