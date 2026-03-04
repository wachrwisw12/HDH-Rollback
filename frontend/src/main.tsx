import React from "react";
import "./fonts.css";
import { createRoot } from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "@mui/material/styles"; // ✅ ถูกต้อง
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./layout/Theme"; // ✅ import theme object

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  // <React.StrictMode>
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  // </React.StrictMode>,
);
