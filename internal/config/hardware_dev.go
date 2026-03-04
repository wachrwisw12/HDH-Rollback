//go:build !windows

package config

func GetHardwareID() string {
	// ใช้ค่า mock สำหรับ dev
	return "DEV_MACHINE_ID"
}
