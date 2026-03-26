package config

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
)

var privateKeyPEM = `
-----BEGIN RSA PRIVATE KEY-----
LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb2dJQkFBS0NBUUVBdzhWY0RuZUsxcnhkOE5CM0E0ZEVPeEZEMGVER3grN1lpWnZ6ZXRtVmxMVkZzSFpQCkY0MXN6WHAxK3doTlBPUlgxR1loU2FMWi9CUStzODVzUjFTOU9pK1FZR1lmR3JIY1dVV1hXSitXT1hnZ2U1VHYKYUhubDJwd1pUVjZmSjJGTktNN00xM2hpZWdwdFdzemZFR2VFS21kWjFaSFpwbld0UHdFWldPYlpCMmhVdXl0OApjcTBKdlNYS2hidTVJTXF6OE1kRmI3Q2luczhnZ0k3aEo0RyttcDcxcStVSnc5dFpkZGd1VTNCTGp2a0xBc0lpCk1TMExZVnR6TWtZWk1tM05sc1IrVUhTTjNXWHphQ0dSWVFmK2NjNXdTVFhlNDFaK096bm1RUjN4Q1hNTkF5aTcKUTNGcFkyM2VxencvOURhMVhybUp4MS9MQkRSWm5NYU95YlZsa3dJREFRQUJBb0lCQUN6UkVvanhUdVJuek8yagpHNHZBUEp0MUVWeUxvNVlEbEtpei9lSkN5MTUydlJSdmtSMm9MNTgraUtIR1BjQlIyZFZ5NSszdWpRNkxKK3VMCnR2Z0JheXhWMVN4c1ZIU05BUStpd2NuMUJyUHpUeVJiYlE4eTBLN2lDMXpONjR0ZFdBZWVpQUJQdStPS1hZeHEKMkNudU9MQm9ab1ZnMVQycE5OYjJqbkh1cndKbHRsN29HNnpXa1R5MGg2elV4WS85ZkM3SGRaMWFZaW5WeDRubApmUGg1NmRBM0JyNzdZYmtiVFF0Y3R4WTc3WTN5MlNGVGlvNVloSnV4UXpmQXppNEV5Mk5PY3NRTlljMVIvWEc0CjZmeXhjb1pBbzNTdFR2Z3ZCMUd4UmlKVFZ0d09JN0l1RTNCazJaNVFYeXdaMjZVN0hyZEdTaG5RVU5xYjg4a3MKejJUSHlTRUNnWUVBNmVVUUJieTFFTzVXZllZVk1TR2hVb0h2NlJOT1loU2xPUXRkK0gzcldzVlM1dHpZK0V4ZApKZ2tGV0prdURDOXdKMTVTcUxrS3h5eVdiODYvb3hzS0d6OTRZYmdqdDhEQUFRendLdDBSMzZDdlJKcWNqWFp1CnZSR2N5RWpHRmRFTVcvQlpLQW10RVhITVI5eXFVa3lSR25BeEUvR21iZGFWbGVpdkZTSGpQWU1DZ1lFQTFrWHEKSkJkcHFiL0g4S1Zwa3hlRzg5a214RFlHai91RUQxdHhNRG54ejFpNGxLL2FkQXpIYXE2QkQyS2F4bnR0SUQ5KwpyZ3NIdDMrN0RNR1lOVTRnK080U0xrT1R2bTdsaTZQdGNVV2psT3F5WVZ1T1dqaStNbXFIZ0RvbDZMWHJIN1RICmRhRkVpaC9GT2RhVzJNMVRtYURUcjQ3ZXpuSURWQnVObUN2d1NyRUNnWUFlZlRTVWV0L2pnQjRZS01WVWJUeloKUTRUaGpobTJvVmhVVWs0Q21XOTNtcWRPM3RVTnNPNm5pWjkveUIvL2lLT0hEajJhTHR6Zno4a2dkQVA1SUFvMgpPUlRaTUNhL3lrbDlHWkdwRkw1Q3QzQ0JjZUljY3FiRzBLZnVWOFl5aTlpZmwzb1h4UU1oZGdNYUR3TEl6YUJRCm9QVlUwemhOc3g0MnQya3pTUUtWUHdLQmdBNkVQaENqNVd5eXFZRU1NOUxiVFRGSURQQk9HTE80Zm9IcjJBZEUKWmJWK2RVTGRoeGRGcGx6NzVaSjlRNjhldlkzcHYxTmJPL0thbkxtSWhCOVlZN041clpHazBtV2NiY0RBSWw0QwpNY3JzKzVqTTh4LzVxQ2tTUG92WlpLZ1hhdzZDMk9DSFJIVjNJWTJCbEVhcjRuWU9CMGxsaklMQUJxbTBGQ3V6CkRseUJBb0dBY3ZqWGRSZFoxTzFLdUMwYmJrNENXY1JxZy9HeVBCaGVKYVg4NDZPL0ZEQURIaHdQVEhZd2JXSXYKaE9lejhOTjhhbEF5MGd6RThhSC9GbzhBMVNuLzdTZXYxUndxYUROVVNyOVlZak8rOEZNWnRLRmMxelN1aEc2ZAo4bFRsaTF0emtROFpYREJrSEFtc2ZOUktkRmo3ZXpYSzUyYmhVL1JUS2o0SXByYjI2dVE9Ci0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==

-----END RSA PRIVATE KEY-----
`

func LoadPrivateKey() (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		return nil, fmt.Errorf("invalid key")
	}

	decoded, err := base64.StdEncoding.DecodeString(string(block.Bytes))
	if err != nil {
		return nil, err
	}

	block2, _ := pem.Decode(decoded)
	if block2 == nil {
		return nil, fmt.Errorf("invalid decoded key")
	}

	return x509.ParsePKCS1PrivateKey(block2.Bytes)
}

func GenerateSignature(privateKey *rsa.PrivateKey, body []byte, timestamp string) (string, error) {
	data := string(body) + timestamp

	hash := sha256.Sum256([]byte(data))

	signature, err := rsa.SignPKCS1v15(
		rand.Reader,
		privateKey,
		crypto.SHA256,
		hash[:],
	)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(signature), nil
}
