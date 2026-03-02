import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  LinearProgress,
  Alert,
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
      // เตรียม payload ส่งไป Go
      const payload = rows.map((row) => ({
        pid: row.pid?.toString().trim(),
      }));
      console.log("Payload for Go:", payload);
      const resultMap = await BulkGetCID(payload);

      // เติม newCid เข้าแต่ละแถว
      const updatedRows = rows.map((row) => {
        const key = parseInt(row.pid, 10).toString();
        const data = resultMap[key];

        return {
          ...row,
          newCid: data?.cid || "",
          fullname: data?.fullname || "",
          hn: data?.hn || "",
          address_name: data?.address_name || "",
        };
      });
      setProgress(100);
      // ตรวจว่ามี column newCid แล้วหรือยัง (กันซ้ำ)
      const hasColumn = columns.some((c) => c.field === "newCid");

      if (!hasColumn) {
        const checkboxColumn: GridColDef = {
          field: "done",
          headerName: "สถานะ",
          width: 100,
          renderCell: (params) => (
            <input
              type="checkbox"
              checked={params.row.done || false}
              onChange={(e) => {
                setRows((prevRows) =>
                  prevRows.map((r) =>
                    r.id === params.row.id
                      ? { ...r, done: e.target.checked } // ✅ สำคัญมาก
                      : r,
                  ),
                );
              }}
            />
          ),
        };
        const newHColumn: GridColDef = {
          field: "hn",
          headerName: "HN",
          width: 120,
          headerClassName: "cid-header-modern",
          cellClassName: (params) => "hn-modern",
        };

        const newCidColumn: GridColDef = {
          field: "newCid",
          headerName: "CID",
          width: 180,
          headerClassName: "cid-header-modern",
          cellClassName: (params) =>
            !params.value ? "cid-missing-modern" : "cid-found-modern",
        };

        const fullNameColumn: GridColDef = {
          field: "fullname",
          headerName: "ชื่อ-สกุล",
          width: 220,
          headerClassName: "cid-header-modern",
          cellClassName: "fullname-modern",
        };
        const addressNameColumn: GridColDef = {
          field: "address_name",
          headerName: "ที่อยู่",
          width: 220,
          headerClassName: "cid-header-modern",
          cellClassName: "fullname-modern",
        };
        setColumns((prev) => [
          checkboxColumn,
          newHColumn,
          newCidColumn,
          fullNameColumn,
          addressNameColumn,
          ...prev,
        ]);
      }
      setRows(updatedRows);
      setSuccess(true);
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
            <Typography variant="subtitle1">การประมวลผล</Typography>
            {processing && (
              <>
                <LinearProgress variant="determinate" value={progress} />
                <Typography mt={1}>{progress}%</Typography>
              </>
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
              >
                บันทึกไฟล์ใหม่
              </Button>
            </Stack>
            {success && (
              <Alert severity="success">
                แปลงไฟล์สำเร็จ สามารถบันทึกไฟล์ได้
              </Alert>
            )}

            <Button onClick={handleSaveStatus}>บันทึกสถานะ</Button>
          </Stack>
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
                "& .MuiDataGrid-cell[data-field='hn']": {
                  backgroundColor: "#e8f5e9", // เขียวจาง
                  color: "#1b5e20",
                  fontWeight: 500,
                },
                "& .MuiDataGrid-cell[data-field='newCid']": {
                  backgroundColor: "#e8f5e9", // เขียวจาง
                  color: "#1b5e20",
                  fontWeight: 500,
                },
                "& .MuiDataGrid-cell[data-field='fullname']": {
                  backgroundColor: "#e8f5e9", // เขียวจางเหมือนกัน
                  color: "#1b5e20",
                  fontWeight: 500,
                },
                "& .MuiDataGrid-columnHeader[data-field='newCid']": {
                  background: "linear-gradient(90deg, #66bb6a, #81c784)",
                  color: "#fff",
                  fontWeight: 600,
                },
                "& .MuiDataGrid-columnHeader[data-field='fullname']": {
                  background: "linear-gradient(90deg, #66bb6a, #81c784)",
                  color: "#fff",
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}
