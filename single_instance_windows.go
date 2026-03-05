//go:build windows

package main

import (
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

var mutex windows.Handle

func alreadyRunning() bool {
	name, _ := windows.UTF16PtrFromString("Global\\HDH_ROLLBACK_MUTEX")

	handle, err := windows.OpenMutex(windows.SYNCHRONIZE, false, name)

	if err == nil {
		windows.CloseHandle(handle)

		focusExistingWindow()

		return true
	}

	mutex, _ = windows.CreateMutex(nil, false, name)

	return false
}

func focusExistingWindow() {
	user32 := syscall.NewLazyDLL("user32.dll")

	findWindow := user32.NewProc("FindWindowW")
	setForeground := user32.NewProc("SetForegroundWindow")
	showWindow := user32.NewProc("ShowWindow")

	title, _ := windows.UTF16PtrFromString("hdh rollback")

	hwnd, _, _ := findWindow.Call(0, uintptr(unsafe.Pointer(title)))

	if hwnd != 0 {
		showWindow.Call(hwnd, 9) // SW_RESTORE
		setForeground.Call(hwnd)
	}
}
