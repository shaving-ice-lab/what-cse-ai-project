package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// =====================================================
// Question Handler
// =====================================================

type QuestionHandler struct {
	questionService       *service.QuestionService
	courseCategoryService *service.CourseCategoryService
}

func NewQuestionHandler(questionService *service.QuestionService, courseCategoryService *service.CourseCategoryService) *QuestionHandler {
	return &QuestionHandler{
		questionService:       questionService,
		courseCategoryService: courseCategoryService,
	}
}

// =====================================================
// Question APIs
// =====================================================

// GetQuestions gets questions with filters
// @Summary Get Questions
// @Description Get questions with pagination and filters
// @Tags Question
// @Produce json
// @Param category_id query int false "Category ID"
// @Param question_type query string false "Question type (single_choice/multi_choice/fill_blank/essay/material/judge)"
// @Param difficulty query int false "Difficulty (1-5)"
// @Param source_type query string false "Source type (real_exam/mock/original)"
// @Param source_year query int false "Source year"
// @Param source_region query string false "Source region"
// @Param is_vip query bool false "Is VIP only"
// @Param keyword query string false "Search keyword"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/questions [get]
func (h *QuestionHandler) GetQuestions(c echo.Context) error {
	var params repository.QuestionQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	questions, total, err := h.questionService.GetQuestions(&params)
	if err != nil {
		return fail(c, 500, "Failed to get questions: "+err.Error())
	}

	// Convert to brief responses
	var briefQuestions []interface{}
	for _, q := range questions {
		briefQuestions = append(briefQuestions, q.ToBriefResponse())
	}

	return success(c, map[string]interface{}{
		"questions": briefQuestions,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetQuestion gets a single question
// @Summary Get Question
// @Description Get question detail by ID
// @Tags Question
// @Produce json
// @Param id path int true "Question ID"
// @Success 200 {object} Response
// @Router /api/v1/questions/{id} [get]
func (h *QuestionHandler) GetQuestion(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	userID := getUserIDFromContext(c)

	question, err := h.questionService.GetQuestionByID(uint(id), userID)
	if err != nil {
		if err == service.ErrQuestionNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get question: "+err.Error())
	}

	return success(c, question)
}

// GetPracticeQuestions gets questions for practice
// @Summary Get Practice Questions
// @Description Get random questions for practice
// @Tags Question
// @Produce json
// @Param category_id query int false "Category ID"
// @Param count query int false "Number of questions (default 10, max 100)"
// @Success 200 {object} Response
// @Router /api/v1/questions/practice [get]
func (h *QuestionHandler) GetPracticeQuestions(c echo.Context) error {
	categoryID, _ := strconv.ParseUint(c.QueryParam("category_id"), 10, 32)
	count, _ := strconv.Atoi(c.QueryParam("count"))
	if count <= 0 {
		count = 10
	}

	// Get user's already attempted questions to exclude
	userID := getUserIDFromContext(c)
	var excludeIDs []uint
	// Optionally exclude already attempted questions
	// excludeIDs = h.questionService.GetUserAttemptedQuestionIDs(userID)

	_ = userID // Placeholder for future use

	questions, err := h.questionService.GetQuestionForPractice(uint(categoryID), count, excludeIDs)
	if err != nil {
		return fail(c, 500, "Failed to get practice questions: "+err.Error())
	}

	// Convert to brief responses (without answers)
	var briefQuestions []interface{}
	for _, q := range questions {
		brief := q.ToBriefResponse()
		briefQuestions = append(briefQuestions, brief)
	}

	return success(c, map[string]interface{}{
		"questions": briefQuestions,
		"count":     len(questions),
	})
}

// SubmitAnswer submits an answer for a question
// @Summary Submit Answer
// @Description Submit an answer for a question
// @Tags Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Question ID"
// @Param request body SubmitAnswerRequest true "Answer details"
// @Success 200 {object} Response
// @Router /api/v1/questions/{id}/answer [post]
func (h *QuestionHandler) SubmitAnswer(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	questionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	var req SubmitAnswerRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.questionService.SubmitAnswer(
		userID,
		uint(questionID),
		req.Answer,
		req.TimeSpent,
		model.PracticeType(req.PracticeType),
		req.PracticeID,
	)
	if err != nil {
		if err == service.ErrQuestionNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to submit answer: "+err.Error())
	}

	return success(c, result)
}

// GetUserStats gets user's question statistics
// @Summary Get User Stats
// @Description Get current user's question statistics
// @Tags Question
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/questions/stats [get]
func (h *QuestionHandler) GetUserStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	stats, err := h.questionService.GetUserStats(userID)
	if err != nil {
		return fail(c, 500, "Failed to get stats: "+err.Error())
	}

	return success(c, stats)
}

// GetCategoryProgress gets user's progress for each category
// @Summary Get Category Progress
// @Description Get user's done/undone statistics per category
// @Tags Question
// @Produce json
// @Security BearerAuth
// @Param subject query string false "Subject filter (xingce/shenlun/mianshi/gongji)"
// @Success 200 {object} Response
// @Router /api/v1/questions/category-progress [get]
func (h *QuestionHandler) GetCategoryProgress(c echo.Context) error {
	userID := getUserIDFromContext(c)
	// Allow anonymous access but return empty progress
	
	subject := c.QueryParam("subject")
	
	progress, err := h.questionService.GetUserCategoryProgress(userID, subject)
	if err != nil {
		return fail(c, 500, "Failed to get progress: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"progress": progress,
	})
}

// GetWrongQuestions gets user's wrong questions
// @Summary Get Wrong Questions
// @Description Get current user's wrong questions
// @Tags Question
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/user/wrong-questions [get]
func (h *QuestionHandler) GetWrongQuestions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	records, total, err := h.questionService.GetUserWrongQuestions(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get wrong questions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"records":   records,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// =====================================================
// Paper APIs
// =====================================================

// GetPapers gets papers with filters
// @Summary Get Papers
// @Description Get papers with pagination and filters
// @Tags Paper
// @Produce json
// @Param paper_type query string false "Paper type (real_exam/mock/daily/custom)"
// @Param exam_type query string false "Exam type (国考/省考/事业单位)"
// @Param subject query string false "Subject (行测/申论)"
// @Param year query int false "Year"
// @Param region query string false "Region"
// @Param is_free query bool false "Is free"
// @Param keyword query string false "Search keyword"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/papers [get]
func (h *QuestionHandler) GetPapers(c echo.Context) error {
	var params repository.PaperQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	userID := getUserIDFromContext(c)

	papers, total, err := h.questionService.GetPapers(&params, userID)
	if err != nil {
		return fail(c, 500, "Failed to get papers: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"papers":    papers,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetPaper gets paper detail
// @Summary Get Paper
// @Description Get paper detail by ID
// @Tags Paper
// @Produce json
// @Param id path int true "Paper ID"
// @Success 200 {object} Response
// @Router /api/v1/papers/{id} [get]
func (h *QuestionHandler) GetPaper(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid paper ID")
	}

	userID := getUserIDFromContext(c)

	paper, err := h.questionService.GetPaperByID(uint(id), userID)
	if err != nil {
		if err == service.ErrPaperNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get paper: "+err.Error())
	}

	return success(c, paper)
}

// StartPaper starts a paper
// @Summary Start Paper
// @Description Start a paper for the current user
// @Tags Paper
// @Produce json
// @Security BearerAuth
// @Param id path int true "Paper ID"
// @Success 200 {object} Response
// @Router /api/v1/papers/{id}/start [post]
func (h *QuestionHandler) StartPaper(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	paperID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid paper ID")
	}

	record, err := h.questionService.StartPaper(userID, uint(paperID))
	if err != nil {
		if err == service.ErrPaperNotFound {
			return fail(c, 404, err.Error())
		}
		if err == service.ErrPaperNotPublished {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to start paper: "+err.Error())
	}

	// Get paper with questions
	paper, questions, err := h.questionService.GetPaperWithQuestions(uint(paperID))
	if err != nil {
		return fail(c, 500, "Failed to get paper questions: "+err.Error())
	}

	// Build response with questions (without answers)
	var questionResponses []interface{}
	for _, q := range questions {
		resp := q.ToBriefResponse()
		questionResponses = append(questionResponses, resp)
	}

	return success(c, map[string]interface{}{
		"record_id":       record.ID,
		"paper":           paper.ToBriefResponse(),
		"questions":       questionResponses,
		"start_time":      record.StartTime,
		"time_limit":      paper.TimeLimit,
		"total_questions": paper.TotalQuestions,
		"total_score":     paper.TotalScore,
	})
}

// SubmitPaper submits a paper
// @Summary Submit Paper
// @Description Submit a paper with answers
// @Tags Paper
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Paper ID"
// @Param request body SubmitPaperRequest true "Answers"
// @Success 200 {object} Response
// @Router /api/v1/papers/{id}/submit [post]
func (h *QuestionHandler) SubmitPaper(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	paperID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid paper ID")
	}

	var req SubmitPaperRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.questionService.SubmitPaper(userID, uint(paperID), req.Answers)
	if err != nil {
		if err == service.ErrPaperNotInProgress {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to submit paper: "+err.Error())
	}

	return success(c, result)
}

// GetPaperResult gets paper result
// @Summary Get Paper Result
// @Description Get paper result by record ID
// @Tags Paper
// @Produce json
// @Security BearerAuth
// @Param id path int true "Record ID"
// @Success 200 {object} Response
// @Router /api/v1/papers/result/{id} [get]
func (h *QuestionHandler) GetPaperResult(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	recordID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid record ID")
	}

	result, err := h.questionService.GetPaperResult(uint(recordID), userID)
	if err != nil {
		if err == service.ErrPaperRecordNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get result: "+err.Error())
	}

	return success(c, result)
}

// GetPaperRanking gets user's ranking for a paper
// @Summary Get Paper Ranking
// @Description Get user's ranking info for a paper
// @Tags Paper
// @Produce json
// @Security BearerAuth
// @Param id path int true "Paper ID"
// @Param record_id query int true "Record ID"
// @Success 200 {object} Response
// @Router /api/v1/papers/{id}/ranking [get]
func (h *QuestionHandler) GetPaperRanking(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	paperID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid paper ID")
	}

	recordID, err := strconv.ParseUint(c.QueryParam("record_id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid record ID")
	}

	ranking, err := h.questionService.GetPaperRanking(userID, uint(paperID), uint(recordID))
	if err != nil {
		return fail(c, 500, "Failed to get ranking: "+err.Error())
	}

	return success(c, ranking)
}

// GetUserPaperRecords gets user's paper records
// @Summary Get User Paper Records
// @Description Get current user's paper records
// @Tags Paper
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/papers/my/records [get]
func (h *QuestionHandler) GetUserPaperRecords(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	records, total, err := h.questionService.GetUserPaperRecords(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get records: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"records":   records,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// =====================================================
// Collection APIs
// =====================================================

// CollectQuestion collects a question
// @Summary Collect Question
// @Description Add question to collection
// @Tags Question
// @Produce json
// @Security BearerAuth
// @Param id path int true "Question ID"
// @Success 200 {object} Response
// @Router /api/v1/questions/{id}/collect [post]
func (h *QuestionHandler) CollectQuestion(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	questionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	if err := h.questionService.CollectQuestion(userID, uint(questionID)); err != nil {
		if err == service.ErrQuestionNotFound {
			return fail(c, 404, err.Error())
		}
		if err == service.ErrQuestionAlreadyCollect {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to collect question: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已收藏",
	})
}

// UncollectQuestion removes question from collection
// @Summary Uncollect Question
// @Description Remove question from collection
// @Tags Question
// @Produce json
// @Security BearerAuth
// @Param id path int true "Question ID"
// @Success 200 {object} Response
// @Router /api/v1/questions/{id}/collect [delete]
func (h *QuestionHandler) UncollectQuestion(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	questionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	if err := h.questionService.UncollectQuestion(userID, uint(questionID)); err != nil {
		if err == service.ErrQuestionNotCollected {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to uncollect question: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已取消收藏",
	})
}

// GetMyCollects gets user's collected questions
// @Summary Get My Collects
// @Description Get questions collected by current user
// @Tags Question
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/questions/my/collects [get]
func (h *QuestionHandler) GetMyCollects(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	collects, total, err := h.questionService.GetUserCollects(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get collects: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"collects":  collects,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdateCollectNote updates the note of a collected question
// @Summary Update Collect Note
// @Description Update the note of a collected question
// @Tags Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Question ID"
// @Param request body UpdateNoteRequest true "Note content"
// @Success 200 {object} Response
// @Router /api/v1/questions/{id}/note [put]
func (h *QuestionHandler) UpdateCollectNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	questionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	var req UpdateNoteRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.questionService.UpdateCollectNote(userID, uint(questionID), req.Note); err != nil {
		if err == service.ErrQuestionNotCollected {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to update note: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "笔记已更新",
	})
}

// =====================================================
// Admin APIs
// =====================================================

// AdminGetQuestions gets all questions for admin
// @Summary Admin Get Questions
// @Description Get all questions with filters (admin)
// @Tags Admin Question
// @Produce json
// @Security BearerAuth
// @Param category_id query int false "Category ID"
// @Param question_type query string false "Question type"
// @Param difficulty query int false "Difficulty"
// @Param source_type query string false "Source type"
// @Param status query int false "Status"
// @Param keyword query string false "Search keyword"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/admin/questions [get]
func (h *QuestionHandler) AdminGetQuestions(c echo.Context) error {
	var params repository.QuestionQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	questions, total, err := h.questionService.GetAllQuestions(&params)
	if err != nil {
		return fail(c, 500, "Failed to get questions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"questions": questions,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// AdminCreateQuestion creates a new question
// @Summary Admin Create Question
// @Description Create a new question (admin)
// @Tags Admin Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body model.Question true "Question data"
// @Success 200 {object} Response
// @Router /api/v1/admin/questions [post]
func (h *QuestionHandler) AdminCreateQuestion(c echo.Context) error {
	var question model.Question
	if err := c.Bind(&question); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.questionService.CreateQuestion(&question); err != nil {
		return fail(c, 500, "Failed to create question: "+err.Error())
	}

	return success(c, question)
}

// AdminUpdateQuestion updates a question
// @Summary Admin Update Question
// @Description Update a question (admin)
// @Tags Admin Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Question ID"
// @Param request body model.Question true "Question data"
// @Success 200 {object} Response
// @Router /api/v1/admin/questions/{id} [put]
func (h *QuestionHandler) AdminUpdateQuestion(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	var question model.Question
	if err := c.Bind(&question); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}
	question.ID = uint(id)

	if err := h.questionService.UpdateQuestion(&question); err != nil {
		return fail(c, 500, "Failed to update question: "+err.Error())
	}

	return success(c, question)
}

// AdminDeleteQuestion deletes a question
// @Summary Admin Delete Question
// @Description Delete a question (admin)
// @Tags Admin Question
// @Produce json
// @Security BearerAuth
// @Param id path int true "Question ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/questions/{id} [delete]
func (h *QuestionHandler) AdminDeleteQuestion(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid question ID")
	}

	if err := h.questionService.DeleteQuestion(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete question: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "题目已删除",
	})
}

// AdminBatchCreateQuestions batch creates questions
// @Summary Admin Batch Create Questions
// @Description Batch create questions (admin)
// @Tags Admin Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body []model.Question true "Questions data"
// @Success 200 {object} Response
// @Router /api/v1/admin/questions/batch [post]
func (h *QuestionHandler) AdminBatchCreateQuestions(c echo.Context) error {
	var questions []model.Question
	if err := c.Bind(&questions); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.questionService.BatchCreateQuestions(questions); err != nil {
		return fail(c, 500, "Failed to create questions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "批量创建成功",
		"count":   len(questions),
	})
}

// AdminGetPapers gets all papers for admin
// @Summary Admin Get Papers
// @Description Get all papers with filters (admin)
// @Tags Admin Paper
// @Produce json
// @Security BearerAuth
// @Param paper_type query string false "Paper type"
// @Param exam_type query string false "Exam type"
// @Param subject query string false "Subject"
// @Param status query int false "Status"
// @Param keyword query string false "Search keyword"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/admin/papers [get]
func (h *QuestionHandler) AdminGetPapers(c echo.Context) error {
	var params repository.PaperQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	papers, total, err := h.questionService.GetAllPapers(&params)
	if err != nil {
		return fail(c, 500, "Failed to get papers: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"papers":    papers,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// AdminCreatePaper creates a new paper
// @Summary Admin Create Paper
// @Description Create a new paper (admin)
// @Tags Admin Paper
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body model.ExamPaper true "Paper data"
// @Success 200 {object} Response
// @Router /api/v1/admin/papers [post]
func (h *QuestionHandler) AdminCreatePaper(c echo.Context) error {
	var paper model.ExamPaper
	if err := c.Bind(&paper); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.questionService.CreatePaper(&paper); err != nil {
		return fail(c, 500, "Failed to create paper: "+err.Error())
	}

	return success(c, paper)
}

// AdminUpdatePaper updates a paper
// @Summary Admin Update Paper
// @Description Update a paper (admin)
// @Tags Admin Paper
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Paper ID"
// @Param request body model.ExamPaper true "Paper data"
// @Success 200 {object} Response
// @Router /api/v1/admin/papers/{id} [put]
func (h *QuestionHandler) AdminUpdatePaper(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid paper ID")
	}

	var paper model.ExamPaper
	if err := c.Bind(&paper); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}
	paper.ID = uint(id)

	if err := h.questionService.UpdatePaper(&paper); err != nil {
		return fail(c, 500, "Failed to update paper: "+err.Error())
	}

	return success(c, paper)
}

// AdminDeletePaper deletes a paper
// @Summary Admin Delete Paper
// @Description Delete a paper (admin)
// @Tags Admin Paper
// @Produce json
// @Security BearerAuth
// @Param id path int true "Paper ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/papers/{id} [delete]
func (h *QuestionHandler) AdminDeletePaper(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid paper ID")
	}

	if err := h.questionService.DeletePaper(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete paper: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "试卷已删除",
	})
}

// AdminGetMaterials gets all materials for admin
// @Summary Admin Get Materials
// @Description Get all materials (admin)
// @Tags Admin Question
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials [get]
func (h *QuestionHandler) AdminGetMaterials(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	materials, total, err := h.questionService.GetMaterials(page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get materials: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"materials": materials,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// AdminCreateMaterial creates a new material
// @Summary Admin Create Material
// @Description Create a new material (admin)
// @Tags Admin Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body model.QuestionMaterial true "Material data"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials [post]
func (h *QuestionHandler) AdminCreateMaterial(c echo.Context) error {
	var material model.QuestionMaterial
	if err := c.Bind(&material); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.questionService.CreateMaterial(&material); err != nil {
		return fail(c, 500, "Failed to create material: "+err.Error())
	}

	return success(c, material)
}

// AdminUpdateMaterial updates a material
// @Summary Admin Update Material
// @Description Update a material (admin)
// @Tags Admin Question
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Material ID"
// @Param request body model.QuestionMaterial true "Material data"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/{id} [put]
func (h *QuestionHandler) AdminUpdateMaterial(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid material ID")
	}

	var material model.QuestionMaterial
	if err := c.Bind(&material); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}
	material.ID = uint(id)

	if err := h.questionService.UpdateMaterial(&material); err != nil {
		return fail(c, 500, "Failed to update material: "+err.Error())
	}

	return success(c, material)
}

// AdminDeleteMaterial deletes a material
// @Summary Admin Delete Material
// @Description Delete a material (admin)
// @Tags Admin Question
// @Produce json
// @Security BearerAuth
// @Param id path int true "Material ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/{id} [delete]
func (h *QuestionHandler) AdminDeleteMaterial(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid material ID")
	}

	if err := h.questionService.DeleteMaterial(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete material: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "材料已删除",
	})
}

// =====================================================
// Request Types
// =====================================================

// SubmitAnswerRequest 提交答案请求
type SubmitAnswerRequest struct {
	Answer       string `json:"answer"`
	TimeSpent    int    `json:"time_spent"`    // 用时（秒）
	PracticeType string `json:"practice_type"` // 练习类型
	PracticeID   *uint  `json:"practice_id"`   // 练习/试卷ID
}

// SubmitPaperRequest 提交试卷请求
type SubmitPaperRequest struct {
	Answers []model.PaperAnswer `json:"answers"`
}

// UpdateNoteRequest 更新笔记请求
type UpdateNoteRequest struct {
	Note string `json:"note"`
}

// =====================================================
// AI 辅助生成题目
// =====================================================

// AIGenerateQuestionsRequest AI生成题目请求
type AIGenerateQuestionsRequest struct {
	CategoryID   uint   `json:"category_id" validate:"required"`            // 所属分类ID
	QuestionType string `json:"question_type" validate:"required"`          // 题型
	Difficulty   int    `json:"difficulty" validate:"required,min=1,max=5"` // 难度1-5
	Count        int    `json:"count" validate:"required,min=1,max=10"`     // 生成数量
	Topic        string `json:"topic,omitempty"`                            // 主题/关键词（可选）
	SourceType   string `json:"source_type,omitempty"`                      // 来源类型
	SourceYear   int    `json:"source_year,omitempty"`                      // 来源年份
}

// AIGeneratedQuestion AI生成的题目结构
type AIGeneratedQuestion struct {
	Content    string                 `json:"content"`
	Options    []model.QuestionOption `json:"options,omitempty"`
	Answer     string                 `json:"answer"`
	Analysis   string                 `json:"analysis"`
	Tips       string                 `json:"tips,omitempty"`
	Difficulty int                    `json:"difficulty"`
	Tags       []string               `json:"tags,omitempty"`
}

// AdminAIGenerateQuestions AI辅助生成题目
func (h *QuestionHandler) AdminAIGenerateQuestions(c echo.Context) error {
	var req AIGenerateQuestionsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的请求参数"})
	}

	// 验证参数
	if req.Count <= 0 || req.Count > 10 {
		req.Count = 5 // 默认生成5题
	}

	// 获取分类信息用于生成
	category, err := h.courseCategoryService.GetByID(req.CategoryID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "分类不存在"})
	}

	// 生成题目（模拟AI生成，实际应调用LLM服务）
	questions := generateAIQuestions(category.Name, req)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"questions": questions,
		"count":     len(questions),
		"category":  category.Name,
	})
}

