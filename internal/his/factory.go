package his

import (
	"database/sql"
	"errors"

	"hdh-rollback/internal/his/domain"
	hosxp "hdh-rollback/internal/his/hosxp3"
	hosxpv4 "hdh-rollback/internal/his/hosxp4"

	"hdh-rollback/internal/his/jhcis"
)

func NewProvider(hisType string, db *sql.DB) (domain.HISProvider, error) {
	switch hisType {
	case "hosxp3":
		return hosxp.New(db), nil
	case "jhcis":
		return jhcis.New(db), nil
    case "hosxp4":
		return hosxpv4.New(db),nil
	default:
		return nil, errors.New("unknown his type")
	}
}
