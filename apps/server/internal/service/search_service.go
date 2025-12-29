package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"

	"github.com/what-cse/server/internal/config"
	"github.com/what-cse/server/internal/model"
)

type SearchService struct {
	client    *elasticsearch.Client
	indexName string
}

type SearchQuery struct {
	Keyword    string `json:"keyword"`
	Province   string `json:"province"`
	City       string `json:"city"`
	Department string `json:"department"`
	Education  string `json:"education"`
	ExamType   string `json:"exam_type"`
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
}

type SearchResult struct {
	Total     int64            `json:"total"`
	Positions []model.Position `json:"positions"`
	Took      int64            `json:"took"`
}

func NewSearchService(cfg *config.ElasticsearchConfig) (*SearchService, error) {
	esCfg := elasticsearch.Config{
		Addresses: cfg.Addresses,
	}

	if cfg.Username != "" && cfg.Password != "" {
		esCfg.Username = cfg.Username
		esCfg.Password = cfg.Password
	}

	client, err := elasticsearch.NewClient(esCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create elasticsearch client: %w", err)
	}

	_, err = client.Info()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to elasticsearch: %w", err)
	}

	return &SearchService{
		client:    client,
		indexName: cfg.IndexName,
	}, nil
}

func (s *SearchService) CreateIndex(ctx context.Context) error {
	mapping := `{
		"settings": {
			"number_of_shards": 1,
			"number_of_replicas": 0,
			"analysis": {
				"analyzer": {
					"ik_smart_analyzer": {
						"type": "custom",
						"tokenizer": "ik_smart"
					},
					"ik_max_analyzer": {
						"type": "custom",
						"tokenizer": "ik_max_word"
					}
				}
			}
		},
		"mappings": {
			"properties": {
				"position_id": { "type": "keyword" },
				"position_name": { "type": "text", "analyzer": "ik_max_analyzer", "search_analyzer": "ik_smart_analyzer" },
				"department_name": { "type": "text", "analyzer": "ik_max_analyzer", "search_analyzer": "ik_smart_analyzer" },
				"department_code": { "type": "keyword" },
				"department_level": { "type": "keyword" },
				"work_location_province": { "type": "keyword" },
				"work_location_city": { "type": "keyword" },
				"work_location_district": { "type": "keyword" },
				"recruit_count": { "type": "integer" },
				"exam_type": { "type": "keyword" },
				"education_min": { "type": "keyword" },
				"major_category": { "type": "keyword" },
				"major_specific": { "type": "text", "analyzer": "ik_smart_analyzer" },
				"major_unlimited": { "type": "boolean" },
				"political_status": { "type": "keyword" },
				"work_exp_years_min": { "type": "integer" },
				"age_min": { "type": "integer" },
				"age_max": { "type": "integer" },
				"hukou_required": { "type": "boolean" },
				"applicant_count": { "type": "integer" },
				"competition_ratio": { "type": "float" },
				"status": { "type": "keyword" },
				"created_at": { "type": "date" },
				"updated_at": { "type": "date" }
			}
		}
	}`

	res, err := s.client.Indices.Create(
		s.indexName,
		s.client.Indices.Create.WithBody(bytes.NewReader([]byte(mapping))),
		s.client.Indices.Create.WithContext(ctx),
	)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("failed to create index: %s", res.String())
	}

	return nil
}

func (s *SearchService) IndexPosition(ctx context.Context, position *model.Position) error {
	data, err := json.Marshal(position)
	if err != nil {
		return err
	}

	req := esapi.IndexRequest{
		Index:      s.indexName,
		DocumentID: position.PositionID,
		Body:       bytes.NewReader(data),
		Refresh:    "true",
	}

	res, err := req.Do(ctx, s.client)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("failed to index position: %s", res.String())
	}

	return nil
}

func (s *SearchService) BulkIndexPositions(ctx context.Context, positions []model.Position) error {
	var buf bytes.Buffer

	for _, pos := range positions {
		meta := map[string]interface{}{
			"index": map[string]interface{}{
				"_index": s.indexName,
				"_id":    pos.PositionID,
			},
		}
		metaBytes, _ := json.Marshal(meta)
		buf.Write(metaBytes)
		buf.WriteByte('\n')

		dataBytes, _ := json.Marshal(pos)
		buf.Write(dataBytes)
		buf.WriteByte('\n')
	}

	res, err := s.client.Bulk(bytes.NewReader(buf.Bytes()), s.client.Bulk.WithContext(ctx))
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("bulk index failed: %s", res.String())
	}

	return nil
}

