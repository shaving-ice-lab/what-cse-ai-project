package service

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// CompareService 职位对比服务
type CompareService struct {
	positionRepo *repository.PositionRepository
}

// NewCompareService 创建对比服务
func NewCompareService(positionRepo *repository.PositionRepository) *CompareService {
	return &CompareService{
		positionRepo: positionRepo,
	}
}

// =====================================================
// 数据结构定义
// =====================================================

// CompareItem 对比项
type CompareItem struct {
	Position        *model.Position `json:"position"`
	DaysUntilEnd    *int            `json:"days_until_end,omitempty"`    // 距离报名截止天数
	IsRegistering   bool            `json:"is_registering"`              // 是否正在报名中
	FormattedRegEnd string          `json:"formatted_reg_end,omitempty"` // 格式化的报名截止日期
}

// CompareResponse 对比响应
type CompareResponse struct {
	Items          []*CompareItem      `json:"items"`
	Recommendation *Recommendation     `json:"recommendation,omitempty"`
	Summary        *CompareSummary     `json:"summary,omitempty"`
	Dimensions     []*CompareDimension `json:"dimensions"`
}

// Recommendation 推荐结果
type Recommendation struct {
	BestForFreshGrad  *PositionRecommend `json:"best_for_fresh_grad,omitempty"` // 最适合应届生
	MostRecruit       *PositionRecommend `json:"most_recruit,omitempty"`        // 招录人数最多
	LowestRequirement *PositionRecommend `json:"lowest_requirement,omitempty"`  // 条件最宽松
	SoonestDeadline   *PositionRecommend `json:"soonest_deadline,omitempty"`    // 报名即将截止
	LowestCompetition *PositionRecommend `json:"lowest_competition,omitempty"`  // 竞争最小
}

// PositionRecommend 职位推荐
type PositionRecommend struct {
	PositionID   uint   `json:"position_id"`
	PositionName string `json:"position_name"`
	Reason       string `json:"reason"`
	Value        string `json:"value,omitempty"` // 相关值，如人数、比例等
}

// CompareSummary 对比总结
type CompareSummary struct {
	Overview    string   `json:"overview"`    // 总体分析
	Highlights  []string `json:"highlights"`  // 重点对比项
	Suggestions []string `json:"suggestions"` // 选择建议
}

// CompareDimension 对比维度
type CompareDimension struct {
	Key         string            `json:"key"`
	Label       string            `json:"label"`
	Type        string            `json:"type"` // text, number, date, boolean, tags
	Values      []*DimensionValue `json:"values"`
	HasDiff     bool              `json:"has_diff"`
	BestValueID *uint             `json:"best_value_id,omitempty"` // 最优值对应的职位ID
}

// DimensionValue 维度值
type DimensionValue struct {
	PositionID uint        `json:"position_id"`
	Value      interface{} `json:"value"`
	Display    string      `json:"display"`
	IsBest     bool        `json:"is_best"`
}

// =====================================================
// 核心方法
// =====================================================

// ComparePositions 对比职位
func (s *CompareService) ComparePositions(ids []uint) (*CompareResponse, error) {
	if len(ids) < 2 {
		return nil, fmt.Errorf("需要至少选择2个职位进行对比")
	}
	if len(ids) > 5 {
		return nil, fmt.Errorf("最多只能对比5个职位")
	}

	// 获取对比数据
	items, err := s.GetCompareItems(ids)
	if err != nil {
		return nil, err
	}

	if len(items) < 2 {
		return nil, fmt.Errorf("找到的职位数量不足")
	}

	// 计算推荐
	recommendation := s.CalculateRecommendation(items)

	// 生成对比维度数据
	dimensions := s.buildCompareDimensions(items)

	// 生成对比总结
	summary := s.generateCompareSummary(items, recommendation)

	return &CompareResponse{
		Items:          items,
		Recommendation: recommendation,
		Summary:        summary,
		Dimensions:     dimensions,
	}, nil
}

// GetCompareItems 获取对比数据
func (s *CompareService) GetCompareItems(ids []uint) ([]*CompareItem, error) {
	var items []*CompareItem

	for _, id := range ids {
		pos, err := s.positionRepo.FindByID(id)
		if err != nil {
			continue
		}

		item := &CompareItem{
			Position:      pos,
			IsRegistering: false,
		}

		// 计算报名状态和截止天数
		now := time.Now()
		if pos.RegistrationEnd != nil {
			diffDays := int(pos.RegistrationEnd.Sub(now).Hours() / 24)
			item.DaysUntilEnd = &diffDays
			item.FormattedRegEnd = pos.RegistrationEnd.Format("2006-01-02")

			if pos.RegistrationStart != nil {
				item.IsRegistering = now.After(*pos.RegistrationStart) && now.Before(*pos.RegistrationEnd)
			} else {
				item.IsRegistering = now.Before(*pos.RegistrationEnd)
			}
		}

		items = append(items, item)
	}

	return items, nil
}

