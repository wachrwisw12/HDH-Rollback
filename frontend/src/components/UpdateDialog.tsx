import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

type UpdateTag = {
  version: string;
  url: string;
  onClose: () => void;
};
export default function UpdateDialog({ version, url, onClose }: UpdateTag) {
  return (
    <Dialog open>
      <DialogTitle>มีเวอร์ชันใหม่</DialogTitle>

      <DialogContent>พบเวอร์ชันใหม่ {version}</DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ภายหลัง</Button>
        <Button variant="contained" onClick={() => window.open(url)}>
          ดาวน์โหลด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
