import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { DownloadUpdate, InstallUpdate } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";

type UpdateTag = {
  version: string;
  url: string;
};

export default function UpdateDialog({ version, url }: UpdateTag) {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const unsubscribe = EventsOn("update_progress", (p: number) => {
      const percent = Math.min(100, Math.max(0, p));

      setProgress(percent);

      if (percent >= 100) {
        setDone(true);
        setDownloading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDownload = async () => {
    if (downloading) return;

    setProgress(0);
    setDownloading(true);
    setDone(false);

    try {
      await DownloadUpdate(url);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloading(false);
    }
  };

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <DialogTitle>มีเวอร์ชันใหม่</DialogTitle>

      <DialogContent>
        <Typography>
          พบเวอร์ชันใหม่ <b>{version}</b>
        </Typography>

        {downloading && (
          <>
            <Typography sx={{ mt: 2 }}>
              กำลังดาวน์โหลด {progress}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 1 }}
            />
          </>
        )}

        {done && (
          <Typography sx={{ mt: 2, color: "green" }}>
            ดาวน์โหลดสำเร็จ พร้อมติดตั้ง
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        {!downloading && !done && (
          <Button variant="contained" onClick={handleDownload}>
            ดาวน์โหลดและติดตั้ง
          </Button>
        )}

        {done && (
          <Button
            variant="contained"
            color="error"
            onClick={() => InstallUpdate()}
          >
            ปิดโปรแกรมเพื่ออัปเดต
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}