// CalculateRecommendation 计算推荐
func (s *CompareService) CalculateRecommendation(items []*CompareItem) *Recommendation {
	if len(items) == 0 {
		return nil
	}

	rec := &Recommendation{}

	// 1. 最适合应届生
	for _, item := range items {
		if item.Position.IsForFreshGraduate != nil && *item.Position.IsForFreshGraduate {
			if rec.BestForFreshGrad == nil {
				rec.BestForFreshGrad = &PositionRecommend{
					PositionID:   item.Position.ID,
					PositionName: item.Position.PositionName,
					Reason:       "支持应届毕业生报考",
				}
			}
		}
	}

	// 2. 招录人数最多
	var maxRecruit *CompareItem
	for _, item := range items {
		if maxRecruit == nil || item.Position.RecruitCount > maxRecruit.Position.RecruitCount {
			maxRecruit = item
		}
	}
	if maxRecruit != nil && maxRecruit.Position.RecruitCount > 1 {
		rec.MostRecruit = &PositionRecommend{
			PositionID:   maxRecruit.Position.ID,
			PositionName: maxRecruit.Position.PositionName,
			Reason:       "招录人数最多",
			Value:        fmt.Sprintf("%d人", maxRecruit.Position.RecruitCount),
		}
	}

	// 3. 条件最宽松（不限专业 + 学历要求最低 + 不限政治面貌）
	var lowestReq *CompareItem
	lowestScore := 0
	for _, item := range items {
		score := 0
		if item.Position.IsUnlimitedMajor {
			score += 3
		}
		if item.Position.PoliticalStatus == "不限" || item.Position.PoliticalStatus == "" {
			score += 2
		}
		if item.Position.Education == "大专" {
			score += 2
		} else if item.Position.Education == "本科" {
			score += 1
		}
		if item.Position.Gender == "不限" || item.Position.Gender == "" {
			score += 1
		}
		if item.Position.HouseholdRequirement == "" || strings.Contains(item.Position.HouseholdRequirement, "不限") {
			score += 1
		}

		if score > lowestScore {
			lowestScore = score
			lowestReq = item
		}
	}
	if lowestReq != nil {
		reasons := []string{}
		if lowestReq.Position.IsUnlimitedMajor {
			reasons = append(reasons, "不限专业")
		}
		if lowestReq.Position.PoliticalStatus == "不限" || lowestReq.Position.PoliticalStatus == "" {
			reasons = append(reasons, "不限政治面貌")
		}
		rec.LowestRequirement = &PositionRecommend{
			PositionID:   lowestReq.Position.ID,
			PositionName: lowestReq.Position.PositionName,
			Reason:       "报考条件相对宽松: " + strings.Join(reasons, "、"),
		}
	}

	// 4. 报名即将截止
	var soonestDeadline *CompareItem
	for _, item := range items {
		if item.DaysUntilEnd != nil && *item.DaysUntilEnd >= 0 && *item.DaysUntilEnd <= 7 {
			if soonestDeadline == nil || *item.DaysUntilEnd < *soonestDeadline.DaysUntilEnd {
				soonestDeadline = item
			}
		}
	}
	if soonestDeadline != nil {
		daysText := "今日截止"
		if *soonestDeadline.DaysUntilEnd > 0 {
			daysText = fmt.Sprintf("还剩%d天", *soonestDeadline.DaysUntilEnd)
		}
		rec.SoonestDeadline = &PositionRecommend{
			PositionID:   soonestDeadline.Position.ID,
			PositionName: soonestDeadline.Position.PositionName,
			Reason:       "报名即将截止，请尽快报名",
			Value:        daysText,
		}
	}

	// 5. 竞争最小（如果有竞争比数据）
	var lowestComp *CompareItem
	for _, item := range items {
		if item.Position.CompetitionRatio > 0 {
			if lowestComp == nil || item.Position.CompetitionRatio < lowestComp.Position.CompetitionRatio {
				lowestComp = item
			}
		}
	}
	if lowestComp != nil {
		rec.LowestCompetition = &PositionRecommend{
			PositionID:   lowestComp.Position.ID,
			PositionName: lowestComp.Position.PositionName,
			Reason:       "竞争比最低",
			Value:        fmt.Sprintf("%.1f:1", lowestComp.Position.CompetitionRatio),
		}
	}

	return rec
}

