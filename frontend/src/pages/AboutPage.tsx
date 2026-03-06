import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Link,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";

function AboutPage() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        bgcolor: "#f5f5f5",
      }}
    >
      <Card sx={{ width: 500, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                เกี่ยวกับโปรแกรม
              </Typography>
            </Box>

            <Divider />

            <Typography variant="body1">
              <strong>ชื่อโปรแกรม:</strong> HDH Rollback (HDC HIS Rollback)
            </Typography>

            <Typography variant="body1">
              <strong>พัฒนาโดย:</strong> กลุ่มงานสุขภาพดิจิทัล (ICT)
              สำนักงานสาธารณสุขจังหวัดสกลนคร
            </Typography>

            <Divider />

            <Typography variant="h6" fontWeight="bold">
              ติดต่อสอบถาม
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <LanguageIcon fontSize="small" />
              <Link
                href="https://skko.moph.go.th"
                target="_blank"
                underline="hover"
              >
                https://skko.moph.go.th/
              </Link>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" align="center" color="text.secondary">
              © 2026 ABC Technology Co., Ltd. All rights reserved.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AboutPage;