// generateAIQuestions 生成AI题目（模拟实现）
func generateAIQuestions(categoryName string, req AIGenerateQuestionsRequest) []AIGeneratedQuestion {
	questions := make([]AIGeneratedQuestion, 0, req.Count)

	// 根据题型生成不同格式的题目
	for i := 0; i < req.Count; i++ {
		q := AIGeneratedQuestion{
			Difficulty: req.Difficulty,
		}

		switch req.QuestionType {
		case "single_choice":
			q = generateSingleChoiceQuestion(categoryName, req, i+1)
		case "multi_choice":
			q = generateMultiChoiceQuestion(categoryName, req, i+1)
		case "judge":
			q = generateJudgeQuestion(categoryName, req, i+1)
		case "fill_blank":
			q = generateFillBlankQuestion(categoryName, req, i+1)
		case "essay":
			q = generateEssayQuestion(categoryName, req, i+1)
		default:
			q = generateSingleChoiceQuestion(categoryName, req, i+1)
		}

		questions = append(questions, q)
	}

	return questions
}

// generateSingleChoiceQuestion 生成单选题
func generateSingleChoiceQuestion(categoryName string, req AIGenerateQuestionsRequest, index int) AIGeneratedQuestion {
	topic := req.Topic
	if topic == "" {
		topic = categoryName
	}

	difficultyDesc := []string{"入门", "简单", "中等", "困难", "极难"}[req.Difficulty-1]

	return AIGeneratedQuestion{
		Content: fmt.Sprintf("【%s·%s】关于%s，以下说法正确的是：", categoryName, difficultyDesc, topic),
		Options: []model.QuestionOption{
			{Key: "A", Content: fmt.Sprintf("%s的第一个特征是...", topic)},
			{Key: "B", Content: fmt.Sprintf("%s的第二个特征是...", topic)},
			{Key: "C", Content: fmt.Sprintf("%s的第三个特征是...", topic)},
			{Key: "D", Content: fmt.Sprintf("%s的第四个特征是...", topic)},
		},
		Answer:     "A",
		Analysis:   fmt.Sprintf("【解析】本题考查%s的相关知识。\n\nA选项正确，因为...\nB选项错误，原因是...\nC选项错误，原因是...\nD选项错误，原因是...\n\n【知识拓展】%s还包括以下要点...", topic, topic),
		Tips:       fmt.Sprintf("解题技巧：关于%s类题目，需要重点掌握其核心概念和主要特征。", categoryName),
		Difficulty: req.Difficulty,
		Tags:       []string{categoryName, topic, "AI生成"},
	}
}

