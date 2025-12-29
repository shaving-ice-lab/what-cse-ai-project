package service

import (
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrProfileNotFound    = errors.New("profile not found")
	ErrCertificateNotFound = errors.New("certificate not found")
)

type UserService struct {
	userRepo      *repository.UserRepository
	profileRepo   *repository.UserProfileRepository
	prefRepo      *repository.UserPreferenceRepository
	certRepo      *repository.UserCertificateRepository
}

func NewUserService(
	userRepo *repository.UserRepository,
	profileRepo *repository.UserProfileRepository,
	prefRepo *repository.UserPreferenceRepository,
	certRepo *repository.UserCertificateRepository,
) *UserService {
	return &UserService{
		userRepo:    userRepo,
		profileRepo: profileRepo,
		prefRepo:    prefRepo,
		certRepo:    certRepo,
	}
}

type UserProfileResponse struct {
	User         *model.User           `json:"user"`
	Profile      *model.UserProfile    `json:"profile"`
	Preferences  *model.UserPreference `json:"preferences"`
	Certificates []model.UserCertificate `json:"certificates"`
}

func (s *UserService) GetUserProfile(userID uint) (*UserProfileResponse, error) {
	user, err := s.userRepo.FindWithProfile(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	profile, _ := s.profileRepo.FindByUserID(userID)
	preferences, _ := s.prefRepo.FindByUserID(userID)
	certificates, _ := s.certRepo.FindByUserID(userID)

	return &UserProfileResponse{
		User:         user,
		Profile:      profile,
		Preferences:  preferences,
		Certificates: certificates,
	}, nil
}

type UpdateProfileRequest struct {
	Nickname           string `json:"nickname"`
	Avatar             string `json:"avatar"`
	Gender             string `json:"gender"`
	BirthDate          string `json:"birth_date"`
	HukouProvince      string `json:"hukou_province"`
	HukouCity          string `json:"hukou_city"`
	PoliticalStatus    string `json:"political_status"`
	Education          string `json:"education"`
	Major              string `json:"major"`
	School             string `json:"school"`
	GraduationDate     string `json:"graduation_date"`
	IsFreshGraduate    bool   `json:"is_fresh_graduate"`
	WorkYears          int    `json:"work_years"`
	GrassrootsExpYears int    `json:"grassroots_exp_years"`
}

func (s *UserService) UpdateProfile(userID uint, req *UpdateProfileRequest) error {
	// Update user basic info
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// Update or create profile
	profile := &model.UserProfile{
		UserID:             userID,
		Gender:             req.Gender,
		HukouProvince:      req.HukouProvince,
		HukouCity:          req.HukouCity,
		PoliticalStatus:    req.PoliticalStatus,
		Education:          req.Education,
		Major:              req.Major,
		School:             req.School,
		IsFreshGraduate:    req.IsFreshGraduate,
		WorkYears:          req.WorkYears,
		GrassrootsExpYears: req.GrassrootsExpYears,
	}

	return s.profileRepo.Upsert(profile)
}

type UpdatePreferencesRequest struct {
	PreferredProvinces   []string `json:"preferred_provinces"`
	PreferredCities      []string `json:"preferred_cities"`
	PreferredDepartments []string `json:"preferred_departments"`
	ExamTypes            []string `json:"exam_types"`
	MatchStrategy        string   `json:"match_strategy"`
}

func (s *UserService) UpdatePreferences(userID uint, req *UpdatePreferencesRequest) error {
	pref := &model.UserPreference{
		UserID:               userID,
		PreferredProvinces:   req.PreferredProvinces,
		PreferredCities:      req.PreferredCities,
		PreferredDepartments: req.PreferredDepartments,
		ExamTypes:            req.ExamTypes,
		MatchStrategy:        req.MatchStrategy,
	}

	if pref.MatchStrategy == "" {
		pref.MatchStrategy = string(model.MatchStrategySmart)
	}

	return s.prefRepo.Upsert(pref)
}

// Certificate management
func (s *UserService) GetCertificates(userID uint) ([]model.UserCertificate, error) {
	return s.certRepo.FindByUserID(userID)
}

type AddCertificateRequest struct {
	CertType     string `json:"cert_type" validate:"required"`
	CertName     string `json:"cert_name" validate:"required"`
	CertLevel    string `json:"cert_level"`
	ObtainedDate string `json:"obtained_date"`
}

func (s *UserService) AddCertificate(userID uint, req *AddCertificateRequest) (*model.UserCertificate, error) {
	cert := &model.UserCertificate{
		UserID:    userID,
		CertType:  req.CertType,
		CertName:  req.CertName,
		CertLevel: req.CertLevel,
	}

	if err := s.certRepo.Create(cert); err != nil {
		return nil, err
	}

	return cert, nil
}

func (s *UserService) UpdateCertificate(userID, certID uint, req *AddCertificateRequest) error {
	cert, err := s.certRepo.FindByID(certID)
	if err != nil {
		return ErrCertificateNotFound
	}

	if cert.UserID != userID {
		return ErrCertificateNotFound
	}

	cert.CertType = req.CertType
	cert.CertName = req.CertName
	cert.CertLevel = req.CertLevel

	return s.certRepo.Update(cert)
}

func (s *UserService) DeleteCertificate(userID, certID uint) error {
	cert, err := s.certRepo.FindByID(certID)
	if err != nil {
		return ErrCertificateNotFound
	}

	if cert.UserID != userID {
		return ErrCertificateNotFound
	}

	return s.certRepo.Delete(certID)
}
