import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  LinearProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DownloadIcon from "@mui/icons-material/Download";
import {
  DataGrid,
  GridColDef,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import {
  BulkGetCID,
  SaveExcelWithDialog,
  OpenExcel,
  UpdateExcelStatus,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";

export default function ExcelConvertPage() {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = EventsOn("cid-progress", (percent: number) => {
      setProgress(percent);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  const apiRef = useGridApiRef();
  const handleExport = async () => {
    const api = apiRef.current;
    if (!api) return;

    // ✅ ได้เฉพาะ row ที่ filter + sort แล้วจริง ๆ
    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);

    if (filteredSortedRowIds.length === 0) {
      alert("ไม่มีข้อมูลให้ export");
      return;
    }

    const visibleRows = filteredSortedRowIds.map((id) => api.getRow(id));

    const orderedFields = columns
      .map((col) => col.field)
      .filter((field) => field !== "id");

    const exportData = visibleRows.map((row) => {
      const newRow: any = {};
      orderedFields.forEach((field) => {
        newRow[field] = row[field];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      header: orderedFields,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Result");

    const base64 = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "base64",
    });

    await SaveExcelWithDialog(base64);
  };

  const handleOpenExcel = async () => {
    setSuccess(false);

    const response = await OpenExcel();

    if (!response) return;

    // 👇 ใส่อะไรก็ได้ที่ไม่เป็น null

    const cols: GridColDef[] = response.headers.map((key: string) => ({
      field: key,
      headerName: key,
      width: 150,
    }));
    const formattedRows = response.rows.map((row: any, index: number) => ({
      id: index,
      ...row,
      done: row.done === true, // ใส่หลังสุด
    }));

    setColumns(cols);
    setRows(formattedRows);
  };
  const handleConvert = async () => {
    if (rows.length === 0) return;

    setProcessing(true);
    setSuccess(false);
    setProgress(0);

    try {
      const payload = rows.map((row) => ({
        pid: row.pid?.toString().trim(),
      }));

      const resultMap = await BulkGetCID(payload);

      const updatedRows = rows.map((row) => {
        const key = parseInt(row.pid, 10).toString();
        const data = resultMap[key];

        return {
          ...row,
          ...data,
        };
      });

      setProgress(100);

      const firstResult = Object.values(resultMap)[0] as any;

      if (firstResult) {
        const backendFields = Object.keys(firstResult);

        setColumns((prev) => {
          const existingFields = prev.map((c) => c.field);

          // 🔥 checkbox column (เพิ่มครั้งเดียว)
          const checkboxColumn: GridColDef = {
            field: "done",
            headerName: "บันทึก",
            width: 100,
            sortable: false,
            renderCell: (params) => (
              <input
                type="checkbox"
                checked={params.row.done || false}
                onChange={(e) => {
                  setRows((prevRows) =>
                    prevRows.map((r) =>
                      r.id === params.row.id
                        ? { ...r, done: e.target.checked }
                        : r,
                    ),
                  );
                }}
              />
            ),
          };

          const newColumns: GridColDef[] = backendFields
            .filter((key) => !existingFields.includes(key))
            .map((key) => ({
              field: key,
              headerName: key,
              width: 180,
              headerClassName: "backend-header",
              cellClassName: "backend-cell",
            }));

          let finalColumns = [...prev];

          // ✅ ถ้ายังไม่มี checkbox
          if (!existingFields.includes("done")) {
            finalColumns = [checkboxColumn, ...finalColumns];
          }

          // ✅ เพิ่ม backend fields ด้านหน้า
          if (newColumns.length > 0) {
            finalColumns = [...newColumns, ...finalColumns];
          }

          return finalColumns;
        });
      }

      setRows(updatedRows);
      setSuccess(true);
      setSnackbarOpen(true); // 🔥 เพิ่มบรรทัดนี้
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }

    setProcessing(false);
  };
  const handleSaveStatus = async () => {
    await UpdateExcelStatus(rows);
  };
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="subtitle1">เลือกไฟล์ Excel</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={handleOpenExcel}
            >
              เลือกไฟล์
              <input hidden type="file" accept=".xlsx,.xls" />
            </Button>
            {rows.length > 0 && (
              <Alert severity="info">
                โหลดข้อมูลสำเร็จ ({rows.length} แถว)
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AutorenewIcon />}
                disabled={rows.length === 0 || processing}
                onClick={handleConvert}
              >
                ค้นหาข้อมูล
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={rows.length === 0 || processing || success === false}
              >
                บันทึกไฟล์ใหม่
              </Button>
            </Stack>

            <Button
              onClick={handleSaveStatus}
              disabled={rows.length === 0 || processing || success === false}
            >
              บันทึกสถานะ
            </Button>
          </Stack>

          {processing && (
            <>
              <Box sx={{ width: "100%", mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  กำลังประมวลผล... {progress}%
                </Typography>

                <LinearProgress
                  color="success"
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    "& .MuiLinearProgress-bar": {
                      transition: "none", // 🔥 ปิด animation
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Stack>
      </Paper>

      {rows.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" mb={2}>
            Preview Data ({rows.length} rows)
          </Typography>

          <Box>
            <DataGrid
              apiRef={apiRef}
              rows={rows}
              columns={columns}
              disableColumnResize={false}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20, page: 0 } },
              }}
              getRowClassName={(params) => (params.row.done ? "row-done" : "")}
              sx={{
                "& .row-done": {
                  position: "relative",
                },
                "& .row-done::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(251, 205, 220, 0.35)", // ชมพูโปร่ง
                  pointerEvents: "none",
                },

                "& .row-selected": {
                  backgroundColor: "#fce4ec",
                },

                "& .backend-cell": {
                  backgroundColor: "#e8f5e9",
                  color: "#1b5e20",
                  fontWeight: 500,
                },

                "& .backend-header": {
                  background: "linear-gradient(90deg, #66bb6a, #81c784)",
                  color: "#fff",
                  fontWeight: 600,
                },
              }}
            />
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={2000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity="success"
                variant="filled"
                sx={{ width: "100%" }}
              >
                สำเร็จ
              </Alert>
            </Snackbar>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
