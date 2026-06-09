import { useEffect, useState } from "react";
import { Log } from "logging_middleware";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { fetchPriorityInbox } from "../api/priorityInbox";
import { NotificationList } from "../components/NotificationList";
import { Notification, NotificationType } from "../types";

const TYPES: { label: string; value: NotificationType }[] = [
  { label: "All", value: "" },
  { label: "Placement", value: "Placement" },
  { label: "Result", value: "Result" },
  { label: "Event", value: "Event" },
];

export function PriorityNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [type, setType] = useState<NotificationType>("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchPriorityInbox(limit, type || undefined)
      .then(setNotifications)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        Log("frontend", "error", "page", `Priority notifications load failed: ${msg}`);
      })
      .finally(() => setLoading(false));
  }, [type, limit]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Priority Notifications
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as NotificationType)}
          >
            {TYPES.map((t) => (
              <MenuItem key={t.label} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Limit</InputLabel>
          <Select
            label="Limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <NotificationList
          notifications={notifications}
          onViewed={() => setNotifications([...notifications])}
        />
      )}
    </Box>
  );
}
