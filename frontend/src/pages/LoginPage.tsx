import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Login } from "../../wailsjs/go/main/App";

// สมมติคุณมี Login function จาก Go
// import { Login } from "../../wailsjs/go/main/App";

type Props = {
  onLoginSuccess: (user: any) => void;
  onOpenSetup: () => void;
};

export default function LoginPage({ onLoginSuccess, onOpenSetup }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const user = await Login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden", // 👈 ปิด scroll
      }}
    >
      <Paper elevation={4} sx={{ p: 5, width: 380 }}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={600} textAlign="center">
            HDH Exchange System
          </Typography>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            กรุณาเข้าสู่ระบบ
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "เข้าสู่ระบบ"}
          </Button>
          <Button variant="text" size="large" fullWidth onClick={onOpenSetup}>
            ตั้งค่าฐานข้อมูล (สำหรับผู้ดูแลระบบ)
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
