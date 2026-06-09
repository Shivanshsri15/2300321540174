import { AppBar, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AllNotifications } from "./pages/AllNotifications";
import { PriorityNotifications } from "./pages/PriorityNotifications";

export function App() {
  const location = useLocation();
  const tab = location.pathname === "/priority" ? 1 : 0;

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
        </Toolbar>
        <Tabs value={tab} textColor="inherit" indicatorColor="secondary">
          <Tab label="All" component={Link} to="/" />
          <Tab label="Priority" component={Link} to="/priority" />
        </Tabs>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<AllNotifications />} />
          <Route path="/priority" element={<PriorityNotifications />} />
        </Routes>
      </Container>
    </>
  );
}
