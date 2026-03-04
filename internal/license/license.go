package license

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
)

var publicKeyPEM = `
-----BEGIN PUBLIC KEY-----
PUT_YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----
`

type License struct {
	HardwareID string `json:"hardware_id"`
	ExpireAt   string `json:"expire_at"`
	Signature  string `json:"signature"`
}

func VerifyLicense(data []byte, lic License) error {
	block, _ := pem.Decode([]byte(publicKeyPEM))
	pub, _ := x509.ParsePKIXPublicKey(block.Bytes)
	publicKey := pub.(*rsa.PublicKey)

	hash := sha256.Sum256(data)

	signature, _ := base64.StdEncoding.DecodeString(lic.Signature)

	err := rsa.VerifyPKCS1v15(
		publicKey,
		crypto.SHA256,
		hash[:],
		signature,
	)

	return err
}
