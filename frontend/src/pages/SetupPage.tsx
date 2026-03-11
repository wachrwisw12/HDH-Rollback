import { useState, useEffect } from "react";
import {
  SaveConfig,
  TestConnection,
  SavePassword,
  GetConfig,
  GetPassword,
} from "../../wailsjs/go/main/App";

import {
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

type Props = {
  onSetupSuccess: () => void;
  onBack: () => void;
};

export default function SetupPage({ onSetupSuccess }: Props) {
  const [form, setForm] = useState({
    db_type: "mysql",
    host: "",
    port: 3306,
    database: "",
    username: "",
    password: "",
    his_type: "",
  });

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "port" ? Number(value) : value,
    });
  };
  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await TestConnection(form, form.password);

      if (result === "ok") {
        handleSave(); // ถ้าเชื่อมต่อได้ → บันทึกเลย
        setSnack({
          open: true,
          message: "เชื่อมต่อสำเร็จ",
          severity: "success",
        });
      } else {
        setSnack({
          open: true,
          message: "เชื่อมต่อไม่สำเร็จ: " + result,
          severity: "error",
        });
      }
    } catch {
      setSnack({
        open: true,
        message: "เกิดข้อผิดพลาด",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { password, ...configData } = form;

      const result1 = await SaveConfig(configData);
      if (result1 !== "ok") {
        setSnack({
          open: true,
          message: result1,
          severity: "error",
        });
        return;
      }

      const result2 = await SavePassword(password);
      if (result2 !== "ok") {
        setSnack({
          open: true,
          message: result2,
          severity: "error",
        });
        return;
      }

      // ✅ แสดง success (ยังไม่เปลี่ยนหน้า)
      setSnack({
        open: true,
        message: "บันทึกสำเร็จ",
        severity: "success",
      });
    } catch (err) {
      setSnack({
        open: true,
        message: "เกิดข้อผิดพลาด",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await GetConfig();
        const pwd = await GetPassword();

        if (cfg) {
          setForm({
            db_type: cfg.db_type,
            host: cfg.host,
            port: cfg.port,
            database: cfg.database,
            username: cfg.username,
            password: pwd || "",
            his_type: cfg.his_type || "",
          });
        }
      } catch {
        console.log("ยังไม่มี config");
      }
    };

    loadConfig();
  }, []);

  return (
    <>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ตั้งค่าการเชื่อมต่อฐานข้อมูล
          </Typography>

          <Stack spacing={3}>
            <TextField
              select
              label="HIS"
              name="his_type"
              value={form.his_type}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="hosxp">HOSXP</MenuItem>
              <MenuItem value="jhcis">JHCIS</MenuItem>
            </TextField>

            <TextField
              select
              label="Database Type"
              name="db_type"
              value={form.db_type}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="postgres">PostgreSQL</MenuItem>
              <MenuItem value="mysql">MySQL</MenuItem>
            </TextField>

            <TextField
              label="Host"
              name="host"
              value={form.host}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Port"
              name="port"
              type="text"
              value={form.port}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Database Name"
              name="database"
              value={form.database}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
            />

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleTestConnection}
                disabled={loading}
              >
                เชื่อมต่อและบันทึก
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* ✅ Snackbar อยู่นอก Container */}
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.severity === "error" ? 4000 : 2000}
        onClose={() => {
          setSnack({ ...snack, open: false });

          // 🔥 เปลี่ยนหน้าหลัง snackbar ปิด
          if (snack.severity === "success") {
            onSetupSuccess();
          }
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
