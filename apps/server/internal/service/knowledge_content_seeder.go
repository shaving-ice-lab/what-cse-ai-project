package service

import (
	"encoding/json"
	"fmt"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// KnowledgeContentSeeder 知识点内容种子数据生成器
type KnowledgeContentSeeder struct {
	detailRepo *repository.KnowledgeDetailRepository
	cardRepo   *repository.FlashCardRepository
	mapRepo    *repository.MindMapRepository
}

// NewKnowledgeContentSeeder 创建种子数据生成器
func NewKnowledgeContentSeeder(
	detailRepo *repository.KnowledgeDetailRepository,
	cardRepo *repository.FlashCardRepository,
	mapRepo *repository.MindMapRepository,
) *KnowledgeContentSeeder {
	return &KnowledgeContentSeeder{
		detailRepo: detailRepo,
		cardRepo:   cardRepo,
		mapRepo:    mapRepo,
	}
}

// SeedResult 种子数据生成结果
type SeedResult struct {
	DetailsCreated    int      `json:"details_created"`
	FlashCardsCreated int      `json:"flash_cards_created"`
	MindMapsCreated   int      `json:"mind_maps_created"`
	Errors            []string `json:"errors,omitempty"`
}

// SeedAll 生成所有种子数据
func (s *KnowledgeContentSeeder) SeedAll(createdBy uint) (*SeedResult, error) {
	result := &SeedResult{}

	// 生成速记卡片
	cardsCount, err := s.seedFlashCards()
	if err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("生成速记卡片失败: %v", err))
	}
	result.FlashCardsCreated = cardsCount

	// 生成思维导图
	mapsCount, err := s.seedMindMaps(createdBy)
	if err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("生成思维导图失败: %v", err))
	}
	result.MindMapsCreated = mapsCount

	return result, nil
}

// SeedFlashCards 生成速记卡片种子数据
func (s *KnowledgeContentSeeder) SeedFlashCards() (int, error) {
	return s.seedFlashCards()
}

// SeedMindMaps 生成思维导图种子数据
func (s *KnowledgeContentSeeder) SeedMindMaps(createdBy uint) (int, error) {
	return s.seedMindMaps(createdBy)
}

func (s *KnowledgeContentSeeder) seedFlashCards() (int, error) {
	cards := s.getFlashCardSeedData()

	count := 0
	for _, card := range cards {
		// 检查是否已存在
		existing, _, _ := s.cardRepo.List(&repository.FlashCardQueryParams{
			CardType: card.CardType,
			Keyword:  card.Title,
			PageSize: 1,
		})
		if len(existing) > 0 {
			continue
		}

		if err := s.cardRepo.Create(card); err != nil {
			continue
		}
		count++
	}

	return count, nil
}

func (s *KnowledgeContentSeeder) seedMindMaps(createdBy uint) (int, error) {
	maps := s.getMindMapSeedData(createdBy)

	count := 0
	for _, m := range maps {
		// 检查是否已存在
		existing, _, _ := s.mapRepo.List(&repository.MindMapQueryParams{
			MapType:  m.MapType,
			Keyword:  m.Title,
			PageSize: 1,
		})
		if len(existing) > 0 {
			continue
		}

		if err := s.mapRepo.Create(m); err != nil {
			continue
		}
		count++
	}

	return count, nil
}

