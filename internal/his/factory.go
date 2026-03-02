package his

import (
	"database/sql"
	"errors"

	"hdh-rollback/internal/his/domain"
	"hdh-rollback/internal/his/hosxp"

	"hdh-rollback/internal/his/jhcis"
)

func NewProvider(hisType string, db *sql.DB) (domain.HISProvider, error) {
	switch hisType {
	case "hosxp":
		return hosxp.New(db), nil
	case "jhcis":
		return jhcis.New(db), nil
	default:
		return nil, errors.New("unknown his type")
	}
}
