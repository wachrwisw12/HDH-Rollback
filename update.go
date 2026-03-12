package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"hdh-rollback/internal/his/domain"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) CheckUpdate(currentVersion string) (*domain.UpdateInfo, error) {

	url := "https://api.github.com/repos/ict-ssj-sakon/HDH-Rollback/releases/latest"

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("github api error")
	}

	var release domain.Release
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
		if asset.Name == "hdh-rollback-amd64-installer.exe" {
			downloadURL = asset.BrowserDownloadURL
			break
		}
	}

	if downloadURL == "" {
		return nil, errors.New("installer asset not found")
	}

	return &domain.UpdateInfo{
		Version: latest,
		URL:     downloadURL,
	}, nil
}

func (a *App) DownloadUpdate(url string) error {

	filePath := filepath.Join(os.TempDir(), "hdh-rollback-installer.exe")

	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("download failed")
	}

	total := resp.ContentLength

	out, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer out.Close()

	var downloaded int64
	buf := make([]byte, 32*1024)

	for {
		n, err := resp.Body.Read(buf)

		if n > 0 {

			_, writeErr := out.Write(buf[:n])
			if writeErr != nil {
				return writeErr
			}

			downloaded += int64(n)

			if total > 0 {
				percent := int(float64(downloaded) / float64(total) * 100)
				runtime.EventsEmit(a.ctx, "update_progress", percent)
			}
		}

		if err != nil {

			if err == io.EOF {
				break
			}

			return err
		}
	}

	runtime.EventsEmit(a.ctx, "update_progress", 100)

	return nil
}

func VerifyFile(path string, expected string) (bool, error) {

	file, err := os.Open(path)
	if err != nil {
		return false, err
	}
	defer file.Close()

	hash := sha256.New()

	_, err = io.Copy(hash, file)
	if err != nil {
		return false, err
	}

	sum := hex.EncodeToString(hash.Sum(nil))

	return sum == expected, nil
}

func (a *App) InstallUpdate() error {

	filePath := filepath.Join(os.TempDir(), "hdh-rollback-installer.exe")

	if _, err := os.Stat(filePath); err != nil {
		return errors.New("installer not found")
	}

	cmd := exec.Command(
		"powershell",
		"Start-Process",
		filePath,
		"-Verb",
		"runAs",
	)

	err := cmd.Start()
	if err != nil {
		return err
	}

	runtime.Quit(a.ctx)

	return nil
}
