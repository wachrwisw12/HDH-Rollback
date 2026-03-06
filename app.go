package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"hdh-rollback/internal/config"
	"hdh-rollback/internal/db"
	"hdh-rollback/internal/his"
	"hdh-rollback/internal/his/domain"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
	// 🔥 เพิ่มตัวนี้
)

type App struct {
	ctx             context.Context
	db              *sql.DB
	provider        domain.HISProvider
	currentUser     *domain.User
	currentFilePath string
	appMode         string
}

func NewApp() *App {
	return &App{}
}

func (a *App) GetVersion() string {
	return config.Version
}

func (a *App) HasConfig() bool {
	return config.Exists()
}

func (a *App) HasVerifyLicense() bool {
	return config.VerifyLicense()
}

func (a *App) CheckDatabaseConnection() bool {
	cfg, err := config.Load()
	if err != nil {
		return false
	}

	password, err := config.LoadPassword()
	if err != nil {
		return false
	}

	dbConn, err := db.Connect(cfg, password)
	if err != nil {
		return false
	}

	if a.db != nil {
		a.db.Close()
	}

	a.db = dbConn

	// 🔥 สร้าง Provider ตาม HISType
	provider, err := his.NewProvider(cfg.HisType, a.db)
	if err != nil {
		return false
	}

	a.provider = provider
	return true
}

func (a *App) TestConnection(cfg config.Config, password string) string {
	fmt.Println("DBType received:", cfg.DBType)

	dbConn, err := db.Connect(&cfg, password)
	if err != nil {
		return err.Error()
	}
	dbConn.Close()
	return "ok"
}

func (a *App) GetHardware() string {
	return config.GetHardwareID() // ฟังก์ชันที่คุณมีอยู่แล้ว
}

func (a *App) GetConfig() (*config.Config, error) {
	return config.Load()
}

func (a *App) GetPassword() (string, error) {
	return config.LoadPassword()
}

func (a *App) SavePassword(password string) string {
	if err := config.SavePassword(password); err != nil {
		return err.Error()
	}
	return "ok"
}

func (a *App) SaveConfig(cfg config.Config) string {
	if err := config.Save(&cfg); err != nil {
		return err.Error()
	}
	return "ok"
}

func (a *App) Login(username, password string) (*domain.User, string) {
	if a.provider == nil {
		return nil, "database not connected"
	}

	user, err := a.provider.Login(username, password)
	if err != nil {
		return nil, err.Error()
	}

	// ถ้าคุณยังมี currentUser ต้องใส่กลับเข้า struct
	a.currentUser = user

	return user, "ok"
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) BulkGetCID(list []domain.CIDRequest) (map[string]domain.PersonResult, error) {
	total := len(list)
	batchSize := 100

	result := make(map[string]domain.PersonResult)

	for i := 0; i < total; i += batchSize {
		end := i + batchSize
		if end > total {
			end = total
		}

		batch := list[i:end]

		data, err := a.provider.BulkGetCID(batch)
		if err != nil {
			return nil, err
		}

		for k, v := range data {
			result[k] = v
		}

		percent := int(float64(end) / float64(total) * 100)

		fmt.Println("Progress:", percent) // 👈 ใส่อันนี้ดู log

		runtime.EventsEmit(a.ctx, "cid-progress", percent)
	}

	return result, nil
}

func (a *App) SaveExcelWithDialog(base64Data string) error {
	filepath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: "report.xlsx",
	})
	if err != nil {
		return err
	}
	if filepath == "" {
		return nil
	}

	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return err
	}

	return os.WriteFile(filepath, data, 0o644)
}