// getFlashCardSeedData 获取速记卡片种子数据
func (s *KnowledgeContentSeeder) getFlashCardSeedData() []*model.KnowledgeFlashCard {
	return []*model.KnowledgeFlashCard{
		// ================== 成语卡片 ==================
		{CardType: model.FlashCardTypeIdiom, Title: "南辕北辙", FrontContent: "南辕北辙", BackContent: "【释义】想往南而车子却向北行。比喻行动和目的正好相反。\n【出处】《战国策·魏策四》\n【近义词】背道而驰、适得其反\n【反义词】殊途同归", Example: "他想提高效率，却整天加班熬夜，真是南辕北辙。", Mnemonic: "辕是车前驾牲畜的横木，辙是车轮压出的痕迹。想去南方，车却往北走。", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "刻舟求剑", FrontContent: "刻舟求剑", BackContent: "【释义】比喻不懂事物已发展变化而仍静止地看问题。\n【出处】《吕氏春秋·察今》\n【近义词】守株待兔、墨守成规\n【反义词】见机行事", Example: "用老方法解决新问题，无异于刻舟求剑。", Mnemonic: "在船上刻记号找落水的剑，船走了，剑还在原处。", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "画蛇添足", FrontContent: "画蛇添足", BackContent: "【释义】比喻做了多余的事，非但无益，反而不合适。\n【出处】《战国策·齐策二》\n【近义词】多此一举、弄巧成拙\n【反义词】恰到好处、画龙点睛", Example: "文章本已完美，再加这段反而画蛇添足。", Mnemonic: "蛇本无足，画上脚反而不像蛇了。", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "掩耳盗铃", FrontContent: "掩耳盗铃", BackContent: "【释义】比喻自己欺骗自己，明明掩盖不住的事情偏要设法掩盖。\n【出处】《吕氏春秋·自知》\n【近义词】自欺欺人、掩人耳目\n【反义词】开诚布公", Example: "不正视问题只会是掩耳盗铃。", Mnemonic: "捂住自己耳朵去偷铃铛，以为别人也听不到。", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "守株待兔", FrontContent: "守株待兔", BackContent: "【释义】比喻不主动努力，而存万一的侥幸心理，希望得到意外的收获。\n【出处】《韩非子·五蠹》\n【近义词】刻舟求剑、墨守成规\n【反义词】随机应变", Example: "机会要靠自己创造，不能守株待兔。", Mnemonic: "农夫守着树桩等兔子撞死，最终一无所获。", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "买椟还珠", FrontContent: "买椟还珠", BackContent: "【释义】比喻没有眼力，取舍不当。\n【出处】《韩非子·外储说左上》\n【近义词】舍本逐末、本末倒置\n【反义词】去粗取精", Example: "只看外表不看内涵，简直是买椟还珠。", Mnemonic: "买了装珠宝的盒子，却把珠宝还给了商人。", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "杯弓蛇影", FrontContent: "杯弓蛇影", BackContent: "【释义】比喻因疑神疑鬼而引起恐惧。\n【出处】《晋书·乐广传》\n【近义词】草木皆兵、疑神疑鬼\n【反义词】处之泰然", Example: "不要杯弓蛇影，自己吓自己。", Mnemonic: "把酒杯中弓的倒影当成蛇，惊恐万分。", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "邯郸学步", FrontContent: "邯郸学步", BackContent: "【释义】比喻模仿别人不成，反而丧失了原有的技能。\n【出处】《庄子·秋水》\n【近义词】东施效颦、生搬硬套\n【反义词】标新立异", Example: "学习要结合实际，不能邯郸学步。", Mnemonic: "燕国人学邯郸人走路，没学会反而忘了自己怎么走。", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "揠苗助长", FrontContent: "揠苗助长", BackContent: "【释义】比喻违反事物发展的客观规律，急于求成，反而坏事。\n【出处】《孟子·公孙丑上》\n【近义词】欲速不达、急于求成\n【反义词】循序渐进", Example: "教育孩子不能揠苗助长。", Mnemonic: "拔苗助长，苗反而枯死了。揠，拔的意思。", Difficulty: 2, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeIdiom, Title: "郑人买履", FrontContent: "郑人买履", BackContent: "【释义】比喻只信教条，不顾实际。\n【出处】《韩非子·外储说左上》\n【近义词】刻舟求剑、生搬硬套\n【反义词】随机应变", Example: "做事要灵活变通，不能像郑人买履那样死板。", Mnemonic: "郑国人买鞋只认尺码不试穿，尺码忘带就不买了。", Difficulty: 2, Importance: 4, IsActive: true},

		// ================== 数学公式卡片 ==================
		{CardType: model.FlashCardTypeFormula, Title: "等差数列求和公式", FrontContent: "等差数列求和公式是什么？", BackContent: "Sn = n(a₁ + aₙ)/2 = na₁ + n(n-1)d/2\n\n其中：\n- n：项数\n- a₁：首项\n- aₙ：末项\n- d：公差", Example: "求1+2+3+...+100\n解：a₁=1, aₙ=100, n=100\nS₁₀₀ = 100×(1+100)/2 = 5050", Mnemonic: "首尾相加乘项数除以2", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "等比数列求和公式", FrontContent: "等比数列求和公式是什么？", BackContent: "当 q≠1 时：Sn = a₁(1-qⁿ)/(1-q) = a₁(qⁿ-1)/(q-1)\n当 q=1 时：Sn = na₁\n\n其中：\n- a₁：首项\n- q：公比\n- n：项数", Example: "求 1+2+4+8+...+512\n解：a₁=1, q=2, n=10\nS₁₀ = 1×(2¹⁰-1)/(2-1) = 1023", Mnemonic: "首项乘(比的n次方减1)除以(比减1)", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "排列公式", FrontContent: "从n个不同元素中取出m个元素排列的公式？", BackContent: "A(n,m) = n!/(n-m)! = n×(n-1)×...×(n-m+1)\n\n其中：\n- n：元素总数\n- m：取出的元素数\n- n! 表示n的阶乘", Example: "从5人中选3人排成一排\nA(5,3) = 5×4×3 = 60种", Mnemonic: "从n开始连乘m个递减的数", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "组合公式", FrontContent: "从n个不同元素中取出m个元素组合的公式？", BackContent: "C(n,m) = n!/[m!(n-m)!] = A(n,m)/m!\n\n性质：\n- C(n,m) = C(n,n-m)\n- C(n,0) = C(n,n) = 1", Example: "从5人中选3人组成小组\nC(5,3) = 5×4×3/(3×2×1) = 10种", Mnemonic: "排列除以m的阶乘（消除顺序）", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "利润率公式", FrontContent: "利润率的计算公式？", BackContent: "利润 = 售价 - 成本\n利润率 = 利润/成本 × 100%\n售价 = 成本 × (1 + 利润率)\n\n注意：折扣 = 实际售价/原价 × 100%", Example: "成本100元，售价130元\n利润率 = (130-100)/100 = 30%", Mnemonic: "利润率是利润与成本的比值", Difficulty: 2, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "工程问题公式", FrontContent: "工程问题的基本公式？", BackContent: "工作总量 = 工作效率 × 工作时间\n\n常用技巧：\n- 设工作总量为1或最小公倍数\n- 合作效率 = 各效率之和\n- 完成时间 = 总量/效率", Example: "甲单独做需6天，乙需4天\n设总量为12，甲效率=2，乙效率=3\n合作完成需：12/(2+3) = 2.4天", Mnemonic: "总量=效率×时间，设特值简化计算", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "行程问题公式", FrontContent: "行程问题的基本公式？", BackContent: "路程 = 速度 × 时间\n\n相遇问题：\n- 相遇时间 = 总路程/(甲速+乙速)\n\n追及问题：\n- 追及时间 = 路程差/(速度差)", Example: "甲乙相距100km，甲时速60km，乙时速40km\n相向而行相遇时间 = 100/(60+40) = 1小时", Mnemonic: "路程=速度×时间，相遇用和，追及用差", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFormula, Title: "浓度问题公式", FrontContent: "浓度问题的基本公式？", BackContent: "浓度 = 溶质/溶液 × 100%\n溶液 = 溶质 + 溶剂\n\n混合浓度：\n(m₁c₁ + m₂c₂)/(m₁ + m₂)", Example: "20%的盐水100g与5%的盐水100g混合\n混合浓度 = (100×20% + 100×5%)/200 = 12.5%", Mnemonic: "浓度=溶质/溶液，混合用十字交叉法", Difficulty: 3, Importance: 5, IsActive: true},

		// ================== 图推规律卡片 ==================
		// 位置规律
		{CardType: model.FlashCardTypeFigure, Title: "平移规律", FrontContent: "图形平移有哪些规律？", BackContent: "【平移特征】\n图形整体沿某一方向移动，形状大小不变\n\n【常见形式】\n1. 上下平移\n2. 左右平移\n3. 对角平移\n4. 顺时针/逆时针移动\n\n【识别技巧】\n- 图形位置改变，其他不变\n- 注意移动方向和步长", Example: "九宫格中黑点每次向右移动一格，到边界后从左边重新开始", Mnemonic: "平移看方向，形状不会变", Difficulty: 2, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "旋转规律", FrontContent: "图形旋转有哪些规律？", BackContent: "【旋转特征】\n图形绕某点转动一定角度\n\n【常见角度】\n- 45°、90°、180°、270°\n\n【识别技巧】\n1. 找准旋转中心\n2. 判断旋转方向（顺/逆时针）\n3. 计算旋转角度\n\n【注意事项】\n旋转后图形方向改变，形状大小不变", Example: "指针每次顺时针旋转90°", Mnemonic: "旋转看角度，顺逆要分清", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "翻转规律", FrontContent: "图形翻转有哪些规律？", BackContent: "【翻转类型】\n1. 左右翻转（关于竖轴对称）\n2. 上下翻转（关于横轴对称）\n3. 对角翻转\n\n【识别技巧】\n- 翻转后图形呈镜像关系\n- 注意翻转轴的位置\n\n【与旋转区别】\n旋转：方向改变但朝向一致\n翻转：产生镜像效果", Example: "字母b左右翻转变成d，上下翻转变成p", Mnemonic: "翻转成镜像，旋转方向变", Difficulty: 3, Importance: 4, IsActive: true},

		// 样式规律
		{CardType: model.FlashCardTypeFigure, Title: "叠加规律", FrontContent: "图形叠加有哪些规律？", BackContent: "【叠加类型】\n1. 直接叠加：图形简单重叠\n2. 去同存异：保留不同部分\n3. 去异存同：保留相同部分\n4. 规律叠加：按特定规则组合\n\n【识别方法】\n- 对比相邻图形的元素\n- 找出保留或消除的规律", Example: "两个图形叠加，重叠部分消失（去同存异）", Mnemonic: "直接叠加看重叠，去同存异看差异", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "遍历规律", FrontContent: "图形遍历有哪些规律？", BackContent: "【遍历特征】\n元素在不同位置出现，保证每个位置都被访问\n\n【常见形式】\n1. 元素在九宫格各位置轮流出现\n2. 不同图形依次出现在同一位置\n3. 颜色/线型轮换\n\n【识别技巧】\n- 统计各位置出现的元素\n- 找出未出现的组合", Example: "3×3网格中，圆形依次在每个格子出现一次", Mnemonic: "遍历不重复，每处走一遍", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "对称规律", FrontContent: "图形对称有哪些类型？", BackContent: "【对称类型】\n1. 轴对称：关于某条直线对称\n2. 中心对称：绕中心点旋转180°重合\n3. 旋转对称：绕某点旋转特定角度重合\n\n【常见对称轴】\n- 竖直轴、水平轴、对角线\n\n【识别技巧】\n- 数对称轴数量\n- 判断对称类型", Example: "正方形有4条对称轴，圆有无数条对称轴", Mnemonic: "轴对称看轴，中心对称转180", Difficulty: 2, Importance: 5, IsActive: true},

		// 数量规律
		{CardType: model.FlashCardTypeFigure, Title: "点线面数量规律", FrontContent: "图推中点线面的数量规律？", BackContent: "【点的数量】\n- 交点数：线与线的交叉点\n- 端点数：线段的端点\n\n【线的数量】\n- 直线数、曲线数\n- 笔画数（一笔画问题）\n\n【面的数量】\n- 封闭区域数\n- 内部面、外部面\n\n【常见规律】\n递增、递减、等差、常数", Example: "每幅图的交点数依次为1,2,3,4，则下一幅为5", Mnemonic: "点数交点端，线数笔画算，面数看封闭", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "角的数量规律", FrontContent: "图推中角的数量规律？", BackContent: "【角的类型】\n- 锐角（<90°）\n- 直角（=90°）\n- 钝角（>90°）\n- 内角、外角\n\n【数量规律】\n1. 各类角的数量变化\n2. 内角和的规律\n3. 角度大小的递变\n\n【注意事项】\n- 区分图形内角和构成角\n- 注意角的开口方向", Example: "三角形内角和180°，四边形360°", Mnemonic: "锐直钝角分清楚，内角和有规律", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "封闭区域规律", FrontContent: "如何数封闭区域？", BackContent: "【基本方法】\n数被线条围成的独立空间\n\n【计算公式】\n面数 = 线数 - 点数 + 1（欧拉公式简化）\n\n【注意事项】\n1. 不要漏数嵌套区域\n2. 外部无限区域通常不算\n3. 同心图形要分层数\n\n【常见规律】\n等差数列、斐波那契数列", Example: "田字格有4个封闭区域", Mnemonic: "封闭看围合，嵌套要分清", Difficulty: 3, Importance: 4, IsActive: true},

		// 空间重构
		{CardType: model.FlashCardTypeFigure, Title: "六面体折叠规律", FrontContent: "六面体展开图的折叠规律？", BackContent: "【相对面规律】\n展开图中相隔一个面的两面为相对面\n\n【常见展开形式】\n1-4-1型、2-3-1型、2-2-2型、3-3型\n\n【判断技巧】\n1. 找相对面（不能同时看到）\n2. 看相邻面的相对位置\n3. 用排除法\n\n【公共边判断】\n折叠后公共边仍相邻", Example: "1-4-1展开图：中间4个面首尾为相对面", Mnemonic: "隔一是相对，相邻看位置", Difficulty: 4, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "截面与视图", FrontContent: "立体截面和三视图规律？", BackContent: "【截面规律】\n1. 截面形状取决于切割角度\n2. 正方体可截出三角形、四边形、五边形、六边形\n\n【三视图】\n- 主视图（正面）\n- 俯视图（上面）\n- 左视图（左面）\n\n【关系】\n长对正、高平齐、宽相等", Example: "正方体沿对角线切割可得正六边形截面", Mnemonic: "截面看角度，视图长高宽", Difficulty: 4, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "立体拼合规律", FrontContent: "立体图形拼合有哪些技巧？", BackContent: "【拼合原则】\n1. 形状互补\n2. 凹凸契合\n3. 大小匹配\n\n【常见题型】\n1. 小块拼大块\n2. 选出不能拼合的\n3. 填补缺失部分\n\n【解题技巧】\n1. 看特征边/特征点\n2. 计算体积是否匹配\n3. 排除法", Example: "两个完全相同的三角形可以拼成平行四边形", Mnemonic: "拼合看互补，凹凸要对齐", Difficulty: 3, Importance: 4, IsActive: true},

		// 特殊规律
		{CardType: model.FlashCardTypeFigure, Title: "一笔画规律", FrontContent: "如何判断图形能否一笔画完成？", BackContent: "【基本条件】\n1. 图形是连通的\n2. 奇点数为0或2\n\n【奇点定义】\n发出奇数条线的点为奇点\n\n【结论】\n- 0个奇点：可从任意点开始一笔画\n- 2个奇点：从一个奇点开始，另一个奇点结束\n- 奇点>2：不能一笔画完成", Example: "田字格有4个奇点，不能一笔画", Mnemonic: "奇点0或2可一笔，奇点多了画不成", Difficulty: 4, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeFigure, Title: "功能元素规律", FrontContent: "图推中功能元素有哪些类型？", BackContent: "【功能元素类型】\n1. 指示元素：箭头指示方向或位置\n2. 标记元素：小图形标记特定位置\n3. 运算元素：+、-、×等表示操作\n\n【作用】\n1. 指示下一图的变化方向\n2. 标记保留或删除的部分\n3. 表示图形间的运算关系", Example: "箭头指向哪个方向，图形就往哪移动", Mnemonic: "功能元素看作用，指示标记和运算", Difficulty: 3, Importance: 4, IsActive: true},

		// ================== 法律常识卡片 ==================
		{CardType: model.FlashCardTypeLaw, Title: "正当防卫的条件", FrontContent: "正当防卫需要满足哪些条件？", BackContent: "1. 存在不法侵害（起因条件）\n2. 不法侵害正在进行（时间条件）\n3. 具有防卫意识（主观条件）\n4. 针对不法侵害人本人（对象条件）\n5. 没有明显超过必要限度（限度条件）\n\n特殊正当防卫：对严重危及人身安全的暴力犯罪，无限度条件限制。", Example: "甲持刀抢劫乙，乙夺刀将甲刺伤，属于正当防卫。", Mnemonic: "口诀：起时主对限", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLaw, Title: "紧急避险的条件", FrontContent: "紧急避险需要满足哪些条件？", BackContent: "1. 存在现实危险（起因条件）\n2. 危险正在发生（时间条件）\n3. 出于保护合法权益的目的（主观条件）\n4. 迫不得已而为之（补充条件）\n5. 没有超过必要限度（限度条件）\n6. 不适用于职务上、业务上有特定责任的人", Example: "为躲避失控汽车，损坏他人财物，属于紧急避险。", Mnemonic: "口诀：危险迫不得已，限度不超必要", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLaw, Title: "犯罪未遂与中止", FrontContent: "犯罪未遂与犯罪中止的区别？", BackContent: "【犯罪未遂】\n- 已经着手实行犯罪\n- 因意志以外的原因未能得逞\n- 处罚：可以比照既遂从轻或减轻处罚\n\n【犯罪中止】\n- 在犯罪过程中自动放弃或有效防止结果发生\n- 主动性（非被迫）\n- 处罚：没有造成损害的免除处罚；造成损害的减轻处罚", Example: "甲欲杀乙，刺一刀后良心发现送医抢救成功——犯罪中止\n甲欲杀乙，刺一刀后被路人制止——犯罪未遂", Mnemonic: "未遂是欲而不能，中止是能而不欲", Difficulty: 4, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLaw, Title: "行政处罚种类", FrontContent: "行政处罚的种类有哪些？", BackContent: "【人身自由罚】行政拘留\n\n【财产罚】罚款、没收违法所得、没收非法财物\n\n【资格罚】暂扣或吊销许可证、降低资质等级\n\n【行为罚】责令停产停业、限制从业\n\n【声誉罚】警告、通报批评\n\n注：限制人身自由的行政处罚只能由法律设定", Example: "无证驾驶可被处以拘留、罚款、吊销驾照等处罚。", Mnemonic: "人身财产资格行为声誉，共五大类", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLaw, Title: "民事行为能力", FrontContent: "民事行为能力的年龄划分？", BackContent: "【完全民事行为能力人】\n- 18周岁以上\n- 16-18周岁以自己劳动收入为主要生活来源\n\n【限制民事行为能力人】\n- 8周岁以上的未成年人\n- 不能完全辨认自己行为的成年人\n\n【无民事行为能力人】\n- 不满8周岁的未成年人\n- 不能辨认自己行为的成年人", Example: "7岁儿童购买文具的行为效力待定，纯获利益的除外。", Mnemonic: "8岁分界限制，18岁完全", Difficulty: 3, Importance: 5, IsActive: true},

		// ================== 历史常识卡片 ==================
		{CardType: model.FlashCardTypeHistory, Title: "中国古代朝代顺序", FrontContent: "中国古代主要朝代顺序？", BackContent: "夏商周秦汉（西汉、东汉）\n三国两晋南北朝（魏蜀吴、西晋东晋、南朝北朝）\n隋唐五代十国\n宋元明清\n\n口诀：\n夏商与西周，东周分两段\n春秋和战国，一统秦两汉\n三分魏蜀吴，二晋前后延\n南北朝并立，隋唐五代传\n宋元明清后，皇朝至此完", Example: "唐朝建立于618年，是在隋朝之后。", Mnemonic: "夏商周秦汉，三国两晋南北朝，隋唐五代十国宋元明清", Difficulty: 2, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeHistory, Title: "近代不平等条约", FrontContent: "近代中国主要不平等条约？", BackContent: "1. 《南京条约》(1842) - 第一个不平等条约\n   割让香港岛，开放五口通商\n\n2. 《马关条约》(1895)\n   割让台湾、辽东半岛，赔款两亿两\n\n3. 《辛丑条约》(1901) - 赔款最多\n   赔款4.5亿两，禁止反帝活动\n\n4. 《北京条约》(1860)\n   割让九龙司地方", Example: "鸦片战争后签订《南京条约》，中国开始沦为半殖民地半封建社会。", Mnemonic: "南京马关辛丑北京，时间顺序要牢记", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeHistory, Title: "党史重要会议", FrontContent: "中共历史上的重要会议？", BackContent: "1. 一大(1921.7上海)：中共成立\n2. 遵义会议(1935.1)：生死攸关转折点，确立毛泽东领导地位\n3. 七大(1945延安)：确立毛泽东思想为指导思想\n4. 七届二中全会(1949西柏坡)：工作重心由乡村转城市\n5. 十一届三中全会(1978)：改革开放起点\n6. 十八大(2012)：习近平时代开始\n7. 二十大(2022)：全面建设社会主义现代化国家", Example: "遵义会议是党的历史上生死攸关的转折点。", Mnemonic: "一大成立，遵义转折，三中改革", Difficulty: 3, Importance: 5, IsActive: true},

		// ================== 地理常识卡片 ==================
		{CardType: model.FlashCardTypeGeography, Title: "中国地理之最", FrontContent: "中国地理之最有哪些？", BackContent: "【最高】珠穆朗玛峰 8848.86米\n【最低】吐鲁番盆地 -154米\n【最长河流】长江 6397公里\n【最大湖泊】青海湖（咸水）鄱阳湖（淡水）\n【最大岛屿】台湾岛\n【最大平原】东北平原\n【最大盆地】塔里木盆地\n【最大高原】青藏高原\n【最大沙漠】塔克拉玛干沙漠", Example: "长江是中国最长的河流，也是亚洲最长的河流。", Mnemonic: "珠峰最高吐鲁番最低，长江最长青海湖最大", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeGeography, Title: "中国四大高原", FrontContent: "中国四大高原及其特点？", BackContent: "1. 青藏高原 - 世界屋脊\n   特点：海拔最高，雪山冰川\n\n2. 内蒙古高原\n   特点：地表坦荡，一望无垠\n\n3. 黄土高原\n   特点：千沟万壑，水土流失严重\n\n4. 云贵高原\n   特点：地表崎岖，喀斯特地貌", Example: "黄土高原由于植被破坏严重，水土流失问题突出。", Mnemonic: "青藏最高内蒙古坦，黄土千壑云贵崎岖", Difficulty: 2, Importance: 4, IsActive: true},

		// ================== 科技常识卡片 ==================
		{CardType: model.FlashCardTypeTech, Title: "中国航天成就", FrontContent: "中国航天重要里程碑？", BackContent: "1. 1970年：东方红一号（第一颗人造卫星）\n2. 2003年：神舟五号（杨利伟，首次载人航天）\n3. 2007年：嫦娥一号（首次探月）\n4. 2011年：天宫一号（首个空间实验室）\n5. 2019年：嫦娥四号（首次月球背面软着陆）\n6. 2020年：北斗三号全球组网完成\n7. 2021年：天问一号（首次火星探测）\n8. 2022年：中国空间站全面建成", Example: "2003年神舟五号成功发射，杨利伟成为中国首位航天员。", Mnemonic: "东方红开天，神舟载人行，嫦娥奔月去，天问探火星", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeTech, Title: "诺贝尔奖中国获得者", FrontContent: "获得诺贝尔奖的中国人？", BackContent: "1. 杨振宁、李政道 - 1957年物理学奖（宇称不守恒）\n2. 丁肇中 - 1976年物理学奖（J粒子）\n3. 李远哲 - 1986年化学奖\n4. 朱棣文 - 1997年物理学奖\n5. 崔琦 - 1998年物理学奖\n6. 高锟 - 2009年物理学奖（光纤）\n7. 莫言 - 2012年文学奖（首位中国籍）\n8. 屠呦呦 - 2015年生理学或医学奖（青蒿素）", Example: "屠呦呦因发现青蒿素获2015年诺贝尔生理学或医学奖。", Mnemonic: "杨李丁三位物理先驱，莫言文学屠呦呦医学", Difficulty: 3, Importance: 4, IsActive: true},

		// ================== 公文格式卡片 ==================
		{CardType: model.FlashCardTypeDocument, Title: "公文种类", FrontContent: "党政机关公文有哪些种类？", BackContent: "【15种法定公文】\n决议、决定、命令（令）、公报、\n公告、通告、意见、通知、\n通报、报告、请示、批复、\n议案、函、纪要\n\n【常考区分】\n- 请示：请求上级批准事项（一文一事）\n- 报告：向上级汇报工作（可一文数事）\n- 函：平行或不相隶属机关之间", Example: "向上级请求批准购买设备，应使用请示。", Mnemonic: "请示要批准，报告是汇报，函是平行往来", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeDocument, Title: "公文格式要素", FrontContent: "公文格式的主要要素？", BackContent: "【版头】发文机关标志、份号、密级、紧急程度、发文字号、签发人\n\n【主体】标题、主送机关、正文、附件说明、发文机关署名、成文日期、印章、附注、附件\n\n【版记】抄送机关、印发机关和印发日期\n\n注意：成文日期用阿拉伯数字标注", Example: "公文标题由发文机关+事由+文种组成。", Mnemonic: "版头主体版记三部分，标题事由文种要齐全", Difficulty: 3, Importance: 5, IsActive: true},

		// ================== 资料分析公式卡片 ==================
		{CardType: model.FlashCardTypeDataAnalsis, Title: "增长率公式", FrontContent: "增长率的计算公式？", BackContent: "增长率 = 增长量/基期量 × 100%\n增长率 = (现期量-基期量)/基期量 × 100%\n增长率 = 现期量/基期量 - 1\n\n【拓展】\n年均增长率：r = ⁿ√(末期/初期) - 1\n混合增长率：介于各部分增长率之间", Example: "2023年GDP为10万亿，2022年为8万亿\n增长率 = (10-8)/8 = 25%", Mnemonic: "增长量除以基期，或现期除基期减1", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeDataAnalsis, Title: "比重变化公式", FrontContent: "比重变化的判断方法？", BackContent: "比重 = 部分/整体\n\n【比重变化判断】\n若部分增长率 > 整体增长率 → 比重上升\n若部分增长率 < 整体增长率 → 比重下降\n若部分增长率 = 整体增长率 → 比重不变\n\n【比重变化量】\n比重变化 = 现期比重 - 基期比重", Example: "A产品增长20%，总产值增长15%，则A的比重上升。", Mnemonic: "部分增速大于整体，比重就上升", Difficulty: 3, Importance: 5, IsActive: true},

		// ================== 实词辨析卡片 ==================
		{CardType: model.FlashCardTypeWord, Title: "推脱 vs 推托", FrontContent: "推脱与推托的区别？", BackContent: "【推脱】\n推卸、开脱（多指责任）\n例：推脱责任\n\n【推托】\n借故拒绝（多指事情）\n例：推托有事不能来", Example: "他总是找借口推脱工作任务。\n她推托身体不适，没有参加聚会。", Mnemonic: "推脱用于责任，推托用于事情", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeWord, Title: "截止 vs 截至", FrontContent: "截止与截至的区别？", BackContent: "【截止】\n（到某时间）停止，不带宾语\n例：报名截止\n\n【截至】\n截止到（某时间），后接时间词\n例：截至目前", Example: "报名时间已经截止。\n截至昨日，已有1000人报名。", Mnemonic: "截止不带宾语，截至后接时间", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeWord, Title: "融化 vs 溶化 vs 熔化", FrontContent: "融化、溶化、熔化的区别？", BackContent: "【融化】\n冰雪等变成水（自然现象）\n例：春天冰雪融化\n\n【溶化】\n物质在液体中溶解\n例：糖在水中溶化\n\n【熔化】\n固体加热变成液体\n例：铁块熔化成铁水", Example: "阳光照射下，积雪融化了。\n把盐放入水中，盐逐渐溶化。\n高温使金属熔化。", Mnemonic: "融化看天（日），溶化看水，熔化看火", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeWord, Title: "权利 vs 权力", FrontContent: "权利与权力的区别？", BackContent: "【权利】\n依法享有的利益、资格\n例：公民权利、合法权利\n与义务相对\n\n【权力】\n支配、指挥的力量\n例：国家权力、行政权力\n与服从相对", Example: "公民享有言论自由的权利。\n人民代表大会是国家最高权力机关。", Mnemonic: "权利与义务对应，权力与服从对应", Difficulty: 2, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeWord, Title: "启用 vs 起用", FrontContent: "启用与起用的区别？", BackContent: "【启用】\n开始使用（物品、设施）\n例：启用新设备、启用新公章\n\n【起用】\n重新任用（人员）\n例：起用退休干部、起用老将", Example: "新建的会议室正式启用。\n公司起用了一批年轻干部。", Mnemonic: "启用物，起用人", Difficulty: 2, Importance: 4, IsActive: true},

		// ================== 逻辑公式卡片 ==================
		{CardType: model.FlashCardTypeLogic, Title: "假言命题翻译", FrontContent: "假言命题如何翻译？", BackContent: "【充分条件】A→B\n如果A，那么B\n只要A，就B\nA是B的充分条件\n\n【必要条件】A←B（即B→A）\n只有A，才B\nA是B的必要条件\n除非A，否则不B\n\n【逆否等价】\nA→B 等价于 ¬B→¬A", Example: "如果下雨，地就湿：下雨→地湿\n等价于：地不湿→没下雨", Mnemonic: "充分条件箭头在后，必要条件箭头在前", Difficulty: 4, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLogic, Title: "三段论推理", FrontContent: "三段论的基本结构？", BackContent: "【结构】\n大前提：所有M都是P\n小前提：所有S都是M\n结论：所有S都是P\n\n【规则】\n1. 中项在前提中至少周延一次\n2. 结论中否定则前提必有否定\n3. 两个否定前提不能得出结论", Example: "大前提：所有鸟都会飞\n小前提：麻雀是鸟\n结论：麻雀会飞", Mnemonic: "大包中，中包小，所以大包小", Difficulty: 4, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLogic, Title: "联言与选言命题", FrontContent: "联言命题与选言命题的真假判断？", BackContent: "【联言命题】A且B\n全真才真，一假即假\n\n【相容选言】A或B\n一真即真，全假才假\n\n【不相容选言】要么A要么B\n有且只有一个为真时才真", Example: "小明会唱歌且会跳舞（两个都满足才为真）\n小明会唱歌或会跳舞（至少一个满足即为真）", Mnemonic: "联言全真才真，选言一真即真", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeLogic, Title: "削弱论证方法", FrontContent: "常见的削弱论证方式？", BackContent: "【力度排序】\n否定结论 > 拆桥 > 否定论据 > 他因削弱\n\n【具体方法】\n1. 否定结论：直接否定结论\n2. 拆桥：切断论据与结论的联系\n3. 否定论据：论据不可靠/不正确\n4. 他因削弱：提出另一个原因", Example: "论点：喝咖啡导致失眠\n削弱：失眠是因为压力大（他因）\n削弱：喝咖啡与失眠无关（拆桥）", Mnemonic: "削弱力度：结论>桥>论据>他因", Difficulty: 4, Importance: 5, IsActive: true},

		// ================== 名言警句/写作卡片 ==================
		{CardType: model.FlashCardTypeWriting, Title: "申论开头金句", FrontContent: "申论大作文开头有哪些金句？", BackContent: "【引言式】\n习近平总书记指出：XXX\n\n【排比式】\n从...到...，从...到...，无不彰显着...\n\n【问题引入】\n当前，我国正处于...的关键时期，面临着...的严峻挑战\n\n【背景切入】\n党的二十大报告提出...，这为...指明了方向", Example: "习近平总书记深刻指出：绿水青山就是金山银山。这一论断深刻揭示了...", Mnemonic: "引言、排比、问题、背景四种开头", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeWriting, Title: "论证过渡句式", FrontContent: "申论论证中常用的过渡句式？", BackContent: "【递进关系】\n不仅...而且...\n既要...更要...\n\n【并列关系】\n一方面...另一方面...\n与此同时...\n\n【转折关系】\n然而、但是、不过\n\n【因果关系】\n正因如此...所以...\n由于...导致...", Example: "推进生态文明建设，不仅需要政府的引导，更需要全社会的共同参与。", Mnemonic: "递进用不仅更要，并列用一方面另一方面", Difficulty: 2, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeWriting, Title: "结尾升华句式", FrontContent: "申论大作文结尾如何升华？", BackContent: "【展望未来】\n我们有理由相信，在...的引领下，...必将...\n\n【呼吁号召】\n让我们携手并进，共同...，为实现...而不懈奋斗\n\n【引用收尾】\n正如...所言：...\n\n【总结点题】\n总之，...是...的必由之路/重要保障/关键所在", Example: "让我们携手并进，共同守护绿水青山，为建设美丽中国贡献力量。", Mnemonic: "展望、呼吁、引用、总结四种结尾", Difficulty: 3, Importance: 4, IsActive: true},
		{CardType: model.FlashCardTypeWriting, Title: "习近平金句-生态文明", FrontContent: "习近平关于生态文明的经典论述？", BackContent: "1. 绿水青山就是金山银山\n2. 生态兴则文明兴，生态衰则文明衰\n3. 良好生态环境是最公平的公共产品，是最普惠的民生福祉\n4. 山水林田湖草沙是一个生命共同体\n5. 要像保护眼睛一样保护生态环境，像对待生命一样对待生态环境", Example: "在申论中论述环境保护时，可引用绿水青山就是金山银山来支撑论点。", Mnemonic: "两山论是核心，生态民生相结合", Difficulty: 2, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeWriting, Title: "习近平金句-人民至上", FrontContent: "习近平关于人民至上的经典论述？", BackContent: "1. 人民对美好生活的向往，就是我们的奋斗目标\n2. 江山就是人民，人民就是江山\n3. 以人民为中心的发展思想\n4. 人民是历史的创造者，是真正的英雄\n5. 始终把人民放在心中最高位置", Example: "论述民生政策时可引用人民对美好生活的向往，就是我们的奋斗目标。", Mnemonic: "江山人民，以人民为中心", Difficulty: 2, Importance: 5, IsActive: true},

		// ================== 面试技巧卡片 ==================
		{CardType: model.FlashCardTypeInterview, Title: "综合分析答题框架", FrontContent: "综合分析题的基本答题框架？", BackContent: "【社会现象类】\n1. 表态：明确态度\n2. 分析：背景、原因、影响\n3. 对策：多主体、多角度\n4. 总结：呼应开头\n\n【名言警句类】\n1. 解释：含义理解\n2. 论证：结合实际\n3. 践行：如何落实", Example: "对于躺平现象，我认为需要辩证看待。首先分析原因...其次提出对策...", Mnemonic: "态度-分析-对策-总结", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeInterview, Title: "计划组织答题框架", FrontContent: "计划组织题的基本答题框架？", BackContent: "【活动策划类】\n1. 目的意义\n2. 前期准备（人员、物资、时间、地点）\n3. 活动开展（具体环节）\n4. 后期总结（反馈、宣传）\n\n【调研类】\n1. 调研目的\n2. 调研对象和内容\n3. 调研方式\n4. 形成报告", Example: "开展反诈宣传活动：确定主题-成立小组-制作材料-多渠道宣传-效果评估", Mnemonic: "目的-准备-开展-总结", Difficulty: 3, Importance: 5, IsActive: true},
		{CardType: model.FlashCardTypeInterview, Title: "应急应变答题框架", FrontContent: "应急应变题的基本答题框架？", BackContent: "【核心原则】\n轻重缓急、分清主次\n\n【基本步骤】\n1. 稳定情绪（自己/他人）\n2. 紧急处理（人员安全优先）\n3. 报告领导\n4. 后续处理\n5. 总结反思\n\n【常见场景】\n群体事件、舆情危机、突发事故", Example: "群众聚集上访：先安抚情绪-登记诉求-引导分流-向领导汇报-跟进处理", Mnemonic: "先稳后处，报告领导，总结反思", Difficulty: 3, Importance: 5, IsActive: true},
	}
}

