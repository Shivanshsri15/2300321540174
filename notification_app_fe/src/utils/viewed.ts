const KEY = "viewed_notifications";

export function getViewedIds(): Set<string> {
  const raw = localStorage.getItem(KEY);
  return new Set(raw ? JSON.parse(raw) : []);
}

export function markViewed(id: string): void {
  const ids = getViewedIds();
  ids.add(id);
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function isViewed(id: string): boolean {
  return getViewedIds().has(id);
}
