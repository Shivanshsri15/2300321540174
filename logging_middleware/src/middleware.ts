import { RequestHandler } from "express";
import { Log } from "./log";

export function expressLoggingMiddleware(): RequestHandler {
  return (req, res, next) => {

    Log("backend", "info", "middleware", `Incoming ${req.method} ${req.path}`);

    res.on("finish", () => {
      Log(
        "backend",
        "info",
        "middleware",
        `${req.method} ${req.path} → ${res.statusCode}`
      );
    });

    next();
  };
}