// getMindMapSeedData 获取思维导图种子数据
func (s *KnowledgeContentSeeder) getMindMapSeedData(createdBy uint) []*model.KnowledgeMindMap {
	// 言语理解知识体系
	yuyanMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "言语理解与表达", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "逻辑填空", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "实词辨析", "children": []map[string]interface{}{{"id": "1-1-1", "text": "词义侧重"}, {"id": "1-1-2", "text": "语义轻重"}, {"id": "1-1-3", "text": "感情色彩"}, {"id": "1-1-4", "text": "搭配范围"}}},
					{"id": "1-2", "text": "虚词辨析", "children": []map[string]interface{}{{"id": "1-2-1", "text": "关联词"}, {"id": "1-2-2", "text": "介词"}, {"id": "1-2-3", "text": "副词"}}},
					{"id": "1-3", "text": "成语辨析", "children": []map[string]interface{}{{"id": "1-3-1", "text": "望文生义"}, {"id": "1-3-2", "text": "褒贬误用"}, {"id": "1-3-3", "text": "对象误用"}, {"id": "1-3-4", "text": "谦敬错位"}}},
					{"id": "1-4", "text": "语境分析", "children": []map[string]interface{}{{"id": "1-4-1", "text": "解释关系"}, {"id": "1-4-2", "text": "反对关系"}, {"id": "1-4-3", "text": "递进关系"}, {"id": "1-4-4", "text": "并列关系"}}},
				}},
				{"id": "2", "text": "片段阅读", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "主旨概括", "children": []map[string]interface{}{{"id": "2-1-1", "text": "总分结构"}, {"id": "2-1-2", "text": "分总结构"}, {"id": "2-1-3", "text": "转折结构"}, {"id": "2-1-4", "text": "因果结构"}}},
					{"id": "2-2", "text": "意图判断", "children": []map[string]interface{}{{"id": "2-2-1", "text": "问题对策"}, {"id": "2-2-2", "text": "社会现象"}, {"id": "2-2-3", "text": "故事寓言"}}},
					{"id": "2-3", "text": "细节判断", "children": []map[string]interface{}{{"id": "2-3-1", "text": "偷换概念"}, {"id": "2-3-2", "text": "无中生有"}, {"id": "2-3-3", "text": "过度推断"}}},
					{"id": "2-4", "text": "标题选择", "children": []map[string]interface{}{{"id": "2-4-1", "text": "新闻类"}, {"id": "2-4-2", "text": "说明文"}, {"id": "2-4-3", "text": "议论文"}}},
				}},
				{"id": "3", "text": "语句表达", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "语句排序", "children": []map[string]interface{}{{"id": "3-1-1", "text": "首尾句判断"}, {"id": "3-1-2", "text": "关联词衔接"}, {"id": "3-1-3", "text": "指代词定位"}}},
					{"id": "3-2", "text": "语句填空", "children": []map[string]interface{}{{"id": "3-2-1", "text": "段首句"}, {"id": "3-2-2", "text": "段中句"}, {"id": "3-2-3", "text": "段尾句"}}},
					{"id": "3-3", "text": "下文推断"},
				}},
			},
		},
	}

	// 数量关系知识体系
	shuliangMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "数量关系", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "数学运算", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "计算问题", "children": []map[string]interface{}{{"id": "1-1-1", "text": "计算技巧"}, {"id": "1-1-2", "text": "数列问题"}, {"id": "1-1-3", "text": "不定方程"}}},
					{"id": "1-2", "text": "工程问题", "children": []map[string]interface{}{{"id": "1-2-1", "text": "普通工程"}, {"id": "1-2-2", "text": "交替合作"}, {"id": "1-2-3", "text": "牛吃草"}}},
					{"id": "1-3", "text": "行程问题", "children": []map[string]interface{}{{"id": "1-3-1", "text": "相遇追及"}, {"id": "1-3-2", "text": "流水行船"}, {"id": "1-3-3", "text": "环形运动"}}},
					{"id": "1-4", "text": "排列组合", "children": []map[string]interface{}{{"id": "1-4-1", "text": "排列"}, {"id": "1-4-2", "text": "组合"}, {"id": "1-4-3", "text": "概率"}}},
					{"id": "1-5", "text": "经济利润", "children": []map[string]interface{}{{"id": "1-5-1", "text": "基本利润"}, {"id": "1-5-2", "text": "打折促销"}, {"id": "1-5-3", "text": "分段计费"}}},
					{"id": "1-6", "text": "几何问题", "children": []map[string]interface{}{{"id": "1-6-1", "text": "平面几何"}, {"id": "1-6-2", "text": "立体几何"}, {"id": "1-6-3", "text": "最值问题"}}},
				}},
				{"id": "2", "text": "数字推理", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "基础数列", "children": []map[string]interface{}{{"id": "2-1-1", "text": "等差数列"}, {"id": "2-1-2", "text": "等比数列"}, {"id": "2-1-3", "text": "质数数列"}}},
					{"id": "2-2", "text": "多级数列"},
					{"id": "2-3", "text": "递推数列"},
					{"id": "2-4", "text": "幂次数列"},
					{"id": "2-5", "text": "分数数列"},
				}},
			},
		},
	}

	// 判断推理知识体系
	panduanMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "判断推理", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "图形推理", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "位置规律", "children": []map[string]interface{}{{"id": "1-1-1", "text": "平移"}, {"id": "1-1-2", "text": "旋转"}, {"id": "1-1-3", "text": "翻转"}}},
					{"id": "1-2", "text": "样式规律", "children": []map[string]interface{}{{"id": "1-2-1", "text": "叠加"}, {"id": "1-2-2", "text": "遍历"}, {"id": "1-2-3", "text": "对称"}}},
					{"id": "1-3", "text": "数量规律", "children": []map[string]interface{}{{"id": "1-3-1", "text": "点线面"}, {"id": "1-3-2", "text": "角"}, {"id": "1-3-3", "text": "封闭区域"}}},
					{"id": "1-4", "text": "空间重构", "children": []map[string]interface{}{{"id": "1-4-1", "text": "六面体"}, {"id": "1-4-2", "text": "截面"}, {"id": "1-4-3", "text": "视图"}}},
				}},
				{"id": "2", "text": "定义判断", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "单定义判断"},
					{"id": "2-2", "text": "多定义判断"},
					{"id": "2-3", "text": "关键词匹配法"},
				}},
				{"id": "3", "text": "类比推理", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "语义关系", "children": []map[string]interface{}{{"id": "3-1-1", "text": "近义反义"}, {"id": "3-1-2", "text": "比喻象征"}}},
					{"id": "3-2", "text": "逻辑关系", "children": []map[string]interface{}{{"id": "3-2-1", "text": "并列关系"}, {"id": "3-2-2", "text": "包含关系"}, {"id": "3-2-3", "text": "因果关系"}}},
					{"id": "3-3", "text": "语法关系", "children": []map[string]interface{}{{"id": "3-3-1", "text": "主谓关系"}, {"id": "3-3-2", "text": "动宾关系"}}},
				}},
				{"id": "4", "text": "逻辑判断", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "翻译推理", "children": []map[string]interface{}{{"id": "4-1-1", "text": "假言命题"}, {"id": "4-1-2", "text": "联言命题"}, {"id": "4-1-3", "text": "选言命题"}}},
					{"id": "4-2", "text": "真假推理"},
					{"id": "4-3", "text": "分析推理", "children": []map[string]interface{}{{"id": "4-3-1", "text": "排列组合"}, {"id": "4-3-2", "text": "分组分配"}}},
					{"id": "4-4", "text": "削弱加强", "children": []map[string]interface{}{{"id": "4-4-1", "text": "因果论证"}, {"id": "4-4-2", "text": "类比论证"}, {"id": "4-4-3", "text": "数据论证"}}},
				}},
			},
		},
	}

	// 资料分析知识体系
	ziliaoMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "资料分析", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "统计术语", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "基期与现期"},
					{"id": "1-2", "text": "增长量与增长率"},
					{"id": "1-3", "text": "同比与环比"},
					{"id": "1-4", "text": "比重与倍数"},
					{"id": "1-5", "text": "平均数与中位数"},
				}},
				{"id": "2", "text": "常用公式", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "增长率公式"},
					{"id": "2-2", "text": "比重公式"},
					{"id": "2-3", "text": "倍数公式"},
					{"id": "2-4", "text": "平均数公式"},
					{"id": "2-5", "text": "年均增长率"},
				}},
				{"id": "3", "text": "速算技巧", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "截位直除"},
					{"id": "3-2", "text": "首数法"},
					{"id": "3-3", "text": "特征数字法"},
					{"id": "3-4", "text": "错位加减"},
					{"id": "3-5", "text": "放缩估算"},
				}},
				{"id": "4", "text": "材料类型", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "文字型材料"},
					{"id": "4-2", "text": "表格型材料"},
					{"id": "4-3", "text": "图形型材料"},
					{"id": "4-4", "text": "综合型材料"},
				}},
			},
		},
	}

	// 申论知识体系
	shenlunMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "申论", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "归纳概括", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "概括问题"},
					{"id": "1-2", "text": "概括原因"},
					{"id": "1-3", "text": "概括对策"},
					{"id": "1-4", "text": "概括特点"},
					{"id": "1-5", "text": "概括经验"},
				}},
				{"id": "2", "text": "综合分析", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "词句理解"},
					{"id": "2-2", "text": "评价分析"},
					{"id": "2-3", "text": "比较分析"},
					{"id": "2-4", "text": "启示分析"},
				}},
				{"id": "3", "text": "提出对策", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "直接对策"},
					{"id": "3-2", "text": "间接对策"},
					{"id": "3-3", "text": "综合对策"},
				}},
				{"id": "4", "text": "贯彻执行", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "法定公文"},
					{"id": "4-2", "text": "事务文书"},
					{"id": "4-3", "text": "宣传类"},
					{"id": "4-4", "text": "总结类"},
				}},
				{"id": "5", "text": "大作文", "expanded": true, "children": []map[string]interface{}{
					{"id": "5-1", "text": "立意确定"},
					{"id": "5-2", "text": "标题拟定"},
					{"id": "5-3", "text": "开头写法"},
					{"id": "5-4", "text": "论证方法"},
					{"id": "5-5", "text": "结尾写法"},
				}},
			},
		},
	}

	// 常识判断知识体系
	changshiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "常识判断", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "政治常识", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "马克思主义哲学", "children": []map[string]interface{}{{"id": "1-1-1", "text": "唯物论"}, {"id": "1-1-2", "text": "辩证法"}, {"id": "1-1-3", "text": "认识论"}, {"id": "1-1-4", "text": "历史唯物主义"}}},
					{"id": "1-2", "text": "毛泽东思想"},
					{"id": "1-3", "text": "中国特色社会主义理论体系"},
					{"id": "1-4", "text": "习近平新时代中国特色社会主义思想"},
					{"id": "1-5", "text": "党的建设"},
				}},
				{"id": "2", "text": "法律常识", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "宪法", "children": []map[string]interface{}{{"id": "2-1-1", "text": "公民基本权利"}, {"id": "2-1-2", "text": "国家机构"}}},
					{"id": "2-2", "text": "民法", "children": []map[string]interface{}{{"id": "2-2-1", "text": "民事主体"}, {"id": "2-2-2", "text": "物权"}, {"id": "2-2-3", "text": "合同"}, {"id": "2-2-4", "text": "侵权责任"}}},
					{"id": "2-3", "text": "刑法", "children": []map[string]interface{}{{"id": "2-3-1", "text": "犯罪构成"}, {"id": "2-3-2", "text": "刑罚"}, {"id": "2-3-3", "text": "常见罪名"}}},
					{"id": "2-4", "text": "行政法", "children": []map[string]interface{}{{"id": "2-4-1", "text": "行政处罚"}, {"id": "2-4-2", "text": "行政许可"}, {"id": "2-4-3", "text": "行政复议"}, {"id": "2-4-4", "text": "行政诉讼"}}},
				}},
				{"id": "3", "text": "经济常识", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "微观经济"},
					{"id": "3-2", "text": "宏观经济"},
					{"id": "3-3", "text": "国际经济"},
				}},
				{"id": "4", "text": "历史人文", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "中国古代史"},
					{"id": "4-2", "text": "中国近现代史"},
					{"id": "4-3", "text": "世界史"},
					{"id": "4-4", "text": "文学常识"},
				}},
				{"id": "5", "text": "科技地理", "expanded": true, "children": []map[string]interface{}{
					{"id": "5-1", "text": "科技成就"},
					{"id": "5-2", "text": "生活科技"},
					{"id": "5-3", "text": "中国地理"},
					{"id": "5-4", "text": "世界地理"},
				}},
			},
		},
	}

	// 结构化面试知识体系
	mianshiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "结构化面试", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "综合分析题", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "社会现象类", "children": []map[string]interface{}{{"id": "1-1-1", "text": "积极现象"}, {"id": "1-1-2", "text": "消极现象"}, {"id": "1-1-3", "text": "辩证现象"}}},
					{"id": "1-2", "text": "政策理解类"},
					{"id": "1-3", "text": "名言警句类"},
					{"id": "1-4", "text": "观点类"},
				}},
				{"id": "2", "text": "计划组织题", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "调研类"},
					{"id": "2-2", "text": "宣传类"},
					{"id": "2-3", "text": "活动策划类"},
					{"id": "2-4", "text": "会议组织类"},
				}},
				{"id": "3", "text": "人际关系题", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "与领导关系"},
					{"id": "3-2", "text": "与同事关系"},
					{"id": "3-3", "text": "与下属关系"},
					{"id": "3-4", "text": "与群众关系"},
				}},
				{"id": "4", "text": "应急应变题", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "公共危机"},
					{"id": "4-2", "text": "工作失误"},
					{"id": "4-3", "text": "舆情处理"},
					{"id": "4-4", "text": "阻挠执法"},
				}},
				{"id": "5", "text": "情景模拟题", "expanded": true, "children": []map[string]interface{}{
					{"id": "5-1", "text": "劝说类"},
					{"id": "5-2", "text": "安抚类"},
					{"id": "5-3", "text": "解释说明类"},
				}},
				{"id": "6", "text": "自我认知题", "expanded": true, "children": []map[string]interface{}{
					{"id": "6-1", "text": "自我介绍"},
					{"id": "6-2", "text": "职业规划"},
					{"id": "6-3", "text": "岗位匹配"},
				}},
			},
		},
	}

	// 公共基础知识体系
	gongjiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "公共基础知识", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "政治理论", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "马克思主义基本原理"},
					{"id": "1-2", "text": "毛泽东思想"},
					{"id": "1-3", "text": "中国特色社会主义理论"},
					{"id": "1-4", "text": "党的建设理论"},
					{"id": "1-5", "text": "时事政治"},
				}},
				{"id": "2", "text": "法律基础", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "法理学"},
					{"id": "2-2", "text": "宪法学"},
					{"id": "2-3", "text": "行政法"},
					{"id": "2-4", "text": "民法"},
					{"id": "2-5", "text": "刑法"},
					{"id": "2-6", "text": "诉讼法"},
				}},
				{"id": "3", "text": "经济知识", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "市场经济"},
					{"id": "3-2", "text": "宏观调控"},
					{"id": "3-3", "text": "财政金融"},
				}},
				{"id": "4", "text": "管理知识", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "管理学基础"},
					{"id": "4-2", "text": "行政管理"},
					{"id": "4-3", "text": "公共管理"},
				}},
				{"id": "5", "text": "公文写作", "expanded": true, "children": []map[string]interface{}{
					{"id": "5-1", "text": "公文格式"},
					{"id": "5-2", "text": "公文种类"},
					{"id": "5-3", "text": "行文规则"},
				}},
				{"id": "6", "text": "科技人文", "expanded": true, "children": []map[string]interface{}{
					{"id": "6-1", "text": "科技常识"},
					{"id": "6-2", "text": "历史常识"},
					{"id": "6-3", "text": "地理常识"},
					{"id": "6-4", "text": "文学常识"},
				}},
			},
		},
	}

	// ================== 申论题型方法导图 ==================

	// 归纳概括题方法导图
	guinaMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "归纳概括题解题方法", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "审题要点", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "明确作答对象（问题/原因/对策/特点等）"},
					{"id": "1-2", "text": "确定字数限制"},
					{"id": "1-3", "text": "关注材料范围"},
				}},
				{"id": "2", "text": "找点方法", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "关键词法（首先、其次、另外等）"},
					{"id": "2-2", "text": "段落大意法"},
					{"id": "2-3", "text": "高频词汇法"},
					{"id": "2-4", "text": "关联词分析法"},
				}},
				{"id": "3", "text": "加工整合", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "合并同类项"},
					{"id": "3-2", "text": "提炼核心词"},
					{"id": "3-3", "text": "逻辑排序"},
				}},
				{"id": "4", "text": "答案呈现", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "总括句+分条"},
					{"id": "4-2", "text": "序号标注清晰"},
					{"id": "4-3", "text": "要点完整覆盖"},
				}},
			},
		},
	}

	// 综合分析题方法导图
	zonghefenxiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "综合分析题解题方法", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "词句理解题", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "解释词句含义"},
					{"id": "1-2", "text": "分析深层内涵"},
					{"id": "1-3", "text": "结合材料论证"},
					{"id": "1-4", "text": "得出结论启示"},
				}},
				{"id": "2", "text": "评价分析题", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "表明观点态度"},
					{"id": "2-2", "text": "分析合理之处"},
					{"id": "2-3", "text": "指出不足之处"},
					{"id": "2-4", "text": "提出改进建议"},
				}},
				{"id": "3", "text": "比较分析题", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "找出相同点"},
					{"id": "3-2", "text": "找出不同点"},
					{"id": "3-3", "text": "分析原因"},
					{"id": "3-4", "text": "得出结论"},
				}},
				{"id": "4", "text": "启示分析题", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "概括成功经验"},
					{"id": "4-2", "text": "总结失败教训"},
					{"id": "4-3", "text": "提炼可借鉴之处"},
				}},
			},
		},
	}

	// 提出对策题方法导图
	tichuduiceMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "提出对策题解题方法", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "对策来源", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "材料直接对策（原文摘取）"},
					{"id": "1-2", "text": "问题反推对策"},
					{"id": "1-3", "text": "原因反推对策"},
					{"id": "1-4", "text": "经验教训转化"},
				}},
				{"id": "2", "text": "对策主体", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "政府层面"},
					{"id": "2-2", "text": "企业层面"},
					{"id": "2-3", "text": "社会层面"},
					{"id": "2-4", "text": "个人层面"},
				}},
				{"id": "3", "text": "对策维度", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "制度建设"},
					{"id": "3-2", "text": "宣传教育"},
					{"id": "3-3", "text": "监督管理"},
					{"id": "3-4", "text": "资金保障"},
					{"id": "3-5", "text": "人才培养"},
				}},
				{"id": "4", "text": "答题格式", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "对策+展开说明"},
					{"id": "4-2", "text": "主体+对策"},
					{"id": "4-3", "text": "对策+预期效果"},
				}},
			},
		},
	}

	// 贯彻执行题方法导图
	guanchezhixingMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "贯彻执行题解题方法", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "常见文种", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "宣传类（倡议书、宣传稿、公开信）"},
					{"id": "1-2", "text": "总结类（汇报材料、工作总结）"},
					{"id": "1-3", "text": "方案类（活动方案、整改方案）"},
					{"id": "1-4", "text": "简报类（简报、情况反映）"},
				}},
				{"id": "2", "text": "格式要求", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "标题（关于...的...）"},
					{"id": "2-2", "text": "称谓/主送机关"},
					{"id": "2-3", "text": "正文（开头+主体+结尾）"},
					{"id": "2-4", "text": "落款（单位+日期）"},
				}},
				{"id": "3", "text": "内容逻辑", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "背景/目的（为什么）"},
					{"id": "3-2", "text": "做法/内容（怎么做）"},
					{"id": "3-3", "text": "号召/要求（期望结果）"},
				}},
				{"id": "4", "text": "语言风格", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "宣传类：生动感人"},
					{"id": "4-2", "text": "总结类：客观严谨"},
					{"id": "4-3", "text": "方案类：具体可行"},
				}},
			},
		},
	}

	// 大作文写作方法导图
	dazuowenMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "大作文写作方法", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "立意方法", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "题目分析法"},
					{"id": "1-2", "text": "材料主旨法"},
					{"id": "1-3", "text": "高频词归纳法"},
					{"id": "1-4", "text": "立意要求：正确、深刻、新颖"},
				}},
				{"id": "2", "text": "结构布局", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "五段三分式（经典结构）"},
					{"id": "2-2", "text": "起承转合式"},
					{"id": "2-3", "text": "并列式/递进式/对比式"},
				}},
				{"id": "3", "text": "开头写法", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "引言式（名言/政策引入）"},
					{"id": "3-2", "text": "排比式（三个排比句引入）"},
					{"id": "3-3", "text": "背景式（时代背景引入）"},
					{"id": "3-4", "text": "要求：简短精炼、点明主题"},
				}},
				{"id": "4", "text": "论证方法", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "举例论证（典型案例）"},
					{"id": "4-2", "text": "道理论证（名言政策）"},
					{"id": "4-3", "text": "对比论证（正反对比）"},
					{"id": "4-4", "text": "分论点：是什么-为什么-怎么做"},
				}},
				{"id": "5", "text": "结尾写法", "expanded": true, "children": []map[string]interface{}{
					{"id": "5-1", "text": "总结式（概括全文）"},
					{"id": "5-2", "text": "升华式（展望未来）"},
					{"id": "5-3", "text": "呼吁式（发出号召）"},
				}},
			},
		},
	}

	// ================== 面试答题模板导图 ==================

	// 综合分析答题模板
	mszonghefenxiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "综合分析答题模板", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "社会现象题", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "第一步：表态（好/不好/辩证看待）"},
					{"id": "1-2", "text": "第二步：分析原因/影响"},
					{"id": "1-3", "text": "第三步：提出对策"},
					{"id": "1-4", "text": "第四步：总结升华"},
				}},
				{"id": "2", "text": "名言警句题", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "第一步：解释含义"},
					{"id": "2-2", "text": "第二步：结合实际论证"},
					{"id": "2-3", "text": "第三步：如何践行"},
				}},
				{"id": "3", "text": "政策理解题", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "第一步：肯定政策出台的目的"},
					{"id": "3-2", "text": "第二步：分析政策的意义"},
					{"id": "3-3", "text": "第三步：指出可能的问题"},
					{"id": "3-4", "text": "第四步：提出完善建议"},
				}},
			},
		},
	}

	// 计划组织答题模板
	msjihuazuzhiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "计划组织答题模板", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "调研题", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "明确目的意义"},
					{"id": "1-2", "text": "确定调研对象（谁）"},
					{"id": "1-3", "text": "设计调研内容（什么）"},
					{"id": "1-4", "text": "选择调研方式（怎么调）"},
					{"id": "1-5", "text": "撰写调研报告"},
				}},
				{"id": "2", "text": "宣传题", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "明确宣传目的"},
					{"id": "2-2", "text": "确定宣传对象"},
					{"id": "2-3", "text": "准备宣传内容"},
					{"id": "2-4", "text": "选择宣传形式（线上+线下）"},
					{"id": "2-5", "text": "效果评估"},
				}},
				{"id": "3", "text": "活动策划题", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "前期准备（人、财、物、地、时）"},
					{"id": "3-2", "text": "活动流程（开幕-主体-收尾）"},
					{"id": "3-3", "text": "后期总结"},
				}},
			},
		},
	}

	// 人际关系答题模板
	msrenjiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "人际关系答题模板", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "核心原则", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "阳光心态"},
					{"id": "1-2", "text": "工作为重"},
					{"id": "1-3", "text": "主动沟通"},
					{"id": "1-4", "text": "反思自我"},
				}},
				{"id": "2", "text": "与领导关系", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "服从安排、尊重领导"},
					{"id": "2-2", "text": "主动汇报、及时请示"},
					{"id": "2-3", "text": "合理建议、讲究方式"},
				}},
				{"id": "3", "text": "与同事关系", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "虚心学习、主动配合"},
					{"id": "3-2", "text": "换位思考、求同存异"},
					{"id": "3-3", "text": "真诚待人、建立信任"},
				}},
				{"id": "4", "text": "与群众关系", "expanded": true, "children": []map[string]interface{}{
					{"id": "4-1", "text": "耐心倾听、了解诉求"},
					{"id": "4-2", "text": "依法依规、公正处理"},
					{"id": "4-3", "text": "做好解释、赢得理解"},
				}},
			},
		},
	}

	// 应急应变答题模板
	msyingjiMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "应急应变答题模板", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "处理原则", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "生命第一"},
					{"id": "1-2", "text": "轻重缓急"},
					{"id": "1-3", "text": "灵活应对"},
				}},
				{"id": "2", "text": "处理步骤", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "第一步：稳定情绪（自己/他人）"},
					{"id": "2-2", "text": "第二步：控制局面"},
					{"id": "2-3", "text": "第三步：解决问题"},
					{"id": "2-4", "text": "第四步：汇报/总结"},
				}},
				{"id": "3", "text": "常见场景", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "群众聚集：安抚-登记-分流-解决"},
					{"id": "3-2", "text": "舆情危机：监测-回应-处置-引导"},
					{"id": "3-3", "text": "安全事故：救援-疏散-上报-善后"},
					{"id": "3-4", "text": "工作失误：承认-补救-汇报-反思"},
				}},
			},
		},
	}

	// 情景模拟答题模板
	msqingjingMap := map[string]interface{}{
		"root": map[string]interface{}{
			"id": "root", "text": "情景模拟答题模板", "expanded": true,
			"children": []map[string]interface{}{
				{"id": "1", "text": "劝说类", "expanded": true, "children": []map[string]interface{}{
					{"id": "1-1", "text": "称呼破冰、拉近距离"},
					{"id": "1-2", "text": "理解处境、表示认同"},
					{"id": "1-3", "text": "分析利弊、晓之以理"},
					{"id": "1-4", "text": "提供方案、动之以情"},
				}},
				{"id": "2", "text": "安抚类", "expanded": true, "children": []map[string]interface{}{
					{"id": "2-1", "text": "表达关心、稳定情绪"},
					{"id": "2-2", "text": "了解情况、倾听诉求"},
					{"id": "2-3", "text": "说明政策、解释原因"},
					{"id": "2-4", "text": "提供帮助、解决问题"},
				}},
				{"id": "3", "text": "解释说明类", "expanded": true, "children": []map[string]interface{}{
					{"id": "3-1", "text": "态度诚恳、表达歉意"},
					{"id": "3-2", "text": "说明原因、澄清误会"},
					{"id": "3-3", "text": "提出方案、寻求理解"},
					{"id": "3-4", "text": "表态承诺、争取支持"},
				}},
			},
		},
	}

	yuyanJSON, _ := json.Marshal(yuyanMap)
	shuliangJSON, _ := json.Marshal(shuliangMap)
	panduanJSON, _ := json.Marshal(panduanMap)
	ziliaoJSON, _ := json.Marshal(ziliaoMap)
	shenlunJSON, _ := json.Marshal(shenlunMap)
	changshiJSON, _ := json.Marshal(changshiMap)
	mianshiJSON, _ := json.Marshal(mianshiMap)
	gongjiJSON, _ := json.Marshal(gongjiMap)

	// 申论题型方法导图
	guinaJSON, _ := json.Marshal(guinaMap)
	zonghefenxiJSON, _ := json.Marshal(zonghefenxiMap)
	tichuduiceJSON, _ := json.Marshal(tichuduiceMap)
	guanchezhixingJSON, _ := json.Marshal(guanchezhixingMap)
	dazuowenJSON, _ := json.Marshal(dazuowenMap)

	// 面试答题模板导图
	mszonghefenxiJSON, _ := json.Marshal(mszonghefenxiMap)
	msjihuazuzhiJSON, _ := json.Marshal(msjihuazuzhiMap)
	msrenjiJSON, _ := json.Marshal(msrenjiMap)
	msyingjiJSON, _ := json.Marshal(msyingjiMap)
	msqingjingJSON, _ := json.Marshal(msqingjingMap)

	return []*model.KnowledgeMindMap{
		// 知识体系图（8张）
		{MapType: model.MindMapTypeSubject, Title: "言语理解与表达知识体系", Description: "言语理解与表达模块完整知识体系，包括逻辑填空、片段阅读、语句表达三大板块", MapData: string(yuyanJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "数量关系知识体系", Description: "数量关系模块完整知识体系，包括数学运算和数字推理两大部分", MapData: string(shuliangJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "判断推理知识体系", Description: "判断推理模块完整知识体系，包括图形推理、定义判断、类比推理、逻辑判断四大板块", MapData: string(panduanJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "资料分析知识体系", Description: "资料分析模块完整知识体系，包括统计术语、常用公式、速算技巧、材料类型", MapData: string(ziliaoJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "常识判断知识体系", Description: "常识判断模块完整知识体系，包括政治、法律、经济、历史人文、科技地理五大板块", MapData: string(changshiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "申论知识体系", Description: "申论模块完整知识体系，包括归纳概括、综合分析、提出对策、贯彻执行、大作文五大题型", MapData: string(shenlunJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "结构化面试知识体系", Description: "结构化面试完整知识体系，包括综合分析、计划组织、人际关系、应急应变、情景模拟、自我认知六大题型", MapData: string(mianshiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeSubject, Title: "公共基础知识体系", Description: "公共基础知识完整体系，包括政治理论、法律基础、经济知识、管理知识、公文写作、科技人文六大模块", MapData: string(gongjiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},

		// 申论题型方法导图（5张）
		{MapType: model.MindMapTypeChapter, Title: "归纳概括题解题方法", Description: "申论归纳概括题的审题、找点、加工、答案呈现全流程方法", MapData: string(guinaJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "综合分析题解题方法", Description: "申论综合分析题四种类型（词句理解、评价分析、比较分析、启示分析）的解题思路", MapData: string(zonghefenxiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "提出对策题解题方法", Description: "申论提出对策题的对策来源、主体、维度和答题格式", MapData: string(tichuduiceJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "贯彻执行题解题方法", Description: "申论贯彻执行题的文种、格式、内容逻辑和语言风格", MapData: string(guanchezhixingJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "大作文写作方法", Description: "申论大作文的立意、结构、开头、论证、结尾全流程写作方法", MapData: string(dazuowenJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},

		// 面试答题模板导图（5张）
		{MapType: model.MindMapTypeChapter, Title: "面试综合分析答题模板", Description: "面试综合分析题（社会现象、名言警句、政策理解）的答题框架和模板", MapData: string(mszonghefenxiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "面试计划组织答题模板", Description: "面试计划组织题（调研、宣传、活动策划）的答题流程和要点", MapData: string(msjihuazuzhiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "面试人际关系答题模板", Description: "面试人际关系题的核心原则和处理各类关系的方法", MapData: string(msrenjiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "面试应急应变答题模板", Description: "面试应急应变题的处理原则、步骤和常见场景应对方法", MapData: string(msyingjiJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
		{MapType: model.MindMapTypeChapter, Title: "面试情景模拟答题模板", Description: "面试情景模拟题（劝说、安抚、解释说明）的答题技巧和话术", MapData: string(msqingjingJSON), IsActive: true, IsPublic: true, CreatedBy: createdBy},
	}
}
