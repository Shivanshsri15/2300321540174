import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { setAccessToken } from "logging_middleware";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

const token = import.meta.env.VITE_EVALUATION_ACCESS_TOKEN?.trim();
if (token) {
  setAccessToken(token);
}

const theme = createTheme({
  palette: { mode: "light" },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