func (a *App) OpenExcel() (*domain.ExcelResponse, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil || path == "" {
		return nil, err
	}

	a.currentFilePath = path

	f, err := excelize.OpenFile(path)
	if err != nil {
		return nil, err
	}

	sheetName := f.GetSheetName(0)
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("no data found")
	}

	headers := rows[0]

	var result []map[string]interface{}
	pinkColor := "FBCDDC"

	for rowIndex := 1; rowIndex < len(rows); rowIndex++ {

		row := rows[rowIndex]
		data := make(map[string]interface{})

		for i, cell := range row {
			if i < len(headers) {
				data[headers[i]] = cell
			}
		}

		// อ่าน style cell A ของแถว
		cellName, _ := excelize.CoordinatesToCellName(1, rowIndex+1)

		styleID, _ := f.GetCellStyle(sheetName, cellName)
		style, _ := f.GetStyle(styleID)

		done := false

		if style != nil && style.Fill.Type == "pattern" {
			if len(style.Fill.Color) > 0 {
				color := strings.TrimPrefix(style.Fill.Color[0], "#")
				color = strings.ToUpper(color)

				fmt.Println("Detected color:", color)

				if strings.HasSuffix(color, pinkColor) {
					done = true
				}
			}
		}

		data["done"] = done
		result = append(result, data)
	}

	return &domain.ExcelResponse{
		Headers: headers,
		Rows:    result,
	}, nil
}

func (a *App) UpdateExcelStatus(data []map[string]interface{}) error {
	f, err := excelize.OpenFile(a.currentFilePath)
	if err != nil {
		return err
	}

	sheet := f.GetSheetName(0)

	pinkStyle, _ := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#fbcddc"},
			Pattern: 1,
		},
	})

	normalStyle, _ := f.NewStyle(&excelize.Style{})

	for i, row := range data {

		excelRow := i + 2

		done, ok := row["done"].(bool)
		if !ok {
			done = false
		}
		// fmt.Println("Row", i, "done:", done)
		startCell := fmt.Sprintf("A%d", excelRow)
		endCell := fmt.Sprintf("Z%d", excelRow)

		if done {
			f.SetCellStyle(sheet, startCell, endCell, pinkStyle)
		} else {
			f.SetCellStyle(sheet, startCell, endCell, normalStyle)
		}
	}

	return f.Save()
}

type UpdateInfo struct {
	Version string `json:"version"`
	URL     string `json:"url"`
}

func (a *App) Activate(siteCode string) error {
	hwid := config.GetHardwareID()

	payload := map[string]string{
		"hardware_id": hwid,
		"site_code":   siteCode,
	}

	body, _ := json.Marshal(payload)

	resp, err := http.Post(
		"http://your-api/activate",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return errors.New("cannot connect to server")
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return errors.New("activation failed")
	}

	licenseJSON, _ := io.ReadAll(resp.Body)

	// save license
	err = os.WriteFile("activation.dat", licenseJSON, 0o644)
	if err != nil {
		return errors.New("cannot save license")
	}

	return nil
}

type Release struct {
	TagName string `json:"tag_name"`
	Assets  []struct {
		Name               string `json:"name"`
		BrowserDownloadURL string `json:"browser_download_url"`
	} `json:"assets"`
}

func (a *App) CheckUpdate(currentVersion string) (*UpdateInfo, error) {
	url := "https://api.github.com/repos/ict-ssj-sakon/HDH-Rollback/releases/latest"

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var release Release
	err = json.NewDecoder(resp.Body).Decode(&release)
	if err != nil {
		return nil, err
	}

	latest := strings.TrimPrefix(release.TagName, "v")
	current := strings.TrimPrefix(currentVersion, "v")

	if latest == current {
		return nil, nil
	}

	var downloadURL string

	for _, asset := range release.Assets {
		if strings.Contains(asset.Name, ".exe") {
			downloadURL = asset.BrowserDownloadURL
			break
		}
	}

	return &UpdateInfo{
		Version: latest,
		URL:     downloadURL,
	}, nil
}

func (a *App) DownloadUpdate(url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	filePath := filepath.Join(os.TempDir(), "HDH-Rollback-Setup.exe")

	out, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer out.Close()

	size := resp.ContentLength
	var downloaded int64

	buf := make([]byte, 32*1024)

	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			out.Write(buf[:n])
			downloaded += int64(n)

			percent := int(float64(downloaded) / float64(size) * 100)

			runtime.EventsEmit(a.ctx, "download-progress", percent)
		}

		if err != nil {
			break
		}
	}

	return nil
}

func (a *App) InstallUpdate() {
	filePath := filepath.Join(os.TempDir(), "HDH-Rollback-Setup.exe")

	exec.Command(filePath).Start()

	runtime.Quit(a.ctx)
}
