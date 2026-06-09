import { Log } from "logging_middleware";
import {
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Notification } from "../types";
import { isViewed, markViewed } from "../utils/viewed";

interface Props {
  notifications: Notification[];
  onViewed?: () => void;
}

export function NotificationList({ notifications, onViewed }: Props) {
  if (notifications.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No notifications
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {notifications.map((n) => {
        const viewed = isViewed(n.ID);
        return (
          <ListItem key={n.ID} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                markViewed(n.ID);
                Log("frontend", "info", "component", `Marked notification ${n.ID} as viewed`);
                onViewed?.();
              }}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                borderLeft: viewed ? 1 : 3,
                borderLeftColor: viewed ? "divider" : "primary.main",
                opacity: viewed ? 0.7 : 1,
              }}
            >
              <ListItemText
                primary={
                  <>
                    <Typography component="span" variant="caption" fontWeight={600}>
                      {n.Type}
                    </Typography>
                    {!viewed && (
                      <Chip label="new" size="small" color="primary" sx={{ ml: 1, height: 18 }} />
                    )}
                    <Typography component="div" variant="body2" sx={{ mt: 0.5 }}>
                      {n.Message}
                    </Typography>
                  </>
                }
                secondary={n.Timestamp}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