// buildCompareDimensions 构建对比维度数据
func (s *CompareService) buildCompareDimensions(items []*CompareItem) []*CompareDimension {
	dimensions := []*CompareDimension{}

	// 定义对比维度
	dimensionDefs := []struct {
		Key   string
		Label string
		Type  string
	}{
		{"recruit_count", "招录人数", "number"},
		{"education", "学历要求", "text"},
		{"degree", "学位要求", "text"},
		{"major_requirement", "专业要求", "text"},
		{"political_status", "政治面貌", "text"},
		{"age", "年龄要求", "text"},
		{"work_experience", "工作经验", "text"},
		{"gender", "性别要求", "text"},
		{"household_requirement", "户籍要求", "text"},
		{"service_period", "服务期限", "text"},
		{"exam_type", "考试类型", "text"},
		{"department_level", "单位层级", "text"},
		{"province", "省份", "text"},
		{"city", "城市", "text"},
		{"registration_end", "报名截止", "date"},
		{"exam_date", "笔试时间", "date"},
		{"competition_ratio", "竞争比", "number"},
	}

	for _, def := range dimensionDefs {
		dim := &CompareDimension{
			Key:    def.Key,
			Label:  def.Label,
			Type:   def.Type,
			Values: make([]*DimensionValue, 0, len(items)),
		}

		values := make([]string, 0, len(items))

		for _, item := range items {
			val, display := s.getPositionFieldValue(item.Position, def.Key, def.Type)
			dimVal := &DimensionValue{
				PositionID: item.Position.ID,
				Value:      val,
				Display:    display,
			}
			dim.Values = append(dim.Values, dimVal)
			values = append(values, display)
		}

		// 检查是否有差异
		dim.HasDiff = s.hasDifference(values)

		// 标记最优值
		s.markBestValue(dim, items)

		dimensions = append(dimensions, dim)
	}

	return dimensions
}

// getPositionFieldValue 获取职位字段值
func (s *CompareService) getPositionFieldValue(p *model.Position, key string, fieldType string) (interface{}, string) {
	switch key {
	case "recruit_count":
		return p.RecruitCount, fmt.Sprintf("%d人", p.RecruitCount)
	case "education":
		return p.Education, s.formatStringValue(p.Education)
	case "degree":
		return p.Degree, s.formatStringValue(p.Degree)
	case "major_requirement":
		if p.IsUnlimitedMajor {
			return "不限专业", "不限专业"
		}
		return p.MajorRequirement, s.formatStringValue(p.MajorRequirement)
	case "political_status":
		return p.PoliticalStatus, s.formatStringValue(p.PoliticalStatus)
	case "age":
		return p.Age, s.formatStringValue(p.Age)
	case "work_experience":
		return p.WorkExperience, s.formatStringValue(p.WorkExperience)
	case "gender":
		return p.Gender, s.formatStringValue(p.Gender)
	case "household_requirement":
		return p.HouseholdRequirement, s.formatStringValue(p.HouseholdRequirement)
	case "service_period":
		return p.ServicePeriod, s.formatStringValue(p.ServicePeriod)
	case "exam_type":
		return p.ExamType, s.formatStringValue(p.ExamType)
	case "department_level":
		return p.DepartmentLevel, s.formatStringValue(p.DepartmentLevel)
	case "province":
		return p.Province, s.formatStringValue(p.Province)
	case "city":
		return p.City, s.formatStringValue(p.City)
	case "registration_end":
		if p.RegistrationEnd != nil {
			return p.RegistrationEnd.Format("2006-01-02"), p.RegistrationEnd.Format("2006-01-02")
		}
		return nil, "未知"
	case "exam_date":
		if p.ExamDate != nil {
			return p.ExamDate.Format("2006-01-02"), p.ExamDate.Format("2006-01-02")
		}
		return nil, "待定"
	case "competition_ratio":
		if p.CompetitionRatio > 0 {
			return p.CompetitionRatio, fmt.Sprintf("%.1f:1", p.CompetitionRatio)
		}
		return nil, "暂无"
	default:
		return nil, "-"
	}
}

// formatStringValue 格式化字符串值
func (s *CompareService) formatStringValue(val string) string {
	if val == "" {
		return "不限"
	}
	return val
}

