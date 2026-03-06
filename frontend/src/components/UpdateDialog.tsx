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
    EventsOn("download-progress", (p: number) => {
      setProgress(p);

      if (p === 100) {
        setDone(true);
        setDownloading(false);
      }
    });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await DownloadUpdate(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open>
      <DialogTitle>มีเวอร์ชันใหม่</DialogTitle>

      <DialogContent>
        <Typography>
          พบเวอร์ชันใหม่ <b>{version}</b>
        </Typography>

        {downloading && (
          <>
            <Typography sx={{ mt: 2 }}>กำลังดาวน์โหลด {progress}%</Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 1 }}
            />
          </>
        )}

        {done && <Typography sx={{ mt: 2 }}>ดาวน์โหลดสำเร็จ</Typography>}
      </DialogContent>

      <DialogActions>
        {!downloading && !done && (
          <Button variant="contained" onClick={handleDownload}>
            ดาวน์โหลด
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
