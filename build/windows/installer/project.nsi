Unicode true

#### Include Wails tools ####
!include "wails_tools.nsh"

# -----------------------------
# Version Information
# -----------------------------
VIProductVersion "${INFO_PRODUCTVERSION}.0"
VIFileVersion    "${INFO_PRODUCTVERSION}.0"

VIAddVersionKey "CompanyName"     "${INFO_COMPANYNAME}"
VIAddVersionKey "FileDescription" "${INFO_PRODUCTNAME} Installer"
VIAddVersionKey "ProductVersion"  "${INFO_PRODUCTVERSION}"
VIAddVersionKey "FileVersion"     "${INFO_PRODUCTVERSION}"
VIAddVersionKey "LegalCopyright"  "${INFO_COPYRIGHT}"
VIAddVersionKey "ProductName"     "${INFO_PRODUCTNAME}"

# -----------------------------
# Silent Mode Support
# -----------------------------
Var SilentMode

Function .onInit
    IfSilent 0 +2
    StrCpy $SilentMode 1

    !insertmacro wails.checkArchitecture
FunctionEnd

# -----------------------------
# DPI Support
# -----------------------------
ManifestDPIAware true

# -----------------------------
# Modern UI
# -----------------------------
!include "MUI.nsh"

!define MUI_ICON "..\icon.ico"
!define MUI_UNICON "..\icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_NOAUTOCLOSE

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

# -----------------------------
# Installer Settings
# -----------------------------
Name "${INFO_PRODUCTNAME}"
OutFile "..\..\bin\${INFO_PROJECTNAME}-${ARCH}-installer.exe"

InstallDir "$PROGRAMFILES64\${INFO_COMPANYNAME}\${INFO_PRODUCTNAME}"
InstallDirRegKey HKLM "Software\${INFO_COMPANYNAME}\${INFO_PRODUCTNAME}" "InstallDir"

ShowInstDetails show
RequestExecutionLevel admin

# -----------------------------
# Installation Section
# -----------------------------
Section "Install"

    !insertmacro wails.setShellContext
    !insertmacro wails.webview2runtime

    # ถ้ามี install เดิม → ลบ shortcut ก่อน
    Delete "$SMPROGRAMS\${INFO_PRODUCTNAME}.lnk"
    Delete "$DESKTOP\${INFO_PRODUCTNAME}.lnk"

    # สร้าง folder
    SetOutPath "$INSTDIR"

    # copy files จาก wails build
    !insertmacro wails.files

    # จำ install path
    WriteRegStr HKLM "Software\${INFO_COMPANYNAME}\${INFO_PRODUCTNAME}" "InstallDir" "$INSTDIR"

    # สร้าง shortcut
    CreateShortcut "$SMPROGRAMS\${INFO_PRODUCTNAME}.lnk" "$INSTDIR\${PRODUCT_EXECUTABLE}"
    CreateShortcut "$DESKTOP\${INFO_PRODUCTNAME}.lnk" "$INSTDIR\${PRODUCT_EXECUTABLE}"

    # file association
    !insertmacro wails.associateFiles
    !insertmacro wails.associateCustomProtocols

    # สร้าง uninstaller
    !insertmacro wails.writeUninstaller

    # เปิดโปรแกรมหลัง install
  #  Exec '"$INSTDIR\${PRODUCT_EXECUTABLE}"'

SectionEnd


# -----------------------------
# Uninstall Section
# -----------------------------
Section "Uninstall"

    !insertmacro wails.setShellContext

    # ลบ shortcut
    Delete "$SMPROGRAMS\${INFO_PRODUCTNAME}.lnk"
    Delete "$DESKTOP\${INFO_PRODUCTNAME}.lnk"

    # ลบ registry
    DeleteRegKey HKLM "Software\${INFO_COMPANYNAME}\${INFO_PRODUCTNAME}"

    # ลบ appdata
    RMDir /r "$AppData\${PRODUCT_EXECUTABLE}"

    # ลบ install folder
    RMDir /r "$INSTDIR"

    # remove file association
    !insertmacro wails.unassociateFiles
    !insertmacro wails.unassociateCustomProtocols

    # ลบ uninstaller
    !insertmacro wails.deleteUninstaller

SectionEnd