func (s *SearchService) Search(ctx context.Context, query SearchQuery) (*SearchResult, error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 20
	}

	from := (query.Page - 1) * query.PageSize

	mustQueries := []map[string]interface{}{}
	filterQueries := []map[string]interface{}{}

	if query.Keyword != "" {
		mustQueries = append(mustQueries, map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query":  query.Keyword,
				"fields": []string{"position_name^3", "department_name^2", "major_specific"},
				"type":   "best_fields",
			},
		})
	}

	if query.Province != "" {
		filterQueries = append(filterQueries, map[string]interface{}{
			"term": map[string]interface{}{"work_location_province": query.Province},
		})
	}

	if query.City != "" {
		filterQueries = append(filterQueries, map[string]interface{}{
			"term": map[string]interface{}{"work_location_city": query.City},
		})
	}

	if query.Education != "" {
		filterQueries = append(filterQueries, map[string]interface{}{
			"term": map[string]interface{}{"education_min": query.Education},
		})
	}

	if query.ExamType != "" {
		filterQueries = append(filterQueries, map[string]interface{}{
			"term": map[string]interface{}{"exam_type": query.ExamType},
		})
	}

	filterQueries = append(filterQueries, map[string]interface{}{
		"term": map[string]interface{}{"status": "published"},
	})

	boolQuery := map[string]interface{}{}
	if len(mustQueries) > 0 {
		boolQuery["must"] = mustQueries
	}
	if len(filterQueries) > 0 {
		boolQuery["filter"] = filterQueries
	}

	searchBody := map[string]interface{}{
		"from": from,
		"size": query.PageSize,
		"query": map[string]interface{}{
			"bool": boolQuery,
		},
		"sort": []map[string]interface{}{
			{"_score": map[string]string{"order": "desc"}},
			{"created_at": map[string]string{"order": "desc"}},
		},
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(searchBody); err != nil {
		return nil, err
	}

	res, err := s.client.Search(
		s.client.Search.WithContext(ctx),
		s.client.Search.WithIndex(s.indexName),
		s.client.Search.WithBody(&buf),
		s.client.Search.WithTrackTotalHits(true),
	)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("search failed: %s", res.String())
	}

	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}

	hits := result["hits"].(map[string]interface{})
	total := int64(hits["total"].(map[string]interface{})["value"].(float64))
	took := int64(result["took"].(float64))

	var positions []model.Position
	for _, hit := range hits["hits"].([]interface{}) {
		source := hit.(map[string]interface{})["_source"]
		sourceBytes, _ := json.Marshal(source)
		var pos model.Position
		json.Unmarshal(sourceBytes, &pos)
		positions = append(positions, pos)
	}

	return &SearchResult{
		Total:     total,
		Positions: positions,
		Took:      took,
	}, nil
}

func (s *SearchService) DeletePosition(ctx context.Context, positionID string) error {
	req := esapi.DeleteRequest{
		Index:      s.indexName,
		DocumentID: positionID,
		Refresh:    "true",
	}

	res, err := req.Do(ctx, s.client)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	return nil
}

func (s *SearchService) Suggest(ctx context.Context, prefix string, size int) ([]string, error) {
	if size <= 0 {
		size = 10
	}

	searchBody := map[string]interface{}{
		"size": 0,
		"suggest": map[string]interface{}{
			"position-suggest": map[string]interface{}{
				"prefix": prefix,
				"completion": map[string]interface{}{
					"field":           "position_name.suggest",
					"size":            size,
					"skip_duplicates": true,
				},
			},
		},
	}

	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(searchBody)

	res, err := s.client.Search(
		s.client.Search.WithContext(ctx),
		s.client.Search.WithIndex(s.indexName),
		s.client.Search.WithBody(&buf),
	)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(res.Body).Decode(&result)

	var suggestions []string
	if suggest, ok := result["suggest"].(map[string]interface{}); ok {
		if posSuggest, ok := suggest["position-suggest"].([]interface{}); ok && len(posSuggest) > 0 {
			if options, ok := posSuggest[0].(map[string]interface{})["options"].([]interface{}); ok {
				for _, opt := range options {
					if text, ok := opt.(map[string]interface{})["text"].(string); ok {
						suggestions = append(suggestions, text)
					}
				}
			}
		}
	}

	return suggestions, nil
}
