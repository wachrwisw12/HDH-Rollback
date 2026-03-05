//go:build windows

package main

import "golang.org/x/sys/windows"

func alreadyRunning() bool {
	name, _ := windows.UTF16PtrFromString("HDH_ROLLBACK_MUTEX")

	mutex, _ := windows.CreateMutex(nil, false, name)

	lastErr := windows.GetLastError()

	if lastErr == windows.ERROR_ALREADY_EXISTS {
		windows.CloseHandle(mutex)
		return true
	}

	return false
}
