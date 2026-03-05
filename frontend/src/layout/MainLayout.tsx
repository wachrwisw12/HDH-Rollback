import { useEffect, useState, version } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ExcelConvertPage from "../pages/ExcelProcessPage";

import Dashboard from "../pages/Dashboard";
import AboutPage from "../pages/AboutPage";
import type { User } from "../type/user.type";
import { Info } from "@mui/icons-material";
type Props = {
  user: User;
  onLogout: () => void;
};

export default function MainLayout({ user, onLogout }: Props) {
  const [selected, setSelected] = useState("dashboard");
  const pages = [
    { key: "dashboard", label: "หน้าหลัก", icon: <HomeIcon /> },
    // { key: "reports", label: "Reports", icon: <BarChartIcon /> },
    { key: "excel", label: "ค้นหาข้อมูล", icon: <UploadFileIcon /> },
    { key: "about", label: "เกี่ยวกับโปรแกรม", icon: <Info /> },
  ];

  const renderContent = () => {
    switch (selected) {
      case "dashboard":
        return <Dashboard />;
      case "excel":
        return <ExcelConvertPage />;
      case "about":
        return <AboutPage />;
      default:
        return <h2>Dashboard</h2>;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f4f6f8", // 👈 พื้นหลังหลัก desktop tone
      }}
    >
      {/* Top Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          backgroundColor: "#1e293b", // เทาเข้ม modern
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            HDH Rollback
          </Typography>

          <Box sx={{ position: "absolute", left: 23, bottom: 8 }}>
            <Typography variant="body2"></Typography>
          </Box>
          <Box
            sx={{
              ml: 2,
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.key}
                onClick={() => setSelected(page.key)}
                sx={{
                  mr: 3,
                  my: 2,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom:
                    selected === page.key ? "2px solid white" : "none",
                }}
              >
                {page.icon}
                {page.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
        <Box
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <Typography variant="body1">
            ผู้ใช้งาน:{user?.full_name || "JHCIS"}
          </Typography>
        </Box>
      </AppBar>

      {/* Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}
