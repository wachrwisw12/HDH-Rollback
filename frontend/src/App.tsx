import { useEffect, useState } from "react";
import {
  HasConfig,
  CheckDatabaseConnection,
  CheckUpdate,
  GetVersion,
} from "../wailsjs/go/main/App";

import SetupPage from "./pages/SetupPage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layout/MainLayout";

import { Box, CircularProgress } from "@mui/material";
import RegisterPage from "./pages/RegisterPage";
import UpdateDialog from "./components/UpdateDialog";

type AppState = "loading" | "setup" | "login" | "main" | "verify" | "about";

function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [AppversionState, setAppversion] = useState("");
  const init = async () => {
    try {
      var Appversion = await GetVersion();
      setAppversion(Appversion);
      console.log(Appversion);
      // const hasVerify = await HasVerifyLicense();
      const hasConfig = await HasConfig();

      // if (!hasVerify) {
      //   setAppState("verify");
      //   return;
      // }
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
      case "verify":
        return <RegisterPage onSuccess={() => init()} />;

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
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setAppState("main");
            }}
            onOpenSetup={() => setAppState("setup")}
          />
        );

      case "main":
        return (
          <MainLayout
            version={AppversionState}
            user={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              setAppState("login");
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {renderContent()}
    </Box>
  );
}

export default App;