// generateMultiChoiceQuestion 生成多选题
func generateMultiChoiceQuestion(categoryName string, req AIGenerateQuestionsRequest, index int) AIGeneratedQuestion {
	topic := req.Topic
	if topic == "" {
		topic = categoryName
	}

	return AIGeneratedQuestion{
		Content: fmt.Sprintf("关于%s，以下说法正确的有（  ）。", topic),
		Options: []model.QuestionOption{
			{Key: "A", Content: fmt.Sprintf("%s具有特征一", topic)},
			{Key: "B", Content: fmt.Sprintf("%s具有特征二", topic)},
			{Key: "C", Content: fmt.Sprintf("%s具有特征三", topic)},
			{Key: "D", Content: fmt.Sprintf("%s具有特征四", topic)},
		},
		Answer:     "A,B,D",
		Analysis:   fmt.Sprintf("【解析】本题为多选题，考查%s的多个方面。\n\nA选项正确...\nB选项正确...\nC选项错误...\nD选项正确...\n\n故本题选ABD。", topic),
		Tips:       "多选题解题技巧：先排除明显错误选项，再确认正确选项。",
		Difficulty: req.Difficulty,
		Tags:       []string{categoryName, topic, "多选题", "AI生成"},
	}
}

// generateJudgeQuestion 生成判断题
func generateJudgeQuestion(categoryName string, req AIGenerateQuestionsRequest, index int) AIGeneratedQuestion {
	topic := req.Topic
	if topic == "" {
		topic = categoryName
	}

	return AIGeneratedQuestion{
		Content:    fmt.Sprintf("关于%s：该知识点的核心定义是正确的。（  ）", topic),
		Options:    []model.QuestionOption{{Key: "A", Content: "正确"}, {Key: "B", Content: "错误"}},
		Answer:     "A",
		Analysis:   fmt.Sprintf("【解析】本题考查%s的基本概念。\n\n该说法正确。%s的核心定义确实是...\n\n【易错点提醒】注意区分%s与相关概念的区别。", topic, topic, topic),
		Difficulty: req.Difficulty,
		Tags:       []string{categoryName, topic, "判断题", "AI生成"},
	}
}

