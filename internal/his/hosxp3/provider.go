package hosxp

import (
	"crypto/md5"
	"database/sql"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"

	"hdh-rollback/internal/his/domain"
)

type Provider struct {
	db *sql.DB
}

func New(db *sql.DB) *Provider {
	return &Provider{db: db}
}

func (h *Provider) Login(username, password string) (*domain.User, error) {
	var storedHash string
	var fullName string

	err := h.db.QueryRow(`
		SELECT passweb ,name
		FROM opduser
		WHERE loginname = ?
	`, username).Scan(&storedHash, &fullName)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !verifyMD5(password, storedHash) {
		return nil, errors.New("invalid password")
	}

	return &domain.User{
		Username: username,
		FullName: fullName,
	}, nil
}

func verifyMD5(input, stored string) bool {
	hash := md5.Sum([]byte(input))
	hashed := strings.ToUpper(hex.EncodeToString(hash[:]))
	return hashed == strings.ToUpper(stored)
}

func (h *Provider) BulkGetCID(list []domain.CIDRequest) (map[string]domain.PersonResult, error) {
	results := make(map[string]domain.PersonResult)

	if len(list) == 0 {
		return results, nil
	}

	// =========================
	// เตรียม input
	// =========================
	inputMap := make(map[string]bool)
	placeholders := make([]string, 0, len(list))
	args := make([]interface{}, 0, len(list))

	for _, item := range list {
		inputMap[item.Pid] = true
		placeholders = append(placeholders, "?")
		args = append(args, item.Pid)
	}

	// =========================
	// STEP 1: ค้นหาด้วย person_id
	// =========================
	query1 := `
	SELECT pt.hn,
	       ps.person_id,
	       ps.cid,
	       CONCAT(ps.pname, ps.fname, ' ', ps.lname) AS full_name,
		   CONCAT(pt.addrpart,' หมู่ ',pt.moopart,' ',td.full_name) AS address_name
	FROM person ps
	LEFT JOIN patient pt ON ps.cid = pt.cid
	LEFT JOIN thaiaddress td ON td.addressid=pt.addressid
	WHERE ps.person_id IN (` + strings.Join(placeholders, ",") + `)
`

	rows, err := h.db.Query(query1, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	foundMap := make(map[string]bool)

	for rows.Next() {
		var hn sql.NullString
		var pidInt int
		var cid sql.NullString
		var fullName sql.NullString
		var addressName sql.NullString

		// ✅ ลำดับต้องตรงกับ SELECT
		if err := rows.Scan(&hn, &pidInt, &cid, &fullName, &addressName); err != nil {
			return nil, err
		}

		pidStr := strconv.Itoa(pidInt)

		person := domain.PersonResult{
			CID:         cid.String,
			FullName:    fullName.String,
			Hn:          hn.String,
			AddressName: addressName.String,
		}

		results[pidStr] = person
		foundMap[pidStr] = true
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// =========================
	// STEP 2: หา list ที่ไม่เจอ
	// =========================
	missing := make([]interface{}, 0)

	for key := range inputMap {
		if !foundMap[key] {
			missing = append(missing, key)
		}
	}

	if len(missing) == 0 {
		return results, nil
	}

	placeholders2 := make([]string, len(missing))
	for i := range missing {
		placeholders2[i] = "?"
	}

	query2 := `
		SELECT pt.hn,
	       ps.person_id,
	       ps.cid,
	       CONCAT(ps.pname, ps.fname, ' ', ps.lname) AS full_name,
		   CONCAT(pt.addrpart,' หมู่ ',pt.moopart,' ',td.full_name) AS address_name
	FROM person ps
	LEFT JOIN patient pt ON ps.cid = pt.cid
	LEFT JOIN thaiaddress td ON td.addressid=pt.addressid
	WHERE ps.cid IN (` + strings.Join(placeholders2, ",") + `)
	`

	rows2, err := h.db.Query(query2, missing...)
	if err != nil {
		return nil, err
	}
	defer rows2.Close()

	for rows2.Next() {
		var hn sql.NullString
		var pidInt int
		var cid sql.NullString
		var fullName sql.NullString
		var addressName sql.NullString

		if err := rows2.Scan(&hn, &pidInt, &cid, &fullName, &addressName); err != nil {
			return nil, err
		}

		person := domain.PersonResult{
			CID:         cid.String,
			FullName:    fullName.String,
			Hn:          hn.String,
			AddressName: addressName.String,
		}

		// key ด้วย cid (fallback)
		if cid.Valid {
			results[cid.String] = person
		}
	}

	if err := rows2.Err(); err != nil {
		return nil, err
	}

	return results, nil
}
