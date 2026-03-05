//go:build windows

package main

import (
	"golang.org/x/sys/windows"
)

var mutex windows.Handle

func alreadyRunning() bool {
	name, _ := windows.UTF16PtrFromString("Global\\HDH_ROLLBACK_APP_V1_MUTEX")
	m, err := windows.CreateMutex(nil, true, name)
	if err != nil {
		return false
	}

	mutex = m

	if windows.GetLastError() == windows.ERROR_ALREADY_EXISTS {
		return true
	}

	return false
}
