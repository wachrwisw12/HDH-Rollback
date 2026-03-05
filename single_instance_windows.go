//go:build windows

package main

import "golang.org/x/sys/windows"

var mutex windows.Handle

func alreadyRunning() bool {
	name, _ := windows.UTF16PtrFromString("Global\\HDH_ROLLBACK_MUTEX")

	m, err := windows.CreateMutex(nil, false, name)
	if err != nil {
		return false
	}

	mutex = m

	lastErr := windows.GetLastError()

	if lastErr == windows.ERROR_ALREADY_EXISTS {
		return true
	}

	return false
}
