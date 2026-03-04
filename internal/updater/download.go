package updater

import (
	"io"
	"net/http"
	"os"
	"os/exec"
)

func Download(url string, path string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, resp.Body)
	return err
}

func Install(installerPath string) {
	exec.Command(installerPath, "/S").Start()
	os.Exit(0)
}
