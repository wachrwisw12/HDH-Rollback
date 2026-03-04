package updater

import (
	"encoding/json"
	"net/http"
)

type Release struct {
	TagName string `json:"tag_name"`
	Assets  []struct {
		BrowserDownloadURL string `json:"broser_download_url"`
	} `json:"assets"`
}

func Check(current string) (string, string, error) {
	resp, err := http.Get("https://github.com/wachrwisw12/HDH-Rollback/releases/latest")
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	var r Release
	json.NewDecoder(resp.Body).Decode(&r)
	if r.TagName != "v"+current {
		return r.TagName, r.Assets[0].BrowserDownloadURL, nil
	}
	return "", "", nil
}
