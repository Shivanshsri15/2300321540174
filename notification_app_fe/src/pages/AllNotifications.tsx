import { useEffect, useState } from "react";
import { Log } from "logging_middleware";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { fetchNotifications } from "../api/notifications";
import { NotificationList } from "../components/NotificationList";
import { Notification } from "../types";

export function AllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchNotifications(limit, page)
      .then(setNotifications)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        Log("frontend", "error", "page", `All notifications load failed: ${msg}`);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        All Notifications
      </Typography>
      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <NotificationList notifications={notifications} />
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Button variant="outlined" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </Button>
            <Typography variant="body2">Page {page}</Typography>
            <Button
              variant="outlined"
              disabled={notifications.length < limit}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
