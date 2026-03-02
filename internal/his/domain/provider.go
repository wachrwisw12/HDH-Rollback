package domain

type User struct {
	ID       int
	Username string
	FullName string
}

type CIDRequest struct {
	Pid string `json:"pid"`
}
type PersonResult struct {
	CID         string `json:"cid"`
	FullName    string `json:"fullname"`
	Hn          string `json:"hn,omitempty"`
	AddressName string `json:"address_name"`
}

// type AuthProvider interface {
// 	Login(username, password string) (*User, error)
// }

type CIDProvider interface {
	BulkGetCID(list []CIDRequest) (map[string]string, error)
}
type HISProvider interface {
	Login(username, password string) (*User, error)
	BulkGetCID(list []CIDRequest) (map[string]PersonResult, error)
}
type ExcelResponse struct {
	Headers []string                 `json:"headers"`
	Rows    []map[string]interface{} `json:"rows"`
}