// hasDifference 检查值是否有差异
func (s *CompareService) hasDifference(values []string) bool {
	if len(values) < 2 {
		return false
	}
	first := values[0]
	for _, v := range values[1:] {
		if v != first {
			return true
		}
	}
	return false
}

// markBestValue 标记最优值
func (s *CompareService) markBestValue(dim *CompareDimension, items []*CompareItem) {
	switch dim.Key {
	case "recruit_count":
		// 招录人数越多越好
		var maxIdx int
		var maxVal int
		for i, v := range dim.Values {
			if val, ok := v.Value.(int); ok && val > maxVal {
				maxVal = val
				maxIdx = i
			}
		}
		if maxVal > 1 && len(dim.Values) > maxIdx {
			dim.Values[maxIdx].IsBest = true
			dim.BestValueID = &dim.Values[maxIdx].PositionID
		}
	case "competition_ratio":
		// 竞争比越低越好
		var minIdx int
		var minVal float64 = 999999
		found := false
		for i, v := range dim.Values {
			if val, ok := v.Value.(float64); ok && val > 0 && val < minVal {
				minVal = val
				minIdx = i
				found = true
			}
		}
		if found && len(dim.Values) > minIdx {
			dim.Values[minIdx].IsBest = true
			dim.BestValueID = &dim.Values[minIdx].PositionID
		}
	case "major_requirement":
		// 不限专业更好
		for i, v := range dim.Values {
			if v.Display == "不限专业" {
				dim.Values[i].IsBest = true
				dim.BestValueID = &dim.Values[i].PositionID
				break
			}
		}
	}
}

// generateCompareSummary 生成对比总结
func (s *CompareService) generateCompareSummary(items []*CompareItem, rec *Recommendation) *CompareSummary {
	summary := &CompareSummary{
		Highlights:  []string{},
		Suggestions: []string{},
	}

	// 收集统计数据
	totalRecruit := 0
	unlimitedMajorCount := 0
	freshGradCount := 0
	registeringCount := 0
	expiringCount := 0

	for _, item := range items {
		totalRecruit += item.Position.RecruitCount
		if item.Position.IsUnlimitedMajor {
			unlimitedMajorCount++
		}
		if item.Position.IsForFreshGraduate != nil && *item.Position.IsForFreshGraduate {
			freshGradCount++
		}
		if item.IsRegistering {
			registeringCount++
		}
		if item.DaysUntilEnd != nil && *item.DaysUntilEnd >= 0 && *item.DaysUntilEnd <= 3 {
			expiringCount++
		}
	}

	// 生成概览
	summary.Overview = fmt.Sprintf(
		"共对比%d个职位，合计招录%d人。其中%d个职位不限专业，%d个职位支持应届生报考，%d个职位正在报名中。",
		len(items), totalRecruit, unlimitedMajorCount, freshGradCount, registeringCount,
	)

	// 添加重点对比项
	if unlimitedMajorCount > 0 && unlimitedMajorCount < len(items) {
		summary.Highlights = append(summary.Highlights, "专业要求存在差异，部分职位不限专业")
	}

	recruitCounts := make([]int, len(items))
	for i, item := range items {
		recruitCounts[i] = item.Position.RecruitCount
	}
	sort.Ints(recruitCounts)
	if len(recruitCounts) > 1 && recruitCounts[0] != recruitCounts[len(recruitCounts)-1] {
		summary.Highlights = append(summary.Highlights, fmt.Sprintf(
			"招录人数差异较大（%d-%d人）",
			recruitCounts[0], recruitCounts[len(recruitCounts)-1],
		))
	}

	// 添加建议
	if rec.SoonestDeadline != nil {
		summary.Suggestions = append(summary.Suggestions, fmt.Sprintf(
			"「%s」报名即将截止，如有意向请尽快报名",
			rec.SoonestDeadline.PositionName,
		))
	}

	if rec.MostRecruit != nil && rec.MostRecruit.Value != "" {
		summary.Suggestions = append(summary.Suggestions, fmt.Sprintf(
			"「%s」招录人数最多（%s），上岸机会相对较大",
			rec.MostRecruit.PositionName, rec.MostRecruit.Value,
		))
	}

	if rec.LowestRequirement != nil {
		summary.Suggestions = append(summary.Suggestions, fmt.Sprintf(
			"「%s」报考条件较宽松，适合更多考生报考",
			rec.LowestRequirement.PositionName,
		))
	}

	if len(summary.Suggestions) == 0 {
		summary.Suggestions = append(summary.Suggestions, "建议根据个人条件综合考虑，选择最适合自己的职位")
	}

	return summary
}
