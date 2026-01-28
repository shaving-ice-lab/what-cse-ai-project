package service

import (
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrCertificateNotFound = errors.New("certificate not found")
	ErrInvalidSection      = errors.New("invalid profile section")
)

type UserService struct {
	userRepo    *repository.UserRepository
	profileRepo *repository.UserProfileRepository
	prefRepo    *repository.UserPreferenceRepository
	certRepo    *repository.UserCertificateRepository
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
	User         *model.User             `json:"user"`
	Profile      *model.UserProfile      `json:"profile"`
	Preferences  *model.UserPreference   `json:"preferences"`
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

// =====================================================
// 分区更新功能
// =====================================================

// ProfileSection 画像分区
type ProfileSection string

const (
	SectionEducation ProfileSection = "education"
	SectionMajor     ProfileSection = "major"
	SectionPersonal  ProfileSection = "personal"
	SectionLocation  ProfileSection = "location"
	SectionWork      ProfileSection = "work"
)

// UpdateEducationRequest 学历信息更新请求
type UpdateEducationRequest struct {
	Education        string `json:"education"`
	Degree           string `json:"degree"`
	GraduateYear     *int   `json:"graduate_year"`
	GraduationDate   string `json:"graduation_date"`
	IsCurrentStudent bool   `json:"is_current_student"`
	School           string `json:"school"`
	SchoolType       string `json:"school_type"`
	IsFreshGraduate  bool   `json:"is_fresh_graduate"`
}

// UpdateMajorRequest 专业信息更新请求
type UpdateMajorRequest struct {
	Major           string `json:"major"`
	MajorCategory   string `json:"major_category"`
	MajorCode       string `json:"major_code"`
	SecondMajor     string `json:"second_major"`
	SecondMajorCode string `json:"second_major_code"`
}

// UpdatePersonalRequest 个人信息更新请求
type UpdatePersonalRequest struct {
	Gender          string `json:"gender"`
	BirthDate       string `json:"birth_date"`
	PoliticalStatus string `json:"political_status"`
	IdentityType    string `json:"identity_type"`
}

// UpdateLocationRequest 地域信息更新请求
type UpdateLocationRequest struct {
	HukouProvince   string `json:"hukou_province"`
	HukouCity       string `json:"hukou_city"`
	CurrentProvince string `json:"current_province"`
	CurrentCity     string `json:"current_city"`
}

// UpdateWorkRequest 工作经历更新请求
type UpdateWorkRequest struct {
	WorkYears          int `json:"work_years"`
	GrassrootsExpYears int `json:"grassroots_exp_years"`
}

// UpdateEducation 更新学历信息
func (s *UserService) UpdateEducation(userID uint, req *UpdateEducationRequest) error {
	profile, err := s.getOrCreateProfile(userID)
	if err != nil {
		return err
	}

	profile.Education = req.Education
	profile.Degree = req.Degree
	profile.GraduateYear = req.GraduateYear
	profile.IsCurrentStudent = req.IsCurrentStudent
	profile.School = req.School
	profile.SchoolType = req.SchoolType
	profile.IsFreshGraduate = req.IsFreshGraduate

	if req.GraduationDate != "" {
		if t, err := time.Parse("2006-01-02", req.GraduationDate); err == nil {
			profile.GraduationDate = &t
		}
	}

	// 更新完整度
	profile.ProfileCompleteness = profile.CalculateCompleteness()

	return s.profileRepo.Update(profile)
}

// UpdateMajor 更新专业信息
func (s *UserService) UpdateMajor(userID uint, req *UpdateMajorRequest) error {
	profile, err := s.getOrCreateProfile(userID)
	if err != nil {
		return err
	}

	profile.Major = req.Major
	profile.MajorCategory = req.MajorCategory
	profile.MajorCode = req.MajorCode
	profile.SecondMajor = req.SecondMajor
	profile.SecondMajorCode = req.SecondMajorCode

	profile.ProfileCompleteness = profile.CalculateCompleteness()

	return s.profileRepo.Update(profile)
}

// UpdatePersonal 更新个人信息
func (s *UserService) UpdatePersonal(userID uint, req *UpdatePersonalRequest) error {
	profile, err := s.getOrCreateProfile(userID)
	if err != nil {
		return err
	}

	profile.Gender = req.Gender
	profile.PoliticalStatus = req.PoliticalStatus
	profile.IdentityType = req.IdentityType

	if req.BirthDate != "" {
		if t, err := time.Parse("2006-01-02", req.BirthDate); err == nil {
			profile.BirthDate = &t
		}
	}

	profile.ProfileCompleteness = profile.CalculateCompleteness()

	return s.profileRepo.Update(profile)
}

// UpdateLocation 更新地域信息
func (s *UserService) UpdateLocation(userID uint, req *UpdateLocationRequest) error {
	profile, err := s.getOrCreateProfile(userID)
	if err != nil {
		return err
	}

	profile.HukouProvince = req.HukouProvince
	profile.HukouCity = req.HukouCity
	profile.CurrentProvince = req.CurrentProvince
	profile.CurrentCity = req.CurrentCity

	profile.ProfileCompleteness = profile.CalculateCompleteness()

	return s.profileRepo.Update(profile)
}

// UpdateWork 更新工作经历
func (s *UserService) UpdateWork(userID uint, req *UpdateWorkRequest) error {
	profile, err := s.getOrCreateProfile(userID)
	if err != nil {
		return err
	}

	profile.WorkYears = req.WorkYears
	profile.GrassrootsExpYears = req.GrassrootsExpYears

	profile.ProfileCompleteness = profile.CalculateCompleteness()

	return s.profileRepo.Update(profile)
}

// getOrCreateProfile 获取或创建用户画像
func (s *UserService) getOrCreateProfile(userID uint) (*model.UserProfile, error) {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		// 创建新的画像
		profile = &model.UserProfile{
			UserID: userID,
		}
		if err := s.profileRepo.Create(profile); err != nil {
			return nil, err
		}
	}
	return profile, nil
}

