import { Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
};

export default function AppSnackbar({
  open,
  message,
  severity = "success",
  duration = 5000,
  onClose,
}: Props) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  return (
    <Snackbar
      open={visible}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
