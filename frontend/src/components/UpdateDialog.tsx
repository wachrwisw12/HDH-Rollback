import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import { DownloadUpdate } from "../../wailsjs/go/main/App";

type UpdateTag = {
  version: string;
  url: string;
  onClose: () => void;
};

export default function UpdateDialog({ version, url }: UpdateTag) {
  return (
    <Dialog open>
      <DialogTitle>มีเวอร์ชันใหม่</DialogTitle>

      <DialogContent>
        พบเวอร์ชันใหม่ <b>{version}</b>
        <br />
        ต้องการดาวน์โหลดตอนนี้หรือไม่
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={() => DownloadUpdate(url)}>
          ดาวน์โหลด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