// =====================================================
// 完整度和统计功能
// =====================================================

// CompletenessResponse 完整度响应
type CompletenessResponse struct {
	Completeness    int                    `json:"completeness"`
	MissingSections []MissingSectionInfo   `json:"missing_sections"`
	SectionStatus   map[string]SectionInfo `json:"section_status"`
}

// MissingSectionInfo 缺失区块信息
type MissingSectionInfo struct {
	Section     string   `json:"section"`
	SectionName string   `json:"section_name"`
	Fields      []string `json:"fields"`
}

// SectionInfo 区块信息
type SectionInfo struct {
	Name       string `json:"name"`
	IsComplete bool   `json:"is_complete"`
	Fields     int    `json:"fields"`
	Filled     int    `json:"filled"`
}

// GetProfileCompleteness 获取画像完整度详情
func (s *UserService) GetProfileCompleteness(userID uint) (*CompletenessResponse, error) {
	profile, _ := s.profileRepo.FindByUserID(userID)
	if profile == nil {
		profile = &model.UserProfile{}
	}

	resp := &CompletenessResponse{
		Completeness:    profile.CalculateCompleteness(),
		MissingSections: []MissingSectionInfo{},
		SectionStatus:   make(map[string]SectionInfo),
	}

	// 学历信息分析
	eduFields, eduFilled := 0, 0
	eduMissing := []string{}
	if profile.Education != "" {
		eduFilled++
	} else {
		eduMissing = append(eduMissing, "最高学历")
	}
	eduFields++
	if profile.Degree != "" {
		eduFilled++
	}
	eduFields++
	if profile.School != "" {
		eduFilled++
	} else {
		eduMissing = append(eduMissing, "毕业院校")
	}
	eduFields++
	if profile.GraduateYear != nil || profile.GraduationDate != nil {
		eduFilled++
	}
	eduFields++

	resp.SectionStatus["education"] = SectionInfo{
		Name:       "学历信息",
		IsComplete: eduFilled >= 3,
		Fields:     eduFields,
		Filled:     eduFilled,
	}
	if len(eduMissing) > 0 {
		resp.MissingSections = append(resp.MissingSections, MissingSectionInfo{
			Section:     "education",
			SectionName: "学历信息",
			Fields:      eduMissing,
		})
	}

	// 专业信息分析
	majorFields, majorFilled := 0, 0
	majorMissing := []string{}
	if profile.Major != "" {
		majorFilled++
	} else {
		majorMissing = append(majorMissing, "专业名称")
	}
	majorFields++
	if profile.MajorCategory != "" {
		majorFilled++
	}
	majorFields++

	resp.SectionStatus["major"] = SectionInfo{
		Name:       "专业信息",
		IsComplete: majorFilled >= 1,
		Fields:     majorFields,
		Filled:     majorFilled,
	}
	if len(majorMissing) > 0 {
		resp.MissingSections = append(resp.MissingSections, MissingSectionInfo{
			Section:     "major",
			SectionName: "专业信息",
			Fields:      majorMissing,
		})
	}

	// 个人信息分析
	personalFields, personalFilled := 0, 0
	personalMissing := []string{}
	if profile.Gender != "" {
		personalFilled++
	}
	personalFields++
	if profile.BirthDate != nil {
		personalFilled++
	} else {
		personalMissing = append(personalMissing, "出生日期")
	}
	personalFields++
	if profile.PoliticalStatus != "" {
		personalFilled++
	} else {
		personalMissing = append(personalMissing, "政治面貌")
	}
	personalFields++
	if profile.IdentityType != "" {
		personalFilled++
	}
	personalFields++

	resp.SectionStatus["personal"] = SectionInfo{
		Name:       "个人信息",
		IsComplete: personalFilled >= 3,
		Fields:     personalFields,
		Filled:     personalFilled,
	}
	if len(personalMissing) > 0 {
		resp.MissingSections = append(resp.MissingSections, MissingSectionInfo{
			Section:     "personal",
			SectionName: "个人信息",
			Fields:      personalMissing,
		})
	}

	// 地域信息分析
	locationFields, locationFilled := 0, 0
	locationMissing := []string{}
	if profile.HukouProvince != "" {
		locationFilled++
	} else {
		locationMissing = append(locationMissing, "户籍所在地")
	}
	locationFields++
	if profile.CurrentProvince != "" {
		locationFilled++
	}
	locationFields++

	resp.SectionStatus["location"] = SectionInfo{
		Name:       "地域信息",
		IsComplete: locationFilled >= 1,
		Fields:     locationFields,
		Filled:     locationFilled,
	}
	if len(locationMissing) > 0 {
		resp.MissingSections = append(resp.MissingSections, MissingSectionInfo{
			Section:     "location",
			SectionName: "地域信息",
			Fields:      locationMissing,
		})
	}

	// 工作经历分析
	resp.SectionStatus["work"] = SectionInfo{
		Name:       "工作经历",
		IsComplete: true, // 工作经历默认为0是合理的
		Fields:     2,
		Filled:     2,
	}

	return resp, nil
}

// GetProfileOnly 仅获取画像（不包含用户信息）
func (s *UserService) GetProfileOnly(userID uint) (*model.UserProfileResponse, error) {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}
	return profile.ToResponse(), nil
}

// GetPreferencesOnly 仅获取偏好设置
func (s *UserService) GetPreferencesOnly(userID uint) (*model.UserPreference, error) {
	pref, err := s.prefRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	return pref, nil
}

// DeleteProfile 删除用户画像
func (s *UserService) DeleteProfile(userID uint) error {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return ErrProfileNotFound
	}
	return s.profileRepo.Delete(profile.ID)
}
