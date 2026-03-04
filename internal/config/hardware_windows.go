//go:build windows

package config

import (
	"crypto/sha256"
	"encoding/hex"

	"golang.org/x/sys/windows/registry"
)

func GetHardwareID() string {
	k, err := registry.OpenKey(
		registry.LOCAL_MACHINE,
		`SOFTWARE\Microsoft\Cryptography`,
		registry.QUERY_VALUE,
	)
	if err != nil {
		return ""
	}
	defer k.Close()

	guid, _, err := k.GetStringValue("MachineGuid")
	if err != nil {
		return ""
	}

	raw := "NARCO_SYSTEM_V1_" + guid
	hash := sha256.Sum256([]byte(raw))

	return hex.EncodeToString(hash[:])
}