// generateFillBlankQuestion 生成填空题
func generateFillBlankQuestion(categoryName string, req AIGenerateQuestionsRequest, index int) AIGeneratedQuestion {
	topic := req.Topic
	if topic == "" {
		topic = categoryName
	}

	return AIGeneratedQuestion{
		Content:    fmt.Sprintf("在%s领域中，______是最基本的概念之一，它的主要特征包括______和______。", topic),
		Answer:     fmt.Sprintf("核心定义；特征一；特征二"),
		Analysis:   fmt.Sprintf("【解析】本题考查%s的基础概念。\n\n第一空：%s的核心定义是...\n第二空：主要特征一是...\n第三空：主要特征二是...", topic, topic),
		Difficulty: req.Difficulty,
		Tags:       []string{categoryName, topic, "填空题", "AI生成"},
	}
}

// generateEssayQuestion 生成简答/申论题
func generateEssayQuestion(categoryName string, req AIGenerateQuestionsRequest, index int) AIGeneratedQuestion {
	topic := req.Topic
	if topic == "" {
		topic = categoryName
	}

	return AIGeneratedQuestion{
		Content:    fmt.Sprintf("请结合实际，分析%s的主要特点和应用场景，并提出你的见解。（300字左右）", topic),
		Answer:     fmt.Sprintf("【参考答案要点】\n\n一、%s的主要特点：\n1. 特点一：...\n2. 特点二：...\n3. 特点三：...\n\n二、应用场景：\n1. 场景一：...\n2. 场景二：...\n\n三、个人见解：\n...", topic),
		Analysis:   fmt.Sprintf("【解析】本题为开放性主观题，考查对%s的综合理解能力。\n\n【答题思路】\n1. 首先明确%s的定义和内涵\n2. 分析其主要特点（至少3点）\n3. 结合实际列举应用场景\n4. 提出个人见解或建议\n\n【评分标准】\n- 特点分析（40分）\n- 应用场景（30分）\n- 个人见解（20分）\n- 语言表达（10分）", topic, topic),
		Difficulty: req.Difficulty,
		Tags:       []string{categoryName, topic, "简答题", "AI生成"},
	}
}

