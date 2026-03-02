import { useEffect, useState } from "react";
import { HasConfig, CheckDatabaseConnection } from "../wailsjs/go/main/App";

import SetupPage from "./pages/SetupPage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layout/MainLayout";

import { Box, CircularProgress } from "@mui/material";

type AppState = "loading" | "setup" | "login" | "main";

function App() {
  const [appState, setAppState] = useState<AppState>("loading");

  const init = async () => {
    try {
      const hasConfig = await HasConfig();

      if (!hasConfig) {
        setAppState("setup");
        return;
      }

      const dbReady = await CheckDatabaseConnection();

      if (!dbReady) {
        setAppState("setup");
        return;
      }

      setAppState("login");
    } catch (err) {
      console.error("Init error:", err);
      setAppState("setup");
    }
  };

  useEffect(() => {
    init();
  }, []);

  const renderContent = () => {
    switch (appState) {
      case "loading":
        return (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        );

      case "setup":
        return (
          <SetupPage
            onSetupSuccess={() => init()}
            onBack={() => setAppState("login")}
          />
        );

      case "login":
        return (
          <LoginPage
            onLoginSuccess={() => setAppState("main")}
            onOpenSetup={() => setAppState("setup")}
          />
        );

      case "main":
        return <MainLayout />;

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh", // เต็มหน้าต่าง
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // ❗ ห้าม scroll ทั้งระบบ
      }}
    >
      {renderContent()}
    </Box>
  );
}

export default App;
