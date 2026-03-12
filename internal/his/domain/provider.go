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
	CID         string `json:"his_cid"`
	FullName    string `json:"fullname"`
	Hn          string `json:"hn,omitempty"`
	AddressName string `json:"address_name"`
}

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

type LoginResponse struct {
	Status string `json:"status"`
	User   *User  `json:"user"`
}

//	type UpdateInfo struct {
//		Version string `json:"version"`
//		URL     string `json:"url"`
//	}
type UpdateInfo struct {
	Version string
	URL     string
	SHA256  string
}
type Release struct {
	TagName string  `json:"tag_name"`
	Assets  []Asset `json:"assets"`
}

type Asset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
}