// AdminSaveAIGeneratedQuestions 保存AI生成的题目
func (h *QuestionHandler) AdminSaveAIGeneratedQuestions(c echo.Context) error {
	var req struct {
		CategoryID uint                  `json:"category_id" validate:"required"`
		SourceType string                `json:"source_type,omitempty"`
		SourceYear int                   `json:"source_year,omitempty"`
		Questions  []AIGeneratedQuestion `json:"questions" validate:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的请求参数"})
	}

	if len(req.Questions) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "没有要保存的题目"})
	}

	// 转换为 model.Question 格式
	questions := make([]model.Question, 0, len(req.Questions))
	for _, q := range req.Questions {
		question := model.Question{
			CategoryID:   req.CategoryID,
			QuestionType: model.QuestionType(getQuestionTypeFromOptions(q.Options)),
			Difficulty:   q.Difficulty,
			Content:      q.Content,
			Answer:       q.Answer,
			Analysis:     q.Analysis,
			Tips:         q.Tips,
			Options:      model.QuestionOptions(q.Options),
			Tags:         q.Tags,
			Status:       model.QuestionStatusDraft, // AI生成的默认为草稿状态
		}
		if req.SourceType != "" {
			question.SourceType = model.QuestionSourceType(req.SourceType)
		}
		if req.SourceYear > 0 {
			year := req.SourceYear
			question.SourceYear = &year
		}
		questions = append(questions, question)
	}

	// 批量创建
	err := h.questionService.BatchCreateQuestions(questions)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "保存失败: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": len(questions),
		"total":   len(req.Questions),
	})
}

// getQuestionTypeFromOptions 根据选项判断题型
func getQuestionTypeFromOptions(options []model.QuestionOption) string {
	if len(options) == 0 {
		return "essay"
	}
	if len(options) == 2 && (options[0].Content == "正确" || options[0].Content == "对") {
		return "judge"
	}
	return "single_choice"
}

// =====================================================
// Route Registration
// =====================================================

// RegisterRoutes registers all question routes
func (h *QuestionHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	// Question routes
	questions := e.Group("/api/v1/questions")

	// Public routes
	questions.GET("", h.GetQuestions)
	questions.GET("/practice", h.GetPracticeQuestions)
	questions.GET("/category-progress", h.GetCategoryProgress) // Allow anonymous access with empty progress
	questions.GET("/:id", h.GetQuestion)

	// Protected routes
	protected := questions.Group("")
	protected.Use(authMiddleware)
	protected.POST("/:id/answer", h.SubmitAnswer)
	protected.GET("/stats", h.GetUserStats)
	protected.GET("/my/collects", h.GetMyCollects)
	protected.POST("/:id/collect", h.CollectQuestion)
	protected.DELETE("/:id/collect", h.UncollectQuestion)
	protected.PUT("/:id/note", h.UpdateCollectNote)

	// Paper routes
	papers := e.Group("/api/v1/papers")

	// Public routes
	papers.GET("", h.GetPapers)
	papers.GET("/:id", h.GetPaper)

	// Protected routes
	paperProtected := papers.Group("")
	paperProtected.Use(authMiddleware)
	paperProtected.POST("/:id/start", h.StartPaper)
	paperProtected.POST("/:id/submit", h.SubmitPaper)
	paperProtected.GET("/result/:id", h.GetPaperResult)
	paperProtected.GET("/:id/ranking", h.GetPaperRanking)
	paperProtected.GET("/my/records", h.GetUserPaperRecords)

	// User routes (for wrong questions)
	user := e.Group("/api/v1/user")
	user.Use(authMiddleware)
	user.GET("/wrong-questions", h.GetWrongQuestions)
}

// RegisterAdminRoutes registers admin routes for questions
func (h *QuestionHandler) RegisterAdminRoutes(adminGroup *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	// Question admin routes
	questions := adminGroup.Group("/questions")
	questions.Use(adminAuthMiddleware)
	questions.GET("", h.AdminGetQuestions)
	questions.POST("", h.AdminCreateQuestion)
	questions.PUT("/:id", h.AdminUpdateQuestion)
	questions.DELETE("/:id", h.AdminDeleteQuestion)
	questions.POST("/batch", h.AdminBatchCreateQuestions)
	questions.POST("/ai/generate", h.AdminAIGenerateQuestions)
	questions.POST("/ai/save", h.AdminSaveAIGeneratedQuestions)

	// Paper admin routes
	papers := adminGroup.Group("/papers")
	papers.Use(adminAuthMiddleware)
	papers.GET("", h.AdminGetPapers)
	papers.POST("", h.AdminCreatePaper)
	papers.PUT("/:id", h.AdminUpdatePaper)
	papers.DELETE("/:id", h.AdminDeletePaper)

	// Material admin routes
	materials := adminGroup.Group("/materials")
	materials.Use(adminAuthMiddleware)
	materials.GET("", h.AdminGetMaterials)
	materials.POST("", h.AdminCreateMaterial)
	materials.PUT("/:id", h.AdminUpdateMaterial)
	materials.DELETE("/:id", h.AdminDeleteMaterial)
}
