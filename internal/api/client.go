package api

import (
	"bytes"
	"fmt"
	"net/http"
	"time"

	"hdh-rollback/internal/config"
)

func CallAPI() error {
	body := []byte(`{"username":"admin","hoscode":"10670"}`)

	// timestamp
	timestamp := fmt.Sprintf("%d", time.Now().Unix())

	// โหลด private key
	privateKey, err := config.LoadPrivateKey()
	if err != nil {
		return err
	}

	// สร้าง signature
	signature, err := config.GenerateSignature(privateKey, body, timestamp)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(
		"POST",
		"http://localhost:3001/api/v2/hdh/ccheckuser",
		bytes.NewBuffer(body),
	)

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Timestamp", timestamp)
	req.Header.Set("X-Signature", signature)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	fmt.Println("Status:", resp.Status)

	return nil
}
