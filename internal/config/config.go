package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Config struct {
	DBType   string `json:"db_type"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Database string `json:"database"`
	Username string `json:"username"`
	HisType  string `json:"his_type"`
}

func getAppDir() (string, error) {
	base, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	appDir := filepath.Join(base, "HDH-Exchange")
	err = os.MkdirAll(appDir, 0o755)
	if err != nil {
		return "", err
	}

	return appDir, nil
}

func getConfigPath() (string, error) {
	dir, err := getAppDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "config.json"), nil
}

func Exists() bool {
	path, err := getConfigPath()
	if err != nil {
		return false
	}
	_, err = os.Stat(path)
	return err == nil
}

func Load() (*Config, error) {
	path, err := getConfigPath()
	if err != nil {
		return nil, err
	}

	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	err = json.Unmarshal(file, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}

func getPasswordPath() (string, error) {
	dir, err := getAppDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "db.pass"), nil
}

func LoadPassword() (string, error) {
	path, err := getPasswordPath()
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

func SavePassword(password string) error {
	path, err := getPasswordPath()
	if err != nil {
		return err
	}

	return os.WriteFile(path, []byte(password), 0o600)
}

func Save(cfg *Config) error {
	path, err := getConfigPath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0o644)
}
