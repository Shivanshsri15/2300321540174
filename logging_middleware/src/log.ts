import { Level, Package, Stack } from "./types";

const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

const STACKS: Stack[] = ["backend", "frontend"];

const LEVELS: Level[] = ["debug", "info", "warn", "error", "fatal"];

const PACKAGES: Package[] = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
];

let accessToken: string | undefined;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  if (!STACKS.includes(stack) || !LEVELS.includes(level) || !PACKAGES.includes(pkg)) {
    return;
  }

  const token = accessToken ?? process.env.EVALUATION_ACCESS_TOKEN;
  if (!token) {
    return;
  }

  const response = await fetch(LOG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      stack,
      level,
      package: pkg,
      message,
    }),
  });

  const data = await response.json();
  console.log("Log response:", data);
}
