package config

var appMode = "dev" // default

// ตัวที่ frontend เรียก
func VerifyLicense() bool {
	if appMode == "dev" {
		return true
	}
	return false
	// return verifyLicenseInternal() == nil
}

func verifyLicenseInternal() error {
	// logic RSA verify จริงที่ผมให้ก่อนหน้า
	return nil
}
