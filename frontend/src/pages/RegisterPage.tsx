import { useEffect, useState } from "react";
import { GetHardware, Activate } from "../../wailsjs/go/main/App";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

function RegisterPage({ onSuccess }: { onSuccess: () => void }) {
  const [hwid, setHwid] = useState("");
  const [siteCode, setSiteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    GetHardware().then(setHwid);
  }, []);

  const handleActivate = async () => {
    setLoading(true);
    setError("");

    try {
      await Activate(siteCode);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Activation failed");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            ลงทะเบียนเครื่อง
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 2,
              wordBreak: "break-all",
              bgcolor: "#f5f5f5",
              p: 1.5,
              borderRadius: 2,
            }}
          >
            Hardware ID: {hwid}
          </Typography>

          <TextField
            label="รหัสหน่วยบริการ"
            fullWidth
            value={siteCode}
            onChange={(e) => setSiteCode(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Activate"
            )}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default RegisterPage;
