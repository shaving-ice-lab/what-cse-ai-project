-- =============================================
-- 课程内容优化脚本
-- 描述：优化课程标题、副标题、描述等内容
-- 创建时间：2026-01-29
-- =============================================

-- =============================================
-- 一、行测 - 言语理解与表达
-- =============================================

-- 实词辨析精讲系列
UPDATE `what_courses` SET 
    `title` = '实词辨析基础方法：语素分析与语境推断',
    `subtitle` = '4课时 | 入门必修',
    `description` = '系统讲解语素分析法、语境推断法、色彩辨析法等核心方法，通过大量真题案例帮助考生快速掌握实词辨析的底层逻辑。'
WHERE `id` = 656;

UPDATE `what_courses` SET 
    `title` = '高频实词专题：500+组核心词汇精讲',
    `subtitle` = '6课时 | 词汇突破',
    `description` = '精选国考省考高频实词500+组，按照语义相近、易混易错等维度分类讲解，配合记忆口诀和对比辨析，帮助考生彻底攻克词汇难关。'
WHERE `id` = 657;

UPDATE `what_courses` SET 
    `title` = '语境分析专题：六大方法攻克逻辑填空',
    `subtitle` = '6课时 | 方法进阶',
    `description` = '深入讲解关联词法、指代分析法、标点符号法、首尾呼应法、主题词法、情感色彩法六大语境分析方法，全面提升逻辑填空正确率。'
WHERE `id` = 658;

UPDATE `what_courses` SET 
    `title` = '固定搭配专题：掌握词语搭配黄金法则',
    `subtitle` = '4课时 | 提分利器',
    `description` = '系统梳理常见词语固定搭配规则，包括动宾搭配、偏正搭配、主谓搭配等，帮助考生在30秒内快速锁定正确选项。'
WHERE `id` = 659;

-- 成语辨析精讲系列
UPDATE `what_courses` SET 
    `title` = '高频成语精讲：800个必备成语分类速记',
    `subtitle` = '5课时 | 成语宝典',
    `description` = '精选公考高频成语800个，按照语义、感情色彩、使用对象等维度分类讲解，配合典故故事和真题演练，让成语学习不再枯燥。'
WHERE `id` = 660;

UPDATE `what_courses` SET 
    `title` = '易混成语辨析：200组高频易混成语深度解析',
    `subtitle` = '5课时 | 辨析攻坚',
    `description` = '针对公考中最容易混淆的200组成语进行深度辨析，通过对比分析、语境适用、真题检验三步法，彻底解决成语易混问题。'
WHERE `id` = 661;

UPDATE `what_courses` SET 
    `title` = '成语误用类型总结：七大误区与避坑指南',
    `subtitle` = '5课时 | 查漏补缺',
    `description` = '系统总结望文生义、对象误用、褒贬失当、谦敬错位、语义重复、自相矛盾、语法错误七大成语误用类型，助你规避所有陷阱。'
WHERE `id` = 662;

-- 关联词精讲系列
UPDATE `what_courses` SET 
    `title` = '关联词分类总结：八大类型一网打尽',
    `subtitle` = '3课时 | 体系构建',
    `description` = '系统梳理转折、递进、因果、并列、条件、假设、目的、选择八大类关联词，构建完整的关联词知识体系。'
WHERE `id` = 663;

UPDATE `what_courses` SET 
    `title` = '关联词搭配规则：固定搭配与灵活运用',
    `subtitle` = '3课时 | 规则掌握',
    `description` = '深入讲解关联词的固定搭配规则和灵活运用技巧，掌握"虽然...但是"、"不但...而且"等常见搭配的使用要点。'
WHERE `id` = 664;

UPDATE `what_courses` SET 
    `title` = '关联词综合运用：真题实战与技巧提升',
    `subtitle` = '4课时 | 综合提升',
    `description` = '通过大量真题演练，掌握关联词在逻辑填空和片段阅读中的综合运用技巧，提升整体言语理解能力。'
WHERE `id` = 665;

-- 主旨概括精讲系列
UPDATE `what_courses` SET 
    `title` = '行文脉络分析法：快速把握文章结构',
    `subtitle` = '5课时 | 核心方法',
    `description` = '系统讲解总分结构、分总结构、总分总结构、并列结构、对比结构五大行文脉络，帮助考生30秒内准确把握文章主旨。'
WHERE `id` = 666;

UPDATE `what_courses` SET 
    `title` = '关键词定位法：一招锁定正确答案',
    `subtitle` = '5课时 | 提速神器',
    `description` = '掌握转折词、递进词、总结词、强调词等关键词的定位技巧，实现快速阅读、精准答题，平均每题节省15秒。'
WHERE `id` = 667;

UPDATE `what_courses` SET 
    `title` = '各结构类型精讲：五大结构真题突破',
    `subtitle` = '5课时 | 结构攻坚',
    `description` = '深入讲解五大行文结构的特点与识别方法，配合历年真题进行实战训练，全面提升主旨概括题的正确率。'
WHERE `id` = 668;

-- 意图判断精讲系列
UPDATE `what_courses` SET 
    `title` = '意图判断基础方法：揣摩作者真实用意',
    `subtitle` = '4课时 | 方法入门',
    `description` = '系统讲解意图判断题的解题思路，掌握从表面意思到深层意图的推理方法，准确把握作者的写作目的。'
WHERE `id` = 669;

UPDATE `what_courses` SET 
    `title` = '意图题与主旨题区分：精准辨别不丢分',
    `subtitle` = '3课时 | 辨析要点',
    `description` = '深入分析意图判断题与主旨概括题的本质区别，掌握"言外之意"与"字面意思"的判断技巧，避免混淆失分。'
WHERE `id` = 670;

UPDATE `what_courses` SET 
    `title` = '典型意图题专练：高频题型真题演练',
    `subtitle` = '3课时 | 实战训练',
    `description` = '精选近五年国考省考典型意图判断真题进行专项训练，通过真题实战巩固解题方法，提升答题准确率。'
WHERE `id` = 671;

-- 细节理解精讲系列
UPDATE `what_courses` SET 
    `title` = '细节判断基础方法：精准定位与对比验证',
    `subtitle` = '4课时 | 核心技巧',
    `description` = '系统讲解细节理解题的解题步骤，掌握定位原文、对比选项、排除干扰的核心方法，提升细节题正确率。'
WHERE `id` = 672;

UPDATE `what_courses` SET 
    `title` = '干扰项设置规律：识破命题人的套路',
    `subtitle` = '3课时 | 避坑指南',
    `description` = '深入分析细节题常见干扰项设置方式，包括偷换概念、以偏概全、无中生有、时态混淆等，帮助考生快速排除错误选项。'
WHERE `id` = 673;

UPDATE `what_courses` SET 
    `title` = '快速定位技巧：关键词匹配与跳读法',
    `subtitle` = '3课时 | 提速方法',
    `description` = '掌握通过选项关键词快速定位原文的技巧，学会跳读法高效筛选信息，实现细节题快速准确作答。'
WHERE `id` = 674;

-- 标题选择精讲系列
UPDATE `what_courses` SET 
    `title` = '标题选择基本原则：概括性与吸引力兼顾',
    `subtitle` = '2课时 | 原则入门',
    `description` = '讲解标题选择的基本原则，理解好标题需要兼顾准确概括主旨和吸引读者兴趣，掌握标题题的核心解题思路。'
WHERE `id` = 675;

UPDATE `what_courses` SET 
    `title` = '各类文章标题选择：新闻、议论、说明文专练',
    `subtitle` = '3课时 | 分类攻克',
    `description` = '针对新闻类、议论类、说明类等不同文章类型的标题选择技巧进行专项训练，掌握各类文章的标题特点与选择要点。'
WHERE `id` = 676;

-- 语句排序精讲系列
UPDATE `what_courses` SET 
    `title` = '排序基础方法：首尾句判断与逻辑衔接',
    `subtitle` = '3课时 | 方法入门',
    `description` = '系统讲解语句排序的核心方法，掌握通过首尾句判断、关联词衔接、指代关系等线索快速确定语句顺序。'
WHERE `id` = 677;

UPDATE `what_courses` SET 
    `title` = '排序进阶技巧：捆绑法与排除法运用',
    `subtitle` = '3课时 | 技巧提升',
    `description` = '深入讲解捆绑法、排除法等高效解题技巧，通过确定句子组合快速缩小答案范围，提升排序题答题效率。'
WHERE `id` = 678;

UPDATE `what_courses` SET 
    `title` = '排序综合训练：高难度真题实战演练',
    `subtitle` = '2课时 | 综合提升',
    `description` = '精选历年高难度排序真题进行实战训练，综合运用各种解题方法，全面提升语句排序能力。'
WHERE `id` = 679;

-- 语句填空精讲系列
UPDATE `what_courses` SET 
    `title` = '语句填空基础方法：上下文衔接与语意连贯',
    `subtitle` = '2课时 | 方法入门',
    `description` = '讲解语句填空的基础解题方法，掌握根据上下文语境判断填入语句的技巧，确保语意连贯通顺。'
WHERE `id` = 680;

UPDATE `what_courses` SET 
    `title` = '语句填空进阶：空格位置与句子功能判断',
    `subtitle` = '3课时 | 进阶技巧',
    `description` = '深入分析不同位置空格的特点与作用，掌握开头句、过渡句、总结句等不同功能语句的填空技巧。'
WHERE `id` = 681;

-- =============================================
-- 二、行测 - 数量关系
-- =============================================

-- 计算问题与技巧系列
UPDATE `what_courses` SET 
    `title` = '速算技巧汇总：十大速算方法全掌握',
    `subtitle` = '4课时 | 计算基础',
    `description` = '系统讲解凑整法、拆分法、估算法、尾数法、特值法、比例法、十字交叉法等十大速算技巧，让计算又快又准。'
WHERE `id` = 682;

UPDATE `what_courses` SET 
    `title` = '整除特性应用：秒杀计算题的黄金法则',
    `subtitle` = '3课时 | 核心技巧',
    `description` = '深入讲解整除特性的判断方法与应用技巧，掌握2、3、4、5、6、7、8、9等数的整除判断，实现计算题秒杀。'
WHERE `id` = 683;

UPDATE `what_courses` SET 
    `title` = '比例法与方程法：两大核心方法精讲',
    `subtitle` = '3课时 | 方法攻坚',
    `description` = '系统对比比例法和方程法的适用场景与解题步骤，帮助考生根据题目特点灵活选择最优解法，提升解题效率。'
WHERE `id` = 684;

-- 行程问题精讲系列
UPDATE `what_courses` SET 
    `title` = '相遇与追及问题：路程差与时间差解题法',
    `subtitle` = '3课时 | 行程基础',
    `description` = '系统讲解相遇问题和追及问题的基本公式与解题思路，掌握路程差、时间差等核心概念，攻克行程问题基础题型。'
WHERE `id` = 685;

UPDATE `what_courses` SET 
    `title` = '流水行船问题：顺流逆流的速度关系',
    `subtitle` = '3课时 | 专题突破',
    `description` = '深入讲解流水行船问题的核心公式，理解顺水、逆水与静水速度的关系，掌握复杂流水问题的解题技巧。'
WHERE `id` = 686;

UPDATE `what_courses` SET 
    `title` = '环形与其他行程：环形跑道与复杂行程',
    `subtitle` = '4课时 | 综合提升',
    `description` = '讲解环形跑道问题、火车过桥问题、钟表问题等特殊行程问题，掌握各类复杂行程问题的解题方法。'
WHERE `id` = 687;

-- 工程问题精讲系列
UPDATE `what_courses` SET 
    `title` = '工程问题基础：效率、时间、工作量三要素',
    `subtitle` = '3课时 | 概念入门',
    `description` = '系统讲解工程问题的基本概念与公式，理解工作效率、工作时间、工作总量之间的关系，打好工程问题基础。'
WHERE `id` = 688;

UPDATE `what_courses` SET 
    `title` = '工程问题进阶：合作、轮换、变速工程',
    `subtitle` = '3课时 | 进阶攻克',
    `description` = '深入讲解多人合作、轮换工作、变速工作等复杂工程问题，掌握特值法、比例法等高效解题技巧。'
WHERE `id` = 689;

UPDATE `what_courses` SET 
    `title` = '工程问题综合：高难度真题实战突破',
    `subtitle` = '2课时 | 综合训练',
    `description` = '精选历年高难度工程问题真题进行实战训练，综合运用各种方法，全面提升工程问题解题能力。'
WHERE `id` = 690;

-- 利润问题精讲系列
UPDATE `what_courses` SET 
    `title` = '利润问题基础：成本、售价、利润率关系',
    `subtitle` = '2课时 | 概念入门',
    `description` = '系统讲解成本、定价、售价、利润、利润率等基本概念，掌握利润问题的核心公式与计算方法。'
WHERE `id` = 691;

UPDATE `what_courses` SET 
    `title` = '利润问题进阶：打折、促销、混合销售',
    `subtitle` = '2课时 | 进阶技巧',
    `description` = '深入讲解打折销售、促销活动、混合销售等复杂利润问题，掌握多次打折、满减优惠等题型的解题技巧。'
WHERE `id` = 692;

UPDATE `what_courses` SET 
    `title` = '利润问题综合：商业场景真题精讲',
    `subtitle` = '2课时 | 实战训练',
    `description` = '结合实际商业场景，讲解利润问题在真题中的应用，提升考生解决实际利润计算问题的能力。'
WHERE `id` = 693;

-- 排列组合精讲系列
UPDATE `what_courses` SET 
    `title` = '基本原理：加法原理与乘法原理',
    `subtitle` = '3课时 | 原理基础',
    `description` = '系统讲解排列组合的两大基本原理，理解加法原理"分类"与乘法原理"分步"的本质区别与应用场景。'
WHERE `id` = 694;

UPDATE `what_courses` SET 
    `title` = '排列组合公式：P与C的灵活运用',
    `subtitle` = '3课时 | 公式掌握',
    `description` = '深入讲解排列数P和组合数C的计算方法与选用原则，掌握"有序排列、无序组合"的核心概念。'
WHERE `id` = 695;

UPDATE `what_courses` SET 
    `title` = '典型模型：隔板、环排、捆绑、插空',
    `subtitle` = '6课时 | 模型突破',
    `description` = '全面讲解排列组合的典型模型，包括隔板法、环形排列、捆绑法、插空法、错位重排等，攻克所有高频题型。'
WHERE `id` = 696;

-- 概率问题精讲系列
UPDATE `what_courses` SET 
    `title` = '概率基础：古典概型与基本公式',
    `subtitle` = '2课时 | 概念入门',
    `description` = '系统讲解概率的基本概念与古典概型，掌握概率计算的基本公式与方法，打好概率问题的基础。'
WHERE `id` = 697;

UPDATE `what_courses` SET 
    `title` = '概率进阶：条件概率与独立重复',
    `subtitle` = '2课时 | 进阶技巧',
    `description` = '深入讲解条件概率、独立事件、重复试验等进阶概念，掌握复杂概率问题的分析与计算方法。'
WHERE `id` = 698;

UPDATE `what_courses` SET 
    `title` = '概率综合：排列组合与概率结合应用',
    `subtitle` = '2课时 | 综合提升',
    `description` = '讲解排列组合与概率计算的结合应用，通过真题训练提升复杂概率问题的解题能力。'
WHERE `id` = 699;

-- 几何问题精讲系列
UPDATE `what_courses` SET 
    `title` = '平面几何：面积计算与位置关系',
    `subtitle` = '3课时 | 平面基础',
    `description` = '系统讲解三角形、四边形、圆等平面图形的面积公式与计算技巧，掌握平面几何的核心知识点。'
WHERE `id` = 700;

UPDATE `what_courses` SET 
    `title` = '立体几何：体积表面积与空间关系',
    `subtitle` = '2课时 | 立体攻坚',
    `description` = '深入讲解棱柱、棱锥、圆柱、圆锥、球等立体图形的体积与表面积计算，掌握空间几何问题的解题方法。'
WHERE `id` = 701;

UPDATE `what_courses` SET 
    `title` = '几何综合：构造与极值问题',
    `subtitle` = '3课时 | 综合提升',
    `description` = '讲解几何构造法、几何极值等高难度题型，通过真题训练全面提升几何问题的解题能力。'
WHERE `id` = 702;

-- 其他问题精讲系列
UPDATE `what_courses` SET 
    `title` = '其他典型问题：年龄、日期、容斥、方阵',
    `subtitle` = '6课时 | 专题汇总',
    `description` = '系统讲解年龄问题、日期问题、容斥原理、方阵问题等其他典型数学运算题型，全面覆盖数量关系考点。'
WHERE `id` = 703;

-- =============================================
-- 三、行测 - 数字推理
-- =============================================

-- 基础数列精讲系列
UPDATE `what_courses` SET 
    `title` = '等差等比数列：最基础的数列规律',
    `subtitle` = '4课时 | 入门必修',
    `description` = '系统讲解等差数列、等比数列的基本特征与变形形式，掌握最基础也是最重要的数列规律类型。'
WHERE `id` = 704;

UPDATE `what_courses` SET 
    `title` = '和积数列：数项间的运算关系',
    `subtitle` = '2课时 | 规律拓展',
    `description` = '讲解和数列、积数列等通过数项间运算得到规律的数列类型，拓展数列规律的认知维度。'
WHERE `id` = 705;

-- 递推数列精讲系列
UPDATE `what_courses` SET 
    `title` = '递推数列：多级递推与周期规律',
    `subtitle` = '6课时 | 进阶攻克',
    `description` = '深入讲解二级、三级等多级递推数列，以及周期数列、幂次数列等复杂数列类型，攻克数字推理难题。'
WHERE `id` = 706;

-- 特殊数列精讲系列
UPDATE `what_courses` SET 
    `title` = '特殊数列：质数、分数、小数与多重规律',
    `subtitle` = '4课时 | 综合提升',
    `description` = '讲解质数数列、分数数列、小数数列、多重数列等特殊数列类型，全面覆盖数字推理所有考点。'
WHERE `id` = 707;

-- =============================================
-- 四、行测 - 判断推理 - 图形推理
-- =============================================

-- 位置规律精讲系列
UPDATE `what_courses` SET 
    `title` = '平移与旋转：图形位置变化规律',
    `subtitle` = '4课时 | 位置基础',
    `description` = '系统讲解图形的平移、旋转规律，掌握方向、角度、步数等位置变化的核心要素与判断方法。'
WHERE `id` = 708;

UPDATE `what_courses` SET 
    `title` = '翻转规律：轴对称与镜像变换',
    `subtitle` = '2课时 | 翻转攻坚',
    `description` = '深入讲解图形翻转的判断方法，掌握水平翻转、垂直翻转、对角翻转等不同翻转类型的识别技巧。'
WHERE `id` = 709;

-- 样式规律精讲系列
UPDATE `what_courses` SET 
    `title` = '叠加规律：图形元素的合并与叠加',
    `subtitle` = '2课时 | 叠加入门',
    `description` = '讲解图形叠加的基本规律，掌握直接叠加、去同存异、去异存同等叠加方式的识别与应用。'
WHERE `id` = 710;

UPDATE `what_courses` SET 
    `title` = '遍历规律：元素分布的完整性',
    `subtitle` = '2课时 | 遍历技巧',
    `description` = '深入讲解图形元素遍历规律，掌握通过观察元素在各图中的分布来找出规律的方法。'
WHERE `id` = 711;

UPDATE `what_courses` SET 
    `title` = '对称与相似：图形形态的规律把握',
    `subtitle` = '2课时 | 形态规律',
    `description` = '系统讲解图形的对称性（轴对称、中心对称）和相似性规律，提升图形形态规律的敏感度。'
WHERE `id` = 712;

-- 属性规律精讲系列
UPDATE `what_courses` SET 
    `title` = '属性规律：开闭、曲直、对称性判断',
    `subtitle` = '4课时 | 属性全解',
    `description` = '全面讲解图形的开放封闭性、曲线直线性、对称性等属性规律，掌握属性类图推题的解题思路。'
WHERE `id` = 713;

-- 数量规律精讲系列
UPDATE `what_courses` SET 
    `title` = '点线数量：交点、端点、线条计数',
    `subtitle` = '4课时 | 数量基础',
    `description` = '系统讲解图形中点（交点、端点）和线条数量的计数方法与规律判断，打好数量规律基础。'
WHERE `id` = 714;

UPDATE `what_courses` SET 
    `title` = '面角数量：封闭区域与角度计数',
    `subtitle` = '4课时 | 数量进阶',
    `description` = '深入讲解封闭区域数量、角的数量与类型等计数规律，拓展数量规律的考查维度。'
WHERE `id` = 715;

-- 空间重构精讲系列
UPDATE `what_courses` SET 
    `title` = '六面体与展开图：立体图形的平面呈现',
    `subtitle` = '4课时 | 空间核心',
    `description` = '系统讲解正方体、长方体展开图的11种基本形式，掌握通过展开图还原立体图形的方法。'
WHERE `id` = 716;

UPDATE `what_courses` SET 
    `title` = '三视图与截面：多角度观察立体图形',
    `subtitle` = '2课时 | 空间拓展',
    `description` = '讲解三视图（主视图、俯视图、左视图）的判断方法，以及立体图形截面的分析技巧。'
WHERE `id` = 717;

-- =============================================
-- 五、行测 - 判断推理 - 定义判断
-- =============================================

-- 定义判断方法精讲系列
UPDATE `what_courses` SET 
    `title` = '核心成分分析法：拆解定义的关键要素',
    `subtitle` = '3课时 | 方法核心',
    `description` = '系统讲解通过提取定义的主体、客体、原因、目的、条件、方式等核心成分来解题的方法。'
WHERE `id` = 718;

UPDATE `what_courses` SET 
    `title` = '列举排除法：逐一验证快速定位',
    `subtitle` = '2课时 | 效率技巧',
    `description` = '讲解通过将选项逐一代入定义进行验证的解题方法，掌握快速排除错误选项的技巧。'
WHERE `id` = 719;

UPDATE `what_courses` SET 
    `title` = '关键词对比法：抓住定义的本质特征',
    `subtitle` = '3课时 | 辨析技巧',
    `description` = '深入讲解通过对比定义与选项中的关键词来判断正误的方法，提升定义判断的准确率。'
WHERE `id` = 720;

-- 常见定义类型精讲系列
UPDATE `what_courses` SET 
    `title` = '各类定义：心理、法律、经济、管理全覆盖',
    `subtitle` = '6课时 | 分类突破',
    `description` = '分类讲解心理学、法学、经济学、管理学等不同学科的常见定义特点与解题技巧，全面覆盖定义判断考点。'
WHERE `id` = 721;

-- =============================================
-- 六、行测 - 判断推理 - 类比推理
-- =============================================

-- 语义关系精讲系列
UPDATE `what_courses` SET 
    `title` = '语义关系：近反义、比喻、象征关系',
    `subtitle` = '4课时 | 语义基础',
    `description` = '系统讲解近义关系、反义关系、比喻关系、象征关系等语义类词汇关系，打好类比推理基础。'
WHERE `id` = 722;

-- 逻辑关系精讲系列
UPDATE `what_courses` SET 
    `title` = '逻辑关系：并列、包含、交叉、全异',
    `subtitle` = '4课时 | 逻辑核心',
    `description` = '深入讲解并列关系、包含关系、交叉关系、全异关系等逻辑类词汇关系，掌握类比推理的核心考点。'
WHERE `id` = 723;

-- 语法关系精讲系列
UPDATE `what_courses` SET 
    `title` = '语法关系：主谓、动宾、偏正搭配',
    `subtitle` = '2课时 | 语法要点',
    `description` = '讲解主谓关系、动宾关系、偏正关系等语法类词汇关系，拓展类比推理的解题维度。'
WHERE `id` = 724;

-- =============================================
-- 七、行测 - 判断推理 - 逻辑判断
-- =============================================

-- 翻译推理精讲系列
UPDATE `what_courses` SET 
    `title` = '翻译推理：命题逻辑与推理规则',
    `subtitle` = '8课时 | 逻辑基础',
    `description` = '系统讲解假言命题、联言命题、选言命题的逻辑翻译方法，掌握逆否命题、德摩根定律等推理规则。'
WHERE `id` = 725;

-- 真假推理精讲系列
UPDATE `what_courses` SET 
    `title` = '真假推理：矛盾关系与反对关系',
    `subtitle` = '6课时 | 推理核心',
    `description` = '深入讲解命题间的矛盾关系、上反对关系、下反对关系，掌握通过真假关系进行推理的解题方法。'
WHERE `id` = 726;

-- 组合排列精讲系列
UPDATE `what_courses` SET 
    `title` = '组合排列：列表法与代入排除',
    `subtitle` = '6课时 | 排列攻坚',
    `description` = '系统讲解组合排列问题的解题方法，包括列表法、代入排除法、假设法等，攻克逻辑判断中的高频难题。'
WHERE `id` = 727;

-- 论证推理精讲系列
UPDATE `what_courses` SET 
    `title` = '加强论证：支持与假设的逻辑关系',
    `subtitle` = '6课时 | 论证基础',
    `description` = '系统讲解加强型论证题的解题思路，掌握搭桥法、补充论据法、排除他因法等加强论证的方法。'
WHERE `id` = 728;

UPDATE `what_courses` SET 
    `title` = '削弱论证：质疑与反驳的逻辑技巧',
    `subtitle` = '6课时 | 论证攻坚',
    `description` = '深入讲解削弱型论证题的解题方法，掌握否定论点、否定论据、切断联系等削弱论证的技巧。'
WHERE `id` = 729;

-- =============================================
-- 八、行测 - 资料分析
-- =============================================

-- 速算技巧系列
UPDATE `what_courses` SET 
    `title` = '阅读技巧：快速提取关键数据',
    `subtitle` = '4课时 | 阅读基础',
    `description` = '系统讲解资料分析材料的阅读技巧，掌握快速定位数据、理解统计术语的方法，为计算打好基础。'
WHERE `id` = 730;

UPDATE `what_courses` SET 
    `title` = '速算方法：首数法、尾数法、有效数字法',
    `subtitle` = '8课时 | 速算核心',
    `description` = '全面讲解资料分析的速算技巧，包括首数法、尾数法、有效数字法、特征数字法等，大幅提升计算速度。'
WHERE `id` = 731;

-- 统计术语系列
UPDATE `what_courses` SET 
    `title` = '增长问题：增长率、增长量的计算与比较',
    `subtitle` = '6课时 | 核心专题',
    `description` = '系统讲解增长率、增长量的概念与计算方法，掌握同比环比、年均增长等相关问题的解题技巧。'
WHERE `id` = 732;

UPDATE `what_courses` SET 
    `title` = '比重问题：现期比重与基期比重',
    `subtitle` = '4课时 | 比重攻坚',
    `description` = '深入讲解比重的计算方法与变化判断，掌握现期比重、基期比重、比重变化等问题的解题技巧。'
WHERE `id` = 733;

UPDATE `what_courses` SET 
    `title` = '倍数与平均数：比较与计算技巧',
    `subtitle` = '4课时 | 专题拓展',
    `description` = '讲解倍数、平均数等统计指标的计算与比较方法，掌握相关复合问题的解题技巧。'
WHERE `id` = 734;

-- =============================================
-- 九、公共基础知识 - 政治
-- =============================================

UPDATE `what_courses` SET 
    `title` = '马克思主义哲学：唯物论与辩证法',
    `subtitle` = '6课时 | 哲学基础',
    `description` = '系统讲解马克思主义哲学的核心内容，包括物质与意识、对立统一、质量互变、否定之否定等基本原理。'
WHERE `id` = 862;

UPDATE `what_courses` SET 
    `title` = '中国特色社会主义理论：从邓小平理论到习近平新时代思想',
    `subtitle` = '8课时 | 理论体系',
    `description` = '全面讲解中国特色社会主义理论体系的发展脉络，重点解读习近平新时代中国特色社会主义思想的核心要义。'
WHERE `id` = 863;

UPDATE `what_courses` SET 
    `title` = '时事政治热点：国内国际大事深度解读',
    `subtitle` = '4课时 | 时政必备',
    `description` = '精选近期重要时事政治热点进行深度解读，帮助考生把握时政考试要点，了解国内外重大事件。'
WHERE `id` = 864;

-- =============================================
-- 十、公共基础知识 - 法律
-- =============================================

UPDATE `what_courses` SET 
    `title` = '宪法基础：国家根本大法全解析',
    `subtitle` = '4课时 | 宪法入门',
    `description` = '系统讲解宪法的基本原则、公民的基本权利与义务、国家机构设置等核心内容，打牢法律基础。'
WHERE `id` = 867;

UPDATE `what_courses` SET 
    `title` = '行政法精要：依法行政与行政救济',
    `subtitle` = '6课时 | 行政法核心',
    `description` = '深入讲解行政法的基本原则、行政行为、行政许可、行政处罚、行政复议与行政诉讼等重点内容。'
WHERE `id` = 868;

UPDATE `what_courses` SET 
    `title` = '民法典重点：人格权、物权、合同法',
    `subtitle` = '8课时 | 民法要点',
    `description` = '全面解读《民法典》的核心内容，包括人格权编、物权编、合同编等，掌握公考高频民法考点。'
WHERE `id` = 869;

UPDATE `what_courses` SET 
    `title` = '刑法基础：犯罪构成与刑罚制度',
    `subtitle` = '6课时 | 刑法入门',
    `description` = '系统讲解犯罪构成的四要件、刑罚的种类与适用、正当防卫与紧急避险等刑法基础知识。'
WHERE `id` = 870;

UPDATE `what_courses` SET 
    `title` = '诉讼法概要：三大诉讼法对比学习',
    `subtitle` = '4课时 | 程序法基础',
    `description` = '对比讲解刑事诉讼法、民事诉讼法、行政诉讼法的基本原则与程序，掌握三大诉讼法的异同点。'
WHERE `id` = 871;

UPDATE `what_courses` SET 
    `title` = '其他法律专题：劳动法、知识产权法等',
    `subtitle` = '4课时 | 法律拓展',
    `description` = '讲解劳动法、劳动合同法、知识产权法等其他常考法律的核心内容，全面覆盖公基法律考点。'
WHERE `id` = 872;

-- =============================================
-- 十一、公共基础知识 - 公文
-- =============================================

UPDATE `what_courses` SET 
    `title` = '公文格式规范：标准格式与行文规则',
    `subtitle` = '3课时 | 格式入门',
    `description` = '系统讲解党政机关公文的格式规范，包括版头、主体、版记三部分的具体要求，掌握公文格式考点。'
WHERE `id` = 873;

UPDATE `what_courses` SET 
    `title` = '常用公文文种：15种法定公文详解',
    `subtitle` = '6课时 | 文种全解',
    `description` = '全面讲解决议、决定、命令、公报、公告、通告、意见、通知、通报、报告、请示、批复、议案、函、纪要15种法定公文的特点与适用。'
WHERE `id` = 874;

UPDATE `what_courses` SET 
    `title` = '公文处理流程：发文与收文全流程',
    `subtitle` = '2课时 | 流程掌握',
    `description` = '讲解公文的发文处理流程（起草、审核、签发、印制、分发）和收文处理流程（签收、登记、拟办、批办、承办），掌握公文处理考点。'
WHERE `id` = 875;

-- =============================================
-- 十二、公共基础知识 - 常识
-- =============================================

UPDATE `what_courses` SET 
    `title` = '经济管理常识：微观经济与宏观调控',
    `subtitle` = '2课时 | 经济入门',
    `description` = '讲解市场经济基本原理、宏观经济调控手段、财政与货币政策等经济管理常识，掌握经济类考点。'
WHERE `id` = 876;

UPDATE `what_courses` SET 
    `title` = '人文历史常识：中国历史与文化精粹',
    `subtitle` = '3课时 | 人文素养',
    `description` = '系统梳理中国历史发展脉络、重要历史事件与人物、传统文化精髓等人文历史常识，提升文化素养。'
WHERE `id` = 877;

UPDATE `what_courses` SET 
    `title` = '科技地理常识：科技成就与地理知识',
    `subtitle` = '2课时 | 科地要点',
    `description` = '讲解我国重大科技成就、前沿科技动态、中国地理与世界地理等科技地理常识，全面覆盖常识考点。'
WHERE `id` = 878;

-- =============================================
-- 十三、面试 - 基础入门
-- =============================================

UPDATE `what_courses` SET 
    `title` = '面试考试概述：结构化面试全面认知',
    `subtitle` = '2课时 | 认知入门',
    `description` = '全面介绍公务员面试的基本情况，包括面试形式、考查能力、评分标准等，帮助考生建立对面试的整体认知。'
WHERE `id` = 879;

UPDATE `what_courses` SET 
    `title` = '面试备考策略：科学规划高效提升',
    `subtitle` = '2课时 | 备考指南',
    `description` = '讲解面试备考的科学方法，包括时间规划、学习路径、练习方法等，帮助考生制定个性化备考计划。'
WHERE `id` = 880;

UPDATE `what_courses` SET 
    `title` = '面试心态调适：克服紧张自信应对',
    `subtitle` = '2课时 | 心理建设',
    `description` = '针对考生面试紧张、怯场等常见心理问题，提供心态调适方法与实用技巧，帮助考生自信从容应对面试。'
WHERE `id` = 881;

-- =============================================
-- 十四、面试 - 综合分析
-- =============================================

UPDATE `what_courses` SET 
    `title` = '社会现象分析框架：现象类题目答题模板',
    `subtitle` = '2课时 | 框架构建',
    `description` = '系统讲解社会现象类综合分析题的答题框架，包括表态、分析、对策三步法，构建清晰的答题思路。'
WHERE `id` = 882;

UPDATE `what_courses` SET 
    `title` = '社会现象专题：热点问题深度剖析',
    `subtitle` = '2课时 | 热点积累',
    `description` = '精选近期社会热点问题进行深度剖析，帮助考生积累素材、拓展思路、提升综合分析能力。'
WHERE `id` = 883;

UPDATE `what_courses` SET 
    `title` = '社会现象实战：真题演练与点评',
    `subtitle` = '2课时 | 实战训练',
    `description` = '通过历年真题进行实战演练，点评常见问题，巩固答题方法，提升社会现象题的作答水平。'
WHERE `id` = 884;

UPDATE `what_courses` SET 
    `title` = '政策分析框架：政策理解题的答题思路',
    `subtitle` = '2课时 | 政策入门',
    `description` = '讲解政策理解类综合分析题的答题框架，掌握从目的意义、可能问题、落实建议等角度分析政策的方法。'
WHERE `id` = 885;

UPDATE `what_courses` SET 
    `title` = '政策类型专题：各类政策分类解读',
    `subtitle` = '2课时 | 政策深化',
    `description` = '分类讲解民生政策、经济政策、文化政策等不同类型政策的分析要点，提升政策理解题的答题深度。'
WHERE `id` = 886;

UPDATE `what_courses` SET 
    `title` = '政策理解真题精讲：经典真题深度解析',
    `subtitle` = '1课时 | 真题演练',
    `description` = '精选政策理解类经典真题进行深度解析，总结答题技巧，提升政策理解题的作答能力。'
WHERE `id` = 887;

UPDATE `what_courses` SET 
    `title` = '名言警句分析框架：哲理类题目答题方法',
    `subtitle` = '2课时 | 哲理入门',
    `description` = '讲解名言警句类综合分析题的答题框架，掌握揭示寓意、分析道理、联系实际的三步答题法。'
WHERE `id` = 888;

UPDATE `what_courses` SET 
    `title` = '名言警句专题：高频名言深度积累',
    `subtitle` = '2课时 | 素材积累',
    `description` = '系统梳理公考面试常考的名言警句，分类讲解其内涵与应用方法，帮助考生丰富答题素材。'
WHERE `id` = 889;

UPDATE `what_courses` SET 
    `title` = '哲理故事分析框架：寓言故事类题目解析',
    `subtitle` = '2课时 | 故事分析',
    `description` = '讲解哲理故事类综合分析题的答题方法，掌握提炼道理、阐释意义、联系实际的答题思路。'
WHERE `id` = 890;

UPDATE `what_courses` SET 
    `title` = '哲理故事专题：经典故事与启示分析',
    `subtitle` = '3课时 | 专题深化',
    `description` = '精选公考常考的哲理故事进行深度分析，帮助考生理解故事寓意，掌握从故事中提炼观点的方法。'
WHERE `id` = 891;

-- =============================================
-- 十五、面试 - 组织计划
-- =============================================

UPDATE `what_courses` SET 
    `title` = '调研活动框架：调研类题目的完整思路',
    `subtitle` = '2课时 | 调研入门',
    `description` = '系统讲解调研类组织计划题的答题框架，包括调研目的、对象、内容、方式、结果运用等要素。'
WHERE `id` = 892;

UPDATE `what_courses` SET 
    `title` = '调研专题：不同调研类型的组织要点',
    `subtitle` = '2课时 | 调研深化',
    `description` = '分类讲解民意调研、政策调研、问题调研等不同类型调研的组织要点与注意事项。'
WHERE `id` = 893;

UPDATE `what_courses` SET 
    `title` = '调研类真题精讲：经典调研题目实战',
    `subtitle` = '1课时 | 调研实战',
    `description` = '精选调研类经典真题进行实战演练，巩固调研组织的答题方法，提升调研题作答水平。'
WHERE `id` = 894;

UPDATE `what_courses` SET 
    `title` = '宣传活动框架：宣传类题目的核心要素',
    `subtitle` = '2课时 | 宣传入门',
    `description` = '讲解宣传类组织计划题的答题框架，掌握宣传对象、内容、方式、渠道等核心要素的组织方法。'
WHERE `id` = 895;

UPDATE `what_courses` SET 
    `title` = '宣传类真题精讲：经典宣传题目解析',
    `subtitle` = '2课时 | 宣传实战',
    `description` = '通过经典宣传类真题进行实战演练，掌握不同宣传活动的组织技巧，提升宣传题作答能力。'
WHERE `id` = 896;

UPDATE `what_courses` SET 
    `title` = '活动策划框架：各类活动的组织思路',
    `subtitle` = '2课时 | 策划入门',
    `description` = '系统讲解培训、比赛、联谊等各类活动的策划组织框架，掌握活动策划的通用思路与方法。'
WHERE `id` = 897;

UPDATE `what_courses` SET 
    `title` = '活动策划专题：专项活动的组织要点',
    `subtitle` = '3课时 | 策划深化',
    `description` = '分类讲解培训活动、文体活动、志愿服务等专项活动的组织要点，提升活动策划的针对性。'
WHERE `id` = 898;

UPDATE `what_courses` SET 
    `title` = '会议组织框架：各类会议的组织流程',
    `subtitle` = '2课时 | 会议入门',
    `description` = '讲解会议组织类题目的答题框架，包括会前准备、会中服务、会后总结等环节的核心内容。'
WHERE `id` = 899;

UPDATE `what_courses` SET 
    `title` = '会议类型专题：不同会议的组织特点',
    `subtitle` = '2课时 | 会议深化',
    `description` = '分类讲解座谈会、研讨会、动员会、表彰会等不同类型会议的组织特点与注意事项。'
WHERE `id` = 900;

-- =============================================
-- 十六、面试 - 人际关系
-- =============================================

UPDATE `what_courses` SET 
    `title` = '人际关系分析框架：理清人际关系的核心要点',
    `subtitle` = '3课时 | 人际入门',
    `description` = '系统讲解人际关系题的答题框架，掌握定位身份、分析问题、提出对策的基本思路。'
WHERE `id` = 901;

UPDATE `what_courses` SET 
    `title` = '人际关系专题：与上级、同事、群众的沟通',
    `subtitle` = '5课时 | 人际深化',
    `description` = '分类讲解与领导、同事、下属、群众等不同对象的人际关系处理原则与沟通技巧。'
WHERE `id` = 902;

UPDATE `what_courses` SET 
    `title` = '人际关系真题实战：经典人际题目演练',
    `subtitle` = '4课时 | 人际实战',
    `description` = '通过经典人际关系真题进行实战演练，巩固人际沟通的答题方法，提升人际题作答能力。'
WHERE `id` = 903;

-- =============================================
-- 十七、面试 - 应急应变
-- =============================================

UPDATE `what_courses` SET 
    `title` = '应急应变分析框架：突发情况的应对思路',
    `subtitle` = '3课时 | 应急入门',
    `description` = '系统讲解应急应变题的答题框架，掌握稳定情绪、分析情况、采取措施、事后总结的四步法。'
WHERE `id` = 904;

UPDATE `what_courses` SET 
    `title` = '应急应变专题：各类突发情况的处置方法',
    `subtitle` = '5课时 | 应急深化',
    `description` = '分类讲解舆情危机、群体事件、安全事故、服务投诉等不同类型突发情况的处置原则与方法。'
WHERE `id` = 905;

UPDATE `what_courses` SET 
    `title` = '应急应变真题实战：高频应急题目演练',
    `subtitle` = '4课时 | 应急实战',
    `description` = '精选高频应急应变真题进行实战演练，巩固应急处置的答题方法，提升应急题作答能力。'
WHERE `id` = 906;

-- =============================================
-- 十八、面试 - 自我认知与情景模拟
-- =============================================

UPDATE `what_courses` SET 
    `title` = '自我认知题基础：展现真实自我的技巧',
    `subtitle` = '2课时 | 认知入门',
    `description` = '讲解自我认知类题目的答题方法，掌握如何通过具体事例展现个人特点、能力与价值观。'
WHERE `id` = 907;

UPDATE `what_courses` SET 
    `title` = '自我认知真题精讲：经典认知题目解析',
    `subtitle` = '2课时 | 认知实战',
    `description` = '通过经典自我认知真题进行解析与练习，掌握不同类型自我认知题的答题技巧。'
WHERE `id` = 908;

UPDATE `what_courses` SET 
    `title` = '情景模拟答题方法：身临其境展现沟通能力',
    `subtitle` = '2课时 | 模拟入门',
    `description` = '讲解情景模拟题的特点与答题方法，掌握如何通过角色扮演展现沟通协调能力。'
WHERE `id` = 909;

UPDATE `what_courses` SET 
    `title` = '情景模拟专题：高频模拟场景演练',
    `subtitle` = '2课时 | 模拟深化',
    `description` = '针对劝说、解释、安抚等高频情景模拟场景进行专项训练，提升情景模拟题的表现力。'
WHERE `id` = 910;

-- =============================================
-- 十九、面试 - 无领导小组讨论
-- =============================================

UPDATE `what_courses` SET 
    `title` = '开放式问题：发散思维与观点表达',
    `subtitle` = '2课时 | 题型入门',
    `description` = '讲解无领导小组讨论中开放式问题的特点与应对方法，掌握如何展现发散思维与表达能力。'
WHERE `id` = 911;

UPDATE `what_courses` SET 
    `title` = '两难式问题：权衡利弊与说服技巧',
    `subtitle` = '2课时 | 两难攻坚',
    `description` = '深入讲解两难式问题的分析方法，掌握如何在观点对立中进行权衡取舍并说服他人。'
WHERE `id` = 912;

UPDATE `what_courses` SET 
    `title` = '排序/资源分配问题：标准建立与协商技巧',
    `subtitle` = '2课时 | 排序技巧',
    `description` = '讲解排序类和资源分配类问题的解决思路，掌握建立排序标准和进行协商的方法。'
WHERE `id` = 913;

UPDATE `what_courses` SET 
    `title` = '无领导角色定位：找准自己的角色位置',
    `subtitle` = '1课时 | 角色认知',
    `description` = '分析无领导小组讨论中的常见角色，帮助考生根据自身特点选择合适的角色定位。'
WHERE `id` = 914;

UPDATE `what_courses` SET 
    `title` = '各角色策略：领导者、协调者、记录者攻略',
    `subtitle` = '2课时 | 角色策略',
    `description` = '分角色讲解领导者、推动者、协调者、记录者、计时员等不同角色的表现策略与技巧。'
WHERE `id` = 915;

UPDATE `what_courses` SET 
    `title` = '角色选择与转换：灵活应对讨论变化',
    `subtitle` = '2课时 | 灵活应对',
    `description` = '讲解在讨论过程中如何根据形势变化灵活选择和转换角色，实现最佳个人表现。'
WHERE `id` = 916;

UPDATE `what_courses` SET 
    `title` = '讨论技巧：推动讨论与达成共识',
    `subtitle` = '4课时 | 技巧汇总',
    `description` = '全面讲解无领导小组讨论的核心技巧，包括发言时机、观点表达、异议处理、推动共识等。'
WHERE `id` = 917;

-- =============================================
-- 二十、面试 - 礼仪形象
-- =============================================

UPDATE `what_courses` SET 
    `title` = '着装礼仪：打造专业得体的面试形象',
    `subtitle` = '2课时 | 形象基础',
    `description` = '讲解公务员面试的着装要求与搭配技巧，帮助考生打造专业、得体、大方的面试形象。'
WHERE `id` = 918;

UPDATE `what_courses` SET 
    `title` = '仪态举止：展现自信从容的精神面貌',
    `subtitle` = '3课时 | 仪态修炼',
    `description` = '系统讲解面试中的站姿、坐姿、手势、眼神等仪态要点，帮助考生展现自信从容的精神面貌。'
WHERE `id` = 919;

UPDATE `what_courses` SET 
    `title` = '语言表达：流畅自然的口头表达训练',
    `subtitle` = '2课时 | 表达提升',
    `description` = '针对语速、语调、停顿、重音等语言表达要素进行训练，帮助考生提升口头表达的流畅性与感染力。'
WHERE `id` = 920;

UPDATE `what_courses` SET 
    `title` = '心理调适：考前减压与现场应对',
    `subtitle` = '2课时 | 心理建设',
    `description` = '讲解考前心理调适的方法与现场应对紧张的技巧，帮助考生以最佳心态迎接面试挑战。'
WHERE `id` = 921;

-- =============================================
-- 二十一、申论 - 归纳概括
-- =============================================

UPDATE `what_courses` SET 
    `title` = '归纳概括基础：准确提炼材料要点',
    `subtitle` = '4课时 | 归纳入门',
    `description` = '系统讲解归纳概括题的审题技巧与答题方法，掌握从材料中准确提炼要点的核心能力。'
WHERE `id` = 735;

UPDATE `what_courses` SET 
    `title` = '归纳概括进阶：要点整合与语言优化',
    `subtitle` = '4课时 | 归纳提升',
    `description` = '深入讲解要点整合的方法与答案语言优化技巧，提升归纳概括题的得分能力。'
WHERE `id` = 736;

-- =============================================
-- 二十二、申论 - 综合分析
-- =============================================

UPDATE `what_courses` SET 
    `title` = '综合分析基础：理解题目本质，构建分析框架',
    `subtitle` = '4课时 | 分析入门',
    `description` = '系统讲解综合分析题的题型特点与答题框架，掌握解释型、评价型、启示型等不同类型的分析方法。'
WHERE `id` = 737;

UPDATE `what_courses` SET 
    `title` = '综合分析进阶：深度分析与逻辑表达',
    `subtitle` = '4课时 | 分析提升',
    `description` = '深入讲解综合分析题的深度分析技巧，掌握如何构建逻辑清晰、论证有力的答案。'
WHERE `id` = 738;

-- =============================================
-- 二十三、申论 - 贯彻执行
-- =============================================

UPDATE `what_courses` SET 
    `title` = '贯彻执行基础：把握公文写作核心要素',
    `subtitle` = '4课时 | 执行入门',
    `description` = '系统讲解贯彻执行题的审题要点与格式要求，掌握各类公文的写作规范与内容要求。'
WHERE `id` = 739;

UPDATE `what_courses` SET 
    `title` = '贯彻执行进阶：常见文种写作技巧',
    `subtitle` = '6课时 | 执行深化',
    `description` = '分类讲解倡议书、建议书、工作方案、调研报告等常见文种的写作要点与答题技巧。'
WHERE `id` = 740;

-- =============================================
-- 二十四、申论 - 提出对策
-- =============================================

UPDATE `what_courses` SET 
    `title` = '提出对策基础：问题分析与对策推导',
    `subtitle` = '3课时 | 对策入门',
    `description` = '系统讲解提出对策题的审题技巧与答题方法，掌握从问题分析推导对策的基本思路。'
WHERE `id` = 741;

UPDATE `what_courses` SET 
    `title` = '提出对策进阶：对策优化与全面展开',
    `subtitle` = '3课时 | 对策提升',
    `description` = '深入讲解对策的完善方法，掌握如何从主体、对象、措施等维度展开全面可行的对策。'
WHERE `id` = 742;

-- =============================================
-- 二十五、申论 - 大作文
-- =============================================

UPDATE `what_courses` SET 
    `title` = '申论写作基础：审题立意与谋篇布局',
    `subtitle` = '4课时 | 写作入门',
    `description` = '系统讲解申论大作文的审题立意方法，掌握议论文的基本结构与谋篇布局技巧。'
WHERE `id` = 743;

UPDATE `what_courses` SET 
    `title` = '申论写作进阶：论点论据与语言表达',
    `subtitle` = '4课时 | 写作提升',
    `description` = '深入讲解论点提炼、论据选用、论证方法等写作核心技巧，提升申论写作的说服力与文采。'
WHERE `id` = 744;

UPDATE `what_courses` SET 
    `title` = '申论写作高分：范文精讲与写作训练',
    `subtitle` = '4课时 | 写作突破',
    `description` = '通过历年高分范文精讲与写作实训，帮助考生突破写作瓶颈，实现申论大作文高分。'
WHERE `id` = 745;

-- =============================================
-- 二十六、行测 - 逻辑判断补充
-- =============================================

-- 翻译推理系列补充
UPDATE `what_courses` SET 
    `title` = '翻译规则：假言联言选言命题的逻辑转换',
    `subtitle` = '3课时 | 翻译基础',
    `description` = '系统讲解假言命题、联言命题、选言命题的逻辑翻译规则，掌握"如果...那么"、"且"、"或"等关键词的逻辑表达方式。'
WHERE `id` = 725;

UPDATE `what_courses` SET 
    `title` = '推理规则：逆否命题与德摩根定律',
    `subtitle` = '3课时 | 推理核心',
    `description` = '深入讲解逆否命题、德摩根定律、递推规则等核心推理规则，掌握从已知条件推导结论的逻辑方法。'
WHERE `id` = 726;

UPDATE `what_courses` SET 
    `title` = '综合应用：翻译推理真题实战',
    `subtitle` = '2课时 | 综合训练',
    `description` = '通过历年翻译推理真题进行实战训练，综合运用翻译规则和推理规则，全面提升翻译推理题的解题能力。'
WHERE `id` = 727;

-- 真假推理系列补充
UPDATE `what_courses` SET 
    `title` = '矛盾与反对关系：命题间的逻辑关系',
    `subtitle` = '4课时 | 关系核心',
    `description` = '系统讲解命题间的矛盾关系、上反对关系、下反对关系，掌握通过逻辑关系判断命题真假的方法。'
WHERE `id` = 728;

UPDATE `what_courses` SET 
    `title` = '真假推理综合：复杂条件下的真假判断',
    `subtitle` = '2课时 | 综合提升',
    `description` = '讲解复杂条件下的真假推理方法，掌握多条件、多人物、多命题情况下的真假判断技巧。'
WHERE `id` = 729;

-- 分析推理系列
UPDATE `what_courses` SET 
    `title` = '分析推理方法：列表法、假设法、代入法',
    `subtitle` = '6课时 | 方法全解',
    `description` = '全面讲解分析推理的核心方法，包括列表法、假设法、代入排除法等，攻克逻辑判断中的高难度题型。'
WHERE `id` = 730;

-- 论证推理系列补充
UPDATE `what_courses` SET 
    `title` = '论证结构分析：识别论点论据与推理过程',
    `subtitle` = '3课时 | 论证基础',
    `description` = '系统讲解论证的基本结构，掌握快速识别论点、论据、推理过程的方法，为论证分析打好基础。'
WHERE `id` = 731;

UPDATE `what_courses` SET 
    `title` = '加强方式：搭桥、补充论据、排除他因',
    `subtitle` = '3课时 | 加强技巧',
    `description` = '深入讲解加强论证的三大方式：搭桥法、补充论据法、排除他因法，掌握不同题型的加强策略。'
WHERE `id` = 732;

UPDATE `what_courses` SET 
    `title` = '削弱方式：否定论点、否定论据、切断联系',
    `subtitle` = '4课时 | 削弱技巧',
    `description` = '全面讲解削弱论证的方法，包括直接否定论点、否定论据可靠性、切断论据与论点联系等技巧。'
WHERE `id` = 733;

-- =============================================
-- 二十七、行测 - 资料分析补充
-- =============================================

-- 增长问题系列
UPDATE `what_courses` SET 
    `title` = '基础概念：增长率、增长量的定义与计算',
    `subtitle` = '2课时 | 概念入门',
    `description` = '系统讲解增长率、增长量的基本概念与计算公式，理解同比、环比等统计术语的含义。'
WHERE `id` = 734;

UPDATE `what_courses` SET 
    `title` = '年均增长：年均增长率的计算与比较',
    `subtitle` = '2课时 | 年均专题',
    `description` = '深入讲解年均增长率的计算方法与比较技巧，掌握多年数据情况下的增长分析方法。'
WHERE `id` = 735;

UPDATE `what_courses` SET 
    `title` = '增长率比较：大小比较与排序技巧',
    `subtitle` = '2课时 | 比较技巧',
    `description` = '讲解增长率大小比较的方法与技巧，掌握快速判断增长率大小关系的速算方法。'
WHERE `id` = 736;

UPDATE `what_courses` SET 
    `title` = '隔年增长：隔年增长率的计算公式',
    `subtitle` = '2课时 | 进阶专题',
    `description` = '讲解隔年增长率的计算公式与应用方法，掌握跨年度数据比较的计算技巧。'
WHERE `id` = 737;

-- 比重问题系列
UPDATE `what_courses` SET 
    `title` = '现期比重：比重的计算与简化',
    `subtitle` = '2课时 | 比重基础',
    `description` = '系统讲解现期比重的计算方法，掌握比重计算的简化技巧与速算方法。'
WHERE `id` = 738;

UPDATE `what_courses` SET 
    `title` = '基期比重：基期比重的推算方法',
    `subtitle` = '2课时 | 基期计算',
    `description` = '深入讲解基期比重的计算公式与推算方法，掌握已知现期数据求基期比重的技巧。'
WHERE `id` = 739;

UPDATE `what_courses` SET 
    `title` = '比重变化量：比重升降的计算与判断',
    `subtitle` = '2课时 | 变化分析',
    `description` = '讲解比重变化量的计算方法与判断技巧，掌握通过增长率判断比重升降的快速方法。'
WHERE `id` = 740;

UPDATE `what_courses` SET 
    `title` = '两期比重比较：比重变化方向的判断',
    `subtitle` = '2课时 | 比较技巧',
    `description` = '深入讲解两期比重比较的方法，掌握通过部分增长率与整体增长率的关系判断比重变化方向。'
WHERE `id` = 741;

-- 倍数与平均数系列
UPDATE `what_courses` SET 
    `title` = '倍数问题：现期倍数与基期倍数',
    `subtitle` = '4课时 | 倍数专题',
    `description` = '系统讲解倍数问题的计算方法，包括现期倍数、基期倍数、倍数变化等题型的解题技巧。'
WHERE `id` = 742;

UPDATE `what_courses` SET 
    `title` = '平均数问题：平均数的计算与比较',
    `subtitle` = '4课时 | 平均数专题',
    `description` = '全面讲解平均数的计算方法，包括现期平均数、基期平均数、平均数增长率等问题的解题技巧。'
WHERE `id` = 743;

-- 速算技巧系列
UPDATE `what_courses` SET 
    `title` = '截位直除：快速估算的核心技巧',
    `subtitle` = '3课时 | 速算核心',
    `description` = '系统讲解截位直除法的原理与应用，掌握通过保留有效数字快速计算的技巧。'
WHERE `id` = 744;

UPDATE `what_courses` SET 
    `title` = '特征数字：常用分数与百分数速算',
    `subtitle` = '3课时 | 速算技巧',
    `description` = '讲解特征数字法的应用，掌握1/2、1/3、1/4等常见分数与百分数的快速转换与计算。'
WHERE `id` = 745;

UPDATE `what_courses` SET 
    `title` = '有效数字：精确计算的简化方法',
    `subtitle` = '3课时 | 计算简化',
    `description` = '深入讲解有效数字法的原理与应用，掌握通过控制有效数字位数简化计算的技巧。'
WHERE `id` = 746;

UPDATE `what_courses` SET 
    `title` = '同位比较：快速比较大小的技巧',
    `subtitle` = '2课时 | 比较技巧',
    `description` = '讲解同位比较法的应用，掌握通过比较相同位置数字快速判断数值大小关系的方法。'
WHERE `id` = 747;

-- 材料类型系列
UPDATE `what_courses` SET 
    `title` = '文字材料：快速阅读与信息提取',
    `subtitle` = '3课时 | 材料阅读',
    `description` = '系统讲解文字型资料的阅读技巧，掌握快速定位关键数据、理解统计表述的方法。'
WHERE `id` = 748;

UPDATE `what_courses` SET 
    `title` = '表格材料：表格数据的快速分析',
    `subtitle` = '3课时 | 表格分析',
    `description` = '深入讲解表格型资料的分析方法，掌握快速理解表格结构、定位所需数据的技巧。'
WHERE `id` = 749;

UPDATE `what_courses` SET 
    `title` = '图形材料：图表数据的读取与计算',
    `subtitle` = '3课时 | 图形分析',
    `description` = '讲解柱状图、折线图、饼图等图形材料的分析方法，掌握从图形中快速获取数据的技巧。'
WHERE `id` = 750;

-- =============================================
-- 二十八、公共基础知识 - 政治补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '时政热点：国内外重大事件与政策解读',
    `subtitle` = '持续更新 | 时政必备',
    `description` = '持续更新国内外重大时事政治热点，深度解读重要政策与事件，帮助考生把握时政考试要点。'
WHERE `id` = 751;

UPDATE `what_courses` SET 
    `title` = '中国特色社会主义道路：从理论到实践',
    `subtitle` = '2课时 | 道路自信',
    `description` = '系统讲解中国特色社会主义道路的形成与发展，理解道路选择的历史必然性与现实意义。'
WHERE `id` = 752;

UPDATE `what_courses` SET 
    `title` = '中国特色社会主义理论体系：系统学习与理解',
    `subtitle` = '2课时 | 理论自信',
    `description` = '全面讲解中国特色社会主义理论体系的形成发展与核心内容，建立系统的理论知识框架。'
WHERE `id` = 753;

UPDATE `what_courses` SET 
    `title` = '习近平新时代中国特色社会主义思想：核心要义',
    `subtitle` = '2课时 | 思想引领',
    `description` = '深入学习习近平新时代中国特色社会主义思想的核心要义与实践要求，把握新时代的指导思想。'
WHERE `id` = 754;

UPDATE `what_courses` SET 
    `title` = '党的发展历程：从建党到新时代',
    `subtitle` = '2课时 | 党史学习',
    `description` = '系统梳理中国共产党的发展历程，了解党在各个历史时期的重大决策与历史贡献。'
WHERE `id` = 755;

UPDATE `what_courses` SET 
    `title` = '重要会议与决议：党的历次重要会议',
    `subtitle` = '2课时 | 会议要点',
    `description` = '讲解党的历次重要会议的主要内容与历史意义，掌握重要会议的时间、地点、主题等考点。'
WHERE `id` = 756;

UPDATE `what_courses` SET 
    `title` = '党的建设：新时代党的建设总要求',
    `subtitle` = '2课时 | 建设重点',
    `description` = '深入学习新时代党的建设总要求，理解政治建设、思想建设、组织建设等方面的核心内容。'
WHERE `id` = 757;

-- =============================================
-- 二十九、公共基础知识 - 法律补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '宪法：国家根本大法的核心内容',
    `subtitle` = '4课时 | 宪法基础',
    `description` = '系统讲解宪法的基本原则、公民基本权利与义务、国家机构等核心内容，打牢宪法基础。'
WHERE `id` = 758;

UPDATE `what_courses` SET 
    `title` = '民法典：民事法律关系全解析',
    `subtitle` = '6课时 | 民法核心',
    `description` = '全面讲解《民法典》的主要内容，包括总则、物权、合同、人格权、婚姻家庭、继承、侵权责任等编。'
WHERE `id` = 759;

UPDATE `what_courses` SET 
    `title` = '刑法：犯罪与刑罚的基本理论',
    `subtitle` = '4课时 | 刑法基础',
    `description` = '系统讲解刑法的基本原则、犯罪构成、刑罚制度等核心内容，掌握常见罪名的构成要件。'
WHERE `id` = 760;

UPDATE `what_courses` SET 
    `title` = '行政法：依法行政与行政救济',
    `subtitle` = '4课时 | 行政法核心',
    `description` = '深入讲解行政法的基本原则、行政行为、行政许可、行政处罚、行政复议与行政诉讼等重点内容。'
WHERE `id` = 761;

UPDATE `what_courses` SET 
    `title` = '经济常识：市场经济与宏观调控',
    `subtitle` = '4课时 | 经济基础',
    `description` = '系统讲解市场经济基本原理、宏观经济调控手段、财政与货币政策等经济常识要点。'
WHERE `id` = 762;

-- =============================================
-- 三十、公共基础知识 - 历史地理科技
-- =============================================

UPDATE `what_courses` SET 
    `title` = '中国古代史：从远古到清朝的历史脉络',
    `subtitle` = '2课时 | 古代史',
    `description` = '系统梳理中国古代历史的发展脉络，掌握各朝代的政治制度、重大事件、文化成就等考点。'
WHERE `id` = 763;

UPDATE `what_courses` SET 
    `title` = '中国近现代史：从鸦片战争到新中国成立',
    `subtitle` = '2课时 | 近现代史',
    `description` = '深入讲解中国近现代史的重要历史事件与人物，理解中国从屈辱走向复兴的历史进程。'
WHERE `id` = 764;

UPDATE `what_courses` SET 
    `title` = '世界史：世界历史的重要阶段与事件',
    `subtitle` = '2课时 | 世界史',
    `description` = '概述世界历史的重要阶段，掌握世界历史上的重大事件、重要人物与历史影响。'
WHERE `id` = 765;

UPDATE `what_courses` SET 
    `title` = '地理常识：中国地理与世界地理',
    `subtitle` = '4课时 | 地理知识',
    `description` = '系统讲解中国地理与世界地理的基础知识，包括地形地貌、气候类型、自然资源等考点。'
WHERE `id` = 766;

UPDATE `what_courses` SET 
    `title` = '科技常识：科技发展与前沿成果',
    `subtitle` = '4课时 | 科技热点',
    `description` = '讲解我国重大科技成就与前沿科技动态，包括航天、通信、生物等领域的科技进展。'
WHERE `id` = 767;

UPDATE `what_courses` SET 
    `title` = '文学常识：中外文学精粹',
    `subtitle` = '2课时 | 文学素养',
    `description` = '系统梳理中外文学经典作品与作家，掌握文学流派、重要作品、名句名篇等文学常识。'
WHERE `id` = 768;

-- =============================================
-- 三十一、申论 - 基础入门
-- =============================================

UPDATE `what_courses` SET 
    `title` = '申论考试概述：题型特点与评分标准',
    `subtitle` = '2课时 | 考试认知',
    `description` = '全面介绍申论考试的基本情况，包括考试形式、题型设置、评分标准等，帮助考生建立申论整体认知。'
WHERE `id` = 769;

UPDATE `what_courses` SET 
    `title` = '申论作答方法论：核心思维与答题技巧',
    `subtitle` = '2课时 | 方法论',
    `description` = '讲解申论作答的核心思维方法，包括材料分析、要点提取、答案组织等基本技巧。'
WHERE `id` = 770;

UPDATE `what_courses` SET 
    `title` = '申论材料类型解读：不同材料的阅读策略',
    `subtitle` = '2课时 | 材料分析',
    `description` = '分类讲解案例型、数据型、观点型等不同材料类型的特点与阅读策略，提升材料分析能力。'
WHERE `id` = 771;

-- =============================================
-- 三十二、申论 - 归纳概括补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '归纳概括基础方法：要点提取与整合',
    `subtitle` = '3课时 | 方法入门',
    `description` = '系统讲解归纳概括题的审题技巧与答题方法，掌握从材料中准确提取和整合要点的能力。'
WHERE `id` = 772;

UPDATE `what_courses` SET 
    `title` = '归纳概括题型分类：问题、原因、对策、影响',
    `subtitle` = '4课时 | 题型分类',
    `description` = '分类讲解归纳概括题的常见题型，包括概括问题、原因、对策、影响等不同类型的答题要点。'
WHERE `id` = 773;

UPDATE `what_courses` SET 
    `title` = '归纳概括进阶：要点优化与语言表达',
    `subtitle` = '3课时 | 进阶提升',
    `description` = '深入讲解要点整合的优化方法与答案语言表达技巧，提升归纳概括题的得分能力。'
WHERE `id` = 774;

UPDATE `what_courses` SET 
    `title` = '国考真题实战：国考归纳概括真题精讲',
    `subtitle` = '4课时 | 国考实战',
    `description` = '精选近年国考归纳概括真题进行深度解析与实战训练，掌握国考命题特点与答题技巧。'
WHERE `id` = 775;

UPDATE `what_courses` SET 
    `title` = '省考真题实战：省考归纳概括真题精讲',
    `subtitle` = '4课时 | 省考实战',
    `description` = '精选各省省考归纳概括真题进行实战训练，了解不同地区的命题风格与答题要求。'
WHERE `id` = 776;

-- =============================================
-- 三十三、申论 - 提出对策补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '直接对策来源：材料中的对策提取',
    `subtitle` = '4课时 | 对策提取',
    `description` = '系统讲解从材料中直接提取对策的方法，包括经验做法、建议意见、反面教训等对策来源。'
WHERE `id` = 777;

UPDATE `what_courses` SET 
    `title` = '对策完善与优化：让对策更具可操作性',
    `subtitle` = '4课时 | 对策优化',
    `description` = '深入讲解对策的完善与优化方法，掌握如何让对策更加具体、可行、有针对性。'
WHERE `id` = 778;

UPDATE `what_courses` SET 
    `title` = '常用对策维度：主体、对象、措施分析',
    `subtitle` = '4课时 | 维度拓展',
    `description` = '讲解从主体、对象、措施等不同维度展开对策的方法，提升对策的全面性与系统性。'
WHERE `id` = 779;

UPDATE `what_courses` SET 
    `title` = '对策框架综合应用：高分对策的构建',
    `subtitle` = '4课时 | 综合训练',
    `description` = '通过真题训练综合运用各种对策方法，掌握构建高分对策答案的核心技巧。'
WHERE `id` = 780;

-- =============================================
-- 三十四、申论 - 综合分析补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '词句理解分析：深度解读关键表述',
    `subtitle` = '5课时 | 解释分析',
    `description` = '系统讲解词句理解类综合分析题的答题方法，掌握解读材料中关键词句含义的技巧。'
WHERE `id` = 781;

UPDATE `what_courses` SET 
    `title` = '观点评价分析：多角度评价与论证',
    `subtitle` = '5课时 | 评价分析',
    `description` = '深入讲解观点评价类综合分析题的答题框架，掌握从多角度分析评价观点的方法。'
WHERE `id` = 782;

UPDATE `what_courses` SET 
    `title` = '原因/影响分析：深层次的因果分析',
    `subtitle` = '4课时 | 因果分析',
    `description` = '讲解原因分析与影响分析类综合分析题的答题方法，掌握深层次因果关系的分析技巧。'
WHERE `id` = 783;

UPDATE `what_courses` SET 
    `title` = '比较分析与启示分析：异同比较与经验提炼',
    `subtitle` = '4课时 | 比较启示',
    `description` = '系统讲解比较分析与启示分析类题目的答题方法，掌握异同比较与经验提炼的技巧。'
WHERE `id` = 784;

-- =============================================
-- 三十五、申论 - 贯彻执行补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '公文基础格式：格式规范与行文要求',
    `subtitle` = '3课时 | 格式入门',
    `description` = '系统讲解申论贯彻执行题的格式要求，掌握标题、称谓、正文、落款等格式要素的写法。'
WHERE `id` = 785;

UPDATE `what_courses` SET 
    `title` = '各类公文格式对比：不同文种的格式差异',
    `subtitle` = '3课时 | 格式对比',
    `description` = '对比讲解不同公文文种的格式差异，掌握各类公文的特定格式要求与写作规范。'
WHERE `id` = 786;

UPDATE `what_courses` SET 
    `title` = '讲话稿：演讲类公文的写作技巧',
    `subtitle` = '4课时 | 讲话稿',
    `description` = '深入讲解讲话稿的写作方法，包括开场、主体、结尾的写作技巧与语言风格要求。'
WHERE `id` = 787;

UPDATE `what_courses` SET 
    `title` = '宣传倡议类：倡议书、宣传稿的写作',
    `subtitle` = '4课时 | 宣传文书',
    `description` = '讲解倡议书、宣传稿等宣传类公文的写作方法，掌握宣传动员类文书的语言特点与内容要求。'
WHERE `id` = 788;

UPDATE `what_courses` SET 
    `title` = '报告总结类：工作报告、总结的写作',
    `subtitle` = '5课时 | 报告总结',
    `description` = '系统讲解工作报告、工作总结等报告类公文的写作方法，掌握汇报工作的结构与内容要点。'
WHERE `id` = 789;

UPDATE `what_courses` SET 
    `title` = '方案计划类：工作方案、实施计划的写作',
    `subtitle` = '5课时 | 方案计划',
    `description` = '深入讲解工作方案、实施计划等计划类公文的写作方法，掌握方案的结构与内容要素。'
WHERE `id` = 790;

UPDATE `what_courses` SET 
    `title` = '新闻传媒类：新闻稿、简报的写作',
    `subtitle` = '4课时 | 新闻简报',
    `description` = '讲解新闻稿、简报等新闻传媒类文书的写作方法，掌握新闻类文体的写作特点与要求。'
WHERE `id` = 791;

UPDATE `what_courses` SET 
    `title` = '其他文书：编者按、短评、回复等',
    `subtitle` = '4课时 | 其他文书',
    `description` = '讲解编者按、短评、回复信等其他类型公文的写作方法，全面覆盖贯彻执行题的文种类型。'
WHERE `id` = 792;

-- =============================================
-- 三十六、申论 - 大作文补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '审题立意基础：准确把握写作要求',
    `subtitle` = '2课时 | 审题基础',
    `description` = '系统讲解申论大作文的审题方法，掌握从题目要求和材料中准确把握写作主题与方向。'
WHERE `id` = 793;

UPDATE `what_courses` SET 
    `title` = '立意提升技巧：深化主题与升华立意',
    `subtitle` = '2课时 | 立意提升',
    `description` = '深入讲解立意的深化与升华方法，掌握如何让文章立意更有深度、更有高度。'
WHERE `id` = 794;

UPDATE `what_courses` SET 
    `title` = '立意常见误区：避免跑题偏题',
    `subtitle` = '2课时 | 误区规避',
    `description` = '分析申论写作中的常见立意误区，帮助考生避免跑题、偏题、立意浅等问题。'
WHERE `id` = 795;

UPDATE `what_courses` SET 
    `title` = '标题拟定：吸引眼球的标题技巧',
    `subtitle` = '3课时 | 标题写作',
    `description` = '讲解申论大作文标题的拟定方法，掌握如何拟写准确、简洁、有吸引力的标题。'
WHERE `id` = 796;

UPDATE `what_courses` SET 
    `title` = '常用开头方式：引人入胜的开篇方法',
    `subtitle` = '2课时 | 开头基础',
    `description` = '系统讲解申论大作文的常用开头方式，包括概括式、引用式、设问式等开头方法。'
WHERE `id` = 797;

UPDATE `what_courses` SET 
    `title` = '进阶开头方式：出彩的开篇技巧',
    `subtitle` = '2课时 | 开头进阶',
    `description` = '深入讲解申论大作文的进阶开头技巧，掌握如何写出令人眼前一亮的精彩开头。'
WHERE `id` = 798;

UPDATE `what_courses` SET 
    `title` = '开头写作实战：真题开头演练',
    `subtitle` = '1课时 | 开头实战',
    `description` = '通过真题进行开头写作实战训练，巩固各种开头技巧的运用方法。'
WHERE `id` = 799;

UPDATE `what_courses` SET 
    `title` = '分论点设置：有层次的论点布局',
    `subtitle` = '2课时 | 论点设置',
    `description` = '讲解申论大作文分论点的设置方法，掌握如何布局有层次、有逻辑的分论点结构。'
WHERE `id` = 800;

UPDATE `what_courses` SET 
    `title` = '论证方法：增强说服力的论证技巧',
    `subtitle` = '3课时 | 论证方法',
    `description` = '系统讲解申论大作文的论证方法，包括举例论证、对比论证、因果论证等核心技巧。'
WHERE `id` = 801;

UPDATE `what_courses` SET 
    `title` = '论证段落写作：段落的完整结构',
    `subtitle` = '3课时 | 段落写作',
    `description` = '深入讲解论证段落的写作方法，掌握"分论点+阐释+论据+分析+回扣"的段落结构。'
WHERE `id` = 802;

UPDATE `what_courses` SET 
    `title` = '结尾写法：收束有力的结尾技巧',
    `subtitle` = '3课时 | 结尾写作',
    `description` = '讲解申论大作文的结尾写作方法，掌握如何写出总结全文、升华主题、收束有力的结尾。'
WHERE `id` = 803;

UPDATE `what_courses` SET 
    `title` = '国考高分范文：国考优秀范文精讲',
    `subtitle` = '2课时 | 国考范文',
    `description` = '精选国考高分范文进行深度解析，学习优秀范文的写作思路与表达技巧。'
WHERE `id` = 804;

UPDATE `what_courses` SET 
    `title` = '省考高分范文：省考优秀范文精讲',
    `subtitle` = '2课时 | 省考范文',
    `description` = '精选省考高分范文进行深度解析，了解不同省份的写作风格与评分偏好。'
WHERE `id` = 805;

UPDATE `what_courses` SET 
    `title` = '范文写作技巧总结：高分写作的核心要素',
    `subtitle` = '1课时 | 技巧总结',
    `description` = '总结申论大作文高分写作的核心要素，提炼可复用的写作技巧与方法。'
WHERE `id` = 806;

-- =============================================
-- 三十七、公共基础知识 - 哲学与政治补充
-- =============================================

UPDATE `what_courses` SET 
    `title` = '唯物论：物质与意识的关系',
    `subtitle` = '2课时 | 哲学基础',
    `description` = '系统讲解唯物论的核心内容，理解物质与意识的辩证关系，掌握世界的物质统一性原理。'
WHERE `id` = 846;

UPDATE `what_courses` SET 
    `title` = '辩证法：对立统一与发展变化',
    `subtitle` = '2课时 | 辩证思维',
    `description` = '深入讲解唯物辩证法的基本规律，包括对立统一规律、质量互变规律、否定之否定规律。'
WHERE `id` = 847;

UPDATE `what_courses` SET 
    `title` = '认识论：实践与认识的关系',
    `subtitle` = '2课时 | 认识论',
    `description` = '讲解马克思主义认识论的核心内容，理解实践是认识的基础，掌握认识的辩证发展过程。'
WHERE `id` = 848;

UPDATE `what_courses` SET 
    `title` = '唯物史观：社会发展的基本规律',
    `subtitle` = '2课时 | 历史唯物',
    `description` = '系统讲解历史唯物主义的基本原理，理解生产力与生产关系、经济基础与上层建筑的关系。'
WHERE `id` = 849;

UPDATE `what_courses` SET 
    `title` = '毛泽东思想：中国革命与建设的指导思想',
    `subtitle` = '4课时 | 毛泽东思想',
    `description` = '全面讲解毛泽东思想的形成发展与主要内容，理解毛泽东思想的科学体系与活的灵魂。'
WHERE `id` = 850;

UPDATE `what_courses` SET 
    `title` = '邓小平理论：改革开放的理论指南',
    `subtitle` = '2课时 | 邓小平理论',
    `description` = '系统讲解邓小平理论的核心内容，理解社会主义初级阶段理论、社会主义市场经济理论等。'
WHERE `id` = 851;

UPDATE `what_courses` SET 
    `title` = '三个代表重要思想与科学发展观：理论创新',
    `subtitle` = '2课时 | 理论发展',
    `description` = '讲解"三个代表"重要思想与科学发展观的核心内容与时代背景，理解理论创新的历史意义。'
WHERE `id` = 852;

UPDATE `what_courses` SET 
    `title` = '习近平新时代中国特色社会主义思想：新时代指导',
    `subtitle` = '2课时 | 新时代思想',
    `description` = '深入学习习近平新时代中国特色社会主义思想的核心要义，把握新时代的历史方位与使命任务。'
WHERE `id` = 853;

UPDATE `what_courses` SET 
    `title` = '党的发展历程：百年奋斗与历史经验',
    `subtitle` = '2课时 | 党史精华',
    `description` = '系统梳理中国共产党的百年奋斗历程，学习党的历史经验与优良传统。'
WHERE `id` = 854;

UPDATE `what_courses` SET 
    `title` = '改革开放新时期：中国特色社会主义的开创',
    `subtitle` = '2课时 | 改革开放',
    `description` = '讲解改革开放的历史进程与伟大成就，理解中国特色社会主义道路的开创与发展。'
WHERE `id` = 855;

UPDATE `what_courses` SET 
    `title` = '党的重要会议：历次党代会的核心内容',
    `subtitle` = '2课时 | 会议要点',
    `description` = '系统讲解党的历次全国代表大会的主要内容与历史意义，掌握重要会议的核心考点。'
WHERE `id` = 856;

UPDATE `what_courses` SET 
    `title` = '时政热点：最新时事政治解读',
    `subtitle` = '4课时 | 时政热点',
    `description` = '持续更新最新时事政治热点，深度解读国内外重要事件与政策，助力时政备考。'
WHERE `id` = 857;

-- =============================================
-- 三十八、公共基础知识 - 法律补充（详细）
-- =============================================

UPDATE `what_courses` SET 
    `title` = '法理学：法的基本概念与原理',
    `subtitle` = '2课时 | 法理基础',
    `description` = '系统讲解法的概念、特征、渊源、效力等基本理论，理解法律体系的基本框架。'
WHERE `id` = 858;

UPDATE `what_courses` SET 
    `title` = '宪法基本理论：宪法的地位与作用',
    `subtitle` = '2课时 | 宪法理论',
    `description` = '讲解宪法的基本原则、宪法的地位与作用，理解宪法作为根本法的权威性。'
WHERE `id` = 859;

UPDATE `what_courses` SET 
    `title` = '公民权利与义务：基本权利的保障',
    `subtitle` = '2课时 | 公民权利',
    `description` = '深入讲解公民的基本权利与基本义务，掌握各类权利的内容与保障机制。'
WHERE `id` = 860;

UPDATE `what_courses` SET 
    `title` = '国家机构：国家机关的设置与职权',
    `subtitle` = '2课时 | 国家机构',
    `description` = '系统讲解我国国家机构的设置与职权，包括全国人大、国务院、法院、检察院等。'
WHERE `id` = 861;

UPDATE `what_courses` SET 
    `title` = '民法总则：民事法律关系的基本规则',
    `subtitle` = '2课时 | 民法总则',
    `description` = '讲解民法总则的核心内容，包括民事主体、民事法律行为、代理、时效等基本制度。'
WHERE `id` = 862;

UPDATE `what_courses` SET 
    `title` = '物权编：物权的种类与保护',
    `subtitle` = '2课时 | 物权法',
    `description` = '系统讲解物权的种类与内容，包括所有权、用益物权、担保物权的规则与保护。'
WHERE `id` = 863;

UPDATE `what_courses` SET 
    `title` = '合同编：合同的订立与履行',
    `subtitle` = '2课时 | 合同法',
    `description` = '深入讲解合同的订立、效力、履行、变更、解除等核心内容，掌握常见合同类型的规则。'
WHERE `id` = 864;

UPDATE `what_courses` SET 
    `title` = '人格权与侵权责任：权利保护与救济',
    `subtitle` = '2课时 | 人格权侵权',
    `description` = '讲解人格权的种类与保护，以及侵权责任的构成与承担方式，掌握权利救济的法律途径。'
WHERE `id` = 865;

UPDATE `what_courses` SET 
    `title` = '婚姻家庭与继承：家事法律关系',
    `subtitle` = '2课时 | 婚姻继承',
    `description` = '系统讲解婚姻家庭法与继承法的核心内容，掌握结婚、离婚、继承等法律关系的规则。'
WHERE `id` = 866;

UPDATE `what_courses` SET 
    `title` = '刑法总则：犯罪与刑罚的基本理论',
    `subtitle` = '2课时 | 刑法总则',
    `description` = '讲解刑法的基本原则、犯罪构成、刑罚种类等核心内容，打好刑法学习基础。'
WHERE `id` = 867;

UPDATE `what_courses` SET 
    `title` = '刑法分则常考罪名：高频罪名深度解析',
    `subtitle` = '4课时 | 常考罪名',
    `description` = '深入讲解公考常考的罪名，包括侵犯人身权利、财产犯罪、渎职罪等高频考点。'
WHERE `id` = 868;

UPDATE `what_courses` SET 
    `title` = '行政法基础：行政法的基本原则',
    `subtitle` = '2课时 | 行政法基础',
    `description` = '系统讲解行政法的基本原则，包括依法行政原则、合理行政原则、程序正当原则等。'
WHERE `id` = 869;

UPDATE `what_courses` SET 
    `title` = '行政行为：行政许可、处罚、强制',
    `subtitle` = '2课时 | 行政行为',
    `description` = '深入讲解行政许可、行政处罚、行政强制等具体行政行为的概念、种类与程序。'
WHERE `id` = 870;

UPDATE `what_courses` SET 
    `title` = '行政救济：复议与诉讼的程序',
    `subtitle` = '2课时 | 行政救济',
    `description` = '讲解行政复议与行政诉讼的受案范围、程序要求、判决类型等，掌握行政救济的法律途径。'
WHERE `id` = 871;

UPDATE `what_courses` SET 
    `title` = '其他法律：劳动法、知识产权法等',
    `subtitle` = '4课时 | 其他法律',
    `description` = '讲解劳动法、劳动合同法、知识产权法、消费者权益保护法等其他常考法律的核心内容。'
WHERE `id` = 872;

-- =============================================
-- 三十九、新增课程 - 冲刺提分系列
-- =============================================

-- 行测冲刺课程
REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1001, 546, '言语理解冲刺班：考前30天快速提分', '15课时 | 冲刺提分', '考前冲刺阶段言语理解专项训练，精选高频考点与典型题目，快速巩固答题技巧，实现最后阶段的快速提分。', 'article', 'advanced', 15, 0, 100),
(1002, 559, '数量关系冲刺班：高频题型突破', '12课时 | 冲刺提分', '针对数量关系高频题型进行集中突破，精讲高分技巧与速算方法，帮助考生在有限时间内最大化得分。', 'article', 'advanced', 12, 0, 100),
(1003, 573, '判断推理冲刺班：逻辑思维强化', '15课时 | 冲刺提分', '考前冲刺阶段判断推理专项强化，系统梳理各题型解题套路，提升逻辑思维能力与答题速度。', 'article', 'advanced', 15, 0, 100),
(1004, 593, '资料分析冲刺班：速算技巧强化', '10课时 | 冲刺提分', '资料分析考前冲刺训练，强化速算技巧应用，提升计算速度与准确率，确保资料分析不丢分。', 'article', 'advanced', 10, 0, 100);

-- 申论冲刺课程
REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1005, 624, '申论冲刺班：小题满分攻略', '12课时 | 冲刺提分', '申论小题（归纳概括、综合分析、提出对策、贯彻执行）的考前冲刺训练，力争小题满分。', 'article', 'advanced', 12, 0, 100),
(1006, 651, '大作文冲刺班：高分写作模板', '8课时 | 冲刺提分', '申论大作文考前冲刺，提炼高分写作模板与万能素材，帮助考生在最短时间内写出高分作文。', 'article', 'advanced', 8, 0, 100);

-- 面试冲刺课程
REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1007, 716, '面试冲刺班：综合分析高分突破', '8课时 | 冲刺提分', '面试综合分析题的考前强化训练，精讲热点话题与答题框架，提升综合分析题的答题深度与广度。', 'article', 'advanced', 8, 0, 100),
(1008, 724, '面试冲刺班：组织计划全面提升', '6课时 | 冲刺提分', '组织计划类题目的考前集训，覆盖各类活动的组织要点，提升答题的完整性与针对性。', 'article', 'advanced', 6, 0, 100),
(1009, 731, '面试冲刺班：人际应急实战演练', '6课时 | 冲刺提分', '人际关系与应急应变的实战演练，通过大量练习提升现场应对能力与表达流畅度。', 'article', 'advanced', 6, 0, 100);

-- =============================================
-- 四十、新增课程 - 真题精讲系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1010, 546, '国考言语真题精讲：近五年真题深度解析', '20课时 | 真题精讲', '精选近五年国考言语理解真题进行深度解析，总结命题规律与解题技巧，帮助考生把握国考命题趋势。', 'article', 'intermediate', 20, 0, 110),
(1011, 559, '国考数量真题精讲：高难度真题攻克', '15课时 | 真题精讲', '精选国考数量关系高难度真题进行深度讲解，传授高效解题方法，提升考生攻克难题的能力。', 'article', 'intermediate', 15, 0, 110),
(1012, 573, '国考判断真题精讲：逻辑推理真题突破', '20课时 | 真题精讲', '系统讲解近五年国考判断推理真题，分析命题特点与难度变化，掌握各题型的解题规律。', 'article', 'intermediate', 20, 0, 110),
(1013, 593, '国考资料真题精讲：资料分析全真演练', '12课时 | 真题精讲', '精选国考资料分析真题进行全真演练，提升阅读速度与计算准确率，确保资料分析高分。', 'article', 'intermediate', 12, 0, 110),
(1014, 624, '国考申论真题精讲：历年真题深度解析', '20课时 | 真题精讲', '系统讲解近五年国考申论真题，分析命题意图与评分要点，传授高分答题技巧。', 'article', 'intermediate', 20, 0, 110),
(1015, 716, '国考面试真题精讲：结构化面试真题演练', '15课时 | 真题精讲', '精选国考面试结构化真题进行深度解析与实战演练，提升面试答题的针对性与专业性。', 'article', 'intermediate', 15, 0, 110);

-- =============================================
-- 四十一、新增课程 - 专项突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1016, 546, '病句辨析专项：语法错误一网打尽', '6课时 | 专项突破', '系统讲解病句的六大类型（语序不当、搭配不当、成分残缺、结构混乱、表意不明、不合逻辑），掌握病句辨析的核心方法。', 'article', 'intermediate', 6, 0, 50),
(1017, 546, '歧义句辨析专项：语义理解的精准把握', '4课时 | 专项突破', '深入讲解歧义句的产生原因与辨析方法，提升对语言表达准确性的敏感度。', 'article', 'intermediate', 4, 0, 51),
(1018, 559, '极值问题专项：最大最小值的求解', '5课时 | 专项突破', '系统讲解数学运算中极值问题的解题方法，包括构造极端情况、边界分析等技巧。', 'article', 'intermediate', 5, 0, 50),
(1019, 559, '统筹问题专项：多变量的优化决策', '4课时 | 专项突破', '讲解统筹类问题的分析方法与解题技巧，掌握货物装载、任务分配等典型问题的解法。', 'article', 'intermediate', 4, 0, 51),
(1020, 573, '朴素逻辑专项：复杂条件的推理', '6课时 | 专项突破', '深入讲解朴素逻辑题的解题方法，掌握多条件、多对象情况下的逻辑推理技巧。', 'article', 'intermediate', 6, 0, 50),
(1021, 573, '图形推理创新题专项：新题型应对策略', '4课时 | 专项突破', '讲解图形推理中的创新题型与应对策略，提升考生面对新题型的分析与解答能力。', 'article', 'intermediate', 4, 0, 51);

-- =============================================
-- 四十二、新增课程 - 素材积累系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1022, 651, '申论素材积累：政策文件金句精选', '5课时 | 素材积累', '精选近年重要政策文件中的经典表述与金句，帮助考生丰富申论写作的语言素材。', 'article', 'basic', 5, 0, 60),
(1023, 651, '申论素材积累：典型案例与事例', '5课时 | 素材积累', '收集整理各领域的典型案例与事例，为申论写作提供有力的论据支撑。', 'article', 'basic', 5, 0, 61),
(1024, 651, '申论素材积累：名言警句与古诗词', '4课时 | 素材积累', '精选与公考主题相关的名言警句与古诗词，提升申论写作的文采与深度。', 'article', 'basic', 4, 0, 62),
(1025, 716, '面试素材积累：时政热点深度分析', '6课时 | 素材积累', '深度分析近期时政热点问题，提供面试综合分析题的素材积累与答题思路。', 'article', 'basic', 6, 0, 60),
(1026, 716, '面试素材积累：典型事例与故事', '4课时 | 素材积累', '收集整理面试答题可用的典型事例与故事，丰富面试答题的内容与亮点。', 'article', 'basic', 4, 0, 61);

-- =============================================
-- 四十三、新增课程 - 考前模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1027, 1, '行测全真模拟：考前模拟测试（一）', '3课时 | 考前模拟', '高仿真行测模拟试卷，完整还原考试题型与难度，帮助考生熟悉考试节奏与时间分配。', 'article', 'advanced', 3, 0, 120),
(1028, 1, '行测全真模拟：考前模拟测试（二）', '3课时 | 考前模拟', '第二套高仿真行测模拟试卷，查漏补缺，进一步巩固各模块的答题技巧。', 'article', 'advanced', 3, 0, 121),
(1029, 624, '申论全真模拟：考前模拟测试（一）', '3课时 | 考前模拟', '高仿真申论模拟试卷，涵盖各类题型，帮助考生检验备考效果与答题水平。', 'article', 'advanced', 3, 0, 120),
(1030, 624, '申论全真模拟：考前模拟测试（二）', '3课时 | 考前模拟', '第二套高仿真申论模拟试卷，进一步提升申论各题型的作答能力。', 'article', 'advanced', 3, 0, 121),
(1031, 716, '面试全真模拟：考前模拟演练（一）', '2课时 | 考前模拟', '全真模拟面试流程，帮助考生熟悉面试环境，提升现场发挥能力。', 'article', 'advanced', 2, 0, 120),
(1032, 716, '面试全真模拟：考前模拟演练（二）', '2课时 | 考前模拟', '第二次全真模拟面试，进一步巩固答题技巧，增强面试信心。', 'article', 'advanced', 2, 0, 121);

-- =============================================
-- 四十四、新增课程 - 省考专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1033, 546, '广东省考言语特训：粤考命题规律解析', '12课时 | 省考专项', '针对广东省考言语理解的命题特点进行专项训练，分析粤考独特题型与解题策略。', 'article', 'intermediate', 12, 0, 130),
(1034, 546, '江苏省考言语特训：苏考高频考点精讲', '12课时 | 省考专项', '针对江苏省考言语理解进行专项突破，掌握江苏省考特有的考查方式与命题规律。', 'article', 'intermediate', 12, 0, 131),
(1035, 546, '浙江省考言语特训：浙考阅读理解攻略', '12课时 | 省考专项', '聚焦浙江省考言语理解的命题特点，强化篇章阅读与语句理解能力。', 'article', 'intermediate', 12, 0, 132),
(1036, 546, '山东省考言语特训：鲁考言语高分策略', '12课时 | 省考专项', '针对山东省考言语理解进行系统训练，掌握鲁考言语的答题技巧与提分策略。', 'article', 'intermediate', 12, 0, 133),
(1037, 559, '江苏省考数量特训：数字推理专项突破', '10课时 | 省考专项', '针对江苏省考独有的数字推理题型进行专项训练，攻克数字推理难关。', 'article', 'intermediate', 10, 0, 130),
(1038, 573, '国考判断推理难题攻坚：高难度真题精讲', '15课时 | 难题攻坚', '精选国考判断推理历年高难度真题，传授攻克难题的思维方法与解题技巧。', 'article', 'advanced', 15, 0, 135),
(1039, 593, '联考资料分析特训：多省联考命题分析', '10课时 | 省考专项', '针对多省公务员联考资料分析的命题特点进行专项训练，提升联考资料分析得分率。', 'article', 'intermediate', 10, 0, 130);

-- =============================================
-- 四十五、新增课程 - 零基础入门系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1040, 546, '言语理解零基础入门：从零开始学言语', '10课时 | 零基础', '专为零基础考生设计的言语理解入门课程，系统介绍言语题型与基本解题方法，帮助考生快速入门。', 'article', 'basic', 10, 1, 1),
(1041, 559, '数量关系零基础入门：数学基础与解题思维', '10课时 | 零基础', '专为数学基础薄弱考生设计的入门课程，从基础数学知识讲起，建立数量关系的解题思维。', 'article', 'basic', 10, 1, 1),
(1042, 573, '判断推理零基础入门：逻辑思维训练起步', '10课时 | 零基础', '专为零基础考生设计的判断推理入门课程，培养基础逻辑思维能力，了解各类题型特点。', 'article', 'basic', 10, 1, 1),
(1043, 593, '资料分析零基础入门：统计基础与阅读技巧', '8课时 | 零基础', '专为零基础考生设计的资料分析入门课程，讲解基础统计概念与材料阅读方法。', 'article', 'basic', 8, 1, 1),
(1044, 624, '申论零基础入门：申论考试全面认知', '8课时 | 零基础', '专为零基础考生设计的申论入门课程，全面介绍申论考试特点、题型与基本作答方法。', 'article', 'basic', 8, 1, 1),
(1045, 716, '面试零基础入门：结构化面试初识', '6课时 | 零基础', '专为面试小白设计的入门课程，了解结构化面试的基本流程、评分标准与答题要求。', 'article', 'basic', 6, 1, 1);

-- =============================================
-- 四十六、新增课程 - 刷题训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1046, 547, '逻辑填空1000题：海量刷题提升语感', '20课时 | 刷题训练', '精选1000道逻辑填空高质量真题，通过大量刷题培养语感，提升词语运用与语境分析能力。', 'article', 'intermediate', 20, 0, 140),
(1047, 551, '片段阅读800题：阅读理解强化训练', '15课时 | 刷题训练', '精选800道片段阅读真题进行强化训练，全面提升阅读速度与理解准确率。', 'article', 'intermediate', 15, 0, 140),
(1048, 560, '数学运算500题：计算能力突破训练', '15课时 | 刷题训练', '精选500道数学运算真题，系统训练各类题型，提升计算速度与准确率。', 'article', 'intermediate', 15, 0, 140),
(1049, 574, '图形推理500题：图形敏感度训练', '12课时 | 刷题训练', '精选500道图形推理真题进行集中训练，培养图形规律敏感度，提升图推正确率。', 'article', 'intermediate', 12, 0, 140),
(1050, 587, '逻辑判断600题：逻辑思维强化训练', '15课时 | 刷题训练', '精选600道逻辑判断真题进行系统训练，强化逻辑推理能力与解题技巧。', 'article', 'intermediate', 15, 0, 140),
(1051, 593, '资料分析400题：速算能力提升训练', '12课时 | 刷题训练', '精选400道资料分析真题进行限时训练，提升速算能力与答题效率。', 'article', 'intermediate', 12, 0, 140);

-- =============================================
-- 四十七、新增课程 - 易错题专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1052, 546, '言语理解易错题精析：常见陷阱与规避', '8课时 | 易错专项', '汇总言语理解常见易错题型，分析命题陷阱与错误原因，帮助考生规避常见错误。', 'article', 'intermediate', 8, 0, 145),
(1053, 559, '数量关系易错题精析：思维误区纠正', '8课时 | 易错专项', '汇总数量关系常见易错题型，分析思维误区与计算陷阱，帮助考生避免失误丢分。', 'article', 'intermediate', 8, 0, 145),
(1054, 573, '判断推理易错题精析：逻辑陷阱识破', '8课时 | 易错专项', '汇总判断推理常见易错题型，分析逻辑陷阱与干扰项设置，提升辨别能力。', 'article', 'intermediate', 8, 0, 145),
(1055, 593, '资料分析易错题精析：计算陷阱与细节', '6课时 | 易错专项', '汇总资料分析常见易错题型，分析计算陷阱与阅读误区，帮助考生提高准确率。', 'article', 'intermediate', 6, 0, 145);

-- =============================================
-- 四十八、新增课程 - 提速训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1056, 546, '言语理解提速训练：30秒解题法', '6课时 | 提速训练', '传授言语理解快速解题技巧，培养快速阅读与快速判断能力，实现平均每题30秒内完成。', 'article', 'advanced', 6, 0, 150),
(1057, 559, '数量关系提速训练：秒杀技巧汇总', '8课时 | 提速训练', '汇总数量关系各题型的秒杀技巧，帮助考生在最短时间内完成计算或判断。', 'article', 'advanced', 8, 0, 150),
(1058, 573, '判断推理提速训练：快速定位与排除', '6课时 | 提速训练', '传授判断推理的快速解题方法，培养快速定位关键信息与排除干扰项的能力。', 'article', 'advanced', 6, 0, 150),
(1059, 593, '资料分析提速训练：极速估算法', '6课时 | 提速训练', '传授资料分析的极速估算方法，大幅提升计算速度，确保在规定时间内完成全部题目。', 'article', 'advanced', 6, 0, 150);

-- =============================================
-- 四十九、新增课程 - 时政热点专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1060, 609, '2026年时政热点精讲：全年大事件回顾', '10课时 | 时政热点', '系统梳理2026年国内外重大时政热点，深度解读重要会议、政策与事件，助力时政备考。', 'article', 'basic', 10, 0, 10),
(1061, 609, '二十大精神深度解读：核心要义与实践', '6课时 | 时政热点', '深入学习党的二十大报告核心内容，理解新时代新征程的目标任务与战略部署。', 'article', 'basic', 6, 0, 11),
(1062, 609, '乡村振兴政策解读：三农工作要点', '4课时 | 时政热点', '系统解读乡村振兴战略的政策要点，掌握三农工作的重点内容与发展方向。', 'article', 'basic', 4, 0, 12),
(1063, 609, '科技创新政策解读：科技强国战略', '4课时 | 时政热点', '解读科技创新相关政策，了解我国科技发展战略与重大科技成就。', 'article', 'basic', 4, 0, 13),
(1064, 609, '生态文明建设专题：绿色发展理念', '4课时 | 时政热点', '深入学习生态文明建设的理念与政策，掌握绿色发展、碳达峰碳中和等热点话题。', 'article', 'basic', 4, 0, 14),
(1065, 609, '共同富裕政策解读：发展成果共享', '4课时 | 时政热点', '解读共同富裕相关政策，理解共同富裕的内涵、路径与实践探索。', 'article', 'basic', 4, 0, 15);

-- =============================================
-- 五十、新增课程 - 面试热点专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1066, 719, '数字政府建设专题：政务服务创新', '3课时 | 面试热点', '深度分析数字政府建设的热点话题，提供综合分析题的答题素材与思路。', 'article', 'intermediate', 3, 0, 70),
(1067, 719, '基层治理创新专题：社区治理与服务', '3课时 | 面试热点', '聚焦基层治理创新的热点案例，提升组织计划与综合分析题的作答能力。', 'article', 'intermediate', 3, 0, 71),
(1068, 719, '营商环境优化专题：政府服务效能', '3课时 | 面试热点', '分析营商环境优化的政策与实践，提供面试答题的素材积累。', 'article', 'intermediate', 3, 0, 72),
(1069, 719, '教育公平专题：教育改革与发展', '3课时 | 面试热点', '探讨教育公平相关热点话题，提供教育类综合分析题的答题思路。', 'article', 'intermediate', 3, 0, 73),
(1070, 719, '医疗卫生改革专题：健康中国建设', '3课时 | 面试热点', '分析医疗卫生改革的热点问题，提供卫生类综合分析题的答题素材。', 'article', 'intermediate', 3, 0, 74),
(1071, 719, '就业创业专题：稳就业与促创业', '3课时 | 面试热点', '聚焦就业创业相关热点话题，提供就业类综合分析题的答题思路。', 'article', 'intermediate', 3, 0, 75),
(1072, 719, '网络治理专题：网络安全与文明', '3课时 | 面试热点', '分析网络治理相关热点问题，提供网络类综合分析题的答题素材。', 'article', 'intermediate', 3, 0, 76),
(1073, 719, '文化传承创新专题：文化自信', '3课时 | 面试热点', '探讨文化传承与创新的热点话题，提供文化类综合分析题的答题思路。', 'article', 'intermediate', 3, 0, 77);

-- =============================================
-- 五十一、新增课程 - 特殊岗位面试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1074, 716, '税务系统面试特训：税务专业题精讲', '8课时 | 岗位面试', '针对税务系统面试的专业性特点，精讲税务专业题与综合题的答题方法。', 'article', 'intermediate', 8, 0, 160),
(1075, 716, '海关系统面试特训：海关业务题精讲', '8课时 | 岗位面试', '针对海关系统面试的特点，精讲海关业务题与岗位认知题的答题技巧。', 'article', 'intermediate', 8, 0, 161),
(1076, 716, '铁路公安面试特训：公安专业题精讲', '8课时 | 岗位面试', '针对铁路公安面试的特点，精讲公安专业题、情景模拟题的答题方法。', 'article', 'intermediate', 8, 0, 162),
(1077, 716, '银保监会面试特训：专业题与英语题', '10课时 | 岗位面试', '针对银保监会面试的特点，精讲专业题、英语题与结构化题的答题技巧。', 'article', 'intermediate', 10, 0, 163),
(1078, 716, '外交部面试特训：外交专业素养提升', '10课时 | 岗位面试', '针对外交部面试的高要求，提升外交专业素养与综合表达能力。', 'article', 'advanced', 10, 0, 164),
(1079, 716, '统计局面试特训：统计专业题精讲', '6课时 | 岗位面试', '针对统计局面试的特点，精讲统计专业题与数据分析题的答题方法。', 'article', 'intermediate', 6, 0, 165);

-- =============================================
-- 五十二、新增课程 - 申论热点专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1080, 624, '乡村振兴申论专题：三农问题深度剖析', '5课时 | 申论热点', '聚焦乡村振兴战略，深度剖析三农问题，提供申论写作的素材与思路。', 'article', 'intermediate', 5, 0, 70),
(1081, 624, '城市治理申论专题：城市发展与管理', '5课时 | 申论热点', '分析城市治理的热点问题，提供城市发展类申论的写作素材与框架。', 'article', 'intermediate', 5, 0, 71),
(1082, 624, '科技创新申论专题：科技强国与创新驱动', '5课时 | 申论热点', '聚焦科技创新战略，提供科技类申论的写作思路与素材积累。', 'article', 'intermediate', 5, 0, 72),
(1083, 624, '生态环保申论专题：绿色发展与生态文明', '5课时 | 申论热点', '深入分析生态环保问题，提供环保类申论的写作素材与论证方法。', 'article', 'intermediate', 5, 0, 73),
(1084, 624, '民生保障申论专题：教育医疗就业', '5课时 | 申论热点', '聚焦民生保障热点，提供民生类申论的写作素材与答题框架。', 'article', 'intermediate', 5, 0, 74),
(1085, 624, '文化建设申论专题：文化自信与传承', '5课时 | 申论热点', '分析文化建设的热点话题，提供文化类申论的写作思路与素材。', 'article', 'intermediate', 5, 0, 75);

-- =============================================
-- 五十三、新增课程 - 公基专项深化系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1086, 612, '法律法规新变化：近年法律修订要点', '4课时 | 法律专项', '梳理近年来重要法律法规的修订变化，掌握最新法律条文与考试要点。', 'article', 'intermediate', 4, 0, 80),
(1087, 612, '民法典专题精讲：七编核心内容深度解析', '8课时 | 法律专项', '系统讲解《民法典》七编的核心内容，深度解析高频考点与典型案例。', 'article', 'intermediate', 8, 0, 81),
(1088, 612, '行政法专题精讲：行政执法与救济', '6课时 | 法律专项', '深入讲解行政法的核心内容，重点突破行政许可、处罚、强制与救济。', 'article', 'intermediate', 6, 0, 82),
(1089, 612, '刑法专题精讲：高频罪名与案例分析', '6课时 | 法律专项', '精讲刑法高频考点与常见罪名，通过案例分析加深理解。', 'article', 'intermediate', 6, 0, 83),
(1090, 608, '中国近现代史专题：重大历史事件精讲', '4课时 | 历史专项', '精讲中国近现代史上的重大事件，掌握历史脉络与核心考点。', 'article', 'intermediate', 4, 0, 80),
(1091, 608, '世界历史专题：重要历史阶段与人物', '4课时 | 历史专项', '梳理世界历史的重要阶段、事件与人物，掌握世界史核心考点。', 'article', 'intermediate', 4, 0, 81),
(1092, 608, '中国古代文化专题：传统文化精粹', '4课时 | 文化专项', '精讲中国古代文化的核心内容，包括哲学、文学、艺术等方面。', 'article', 'intermediate', 4, 0, 82),
(1093, 617, '科技前沿专题：最新科技成就解读', '4课时 | 科技专项', '解读最新科技发展动态与重大成就，掌握科技常识考试热点。', 'article', 'intermediate', 4, 0, 80),
(1094, 617, '生活科技常识：与日常相关的科学知识', '3课时 | 科技专项', '讲解与日常生活相关的科学常识，提升科技素养与常识储备。', 'article', 'basic', 3, 0, 81);

-- =============================================
-- 五十四、新增课程 - 学习方法与技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1095, 1, '公考备考规划：科学制定学习计划', '3课时 | 备考指导', '帮助考生科学规划备考时间，制定合理的学习计划，提高备考效率。', 'article', 'basic', 3, 1, 0),
(1096, 1, '行测时间管理：考场时间分配策略', '2课时 | 应试技巧', '传授行测考试的时间分配策略，帮助考生在有限时间内最大化得分。', 'article', 'basic', 2, 0, 200),
(1097, 1, '行测蒙题技巧：特殊情况下的应对策略', '2课时 | 应试技巧', '讲解行测考试中遇到不会题目时的应对策略与蒙题技巧。', 'article', 'basic', 2, 0, 201),
(1098, 624, '申论答题规范：格式与书写要求', '2课时 | 应试技巧', '讲解申论答题的格式规范与书写要求，避免因格式问题丢分。', 'article', 'basic', 2, 0, 200),
(1099, 624, '申论时间管理：各题型时间分配', '2课时 | 应试技巧', '传授申论考试的时间分配策略，确保各题型都能合理作答。', 'article', 'basic', 2, 0, 201),
(1100, 716, '面试考场表现：礼仪与气场塑造', '3课时 | 面试技巧', '讲解面试考场的表现技巧，包括礼仪规范、气场塑造与自信展现。', 'article', 'basic', 3, 0, 200),
(1101, 716, '面试答题节奏：时间控制与内容把握', '2课时 | 面试技巧', '传授面试答题的节奏控制技巧，确保在规定时间内完成高质量作答。', 'article', 'basic', 2, 0, 201);

-- =============================================
-- 五十五、新增课程 - 真题年度合集系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1102, 1, '2025年国考行测真题精讲：副省级卷', '8课时 | 年度真题', '全面解析2025年国考行测副省级真题，分析命题趋势与考点变化。', 'article', 'intermediate', 8, 0, 170),
(1103, 1, '2025年国考行测真题精讲：地市级卷', '8课时 | 年度真题', '全面解析2025年国考行测地市级真题，对比分析两套试卷的异同。', 'article', 'intermediate', 8, 0, 171),
(1104, 624, '2025年国考申论真题精讲：副省级卷', '6课时 | 年度真题', '深度解析2025年国考申论副省级真题，传授高分作答技巧。', 'article', 'intermediate', 6, 0, 170),
(1105, 624, '2025年国考申论真题精讲：地市级卷', '6课时 | 年度真题', '深度解析2025年国考申论地市级真题，分析命题特点与评分要点。', 'article', 'intermediate', 6, 0, 171),
(1106, 1, '2024年多省联考行测真题精讲', '8课时 | 年度真题', '全面解析2024年多省公务员联考行测真题，分析联考命题规律。', 'article', 'intermediate', 8, 0, 172),
(1107, 624, '2024年多省联考申论真题精讲', '6课时 | 年度真题', '深度解析2024年多省公务员联考申论真题，掌握联考申论特点。', 'article', 'intermediate', 6, 0, 173);

-- =============================================
-- 五十六、更新课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习言语理解与表达，包括逻辑填空、片段阅读、语句表达三大模块，全面提升语言理解与运用能力。',
    `long_description` = '言语理解与表达是行测考试的重要组成部分，主要考查考生对语言文字的理解和运用能力。本课程体系涵盖逻辑填空（实词辨析、成语辨析、关联词）、片段阅读（主旨概括、意图判断、细节理解、标题选择）、语句表达（语句排序、语句填空）三大模块，通过系统学习帮助考生全面提升言语理解能力。'
WHERE `id` = 546;

UPDATE `what_course_categories` SET 
    `description` = '系统学习数量关系，包括数学运算和数字推理两大模块，掌握各类题型的解题方法与速算技巧。',
    `long_description` = '数量关系是行测考试中难度较高的部分，主要考查考生的数学运算能力和数字规律推理能力。本课程体系涵盖数学运算（计算技巧、行程问题、工程问题、利润问题、排列组合、概率问题、几何问题等）和数字推理（等差等比数列、递推数列、特殊数列等）两大模块，帮助考生掌握各类题型的解题方法。'
WHERE `id` = 559;

UPDATE `what_course_categories` SET 
    `description` = '系统学习判断推理，包括图形推理、定义判断、类比推理、逻辑判断四大模块，培养逻辑思维与分析判断能力。',
    `long_description` = '判断推理是行测考试中题量较大的部分，主要考查考生的逻辑思维能力和分析判断能力。本课程体系涵盖图形推理（位置规律、样式规律、属性规律、数量规律、空间重构）、定义判断（核心成分法、列举排除法）、类比推理（语义关系、逻辑关系、语法关系）、逻辑判断（翻译推理、真假推理、分析推理、加强削弱）四大模块。'
WHERE `id` = 573;

UPDATE `what_course_categories` SET 
    `description` = '系统学习资料分析，掌握统计术语、计算公式与速算技巧，提升数据处理与分析能力。',
    `long_description` = '资料分析是行测考试中相对容易得分的部分，主要考查考生对文字、表格、图形等资料的理解与计算能力。本课程体系涵盖核心概念（增长问题、比重问题、倍数问题、平均数问题）、速算技巧（截位直除、特征数字、有效数字、同位比较）、材料类型（文字材料、表格材料、图形材料）三大模块。'
WHERE `id` = 592;

UPDATE `what_course_categories` SET 
    `description` = '系统学习申论考试，掌握归纳概括、综合分析、提出对策、贯彻执行、大作文五大题型的作答方法。',
    `long_description` = '申论是公务员考试的重要科目，主要考查考生的阅读理解能力、综合分析能力、提出和解决问题能力、文字表达能力。本课程体系涵盖归纳概括、综合分析、提出对策、贯彻执行、申发论述（大作文）五大题型，通过系统学习帮助考生全面提升申论作答能力。'
WHERE `id` = 624;

UPDATE `what_course_categories` SET 
    `description` = '系统学习公务员面试，掌握综合分析、组织计划、人际关系、应急应变、自我认知等各类题型的答题方法。',
    `long_description` = '公务员面试是公务员录用考试的重要环节，主要考查考生的综合分析能力、计划组织协调能力、人际交往能力、应变能力、言语表达能力等。本课程体系涵盖结构化面试各类题型（综合分析、组织计划、人际关系、应急应变、自我认知、情景模拟）以及无领导小组讨论的答题方法与技巧。'
WHERE `id` = 716;

-- =============================================
-- 五十七、新增课程 - VIP精品课程系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `v_ip_only`, `sort_order`) VALUES
(1108, 546, '言语理解VIP精品班：名师全程带学', '40课时 | VIP精品', '名师全程带学的言语理解精品课程，系统讲解+真题演练+答疑辅导，助力言语满分。', 'article', 'intermediate', 40, 0, 1, 180),
(1109, 559, '数量关系VIP精品班：数学思维培养', '35课时 | VIP精品', '名师全程带学的数量关系精品课程，从基础到提升，培养数学思维，突破数量难关。', 'article', 'intermediate', 35, 0, 1, 180),
(1110, 573, '判断推理VIP精品班：逻辑能力提升', '40课时 | VIP精品', '名师全程带学的判断推理精品课程，系统培养逻辑思维，全面提升判断推理能力。', 'article', 'intermediate', 40, 0, 1, 180),
(1111, 593, '资料分析VIP精品班：满分冲刺计划', '25课时 | VIP精品', '名师全程带学的资料分析精品课程，掌握速算技巧，实现资料分析满分目标。', 'article', 'intermediate', 25, 0, 1, 180),
(1112, 624, '申论VIP精品班：高分写作特训', '50课时 | VIP精品', '名师全程带学的申论精品课程，系统提升各题型作答能力，冲刺申论高分。', 'article', 'intermediate', 50, 0, 1, 180),
(1113, 716, '面试VIP精品班：一对一模拟特训', '30课时 | VIP精品', '名师一对一指导的面试精品课程，包含多次模拟演练与个性化点评，全面提升面试表现。', 'article', 'intermediate', 30, 0, 1, 180);

-- =============================================
-- 五十八、新增课程 - 考前押题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1114, 1, '2026国考行测考前预测：高频考点押题', '5课时 | 考前押题', '基于历年命题规律与最新动态，预测2026年国考行测高频考点，助力考前冲刺。', 'article', 'advanced', 5, 0, 190),
(1115, 624, '2026国考申论考前预测：热点主题押题', '5课时 | 考前押题', '基于时政热点与历年命题规律，预测2026年国考申论可能考查的主题方向。', 'article', 'advanced', 5, 0, 190),
(1116, 716, '2026国考面试考前预测：热点话题押题', '4课时 | 考前押题', '基于时政热点与面试命题规律，预测2026年国考面试可能考查的热点话题。', 'article', 'advanced', 4, 0, 190);

-- =============================================
-- 五十九、新增课程 - 错题本与复习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1117, 1, '行测高频错题精析：100道必纠错题', '8课时 | 错题复习', '精选行测各模块最容易出错的100道高频错题，深度分析错误原因，帮助考生彻底纠错。', 'article', 'intermediate', 8, 0, 195),
(1118, 624, '申论常见失分点分析：避坑指南', '5课时 | 错题复习', '分析申论各题型常见的失分原因与错误类型，帮助考生避免重复犯错。', 'article', 'intermediate', 5, 0, 195),
(1119, 1, '行测考前一周复习计划：高效冲刺', '3课时 | 考前复习', '制定行测考前一周的高效复习计划，帮助考生在最后阶段巩固提升。', 'article', 'advanced', 3, 0, 196),
(1120, 624, '申论考前一周复习计划：查漏补缺', '3课时 | 考前复习', '制定申论考前一周的复习计划，帮助考生进行最后的查漏补缺。', 'article', 'advanced', 3, 0, 196);

-- =============================================
-- 六十、课程优化 - 早期课程ID优化
-- =============================================

-- 优化ID 1-2的早期课程
UPDATE `what_courses` SET 
    `title` = '高频实词专题（500+组）：核心词汇速记',
    `subtitle` = '持续更新 | 词汇宝典',
    `description` = '精选公考高频实词500+组，按照语义相近、感情色彩、使用场景等维度分类，配合记忆口诀帮助考生快速掌握。'
WHERE `id` = 1;

UPDATE `what_courses` SET 
    `title` = '实词辨析精讲（20课时）：从入门到精通',
    `subtitle` = '20课时 | 系统课程',
    `description` = '系统讲解实词辨析的核心方法与高频词汇，从语素分析、语境推断到综合运用，帮助考生全面掌握实词辨析技巧。'
WHERE `id` = 2;

-- =============================================
-- 六十一、新增课程 - 事业单位考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1121, 1, '事业单位综合应用能力A类：管理岗位能力提升', '15课时 | 事业单位', '针对事业单位A类考试的综合应用能力进行系统训练，提升管理类岗位所需的核心能力。', 'article', 'intermediate', 15, 0, 200),
(1122, 1, '事业单位综合应用能力B类：社会科学专技岗', '15课时 | 事业单位', '针对事业单位B类考试进行专项训练，提升人文社科类专业技术岗位的作答能力。', 'article', 'intermediate', 15, 0, 201),
(1123, 1, '事业单位综合应用能力C类：自然科学专技岗', '15课时 | 事业单位', '针对事业单位C类考试进行专项训练，提升理工科类专业技术岗位的作答能力。', 'article', 'intermediate', 15, 0, 202),
(1124, 1, '事业单位综合应用能力D类：教师岗位专项', '15课时 | 事业单位', '针对事业单位D类教师岗位考试进行专项训练，提升教育教学相关能力。', 'article', 'intermediate', 15, 0, 203),
(1125, 1, '事业单位综合应用能力E类：医疗卫生岗位', '15课时 | 事业单位', '针对事业单位E类医疗卫生岗位考试进行专项训练，提升医疗卫生专业能力。', 'article', 'intermediate', 15, 0, 204),
(1126, 1, '事业单位职业能力倾向测验：全题型精讲', '20课时 | 事业单位', '系统讲解事业单位职测考试的各类题型，掌握职测的答题技巧与方法。', 'article', 'intermediate', 20, 0, 205);

-- =============================================
-- 六十二、新增课程 - 选调生考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1127, 1, '中央选调生笔试特训：高难度行测突破', '20课时 | 选调生', '针对中央选调生考试的高难度行测进行专项训练，攻克选调生考试难关。', 'article', 'advanced', 20, 0, 210),
(1128, 624, '中央选调生申论特训：政策分析与写作', '15课时 | 选调生', '针对中央选调生申论考试的特点进行专项训练，提升政策分析与公文写作能力。', 'article', 'advanced', 15, 0, 210),
(1129, 716, '选调生面试特训：基层工作情景应对', '12课时 | 选调生', '针对选调生面试的特点进行专项训练，重点突破基层工作情景类题目。', 'article', 'advanced', 12, 0, 210),
(1130, 1, '定向选调生考试攻略：各省选调要点', '10课时 | 选调生', '系统介绍各省定向选调生考试的特点与备考策略，助力定向选调上岸。', 'article', 'intermediate', 10, 0, 211);

-- =============================================
-- 六十三、新增课程 - 军队文职考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1131, 1, '军队文职公共科目精讲：基础综合与岗位能力', '25课时 | 军队文职', '系统讲解军队文职公共科目考试内容，涵盖基础综合知识与岗位能力测验。', 'article', 'intermediate', 25, 0, 220),
(1132, 1, '军队文职专业科目：管理学专项', '15课时 | 军队文职', '针对军队文职管理学类专业科目进行系统讲解，掌握管理学核心考点。', 'article', 'intermediate', 15, 0, 221),
(1133, 1, '军队文职专业科目：计算机专项', '15课时 | 军队文职', '针对军队文职计算机类专业科目进行系统讲解，掌握计算机核心考点。', 'article', 'intermediate', 15, 0, 222),
(1134, 716, '军队文职面试特训：军事素养与岗位认知', '10课时 | 军队文职', '针对军队文职面试的特点进行专项训练，提升军事素养与岗位匹配度。', 'article', 'intermediate', 10, 0, 223);

-- =============================================
-- 六十四、新增课程 - 三支一扶考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1135, 1, '三支一扶考试全攻略：笔试核心考点', '15课时 | 三支一扶', '系统讲解三支一扶考试的笔试内容，掌握公共基础知识与写作的核心考点。', 'article', 'basic', 15, 0, 230),
(1136, 716, '三支一扶面试特训：基层服务意识', '8课时 | 三支一扶', '针对三支一扶面试的特点进行专项训练，展现服务基层的决心与能力。', 'article', 'basic', 8, 0, 231),
(1137, 1, '三支一扶公基专项：农村政策与基层治理', '10课时 | 三支一扶', '专门讲解三农政策、基层治理等三支一扶考试高频考点，提升针对性。', 'article', 'basic', 10, 0, 232);

-- =============================================
-- 六十五、新增课程 - 社区工作者考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1138, 1, '社区工作者笔试精讲：社区知识与实务', '12课时 | 社区工作者', '系统讲解社区工作者笔试内容，涵盖社区基础知识、政策法规与实务操作。', 'article', 'basic', 12, 0, 240),
(1139, 716, '社区工作者面试特训：群众工作能力', '8课时 | 社区工作者', '针对社区工作者面试进行专项训练，提升群众工作能力与社区服务意识。', 'article', 'basic', 8, 0, 241),
(1140, 1, '社区工作者公基专项：社区治理与服务', '8课时 | 社区工作者', '专门讲解社区治理、居民服务等社工考试核心内容，提升考试针对性。', 'article', 'basic', 8, 0, 242);

-- =============================================
-- 六十六、新增课程 - 银行/国企考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1141, 1, '银行招聘笔试精讲：EPI与综合知识', '20课时 | 银行考试', '系统讲解银行招聘笔试内容，涵盖EPI、综合知识、英语与性格测试。', 'article', 'intermediate', 20, 0, 250),
(1142, 1, '银行招聘专业知识：经济金融专项', '15课时 | 银行考试', '深入讲解银行考试的经济金融专业知识，掌握货币银行学、金融学核心考点。', 'article', 'intermediate', 15, 0, 251),
(1143, 716, '银行面试特训：半结构化与无领导', '10课时 | 银行考试', '针对银行面试的半结构化面试与无领导小组讨论进行专项训练。', 'article', 'intermediate', 10, 0, 252),
(1144, 1, '国企招聘笔试精讲：行测+公基+专业', '18课时 | 国企考试', '系统讲解国企招聘笔试的行测、公基与专业知识，提升国企考试综合能力。', 'article', 'intermediate', 18, 0, 253),
(1145, 716, '国企面试特训：企业文化与岗位匹配', '8课时 | 国企考试', '针对国企面试的特点进行专项训练，展现与企业文化的高度匹配。', 'article', 'intermediate', 8, 0, 254);

-- =============================================
-- 六十七、新增课程 - 教师招聘/教资考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1146, 1, '教师招聘笔试精讲：教育基础知识', '20课时 | 教师招聘', '系统讲解教师招聘考试的教育学、心理学等教育基础知识核心考点。', 'article', 'intermediate', 20, 0, 260),
(1147, 1, '教师招聘公基专项：教育法律法规', '8课时 | 教师招聘', '专门讲解教育法、教师法等教育类法律法规，掌握法规类高频考点。', 'article', 'intermediate', 8, 0, 261),
(1148, 716, '教师招聘面试特训：说课与试讲', '12课时 | 教师招聘', '针对教师招聘面试的说课、试讲环节进行专项训练，提升教学展示能力。', 'article', 'intermediate', 12, 0, 262),
(1149, 1, '教师资格证笔试精讲：综合素质', '15课时 | 教资考试', '系统讲解教师资格证科目一综合素质的核心考点与答题技巧。', 'article', 'basic', 15, 0, 263),
(1150, 1, '教师资格证笔试精讲：教育知识与能力', '15课时 | 教资考试', '系统讲解教师资格证科目二教育知识与能力的核心考点。', 'article', 'basic', 15, 0, 264);

-- =============================================
-- 六十八、新增课程 - 遴选考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1151, 624, '公务员遴选笔试精讲：案例分析与公文写作', '20课时 | 遴选考试', '系统讲解公务员遴选笔试的案例分析与公文写作题型，提升遴选笔试能力。', 'article', 'advanced', 20, 0, 270),
(1152, 624, '遴选案例分析专项：政策执行与问题解决', '12课时 | 遴选考试', '专门针对遴选考试的案例分析题进行深度讲解，提升政策分析能力。', 'article', 'advanced', 12, 0, 271),
(1153, 716, '遴选面试特训：领导力与执行力', '10课时 | 遴选考试', '针对遴选面试的特点进行专项训练，展现领导力与执行力。', 'article', 'advanced', 10, 0, 272),
(1154, 624, '中央遴选笔试特训：高难度写作突破', '15课时 | 遴选考试', '针对中央遴选考试的高难度写作进行专项训练，攻克遴选写作难关。', 'article', 'advanced', 15, 0, 273);

-- =============================================
-- 六十九、新增课程 - 法检考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1155, 612, '法检考试法律专业知识精讲', '25课时 | 法检考试', '系统讲解法院检察院考试的法律专业知识，涵盖民法、刑法、诉讼法等核心内容。', 'article', 'intermediate', 25, 0, 280),
(1156, 612, '法检考试刑法专项：罪名与量刑', '10课时 | 法检考试', '深入讲解法检考试高频刑法考点，重点攻克罪名认定与量刑规则。', 'article', 'intermediate', 10, 0, 281),
(1157, 612, '法检考试民法专项：合同与侵权', '10课时 | 法检考试', '深入讲解法检考试高频民法考点，重点攻克合同法与侵权责任法。', 'article', 'intermediate', 10, 0, 282),
(1158, 716, '法检面试特训：司法实务与案例分析', '10课时 | 法检考试', '针对法检面试的特点进行专项训练，提升司法实务能力与案例分析水平。', 'article', 'intermediate', 10, 0, 283);

-- =============================================
-- 七十、新增课程 - 警察招录考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1159, 1, '公安招警笔试精讲：公安专业知识', '20课时 | 警察招录', '系统讲解公安招警考试的公安基础知识、公安业务知识等核心内容。', 'article', 'intermediate', 20, 0, 290),
(1160, 1, '公安招警专项：公安法律法规', '10课时 | 警察招录', '专门讲解人民警察法、治安管理处罚法等公安法律法规核心考点。', 'article', 'intermediate', 10, 0, 291),
(1161, 716, '公安招警面试特训：执法规范与应急处置', '10课时 | 警察招录', '针对公安招警面试进行专项训练，提升执法规范意识与应急处置能力。', 'article', 'intermediate', 10, 0, 292),
(1162, 1, '辅警考试笔试精讲：法律常识与公安业务', '12课时 | 警察招录', '系统讲解辅警考试的法律常识与公安业务知识核心考点。', 'article', 'basic', 12, 0, 293);

-- =============================================
-- 七十一、新增课程 - 学习路径规划系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1163, 1, '国考上岸完整路径：6个月备考规划', '5课时 | 学习规划', '为国考考生设计的6个月完整备考路径，科学规划各阶段学习任务与目标。', 'article', 'basic', 5, 1, 0),
(1164, 1, '省考上岸完整路径：4个月备考规划', '5课时 | 学习规划', '为省考考生设计的4个月备考路径，合理安排学习进度与复习重点。', 'article', 'basic', 5, 1, 0),
(1165, 1, '在职备考攻略：工作学习两不误', '4课时 | 学习规划', '专为在职考生设计的备考攻略，高效利用碎片时间，实现工作学习两不误。', 'article', 'basic', 4, 1, 0),
(1166, 1, '应届生备考攻略：校园到公职的过渡', '4课时 | 学习规划', '专为应届毕业生设计的备考攻略，帮助完成从校园到公职的顺利过渡。', 'article', 'basic', 4, 1, 0),
(1167, 1, '二战考生备考攻略：总结经验再出发', '4课时 | 学习规划', '专为二战考生设计的备考攻略，帮助总结经验教训，实现逆袭上岸。', 'article', 'basic', 4, 1, 0);

-- =============================================
-- 七十二、新增课程 - 考情分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1168, 1, '2026年国考考情分析：命题趋势与备考建议', '3课时 | 考情分析', '深度分析2026年国考的命题趋势、难度变化与备考建议，把握考试方向。', 'article', 'basic', 3, 1, 300),
(1169, 1, '历年国考数据分析：报考与录取趋势', '2课时 | 考情分析', '分析历年国考的报考人数、竞争比例、录取趋势等数据，科学选岗。', 'article', 'basic', 2, 1, 301),
(1170, 1, '省考联考考情分析：各省命题特点', '4课时 | 考情分析', '分析各省省考与联考的命题特点与差异，帮助考生有针对性备考。', 'article', 'basic', 4, 1, 302),
(1171, 1, '热门岗位分析：税务、海关、统计等', '3课时 | 考情分析', '分析国考热门岗位的竞争情况与备考策略，助力科学选岗。', 'article', 'basic', 3, 1, 303);

-- =============================================
-- 七十三、新增课程 - 心理辅导系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1172, 1, '考前心理调适：缓解焦虑与压力管理', '3课时 | 心理辅导', '帮助考生缓解考前焦虑，掌握压力管理技巧，以最佳状态迎接考试。', 'article', 'basic', 3, 1, 310),
(1173, 1, '备考倦怠应对：重燃学习动力', '2课时 | 心理辅导', '帮助考生应对备考倦怠期，重新找回学习动力与热情。', 'article', 'basic', 2, 1, 311),
(1174, 716, '面试紧张克服：自信从容应对', '3课时 | 心理辅导', '帮助考生克服面试紧张情绪，建立自信，从容应对面试挑战。', 'article', 'basic', 3, 1, 312),
(1175, 1, '落榜心理疏导：调整心态再出发', '2课时 | 心理辅导', '帮助落榜考生调整心态，正确面对挫折，为再次备考做好准备。', 'article', 'basic', 2, 1, 313);

-- =============================================
-- 七十四、新增课程 - 名师专题课系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1176, 546, '言语理解名师点睛：高频考点串讲', '6课时 | 名师专题', '名师考前点睛课程，串讲言语理解高频考点与易错点，助力考前提分。', 'article', 'advanced', 6, 0, 185),
(1177, 559, '数量关系名师点睛：难题秒杀技巧', '6课时 | 名师专题', '名师考前点睛课程，传授数量关系难题的秒杀技巧与解题思路。', 'article', 'advanced', 6, 0, 185),
(1178, 573, '判断推理名师点睛：逻辑思维提升', '6课时 | 名师专题', '名师考前点睛课程，帮助考生快速提升逻辑思维能力与解题速度。', 'article', 'advanced', 6, 0, 185),
(1179, 593, '资料分析名师点睛：速算技巧总结', '4课时 | 名师专题', '名师考前点睛课程，总结资料分析速算技巧，确保考场高效准确。', 'article', 'advanced', 4, 0, 185),
(1180, 624, '申论名师点睛：高分写作要诀', '6课时 | 名师专题', '名师考前点睛课程，传授申论高分写作的核心要诀与提分技巧。', 'article', 'advanced', 6, 0, 185),
(1181, 716, '面试名师点睛：答题亮点打造', '6课时 | 名师专题', '名师考前点睛课程，帮助考生打造面试答题亮点，脱颖而出。', 'article', 'advanced', 6, 0, 185);

-- =============================================
-- 七十五、新增课程 - 实战案例分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1182, 624, '申论实战案例分析：乡村振兴篇', '4课时 | 案例分析', '通过乡村振兴领域的实际案例，讲解申论材料分析与写作的方法。', 'article', 'intermediate', 4, 0, 85),
(1183, 624, '申论实战案例分析：城市治理篇', '4课时 | 案例分析', '通过城市治理领域的实际案例，提升申论材料分析与答题能力。', 'article', 'intermediate', 4, 0, 86),
(1184, 624, '申论实战案例分析：生态环保篇', '4课时 | 案例分析', '通过生态环保领域的实际案例，深化对申论材料的理解与分析。', 'article', 'intermediate', 4, 0, 87),
(1185, 624, '申论实战案例分析：科技创新篇', '4课时 | 案例分析', '通过科技创新领域的实际案例，提升申论写作的深度与广度。', 'article', 'intermediate', 4, 0, 88),
(1186, 716, '面试实战案例分析：基层治理篇', '4课时 | 案例分析', '通过基层治理领域的实际案例，提升面试组织计划题的答题能力。', 'article', 'intermediate', 4, 0, 85),
(1187, 716, '面试实战案例分析：政务服务篇', '4课时 | 案例分析', '通过政务服务领域的实际案例，提升面试综合分析题的答题深度。', 'article', 'intermediate', 4, 0, 86);

-- =============================================
-- 七十六、新增课程 - 公文写作实务系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1188, 706, '请示报告写作实务：格式规范与内容要点', '4课时 | 公文实务', '深入讲解请示、报告的写作规范，掌握请示报告的格式与内容要求。', 'article', 'intermediate', 4, 0, 20),
(1189, 706, '通知通报写作实务：准确传达与有效告知', '4课时 | 公文实务', '深入讲解通知、通报的写作规范，掌握通知通报的写作要点。', 'article', 'intermediate', 4, 0, 21),
(1190, 706, '函与纪要写作实务：沟通协调与记录整理', '4课时 | 公文实务', '深入讲解函、会议纪要的写作规范，掌握相关公文的写作技巧。', 'article', 'intermediate', 4, 0, 22),
(1191, 706, '工作计划与总结写作：规划与回顾', '4课时 | 公文实务', '深入讲解工作计划与工作总结的写作方法，提升职场写作能力。', 'article', 'intermediate', 4, 0, 23),
(1192, 706, '调研报告写作实务：调查研究与分析呈现', '5课时 | 公文实务', '深入讲解调研报告的写作方法，从调研设计到报告撰写全流程讲解。', 'article', 'intermediate', 5, 0, 24);

-- =============================================
-- 七十七、新增课程 - 政治理论专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1193, 609, '习近平重要讲话精神学习：核心要义解读', '6课时 | 政治理论', '系统学习习近平重要讲话精神，理解其核心要义与实践要求。', 'article', 'intermediate', 6, 0, 20),
(1194, 609, '党的二十大报告专题学习：全面解读', '8课时 | 政治理论', '全面深入学习党的二十大报告，把握新时代新征程的目标任务。', 'article', 'intermediate', 8, 0, 21),
(1195, 609, '中国式现代化专题：理论内涵与实践路径', '5课时 | 政治理论', '深入学习中国式现代化的理论内涵与实践路径，把握发展方向。', 'article', 'intermediate', 5, 0, 22),
(1196, 609, '全过程人民民主专题：制度优势与实践', '4课时 | 政治理论', '学习全过程人民民主的理论与实践，理解中国民主政治的特点。', 'article', 'intermediate', 4, 0, 23),
(1197, 609, '总体国家安全观专题：安全发展理念', '4课时 | 政治理论', '学习总体国家安全观的核心内容，理解国家安全的重要性。', 'article', 'intermediate', 4, 0, 24);

-- =============================================
-- 七十八、新增课程 - 数据分析与图表解读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1198, 593, '柱状图专项精讲：数据比较与趋势分析', '4课时 | 图表专项', '专门讲解资料分析中柱状图的阅读技巧与数据分析方法。', 'article', 'intermediate', 4, 0, 50),
(1199, 593, '折线图专项精讲：趋势把握与变化分析', '4课时 | 图表专项', '专门讲解资料分析中折线图的阅读技巧与趋势分析方法。', 'article', 'intermediate', 4, 0, 51),
(1200, 593, '饼图专项精讲：比例构成与占比计算', '3课时 | 图表专项', '专门讲解资料分析中饼图的阅读技巧与占比计算方法。', 'article', 'intermediate', 3, 0, 52),
(1201, 593, '复合图表专项精讲：综合数据分析', '5课时 | 图表专项', '专门讲解资料分析中复合图表的阅读技巧与综合分析方法。', 'article', 'intermediate', 5, 0, 53),
(1202, 593, '统计表格专项精讲：多维数据处理', '5课时 | 图表专项', '专门讲解资料分析中统计表格的阅读技巧与数据处理方法。', 'article', 'intermediate', 5, 0, 54);

-- =============================================
-- 七十九、新增课程 - 逻辑推理进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1203, 587, '复杂论证分析：多论据与多结论', '5课时 | 逻辑进阶', '深入讲解复杂论证结构的分析方法，掌握多论据多结论情况的处理技巧。', 'article', 'advanced', 5, 0, 60),
(1204, 587, '论证前提假设：隐含条件的发现', '4课时 | 逻辑进阶', '深入讲解论证前提假设题的解题方法，掌握发现隐含条件的技巧。', 'article', 'advanced', 4, 0, 61),
(1205, 587, '论证评价题型：逻辑漏洞的识别', '4课时 | 逻辑进阶', '深入讲解论证评价题的解题方法，掌握识别逻辑漏洞的技巧。', 'article', 'advanced', 4, 0, 62),
(1206, 587, '结论推断题型：合理推断的边界', '4课时 | 逻辑进阶', '深入讲解结论推断题的解题方法，掌握合理推断的边界与限度。', 'article', 'advanced', 4, 0, 63),
(1207, 587, '解释说明题型：因果关系的分析', '4课时 | 逻辑进阶', '深入讲解解释说明题的解题方法，掌握因果关系分析的技巧。', 'article', 'advanced', 4, 0, 64);

-- =============================================
-- 八十、新增课程 - 面试表达训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1208, 746, '面试语言表达训练：清晰流畅的表达', '4课时 | 表达训练', '专项训练面试的语言表达能力，提升表达的清晰度与流畅度。', 'article', 'basic', 4, 0, 30),
(1209, 746, '面试逻辑表达训练：条理分明的陈述', '4课时 | 表达训练', '专项训练面试的逻辑表达能力，使答题内容条理清晰、层次分明。', 'article', 'basic', 4, 0, 31),
(1210, 746, '面试情感表达训练：真诚自然的呈现', '3课时 | 表达训练', '专项训练面试的情感表达能力，使答题更加真诚自然、有感染力。', 'article', 'basic', 3, 0, 32),
(1211, 746, '面试即兴表达训练：临场应变的能力', '4课时 | 表达训练', '专项训练面试的即兴表达能力，提升临场应变与快速组织语言的能力。', 'article', 'basic', 4, 0, 33),
(1212, 746, '面试亮点打造训练：出彩答案的设计', '5课时 | 表达训练', '专项训练面试答题亮点的打造方法，使答案更加出彩、令人印象深刻。', 'article', 'intermediate', 5, 0, 34);

-- =============================================
-- 八十一、更新课程分类 - 补充描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习公共基础知识，涵盖政治、法律、经济、历史、地理、科技等多学科内容。',
    `long_description` = '公共基础知识是公考笔试的重要组成部分，主要考查考生的综合素质与知识储备。本课程体系涵盖政治理论（马克思主义哲学、中国特色社会主义理论、党史党建、时政热点）、法律法规（宪法、民法、刑法、行政法等）、经济管理、人文历史、地理科技等多学科内容，帮助考生全面提升公基答题能力。'
WHERE `id` = 608;

UPDATE `what_course_categories` SET 
    `description` = '系统学习常识判断，涵盖政治、法律、经济、历史、地理、科技等常考知识点。',
    `long_description` = '常识判断是行测考试的重要模块，主要考查考生对各学科基础知识的掌握程度。本课程体系涵盖政治常识、法律常识、经济常识、历史文化、地理环境、科技前沿等常考知识点，通过系统学习帮助考生构建完整的常识知识体系。'
WHERE `id` = 617;

UPDATE `what_course_categories` SET 
    `description` = '系统学习逻辑填空，掌握实词辨析、成语辨析、关联词运用等核心技巧。',
    `long_description` = '逻辑填空是言语理解与表达的核心题型，主要考查考生对词语含义的理解和语境分析能力。本课程体系涵盖实词辨析（语素分析、语境推断、色彩辨析）、成语辨析（高频成语、易混成语、误用类型）、关联词（分类、搭配、运用）三大模块，帮助考生全面提升逻辑填空的正确率。'
WHERE `id` = 547;

UPDATE `what_course_categories` SET 
    `description` = '系统学习片段阅读，掌握主旨概括、意图判断、细节理解等题型的解题技巧。',
    `long_description` = '片段阅读是言语理解与表达的重要题型，主要考查考生的阅读理解能力和信息提取能力。本课程体系涵盖主旨概括（行文脉络分析、关键词定位）、意图判断（言外之意推断）、细节理解（干扰项排除）、标题选择（概括性与吸引力）等题型，帮助考生快速准确地把握文章主旨。'
WHERE `id` = 551;

UPDATE `what_course_categories` SET 
    `description` = '系统学习数学运算，掌握各类计算问题的解题方法与速算技巧。',
    `long_description` = '数学运算是数量关系的核心内容，主要考查考生的数学计算能力和问题分析能力。本课程体系涵盖计算技巧（速算、整除、比例）、行程问题、工程问题、利润问题、排列组合、概率问题、几何问题等各类题型，通过系统学习帮助考生掌握各类问题的解题方法。'
WHERE `id` = 560;

UPDATE `what_course_categories` SET 
    `description` = '系统学习图形推理，掌握位置规律、样式规律、数量规律等图形变化规律。',
    `long_description` = '图形推理是判断推理的重要题型，主要考查考生对图形规律的观察和推理能力。本课程体系涵盖位置规律（平移、旋转、翻转）、样式规律（叠加、遍历、对称）、属性规律（开闭、曲直、对称性）、数量规律（点线面角计数）、空间重构（展开图、三视图）等内容。'
WHERE `id` = 574;

UPDATE `what_course_categories` SET 
    `description` = '系统学习逻辑判断，掌握翻译推理、真假推理、分析推理、论证推理等题型。',
    `long_description` = '逻辑判断是判断推理的核心题型，主要考查考生的逻辑推理能力和分析判断能力。本课程体系涵盖翻译推理（命题逻辑、推理规则）、真假推理（矛盾关系、反对关系）、分析推理（组合排列）、论证推理（加强削弱）等题型，帮助考生建立系统的逻辑思维能力。'
WHERE `id` = 587;

-- =============================================
-- 八十二、新增课程 - 各省省考专项系列（扩展）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1213, 546, '江苏省考言语特训：江苏命题规律深度解析', '12课时 | 江苏省考', '针对江苏省考言语理解的独特命题风格进行专项训练，分析江苏言语的难点与解题策略。', 'article', 'intermediate', 12, 0, 135),
(1214, 559, '江苏省考数量关系特训：高难度计算突破', '15课时 | 江苏省考', '针对江苏省考数量关系的高难度特点进行专项训练，攻克江苏数量难题。', 'article', 'advanced', 15, 0, 135),
(1215, 573, '江苏省考判断推理特训：复杂逻辑应对', '12课时 | 江苏省考', '针对江苏省考判断推理的复杂逻辑进行专项训练，提升江苏省考判断能力。', 'article', 'advanced', 12, 0, 135),
(1216, 546, '山东省考言语特训：齐鲁命题风格解读', '10课时 | 山东省考', '针对山东省考言语理解的命题特点进行专项训练，掌握山东言语的解题技巧。', 'article', 'intermediate', 10, 0, 136),
(1217, 559, '山东省考数量关系特训：稳中求进策略', '12课时 | 山东省考', '针对山东省考数量关系的特点进行专项训练，掌握山东数量的解题方法。', 'article', 'intermediate', 12, 0, 136),
(1218, 546, '浙江省考言语特训：浙考命题特色分析', '10课时 | 浙江省考', '针对浙江省考言语理解的命题特色进行专项训练，分析浙考言语的解题要点。', 'article', 'intermediate', 10, 0, 137),
(1219, 573, '浙江省考判断推理特训：图形推理突破', '10课时 | 浙江省考', '针对浙江省考判断推理特别是图形推理进行专项训练，突破浙考判断难点。', 'article', 'intermediate', 10, 0, 137),
(1220, 546, '四川省考言语特训：川考命题规律解析', '10课时 | 四川省考', '针对四川省考言语理解的命题规律进行专项训练，把握四川言语的出题特点。', 'article', 'intermediate', 10, 0, 138),
(1221, 624, '四川省考申论特训：西部发展视角', '12课时 | 四川省考', '针对四川省考申论的命题特点进行专项训练，结合西部大开发等四川特色话题。', 'article', 'intermediate', 12, 0, 138),
(1222, 546, '河南省考言语特训：中原命题特点解读', '10课时 | 河南省考', '针对河南省考言语理解的命题特点进行专项训练，分析中原地区考试特色。', 'article', 'intermediate', 10, 0, 139),
(1223, 546, '湖北省考言语特训：楚天命题风格分析', '10课时 | 湖北省考', '针对湖北省考言语理解的命题风格进行专项训练，把握湖北言语的解题要点。', 'article', 'intermediate', 10, 0, 140),
(1224, 624, '湖北省考申论特训：中部崛起视角', '12课时 | 湖北省考', '针对湖北省考申论的命题特点进行专项训练，结合长江经济带等湖北特色话题。', 'article', 'intermediate', 12, 0, 140);

-- =============================================
-- 八十三、新增课程 - 国考岗位专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1225, 1, '国考税务系统备考攻略：税务岗位全解析', '15课时 | 税务专项', '针对国考税务系统的岗位特点、考情分析与备考策略进行系统讲解，助力税务上岸。', 'article', 'intermediate', 15, 0, 310),
(1226, 1, '国考海关系统备考攻略：海关岗位全解析', '12课时 | 海关专项', '针对国考海关系统的岗位特点、考情分析与备考策略进行系统讲解，助力海关上岸。', 'article', 'intermediate', 12, 0, 311),
(1227, 1, '国考统计系统备考攻略：统计岗位全解析', '10课时 | 统计专项', '针对国考统计系统的岗位特点、考情分析与备考策略进行系统讲解，助力统计上岸。', 'article', 'intermediate', 10, 0, 312),
(1228, 1, '国考铁路公安备考攻略：铁警岗位全解析', '12课时 | 铁警专项', '针对国考铁路公安的岗位特点、考情分析与备考策略进行系统讲解，助力铁警上岸。', 'article', 'intermediate', 12, 0, 313),
(1229, 1, '国考银保监备考攻略：金融监管岗全解析', '15课时 | 银保监专项', '针对国考银保监系统的岗位特点、专业科目与备考策略进行系统讲解，助力银保监上岸。', 'article', 'advanced', 15, 0, 314),
(1230, 1, '国考证监会备考攻略：证券监管岗全解析', '15课时 | 证监会专项', '针对国考证监会的岗位特点、专业科目与备考策略进行系统讲解，助力证监会上岸。', 'article', 'advanced', 15, 0, 315),
(1231, 1, '国考外交部备考攻略：外交官之路', '12课时 | 外交部专项', '针对国考外交部的选拔特点、考试内容与备考策略进行系统讲解，开启外交官之路。', 'article', 'advanced', 12, 0, 316),
(1232, 1, '国考商务部备考攻略：商务岗位全解析', '10课时 | 商务部专项', '针对国考商务部的岗位特点、考情分析与备考策略进行系统讲解，助力商务部上岸。', 'article', 'advanced', 10, 0, 317);

-- =============================================
-- 八十四、新增课程 - 模拟考试与测评系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1233, 1, '国考行测全真模拟（一）：考前实战演练', '1套 | 全真模拟', '高度还原国考行测的题型、难度与时间分配，进行考前实战演练与能力检测。', 'article', 'intermediate', 1, 0, 400),
(1234, 1, '国考行测全真模拟（二）：难度进阶挑战', '1套 | 全真模拟', '进阶难度的国考行测全真模拟，检测综合能力与薄弱环节，针对性提升。', 'article', 'advanced', 1, 0, 401),
(1235, 1, '国考行测全真模拟（三）：冲刺终极检测', '1套 | 全真模拟', '考前冲刺阶段的终极模拟测试，全面检验备考成果，把握考试节奏。', 'article', 'advanced', 1, 0, 402),
(1236, 624, '国考申论全真模拟（一）：考前实战演练', '1套 | 全真模拟', '高度还原国考申论的题型与难度，进行考前实战演练与写作能力检测。', 'article', 'intermediate', 1, 0, 403),
(1237, 624, '国考申论全真模拟（二）：难度进阶挑战', '1套 | 全真模拟', '进阶难度的国考申论全真模拟，检测综合写作能力与时间把控能力。', 'article', 'advanced', 1, 0, 404),
(1238, 1, '省考联考行测全真模拟：联考难度还原', '1套 | 全真模拟', '高度还原省考联考行测的题型与难度，进行考前实战演练与能力检测。', 'article', 'intermediate', 1, 0, 405),
(1239, 624, '省考联考申论全真模拟：联考风格把握', '1套 | 全真模拟', '高度还原省考联考申论的题型与风格，进行考前实战演练与写作检测。', 'article', 'intermediate', 1, 0, 406),
(1240, 716, '结构化面试全真模拟：考场情景还原', '1套 | 全真模拟', '模拟真实面试考场情景，进行结构化面试的实战演练与表现评估。', 'article', 'intermediate', 1, 0, 407);

-- =============================================
-- 八十五、新增课程 - 记忆技巧与方法系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1241, 608, '公基记忆技巧：高效背诵方法论', '6课时 | 记忆技巧', '传授公共基础知识的高效记忆方法，包括联想记忆、口诀记忆、图表记忆等技巧。', 'article', 'basic', 6, 0, 50),
(1242, 612, '法律常识记忆技巧：法条速记方法', '5课时 | 记忆技巧', '传授法律常识的高效记忆方法，通过口诀、案例等方式快速记忆重要法条。', 'article', 'basic', 5, 0, 51),
(1243, 609, '时政热点记忆技巧：热点速记方法', '4课时 | 记忆技巧', '传授时政热点的高效记忆方法，通过关键词、框架等方式快速掌握时政要点。', 'article', 'basic', 4, 0, 52),
(1244, 549, '高频成语记忆技巧：800成语速记', '6课时 | 记忆技巧', '传授高频成语的高效记忆方法，通过词源、故事、对比等方式快速记忆800个常考成语。', 'article', 'basic', 6, 0, 53),
(1245, 617, '常识判断记忆技巧：知识点速记', '5课时 | 记忆技巧', '传授常识判断各模块的高效记忆方法，构建系统的常识知识网络。', 'article', 'basic', 5, 0, 54);

-- =============================================
-- 八十六、新增课程 - 时间管理与答题策略系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1246, 1, '行测时间分配策略：120分钟的艺术', '4课时 | 答题策略', '系统讲解行测考试的时间分配策略，合理安排各模块答题时间，最大化总分。', 'article', 'intermediate', 4, 0, 320),
(1247, 1, '行测答题顺序优化：因人制宜的选择', '3课时 | 答题策略', '分析不同类型考生的答题顺序选择，帮助考生找到最适合自己的答题顺序。', 'article', 'intermediate', 3, 0, 321),
(1248, 1, '行测蒙题技巧：科学猜答的艺术', '3课时 | 答题策略', '传授行测考试中科学蒙题的技巧，在时间紧张时最大化蒙题正确率。', 'article', 'intermediate', 3, 0, 322),
(1249, 624, '申论时间分配策略：180分钟的把控', '3课时 | 答题策略', '系统讲解申论考试的时间分配策略，合理安排各题型答题时间，确保完整作答。', 'article', 'intermediate', 3, 0, 323),
(1250, 624, '申论字数控制技巧：精准达标的方法', '2课时 | 答题策略', '传授申论答题的字数控制技巧，既达到字数要求又不超出格子限制。', 'article', 'intermediate', 2, 0, 324),
(1251, 716, '面试时间把控技巧：分秒必争的表达', '3课时 | 答题策略', '传授面试答题的时间把控技巧，在规定时间内完整、充实地表达观点。', 'article', 'intermediate', 3, 0, 325);

-- =============================================
-- 八十七、新增课程 - 阅读理解进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1252, 551, '长文段阅读技巧：快速把握核心信息', '5课时 | 阅读进阶', '专项训练长文段阅读的技巧，快速定位关键信息，提高阅读效率。', 'article', 'advanced', 5, 0, 70),
(1253, 551, '议论文阅读技巧：论点论据快速识别', '4课时 | 阅读进阶', '专项训练议论文阅读的技巧，快速识别论点、论据与论证结构。', 'article', 'intermediate', 4, 0, 71),
(1254, 551, '说明文阅读技巧：科技文章快速理解', '4课时 | 阅读进阶', '专项训练说明文阅读的技巧，快速理解科技类、说明类文章的核心内容。', 'article', 'intermediate', 4, 0, 72),
(1255, 551, '文学类阅读技巧：散文小说深度理解', '4课时 | 阅读进阶', '专项训练文学类文段阅读的技巧，深度理解散文、小说等文学作品的内涵。', 'article', 'intermediate', 4, 0, 73),
(1256, 551, '双文段阅读技巧：对比分析与综合理解', '4课时 | 阅读进阶', '专项训练双文段阅读的技巧，掌握对比分析与综合理解的方法。', 'article', 'advanced', 4, 0, 74);

-- =============================================
-- 八十八、新增课程 - 数学思维训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1257, 560, '数学建模思维：问题抽象与模型构建', '6课时 | 思维训练', '培养数学建模思维，学会将复杂问题抽象为数学模型，找到解题突破口。', 'article', 'advanced', 6, 0, 90),
(1258, 560, '代入排除思维：快速验证与排除', '4课时 | 思维训练', '深入训练代入排除法的思维方式，快速验证选项、排除干扰。', 'article', 'intermediate', 4, 0, 91),
(1259, 560, '整体思维训练：化繁为简的艺术', '4课时 | 思维训练', '培养整体思维，学会从整体角度审视问题，避免繁琐的分步计算。', 'article', 'intermediate', 4, 0, 92),
(1260, 560, '逆向思维训练：反向推理的技巧', '4课时 | 思维训练', '培养逆向思维，学会从结果反推条件，快速找到解题路径。', 'article', 'intermediate', 4, 0, 93),
(1261, 560, '极端思维训练：边界情况的分析', '4课时 | 思维训练', '培养极端思维，学会分析边界情况，快速确定答案范围。', 'article', 'intermediate', 4, 0, 94);

-- =============================================
-- 八十九、新增课程 - 图形推理专项突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1262, 574, '九宫格图形推理专项：矩阵规律发现', '5课时 | 图形专项', '专项训练九宫格图形推理，掌握矩阵行列规律、对角线规律等解题方法。', 'article', 'intermediate', 5, 0, 65),
(1263, 574, '分组分类图形推理专项：特征分类技巧', '4课时 | 图形专项', '专项训练分组分类图形推理，掌握图形特征分类的技巧与方法。', 'article', 'intermediate', 4, 0, 66),
(1264, 574, '立体图形专项：三维空间推理', '6课时 | 图形专项', '专项训练立体图形推理，掌握三维空间想象与推理的方法。', 'article', 'advanced', 6, 0, 67),
(1265, 574, '图形创新题型专项：新题型应对策略', '4课时 | 图形专项', '针对图形推理的创新题型进行专项训练，掌握新题型的应对策略。', 'article', 'advanced', 4, 0, 68),
(1266, 574, '图形推理易错点精析：常见误区规避', '4课时 | 图形专项', '汇总图形推理常见易错点，分析错误原因，帮助考生规避常见误区。', 'article', 'intermediate', 4, 0, 69);

-- =============================================
-- 九十、新增课程 - 定义判断专项突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1267, 580, '法律类定义判断专项：法律术语辨析', '4课时 | 定义专项', '专项训练法律类定义判断，掌握法律术语的准确理解与辨析方法。', 'article', 'intermediate', 4, 0, 30),
(1268, 580, '心理学定义判断专项：心理现象理解', '4课时 | 定义专项', '专项训练心理学类定义判断，掌握心理学术语与心理现象的理解方法。', 'article', 'intermediate', 4, 0, 31),
(1269, 580, '管理学定义判断专项：管理概念辨析', '4课时 | 定义专项', '专项训练管理学类定义判断，掌握管理学概念的准确理解与应用。', 'article', 'intermediate', 4, 0, 32),
(1270, 580, '经济学定义判断专项：经济术语理解', '4课时 | 定义专项', '专项训练经济学类定义判断，掌握经济学术语的准确理解与辨析。', 'article', 'intermediate', 4, 0, 33),
(1271, 580, '社会学定义判断专项：社会现象分析', '4课时 | 定义专项', '专项训练社会学类定义判断，掌握社会学概念与社会现象的理解方法。', 'article', 'intermediate', 4, 0, 34);

-- =============================================
-- 九十一、新增课程 - 类比推理专项突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1272, 583, '常识类类比推理专项：知识积累与运用', '4课时 | 类比专项', '专项训练常识类类比推理，提升常识积累与类比推理能力的结合运用。', 'article', 'intermediate', 4, 0, 40),
(1273, 583, '成语类类比推理专项：成语关系辨析', '4课时 | 类比专项', '专项训练成语类类比推理，掌握成语之间关系的辨析方法。', 'article', 'intermediate', 4, 0, 41),
(1274, 583, '词语类类比推理专项：词汇关系分析', '4课时 | 类比专项', '专项训练词语类类比推理，掌握词语之间各种关系的分析方法。', 'article', 'intermediate', 4, 0, 42),
(1275, 583, '类比推理二级辨析：相似选项区分', '4课时 | 类比专项', '专项训练类比推理的二级辨析，掌握相似选项的精准区分方法。', 'article', 'advanced', 4, 0, 43);

-- =============================================
-- 九十二、新增课程 - 申论素材积累系列（扩展）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1276, 624, '申论金句素材库：开头结尾万能句式', '5课时 | 素材积累', '积累申论写作的金句素材，掌握开头、结尾的万能句式与表达模板。', 'article', 'basic', 5, 0, 90),
(1277, 624, '申论案例素材库：典型案例深度解析', '6课时 | 素材积累', '积累申论写作的典型案例素材，学会案例的选取、裁剪与运用方法。', 'article', 'intermediate', 6, 0, 91),
(1278, 624, '申论名言警句库：古今名言巧妙运用', '4课时 | 素材积累', '积累申论写作的名言警句素材，学会古今名言的恰当引用与运用。', 'article', 'basic', 4, 0, 92),
(1279, 624, '申论政策表述库：官方语言规范表达', '5课时 | 素材积累', '积累申论写作的政策表述素材，学会使用规范的官方语言进行表达。', 'article', 'intermediate', 5, 0, 93),
(1280, 624, '申论论证方法库：多元论证增强说服力', '5课时 | 素材积累', '掌握申论写作的多种论证方法，包括举例论证、对比论证、引用论证等。', 'article', 'intermediate', 5, 0, 94);

-- =============================================
-- 九十三、新增课程 - 面试题型专项系列（扩展）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1281, 719, '综合分析之社会现象题：热点问题深度剖析', '6课时 | 题型专项', '专项训练社会现象类综合分析题，掌握社会热点问题的深度分析方法。', 'article', 'intermediate', 6, 0, 80),
(1282, 719, '综合分析之名言警句题：哲理思辨与阐释', '5课时 | 题型专项', '专项训练名言警句类综合分析题，掌握哲理思辨与深度阐释的方法。', 'article', 'intermediate', 5, 0, 81),
(1283, 719, '综合分析之政策理解题：政策解读与评价', '5课时 | 题型专项', '专项训练政策理解类综合分析题，掌握政策解读与客观评价的方法。', 'article', 'intermediate', 5, 0, 82),
(1284, 726, '组织计划之调研题：调研设计与实施', '5课时 | 题型专项', '专项训练调研类组织计划题，掌握调研设计、实施与报告的完整流程。', 'article', 'intermediate', 5, 0, 83),
(1285, 726, '组织计划之宣传题：宣传策划与执行', '4课时 | 题型专项', '专项训练宣传类组织计划题，掌握宣传策划、形式选择与效果评估的方法。', 'article', 'intermediate', 4, 0, 84),
(1286, 726, '组织计划之活动题：活动策划与组织', '5课时 | 题型专项', '专项训练活动类组织计划题，掌握活动策划、组织协调与应急处理的方法。', 'article', 'intermediate', 5, 0, 85),
(1287, 733, '人际关系之与领导相处：向上沟通的艺术', '4课时 | 题型专项', '专项训练与领导相处类人际关系题，掌握向上沟通与汇报工作的艺术。', 'article', 'intermediate', 4, 0, 86),
(1288, 733, '人际关系之与同事相处：平级协作的智慧', '4课时 | 题型专项', '专项训练与同事相处类人际关系题，掌握平级协作与团队合作的智慧。', 'article', 'intermediate', 4, 0, 87),
(1289, 733, '人际关系之与群众相处：服务意识的体现', '4课时 | 题型专项', '专项训练与群众相处类人际关系题，掌握群众工作方法与服务意识的体现。', 'article', 'intermediate', 4, 0, 88),
(1290, 740, '应急应变之公共危机：危机处置与舆情应对', '5课时 | 题型专项', '专项训练公共危机类应急应变题，掌握危机处置与舆情应对的方法。', 'article', 'intermediate', 5, 0, 89),
(1291, 740, '应急应变之工作冲突：矛盾化解与优先处理', '4课时 | 题型专项', '专项训练工作冲突类应急应变题，掌握矛盾化解与任务优先级处理的方法。', 'article', 'intermediate', 4, 0, 90);

-- =============================================
-- 九十四、新增课程 - 无领导小组讨论系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1292, 716, '无领导小组讨论入门：流程规则与角色定位', '4课时 | 无领导讨论', '系统讲解无领导小组讨论的基本流程、规则与角色定位，建立正确认知。', 'article', 'basic', 4, 0, 90),
(1293, 716, '无领导讨论之开放式题目：发散思维与观点表达', '4课时 | 无领导讨论', '专项训练开放式无领导讨论题目，培养发散思维与有效观点表达能力。', 'article', 'intermediate', 4, 0, 91),
(1294, 716, '无领导讨论之两难式题目：立场选择与论证', '4课时 | 无领导讨论', '专项训练两难式无领导讨论题目，掌握立场选择与有力论证的方法。', 'article', 'intermediate', 4, 0, 92),
(1295, 716, '无领导讨论之排序式题目：标准确立与排序逻辑', '4课时 | 无领导讨论', '专项训练排序式无领导讨论题目，掌握排序标准确立与排序逻辑的方法。', 'article', 'intermediate', 4, 0, 93),
(1296, 716, '无领导讨论之资源争夺题：利益博弈与共识达成', '4课时 | 无领导讨论', '专项训练资源争夺式无领导讨论题目，掌握利益博弈与共识达成的策略。', 'article', 'intermediate', 4, 0, 94),
(1297, 716, '无领导讨论领导者角色：引领讨论与总结陈词', '4课时 | 无领导讨论', '专项训练无领导讨论中领导者角色的发挥，掌握引领讨论与总结陈词的技巧。', 'article', 'advanced', 4, 0, 95),
(1298, 716, '无领导讨论追随者角色：有效参与与适时补充', '3课时 | 无领导讨论', '专项训练无领导讨论中追随者角色的发挥，掌握有效参与与适时补充的方法。', 'article', 'intermediate', 3, 0, 96);

-- =============================================
-- 九十五、新增课程 - 历年真题精解系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1299, 546, '2025国考言语真题精解：命题趋势深度分析', '8课时 | 真题精解', '逐题精讲2025年国考言语理解真题，分析命题趋势与解题技巧。', 'article', 'intermediate', 8, 0, 190),
(1300, 559, '2025国考数量关系真题精解：难题攻克策略', '8课时 | 真题精解', '逐题精讲2025年国考数量关系真题，分析难题特点与攻克策略。', 'article', 'advanced', 8, 0, 190),
(1301, 573, '2025国考判断推理真题精解：逻辑思维训练', '8课时 | 真题精解', '逐题精讲2025年国考判断推理真题，训练逻辑思维与解题能力。', 'article', 'intermediate', 8, 0, 190),
(1302, 593, '2025国考资料分析真题精解：数据处理技巧', '6课时 | 真题精解', '逐题精讲2025年国考资料分析真题，提升数据处理与速算能力。', 'article', 'intermediate', 6, 0, 190),
(1303, 624, '2025国考申论真题精解（地市级）：写作范本学习', '8课时 | 真题精解', '逐题精讲2025年国考申论（地市级）真题，学习高分答案的写作方法。', 'article', 'intermediate', 8, 0, 190),
(1304, 624, '2025国考申论真题精解（副省级）：高难度写作', '8课时 | 真题精解', '逐题精讲2025年国考申论（副省级）真题，攻克高难度写作题目。', 'article', 'advanced', 8, 0, 191),
(1305, 546, '2024国考言语真题精解：经典题目回顾', '8课时 | 真题精解', '逐题精讲2024年国考言语理解真题，回顾经典题目与解题方法。', 'article', 'intermediate', 8, 0, 192),
(1306, 559, '2024国考数量关系真题精解：计算技巧总结', '8课时 | 真题精解', '逐题精讲2024年国考数量关系真题，总结各类计算技巧。', 'article', 'intermediate', 8, 0, 192);

-- =============================================
-- 九十六、新增课程 - 专项能力测评系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1307, 546, '言语理解能力诊断测评：找准薄弱环节', '1套 | 能力测评', '通过诊断性测评找准言语理解的薄弱环节，为针对性学习提供依据。', 'article', 'basic', 1, 1, 0),
(1308, 559, '数量关系能力诊断测评：明确提升方向', '1套 | 能力测评', '通过诊断性测评明确数量关系的提升方向，为制定学习计划提供参考。', 'article', 'basic', 1, 1, 0),
(1309, 573, '判断推理能力诊断测评：定位思维短板', '1套 | 能力测评', '通过诊断性测评定位判断推理的思维短板，为针对性训练提供依据。', 'article', 'basic', 1, 1, 0),
(1310, 593, '资料分析能力诊断测评：检测计算水平', '1套 | 能力测评', '通过诊断性测评检测资料分析的计算水平，为提速训练提供参考。', 'article', 'basic', 1, 1, 0),
(1311, 624, '申论写作能力诊断测评：评估写作水平', '1套 | 能力测评', '通过诊断性测评评估申论写作的整体水平，为写作训练提供方向。', 'article', 'basic', 1, 1, 0),
(1312, 716, '面试表达能力诊断测评：了解表现水平', '1套 | 能力测评', '通过诊断性测评了解面试表达的表现水平，为面试训练提供依据。', 'article', 'basic', 1, 1, 0);

-- =============================================
-- 九十七、新增课程 - 考试技巧速成系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1313, 1, '行测考场技巧速成：实战经验大全', '5课时 | 考场技巧', '汇总行测考场的实战技巧，包括涂卡策略、时间预警、心态调整等经验。', 'article', 'intermediate', 5, 0, 330),
(1314, 624, '申论考场技巧速成：写作实战指南', '4课时 | 考场技巧', '汇总申论考场的实战技巧，包括审题方法、卷面规范、时间把控等经验。', 'article', 'intermediate', 4, 0, 331),
(1315, 716, '面试考场技巧速成：临场发挥指南', '4课时 | 考场技巧', '汇总面试考场的实战技巧，包括进场礼仪、答题节奏、情绪管理等经验。', 'article', 'intermediate', 4, 0, 332),
(1316, 1, '机考适应性训练：电脑答题技巧', '3课时 | 考场技巧', '针对机考形式进行适应性训练，掌握电脑答题的操作技巧与注意事项。', 'article', 'basic', 3, 0, 333),
(1317, 1, '考前一周冲刺计划：最后的查漏补缺', '3课时 | 考场技巧', '制定考前一周的冲刺计划，进行最后的查漏补缺与状态调整。', 'article', 'intermediate', 3, 0, 334);

-- =============================================
-- 九十八、新增课程 - 职业发展规划系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1318, 1, '公务员职业发展路径：晋升通道解读', '4课时 | 职业规划', '系统介绍公务员的职业发展路径与晋升通道，帮助考生了解未来发展空间。', 'article', 'basic', 4, 1, 340),
(1319, 1, '公务员岗位选择策略：如何选择适合的岗位', '4课时 | 职业规划', '讲解公务员岗位选择的策略与方法，帮助考生找到最适合自己的岗位。', 'article', 'basic', 4, 1, 341),
(1320, 1, '体制内生存法则：新人入职指南', '5课时 | 职业规划', '介绍体制内的生存法则与职场礼仪，帮助新人顺利度过入职适应期。', 'article', 'basic', 5, 1, 342),
(1321, 1, '公务员能力提升：持续成长之路', '4课时 | 职业规划', '介绍公务员在职能力提升的方法与途径，帮助实现持续职业成长。', 'article', 'basic', 4, 1, 343);

-- =============================================
-- 九十九、新增课程 - 常识专题深度系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1322, 617, '中国古代史常识专题：朝代更迭与重大事件', '8课时 | 常识深度', '深度讲解中国古代史的高频考点，包括朝代更迭、重大事件、著名人物等。', 'article', 'intermediate', 8, 0, 60),
(1323, 617, '中国近现代史常识专题：变革与发展', '8课时 | 常识深度', '深度讲解中国近现代史的高频考点，包括重要运动、战争、改革等内容。', 'article', 'intermediate', 8, 0, 61),
(1324, 617, '世界历史常识专题：重要事件与人物', '6课时 | 常识深度', '深度讲解世界历史的高频考点，包括重大事件、历史人物、文明发展等。', 'article', 'intermediate', 6, 0, 62),
(1325, 617, '中国地理常识专题：自然与人文地理', '8课时 | 常识深度', '深度讲解中国地理的高频考点，包括自然地理、人文地理、区域特色等。', 'article', 'intermediate', 8, 0, 63),
(1326, 617, '世界地理常识专题：各洲地理特点', '6课时 | 常识深度', '深度讲解世界地理的高频考点，包括各大洲地理特点、重要国家等内容。', 'article', 'intermediate', 6, 0, 64),
(1327, 617, '科技常识专题：前沿科技与日常生活', '8课时 | 常识深度', '深度讲解科技常识的高频考点，包括前沿科技发展与日常生活科学原理。', 'article', 'intermediate', 8, 0, 65),
(1328, 617, '文学常识专题：中外文学名著与作家', '8课时 | 常识深度', '深度讲解文学常识的高频考点，包括中外文学名著、著名作家与作品等。', 'article', 'intermediate', 8, 0, 66),
(1329, 617, '艺术常识专题：音乐美术与传统文化', '6课时 | 常识深度', '深度讲解艺术常识的高频考点，包括音乐、美术、传统文化等内容。', 'article', 'intermediate', 6, 0, 67);

-- =============================================
-- 一百、新增课程 - 法律专项深度系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1330, 612, '宪法专题精讲：国家根本大法', '8课时 | 法律深度', '深度讲解宪法的核心内容，包括国家制度、公民权利、国家机构等重点。', 'article', 'intermediate', 8, 0, 30),
(1331, 612, '民法典专题精讲：民事法律关系', '12课时 | 法律深度', '深度讲解民法典的核心内容，包括物权、合同、婚姻家庭、继承等重点。', 'article', 'intermediate', 12, 0, 31),
(1332, 612, '刑法专题精讲：犯罪与刑罚', '10课时 | 法律深度', '深度讲解刑法的核心内容，包括犯罪构成、刑罚种类、常见罪名等重点。', 'article', 'intermediate', 10, 0, 32),
(1333, 612, '行政法专题精讲：行政行为与救济', '8课时 | 法律深度', '深度讲解行政法的核心内容，包括行政行为、行政复议、行政诉讼等重点。', 'article', 'intermediate', 8, 0, 33),
(1334, 612, '诉讼法专题精讲：三大诉讼程序', '8课时 | 法律深度', '深度讲解诉讼法的核心内容，包括民事诉讼、刑事诉讼、行政诉讼程序。', 'article', 'intermediate', 8, 0, 34),
(1335, 612, '劳动法与社会保障法专题：劳动者权益保护', '6课时 | 法律深度', '深度讲解劳动法与社会保障法的核心内容，重点关注劳动者权益保护。', 'article', 'intermediate', 6, 0, 35),
(1336, 612, '新法新规专题：最新法律动态解读', '4课时 | 法律深度', '及时解读最新颁布或修订的法律法规，把握法律考点的最新变化。', 'article', 'intermediate', 4, 0, 36);

-- =============================================
-- 一百零一、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习类比推理，掌握语义关系、逻辑关系、语法关系等类比分析方法。',
    `long_description` = '类比推理是判断推理的重要题型，主要考查考生对词语之间关系的理解和分析能力。本课程体系涵盖语义关系（近义、反义、象征）、逻辑关系（并列、包含、交叉）、语法关系（主谓、动宾、偏正）等类比分析方法，帮助考生全面提升类比推理的正确率。'
WHERE `id` = 583;

UPDATE `what_course_categories` SET 
    `description` = '系统学习定义判断，掌握定义理解、关键词提取、选项匹配等解题方法。',
    `long_description` = '定义判断是判断推理的基础题型，主要考查考生对定义的理解和应用能力。本课程体系涵盖定义理解方法（提取核心要素、理清逻辑关系）、常见定义类型（法律、经济、管理、心理）、选项匹配技巧等内容，帮助考生准确把握定义内涵并快速完成选项匹配。'
WHERE `id` = 580;

UPDATE `what_course_categories` SET 
    `description` = '系统学习语句表达，掌握语句排序、语句填空等题型的解题技巧。',
    `long_description` = '语句表达是言语理解与表达的重要组成部分，主要考查考生的语句组织和表达能力。本课程体系涵盖语句排序（首尾句判断、关键词衔接、逻辑顺序）、语句填空（总结句、过渡句、引领句）等题型，帮助考生快速理清句间关系，准确完成语句组织。'
WHERE `id` = 556;

UPDATE `what_course_categories` SET 
    `description` = '系统学习数字推理，掌握基础数列、递推数列、特殊数列等数字规律。',
    `long_description` = '数字推理是数量关系的重要组成部分，主要考查考生对数字规律的发现和推理能力。本课程体系涵盖基础数列（等差、等比、质数、合数）、递推数列（和数列、积数列、倍数数列）、特殊数列（分数数列、幂次数列、多重数列）等内容，帮助考生快速识别数列规律。'
WHERE `id` = 569;

UPDATE `what_course_categories` SET 
    `description` = '系统学习资料分析的统计术语、速算技巧与数据处理方法。',
    `long_description` = '资料分析是行测考试的重要模块，主要考查考生对统计数据的分析和处理能力。本课程体系涵盖统计术语（同比、环比、百分点、比重）、速算技巧（首数法、尾数法、特征数字法、有效数字法）、材料类型（文字材料、表格材料、图形材料、综合材料）等内容。'
WHERE `id` = 593;

UPDATE `what_course_categories` SET 
    `description` = '系统学习申论归纳概括题型，掌握要点提取与归纳整合的方法。',
    `long_description` = '归纳概括是申论考试的基础题型，主要考查考生对材料信息的提取和归纳能力。本课程体系涵盖材料阅读方法（分层阅读、关键词标注）、要点提取技巧（直接摘抄、归纳概括）、答案整合方法（分类汇总、逻辑排序）等内容，帮助考生全面提升归纳概括能力。'
WHERE `id` = 625;

UPDATE `what_course_categories` SET 
    `description` = '系统学习申论综合分析题型，掌握问题分析与观点阐释的方法。',
    `long_description` = '综合分析是申论考试的核心题型，主要考查考生对材料的深度理解和分析能力。本课程体系涵盖词句理解题、启示分析题、观点评价题等题型的解题方法，帮助考生建立系统的分析框架，提升综合分析题的得分能力。'
WHERE `id` = 631;

UPDATE `what_course_categories` SET 
    `description` = '系统学习申论提出对策题型，掌握问题诊断与对策提出的方法。',
    `long_description` = '提出对策是申论考试的重要题型，主要考查考生发现问题、分析问题、解决问题的能力。本课程体系涵盖问题诊断方法（材料中直接对策、间接对策推导）、对策来源（政策依据、成功经验、问题反推）、答案规范（具体可行、针对性强）等内容。'
WHERE `id` = 637;

-- =============================================
-- 一百零二、新增课程 - 经济学知识专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1337, 608, '微观经济学基础：市场机制与消费者行为', '8课时 | 经济学专题', '系统讲解微观经济学的基本原理，包括供需关系、消费者行为、生产者行为等核心概念。', 'article', 'intermediate', 8, 0, 70),
(1338, 608, '宏观经济学基础：国民经济与政策调控', '8课时 | 经济学专题', '系统讲解宏观经济学的基本原理，包括GDP、通货膨胀、财政政策、货币政策等核心内容。', 'article', 'intermediate', 8, 0, 71),
(1339, 608, '国际经济与贸易：全球化与区域合作', '6课时 | 经济学专题', '讲解国际经济与贸易的基本知识，包括国际贸易理论、汇率、国际组织等内容。', 'article', 'intermediate', 6, 0, 72),
(1340, 608, '中国经济发展专题：改革开放与新发展格局', '6课时 | 经济学专题', '深入解读中国经济发展历程与当前经济形势，把握新发展格局的内涵。', 'article', 'intermediate', 6, 0, 73),
(1341, 608, '经济热点解读：当前经济形势与政策走向', '4课时 | 经济学专题', '解读当前经济热点问题与政策走向，为公考提供经济分析素材。', 'article', 'intermediate', 4, 0, 74);

-- =============================================
-- 一百零三、新增课程 - 哲学知识专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1342, 609, '马克思主义哲学原理：唯物论与辩证法', '10课时 | 哲学专题', '系统讲解马克思主义哲学的基本原理，包括唯物论、辩证法、认识论、历史唯物主义等。', 'article', 'intermediate', 10, 0, 30),
(1343, 609, '马克思主义中国化：毛泽东思想概论', '8课时 | 哲学专题', '系统讲解毛泽东思想的形成、发展与主要内容，理解其历史地位与当代价值。', 'article', 'intermediate', 8, 0, 31),
(1344, 609, '中国特色社会主义理论体系：核心要义', '10课时 | 哲学专题', '全面讲解中国特色社会主义理论体系，包括邓小平理论、三个代表、科学发展观等。', 'article', 'intermediate', 10, 0, 32),
(1345, 609, '习近平新时代中国特色社会主义思想精讲', '12课时 | 哲学专题', '深入学习习近平新时代中国特色社会主义思想的核心要义与实践要求。', 'article', 'intermediate', 12, 0, 33),
(1346, 609, '中国共产党历史专题：百年奋斗历程', '8课时 | 哲学专题', '系统回顾中国共产党的百年奋斗历程，学习党史中的重要事件与经验教训。', 'article', 'intermediate', 8, 0, 34);

-- =============================================
-- 一百零四、新增课程 - 管理学知识专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1347, 608, '管理学基础：计划、组织、领导、控制', '8课时 | 管理学专题', '系统讲解管理学的四大职能，掌握管理学的基本理论与方法。', 'article', 'intermediate', 8, 0, 80),
(1348, 608, '公共管理学专题：政府治理与公共服务', '8课时 | 管理学专题', '深入讲解公共管理学的核心内容，理解政府治理与公共服务的基本原理。', 'article', 'intermediate', 8, 0, 81),
(1349, 608, '行政管理学专题：行政组织与行政效率', '6课时 | 管理学专题', '讲解行政管理学的基本概念，包括行政组织、行政决策、行政效率等内容。', 'article', 'intermediate', 6, 0, 82),
(1350, 608, '人力资源管理专题：选人用人与绩效管理', '5课时 | 管理学专题', '讲解人力资源管理的基本知识，包括招聘、培训、绩效、薪酬等内容。', 'article', 'intermediate', 5, 0, 83),
(1351, 608, '领导科学专题：领导力与团队建设', '5课时 | 管理学专题', '讲解领导科学的基本理论，包括领导风格、激励理论、团队建设等内容。', 'article', 'intermediate', 5, 0, 84);

-- =============================================
-- 一百零五、新增课程 - 写作能力提升系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1352, 624, '议论文写作基础：论点、论据、论证', '6课时 | 写作提升', '系统讲解议论文写作的基本要素，掌握论点提出、论据选择、论证方法。', 'article', 'basic', 6, 0, 100),
(1353, 624, '申论文章开头技巧：引人入胜的第一段', '4课时 | 写作提升', '专项训练申论文章开头的写作技巧，学会多种开头方式与表达手法。', 'article', 'intermediate', 4, 0, 101),
(1354, 624, '申论文章结尾技巧：画龙点睛的收尾', '3课时 | 写作提升', '专项训练申论文章结尾的写作技巧，学会升华主题与呼应开头的方法。', 'article', 'intermediate', 3, 0, 102),
(1355, 624, '申论段落写作技巧：层次分明的论述', '5课时 | 写作提升', '专项训练申论段落的写作技巧，掌握段落结构、过渡衔接的方法。', 'article', 'intermediate', 5, 0, 103),
(1356, 624, '申论语言表达技巧：规范准确的表述', '4课时 | 写作提升', '专项训练申论的语言表达，掌握规范准确、简洁有力的表述方法。', 'article', 'intermediate', 4, 0, 104),
(1357, 624, '申论标题拟定技巧：醒目有力的标题', '3课时 | 写作提升', '专项训练申论文章标题的拟定技巧，学会拟定醒目、准确、有力的标题。', 'article', 'intermediate', 3, 0, 105);

-- =============================================
-- 一百零六、新增课程 - 批判性思维训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1358, 587, '批判性思维导论：什么是好的论证', '4课时 | 思维训练', '引导建立批判性思维意识，理解什么是好的论证，识别常见的逻辑谬误。', 'article', 'intermediate', 4, 0, 70),
(1359, 587, '论证结构分析：前提与结论的关系', '4课时 | 思维训练', '深入分析论证的结构，掌握识别前提、结论及其关系的方法。', 'article', 'intermediate', 4, 0, 71),
(1360, 587, '常见逻辑谬误识别：避免思维陷阱', '5课时 | 思维训练', '系统讲解常见的逻辑谬误类型，学会识别和避免思维陷阱。', 'article', 'intermediate', 5, 0, 72),
(1361, 587, '证据评估与可信度判断：信息甄别', '4课时 | 思维训练', '培养证据评估能力，学会判断信息的可信度与相关性。', 'article', 'intermediate', 4, 0, 73),
(1362, 587, '反驳与质疑技巧：有效的批判方法', '4课时 | 思维训练', '掌握有效的反驳与质疑技巧，提升批判性分析能力。', 'article', 'advanced', 4, 0, 74);

-- =============================================
-- 一百零七、新增课程 - 面试模拟实战系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1363, 716, '结构化面试模拟实战（一）：综合分析专场', '1套 | 模拟实战', '综合分析类题目的模拟面试实战，包含完整的题目、参考答案与点评。', 'article', 'intermediate', 1, 0, 100),
(1364, 716, '结构化面试模拟实战（二）：组织计划专场', '1套 | 模拟实战', '组织计划类题目的模拟面试实战，包含完整的题目、参考答案与点评。', 'article', 'intermediate', 1, 0, 101),
(1365, 716, '结构化面试模拟实战（三）：人际关系专场', '1套 | 模拟实战', '人际关系类题目的模拟面试实战，包含完整的题目、参考答案与点评。', 'article', 'intermediate', 1, 0, 102),
(1366, 716, '结构化面试模拟实战（四）：应急应变专场', '1套 | 模拟实战', '应急应变类题目的模拟面试实战，包含完整的题目、参考答案与点评。', 'article', 'intermediate', 1, 0, 103),
(1367, 716, '结构化面试模拟实战（五）：综合套题', '1套 | 模拟实战', '包含各类题型的综合套题模拟面试，全面检验面试备考成果。', 'article', 'intermediate', 1, 0, 104),
(1368, 716, '国考面试模拟实战：税务系统专场', '1套 | 模拟实战', '针对国考税务系统面试的模拟实战，还原税务面试的题型与风格。', 'article', 'intermediate', 1, 0, 105),
(1369, 716, '国考面试模拟实战：海关系统专场', '1套 | 模拟实战', '针对国考海关系统面试的模拟实战，还原海关面试的题型与风格。', 'article', 'intermediate', 1, 0, 106),
(1370, 716, '省考面试模拟实战：联考风格专场', '1套 | 模拟实战', '针对省考联考面试风格的模拟实战，把握联考面试的命题特点。', 'article', 'intermediate', 1, 0, 107);

-- =============================================
-- 一百零八、新增课程 - 申论专项写作训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1371, 643, '申论大作文写作训练（一）：经济发展主题', '2课时 | 写作训练', '以经济发展为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 50),
(1372, 643, '申论大作文写作训练（二）：社会治理主题', '2课时 | 写作训练', '以社会治理为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 51),
(1373, 643, '申论大作文写作训练（三）：生态文明主题', '2课时 | 写作训练', '以生态文明为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 52),
(1374, 643, '申论大作文写作训练（四）：文化建设主题', '2课时 | 写作训练', '以文化建设为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 53),
(1375, 643, '申论大作文写作训练（五）：民生保障主题', '2课时 | 写作训练', '以民生保障为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 54),
(1376, 643, '申论大作文写作训练（六）：科技创新主题', '2课时 | 写作训练', '以科技创新为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 55),
(1377, 643, '申论大作文写作训练（七）：乡村振兴主题', '2课时 | 写作训练', '以乡村振兴为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 56),
(1378, 643, '申论大作文写作训练（八）：依法治国主题', '2课时 | 写作训练', '以依法治国为主题的申论大作文写作训练，包含范文解析与写作指导。', 'article', 'intermediate', 2, 0, 57);

-- =============================================
-- 一百零九、新增课程 - 时政热点分析系列（扩展）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1379, 609, '两会热点解读：政府工作报告深度分析', '4课时 | 时政分析', '深度解读两会政府工作报告，把握国家政策走向与发展重点。', 'article', 'intermediate', 4, 0, 40),
(1380, 609, '重要会议精神解读：中央全会与重大决策', '4课时 | 时政分析', '解读中央重要会议精神，理解重大决策部署的背景与内涵。', 'article', 'intermediate', 4, 0, 41),
(1381, 609, '国际形势分析：大国关系与全球治理', '4课时 | 时政分析', '分析当前国际形势，理解大国关系变化与全球治理的中国方案。', 'article', 'intermediate', 4, 0, 42),
(1382, 609, '区域发展战略解读：京津冀、长三角、大湾区', '4课时 | 时政分析', '解读重大区域发展战略，理解区域协调发展的政策导向。', 'article', 'intermediate', 4, 0, 43),
(1383, 609, '改革开放前沿：自贸区与高水平开放', '3课时 | 时政分析', '解读自贸区建设与高水平对外开放政策，把握改革开放新动向。', 'article', 'intermediate', 3, 0, 44);

-- =============================================
-- 一百一十、新增课程 - 资料分析高级技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1384, 593, '资料分析特殊数字记忆：高效估算基础', '3课时 | 高级技巧', '系统记忆资料分析中的特殊数字，为高效估算打下基础。', 'article', 'intermediate', 3, 0, 60),
(1385, 593, '资料分析截位直除法：精确与速度的平衡', '4课时 | 高级技巧', '深入讲解截位直除法的原理与应用，实现精确与速度的平衡。', 'article', 'advanced', 4, 0, 61),
(1386, 593, '资料分析差分比较法：快速比较大小', '3课时 | 高级技巧', '掌握差分比较法的原理与技巧，快速完成数据大小比较。', 'article', 'advanced', 3, 0, 62),
(1387, 593, '资料分析十字交叉法：混合比例问题', '3课时 | 高级技巧', '掌握十字交叉法的原理与应用，快速解决混合比例问题。', 'article', 'advanced', 3, 0, 63),
(1388, 593, '资料分析综合材料攻略：复杂材料快速处理', '5课时 | 高级技巧', '专项训练综合材料的处理方法，掌握复杂材料的快速阅读与数据定位。', 'article', 'advanced', 5, 0, 64);

-- =============================================
-- 一百一十一、新增课程 - 言语理解高级技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1389, 546, '言语理解行文脉络分析：快速把握文章结构', '5课时 | 高级技巧', '深入训练行文脉络分析能力，快速把握文章的结构与逻辑。', 'article', 'advanced', 5, 0, 80),
(1390, 546, '言语理解关键词定位法：精准锁定答案区间', '4课时 | 高级技巧', '掌握关键词定位法，精准锁定答案所在区间，提高解题效率。', 'article', 'advanced', 4, 0, 81),
(1391, 546, '言语理解选项分析技巧：排除干扰选项', '4课时 | 高级技巧', '深入分析选项设置规律，掌握排除干扰选项的技巧与方法。', 'article', 'advanced', 4, 0, 82),
(1392, 546, '言语理解语境分析法：准确理解词语含义', '4课时 | 高级技巧', '掌握语境分析法，通过上下文准确理解词语在特定语境中的含义。', 'article', 'advanced', 4, 0, 83),
(1393, 546, '言语理解感情色彩辨析：把握词语感情倾向', '3课时 | 高级技巧', '深入训练感情色彩辨析能力，准确把握词语的感情倾向。', 'article', 'intermediate', 3, 0, 84);

-- =============================================
-- 一百一十二、新增课程 - 公务员职业道德系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1394, 608, '公务员职业道德概述：忠诚、干净、担当', '4课时 | 职业道德', '系统讲解公务员职业道德的基本内涵，理解忠诚、干净、担当的要求。', 'article', 'basic', 4, 0, 90),
(1395, 608, '公务员依法行政：法治思维与法治方式', '4课时 | 职业道德', '讲解公务员依法行政的要求，培养法治思维与法治方式。', 'article', 'intermediate', 4, 0, 91),
(1396, 608, '公务员廉政建设：廉洁从政的底线', '4课时 | 职业道德', '讲解公务员廉政建设的要求，明确廉洁从政的底线与红线。', 'article', 'intermediate', 4, 0, 92),
(1397, 608, '公务员服务意识：人民至上的理念', '3课时 | 职业道德', '培养公务员的服务意识，树立人民至上的工作理念。', 'article', 'basic', 3, 0, 93),
(1398, 608, '公务员责任担当：敢于负责的精神', '3课时 | 职业道德', '培养公务员的责任担当意识，树立敢于负责、勇于担当的精神。', 'article', 'basic', 3, 0, 94);

-- =============================================
-- 一百一十三、新增课程 - 行政法案例分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1399, 612, '行政处罚案例分析：处罚程序与救济', '4课时 | 案例分析', '通过典型案例分析行政处罚的程序要求与救济途径。', 'article', 'intermediate', 4, 0, 40),
(1400, 612, '行政许可案例分析：许可条件与程序', '4课时 | 案例分析', '通过典型案例分析行政许可的条件、程序与法律效果。', 'article', 'intermediate', 4, 0, 41),
(1401, 612, '行政强制案例分析：强制措施与执行', '4课时 | 案例分析', '通过典型案例分析行政强制措施与行政强制执行的法律规定。', 'article', 'intermediate', 4, 0, 42),
(1402, 612, '行政复议案例分析：复议程序与决定', '4课时 | 案例分析', '通过典型案例分析行政复议的程序要求与复议决定类型。', 'article', 'intermediate', 4, 0, 43),
(1403, 612, '行政诉讼案例分析：起诉条件与审判', '4课时 | 案例分析', '通过典型案例分析行政诉讼的起诉条件、审判程序与判决类型。', 'article', 'intermediate', 4, 0, 44);

-- =============================================
-- 一百一十四、新增课程 - 宪法案例分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1404, 612, '公民基本权利案例分析：权利保障与限制', '4课时 | 案例分析', '通过典型案例分析公民基本权利的保障与合理限制问题。', 'article', 'intermediate', 4, 0, 45),
(1405, 612, '国家机构案例分析：权力配置与运行', '4课时 | 案例分析', '通过典型案例分析国家机构的权力配置与运行机制。', 'article', 'intermediate', 4, 0, 46),
(1406, 612, '选举制度案例分析：选举程序与保障', '3课时 | 案例分析', '通过典型案例分析选举制度的程序规定与权利保障。', 'article', 'intermediate', 3, 0, 47);

-- =============================================
-- 一百一十五、新增课程 - 刑法案例分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1407, 612, '侵犯财产罪案例分析：盗窃、抢劫、诈骗', '5课时 | 案例分析', '通过典型案例分析侵犯财产罪的构成要件与量刑标准。', 'article', 'intermediate', 5, 0, 50),
(1408, 612, '侵犯人身权利罪案例分析：故意伤害、杀人', '4课时 | 案例分析', '通过典型案例分析侵犯人身权利罪的构成要件与定罪量刑。', 'article', 'intermediate', 4, 0, 51),
(1409, 612, '贪污贿赂罪案例分析：职务犯罪认定', '5课时 | 案例分析', '通过典型案例分析贪污贿赂罪的构成要件与定罪标准。', 'article', 'intermediate', 5, 0, 52),
(1410, 612, '渎职罪案例分析：滥用职权与玩忽职守', '4课时 | 案例分析', '通过典型案例分析渎职罪的构成要件与责任认定。', 'article', 'intermediate', 4, 0, 53),
(1411, 612, '正当防卫与紧急避险案例分析：违法阻却', '4课时 | 案例分析', '通过典型案例分析正当防卫与紧急避险的认定标准。', 'article', 'intermediate', 4, 0, 54);

-- =============================================
-- 一百一十六、新增课程 - 民法案例分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1412, 612, '合同纠纷案例分析：合同效力与违约责任', '5课时 | 案例分析', '通过典型案例分析合同效力认定与违约责任承担问题。', 'article', 'intermediate', 5, 0, 55),
(1413, 612, '侵权责任案例分析：过错与无过错责任', '5课时 | 案例分析', '通过典型案例分析侵权责任的归责原则与责任承担。', 'article', 'intermediate', 5, 0, 56),
(1414, 612, '物权纠纷案例分析：所有权与用益物权', '4课时 | 案例分析', '通过典型案例分析物权纠纷的处理规则与法律适用。', 'article', 'intermediate', 4, 0, 57),
(1415, 612, '婚姻家庭案例分析：结婚、离婚与财产', '4课时 | 案例分析', '通过典型案例分析婚姻家庭法律关系的处理规则。', 'article', 'intermediate', 4, 0, 58),
(1416, 612, '继承纠纷案例分析：法定继承与遗嘱继承', '4课时 | 案例分析', '通过典型案例分析继承纠纷的处理规则与遗产分配。', 'article', 'intermediate', 4, 0, 59);

-- =============================================
-- 一百一十七、新增课程 - 速读技巧训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1417, 546, '快速阅读基础训练：提升阅读速度', '4课时 | 速读训练', '系统训练快速阅读的基本技巧，提升阅读速度与信息获取效率。', 'article', 'basic', 4, 0, 90),
(1418, 546, '关键信息提取训练：抓住文章核心', '4课时 | 速读训练', '训练关键信息提取能力，快速抓住文章的核心内容与要点。', 'article', 'intermediate', 4, 0, 91),
(1419, 593, '数据快速定位训练：高效处理资料', '4课时 | 速读训练', '训练数据快速定位能力，提升资料分析材料的处理效率。', 'article', 'intermediate', 4, 0, 92),
(1420, 624, '申论材料速读训练：快速把握材料要点', '4课时 | 速读训练', '训练申论材料的速读能力，快速把握材料的核心要点与逻辑。', 'article', 'intermediate', 4, 0, 93);

-- =============================================
-- 一百一十八、新增课程 - 思维导图备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1421, 1, '思维导图学习法：高效整理知识体系', '3课时 | 学习方法', '讲解思维导图的制作方法，学会用思维导图高效整理知识体系。', 'article', 'basic', 3, 1, 350),
(1422, 546, '言语理解思维导图：知识框架可视化', '2课时 | 学习方法', '用思维导图呈现言语理解的知识框架，实现知识体系可视化。', 'article', 'basic', 2, 0, 95),
(1423, 559, '数量关系思维导图：题型方法体系化', '2课时 | 学习方法', '用思维导图呈现数量关系的题型与方法，实现解题思路体系化。', 'article', 'basic', 2, 0, 95),
(1424, 573, '判断推理思维导图：逻辑框架清晰化', '2课时 | 学习方法', '用思维导图呈现判断推理的逻辑框架，实现推理方法清晰化。', 'article', 'basic', 2, 0, 95),
(1425, 624, '申论思维导图：写作框架结构化', '2课时 | 学习方法', '用思维导图呈现申论的写作框架，实现写作思路结构化。', 'article', 'basic', 2, 0, 110),
(1426, 716, '面试思维导图：答题思路系统化', '2课时 | 学习方法', '用思维导图呈现面试的答题思路，实现答题框架系统化。', 'article', 'basic', 2, 0, 110);

-- =============================================
-- 一百一十九、新增课程 - 学习小组讨论系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1427, 1, '备考学习小组指南：组队学习的方法', '2课时 | 学习方法', '介绍备考学习小组的组建与运营方法，提升组队学习的效果。', 'article', 'basic', 2, 1, 351),
(1428, 1, '错题讨论与分析：互帮互助共同进步', '2课时 | 学习方法', '介绍错题讨论与分析的方法，通过互帮互助实现共同进步。', 'article', 'basic', 2, 1, 352),
(1429, 716, '模拟面试互练指南：考生互练的技巧', '3课时 | 学习方法', '介绍模拟面试互练的方法与技巧，提升互练的针对性与效果。', 'article', 'basic', 3, 0, 111);

-- =============================================
-- 一百二十、新增课程 - 各题型综合串讲系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1430, 546, '言语理解综合串讲：题型方法全梳理', '8课时 | 综合串讲', '全面梳理言语理解各题型的解题方法，串联知识点形成完整体系。', 'article', 'intermediate', 8, 0, 195),
(1431, 559, '数量关系综合串讲：公式技巧全汇总', '10课时 | 综合串讲', '全面汇总数量关系的公式与技巧，串联各题型的解题方法。', 'article', 'intermediate', 10, 0, 195),
(1432, 573, '判断推理综合串讲：逻辑思维全提升', '10课时 | 综合串讲', '全面提升判断推理的逻辑思维，串联各题型的推理方法。', 'article', 'intermediate', 10, 0, 195),
(1433, 593, '资料分析综合串讲：速算技巧全掌握', '6课时 | 综合串讲', '全面掌握资料分析的速算技巧，串联各类材料的处理方法。', 'article', 'intermediate', 6, 0, 195),
(1434, 608, '公共基础知识综合串讲：高频考点全覆盖', '12课时 | 综合串讲', '全面覆盖公共基础知识的高频考点，串联各学科的重点内容。', 'article', 'intermediate', 12, 0, 95),
(1435, 624, '申论综合串讲：题型技巧全攻略', '10课时 | 综合串讲', '全面攻略申论各题型的解答技巧，串联写作方法形成完整体系。', 'article', 'intermediate', 10, 0, 115),
(1436, 716, '面试综合串讲：答题套路全破解', '8课时 | 综合串讲', '全面破解面试各题型的答题套路，串联答题技巧形成完整体系。', 'article', 'intermediate', 8, 0, 115);

-- =============================================
-- 一百二十一、新增课程 - 考前押题预测系列（扩展）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1437, 546, '2026国考言语押题预测：高频考点锁定', '3课时 | 押题预测', '基于历年真题分析，预测2026年国考言语理解的高频考点与命题方向。', 'article', 'advanced', 3, 0, 200),
(1438, 559, '2026国考数量关系押题预测：难点突破', '3课时 | 押题预测', '基于历年真题分析，预测2026年国考数量关系的难点与命题趋势。', 'article', 'advanced', 3, 0, 200),
(1439, 573, '2026国考判断推理押题预测：新题型预警', '3课时 | 押题预测', '基于历年真题分析，预测2026年国考判断推理的新题型与命题变化。', 'article', 'advanced', 3, 0, 200),
(1440, 593, '2026国考资料分析押题预测：数据热点', '2课时 | 押题预测', '基于历年真题分析，预测2026年国考资料分析的数据热点与命题方向。', 'article', 'advanced', 2, 0, 200),
(1441, 624, '2026国考申论押题预测：热点主题预判', '4课时 | 押题预测', '基于历年真题分析，预测2026年国考申论的热点主题与命题方向。', 'article', 'advanced', 4, 0, 120),
(1442, 609, '2026时政押题预测：必考热点盘点', '4课时 | 押题预测', '基于时政热点分析，预测2026年公考必考的时政热点内容。', 'article', 'intermediate', 4, 0, 50);

-- =============================================
-- 一百二十二、新增课程 - 行测联考真题解析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1443, 1, '2025联考行测真题全解析：命题趋势把握', '10课时 | 真题解析', '逐题精讲2025年省考联考行测真题，全面把握联考命题趋势。', 'article', 'intermediate', 10, 0, 410),
(1444, 1, '2024联考行测真题全解析：经典回顾', '10课时 | 真题解析', '逐题精讲2024年省考联考行测真题，回顾经典题目与解题方法。', 'article', 'intermediate', 10, 0, 411),
(1445, 1, '2023联考行测真题全解析：历年积累', '10课时 | 真题解析', '逐题精讲2023年省考联考行测真题，积累历年真题的解题经验。', 'article', 'intermediate', 10, 0, 412);

-- =============================================
-- 一百二十三、新增课程 - 申论联考真题解析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1446, 624, '2025联考申论真题全解析：写作范本学习', '8课时 | 真题解析', '逐题精讲2025年省考联考申论真题，学习高分答案的写作方法。', 'article', 'intermediate', 8, 0, 125),
(1447, 624, '2024联考申论真题全解析：经典回顾', '8课时 | 真题解析', '逐题精讲2024年省考联考申论真题，回顾经典写作范本。', 'article', 'intermediate', 8, 0, 126),
(1448, 624, '2023联考申论真题全解析：历年积累', '8课时 | 真题解析', '逐题精讲2023年省考联考申论真题，积累历年真题的写作经验。', 'article', 'intermediate', 8, 0, 127);

-- =============================================
-- 一百二十四、新增课程 - 特殊人群备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1449, 1, '在校大学生备考攻略：校园与公考的平衡', '4课时 | 特殊人群', '专为在校大学生设计的备考攻略，平衡学业与公考备考的时间安排。', 'article', 'basic', 4, 1, 360),
(1450, 1, '宝妈备考攻略：家庭与备考的兼顾', '4课时 | 特殊人群', '专为宝妈设计的备考攻略，合理安排家庭与备考的时间分配。', 'article', 'basic', 4, 1, 361),
(1451, 1, '大龄考生备考攻略：经验与体力的优化', '4课时 | 特殊人群', '专为大龄考生设计的备考攻略，发挥经验优势，优化体力分配。', 'article', 'basic', 4, 1, 362),
(1452, 1, '跨专业考生备考攻略：知识短板的弥补', '4课时 | 特殊人群', '专为跨专业考生设计的备考攻略，快速弥补专业知识短板。', 'article', 'basic', 4, 1, 363),
(1453, 1, '基础薄弱考生备考攻略：从零开始的系统学习', '5课时 | 特殊人群', '专为基础薄弱考生设计的备考攻略，从零开始系统构建知识体系。', 'article', 'basic', 5, 1, 364);

-- =============================================
-- 一百二十五、新增课程 - 答题规范训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1454, 1, '行测答题卡规范填涂：避免无谓失分', '2课时 | 答题规范', '讲解行测答题卡的规范填涂方法，避免因填涂问题导致的失分。', 'article', 'basic', 2, 1, 370),
(1455, 624, '申论答题卷面规范：字迹与格式要求', '3课时 | 答题规范', '讲解申论答题的卷面规范，包括字迹工整、格式正确等要求。', 'article', 'basic', 3, 0, 130),
(1456, 624, '申论答案字数控制：精准达到字数要求', '2课时 | 答题规范', '训练申论答案的字数控制能力，精准达到各题型的字数要求。', 'article', 'basic', 2, 0, 131),
(1457, 716, '面试礼仪规范：言行举止的要求', '3课时 | 答题规范', '讲解面试的礼仪规范，包括着装、言谈、举止等方面的要求。', 'article', 'basic', 3, 0, 120);

-- =============================================
-- 一百二十六、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习申论应用文写作，掌握各类公文的格式规范与写作技巧。',
    `long_description` = '应用文写作是申论考试的重要题型，主要考查考生的公文写作能力。本课程体系涵盖法定公文（通知、通报、报告、请示、函、纪要等）、事务文书（工作计划、总结、调研报告等）、应用文书（倡议书、建议书、讲话稿等）的格式规范与写作技巧。'
WHERE `id` = 649;

UPDATE `what_course_categories` SET 
    `description` = '系统学习申论大作文写作，掌握议论文的结构布局与论证方法。',
    `long_description` = '大作文写作是申论考试的压轴题型，主要考查考生的综合写作能力。本课程体系涵盖文章立意（准确把握题目要求）、结构布局（开头、主体、结尾）、论证方法（举例论证、对比论证、引用论证）、语言表达（规范准确、简洁有力）等核心内容。'
WHERE `id` = 643;

UPDATE `what_course_categories` SET 
    `description` = '系统学习面试综合分析题型，掌握社会现象、政策理解、名言警句等题目的作答方法。',
    `long_description` = '综合分析是面试考试的核心题型，主要考查考生的分析能力和思辨能力。本课程体系涵盖社会现象分析（热点问题剖析）、政策理解（政策解读与评价）、名言警句（哲理阐释与论证）、观点类题目（多角度分析）等题型的作答方法与技巧。'
WHERE `id` = 719;

UPDATE `what_course_categories` SET 
    `description` = '系统学习面试组织计划题型，掌握调研、宣传、活动策划等题目的作答方法。',
    `long_description` = '组织计划是面试考试的重要题型，主要考查考生的组织协调能力和计划能力。本课程体系涵盖调研类（调研设计、实施、报告）、宣传类（宣传策划、形式选择）、活动类（活动策划、组织协调）、会议类（会议筹备、流程安排）等题型的作答方法与技巧。'
WHERE `id` = 726;

UPDATE `what_course_categories` SET 
    `description` = '系统学习面试人际关系题型，掌握与领导、同事、群众相处的沟通技巧。',
    `long_description` = '人际关系是面试考试的常见题型，主要考查考生的沟通协调能力和人际交往能力。本课程体系涵盖与领导相处（向上沟通、汇报工作）、与同事相处（平级协作、团队合作）、与群众相处（群众工作、服务意识）等场景的处理方法与沟通技巧。'
WHERE `id` = 733;

UPDATE `what_course_categories` SET 
    `description` = '系统学习面试应急应变题型，掌握突发事件处理与危机应对的方法。',
    `long_description` = '应急应变是面试考试的重要题型，主要考查考生的应变能力和问题解决能力。本课程体系涵盖公共危机（危机处置、舆情应对）、工作冲突（矛盾化解、任务协调）、突发事件（紧急处理、风险防范）等场景的应对方法与处理技巧。'
WHERE `id` = 740;

UPDATE `what_course_categories` SET 
    `description` = '系统学习面试言语表达题型，掌握演讲、串词、情景模拟等题目的作答方法。',
    `long_description` = '言语表达是面试考试的特色题型，主要考查考生的语言组织能力和表达能力。本课程体系涵盖演讲类（主题演讲、即兴演讲）、串词类（关键词串联成文）、情景模拟（角色扮演、现场劝说）等题型的作答方法与表达技巧。'
WHERE `id` = 746;

-- =============================================
-- 一百二十七、新增课程 - 每日一练打卡系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1458, 546, '言语理解每日一练：30天打卡计划', '30课时 | 每日打卡', '言语理解30天打卡计划，每日精选5道真题，养成每日练习的好习惯。', 'article', 'intermediate', 30, 0, 210),
(1459, 559, '数量关系每日一练：30天打卡计划', '30课时 | 每日打卡', '数量关系30天打卡计划，每日精选3道真题，循序渐进提升计算能力。', 'article', 'intermediate', 30, 0, 210),
(1460, 573, '判断推理每日一练：30天打卡计划', '30课时 | 每日打卡', '判断推理30天打卡计划，每日精选5道真题，持续锻炼逻辑思维能力。', 'article', 'intermediate', 30, 0, 210),
(1461, 593, '资料分析每日一练：30天打卡计划', '30课时 | 每日打卡', '资料分析30天打卡计划，每日精选3道真题，稳步提升数据处理能力。', 'article', 'intermediate', 30, 0, 210),
(1462, 608, '公基常识每日一练：30天打卡计划', '30课时 | 每日打卡', '公基常识30天打卡计划，每日精选10道真题，积累常识知识储备。', 'article', 'basic', 30, 0, 100),
(1463, 624, '申论每日一练：30天打卡计划', '30课时 | 每日打卡', '申论30天打卡计划，每日完成一道小题或素材积累，持续提升写作能力。', 'article', 'intermediate', 30, 0, 135);

-- =============================================
-- 一百二十八、新增课程 - 面试角色扮演系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1464, 746, '情景模拟之劝说类：说服他人的艺术', '4课时 | 角色扮演', '专项训练劝说类情景模拟题，掌握说服他人、化解矛盾的沟通技巧。', 'article', 'intermediate', 4, 0, 40),
(1465, 746, '情景模拟之解释类：澄清误解的方法', '4课时 | 角色扮演', '专项训练解释类情景模拟题，掌握澄清误解、消除疑虑的表达方法。', 'article', 'intermediate', 4, 0, 41),
(1466, 746, '情景模拟之安抚类：情绪疏导的技巧', '4课时 | 角色扮演', '专项训练安抚类情景模拟题，掌握情绪疏导、安抚群众的沟通技巧。', 'article', 'intermediate', 4, 0, 42),
(1467, 746, '情景模拟之汇报类：工作汇报的要点', '3课时 | 角色扮演', '专项训练汇报类情景模拟题，掌握向领导汇报工作的要点与方法。', 'article', 'intermediate', 3, 0, 43),
(1468, 746, '情景模拟之接待类：接待来访的礼仪', '3课时 | 角色扮演', '专项训练接待类情景模拟题，掌握接待来访群众或领导的礼仪与方法。', 'article', 'intermediate', 3, 0, 44);

-- =============================================
-- 一百二十九、新增课程 - 申论批改指导系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1469, 624, '申论批改常见问题解析：避免扣分陷阱', '5课时 | 批改指导', '汇总申论批改中的常见问题，分析扣分原因与改进方法，避免常见错误。', 'article', 'intermediate', 5, 0, 140),
(1470, 625, '归纳概括批改要点：要点遗漏与表述问题', '3课时 | 批改指导', '分析归纳概括题的批改要点，纠正要点遗漏、表述不当等常见问题。', 'article', 'intermediate', 3, 0, 30),
(1471, 631, '综合分析批改要点：分析深度与逻辑问题', '3课时 | 批改指导', '分析综合分析题的批改要点，纠正分析不深、逻辑混乱等常见问题。', 'article', 'intermediate', 3, 0, 30),
(1472, 637, '提出对策批改要点：对策可行性问题', '3课时 | 批改指导', '分析提出对策题的批改要点，纠正对策空泛、不可行等常见问题。', 'article', 'intermediate', 3, 0, 30),
(1473, 649, '应用文批改要点：格式与内容问题', '3课时 | 批改指导', '分析应用文写作题的批改要点，纠正格式错误、内容偏离等常见问题。', 'article', 'intermediate', 3, 0, 30),
(1474, 643, '大作文批改要点：立意与论证问题', '4课时 | 批改指导', '分析大作文的批改要点，纠正立意偏差、论证薄弱等常见问题。', 'article', 'intermediate', 4, 0, 60);

-- =============================================
-- 一百三十、新增课程 - 考场模拟实战系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1475, 1, '行测全真模拟考场（一）：120分钟限时训练', '1套 | 考场模拟', '完全模拟真实考场环境，120分钟限时完成全套行测试卷，检验备考成果。', 'article', 'intermediate', 1, 0, 420),
(1476, 1, '行测全真模拟考场（二）：压力测试', '1套 | 考场模拟', '高压环境下的行测模拟测试，提前适应考场紧张氛围，锻炼心理素质。', 'article', 'advanced', 1, 0, 421),
(1477, 624, '申论全真模拟考场（一）：180分钟限时训练', '1套 | 考场模拟', '完全模拟真实考场环境，180分钟限时完成全套申论试卷，检验写作能力。', 'article', 'intermediate', 1, 0, 145),
(1478, 624, '申论全真模拟考场（二）：压力测试', '1套 | 考场模拟', '高压环境下的申论模拟测试，提前适应考场紧张氛围，锻炼时间把控。', 'article', 'advanced', 1, 0, 146),
(1479, 716, '面试全真模拟考场：结构化面试实战', '1套 | 考场模拟', '完全模拟真实面试考场，进行结构化面试的全流程实战演练。', 'article', 'intermediate', 1, 0, 125);

-- =============================================
-- 一百三十一、新增课程 - 地区特色考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1480, 1, '北京市考备考攻略：京考命题特点与策略', '10课时 | 地区特色', '全面分析北京市考的命题特点，制定针对性备考策略，助力京考上岸。', 'article', 'intermediate', 10, 0, 145),
(1481, 1, '上海市考备考攻略：沪考命题特点与策略', '10课时 | 地区特色', '全面分析上海市考的命题特点，制定针对性备考策略，助力沪考上岸。', 'article', 'intermediate', 10, 0, 146),
(1482, 1, '深圳市考备考攻略：深考命题特点与策略', '8课时 | 地区特色', '全面分析深圳市考的命题特点，制定针对性备考策略，助力深考上岸。', 'article', 'intermediate', 8, 0, 147),
(1483, 1, '广州市考备考攻略：穗考命题特点与策略', '8课时 | 地区特色', '全面分析广州市考的命题特点，制定针对性备考策略，助力穗考上岸。', 'article', 'intermediate', 8, 0, 148),
(1484, 624, '北京申论特训：京考申论命题解析', '8课时 | 地区特色', '针对北京市考申论的命题特点进行专项训练，把握京考申论的风格。', 'article', 'intermediate', 8, 0, 150),
(1485, 624, '上海申论特训：沪考申论命题解析', '8课时 | 地区特色', '针对上海市考申论的命题特点进行专项训练，把握沪考申论的风格。', 'article', 'intermediate', 8, 0, 151);

-- =============================================
-- 一百三十二、新增课程 - 行政能力测验专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1486, 1, '行测五大模块关联分析：融会贯通的思维', '5课时 | 综合能力', '分析行测五大模块之间的内在关联，培养融会贯通的综合解题思维。', 'article', 'advanced', 5, 0, 380),
(1487, 1, '行测整体提分策略：从70分到80分的突破', '6课时 | 综合能力', '制定行测整体提分策略，帮助考生实现从70分到80分的分数突破。', 'article', 'advanced', 6, 0, 381),
(1488, 1, '行测弱项突破指南：针对性补短板', '5课时 | 综合能力', '诊断行测弱项并制定突破方案，针对性补齐短板实现整体提升。', 'article', 'intermediate', 5, 0, 382),
(1489, 1, '行测强项巩固策略：优势最大化', '4课时 | 综合能力', '巩固行测强项并制定优化策略，实现优势模块得分最大化。', 'article', 'intermediate', 4, 0, 383);

-- =============================================
-- 一百三十三、新增课程 - 阅读理解深度系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1490, 551, '政论文阅读技巧：政策文件快速理解', '4课时 | 阅读深度', '专项训练政论文阅读技巧，快速理解政策文件与官方文章的核心内容。', 'article', 'intermediate', 4, 0, 80),
(1491, 551, '学术文阅读技巧：专业文章准确把握', '4课时 | 阅读深度', '专项训练学术文阅读技巧，准确把握专业性较强文章的主旨与细节。', 'article', 'advanced', 4, 0, 81),
(1492, 551, '新闻报道阅读技巧：信息提取与归纳', '3课时 | 阅读深度', '专项训练新闻报道阅读技巧，快速提取新闻信息并进行归纳整理。', 'article', 'intermediate', 3, 0, 82),
(1493, 551, '评论文阅读技巧：观点识别与立场判断', '4课时 | 阅读深度', '专项训练评论文阅读技巧，准确识别作者观点与立场倾向。', 'article', 'intermediate', 4, 0, 83);

-- =============================================
-- 一百三十四、新增课程 - 论证分析专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1494, 587, '因果论证分析：因果关系的识别与评价', '4课时 | 论证分析', '专项训练因果论证的分析方法，掌握因果关系识别与论证评价的技巧。', 'article', 'intermediate', 4, 0, 80),
(1495, 587, '类比论证分析：类比推理的有效性判断', '4课时 | 论证分析', '专项训练类比论证的分析方法，掌握类比推理有效性判断的技巧。', 'article', 'intermediate', 4, 0, 81),
(1496, 587, '归纳论证分析：归纳推理的可靠性评估', '4课时 | 论证分析', '专项训练归纳论证的分析方法，掌握归纳推理可靠性评估的技巧。', 'article', 'intermediate', 4, 0, 82),
(1497, 587, '演绎论证分析：演绎推理的有效性验证', '4课时 | 论证分析', '专项训练演绎论证的分析方法，掌握演绎推理有效性验证的技巧。', 'article', 'advanced', 4, 0, 83);

-- =============================================
-- 一百三十五、新增课程 - 公众演讲训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1498, 746, '演讲开场技巧：吸引听众的第一分钟', '3课时 | 演讲训练', '专项训练演讲开场技巧，学会用精彩的开场吸引听众注意力。', 'article', 'intermediate', 3, 0, 50),
(1499, 746, '演讲结构设计：清晰有力的框架搭建', '4课时 | 演讲训练', '专项训练演讲结构设计，学会搭建清晰有力的演讲框架。', 'article', 'intermediate', 4, 0, 51),
(1500, 746, '演讲收尾技巧：令人印象深刻的结尾', '3课时 | 演讲训练', '专项训练演讲收尾技巧，学会设计令人印象深刻的演讲结尾。', 'article', 'intermediate', 3, 0, 52),
(1501, 746, '演讲肢体语言：非语言表达的运用', '3课时 | 演讲训练', '专项训练演讲肢体语言，学会运用眼神、手势等非语言表达增强感染力。', 'article', 'intermediate', 3, 0, 53),
(1502, 746, '演讲声音控制：语音语调的艺术', '3课时 | 演讲训练', '专项训练演讲声音控制，学会运用语音语调的变化增强表达效果。', 'article', 'intermediate', 3, 0, 54);

-- =============================================
-- 一百三十六、新增课程 - 面试题库精选系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1503, 719, '综合分析题库精选100题：高频真题汇编', '10课时 | 题库精选', '精选100道综合分析高频真题，配有详细解析与参考答案。', 'article', 'intermediate', 10, 0, 90),
(1504, 726, '组织计划题库精选80题：经典题目汇编', '8课时 | 题库精选', '精选80道组织计划经典题目，配有详细解析与参考答案。', 'article', 'intermediate', 8, 0, 90),
(1505, 733, '人际关系题库精选60题：常见场景汇编', '6课时 | 题库精选', '精选60道人际关系常见场景题目，配有详细解析与参考答案。', 'article', 'intermediate', 6, 0, 90),
(1506, 740, '应急应变题库精选60题：突发情况汇编', '6课时 | 题库精选', '精选60道应急应变突发情况题目，配有详细解析与参考答案。', 'article', 'intermediate', 6, 0, 90),
(1507, 746, '言语表达题库精选40题：特色题型汇编', '4课时 | 题库精选', '精选40道言语表达特色题型，配有详细解析与参考答案。', 'article', 'intermediate', 4, 0, 60);

-- =============================================
-- 一百三十七、新增课程 - 申论模板与框架系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1508, 625, '归纳概括万能框架：快速整理答案结构', '3课时 | 模板框架', '提供归纳概括题的万能答题框架，帮助快速整理答案结构。', 'article', 'basic', 3, 0, 35),
(1509, 631, '综合分析万能框架：全面深入的分析结构', '4课时 | 模板框架', '提供综合分析题的万能答题框架，帮助构建全面深入的分析结构。', 'article', 'basic', 4, 0, 35),
(1510, 637, '提出对策万能框架：系统完整的对策体系', '3课时 | 模板框架', '提供提出对策题的万能答题框架，帮助构建系统完整的对策体系。', 'article', 'basic', 3, 0, 35),
(1511, 649, '常见公文格式模板：规范写作的参考', '5课时 | 模板框架', '提供常见公文的格式模板，为规范公文写作提供参考。', 'article', 'basic', 5, 0, 35),
(1512, 643, '议论文结构模板：经典写作框架', '4课时 | 模板框架', '提供议论文的经典结构模板，帮助快速搭建文章框架。', 'article', 'basic', 4, 0, 65);

-- =============================================
-- 一百三十八、新增课程 - 速算技巧精讲系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1513, 560, '速算基础：加减乘除的快速计算', '4课时 | 速算技巧', '讲解加减乘除的速算技巧，打好快速计算的基础。', 'article', 'basic', 4, 0, 100),
(1514, 560, '分数运算速算：分数计算的简化方法', '3课时 | 速算技巧', '讲解分数运算的速算技巧，掌握分数计算的简化方法。', 'article', 'intermediate', 3, 0, 101),
(1515, 560, '百分数速算：百分数计算的技巧', '3课时 | 速算技巧', '讲解百分数运算的速算技巧，掌握百分数计算的简化方法。', 'article', 'intermediate', 3, 0, 102),
(1516, 593, '资料分析速算技巧汇总：计算能力提升', '6课时 | 速算技巧', '全面汇总资料分析的速算技巧，大幅提升数据计算能力。', 'article', 'intermediate', 6, 0, 70),
(1517, 593, '估算与精算的选择：何时估算何时精算', '3课时 | 速算技巧', '讲解估算与精算的选择策略，根据题目要求选择合适的计算方法。', 'article', 'intermediate', 3, 0, 71);

-- =============================================
-- 一百三十九、新增课程 - 图表解读进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1518, 593, '多图表综合分析：跨图表数据整合', '4课时 | 图表进阶', '专项训练多图表综合分析能力，掌握跨图表数据整合的方法。', 'article', 'advanced', 4, 0, 75),
(1519, 593, '动态图表解读：趋势变化的把握', '3课时 | 图表进阶', '专项训练动态图表解读能力，准确把握数据的趋势变化。', 'article', 'intermediate', 3, 0, 76),
(1520, 593, '特殊图表解读：非常规图表的处理', '3课时 | 图表进阶', '专项训练特殊图表解读能力，掌握非常规图表的处理方法。', 'article', 'advanced', 3, 0, 77),
(1521, 593, '图表陷阱识别：避免常见的误读', '3课时 | 图表进阶', '专项训练图表陷阱识别能力，避免图表解读中的常见误读。', 'article', 'intermediate', 3, 0, 78);

-- =============================================
-- 一百四十、新增课程 - 政策分析专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1522, 609, '政策分析方法论：读懂政策的技巧', '4课时 | 政策分析', '讲解政策分析的基本方法，帮助考生快速读懂各类政策文件。', 'article', 'intermediate', 4, 0, 55),
(1523, 609, '经济政策解读：宏观调控与产业政策', '4课时 | 政策分析', '深入解读经济领域的重要政策，包括宏观调控与产业政策等。', 'article', 'intermediate', 4, 0, 56),
(1524, 609, '社会政策解读：民生保障与社会治理', '4课时 | 政策分析', '深入解读社会领域的重要政策，包括民生保障与社会治理等。', 'article', 'intermediate', 4, 0, 57),
(1525, 609, '环境政策解读：生态保护与绿色发展', '3课时 | 政策分析', '深入解读环境领域的重要政策，包括生态保护与绿色发展等。', 'article', 'intermediate', 3, 0, 58),
(1526, 609, '科技政策解读：创新驱动与数字经济', '3课时 | 政策分析', '深入解读科技领域的重要政策，包括创新驱动与数字经济等。', 'article', 'intermediate', 3, 0, 59);

-- =============================================
-- 一百四十一、新增课程 - 高频词汇积累系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1527, 548, '行测高频实词500词：核心词汇精讲', '10课时 | 词汇积累', '精选行测言语理解500个高频实词，详细讲解词义与用法。', 'article', 'basic', 10, 0, 25),
(1528, 549, '行测高频成语400个：必考成语精讲', '8课时 | 词汇积累', '精选行测言语理解400个高频成语，详细讲解含义与易错点。', 'article', 'basic', 8, 0, 25),
(1529, 546, '易混淆词语辨析100组：精准区分近义词', '5课时 | 词汇积累', '精选100组易混淆词语，详细辨析其区别与使用语境。', 'article', 'intermediate', 5, 0, 100),
(1530, 624, '申论高频词汇与表达：规范表述积累', '5课时 | 词汇积累', '积累申论写作的高频词汇与规范表达，提升写作的专业性。', 'article', 'basic', 5, 0, 155);

-- =============================================
-- 一百四十二、新增课程 - 逻辑谬误识别系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1531, 587, '诉诸权威谬误：权威论证的局限', '2课时 | 谬误识别', '识别诉诸权威谬误，理解权威论证的局限与有效条件。', 'article', 'intermediate', 2, 0, 85),
(1532, 587, '诉诸情感谬误：情感操纵的识别', '2课时 | 谬误识别', '识别诉诸情感谬误，警惕情感操纵对理性判断的影响。', 'article', 'intermediate', 2, 0, 86),
(1533, 587, '滑坡谬误：因果链条的过度延伸', '2课时 | 谬误识别', '识别滑坡谬误，理解因果链条过度延伸的逻辑问题。', 'article', 'intermediate', 2, 0, 87),
(1534, 587, '稻草人谬误：歪曲对方观点', '2课时 | 谬误识别', '识别稻草人谬误，警惕歪曲对方观点后进行攻击的论证陷阱。', 'article', 'intermediate', 2, 0, 88),
(1535, 587, '循环论证谬误：前提与结论的循环', '2课时 | 谬误识别', '识别循环论证谬误，发现前提与结论之间的循环依赖。', 'article', 'intermediate', 2, 0, 89);

-- =============================================
-- 一百四十三、新增课程 - 数学公式速记系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1536, 560, '行程问题公式速记：距离、速度、时间', '3课时 | 公式速记', '系统整理行程问题的核心公式，通过口诀与图示快速记忆。', 'article', 'basic', 3, 0, 105),
(1537, 560, '工程问题公式速记：效率、时间、总量', '3课时 | 公式速记', '系统整理工程问题的核心公式，通过口诀与图示快速记忆。', 'article', 'basic', 3, 0, 106),
(1538, 560, '利润问题公式速记：成本、售价、利润', '2课时 | 公式速记', '系统整理利润问题的核心公式，通过口诀与图示快速记忆。', 'article', 'basic', 2, 0, 107),
(1539, 560, '排列组合公式速记：加法与乘法原理', '3课时 | 公式速记', '系统整理排列组合的核心公式，通过口诀与图示快速记忆。', 'article', 'basic', 3, 0, 108),
(1540, 560, '几何问题公式速记：面积与体积公式', '3课时 | 公式速记', '系统整理几何问题的核心公式，通过口诀与图示快速记忆。', 'article', 'basic', 3, 0, 109),
(1541, 593, '资料分析公式速记：增长率与比重公式', '4课时 | 公式速记', '系统整理资料分析的核心公式，通过口诀与图示快速记忆。', 'article', 'basic', 4, 0, 80);

-- =============================================
-- 一百四十四、新增课程 - 考试心态调整系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1542, 1, '考前一个月心态调整：稳定情绪迎考试', '3课时 | 心态调整', '帮助考生在考前一个月调整心态，以稳定的情绪迎接考试。', 'article', 'basic', 3, 1, 390),
(1543, 1, '考试当天心态管理：从容应对考场', '2课时 | 心态调整', '帮助考生管理考试当天的心态，从容应对考场的各种情况。', 'article', 'basic', 2, 1, 391),
(1544, 1, '考试中的心态调节：遇到难题不慌张', '2课时 | 心态调整', '帮助考生学会考试中的心态调节，遇到难题时保持冷静。', 'article', 'basic', 2, 1, 392),
(1545, 716, '面试等候心态管理：等待中保持最佳状态', '2课时 | 心态调整', '帮助考生管理面试等候时的心态，在等待中保持最佳状态。', 'article', 'basic', 2, 0, 130),
(1546, 716, '面试答题心态调节：紧张时的应对方法', '2课时 | 心态调整', '帮助考生学会面试答题时的心态调节，紧张时快速恢复状态。', 'article', 'basic', 2, 0, 131);

-- =============================================
-- 一百四十五、新增课程 - 笔记整理方法系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1547, 1, '备考笔记整理方法：高效学习的记录', '3课时 | 笔记方法', '讲解备考笔记的整理方法，帮助考生高效记录学习内容。', 'article', 'basic', 3, 1, 395),
(1548, 1, '错题本整理技巧：从错误中学习', '3课时 | 笔记方法', '讲解错题本的整理技巧，帮助考生从错误中学习并避免重复犯错。', 'article', 'basic', 3, 1, 396),
(1549, 624, '申论素材本整理：写作素材的积累', '3课时 | 笔记方法', '讲解申论素材本的整理方法，帮助考生系统积累写作素材。', 'article', 'basic', 3, 0, 160),
(1550, 716, '面试答案整理：答题素材的归纳', '3课时 | 笔记方法', '讲解面试答案的整理方法，帮助考生系统归纳答题素材。', 'article', 'basic', 3, 0, 135);

-- =============================================
-- 一百四十六、新增课程 - 在线学习工具使用系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1551, 1, '公考APP使用指南：移动学习的利器', '2课时 | 工具使用', '介绍公考学习APP的使用方法，充分利用移动学习工具。', 'article', 'basic', 2, 1, 400),
(1552, 1, '在线刷题平台使用：高效练习的方法', '2课时 | 工具使用', '介绍在线刷题平台的使用方法，提高刷题练习的效率。', 'article', 'basic', 2, 1, 401),
(1553, 1, '学习视频高效观看：倍速与笔记技巧', '2课时 | 工具使用', '介绍学习视频的高效观看方法，包括倍速播放与同步笔记技巧。', 'article', 'basic', 2, 1, 402);

-- =============================================
-- 一百四十七、新增课程 - 历年分数线分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1554, 1, '国考历年分数线分析：进面分数趋势', '3课时 | 分数分析', '分析国考历年各岗位的进面分数线，了解分数变化趋势。', 'article', 'basic', 3, 1, 305),
(1555, 1, '省考历年分数线分析：各省进面情况', '4课时 | 分数分析', '分析各省省考历年的进面分数线，了解各省考情差异。', 'article', 'basic', 4, 1, 306),
(1556, 1, '分数目标设定：根据岗位合理定目标', '2课时 | 分数分析', '帮助考生根据目标岗位合理设定分数目标，制定学习计划。', 'article', 'basic', 2, 1, 307);

-- =============================================
-- 一百四十八、新增课程 - 考试物品准备系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1557, 1, '笔试物品清单：考前准备不遗漏', '1课时 | 考前准备', '提供笔试物品清单，帮助考生考前准备不遗漏任何必需品。', 'article', 'basic', 1, 1, 405),
(1558, 716, '面试着装指南：得体穿着的建议', '2课时 | 考前准备', '提供面试着装指南，帮助考生选择得体的面试穿着。', 'article', 'basic', 2, 1, 140),
(1559, 1, '考场踩点攻略：提前熟悉考试环境', '1课时 | 考前准备', '介绍考场踩点的攻略，帮助考生提前熟悉考试环境减少紧张。', 'article', 'basic', 1, 1, 406);

-- =============================================
-- 一百四十九、更新现有课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '言语理解入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '言语理解与表达模块的入门导学课程，全面介绍模块概述、题型分布、学习方法与备考策略。'
WHERE `id` = 3;

UPDATE `what_courses` SET 
    `title` = '数量关系入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '数量关系模块的入门导学课程，全面介绍模块概述、题型分布、学习方法与备考策略。'
WHERE `id` = 4;

UPDATE `what_courses` SET 
    `title` = '判断推理入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '判断推理模块的入门导学课程，全面介绍模块概述、题型分布、学习方法与备考策略。'
WHERE `id` = 5;

UPDATE `what_courses` SET 
    `title` = '资料分析入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '资料分析模块的入门导学课程，全面介绍模块概述、题型分布、学习方法与备考策略。'
WHERE `id` = 6;

UPDATE `what_courses` SET 
    `title` = '申论入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '申论模块的入门导学课程，全面介绍模块概述、题型分布、学习方法与备考策略。'
WHERE `id` = 7;

UPDATE `what_courses` SET 
    `title` = '面试入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '面试模块的入门导学课程，全面介绍面试形式、题型分布、学习方法与备考策略。'
WHERE `id` = 8;

-- =============================================
-- 一百五十、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习实词辨析，掌握语素分析、语境推断、感情色彩辨析等核心方法。',
    `long_description` = '实词辨析是逻辑填空的基础内容，主要考查考生对实词含义的理解和辨析能力。本课程体系涵盖语素分析法（拆解词语理解含义）、语境推断法（根据上下文判断用词）、感情色彩辨析（褒义、贬义、中性）、语义轻重辨析、搭配习惯等核心方法。'
WHERE `id` = 548;

UPDATE `what_course_categories` SET 
    `description` = '系统学习成语辨析，掌握高频成语含义、易混成语区分、成语误用类型等核心内容。',
    `long_description` = '成语辨析是逻辑填空的重要内容，主要考查考生对成语含义的理解和正确使用能力。本课程体系涵盖高频成语讲解（800+必考成语）、易混成语区分（近义成语辨析）、成语误用类型（望文生义、对象误用、语义重复等），帮助考生准确使用成语。'
WHERE `id` = 549;

UPDATE `what_course_categories` SET 
    `description` = '系统学习关联词，掌握关联词的分类、搭配规则与逻辑关系判断方法。',
    `long_description` = '关联词是逻辑填空的重要考点，主要考查考生对句间逻辑关系的判断能力。本课程体系涵盖关联词分类（转折、因果、递进、并列、条件、假设）、搭配规则（固定搭配、正确使用）、逻辑关系判断（根据句意选择关联词），帮助考生准确把握句间关系。'
WHERE `id` = 550;

UPDATE `what_course_categories` SET 
    `description` = '系统学习主旨概括题型，掌握行文脉络分析、关键句识别、主旨归纳等核心方法。',
    `long_description` = '主旨概括是片段阅读的核心题型，主要考查考生对文段主旨的概括能力。本课程体系涵盖行文脉络分析（总分、分总、总分总等结构）、关键句识别（首尾句、转折句、总结句）、主旨归纳方法（提炼核心观点）、干扰项排除（过于绝对、无中生有等），帮助考生准确把握文段主旨。'
WHERE `id` = 552;

-- =============================================
-- 一百五十一、新增课程 - 国考真题解析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1560, 546, '2025年国考行测真题解析-言语理解', '10课时 | 真题解析', '详细解析2025年国考行测言语理解与表达真题，剖析命题规律与解题技巧。', 'article', 'intermediate', 10, 0, 110),
(1561, 546, '2024年国考行测真题解析-言语理解', '10课时 | 真题解析', '详细解析2024年国考行测言语理解与表达真题，总结高频考点与易错题型。', 'article', 'intermediate', 10, 0, 111),
(1562, 546, '2023年国考行测真题解析-言语理解', '10课时 | 真题解析', '详细解析2023年国考行测言语理解与表达真题，梳理考试重点与答题要点。', 'article', 'intermediate', 10, 0, 112),
(1563, 559, '2025年国考行测真题解析-数量关系', '8课时 | 真题解析', '详细解析2025年国考行测数量关系真题，总结计算技巧与模型应用。', 'article', 'intermediate', 8, 0, 110),
(1564, 559, '2024年国考行测真题解析-数量关系', '8课时 | 真题解析', '详细解析2024年国考行测数量关系真题，剖析难题突破与速算方法。', 'article', 'intermediate', 8, 0, 111),
(1565, 573, '2025年国考行测真题解析-判断推理', '10课时 | 真题解析', '详细解析2025年国考行测判断推理真题，梳理逻辑思维与推理方法。', 'article', 'intermediate', 10, 0, 110),
(1566, 573, '2024年国考行测真题解析-判断推理', '10课时 | 真题解析', '详细解析2024年国考行测判断推理真题，总结图形规律与逻辑技巧。', 'article', 'intermediate', 10, 0, 111),
(1567, 592, '2025年国考行测真题解析-资料分析', '8课时 | 真题解析', '详细解析2025年国考行测资料分析真题，强化速算技巧与数据处理。', 'article', 'intermediate', 8, 0, 110),
(1568, 592, '2024年国考行测真题解析-资料分析', '8课时 | 真题解析', '详细解析2024年国考行测资料分析真题，提升图表解读与计算能力。', 'article', 'intermediate', 8, 0, 111),
(1569, 607, '2025年国考行测真题解析-常识判断', '6课时 | 真题解析', '详细解析2025年国考行测常识判断真题，覆盖政治、法律、科技等领域。', 'article', 'intermediate', 6, 0, 110);

-- =============================================
-- 一百五十二、新增课程 - 国考申论真题解析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1570, 624, '2025年国考申论真题解析-副省级', '12课时 | 真题解析', '详细解析2025年国考副省级申论真题，剖析材料要点与答题技巧。', 'article', 'advanced', 12, 0, 165),
(1571, 624, '2025年国考申论真题解析-地市级', '12课时 | 真题解析', '详细解析2025年国考地市级申论真题，总结命题规律与高分要点。', 'article', 'intermediate', 12, 0, 166),
(1572, 624, '2024年国考申论真题解析-副省级', '12课时 | 真题解析', '详细解析2024年国考副省级申论真题，分析各题型作答方法。', 'article', 'advanced', 12, 0, 167),
(1573, 624, '2024年国考申论真题解析-地市级', '12课时 | 真题解析', '详细解析2024年国考地市级申论真题，梳理材料逻辑与答案组织。', 'article', 'intermediate', 12, 0, 168),
(1574, 624, '2023年国考申论真题解析-副省级', '12课时 | 真题解析', '详细解析2023年国考副省级申论真题，深入分析综合性题型。', 'article', 'advanced', 12, 0, 169),
(1575, 624, '2023年国考申论真题解析-地市级', '12课时 | 真题解析', '详细解析2023年国考地市级申论真题，强化基础题型作答能力。', 'article', 'intermediate', 12, 0, 170);

-- =============================================
-- 一百五十三、新增课程 - 省考真题解析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1576, 546, '2025年省考联考行测真题解析-言语理解', '10课时 | 真题解析', '详细解析2025年省考联考行测言语理解真题，把握联考命题风格。', 'article', 'intermediate', 10, 0, 115),
(1577, 559, '2025年省考联考行测真题解析-数量关系', '8课时 | 真题解析', '详细解析2025年省考联考行测数量关系真题，掌握联考计算特点。', 'article', 'intermediate', 8, 0, 115),
(1578, 573, '2025年省考联考行测真题解析-判断推理', '10课时 | 真题解析', '详细解析2025年省考联考行测判断推理真题，分析联考推理规律。', 'article', 'intermediate', 10, 0, 115),
(1579, 592, '2025年省考联考行测真题解析-资料分析', '8课时 | 真题解析', '详细解析2025年省考联考行测资料分析真题，提升联考数据处理。', 'article', 'intermediate', 8, 0, 115),
(1580, 624, '2025年省考联考申论真题解析', '12课时 | 真题解析', '详细解析2025年省考联考申论真题，总结联考申论的特点与技巧。', 'article', 'intermediate', 12, 0, 175),
(1581, 624, '广东省考申论真题解析合集', '10课时 | 真题解析', '系统解析近三年广东省考申论真题，把握粤考申论风格特点。', 'article', 'intermediate', 10, 0, 176),
(1582, 624, '浙江省考申论真题解析合集', '10课时 | 真题解析', '系统解析近三年浙江省考申论真题，掌握浙考申论命题规律。', 'article', 'intermediate', 10, 0, 177),
(1583, 624, '江苏省考申论真题解析合集', '10课时 | 真题解析', '系统解析近三年江苏省考申论真题，分析苏考申论独特风格。', 'article', 'intermediate', 10, 0, 178);

-- =============================================
-- 一百五十四、新增课程 - 冲刺复习系列（行测）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1584, 546, '言语理解冲刺：考前7天核心知识梳理', '5课时 | 冲刺复习', '考前7天言语理解核心知识点快速回顾，巩固重点强化记忆。', 'article', 'intermediate', 5, 0, 120),
(1585, 559, '数量关系冲刺：考前7天高频题型突破', '5课时 | 冲刺复习', '考前7天数量关系高频题型强化训练，确保基础分数到手。', 'article', 'intermediate', 5, 0, 120),
(1586, 573, '判断推理冲刺：考前7天规律速记', '5课时 | 冲刺复习', '考前7天判断推理核心规律快速记忆，提升答题准确率。', 'article', 'intermediate', 5, 0, 120),
(1587, 592, '资料分析冲刺：考前7天公式强化', '5课时 | 冲刺复习', '考前7天资料分析核心公式与速算技巧强化，保证该模块得分。', 'article', 'intermediate', 5, 0, 120),
(1588, 607, '常识判断冲刺：考前7天热点速览', '5课时 | 冲刺复习', '考前7天常识判断时政热点与高频考点快速浏览，临门一脚提分。', 'article', 'intermediate', 5, 0, 120),
(1589, 1, '行测冲刺：考前3天全模块巩固', '3课时 | 冲刺复习', '考前3天行测五大模块核心要点串讲，全面巩固备考成果。', 'article', 'intermediate', 3, 0, 410),
(1590, 1, '行测冲刺：考前1天状态调整与策略', '1课时 | 冲刺复习', '考前1天的状态调整与考试策略制定，以最佳状态迎接考试。', 'article', 'basic', 1, 1, 411);

-- =============================================
-- 一百五十五、新增课程 - 冲刺复习系列（申论）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1591, 624, '申论冲刺：考前7天题型方法速记', '6课时 | 冲刺复习', '考前7天申论五大题型核心方法快速回顾，强化答题框架记忆。', 'article', 'intermediate', 6, 0, 180),
(1592, 624, '申论冲刺：考前7天写作素材积累', '5课时 | 冲刺复习', '考前7天申论写作高频素材集中积累，丰富文章论据储备。', 'article', 'intermediate', 5, 0, 181),
(1593, 624, '申论冲刺：考前3天热点专题梳理', '4课时 | 冲刺复习', '考前3天申论热点专题集中梳理，把握时政热点与命题方向。', 'article', 'intermediate', 4, 0, 182),
(1594, 624, '申论冲刺：考前1天作答注意事项', '1课时 | 冲刺复习', '考前1天申论作答注意事项提醒，避免低级错误影响得分。', 'article', 'basic', 1, 1, 183);

-- =============================================
-- 一百五十六、新增课程 - 冲刺复习系列（面试）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1595, 716, '面试冲刺：考前7天题型方法回顾', '6课时 | 冲刺复习', '考前7天面试各题型核心方法快速回顾，巩固答题框架。', 'article', 'intermediate', 6, 0, 145),
(1596, 716, '面试冲刺：考前7天素材整理', '5课时 | 冲刺复习', '考前7天面试答题素材集中整理，充实答题内容。', 'article', 'intermediate', 5, 0, 146),
(1597, 716, '面试冲刺：考前3天模拟练习', '4课时 | 冲刺复习', '考前3天面试模拟练习，查漏补缺调整状态。', 'article', 'intermediate', 4, 0, 147),
(1598, 716, '面试冲刺：考前1天状态调整', '1课时 | 冲刺复习', '考前1天面试状态调整与注意事项，以最佳状态进入考场。', 'article', 'basic', 1, 1, 148);

-- =============================================
-- 一百五十七、新增课程 - 专项突破系列（言语理解）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1599, 547, '逻辑填空专项突破：从60%到80%的提升', '8课时 | 专项突破', '针对逻辑填空正确率60%左右的考生，制定专项突破方案。', 'article', 'intermediate', 8, 0, 45),
(1600, 551, '片段阅读专项突破：主旨题满分攻略', '6课时 | 专项突破', '针对片段阅读主旨题进行专项突破，确保该题型不丢分。', 'article', 'intermediate', 6, 0, 90),
(1601, 551, '片段阅读专项突破：细节题高准确率', '5课时 | 专项突破', '针对片段阅读细节题进行专项突破，提高细节判断准确率。', 'article', 'intermediate', 5, 0, 91),
(1602, 556, '语句表达专项突破：排序与填空技巧', '5课时 | 专项突破', '针对语句排序和语句填空进行专项突破，掌握高效解题方法。', 'article', 'intermediate', 5, 0, 30),
(1603, 546, '长文阅读专项突破：800字以上材料速读', '5课时 | 专项突破', '针对800字以上的长篇材料进行专项突破，掌握快速阅读与信息提取。', 'article', 'advanced', 5, 0, 130);

-- =============================================
-- 一百五十八、新增课程 - 专项突破系列（数量关系）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1604, 560, '数学运算专项突破：秒杀技巧合集', '8课时 | 专项突破', '汇总数学运算的秒杀技巧，帮助考生在短时间内快速解题。', 'article', 'intermediate', 8, 0, 115),
(1605, 560, '数学运算专项突破：难题放弃策略', '3课时 | 专项突破', '讲解如何识别难题并合理放弃，优化时间分配策略。', 'article', 'intermediate', 3, 0, 116),
(1606, 569, '数字推理专项突破：规律识别技巧', '5课时 | 专项突破', '针对数字推理进行专项突破，提升数列规律识别能力。', 'article', 'intermediate', 5, 0, 45),
(1607, 559, '数量关系专项突破：从5对到8对的提升', '6课时 | 专项突破', '针对数量关系正确率50%左右的考生，制定从5对到8对的提升方案。', 'article', 'intermediate', 6, 0, 125);

-- =============================================
-- 一百五十九、新增课程 - 专项突破系列（判断推理）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1608, 574, '图形推理专项突破：空间重构攻克', '5课时 | 专项突破', '针对图形推理空间重构题进行专项突破，建立空间思维能力。', 'article', 'advanced', 5, 0, 60),
(1609, 574, '图形推理专项突破：数量规律速解', '4课时 | 专项突破', '针对图形推理数量规律题进行专项突破，快速识别数量变化。', 'article', 'intermediate', 4, 0, 61),
(1610, 580, '定义判断专项突破：复杂定义解读', '4课时 | 专项突破', '针对定义判断中的复杂定义进行专项突破，提升定义理解能力。', 'article', 'intermediate', 4, 0, 30),
(1611, 583, '类比推理专项突破：特殊关系识别', '4课时 | 专项突破', '针对类比推理中的特殊关系进行专项突破，准确识别词语关系。', 'article', 'intermediate', 4, 0, 35),
(1612, 587, '逻辑判断专项突破：论证加强削弱', '6课时 | 专项突破', '针对逻辑判断加强削弱题进行专项突破，建立完整的论证思维。', 'article', 'intermediate', 6, 0, 95);

-- =============================================
-- 一百六十、新增课程 - 专项突破系列（资料分析）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1613, 593, '资料分析专项突破：增长率计算提速', '5课时 | 专项突破', '针对增长率相关计算进行专项突破，大幅提升计算速度。', 'article', 'intermediate', 5, 0, 85),
(1614, 593, '资料分析专项突破：比重变化判断', '4课时 | 专项突破', '针对比重变化判断题进行专项突破，快速确定比重升降。', 'article', 'intermediate', 4, 0, 86),
(1615, 593, '资料分析专项突破：综合分析题攻克', '5课时 | 专项突破', '针对资料分析综合分析题进行专项突破，提升综合判断能力。', 'article', 'advanced', 5, 0, 87),
(1616, 598, '速算技巧专项突破：15秒完成一道计算', '4课时 | 专项突破', '专项训练资料分析速算技巧，实现15秒内完成一道计算题。', 'article', 'intermediate', 4, 0, 50);

-- =============================================
-- 一百六十一、新增课程 - 专项突破系列（常识判断）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1617, 608, '政治常识专项突破：习近平新时代思想', '5课时 | 专项突破', '专项学习习近平新时代中国特色社会主义思想的核心要点。', 'article', 'intermediate', 5, 0, 35),
(1618, 612, '法律常识专项突破：民法典重点条款', '5课时 | 专项突破', '专项学习民法典的重点条款与高频考点。', 'article', 'intermediate', 5, 0, 55),
(1619, 617, '科技常识专项突破：前沿科技与日常应用', '4课时 | 专项突破', '专项学习前沿科技发展与日常科技应用常识。', 'article', 'intermediate', 4, 0, 60),
(1620, 617, '历史常识专项突破：中国近现代史要点', '4课时 | 专项突破', '专项学习中国近现代史的重要事件与历史意义。', 'article', 'intermediate', 4, 0, 61);

-- =============================================
-- 一百六十二、新增课程 - 专项突破系列（申论）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1621, 627, '归纳概括专项突破：要点全面提取', '5课时 | 专项突破', '针对归纳概括题进行专项突破，确保要点提取全面准确。', 'article', 'intermediate', 5, 0, 30),
(1622, 635, '综合分析专项突破：深度分析能力', '6课时 | 专项突破', '针对综合分析题进行专项突破，提升问题分析的深度与逻辑性。', 'article', 'intermediate', 6, 0, 50),
(1623, 631, '提出对策专项突破：可行性对策', '5课时 | 专项突破', '针对提出对策题进行专项突破，确保对策具体可行。', 'article', 'intermediate', 5, 0, 40),
(1624, 643, '应用文专项突破：格式与内容兼顾', '6课时 | 专项突破', '针对应用文写作进行专项突破，实现格式规范与内容完整。', 'article', 'intermediate', 6, 0, 70),
(1625, 651, '大作文专项突破：立意与论证', '8课时 | 专项突破', '针对申论大作文进行专项突破，强化立意准确与论证有力。', 'article', 'intermediate', 8, 0, 70);

-- =============================================
-- 一百六十三、新增课程 - 专项突破系列（面试）
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1626, 719, '综合分析专项突破：观点深刻有见地', '6课时 | 专项突破', '针对面试综合分析题进行专项突破，提升观点的深刻性与独特性。', 'article', 'intermediate', 6, 0, 95),
(1627, 725, '组织计划专项突破：方案完整可行', '5课时 | 专项突破', '针对面试组织计划题进行专项突破，确保方案完整可操作。', 'article', 'intermediate', 5, 0, 55),
(1628, 733, '人际关系专项突破：处理得体有分寸', '5课时 | 专项突破', '针对面试人际关系题进行专项突破，展现成熟的人际处理能力。', 'article', 'intermediate', 5, 0, 55),
(1629, 740, '应急应变专项突破：冷静应对有章法', '5课时 | 专项突破', '针对面试应急应变题进行专项突破，展现冷静处事的能力。', 'article', 'intermediate', 5, 0, 55);

-- =============================================
-- 一百六十四、新增课程 - 时政热点专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1630, 609, '2026年两会热点解读：政府工作报告要点', '5课时 | 时政热点', '深入解读2026年两会政府工作报告的核心要点与政策方向。', 'article', 'intermediate', 5, 0, 65),
(1631, 609, '2026年中央经济工作会议解读', '4课时 | 时政热点', '深入解读2026年中央经济工作会议的主要精神与政策导向。', 'article', 'intermediate', 4, 0, 66),
(1632, 609, '乡村振兴战略专题：政策与实践', '4课时 | 时政热点', '系统学习乡村振兴战略的政策内容与基层实践案例。', 'article', 'intermediate', 4, 0, 67),
(1633, 609, '数字经济发展专题：趋势与机遇', '4课时 | 时政热点', '系统学习数字经济发展的趋势、政策与考试热点。', 'article', 'intermediate', 4, 0, 68),
(1634, 609, '绿色低碳发展专题：双碳目标解读', '4课时 | 时政热点', '系统学习双碳目标的内涵、路径与政策措施。', 'article', 'intermediate', 4, 0, 69),
(1635, 609, '共同富裕专题：理论与实践', '4课时 | 时政热点', '系统学习共同富裕的理论内涵与实践探索。', 'article', 'intermediate', 4, 0, 70),
(1636, 609, '新质生产力专题：概念与应用', '3课时 | 时政热点', '系统学习新质生产力的概念内涵与发展要求。', 'article', 'intermediate', 3, 0, 71),
(1637, 609, '高质量发展专题：内涵与要求', '4课时 | 时政热点', '系统学习高质量发展的内涵要求与实现路径。', 'article', 'intermediate', 4, 0, 72);

-- =============================================
-- 一百六十五、新增课程 - 案例分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1638, 719, '面试案例分析：基层治理典型案例', '5课时 | 案例分析', '分析基层治理的典型案例，积累面试答题素材。', 'article', 'intermediate', 5, 0, 100),
(1639, 719, '面试案例分析：公共服务创新案例', '4课时 | 案例分析', '分析公共服务创新的典型案例，拓宽答题视角。', 'article', 'intermediate', 4, 0, 101),
(1640, 719, '面试案例分析：社会治理典型案例', '4课时 | 案例分析', '分析社会治理的典型案例，丰富答题内容。', 'article', 'intermediate', 4, 0, 102),
(1641, 719, '面试案例分析：应急管理典型案例', '4课时 | 案例分析', '分析应急管理的典型案例，学习危机应对方法。', 'article', 'intermediate', 4, 0, 103),
(1642, 624, '申论案例素材：经济发展优秀案例', '4课时 | 案例分析', '积累经济发展领域的优秀案例，丰富申论写作素材。', 'article', 'intermediate', 4, 0, 185),
(1643, 624, '申论案例素材：社会民生优秀案例', '4课时 | 案例分析', '积累社会民生领域的优秀案例，丰富申论写作素材。', 'article', 'intermediate', 4, 0, 186),
(1644, 624, '申论案例素材：生态环保优秀案例', '4课时 | 案例分析', '积累生态环保领域的优秀案例，丰富申论写作素材。', 'article', 'intermediate', 4, 0, 187);

-- =============================================
-- 一百六十六、新增课程 - 名言警句积累系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1645, 651, '习近平重要论述汇编：高频引用句', '6课时 | 名言积累', '汇编习近平总书记的重要论述，分主题整理高频引用句。', 'article', 'intermediate', 6, 0, 75),
(1646, 651, '传统文化名言积累：古语今用', '4课时 | 名言积累', '积累传统文化中的名言警句，学习古语在现代文章中的运用。', 'article', 'intermediate', 4, 0, 76),
(1647, 651, '领导人重要讲话金句：开头结尾适用', '4课时 | 名言积累', '整理领导人重要讲话中的金句，适用于文章开头结尾。', 'article', 'intermediate', 4, 0, 77),
(1648, 722, '面试名言警句运用：综合分析题适用', '4课时 | 名言积累', '整理面试综合分析题中可引用的名言警句，提升答题档次。', 'article', 'intermediate', 4, 0, 55);

-- =============================================
-- 一百六十七、新增课程 - 备考规划系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1649, 1, '国考备考规划：六个月系统备考方案', '5课时 | 备考规划', '为准备国考的考生制定六个月的系统备考规划与学习安排。', 'article', 'basic', 5, 1, 310),
(1650, 1, '国考备考规划：三个月冲刺备考方案', '4课时 | 备考规划', '为时间紧张的考生制定三个月的国考冲刺备考方案。', 'article', 'basic', 4, 1, 311),
(1651, 1, '省考备考规划：与国考并行备考策略', '4课时 | 备考规划', '制定国考省考并行备考策略，最大化利用备考时间。', 'article', 'basic', 4, 1, 312),
(1652, 1, '在职备考规划：工作学习平衡方案', '4课时 | 备考规划', '为在职考生制定工作学习平衡的备考方案与时间管理策略。', 'article', 'basic', 4, 1, 313),
(1653, 716, '面试备考规划：笔试后的面试准备', '4课时 | 备考规划', '为进入面试的考生制定笔试后的面试备考规划。', 'article', 'basic', 4, 1, 150);

-- =============================================
-- 一百六十八、新增课程 - 答题技巧汇总系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1654, 546, '言语理解答题技巧汇总：30个实用技巧', '6课时 | 技巧汇总', '汇总言语理解与表达的30个实用答题技巧，提升答题效率。', 'article', 'intermediate', 6, 0, 135),
(1655, 559, '数量关系答题技巧汇总：20个秒杀技巧', '5课时 | 技巧汇总', '汇总数量关系的20个秒杀技巧，快速提升得分率。', 'article', 'intermediate', 5, 0, 130),
(1656, 573, '判断推理答题技巧汇总：25个核心技巧', '6课时 | 技巧汇总', '汇总判断推理的25个核心答题技巧，提升判断准确率。', 'article', 'intermediate', 6, 0, 130),
(1657, 592, '资料分析答题技巧汇总：15个速算技巧', '5课时 | 技巧汇总', '汇总资料分析的15个速算技巧，大幅提升计算速度。', 'article', 'intermediate', 5, 0, 125),
(1658, 624, '申论答题技巧汇总：各题型通用技巧', '6课时 | 技巧汇总', '汇总申论各题型的通用答题技巧，提升整体作答质量。', 'article', 'intermediate', 6, 0, 190),
(1659, 716, '面试答题技巧汇总：各题型通用技巧', '6课时 | 技巧汇总', '汇总面试各题型的通用答题技巧，提升综合表现。', 'article', 'intermediate', 6, 0, 155);

-- =============================================
-- 一百六十九、新增课程 - 易错题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1660, 547, '逻辑填空易错题分析：常见陷阱与对策', '5课时 | 易错分析', '分析逻辑填空的常见易错题型，揭示命题陷阱与应对策略。', 'article', 'intermediate', 5, 0, 50),
(1661, 551, '片段阅读易错题分析：干扰项识别', '5课时 | 易错分析', '分析片段阅读的易错题型，提升干扰项识别能力。', 'article', 'intermediate', 5, 0, 95),
(1662, 574, '图形推理易错题分析：规律误判纠正', '4课时 | 易错分析', '分析图形推理的易错题型，纠正常见的规律误判问题。', 'article', 'intermediate', 4, 0, 65),
(1663, 587, '逻辑判断易错题分析：论证谬误识别', '5课时 | 易错分析', '分析逻辑判断的易错题型，提升论证谬误识别能力。', 'article', 'intermediate', 5, 0, 100),
(1664, 593, '资料分析易错题分析：计算陷阱揭示', '4课时 | 易错分析', '分析资料分析的易错题型，揭示常见的计算陷阱。', 'article', 'intermediate', 4, 0, 90);

-- =============================================
-- 一百七十、新增课程 - 高分技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1665, 1, '行测80+高分攻略：全模块优化策略', '8课时 | 高分技巧', '为追求行测80分以上的考生提供全模块优化策略。', 'article', 'advanced', 8, 0, 415),
(1666, 624, '申论75+高分攻略：各题型满分突破', '8课时 | 高分技巧', '为追求申论75分以上的考生提供各题型满分突破策略。', 'article', 'advanced', 8, 0, 195),
(1667, 716, '面试90+高分攻略：全方位提升策略', '8课时 | 高分技巧', '为追求面试90分以上的考生提供全方位提升策略。', 'article', 'advanced', 8, 0, 160),
(1668, 1, '国考行测高分经验分享：上岸考生心得', '5课时 | 高分技巧', '分享国考行测高分考生的备考经验与答题心得。', 'article', 'intermediate', 5, 1, 316),
(1669, 624, '国考申论高分经验分享：上岸考生心得', '5课时 | 高分技巧', '分享国考申论高分考生的备考经验与写作心得。', 'article', 'intermediate', 5, 1, 196);

-- =============================================
-- 一百七十一、新增课程 - 考试策略系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1670, 1, '行测时间分配策略：120分钟最优分配', '3课时 | 考试策略', '制定行测120分钟的最优时间分配策略，合理安排各模块用时。', 'article', 'intermediate', 3, 1, 320),
(1671, 1, '行测答题顺序策略：因人而异的最优顺序', '3课时 | 考试策略', '分析不同考生特点，制定因人而异的行测答题顺序策略。', 'article', 'intermediate', 3, 1, 321),
(1672, 1, '行测蒙题策略：科学蒙题提高正确率', '2课时 | 考试策略', '讲解行测科学蒙题的方法，在时间紧张时提高蒙题正确率。', 'article', 'basic', 2, 1, 322),
(1673, 624, '申论时间分配策略：180分钟最优分配', '3课时 | 考试策略', '制定申论180分钟的最优时间分配策略，保证各题完成质量。', 'article', 'intermediate', 3, 1, 198),
(1674, 624, '申论字数控制策略：精准控制答案字数', '2课时 | 考试策略', '讲解申论各题型的字数控制技巧，精准把握答案长度。', 'article', 'intermediate', 2, 0, 199),
(1675, 716, '面试时间把控策略：各题型用时建议', '3课时 | 考试策略', '讲解面试各题型的建议用时，避免超时或提前结束。', 'article', 'intermediate', 3, 0, 165);

-- =============================================
-- 一百七十二、新增课程 - 阅卷视角系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1676, 624, '申论阅卷视角：了解阅卷老师的评分标准', '4课时 | 阅卷视角', '从阅卷老师视角分析申论评分标准，明确得分要点。', 'article', 'intermediate', 4, 0, 200),
(1677, 625, '归纳概括阅卷标准：如何获得满分', '3课时 | 阅卷视角', '分析归纳概括题的阅卷标准，明确满分答案的特点。', 'article', 'intermediate', 3, 0, 40),
(1678, 643, '大作文阅卷标准：各档次文章特点', '4课时 | 阅卷视角', '分析申论大作文的阅卷标准，了解各档次文章的特点。', 'article', 'intermediate', 4, 0, 75),
(1679, 716, '面试评分视角：了解考官的评分逻辑', '4课时 | 阅卷视角', '从考官视角分析面试评分逻辑，明确高分表现特点。', 'article', 'intermediate', 4, 0, 170);

-- =============================================
-- 一百七十三、新增课程 - 公基专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1680, 691, '马克思主义哲学专项：唯物辩证法', '5课时 | 公基专项', '专项学习唯物辩证法的核心内容与考试要点。', 'article', 'intermediate', 5, 0, 45),
(1681, 691, '马克思主义哲学专项：认识论与方法论', '4课时 | 公基专项', '专项学习认识论与方法论的核心内容与考试要点。', 'article', 'intermediate', 4, 0, 46),
(1682, 691, '毛泽东思想专项：新民主主义革命理论', '4课时 | 公基专项', '专项学习新民主主义革命理论的核心内容。', 'article', 'intermediate', 4, 0, 47),
(1683, 698, '宪法专项：国家机构与公民权利', '5课时 | 公基专项', '专项学习宪法中国家机构与公民基本权利的内容。', 'article', 'intermediate', 5, 0, 75),
(1684, 698, '民法典专项：人格权与婚姻家庭', '5课时 | 公基专项', '专项学习民法典中人格权与婚姻家庭编的重要内容。', 'article', 'intermediate', 5, 0, 76),
(1685, 698, '行政法专项：行政处罚与行政诉讼', '5课时 | 公基专项', '专项学习行政处罚法与行政诉讼法的核心内容。', 'article', 'intermediate', 5, 0, 77),
(1686, 706, '公文写作专项：请示与报告的区分', '3课时 | 公基专项', '专项学习请示与报告的区分与规范写作。', 'article', 'intermediate', 3, 0, 35),
(1687, 706, '公文写作专项：通知与通告的规范', '3课时 | 公基专项', '专项学习通知与通告的格式规范与写作要求。', 'article', 'intermediate', 3, 0, 36);

-- =============================================
-- 一百七十四、新增课程 - 实战模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1688, 1, '行测实战模拟（一）：副省级难度', '1套 | 实战模拟', '副省级难度的行测实战模拟卷，检验综合备考水平。', 'article', 'advanced', 1, 0, 425),
(1689, 1, '行测实战模拟（二）：地市级难度', '1套 | 实战模拟', '地市级难度的行测实战模拟卷，适合基础巩固检验。', 'article', 'intermediate', 1, 0, 426),
(1690, 1, '行测实战模拟（三）：省考难度', '1套 | 实战模拟', '省考难度的行测实战模拟卷，适合省考备考检验。', 'article', 'intermediate', 1, 0, 427),
(1691, 624, '申论实战模拟（一）：副省级难度', '1套 | 实战模拟', '副省级难度的申论实战模拟卷，检验写作综合能力。', 'article', 'advanced', 1, 0, 205),
(1692, 624, '申论实战模拟（二）：地市级难度', '1套 | 实战模拟', '地市级难度的申论实战模拟卷，适合基础能力检验。', 'article', 'intermediate', 1, 0, 206),
(1693, 716, '面试实战模拟：结构化面试全流程', '1套 | 实战模拟', '完整的结构化面试实战模拟，体验真实面试流程。', 'article', 'intermediate', 1, 0, 175),
(1694, 716, '面试实战模拟：无领导小组讨论', '1套 | 实战模拟', '无领导小组讨论的实战模拟，练习团队讨论技巧。', 'article', 'intermediate', 1, 0, 176);

-- =============================================
-- 一百七十五、新增课程 - 岗位匹配系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1695, 1, '岗位选择指南：如何选择适合自己的岗位', '4课时 | 岗位匹配', '帮助考生分析自身条件与岗位要求，选择最适合的报考岗位。', 'article', 'basic', 4, 1, 330),
(1696, 1, '热门岗位分析：竞争激烈岗位的特点', '3课时 | 岗位匹配', '分析热门岗位的报考条件与竞争特点，帮助理性选择。', 'article', 'basic', 3, 1, 331),
(1697, 1, '冷门岗位挖掘：高性价比岗位推荐', '3课时 | 岗位匹配', '挖掘竞争较小但发展前景好的高性价比岗位。', 'article', 'basic', 3, 1, 332),
(1698, 1, '专业限制岗位：各专业可报岗位汇总', '4课时 | 岗位匹配', '按专业分类汇总可报考的岗位类型，方便对号入座。', 'article', 'basic', 4, 1, 333);

-- =============================================
-- 一百七十六、新增课程 - 体检与政审系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1699, 1, '公务员体检标准解读：各项指标要求', '3课时 | 体检政审', '详细解读公务员录用体检各项指标的标准要求。', 'article', 'basic', 3, 1, 335),
(1700, 1, '体检前注意事项：如何顺利通过体检', '2课时 | 体检政审', '介绍体检前的注意事项与准备工作，确保顺利通过。', 'article', 'basic', 2, 1, 336),
(1701, 1, '政审流程解读：政审考察的内容与标准', '3课时 | 体检政审', '详细解读政审流程、考察内容与通过标准。', 'article', 'basic', 3, 1, 337),
(1702, 1, '政审材料准备：需要准备的各类材料清单', '2课时 | 体检政审', '汇总政审需要准备的各类材料，提前做好准备工作。', 'article', 'basic', 2, 1, 338);

-- =============================================
-- 一百七十七、新增课程 - 入职指导系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1703, 1, '公务员入职指南：报到前的准备工作', '2课时 | 入职指导', '介绍公务员入职报到前需要完成的各项准备工作。', 'article', 'basic', 2, 1, 340),
(1704, 1, '试用期注意事项：新公务员必知要点', '3课时 | 入职指导', '介绍公务员试用期的注意事项与工作要点。', 'article', 'basic', 3, 1, 341),
(1705, 1, '机关工作适应：快速融入新环境', '3课时 | 入职指导', '帮助新公务员快速适应机关工作环境与文化。', 'article', 'basic', 3, 1, 342);

-- =============================================
-- 一百七十八、新增课程 - 事业单位考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1706, 691, '事业单位综合知识：与公务员考试的区别', '4课时 | 事业单位', '分析事业单位考试与公务员考试的区别，调整备考策略。', 'article', 'intermediate', 4, 0, 55),
(1707, 691, '事业单位职业能力测验：题型特点分析', '5课时 | 事业单位', '分析事业单位职业能力测验的题型特点与解题方法。', 'article', 'intermediate', 5, 0, 56),
(1708, 691, '事业单位公共基础知识：重点内容梳理', '6课时 | 事业单位', '梳理事业单位公共基础知识考试的重点内容。', 'article', 'intermediate', 6, 0, 57),
(1709, 716, '事业单位面试特点：与公务员面试的差异', '3课时 | 事业单位', '分析事业单位面试与公务员面试的差异，针对性准备。', 'article', 'intermediate', 3, 0, 180);

-- =============================================
-- 一百七十九、新增课程 - 选调生考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1710, 1, '选调生考试概述：报考条件与考试内容', '3课时 | 选调生', '介绍选调生考试的报考条件、考试内容与发展前景。', 'article', 'basic', 3, 1, 345),
(1711, 1, '选调生笔试备考：行测与申论的特点', '5课时 | 选调生', '分析选调生笔试中行测与申论的特点，制定备考策略。', 'article', 'intermediate', 5, 0, 346),
(1712, 716, '选调生面试特点：强调基层意识', '4课时 | 选调生', '分析选调生面试的特点，强化基层工作意识的展现。', 'article', 'intermediate', 4, 0, 182),
(1713, 1, '选调生基层锻炼：两年村官经历分享', '3课时 | 选调生', '分享选调生基层锻炼的经历与成长，了解基层工作。', 'article', 'basic', 3, 1, 347);

-- =============================================
-- 一百八十、新增课程 - 遴选考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1714, 624, '遴选考试概述：报考条件与考试形式', '3课时 | 遴选考试', '介绍遴选考试的报考条件、考试形式与发展路径。', 'article', 'basic', 3, 1, 210),
(1715, 624, '遴选笔试特点：策论文写作要求', '5课时 | 遴选考试', '分析遴选笔试的特点，重点讲解策论文的写作要求。', 'article', 'intermediate', 5, 0, 211),
(1716, 624, '遴选案例分析题：分析方法与答题技巧', '5课时 | 遴选考试', '专项训练遴选案例分析题的分析方法与答题技巧。', 'article', 'intermediate', 5, 0, 212),
(1717, 716, '遴选面试特点：强调实际工作能力', '4课时 | 遴选考试', '分析遴选面试的特点，强化实际工作能力的展现。', 'article', 'intermediate', 4, 0, 185);

-- =============================================
-- 一百八十一、新增课程 - 三支一扶考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1718, 1, '三支一扶考试概述：报考条件与政策优惠', '3课时 | 三支一扶', '介绍三支一扶考试的报考条件、服务内容与政策优惠。', 'article', 'basic', 3, 1, 350),
(1719, 691, '三支一扶笔试备考：综合知识考点', '5课时 | 三支一扶', '梳理三支一扶笔试综合知识的重点考点与备考方法。', 'article', 'intermediate', 5, 0, 60),
(1720, 716, '三支一扶面试备考：服务意识的展现', '4课时 | 三支一扶', '分析三支一扶面试的特点，强化服务基层意识的展现。', 'article', 'intermediate', 4, 0, 188);

-- =============================================
-- 一百八十二、新增课程 - 军队文职考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1721, 1, '军队文职考试概述：招考政策与岗位分析', '4课时 | 军队文职', '介绍军队文职考试的招考政策、岗位类型与发展前景。', 'article', 'basic', 4, 1, 355),
(1722, 691, '军队文职公共科目：考试内容与特点', '6课时 | 军队文职', '分析军队文职公共科目的考试内容与答题技巧。', 'article', 'intermediate', 6, 0, 65),
(1723, 716, '军队文职面试特点：军事素养的体现', '4课时 | 军队文职', '分析军队文职面试的特点，适当展现军事素养与政治觉悟。', 'article', 'intermediate', 4, 0, 190);

-- =============================================
-- 一百八十三、新增课程 - 警察考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1724, 1, '公安联考概述：招考政策与岗位分析', '4课时 | 警察考试', '介绍公安联考的招考政策、岗位类型与报考条件。', 'article', 'basic', 4, 1, 358),
(1725, 1, '公安专业科目备考：公安基础知识', '8课时 | 警察考试', '系统学习公安专业科目的公安基础知识内容。', 'article', 'intermediate', 8, 0, 359),
(1726, 716, '公安面试特点：执法规范的展现', '4课时 | 警察考试', '分析公安面试的特点，强化执法规范意识的展现。', 'article', 'intermediate', 4, 0, 192);

-- =============================================
-- 一百八十四、新增课程 - 银行考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1727, 1, '银行招聘考试概述：各大银行招考特点', '4课时 | 银行考试', '介绍各大银行招聘考试的特点、报考条件与备考策略。', 'article', 'basic', 4, 1, 362),
(1728, 1, '银行笔试备考：EPI与专业知识', '6课时 | 银行考试', '系统讲解银行笔试EPI与专业知识的备考方法。', 'article', 'intermediate', 6, 0, 363),
(1729, 716, '银行面试特点：金融素养的展现', '4课时 | 银行考试', '分析银行面试的特点，强化金融专业素养的展现。', 'article', 'intermediate', 4, 0, 195);

-- =============================================
-- 一百八十五、新增课程 - 国企考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1730, 1, '国企招聘考试概述：央企与地方国企区别', '4课时 | 国企考试', '介绍国企招聘考试的类型、特点与备考策略。', 'article', 'basic', 4, 1, 365),
(1731, 1, '国企笔试备考：行测与专业知识', '5课时 | 国企考试', '系统讲解国企笔试行测与专业知识的备考方法。', 'article', 'intermediate', 5, 0, 366),
(1732, 716, '国企面试特点：企业文化认同的展现', '4课时 | 国企考试', '分析国企面试的特点，展现对企业文化的认同。', 'article', 'intermediate', 4, 0, 198);

-- =============================================
-- 一百八十六、新增课程 - 教师招聘考试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1733, 691, '教师招聘考试概述：各地招考政策分析', '4课时 | 教师招聘', '介绍各地教师招聘考试的政策、内容与备考策略。', 'article', 'basic', 4, 1, 70),
(1734, 691, '教师招聘笔试：教育综合知识', '6课时 | 教师招聘', '系统讲解教师招聘笔试教育综合知识的内容与备考。', 'article', 'intermediate', 6, 0, 71),
(1735, 716, '教师招聘面试：试讲与说课技巧', '5课时 | 教师招聘', '专项训练教师招聘面试的试讲与说课技巧。', 'article', 'intermediate', 5, 0, 200);

-- =============================================
-- 一百八十七、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '常识判断入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '常识判断模块的入门导学课程，全面介绍模块概述、考点分布、学习方法与备考策略。'
WHERE `id` = 9;

UPDATE `what_courses` SET 
    `title` = '公共基础入门导学：模块概述与学习方法',
    `subtitle` = '3课时 | 入门导学',
    `description` = '公共基础知识的入门导学课程，全面介绍考试内容、重点分布与备考策略。'
WHERE `id` = 10;

-- =============================================
-- 一百八十八、更新课程分类描述优化
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习意图判断题型，掌握揣摩作者意图、把握言外之意的核心方法。',
    `long_description` = '意图判断是片段阅读的重要题型，主要考查考生对作者写作意图的理解能力。本课程体系涵盖意图判断基本方法（揣摩作者真实用意）、与主旨题的区分（字面意思vs言外之意）、典型题型训练（呼吁建议类、警示类等），帮助考生准确把握作者意图。'
WHERE `id` = 553;

UPDATE `what_course_categories` SET 
    `description` = '系统学习细节理解题型，掌握精准定位、对比验证、排除干扰的核心技巧。',
    `long_description` = '细节理解是片段阅读的基础题型，主要考查考生对文段细节信息的把握能力。本课程体系涵盖细节判断基本方法（定位原文、对比选项）、干扰项识别（偷换概念、以偏概全、无中生有）、快速定位技巧（关键词匹配、跳读法），帮助考生准确判断细节正误。'
WHERE `id` = 554;

UPDATE `what_course_categories` SET 
    `description` = '系统学习图形推理题型，掌握位置、样式、属性、数量、空间重构等规律识别。',
    `long_description` = '图形推理是判断推理的视觉化题型，主要考查考生对图形规律的识别与推理能力。本课程体系涵盖位置规律（平移、旋转、翻转）、样式规律（遍历、叠加、组合）、属性规律（对称、封闭、曲直）、数量规律（点、线、面、角的数量变化）、空间重构（折纸盒、截面图），全面覆盖图形推理所有考点。'
WHERE `id` = 574;

UPDATE `what_course_categories` SET 
    `description` = '系统学习逻辑判断题型，掌握翻译推理、真假推理、分析推理、加强削弱等核心内容。',
    `long_description` = '逻辑判断是判断推理的核心难点，主要考查考生的逻辑思维与论证分析能力。本课程体系涵盖翻译推理（充分必要条件转化）、真假推理（矛盾关系、反对关系）、分析推理（排列组合问题）、加强削弱（论证结构分析、加强削弱方式），全面提升逻辑推理能力。'
WHERE `id` = 587;

UPDATE `what_course_categories` SET 
    `description` = '系统学习资料分析核心概念，掌握增长、比重、倍数、平均数等关键指标的计算方法。',
    `long_description` = '核心概念是资料分析的基础，主要考查考生对统计指标的理解与计算能力。本课程体系涵盖增长问题（增长率、增长量、年均增长）、比重问题（现期比重、基期比重、比重变化）、倍数问题（现期倍数、基期倍数）、平均数问题（平均数计算、平均数增长率），建立完整的概念体系。'
WHERE `id` = 593;

-- =============================================
-- 一百八十九、新增课程 - 常识判断年度热点系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1736, 609, '2026年度重大时政热点汇编', '8课时 | 年度热点', '汇编2026年度重大时政热点，涵盖政治、经济、社会、文化各领域。', 'article', 'intermediate', 8, 0, 80),
(1737, 609, '2025年度重大时政热点回顾', '6课时 | 年度热点', '回顾2025年度重大时政热点，巩固近两年时政积累。', 'article', 'intermediate', 6, 0, 81),
(1738, 612, '2026年新法新规速览', '4课时 | 年度热点', '速览2026年新颁布或修订的重要法律法规。', 'article', 'intermediate', 4, 0, 60),
(1739, 617, '2026年科技成就盘点', '3课时 | 年度热点', '盘点2026年重大科技成就与科技突破。', 'article', 'intermediate', 3, 0, 65);

-- =============================================
-- 一百九十、新增课程 - 言语理解年度真题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1740, 546, '五年国考言语真题趋势分析：命题规律总结', '5课时 | 趋势分析', '分析近五年国考言语理解的命题趋势与规律变化。', 'article', 'intermediate', 5, 0, 140),
(1741, 546, '五年省考言语真题趋势分析：联考命题特点', '5课时 | 趋势分析', '分析近五年省考联考言语理解的命题趋势与特点。', 'article', 'intermediate', 5, 0, 141);

-- =============================================
-- 一百九十一、新增课程 - 数量关系年度真题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1742, 559, '五年国考数量真题趋势分析：难度与题型变化', '4课时 | 趋势分析', '分析近五年国考数量关系的难度变化与题型分布。', 'article', 'intermediate', 4, 0, 135),
(1743, 559, '五年省考数量真题趋势分析：联考命题规律', '4课时 | 趋势分析', '分析近五年省考联考数量关系的命题规律与备考重点。', 'article', 'intermediate', 4, 0, 136);

-- =============================================
-- 一百九十二、新增课程 - 判断推理年度真题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1744, 573, '五年国考判断真题趋势分析：各题型变化', '5课时 | 趋势分析', '分析近五年国考判断推理各题型的变化趋势与规律。', 'article', 'intermediate', 5, 0, 135),
(1745, 573, '五年省考判断真题趋势分析：联考命题特色', '5课时 | 趋势分析', '分析近五年省考联考判断推理的命题特色与重点。', 'article', 'intermediate', 5, 0, 136);

-- =============================================
-- 一百九十三、新增课程 - 资料分析年度真题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1746, 592, '五年国考资料真题趋势分析：材料与考点变化', '4课时 | 趋势分析', '分析近五年国考资料分析的材料类型与考点变化。', 'article', 'intermediate', 4, 0, 130),
(1747, 592, '五年省考资料真题趋势分析：联考数据特点', '4课时 | 趋势分析', '分析近五年省考联考资料分析的数据特点与计算要求。', 'article', 'intermediate', 4, 0, 131);

-- =============================================
-- 一百九十四、新增课程 - 申论年度真题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1748, 624, '五年国考申论真题趋势分析：主题与题型变化', '6课时 | 趋势分析', '分析近五年国考申论的主题变化与题型分布趋势。', 'article', 'intermediate', 6, 0, 215),
(1749, 624, '五年省考申论真题趋势分析：联考命题规律', '5课时 | 趋势分析', '分析近五年省考联考申论的命题规律与备考方向。', 'article', 'intermediate', 5, 0, 216);

-- =============================================
-- 一百九十五、新增课程 - 面试年度真题分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1750, 716, '国考面试真题趋势分析：各系统面试特点', '6课时 | 趋势分析', '分析国考各系统面试的真题特点与命题趋势。', 'article', 'intermediate', 6, 0, 205),
(1751, 716, '省考面试真题趋势分析：各省面试风格', '5课时 | 趋势分析', '分析各省省考面试的真题特点与考察侧重。', 'article', 'intermediate', 5, 0, 206);

-- =============================================
-- 一百九十六、新增课程 - 考前押题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1752, 1, '2026国考行测考前预测：高频考点押题', '5课时 | 考前押题', '基于命题规律预测2026国考行测的高频考点与重点题型。', 'article', 'intermediate', 5, 0, 430),
(1753, 624, '2026国考申论考前预测：热点主题押题', '5课时 | 考前押题', '基于时政热点预测2026国考申论的可能主题与考察方向。', 'article', 'intermediate', 5, 0, 220),
(1754, 716, '2026国考面试考前预测：热门话题押题', '5课时 | 考前押题', '基于时政热点预测2026国考面试的热门话题与考察重点。', 'article', 'intermediate', 5, 0, 210);

-- =============================================
-- 一百九十七、新增课程 - 错题复盘系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1755, 1, '行测错题复盘方法：高效利用错题提升', '3课时 | 错题复盘', '讲解行测错题的科学复盘方法，高效利用错题提升成绩。', 'article', 'intermediate', 3, 0, 435),
(1756, 624, '申论错题复盘方法：从失分点找提升空间', '3课时 | 错题复盘', '讲解申论答案的复盘方法，从失分点找到提升空间。', 'article', 'intermediate', 3, 0, 225),
(1757, 716, '面试复盘方法：从每次练习中进步', '3课时 | 错题复盘', '讲解面试练习的复盘方法，从每次练习中实现进步。', 'article', 'intermediate', 3, 0, 215);

-- =============================================
-- 一百九十八、新增课程 - 学习方法系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1758, 1, '费曼学习法在公考备考中的应用', '2课时 | 学习方法', '介绍费曼学习法在公考备考中的具体应用方法。', 'article', 'basic', 2, 1, 440),
(1759, 1, '番茄工作法在刷题中的应用', '2课时 | 学习方法', '介绍番茄工作法在刷题练习中的具体应用方法。', 'article', 'basic', 2, 1, 441),
(1760, 1, '艾宾浩斯遗忘曲线在知识记忆中的应用', '2课时 | 学习方法', '介绍艾宾浩斯遗忘曲线在知识点记忆中的应用方法。', 'article', 'basic', 2, 1, 442),
(1761, 1, '思维导图在知识体系构建中的应用', '2课时 | 学习方法', '介绍思维导图在构建知识体系中的应用方法。', 'article', 'basic', 2, 1, 443);

-- =============================================
-- 一百九十九、新增课程 - 心理调适系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1762, 1, '备考焦虑的心理调适：保持良好心态', '2课时 | 心理调适', '帮助考生调适备考过程中的焦虑情绪，保持良好心态。', 'article', 'basic', 2, 1, 445),
(1763, 1, '考试失利的心理重建：重新出发', '2课时 | 心理调适', '帮助考试失利的考生进行心理重建，鼓励重新出发。', 'article', 'basic', 2, 1, 446),
(1764, 716, '面试紧张的心理调适：克服社交恐惧', '2课时 | 心理调适', '帮助考生克服面试紧张和社交恐惧，自信应对面试。', 'article', 'basic', 2, 1, 218);

-- =============================================
-- 二百、新增课程 - 综合提升系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1765, 1, '行测综合能力提升：从基础到进阶', '10课时 | 综合提升', '系统提升行测综合能力，实现从基础到进阶的跨越。', 'article', 'intermediate', 10, 0, 450),
(1766, 624, '申论综合能力提升：从入门到精通', '10课时 | 综合提升', '系统提升申论综合能力，实现从入门到精通的进步。', 'article', 'intermediate', 10, 0, 230),
(1767, 716, '面试综合能力提升：全方位塑造面试表现', '10课时 | 综合提升', '系统提升面试综合能力，全方位塑造优秀的面试表现。', 'article', 'intermediate', 10, 0, 220),
(1768, 691, '公基综合能力提升：知识体系完善', '8课时 | 综合提升', '系统完善公基知识体系，提升综合答题能力。', 'article', 'intermediate', 8, 0, 80);

-- =============================================
-- 二百〇一、新增课程 - 申论写作素材库系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1769, 651, '申论万能开头素材库：50个经典开头模板', '5课时 | 素材积累', '汇编50个申论经典开头模板，涵盖引用式、对比式、设问式等多种开头方式。', 'article', 'intermediate', 5, 0, 80),
(1770, 651, '申论精彩结尾素材库：40个高分结尾范例', '4课时 | 素材积累', '汇编40个申论高分结尾范例，包括呼吁式、展望式、升华式等结尾技巧。', 'article', 'intermediate', 4, 0, 81),
(1771, 651, '申论过渡衔接素材库：优美过渡语句汇编', '3课时 | 素材积累', '汇编申论写作中常用的过渡衔接语句，让文章行文流畅自然。', 'article', 'intermediate', 3, 0, 82),
(1772, 651, '申论分论点素材库：100个精彩分论点', '6课时 | 素材积累', '汇编100个申论高分分论点表述，涵盖各类热点主题。', 'article', 'intermediate', 6, 0, 83),
(1773, 651, '申论论据素材库：政策理论与典型案例', '6课时 | 素材积累', '汇编申论写作所需的政策理论依据与典型实践案例。', 'article', 'intermediate', 6, 0, 84);

-- =============================================
-- 二百〇二、新增课程 - 面试礼仪形象系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1774, 716, '面试着装搭配指南：男士正装选择', '2课时 | 礼仪形象', '详细讲解男士面试着装的选择与搭配，塑造专业形象。', 'article', 'basic', 2, 1, 225),
(1775, 716, '面试着装搭配指南：女士正装选择', '2课时 | 礼仪形象', '详细讲解女士面试着装的选择与搭配，展现端庄大方。', 'article', 'basic', 2, 1, 226),
(1776, 716, '面试进场礼仪：从敲门到就座', '2课时 | 礼仪形象', '详细讲解面试进场的礼仪规范，包括敲门、问好、就座等环节。', 'article', 'basic', 2, 1, 227),
(1777, 716, '面试答题姿态：眼神与手势运用', '2课时 | 礼仪形象', '讲解面试答题时的眼神交流与手势运用技巧。', 'article', 'basic', 2, 1, 228),
(1778, 716, '面试退场礼仪：优雅结束的艺术', '2课时 | 礼仪形象', '讲解面试结束时的退场礼仪，留下完美最后印象。', 'article', 'basic', 2, 1, 229);

-- =============================================
-- 二百〇三、新增课程 - 申论热点范文系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1779, 651, '乡村振兴主题范文精讲：5篇高分范文解析', '5课时 | 范文精讲', '精选5篇乡村振兴主题高分范文，逐段解析写作技巧。', 'article', 'intermediate', 5, 0, 88),
(1780, 651, '数字经济主题范文精讲：5篇高分范文解析', '5课时 | 范文精讲', '精选5篇数字经济主题高分范文，深入分析文章结构。', 'article', 'intermediate', 5, 0, 89),
(1781, 651, '生态文明主题范文精讲：5篇高分范文解析', '5课时 | 范文精讲', '精选5篇生态文明主题高分范文，学习论证方法。', 'article', 'intermediate', 5, 0, 90),
(1782, 651, '社会治理主题范文精讲：5篇高分范文解析', '5课时 | 范文精讲', '精选5篇社会治理主题高分范文，掌握写作框架。', 'article', 'intermediate', 5, 0, 91),
(1783, 651, '民生保障主题范文精讲：5篇高分范文解析', '5课时 | 范文精讲', '精选5篇民生保障主题高分范文，提升写作水平。', 'article', 'intermediate', 5, 0, 92),
(1784, 651, '科技创新主题范文精讲：5篇高分范文解析', '5课时 | 范文精讲', '精选5篇科技创新主题高分范文，学习素材运用。', 'article', 'intermediate', 5, 0, 93);

-- =============================================
-- 二百〇四、新增课程 - 行测模块串联系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1785, 1, '言语与逻辑的关联：跨模块思维训练', '4课时 | 模块串联', '分析言语理解与逻辑判断的内在关联，培养跨模块思维。', 'article', 'advanced', 4, 0, 455),
(1786, 1, '数量与资料的关联：计算能力迁移', '4课时 | 模块串联', '分析数量关系与资料分析的计算能力迁移，提升整体效率。', 'article', 'advanced', 4, 0, 456),
(1787, 1, '常识在其他模块的应用：知识融会贯通', '3课时 | 模块串联', '分析常识判断知识在其他模块中的应用，实现融会贯通。', 'article', 'advanced', 3, 0, 457),
(1788, 1, '行测五模块整体观：系统思维建立', '5课时 | 模块串联', '建立行测五大模块的整体观，培养系统化解题思维。', 'article', 'advanced', 5, 0, 458);

-- =============================================
-- 二百〇五、新增课程 - 公考常见误区系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1789, 1, '行测备考常见误区：避免无效努力', '3课时 | 误区提醒', '揭示行测备考中的常见误区，帮助考生避免无效努力。', 'article', 'basic', 3, 1, 460),
(1790, 624, '申论备考常见误区：走出写作困境', '3课时 | 误区提醒', '揭示申论备考中的常见误区，帮助考生走出写作困境。', 'article', 'basic', 3, 1, 235),
(1791, 716, '面试备考常见误区：避免答题套路化', '3课时 | 误区提醒', '揭示面试备考中的常见误区，避免答题过于套路化。', 'article', 'basic', 3, 1, 232),
(1792, 1, '刷题常见误区：质量与数量的平衡', '2课时 | 误区提醒', '分析刷题过程中的常见误区，帮助考生实现质量与数量的平衡。', 'article', 'basic', 2, 1, 461);

-- =============================================
-- 二百〇六、新增课程 - 上岸经验分享系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1793, 1, '国考上岸经验分享：行测85分学长心得', '3课时 | 经验分享', '国考行测85分上岸学长分享备考经验与答题心得。', 'article', 'intermediate', 3, 1, 465),
(1794, 624, '国考上岸经验分享：申论78分学姐心得', '3课时 | 经验分享', '国考申论78分上岸学姐分享写作技巧与备考方法。', 'article', 'intermediate', 3, 1, 238),
(1795, 716, '面试逆袭经验分享：笔试倒数面试翻盘', '3课时 | 经验分享', '笔试排名靠后但面试逆袭上岸的考生分享面试心得。', 'article', 'intermediate', 3, 1, 235),
(1796, 1, '在职备考上岸经验：工作学习两不误', '3课时 | 经验分享', '在职备考成功上岸的考生分享时间管理与学习方法。', 'article', 'intermediate', 3, 1, 466),
(1797, 1, '二战上岸经验分享：从失败到成功的蜕变', '3课时 | 经验分享', '二战成功上岸的考生分享调整心态与改进方法的经验。', 'article', 'intermediate', 3, 1, 467);

-- =============================================
-- 二百〇七、新增课程 - 不同基础备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1798, 1, '零基础备考指南：从入门到上岸', '5课时 | 分层备考', '为零基础考生制定系统的备考路线，从入门到上岸。', 'article', 'basic', 5, 1, 470),
(1799, 1, '有基础考生提升：从70分到80分', '4课时 | 分层备考', '为有一定基础的考生制定提升方案，实现分数突破。', 'article', 'intermediate', 4, 0, 471),
(1800, 1, '高手冲刺策略：从80分到85+', '4课时 | 分层备考', '为高分考生制定冲刺策略，实现顶尖分数目标。', 'article', 'advanced', 4, 0, 472),
(1801, 624, '申论零基础入门：建立写作框架', '5课时 | 分层备考', '为申论零基础考生建立基本的写作框架与方法。', 'article', 'basic', 5, 1, 240),
(1802, 624, '申论进阶提升：从60分到70分', '4课时 | 分层备考', '为申论有基础的考生制定提升方案，突破瓶颈。', 'article', 'intermediate', 4, 0, 241);

-- =============================================
-- 二百〇八、新增课程 - 各模块满分策略系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1803, 546, '言语理解满分策略：40题全对的秘诀', '5课时 | 满分策略', '分享言语理解40题全对的答题策略与技巧。', 'article', 'advanced', 5, 0, 145),
(1804, 573, '判断推理满分策略：40题全对的方法', '5课时 | 满分策略', '分享判断推理40题全对的解题方法与思路。', 'article', 'advanced', 5, 0, 140),
(1805, 592, '资料分析满分策略：20题全对的技巧', '4课时 | 满分策略', '分享资料分析20题全对的计算技巧与策略。', 'article', 'advanced', 4, 0, 135),
(1806, 559, '数量关系高分策略：稳拿10题的方法', '4课时 | 满分策略', '分享数量关系稳定拿下10题以上的解题策略。', 'article', 'advanced', 4, 0, 140),
(1807, 607, '常识判断高分策略：稳拿15题的方法', '4课时 | 满分策略', '分享常识判断稳定拿下15题以上的备考策略。', 'article', 'intermediate', 4, 0, 125);

-- =============================================
-- 二百〇九、新增课程 - 考试技术细节系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1808, 1, '答题卡规范填涂：避免机读失误', '2课时 | 技术细节', '讲解答题卡的规范填涂方法，避免机器识读失误。', 'article', 'basic', 2, 1, 475),
(1809, 1, '行测草稿纸使用：高效记录与计算', '2课时 | 技术细节', '讲解行测考试中草稿纸的高效使用方法。', 'article', 'basic', 2, 1, 476),
(1810, 624, '申论格子纸使用：字数控制与布局', '2课时 | 技术细节', '讲解申论答题纸的格子使用与字数控制技巧。', 'article', 'basic', 2, 1, 243),
(1811, 624, '申论书写规范：工整书写提升印象分', '2课时 | 技术细节', '讲解申论书写的规范要求，提升卷面印象分。', 'article', 'basic', 2, 1, 244),
(1812, 1, '考试工具准备清单：不遗漏任何必需品', '1课时 | 技术细节', '提供完整的考试工具准备清单，确保不遗漏任何必需品。', 'article', 'basic', 1, 1, 477);

-- =============================================
-- 二百一十、新增课程 - 申论材料速读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1813, 624, '申论材料速读技巧：10分钟读完全部材料', '4课时 | 速读技巧', '讲解申论材料的速读技巧，10分钟内完成全部材料阅读。', 'article', 'intermediate', 4, 0, 246),
(1814, 624, '申论材料标注法：关键信息快速定位', '3课时 | 速读技巧', '讲解申论材料的标注方法，快速定位关键信息。', 'article', 'intermediate', 3, 0, 247),
(1815, 624, '申论材料结构分析：把握材料逻辑脉络', '4课时 | 速读技巧', '讲解申论材料的结构分析方法，把握材料逻辑脉络。', 'article', 'intermediate', 4, 0, 248),
(1816, 624, '申论要点提取技巧：不遗漏任何得分点', '4课时 | 速读技巧', '讲解申论要点的提取技巧，确保不遗漏任何得分点。', 'article', 'intermediate', 4, 0, 249);

-- =============================================
-- 二百一十一、新增课程 - 面试即兴表达系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1817, 746, '即兴演讲技巧：1分钟构思精彩演讲', '4课时 | 即兴表达', '讲解面试即兴演讲的构思技巧，1分钟内组织精彩内容。', 'article', 'intermediate', 4, 0, 65),
(1818, 746, '串词讲故事技巧：创意表达训练', '3课时 | 即兴表达', '训练串词讲故事的创意表达能力，展现语言组织能力。', 'article', 'intermediate', 3, 0, 66),
(1819, 746, '漫画题答题技巧：图片信息解读', '4课时 | 即兴表达', '讲解面试漫画题的答题技巧，准确解读图片信息。', 'article', 'intermediate', 4, 0, 67),
(1820, 746, '视频材料题答题技巧：动态信息把握', '3课时 | 即兴表达', '讲解面试视频材料题的答题技巧，准确把握动态信息。', 'article', 'intermediate', 3, 0, 68);

-- =============================================
-- 二百一十二、新增课程 - 命题人思维系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1821, 1, '行测命题人思维：理解出题逻辑', '4课时 | 命题思维', '从命题人角度分析行测出题逻辑，知己知彼百战不殆。', 'article', 'advanced', 4, 0, 480),
(1822, 546, '言语命题人思维：干扰项设置规律', '3课时 | 命题思维', '分析言语理解命题人设置干扰项的规律与技巧。', 'article', 'advanced', 3, 0, 148),
(1823, 573, '判断命题人思维：考点设置逻辑', '3课时 | 命题思维', '分析判断推理命题人设置考点的逻辑与规律。', 'article', 'advanced', 3, 0, 143),
(1824, 624, '申论命题人思维：材料选取与题目设计', '4课时 | 命题思维', '分析申论命题人选取材料与设计题目的思维逻辑。', 'article', 'advanced', 4, 0, 252),
(1825, 716, '面试考官视角：评分标准与加分项', '4课时 | 命题思维', '从面试考官角度分析评分标准与高分表现特点。', 'article', 'advanced', 4, 0, 238);

-- =============================================
-- 二百一十三、新增课程 - 二战考生专属系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1826, 1, '二战行测提升策略：突破原有瓶颈', '4课时 | 二战专属', '为二战考生制定行测提升策略，突破原有成绩瓶颈。', 'article', 'intermediate', 4, 0, 483),
(1827, 624, '二战申论提升策略：写作能力突破', '4课时 | 二战专属', '为二战考生制定申论提升策略，实现写作能力突破。', 'article', 'intermediate', 4, 0, 255),
(1828, 716, '二战面试提升策略：表达能力进阶', '4课时 | 二战专属', '为二战考生制定面试提升策略，实现表达能力进阶。', 'article', 'intermediate', 4, 0, 240),
(1829, 1, '二战心态调整：从失败中汲取力量', '2课时 | 二战专属', '帮助二战考生调整心态，从失败中汲取前进的力量。', 'article', 'basic', 2, 1, 484),
(1830, 1, '二战复习规划：高效利用备考时间', '3课时 | 二战专属', '为二战考生制定高效的复习规划，充分利用备考时间。', 'article', 'intermediate', 3, 0, 485);

-- =============================================
-- 二百一十四、新增课程 - 跨专业报考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1831, 1, '理工科考生备考攻略：发挥计算优势', '4课时 | 跨专业', '为理工科背景考生制定备考攻略，发挥计算能力优势。', 'article', 'intermediate', 4, 0, 488),
(1832, 1, '文科考生备考攻略：发挥语言优势', '4课时 | 跨专业', '为文科背景考生制定备考攻略，发挥语言表达优势。', 'article', 'intermediate', 4, 0, 489),
(1833, 624, '非文科考生申论攻略：突破写作障碍', '4课时 | 跨专业', '帮助非文科背景考生突破申论写作障碍。', 'article', 'intermediate', 4, 0, 258),
(1834, 559, '文科考生数量攻略：克服计算恐惧', '4课时 | 跨专业', '帮助文科背景考生克服数量关系计算恐惧。', 'article', 'intermediate', 4, 0, 145);

-- =============================================
-- 二百一十五、新增课程 - 应届往届生备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1835, 1, '应届生备考优势：时间充裕如何利用', '3课时 | 身份备考', '帮助应届生发挥时间充裕的优势，制定高效备考计划。', 'article', 'basic', 3, 1, 492),
(1836, 1, '往届生备考策略：经验丰富如何转化', '3课时 | 身份备考', '帮助往届生将工作经验转化为备考与面试优势。', 'article', 'intermediate', 3, 0, 493),
(1837, 716, '应届生面试技巧：展现潜力与学习能力', '3课时 | 身份备考', '帮助应届生在面试中展现潜力与学习能力。', 'article', 'intermediate', 3, 0, 243),
(1838, 716, '往届生面试技巧：展现工作经验与成熟', '3课时 | 身份备考', '帮助往届生在面试中展现工作经验与成熟稳重。', 'article', 'intermediate', 3, 0, 244);

-- =============================================
-- 二百一十六、新增课程 - 在职全职备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1839, 1, '在职备考时间管理：碎片时间高效利用', '3课时 | 备考模式', '帮助在职考生进行时间管理，高效利用碎片时间。', 'article', 'intermediate', 3, 0, 496),
(1840, 1, '在职备考学习计划：6个月上岸规划', '4课时 | 备考模式', '为在职考生制定6个月的系统备考规划。', 'article', 'intermediate', 4, 0, 497),
(1841, 1, '全职备考效率提升：避免时间浪费', '3课时 | 备考模式', '帮助全职备考考生提升学习效率，避免时间浪费。', 'article', 'intermediate', 3, 0, 498),
(1842, 1, '全职备考学习计划：3个月冲刺规划', '4课时 | 备考模式', '为全职备考考生制定3个月的高效冲刺规划。', 'article', 'intermediate', 4, 0, 499);

-- =============================================
-- 二百一十七、新增课程 - 各省考情分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1843, 1, '广东省考考情分析：粤考命题特点解读', '4课时 | 省考分析', '全面分析广东省考的命题特点与备考策略。', 'article', 'intermediate', 4, 0, 502),
(1844, 1, '江苏省考考情分析：苏考命题特点解读', '4课时 | 省考分析', '全面分析江苏省考的命题特点与备考策略。', 'article', 'intermediate', 4, 0, 503),
(1845, 1, '浙江省考考情分析：浙考命题特点解读', '4课时 | 省考分析', '全面分析浙江省考的命题特点与备考策略。', 'article', 'intermediate', 4, 0, 504),
(1846, 1, '山东省考考情分析：鲁考命题特点解读', '4课时 | 省考分析', '全面分析山东省考的命题特点与备考策略。', 'article', 'intermediate', 4, 0, 505),
(1847, 1, '四川省考考情分析：川考命题特点解读', '4课时 | 省考分析', '全面分析四川省考的命题特点与备考策略。', 'article', 'intermediate', 4, 0, 506),
(1848, 1, '河南省考考情分析：豫考命题特点解读', '4课时 | 省考分析', '全面分析河南省考的命题特点与备考策略。', 'article', 'intermediate', 4, 0, 507);

-- =============================================
-- 二百一十八、新增课程 - 各部门岗位分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1849, 1, '税务系统岗位分析：工作内容与发展前景', '3课时 | 岗位分析', '分析税务系统岗位的工作内容、发展前景与备考建议。', 'article', 'basic', 3, 1, 510),
(1850, 1, '海关系统岗位分析：工作内容与发展前景', '3课时 | 岗位分析', '分析海关系统岗位的工作内容、发展前景与备考建议。', 'article', 'basic', 3, 1, 511),
(1851, 1, '银保监系统岗位分析：工作内容与发展前景', '3课时 | 岗位分析', '分析银保监系统岗位的工作内容、发展前景与备考建议。', 'article', 'basic', 3, 1, 512),
(1852, 1, '统计局岗位分析：工作内容与发展前景', '3课时 | 岗位分析', '分析统计局岗位的工作内容、发展前景与备考建议。', 'article', 'basic', 3, 1, 513),
(1853, 1, '铁路公安岗位分析：工作内容与发展前景', '3课时 | 岗位分析', '分析铁路公安岗位的工作内容、发展前景与备考建议。', 'article', 'basic', 3, 1, 514),
(1854, 1, '出入境边检岗位分析：工作内容与发展前景', '3课时 | 岗位分析', '分析出入境边检岗位的工作内容、发展前景与备考建议。', 'article', 'basic', 3, 1, 515);

-- =============================================
-- 二百一十九、新增课程 - 面试逆袭策略系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1855, 716, '笔试倒数第一面试逆袭：案例分析与策略', '4课时 | 逆袭策略', '分析笔试排名靠后但面试逆袭上岸的案例与策略。', 'article', 'intermediate', 4, 0, 248),
(1856, 716, '面试高分策略：拉开10分差距的方法', '5课时 | 逆袭策略', '讲解面试拉开10分以上差距的高分策略与技巧。', 'article', 'advanced', 5, 0, 249),
(1857, 716, '面试考官印象分：第一印象决定60%', '3课时 | 逆袭策略', '分析面试第一印象对分数的影响，提升印象分技巧。', 'article', 'intermediate', 3, 0, 250),
(1858, 716, '面试亮点打造：让考官记住你的回答', '4课时 | 逆袭策略', '讲解如何在面试中打造答题亮点，让考官印象深刻。', 'article', 'intermediate', 4, 0, 251);

-- =============================================
-- 二百二十、新增课程 - 行测技巧口诀系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1859, 546, '言语理解口诀速记：核心方法一句话', '3课时 | 口诀速记', '用朗朗上口的口诀总结言语理解核心方法，方便记忆。', 'article', 'basic', 3, 0, 150),
(1860, 559, '数量关系口诀速记：公式技巧一句话', '3课时 | 口诀速记', '用朗朗上口的口诀总结数量关系公式技巧，方便记忆。', 'article', 'basic', 3, 0, 148),
(1861, 573, '判断推理口诀速记：规律技巧一句话', '3课时 | 口诀速记', '用朗朗上口的口诀总结判断推理规律技巧，方便记忆。', 'article', 'basic', 3, 0, 148),
(1862, 592, '资料分析口诀速记：公式技巧一句话', '3课时 | 口诀速记', '用朗朗上口的口诀总结资料分析公式技巧，方便记忆。', 'article', 'basic', 3, 0, 138);

-- =============================================
-- 二百二十一、新增课程 - 面试万能框架系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1863, 719, '综合分析万能框架：三段式答题结构', '4课时 | 万能框架', '讲解综合分析题的三段式万能答题框架。', 'article', 'intermediate', 4, 0, 110),
(1864, 725, '组织计划万能框架：事前事中事后模板', '4课时 | 万能框架', '讲解组织计划题的事前事中事后万能答题框架。', 'article', 'intermediate', 4, 0, 60),
(1865, 733, '人际关系万能框架：态度方法结果模板', '3课时 | 万能框架', '讲解人际关系题的态度方法结果万能答题框架。', 'article', 'intermediate', 3, 0, 60),
(1866, 740, '应急应变万能框架：轻重缓急处理模板', '4课时 | 万能框架', '讲解应急应变题的轻重缓急万能答题框架。', 'article', 'intermediate', 4, 0, 60);

-- =============================================
-- 二百二十二、新增课程 - 考前作息调整系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1867, 1, '考前一周作息调整：生物钟适应考试时间', '2课时 | 考前准备', '帮助考生考前一周调整作息，使生物钟适应考试时间。', 'article', 'basic', 2, 1, 518),
(1868, 1, '考前饮食建议：保持最佳身体状态', '2课时 | 考前准备', '提供考前饮食建议，帮助考生保持最佳身体状态。', 'article', 'basic', 2, 1, 519),
(1869, 1, '考前睡眠管理：保证充足高质量睡眠', '2课时 | 考前准备', '讲解考前睡眠管理方法，保证充足高质量的睡眠。', 'article', 'basic', 2, 1, 520),
(1870, 716, '面试前一天准备：从容迎接面试', '2课时 | 考前准备', '讲解面试前一天的准备工作，从容迎接面试考核。', 'article', 'basic', 2, 1, 255);

-- =============================================
-- 二百二十三、新增课程 - 考场突发情况应对系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1871, 1, '考场突发情况应对：冷静处理各种问题', '2课时 | 突发应对', '讲解考场突发情况的应对方法，保持冷静顺利完成考试。', 'article', 'basic', 2, 1, 522),
(1872, 1, '考试紧张的即时缓解：快速调整状态', '2课时 | 突发应对', '讲解考试紧张时的即时缓解方法，快速调整答题状态。', 'article', 'basic', 2, 1, 523),
(1873, 1, '遇到难题的心态调整：不慌不乱继续答题', '2课时 | 突发应对', '讲解遇到难题时的心态调整方法，不影响后续答题。', 'article', 'basic', 2, 1, 524),
(1874, 716, '面试突发情况应对：从容化解尴尬', '2课时 | 突发应对', '讲解面试突发情况的应对方法，从容化解各种尴尬。', 'article', 'basic', 2, 1, 258);

-- =============================================
-- 二百二十四、新增课程 - 结构化小组面试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1875, 716, '结构化小组面试概述：流程与规则详解', '3课时 | 小组面试', '详细讲解结构化小组面试的流程、规则与评分标准。', 'article', 'intermediate', 3, 0, 260),
(1876, 716, '结构化小组答题技巧：在对比中脱颖而出', '5课时 | 小组面试', '讲解结构化小组面试的答题技巧，在对比中展现优势。', 'article', 'intermediate', 5, 0, 261),
(1877, 716, '结构化小组点评技巧：有效点评加分项', '4课时 | 小组面试', '讲解结构化小组面试的点评技巧，通过点评获得加分。', 'article', 'intermediate', 4, 0, 262),
(1878, 716, '结构化小组回应技巧：化被动为主动', '4课时 | 小组面试', '讲解结构化小组面试的回应技巧，将被动回应转为主动展示。', 'article', 'intermediate', 4, 0, 263);

-- =============================================
-- 二百二十五、新增课程 - 无领导小组讨论系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1879, 716, '无领导小组讨论概述：流程与角色分析', '3课时 | 无领导面试', '详细讲解无领导小组讨论的流程、角色类型与评分标准。', 'article', 'intermediate', 3, 0, 265),
(1880, 716, '无领导讨论发言技巧：有效表达观点', '4课时 | 无领导面试', '讲解无领导小组讨论的发言技巧，有效表达自己观点。', 'article', 'intermediate', 4, 0, 266),
(1881, 716, '无领导讨论角色定位：找准自己的位置', '4课时 | 无领导面试', '讲解无领导小组讨论的角色定位，发挥自身优势。', 'article', 'intermediate', 4, 0, 267),
(1882, 716, '无领导讨论总结技巧：高分总结陈词', '3课时 | 无领导面试', '讲解无领导小组讨论的总结技巧，完美收官获得高分。', 'article', 'intermediate', 3, 0, 268);

-- =============================================
-- 二百二十六、新增课程 - 半结构化面试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1883, 716, '半结构化面试概述：与结构化的区别', '2课时 | 半结构化', '讲解半结构化面试的特点与结构化面试的区别。', 'article', 'intermediate', 2, 0, 270),
(1884, 716, '半结构化追问应对：灵活回应考官追问', '4课时 | 半结构化', '讲解半结构化面试追问的应对技巧，灵活回应各类追问。', 'article', 'intermediate', 4, 0, 271),
(1885, 716, '个人经历类问题：真实且有亮点的表达', '4课时 | 半结构化', '讲解个人经历类问题的回答技巧，真实且有亮点。', 'article', 'intermediate', 4, 0, 272),
(1886, 716, '职业规划类问题：展现对岗位的理解', '3课时 | 半结构化', '讲解职业规划类问题的回答技巧，展现对岗位的深入理解。', 'article', 'intermediate', 3, 0, 273);

-- =============================================
-- 二百二十七、新增课程 - 行测限时训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1887, 546, '言语理解限时训练：35分钟40题', '5课时 | 限时训练', '言语理解35分钟40题限时训练，提升答题速度。', 'article', 'intermediate', 5, 0, 153),
(1888, 573, '判断推理限时训练：35分钟40题', '5课时 | 限时训练', '判断推理35分钟40题限时训练，提升答题速度。', 'article', 'intermediate', 5, 0, 150),
(1889, 592, '资料分析限时训练：25分钟20题', '4课时 | 限时训练', '资料分析25分钟20题限时训练，提升计算速度。', 'article', 'intermediate', 4, 0, 140),
(1890, 559, '数量关系限时训练：15分钟15题', '4课时 | 限时训练', '数量关系15分钟15题限时训练，提升解题速度。', 'article', 'intermediate', 4, 0, 150);

-- =============================================
-- 二百二十八、新增课程 - 申论限时训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1891, 625, '归纳概括限时训练：20分钟完成', '3课时 | 限时训练', '归纳概括题20分钟限时训练，提升答题效率。', 'article', 'intermediate', 3, 0, 45),
(1892, 631, '综合分析限时训练：25分钟完成', '3课时 | 限时训练', '综合分析题25分钟限时训练，提升分析速度。', 'article', 'intermediate', 3, 0, 45),
(1893, 637, '提出对策限时训练：20分钟完成', '3课时 | 限时训练', '提出对策题20分钟限时训练，提升作答效率。', 'article', 'intermediate', 3, 0, 45),
(1894, 643, '应用文限时训练：30分钟完成', '4课时 | 限时训练', '应用文写作30分钟限时训练，提升写作速度。', 'article', 'intermediate', 4, 0, 80),
(1895, 651, '大作文限时训练：60分钟完成', '5课时 | 限时训练', '申论大作文60分钟限时训练，保证完成质量。', 'article', 'intermediate', 5, 0, 95);

-- =============================================
-- 二百二十九、新增课程 - 面试限时答题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1896, 719, '综合分析限时答题：3分钟高质量作答', '4课时 | 限时训练', '综合分析题3分钟限时答题训练，提升答题质量。', 'article', 'intermediate', 4, 0, 115),
(1897, 725, '组织计划限时答题：3分钟完整作答', '4课时 | 限时训练', '组织计划题3分钟限时答题训练，保证答案完整。', 'article', 'intermediate', 4, 0, 65),
(1898, 733, '人际关系限时答题：2分钟精准作答', '3课时 | 限时训练', '人际关系题2分钟限时答题训练，提升作答效率。', 'article', 'intermediate', 3, 0, 65),
(1899, 740, '应急应变限时答题：2分半钟完整作答', '3课时 | 限时训练', '应急应变题2分半钟限时答题训练，保证答案完整。', 'article', 'intermediate', 3, 0, 65);

-- =============================================
-- 二百三十、新增课程 - 行测专项突破卷系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1900, 547, '逻辑填空专项突破卷（一）：50题精练', '1套 | 专项练习', '逻辑填空50题专项练习卷，巩固解题技巧。', 'article', 'intermediate', 1, 0, 55),
(1901, 547, '逻辑填空专项突破卷（二）：50题提升', '1套 | 专项练习', '逻辑填空50题专项练习卷，提升正确率。', 'article', 'intermediate', 1, 0, 56),
(1902, 551, '片段阅读专项突破卷（一）：40题精练', '1套 | 专项练习', '片段阅读40题专项练习卷，巩固阅读技巧。', 'article', 'intermediate', 1, 0, 100),
(1903, 551, '片段阅读专项突破卷（二）：40题提升', '1套 | 专项练习', '片段阅读40题专项练习卷，提升理解能力。', 'article', 'intermediate', 1, 0, 101),
(1904, 574, '图形推理专项突破卷（一）：30题精练', '1套 | 专项练习', '图形推理30题专项练习卷，巩固规律识别。', 'article', 'intermediate', 1, 0, 70),
(1905, 574, '图形推理专项突破卷（二）：30题提升', '1套 | 专项练习', '图形推理30题专项练习卷，提升推理能力。', 'article', 'intermediate', 1, 0, 71),
(1906, 587, '逻辑判断专项突破卷（一）：30题精练', '1套 | 专项练习', '逻辑判断30题专项练习卷，巩固逻辑推理。', 'article', 'intermediate', 1, 0, 105),
(1907, 587, '逻辑判断专项突破卷（二）：30题提升', '1套 | 专项练习', '逻辑判断30题专项练习卷，提升论证分析。', 'article', 'intermediate', 1, 0, 106);

-- =============================================
-- 二百三十一、新增课程 - 资料分析专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1908, 593, '增长问题专项练习：100题强化训练', '5课时 | 专项练习', '增长问题100题专项练习，强化增长率计算能力。', 'article', 'intermediate', 5, 0, 95),
(1909, 593, '比重问题专项练习：80题强化训练', '4课时 | 专项练习', '比重问题80题专项练习，强化比重计算能力。', 'article', 'intermediate', 4, 0, 96),
(1910, 593, '倍数问题专项练习：50题强化训练', '3课时 | 专项练习', '倍数问题50题专项练习，强化倍数计算能力。', 'article', 'intermediate', 3, 0, 97),
(1911, 593, '平均数问题专项练习：50题强化训练', '3课时 | 专项练习', '平均数问题50题专项练习，强化平均数计算能力。', 'article', 'intermediate', 3, 0, 98),
(1912, 593, '综合分析专项练习：60题强化训练', '4课时 | 专项练习', '综合分析题60题专项练习，提升综合判断能力。', 'article', 'intermediate', 4, 0, 99);

-- =============================================
-- 二百三十二、新增课程 - 数量关系专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1913, 560, '行程问题专项练习：50题强化训练', '3课时 | 专项练习', '行程问题50题专项练习，巩固行程模型应用。', 'article', 'intermediate', 3, 0, 120),
(1914, 560, '工程问题专项练习：40题强化训练', '3课时 | 专项练习', '工程问题40题专项练习，强化工程模型应用。', 'article', 'intermediate', 3, 0, 121),
(1915, 560, '排列组合专项练习：50题强化训练', '3课时 | 专项练习', '排列组合50题专项练习，巩固计数原理应用。', 'article', 'intermediate', 3, 0, 122),
(1916, 560, '概率问题专项练习：30题强化训练', '2课时 | 专项练习', '概率问题30题专项练习，强化概率计算能力。', 'article', 'intermediate', 2, 0, 123),
(1917, 560, '几何问题专项练习：40题强化训练', '3课时 | 专项练习', '几何问题40题专项练习，巩固几何公式应用。', 'article', 'intermediate', 3, 0, 124);

-- =============================================
-- 二百三十三、新增课程 - 申论小题专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1918, 627, '归纳概括专项练习（一）：10题精练', '3课时 | 专项练习', '归纳概括10题专项练习，强化要点提取能力。', 'article', 'intermediate', 3, 0, 50),
(1919, 627, '归纳概括专项练习（二）：10题提升', '3课时 | 专项练习', '归纳概括10题专项练习，提升概括表述能力。', 'article', 'intermediate', 3, 0, 51),
(1920, 635, '综合分析专项练习（一）：10题精练', '4课时 | 专项练习', '综合分析10题专项练习，强化分析深度。', 'article', 'intermediate', 4, 0, 55),
(1921, 635, '综合分析专项练习（二）：10题提升', '4课时 | 专项练习', '综合分析10题专项练习，提升逻辑表达。', 'article', 'intermediate', 4, 0, 56),
(1922, 631, '提出对策专项练习（一）：8题精练', '3课时 | 专项练习', '提出对策8题专项练习，强化对策针对性。', 'article', 'intermediate', 3, 0, 50),
(1923, 631, '提出对策专项练习（二）：8题提升', '3课时 | 专项练习', '提出对策8题专项练习，提升对策可行性。', 'article', 'intermediate', 3, 0, 51);

-- =============================================
-- 二百三十四、新增课程 - 应用文专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1924, 643, '讲话稿专项练习：5题精练', '3课时 | 专项练习', '讲话稿5题专项练习，强化讲话稿写作能力。', 'article', 'intermediate', 3, 0, 85),
(1925, 643, '倡议书专项练习：5题精练', '3课时 | 专项练习', '倡议书5题专项练习，强化倡议书写作能力。', 'article', 'intermediate', 3, 0, 86),
(1926, 643, '工作方案专项练习：5题精练', '3课时 | 专项练习', '工作方案5题专项练习，强化方案写作能力。', 'article', 'intermediate', 3, 0, 87),
(1927, 643, '调研报告专项练习：5题精练', '3课时 | 专项练习', '调研报告5题专项练习，强化报告写作能力。', 'article', 'intermediate', 3, 0, 88),
(1928, 643, '新闻稿专项练习：5题精练', '3课时 | 专项练习', '新闻稿5题专项练习，强化新闻稿写作能力。', 'article', 'intermediate', 3, 0, 89);

-- =============================================
-- 二百三十五、新增课程 - 面试专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1929, 719, '社会现象类专项练习：20题精练', '5课时 | 专项练习', '社会现象类20题专项练习，强化分析能力。', 'article', 'intermediate', 5, 0, 118),
(1930, 719, '政策理解类专项练习：15题精练', '4课时 | 专项练习', '政策理解类15题专项练习，强化政策分析。', 'article', 'intermediate', 4, 0, 119),
(1931, 725, '调研类专项练习：15题精练', '4课时 | 专项练习', '调研类15题专项练习，强化调研方案设计。', 'article', 'intermediate', 4, 0, 68),
(1932, 725, '活动策划类专项练习：15题精练', '4课时 | 专项练习', '活动策划类15题专项练习，强化活动方案设计。', 'article', 'intermediate', 4, 0, 69),
(1933, 733, '同事关系类专项练习：10题精练', '3课时 | 专项练习', '同事关系类10题专项练习，强化人际处理能力。', 'article', 'intermediate', 3, 0, 68),
(1934, 740, '群众工作类专项练习：10题精练', '3课时 | 专项练习', '群众工作类10题专项练习，强化应急处理能力。', 'article', 'intermediate', 3, 0, 68);

-- =============================================
-- 二百三十六、新增课程 - 公基专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1935, 691, '马克思主义哲学专项练习：100题', '5课时 | 专项练习', '马克思主义哲学100题专项练习，巩固哲学知识。', 'article', 'intermediate', 5, 0, 85),
(1936, 691, '中国特色社会主义理论专项练习：80题', '4课时 | 专项练习', '中国特色社会主义理论80题专项练习，强化理论学习。', 'article', 'intermediate', 4, 0, 86),
(1937, 698, '宪法专项练习：60题', '3课时 | 专项练习', '宪法60题专项练习，巩固宪法知识。', 'article', 'intermediate', 3, 0, 80),
(1938, 698, '民法典专项练习：100题', '5课时 | 专项练习', '民法典100题专项练习，强化民法学习。', 'article', 'intermediate', 5, 0, 81),
(1939, 698, '刑法专项练习：60题', '3课时 | 专项练习', '刑法60题专项练习，巩固刑法知识。', 'article', 'intermediate', 3, 0, 82),
(1940, 698, '行政法专项练习：60题', '3课时 | 专项练习', '行政法60题专项练习，强化行政法学习。', 'article', 'intermediate', 3, 0, 83);

-- =============================================
-- 二百三十七、新增课程 - 常识判断专项练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1941, 608, '政治常识专项练习：100题', '4课时 | 专项练习', '政治常识100题专项练习，巩固政治知识储备。', 'article', 'intermediate', 4, 0, 40),
(1942, 612, '法律常识专项练习：100题', '4课时 | 专项练习', '法律常识100题专项练习，强化法律知识储备。', 'article', 'intermediate', 4, 0, 65),
(1943, 617, '经济常识专项练习：60题', '3课时 | 专项练习', '经济常识60题专项练习，巩固经济知识储备。', 'article', 'intermediate', 3, 0, 70),
(1944, 617, '历史常识专项练习：80题', '4课时 | 专项练习', '历史常识80题专项练习，强化历史知识储备。', 'article', 'intermediate', 4, 0, 71),
(1945, 617, '地理常识专项练习：60题', '3课时 | 专项练习', '地理常识60题专项练习，巩固地理知识储备。', 'article', 'intermediate', 3, 0, 72),
(1946, 617, '科技常识专项练习：80题', '4课时 | 专项练习', '科技常识80题专项练习，强化科技知识储备。', 'article', 'intermediate', 4, 0, 73);

-- =============================================
-- 二百三十八、新增课程 - 行测全真模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1947, 1, '行测全真模拟卷（三）：国考难度', '1套 | 全真模拟', '国考难度全真模拟卷，120分钟限时完成。', 'article', 'intermediate', 1, 0, 528),
(1948, 1, '行测全真模拟卷（四）：省考难度', '1套 | 全真模拟', '省考难度全真模拟卷，120分钟限时完成。', 'article', 'intermediate', 1, 0, 529),
(1949, 1, '行测全真模拟卷（五）：挑战难度', '1套 | 全真模拟', '挑战难度全真模拟卷，检验高分水平。', 'article', 'advanced', 1, 0, 530),
(1950, 1, '行测全真模拟卷（六）：基础难度', '1套 | 全真模拟', '基础难度全真模拟卷，适合入门练习。', 'article', 'basic', 1, 0, 531);

-- =============================================
-- 二百三十九、新增课程 - 申论全真模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1951, 624, '申论全真模拟卷（三）：副省级难度', '1套 | 全真模拟', '副省级难度全真模拟卷，180分钟限时完成。', 'article', 'advanced', 1, 0, 265),
(1952, 624, '申论全真模拟卷（四）：地市级难度', '1套 | 全真模拟', '地市级难度全真模拟卷，150分钟限时完成。', 'article', 'intermediate', 1, 0, 266),
(1953, 624, '申论全真模拟卷（五）：省考难度', '1套 | 全真模拟', '省考难度全真模拟卷，150分钟限时完成。', 'article', 'intermediate', 1, 0, 267),
(1954, 624, '申论全真模拟卷（六）：基础难度', '1套 | 全真模拟', '基础难度全真模拟卷，适合入门练习。', 'article', 'basic', 1, 0, 268);

-- =============================================
-- 二百四十、新增课程 - 面试全真模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1955, 716, '面试全真模拟（三）：税务系统专场', '1套 | 全真模拟', '税务系统面试全真模拟，体验税务面试特点。', 'article', 'intermediate', 1, 0, 278),
(1956, 716, '面试全真模拟（四）：海关系统专场', '1套 | 全真模拟', '海关系统面试全真模拟，体验海关面试特点。', 'article', 'intermediate', 1, 0, 279),
(1957, 716, '面试全真模拟（五）：省考通用', '1套 | 全真模拟', '省考通用面试全真模拟，体验省考面试风格。', 'article', 'intermediate', 1, 0, 280),
(1958, 716, '面试全真模拟（六）：基层岗位专场', '1套 | 全真模拟', '基层岗位面试全真模拟，体验基层工作场景。', 'article', 'intermediate', 1, 0, 281);

-- =============================================
-- 二百四十一、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '行测总论：模块分布与考试策略',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍行测考试的五大模块分布、分值比例与整体备考策略。'
WHERE `id` = 1;

UPDATE `what_courses` SET 
    `title` = '申论总论：题型分布与考试策略',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍申论考试的五大题型分布、分值比例与整体备考策略。'
WHERE `id` = 2;

-- =============================================
-- 二百四十二、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习行程问题，掌握相遇追及、流水行船、环形跑道等典型题型解题方法。',
    `long_description` = '行程问题是数学运算的经典题型，主要考查路程、速度、时间三者关系的应用能力。本课程体系涵盖相遇与追及问题（同向与反向运动）、流水行船问题（顺流逆流速度关系）、环形跑道问题（圆周运动规律）、火车过桥问题、钟表问题等，全面攻克行程问题所有考点。'
WHERE `id` = 562;

UPDATE `what_course_categories` SET 
    `description` = '系统学习工程问题，掌握效率、时间、总量关系及合作、轮换工程解题方法。',
    `long_description` = '工程问题是数学运算的基础题型，主要考查工作效率、工作时间、工作总量三者关系的应用能力。本课程体系涵盖工程问题基础（三要素关系）、合作工程（多人合作完成）、轮换工程（交替工作模式）、变速工程（效率变化问题），帮助考生建立完整的工程问题解题体系。'
WHERE `id` = 563;

UPDATE `what_course_categories` SET 
    `description` = '系统学习排列组合，掌握加法乘法原理、排列组合公式及典型模型应用。',
    `long_description` = '排列组合是数学运算的难点题型，主要考查计数原理的应用能力。本课程体系涵盖基本原理（加法原理与乘法原理）、排列组合公式（P与C的计算与选用）、典型模型（隔板法、环形排列、捆绑法、插空法、错位重排），全面攻克排列组合所有考点。'
WHERE `id` = 565;

UPDATE `what_course_categories` SET 
    `description` = '系统学习综合分析题型，掌握词句理解、观点评价、原因影响分析等核心方法。',
    `long_description` = '综合分析是申论的难点题型，主要考查考生对材料深度分析与逻辑表达能力。本课程体系涵盖词句理解分析（解读关键词句含义）、观点评价分析（评析材料观点）、原因分析与影响分析（分析问题成因与影响）、比较分析与启示分析（对比材料异同、提炼启示），全面提升综合分析能力。'
WHERE `id` = 635;

-- =============================================
-- 二百四十三、新增课程 - 国考各系统面试特点系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1959, 716, '税务系统面试特点：专业性与服务意识', '5课时 | 系统面试', '深入分析税务系统面试的命题特点与高分策略。', 'article', 'intermediate', 5, 0, 285),
(1960, 716, '海关系统面试特点：执法与服务并重', '4课时 | 系统面试', '深入分析海关系统面试的命题特点与高分策略。', 'article', 'intermediate', 4, 0, 286),
(1961, 716, '银保监会面试特点：专业素养考察', '5课时 | 系统面试', '深入分析银保监会面试的专业性考察与应对策略。', 'article', 'advanced', 5, 0, 287),
(1962, 716, '外交部面试特点：综合素质与外语能力', '5课时 | 系统面试', '深入分析外交部面试的综合素质考察与特殊要求。', 'article', 'advanced', 5, 0, 288),
(1963, 716, '统计局面试特点：数据分析与调研能力', '4课时 | 系统面试', '深入分析统计局面试的命题特点与专业考察。', 'article', 'intermediate', 4, 0, 289),
(1964, 716, '铁路公安面试特点：执法规范与应急处置', '5课时 | 系统面试', '深入分析铁路公安面试的执法场景模拟与应对。', 'article', 'intermediate', 5, 0, 290),
(1965, 716, '出入境边防面试特点：国门意识与服务', '4课时 | 系统面试', '深入分析出入境边防面试的命题特点与高分策略。', 'article', 'intermediate', 4, 0, 291);

-- =============================================
-- 二百四十四、新增课程 - 省考各省面试特点系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1966, 716, '广东省考面试特点：粤考面试风格解析', '4课时 | 省考面试', '深入分析广东省考面试的命题风格与高分策略。', 'article', 'intermediate', 4, 0, 295),
(1967, 716, '江苏省考面试特点：苏考面试风格解析', '4课时 | 省考面试', '深入分析江苏省考面试的命题风格与高分策略。', 'article', 'intermediate', 4, 0, 296),
(1968, 716, '浙江省考面试特点：浙考面试风格解析', '4课时 | 省考面试', '深入分析浙江省考面试的命题风格与高分策略。', 'article', 'intermediate', 4, 0, 297),
(1969, 716, '山东省考面试特点：鲁考面试风格解析', '4课时 | 省考面试', '深入分析山东省考面试的命题风格与高分策略。', 'article', 'intermediate', 4, 0, 298),
(1970, 716, '四川省考面试特点：川考面试风格解析', '4课时 | 省考面试', '深入分析四川省考面试的命题风格与高分策略。', 'article', 'intermediate', 4, 0, 299),
(1971, 716, '河南省考面试特点：豫考面试风格解析', '4课时 | 省考面试', '深入分析河南省考面试的命题风格与高分策略。', 'article', 'intermediate', 4, 0, 300);

-- =============================================
-- 二百四十五、新增课程 - 申论热门主题深度系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1972, 624, '乡村振兴主题深度解析：政策背景与写作要点', '6课时 | 主题深度', '深度解析乡村振兴主题的政策背景、热点素材与写作要点。', 'article', 'intermediate', 6, 0, 272),
(1973, 624, '数字中国主题深度解析：发展趋势与应用场景', '5课时 | 主题深度', '深度解析数字中国主题的发展趋势、典型案例与写作角度。', 'article', 'intermediate', 5, 0, 273),
(1974, 624, '绿色发展主题深度解析：双碳目标与实践路径', '5课时 | 主题深度', '深度解析绿色发展主题的政策内涵、实践案例与写作素材。', 'article', 'intermediate', 5, 0, 274),
(1975, 624, '共同富裕主题深度解析：理论内涵与实现路径', '5课时 | 主题深度', '深度解析共同富裕主题的理论内涵、政策措施与写作要点。', 'article', 'intermediate', 5, 0, 275),
(1976, 624, '基层治理主题深度解析：创新实践与经验总结', '5课时 | 主题深度', '深度解析基层治理主题的创新实践、典型经验与写作角度。', 'article', 'intermediate', 5, 0, 276),
(1977, 624, '营商环境主题深度解析：优化措施与改革方向', '4课时 | 主题深度', '深度解析营商环境主题的政策背景、优化措施与写作素材。', 'article', 'intermediate', 4, 0, 277),
(1978, 624, '人才强国主题深度解析：战略布局与引才政策', '4课时 | 主题深度', '深度解析人才强国主题的战略意义、政策措施与写作要点。', 'article', 'intermediate', 4, 0, 278),
(1979, 624, '文化自信主题深度解析：传承创新与时代表达', '4课时 | 主题深度', '深度解析文化自信主题的内涵要义、实践案例与写作角度。', 'article', 'intermediate', 4, 0, 279);

-- =============================================
-- 二百四十六、新增课程 - 行测易错点汇总系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1980, 547, '逻辑填空50个易错点：精准避坑指南', '5课时 | 易错汇总', '汇总逻辑填空50个高频易错点，提供精准避坑策略。', 'article', 'intermediate', 5, 0, 58),
(1981, 551, '片段阅读40个易错点：干扰项全解析', '4课时 | 易错汇总', '汇总片段阅读40个高频易错点，全面解析干扰项设置。', 'article', 'intermediate', 4, 0, 105),
(1982, 574, '图形推理30个易错点：规律误判纠正', '3课时 | 易错汇总', '汇总图形推理30个高频易错点，纠正规律误判问题。', 'article', 'intermediate', 3, 0, 75),
(1983, 587, '逻辑判断35个易错点：论证陷阱识别', '4课时 | 易错汇总', '汇总逻辑判断35个高频易错点，识别论证陷阱。', 'article', 'intermediate', 4, 0, 110),
(1984, 593, '资料分析25个易错点：计算陷阱揭示', '3课时 | 易错汇总', '汇总资料分析25个高频易错点，揭示计算陷阱。', 'article', 'intermediate', 3, 0, 102),
(1985, 560, '数量关系30个易错点：思维误区纠正', '3课时 | 易错汇总', '汇总数量关系30个高频易错点，纠正思维误区。', 'article', 'intermediate', 3, 0, 128);

-- =============================================
-- 二百四十七、新增课程 - 面试高频话题素材系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1986, 719, '基层治理话题素材：案例与观点积累', '4课时 | 话题素材', '积累基层治理话题的典型案例、政策观点与答题素材。', 'article', 'intermediate', 4, 0, 122),
(1987, 719, '数字政府话题素材：创新实践与发展趋势', '3课时 | 话题素材', '积累数字政府话题的创新案例、发展趋势与答题素材。', 'article', 'intermediate', 3, 0, 123),
(1988, 719, '青年发展话题素材：政策导向与时代要求', '3课时 | 话题素材', '积累青年发展话题的政策导向、典型事例与答题素材。', 'article', 'intermediate', 3, 0, 124),
(1989, 719, '民生保障话题素材：政策措施与典型案例', '4课时 | 话题素材', '积累民生保障话题的政策措施、典型案例与答题素材。', 'article', 'intermediate', 4, 0, 125),
(1990, 719, '生态环保话题素材：理念践行与创新举措', '3课时 | 话题素材', '积累生态环保话题的理念践行、创新举措与答题素材。', 'article', 'intermediate', 3, 0, 126),
(1991, 719, '公务员作风话题素材：廉政建设与服务意识', '3课时 | 话题素材', '积累公务员作风话题的廉政要求、服务意识与答题素材。', 'article', 'intermediate', 3, 0, 127);

-- =============================================
-- 二百四十八、新增课程 - 公务员职业发展系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1992, 1, '公务员职级并行制度解读：晋升路径分析', '3课时 | 职业发展', '详细解读公务员职级并行制度，分析晋升路径与发展空间。', 'article', 'basic', 3, 1, 535),
(1993, 1, '公务员薪酬福利解读：待遇构成与地区差异', '3课时 | 职业发展', '详细解读公务员薪酬福利构成，分析地区差异与待遇水平。', 'article', 'basic', 3, 1, 536),
(1994, 1, '公务员转岗调动指南：程序与注意事项', '2课时 | 职业发展', '介绍公务员转岗调动的程序、条件与注意事项。', 'article', 'basic', 2, 1, 537),
(1995, 1, '公务员继续教育：职业能力提升渠道', '2课时 | 职业发展', '介绍公务员继续教育的渠道、内容与职业能力提升方法。', 'article', 'basic', 2, 1, 538);

-- =============================================
-- 二百四十九、新增课程 - 基层工作实务系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(1996, 716, '基层工作实务：群众工作方法', '4课时 | 基层实务', '讲解基层工作中的群众工作方法与沟通技巧。', 'article', 'intermediate', 4, 0, 305),
(1997, 716, '基层工作实务：矛盾纠纷调解', '4课时 | 基层实务', '讲解基层工作中的矛盾纠纷调解方法与技巧。', 'article', 'intermediate', 4, 0, 306),
(1998, 716, '基层工作实务：突发事件处置', '4课时 | 基层实务', '讲解基层工作中的突发事件处置流程与方法。', 'article', 'intermediate', 4, 0, 307),
(1999, 716, '基层工作实务：政策宣传落实', '3课时 | 基层实务', '讲解基层工作中的政策宣传与落实方法。', 'article', 'intermediate', 3, 0, 308),
(2000, 716, '基层工作实务：信访接待处理', '3课时 | 基层实务', '讲解基层工作中的信访接待与处理流程。', 'article', 'intermediate', 3, 0, 309);

-- =============================================
-- 二百五十、新增课程 - 机关工作适应系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2001, 1, '机关工作礼仪：日常交往与会议规范', '3课时 | 机关适应', '介绍机关工作中的日常交往礼仪与会议规范。', 'article', 'basic', 3, 1, 542),
(2002, 1, '机关公文处理：收发登记与流转规范', '3课时 | 机关适应', '介绍机关公文的收发登记、流转规范与处理要求。', 'article', 'basic', 3, 1, 543),
(2003, 1, '机关会议组织：筹备流程与服务保障', '3课时 | 机关适应', '介绍机关会议的筹备流程、服务保障与注意事项。', 'article', 'basic', 3, 1, 544),
(2004, 1, '机关人际关系：与领导同事的相处之道', '3课时 | 机关适应', '介绍机关工作中与领导、同事相处的方法与技巧。', 'article', 'basic', 3, 1, 545);

-- =============================================
-- 二百五十一、新增课程 - 申论时评阅读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2005, 624, '人民日报评论精读：学习官媒写作风格', '5课时 | 时评阅读', '精读人民日报评论文章，学习官媒写作风格与表达方式。', 'article', 'intermediate', 5, 0, 282),
(2006, 624, '新华社时评精读：把握舆论导向与观点', '4课时 | 时评阅读', '精读新华社时评文章，把握舆论导向与核心观点。', 'article', 'intermediate', 4, 0, 283),
(2007, 624, '光明日报评论精读：理论深度与文化视角', '4课时 | 时评阅读', '精读光明日报评论文章，学习理论深度与文化视角。', 'article', 'intermediate', 4, 0, 284),
(2008, 624, '半月谈时评精读：基层视角与实践案例', '4课时 | 时评阅读', '精读半月谈时评文章，积累基层视角与实践案例。', 'article', 'intermediate', 4, 0, 285);

-- =============================================
-- 二百五十二、新增课程 - 面试热点月报系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2009, 719, '面试热点月报（1月）：当月热点话题解析', '3课时 | 热点月报', '解析1月份面试热点话题，提供答题思路与素材。', 'article', 'intermediate', 3, 0, 130),
(2010, 719, '面试热点月报（2月）：当月热点话题解析', '3课时 | 热点月报', '解析2月份面试热点话题，提供答题思路与素材。', 'article', 'intermediate', 3, 0, 131),
(2011, 719, '面试热点月报（3月）：当月热点话题解析', '3课时 | 热点月报', '解析3月份面试热点话题，提供答题思路与素材。', 'article', 'intermediate', 3, 0, 132),
(2012, 719, '面试热点月报（4月）：当月热点话题解析', '3课时 | 热点月报', '解析4月份面试热点话题，提供答题思路与素材。', 'article', 'intermediate', 3, 0, 133),
(2013, 719, '面试热点月报（5月）：当月热点话题解析', '3课时 | 热点月报', '解析5月份面试热点话题，提供答题思路与素材。', 'article', 'intermediate', 3, 0, 134),
(2014, 719, '面试热点月报（6月）：当月热点话题解析', '3课时 | 热点月报', '解析6月份面试热点话题，提供答题思路与素材。', 'article', 'intermediate', 3, 0, 135);

-- =============================================
-- 二百五十三、新增课程 - 行测模考讲评系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2015, 546, '言语理解模考讲评（一）：典型错题分析', '3课时 | 模考讲评', '讲评言语理解模考典型错题，分析错误原因与正确思路。', 'article', 'intermediate', 3, 0, 155),
(2016, 559, '数量关系模考讲评（一）：典型错题分析', '3课时 | 模考讲评', '讲评数量关系模考典型错题，分析解题思路与技巧。', 'article', 'intermediate', 3, 0, 152),
(2017, 573, '判断推理模考讲评（一）：典型错题分析', '3课时 | 模考讲评', '讲评判断推理模考典型错题，分析推理方法与技巧。', 'article', 'intermediate', 3, 0, 152),
(2018, 592, '资料分析模考讲评（一）：典型错题分析', '3课时 | 模考讲评', '讲评资料分析模考典型错题，分析计算方法与技巧。', 'article', 'intermediate', 3, 0, 145);

-- =============================================
-- 二百五十四、新增课程 - 申论模考讲评系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2019, 627, '归纳概括模考讲评：要点遗漏与表述问题', '3课时 | 模考讲评', '讲评归纳概括模考答案，分析要点遗漏与表述问题。', 'article', 'intermediate', 3, 0, 55),
(2020, 635, '综合分析模考讲评：分析深度与逻辑问题', '3课时 | 模考讲评', '讲评综合分析模考答案，分析深度不足与逻辑问题。', 'article', 'intermediate', 3, 0, 60),
(2021, 631, '提出对策模考讲评：对策可行性与针对性', '3课时 | 模考讲评', '讲评提出对策模考答案，分析可行性与针对性问题。', 'article', 'intermediate', 3, 0, 55),
(2022, 643, '应用文模考讲评：格式与内容问题', '3课时 | 模考讲评', '讲评应用文模考答案，分析格式错误与内容问题。', 'article', 'intermediate', 3, 0, 92),
(2023, 651, '大作文模考讲评：立意与论证问题', '4课时 | 模考讲评', '讲评大作文模考答案，分析立意偏差与论证薄弱问题。', 'article', 'intermediate', 4, 0, 98);

-- =============================================
-- 二百五十五、新增课程 - 面试模考讲评系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2024, 719, '综合分析模考讲评：观点深度与逻辑性', '3课时 | 模考讲评', '讲评综合分析题模考表现，分析观点深度与逻辑问题。', 'article', 'intermediate', 3, 0, 138),
(2025, 725, '组织计划模考讲评：方案完整性与可行性', '3课时 | 模考讲评', '讲评组织计划题模考表现，分析方案完整性与可行性。', 'article', 'intermediate', 3, 0, 72),
(2026, 733, '人际关系模考讲评：处理方式与分寸把握', '3课时 | 模考讲评', '讲评人际关系题模考表现，分析处理方式与分寸问题。', 'article', 'intermediate', 3, 0, 72),
(2027, 740, '应急应变模考讲评：应对措施与优先级', '3课时 | 模考讲评', '讲评应急应变题模考表现，分析应对措施与优先级问题。', 'article', 'intermediate', 3, 0, 72);

-- =============================================
-- 二百五十六、新增课程 - 考试报名指导系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2028, 1, '国考报名全流程：从注册到缴费', '3课时 | 报名指导', '详细讲解国考报名的全流程，从注册到缴费每一步。', 'article', 'basic', 3, 1, 548),
(2029, 1, '岗位筛选技巧：找到最适合自己的岗位', '3课时 | 报名指导', '讲解国考省考岗位筛选的技巧与策略。', 'article', 'basic', 3, 1, 549),
(2030, 1, '报名照片要求：规范照片的拍摄与处理', '1课时 | 报名指导', '讲解报名照片的规范要求与处理方法。', 'article', 'basic', 1, 1, 550),
(2031, 1, '资格审查应对：常见问题与解决方案', '2课时 | 报名指导', '讲解资格审查的常见问题与应对解决方案。', 'article', 'basic', 2, 1, 551),
(2032, 1, '报名确认与缴费：注意事项与时间节点', '2课时 | 报名指导', '讲解报名确认与缴费的注意事项与关键时间节点。', 'article', 'basic', 2, 1, 552);

-- =============================================
-- 二百五十七、新增课程 - 成绩查询与复核系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2033, 1, '笔试成绩查询：入口与查询方法', '1课时 | 成绩查询', '介绍笔试成绩查询的入口与具体查询方法。', 'article', 'basic', 1, 1, 555),
(2034, 1, '成绩复核申请：程序与注意事项', '2课时 | 成绩查询', '讲解笔试成绩复核申请的程序与注意事项。', 'article', 'basic', 2, 1, 556),
(2035, 1, '进面分数线分析：判断自己是否进面', '2课时 | 成绩查询', '讲解进面分数线的分析方法，判断进面可能性。', 'article', 'basic', 2, 1, 557),
(2036, 1, '面试名单公布：确认与后续准备', '1课时 | 成绩查询', '介绍面试名单公布后的确认与后续准备工作。', 'article', 'basic', 1, 1, 558);

-- =============================================
-- 二百五十八、新增课程 - 公安体能测试系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2037, 1, '公安体能测试标准：各项目要求解读', '3课时 | 体能测试', '详细解读公安类岗位体能测试各项目的标准要求。', 'article', 'basic', 3, 1, 560),
(2038, 1, '体能测试训练计划：科学备考方案', '4课时 | 体能测试', '制定科学的体能测试训练计划，确保达标通过。', 'article', 'intermediate', 4, 0, 561),
(2039, 1, '体能测试技巧：各项目得分技巧', '3课时 | 体能测试', '讲解体能测试各项目的得分技巧与注意事项。', 'article', 'intermediate', 3, 0, 562),
(2040, 1, '体能测试常见问题：受伤预防与应对', '2课时 | 体能测试', '讲解体能测试中的常见问题与受伤预防方法。', 'article', 'basic', 2, 1, 563);

-- =============================================
-- 二百五十九、新增课程 - 心理测评系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2041, 1, '公务员心理测评概述：类型与测评内容', '2课时 | 心理测评', '介绍公务员心理测评的类型、内容与测评目的。', 'article', 'basic', 2, 1, 565),
(2042, 1, '心理测评应对策略：真实作答与注意事项', '2课时 | 心理测评', '讲解心理测评的应对策略与注意事项。', 'article', 'basic', 2, 1, 566),
(2043, 1, '常见心理测评题型：题目特点与作答原则', '3课时 | 心理测评', '分析常见心理测评题型的特点与作答原则。', 'article', 'basic', 3, 1, 567);

-- =============================================
-- 二百六十、新增课程 - 法律实务案例系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2044, 698, '民法典实务案例：婚姻家庭纠纷', '4课时 | 法律实务', '通过典型案例学习民法典婚姻家庭编的实务应用。', 'article', 'intermediate', 4, 0, 88),
(2045, 698, '民法典实务案例：合同纠纷处理', '4课时 | 法律实务', '通过典型案例学习民法典合同编的实务应用。', 'article', 'intermediate', 4, 0, 89),
(2046, 698, '刑法实务案例：常见犯罪认定', '4课时 | 法律实务', '通过典型案例学习刑法常见犯罪的认定标准。', 'article', 'intermediate', 4, 0, 90),
(2047, 698, '行政法实务案例：行政处罚与复议', '4课时 | 法律实务', '通过典型案例学习行政处罚与行政复议的实务应用。', 'article', 'intermediate', 4, 0, 91);

-- =============================================
-- 二百六十一、新增课程 - 行政执法专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2048, 698, '行政执法基础：执法主体与程序', '4课时 | 执法专题', '系统学习行政执法的主体资格与基本程序。', 'article', 'intermediate', 4, 0, 94),
(2049, 698, '行政执法证据：收集与固定', '3课时 | 执法专题', '系统学习行政执法证据的收集、固定与运用。', 'article', 'intermediate', 3, 0, 95),
(2050, 698, '行政执法文书：规范制作与使用', '3课时 | 执法专题', '系统学习行政执法文书的规范制作与使用。', 'article', 'intermediate', 3, 0, 96),
(2051, 698, '行政执法监督：内部监督与救济', '3课时 | 执法专题', '系统学习行政执法的内部监督与权利救济途径。', 'article', 'intermediate', 3, 0, 97);

-- =============================================
-- 二百六十二、新增课程 - 公文写作实务系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2052, 706, '请示写作实务：规范格式与写作要点', '3课时 | 公文实务', '详细讲解请示的规范格式与写作要点。', 'article', 'intermediate', 3, 0, 40),
(2053, 706, '报告写作实务：工作报告与情况报告', '3课时 | 公文实务', '详细讲解各类报告的写作格式与内容要求。', 'article', 'intermediate', 3, 0, 41),
(2054, 706, '通知写作实务：各类通知的写作规范', '3课时 | 公文实务', '详细讲解各类通知的写作格式与注意事项。', 'article', 'intermediate', 3, 0, 42),
(2055, 706, '函件写作实务：商洽函与复函', '3课时 | 公文实务', '详细讲解商洽函、复函等函件的写作规范。', 'article', 'intermediate', 3, 0, 43),
(2056, 706, '会议纪要写作：记录整理与规范表述', '3课时 | 公文实务', '详细讲解会议纪要的记录整理与规范表述。', 'article', 'intermediate', 3, 0, 44);

-- =============================================
-- 二百六十三、新增课程 - 调研报告写作系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2057, 643, '调研报告写作概述：结构与要素', '3课时 | 调研报告', '讲解调研报告的基本结构与核心要素。', 'article', 'intermediate', 3, 0, 95),
(2058, 643, '调研方案设计：目的、对象与方法', '3课时 | 调研报告', '讲解调研方案的设计方法，包括调研目的、对象与方法选择。', 'article', 'intermediate', 3, 0, 96),
(2059, 643, '调研数据分析：整理、统计与呈现', '3课时 | 调研报告', '讲解调研数据的整理、统计分析与呈现方法。', 'article', 'intermediate', 3, 0, 97),
(2060, 643, '调研报告撰写：问题分析与对策建议', '4课时 | 调研报告', '讲解调研报告的撰写技巧，包括问题分析与对策建议。', 'article', 'intermediate', 4, 0, 98);

-- =============================================
-- 二百六十四、新增课程 - 领导讲话撰写系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2061, 643, '领导讲话稿概述：类型与特点', '2课时 | 讲话撰写', '介绍领导讲话稿的常见类型与写作特点。', 'article', 'intermediate', 2, 0, 100),
(2062, 643, '会议讲话稿撰写：开幕词与总结讲话', '3课时 | 讲话撰写', '讲解会议开幕词与总结讲话的撰写技巧。', 'article', 'intermediate', 3, 0, 101),
(2063, 643, '工作部署讲话撰写：目标任务与要求', '3课时 | 讲话撰写', '讲解工作部署类讲话稿的撰写技巧与结构安排。', 'article', 'intermediate', 3, 0, 102),
(2064, 643, '专题讲话稿撰写：主题鲜明与论证有力', '3课时 | 讲话撰写', '讲解专题类讲话稿的撰写技巧与论证方法。', 'article', 'intermediate', 3, 0, 103);

-- =============================================
-- 二百六十五、新增课程 - 政务信息写作系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2065, 643, '政务信息概述：类型与作用', '2课时 | 政务信息', '介绍政务信息的常见类型与在政务工作中的作用。', 'article', 'intermediate', 2, 0, 105),
(2066, 643, '动态信息写作：要素齐全与简洁明了', '3课时 | 政务信息', '讲解动态类政务信息的写作要点与技巧。', 'article', 'intermediate', 3, 0, 106),
(2067, 643, '经验信息写作：总结提炼与推广价值', '3课时 | 政务信息', '讲解经验类政务信息的写作要点与提炼技巧。', 'article', 'intermediate', 3, 0, 107),
(2068, 643, '问题信息写作：客观分析与建议对策', '3课时 | 政务信息', '讲解问题类政务信息的写作要点与对策建议。', 'article', 'intermediate', 3, 0, 108);

-- =============================================
-- 二百六十六、新增课程 - 面试语言表达系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2069, 746, '语言流畅性训练：克服卡顿与口头禅', '3课时 | 语言表达', '训练面试语言的流畅性，克服卡顿与口头禅问题。', 'article', 'intermediate', 3, 0, 72),
(2070, 746, '语言准确性训练：用词精准与表意清晰', '3课时 | 语言表达', '训练面试语言的准确性，做到用词精准、表意清晰。', 'article', 'intermediate', 3, 0, 73),
(2071, 746, '语言感染力训练：语调变化与情感表达', '3课时 | 语言表达', '训练面试语言的感染力，通过语调变化增强表达效果。', 'article', 'intermediate', 3, 0, 74),
(2072, 746, '语言逻辑性训练：条理清晰与层次分明', '3课时 | 语言表达', '训练面试语言的逻辑性，做到条理清晰、层次分明。', 'article', 'intermediate', 3, 0, 75);

-- =============================================
-- 二百六十七、新增课程 - 面试思维训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2073, 716, '政府思维培养：站在公务员角度思考', '4课时 | 思维训练', '培养面试答题的政府思维，学会站在公务员角度思考问题。', 'article', 'intermediate', 4, 0, 312),
(2074, 716, '辩证思维训练：全面分析问题', '3课时 | 思维训练', '训练面试答题的辩证思维，学会全面分析问题的多面性。', 'article', 'intermediate', 3, 0, 313),
(2075, 716, '务实思维训练：可操作的解决方案', '3课时 | 思维训练', '训练面试答题的务实思维，提出可操作的解决方案。', 'article', 'intermediate', 3, 0, 314),
(2076, 716, '创新思维训练：独特见解与新颖观点', '3课时 | 思维训练', '训练面试答题的创新思维，展现独特见解与新颖观点。', 'article', 'intermediate', 3, 0, 315);

-- =============================================
-- 二百六十八、新增课程 - 申论审题技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2077, 624, '申论审题总论：审题决定得分上限', '3课时 | 审题技巧', '讲解申论审题的重要性与基本方法，审题决定得分上限。', 'article', 'intermediate', 3, 0, 288),
(2078, 627, '归纳概括题审题：明确概括对象与要求', '2课时 | 审题技巧', '讲解归纳概括题的审题要点，明确概括对象与具体要求。', 'article', 'intermediate', 2, 0, 58),
(2079, 635, '综合分析题审题：把握分析角度与深度', '2课时 | 审题技巧', '讲解综合分析题的审题要点，把握分析角度与深度要求。', 'article', 'intermediate', 2, 0, 63),
(2080, 631, '提出对策题审题：明确问题与对策来源', '2课时 | 审题技巧', '讲解提出对策题的审题要点，明确问题范围与对策来源。', 'article', 'intermediate', 2, 0, 58),
(2081, 643, '应用文题审题：把握格式与内容要求', '2课时 | 审题技巧', '讲解应用文题的审题要点，把握格式与内容要求。', 'article', 'intermediate', 2, 0, 110),
(2082, 651, '大作文题审题：准确立意与把握方向', '3课时 | 审题技巧', '讲解大作文题的审题要点，确保立意准确、方向正确。', 'article', 'intermediate', 3, 0, 100);

-- =============================================
-- 二百六十九、新增课程 - 申论答案组织系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2083, 624, '申论答案组织原则：条理清晰与要点突出', '3课时 | 答案组织', '讲解申论答案组织的基本原则，做到条理清晰、要点突出。', 'article', 'intermediate', 3, 0, 290),
(2084, 627, '归纳概括答案组织：分条列点与同类合并', '2课时 | 答案组织', '讲解归纳概括题答案的组织方法，分条列点、同类合并。', 'article', 'intermediate', 2, 0, 60),
(2085, 635, '综合分析答案组织：总分总结构与逻辑递进', '2课时 | 答案组织', '讲解综合分析题答案的组织方法，采用总分总结构。', 'article', 'intermediate', 2, 0, 65),
(2086, 643, '应用文答案组织：格式规范与内容完整', '3课时 | 答案组织', '讲解应用文题答案的组织方法，格式规范、内容完整。', 'article', 'intermediate', 3, 0, 112),
(2087, 651, '大作文答案组织：结构匀称与论证充分', '3课时 | 答案组织', '讲解大作文答案的组织方法，结构匀称、论证充分。', 'article', 'intermediate', 3, 0, 102);

-- =============================================
-- 二百七十、新增课程 - 行测读题技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2088, 546, '言语理解快速读题：抓关键词与核心句', '3课时 | 读题技巧', '讲解言语理解的快速读题技巧，抓住关键词与核心句。', 'article', 'intermediate', 3, 0, 158),
(2089, 559, '数量关系快速读题：提取数量关系与条件', '3课时 | 读题技巧', '讲解数量关系的快速读题技巧，提取数量关系与条件。', 'article', 'intermediate', 3, 0, 155),
(2090, 573, '判断推理快速读题：把握题干核心信息', '3课时 | 读题技巧', '讲解判断推理的快速读题技巧，把握题干核心信息。', 'article', 'intermediate', 3, 0, 155),
(2091, 592, '资料分析快速读题：定位数据与关系', '3课时 | 读题技巧', '讲解资料分析的快速读题技巧，定位关键数据与关系。', 'article', 'intermediate', 3, 0, 148);

-- =============================================
-- 二百七十一、新增课程 - 行测选项分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2092, 546, '言语理解选项分析：排除干扰项技巧', '3课时 | 选项分析', '讲解言语理解选项分析技巧，快速排除干扰项。', 'article', 'intermediate', 3, 0, 160),
(2093, 573, '逻辑判断选项分析：论证加强削弱判断', '3课时 | 选项分析', '讲解逻辑判断选项分析技巧，准确判断加强削弱程度。', 'article', 'intermediate', 3, 0, 157),
(2094, 580, '定义判断选项分析：核心要素匹配', '2课时 | 选项分析', '讲解定义判断选项分析技巧，核心要素匹配法。', 'article', 'intermediate', 2, 0, 35),
(2095, 583, '类比推理选项分析：关系类型匹配', '2课时 | 选项分析', '讲解类比推理选项分析技巧，关系类型匹配法。', 'article', 'intermediate', 2, 0, 40);

-- =============================================
-- 二百七十二、新增课程 - 秒杀技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2096, 559, '数量关系秒杀技巧：10秒出答案', '5课时 | 秒杀技巧', '汇总数量关系秒杀技巧，实现10秒内快速出答案。', 'article', 'intermediate', 5, 0, 158),
(2097, 592, '资料分析秒杀技巧：15秒出答案', '5课时 | 秒杀技巧', '汇总资料分析秒杀技巧，实现15秒内快速出答案。', 'article', 'intermediate', 5, 0, 150),
(2098, 573, '判断推理秒杀技巧：快速锁定答案', '4课时 | 秒杀技巧', '汇总判断推理秒杀技巧，快速锁定正确答案。', 'article', 'intermediate', 4, 0, 158),
(2099, 546, '言语理解秒杀技巧：一眼看出答案', '4课时 | 秒杀技巧', '汇总言语理解秒杀技巧，训练一眼看出正确答案。', 'article', 'intermediate', 4, 0, 162);

-- =============================================
-- 二百七十三、新增课程 - 考场时间管理系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2100, 1, '行测时间管理：120分钟最优分配方案', '3课时 | 时间管理', '制定行测120分钟的最优时间分配方案，确保完成所有题目。', 'article', 'intermediate', 3, 0, 570),
(2101, 624, '申论时间管理：180分钟合理分配', '3课时 | 时间管理', '制定申论180分钟的合理时间分配方案，保证各题完成质量。', 'article', 'intermediate', 3, 0, 292),
(2102, 716, '面试时间管理：各题型用时建议', '2课时 | 时间管理', '制定面试各题型的用时建议，避免超时或答题过短。', 'article', 'intermediate', 2, 0, 318),
(2103, 1, '考场时间紧急应对：时间不够怎么办', '2课时 | 时间管理', '讲解考场时间紧急时的应对策略，最大化得分。', 'article', 'intermediate', 2, 0, 571);

-- =============================================
-- 二百七十四、新增课程 - 行测蒙题技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2104, 1, '科学蒙题法：提高随机猜测正确率', '2课时 | 蒙题技巧', '讲解科学蒙题的方法，在时间紧张时提高猜测正确率。', 'article', 'basic', 2, 1, 573),
(2105, 546, '言语理解蒙题技巧：选项特征分析', '2课时 | 蒙题技巧', '讲解言语理解蒙题时的选项特征分析技巧。', 'article', 'basic', 2, 0, 164),
(2106, 559, '数量关系蒙题技巧：特殊值代入排除', '2课时 | 蒙题技巧', '讲解数量关系蒙题时的特殊值代入与排除技巧。', 'article', 'basic', 2, 0, 160),
(2107, 573, '判断推理蒙题技巧：选项分布规律', '2课时 | 蒙题技巧', '讲解判断推理蒙题时的选项分布规律分析。', 'article', 'basic', 2, 0, 160);

-- =============================================
-- 二百七十五、新增课程 - 行测涂卡技巧系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2108, 1, '答题卡涂卡策略：边做边涂vs最后涂', '2课时 | 涂卡技巧', '分析答题卡涂卡的两种策略优劣，选择适合自己的方式。', 'article', 'basic', 2, 1, 575),
(2109, 1, '快速涂卡技巧：节省涂卡时间', '1课时 | 涂卡技巧', '讲解快速涂卡的技巧，节省宝贵的考试时间。', 'article', 'basic', 1, 1, 576),
(2110, 1, '涂卡常见错误：避免无效作答', '1课时 | 涂卡技巧', '列举涂卡常见错误，帮助考生避免无效作答。', 'article', 'basic', 1, 1, 577);

-- =============================================
-- 二百七十六、新增课程 - 真题年度汇编系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2111, 1, '2022年国考行测真题全解析', '15课时 | 真题汇编', '2022年国考行测真题完整解析，覆盖所有题目。', 'article', 'intermediate', 15, 0, 580),
(2112, 1, '2021年国考行测真题全解析', '15课时 | 真题汇编', '2021年国考行测真题完整解析，覆盖所有题目。', 'article', 'intermediate', 15, 0, 581),
(2113, 624, '2022年国考申论真题全解析（副省级）', '8课时 | 真题汇编', '2022年国考副省级申论真题完整解析。', 'article', 'advanced', 8, 0, 295),
(2114, 624, '2022年国考申论真题全解析（地市级）', '8课时 | 真题汇编', '2022年国考地市级申论真题完整解析。', 'article', 'intermediate', 8, 0, 296),
(2115, 624, '2021年国考申论真题全解析（副省级）', '8课时 | 真题汇编', '2021年国考副省级申论真题完整解析。', 'article', 'advanced', 8, 0, 297),
(2116, 624, '2021年国考申论真题全解析（地市级）', '8课时 | 真题汇编', '2021年国考地市级申论真题完整解析。', 'article', 'intermediate', 8, 0, 298);

-- =============================================
-- 二百七十七、新增课程 - 常识专题精讲系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2117, 608, '党的二十大报告精讲：核心要点解读', '5课时 | 常识专题', '详细解读党的二十大报告核心要点与考试重点。', 'article', 'intermediate', 5, 0, 45),
(2118, 608, '十四五规划精讲：发展目标与重点任务', '4课时 | 常识专题', '详细解读十四五规划的发展目标与重点任务。', 'article', 'intermediate', 4, 0, 46),
(2119, 612, '新修订法律精讲：2025-2026年新法要点', '4课时 | 常识专题', '汇总讲解2025-2026年新修订法律的核心要点。', 'article', 'intermediate', 4, 0, 68),
(2120, 617, '中国航天成就精讲：重大突破与里程碑', '3课时 | 常识专题', '详细讲解中国航天事业的重大成就与里程碑事件。', 'article', 'intermediate', 3, 0, 76),
(2121, 617, '诺贝尔奖精讲：近年获奖成果解析', '3课时 | 常识专题', '详细讲解近年诺贝尔奖各领域获奖成果。', 'article', 'intermediate', 3, 0, 77),
(2122, 617, '中国传统文化精讲：节日习俗与文化常识', '4课时 | 常识专题', '详细讲解中国传统节日习俗与文化常识。', 'article', 'intermediate', 4, 0, 78);

-- =============================================
-- 二百七十八、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '公共基础知识总论：考试内容与备考策略',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍公共基础知识考试的内容范围、重点分布与备考策略。'
WHERE `id` = 11;

UPDATE `what_courses` SET 
    `title` = '面试总论：面试形式与备考策略',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍公务员面试的常见形式、评分标准与备考策略。'
WHERE `id` = 12;

-- =============================================
-- 二百七十九、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习定义判断题型，掌握定义理解、要素匹配、常见类型辨析等核心方法。',
    `long_description` = '定义判断是判断推理的基础题型，主要考查考生对定义的理解与应用能力。本课程体系涵盖定义判断基本方法（抓核心要素、排除明显错误）、定义要素匹配（主体、客体、方式、目的等要素对应）、常见定义类型（法律、管理、心理、经济等领域定义），帮助考生准确判断定义适用情况。'
WHERE `id` = 580;

UPDATE `what_course_categories` SET 
    `description` = '系统学习类比推理题型，掌握语义关系、逻辑关系、语法关系的识别与应用。',
    `long_description` = '类比推理是判断推理的快速得分题型，主要考查考生对词语关系的识别能力。本课程体系涵盖语义关系（近义、反义、比喻、象征）、逻辑关系（包含、交叉、并列、因果、条件）、语法关系（主谓、动宾、偏正），帮助考生快速准确识别词语间关系。'
WHERE `id` = 583;

UPDATE `what_course_categories` SET 
    `description` = '系统学习速算技巧，掌握截位直除、特征数字、有效数字、同位比较等高效计算方法。',
    `long_description` = '速算技巧是资料分析的核心能力，决定答题速度与准确率。本课程体系涵盖截位直除法（保留有效数字快速计算）、特征数字法（利用特殊数字简化计算）、有效数字法（保留有效位数估算）、同位比较法（通过同位数字判断大小），全面提升计算速度。'
WHERE `id` = 598;

UPDATE `what_course_categories` SET 
    `description` = '系统学习贯彻执行（应用文写作），掌握公文格式规范与各类应用文写作方法。',
    `long_description` = '贯彻执行是申论的实务型题型，主要考查考生的公文写作与执行能力。本课程体系涵盖公文格式规范（标题、称谓、正文、落款等要素）、各类应用文写作（讲话稿、倡议书、工作方案、调研报告、新闻稿等），帮助考生掌握规范的公文写作能力。'
WHERE `id` = 640;

-- =============================================
-- 二百八十、新增课程 - 申论高分范文系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2123, 651, '申论高分范文精讲（一）：社会治理主题', '5课时 | 范文精讲', '精选社会治理主题高分范文5篇，逐段解析写作技巧。', 'article', 'intermediate', 5, 0, 105),
(2124, 651, '申论高分范文精讲（二）：经济发展主题', '5课时 | 范文精讲', '精选经济发展主题高分范文5篇，深入分析论证方法。', 'article', 'intermediate', 5, 0, 106),
(2125, 651, '申论高分范文精讲（三）：民生保障主题', '5课时 | 范文精讲', '精选民生保障主题高分范文5篇，学习素材运用技巧。', 'article', 'intermediate', 5, 0, 107),
(2126, 651, '申论高分范文精讲（四）：生态环境主题', '5课时 | 范文精讲', '精选生态环境主题高分范文5篇，掌握文章结构布局。', 'article', 'intermediate', 5, 0, 108),
(2127, 651, '申论高分范文精讲（五）：科技创新主题', '5课时 | 范文精讲', '精选科技创新主题高分范文5篇，提升写作水平。', 'article', 'intermediate', 5, 0, 109),
(2128, 651, '申论高分范文精讲（六）：文化建设主题', '5课时 | 范文精讲', '精选文化建设主题高分范文5篇，学习文化类文章写法。', 'article', 'intermediate', 5, 0, 110);

-- =============================================
-- 二百八十一、新增课程 - 面试答题示范系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2129, 719, '综合分析题高分示范：10道真题全程演示', '5课时 | 答题示范', '综合分析题10道真题高分作答全程示范与点评。', 'article', 'intermediate', 5, 0, 142),
(2130, 725, '组织计划题高分示范：10道真题全程演示', '5课时 | 答题示范', '组织计划题10道真题高分作答全程示范与点评。', 'article', 'intermediate', 5, 0, 75),
(2131, 733, '人际关系题高分示范：10道真题全程演示', '5课时 | 答题示范', '人际关系题10道真题高分作答全程示范与点评。', 'article', 'intermediate', 5, 0, 75),
(2132, 740, '应急应变题高分示范：10道真题全程演示', '5课时 | 答题示范', '应急应变题10道真题高分作答全程示范与点评。', 'article', 'intermediate', 5, 0, 75),
(2133, 746, '言语表达题高分示范：8道真题全程演示', '4课时 | 答题示范', '言语表达题8道真题高分作答全程示范与点评。', 'article', 'intermediate', 4, 0, 78);

-- =============================================
-- 二百八十二、新增课程 - 行测错题精讲系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2134, 547, '逻辑填空典型错题精讲：50题深度剖析', '5课时 | 错题精讲', '精选逻辑填空50道典型错题，深度剖析错误原因。', 'article', 'intermediate', 5, 0, 62),
(2135, 551, '片段阅读典型错题精讲：40题深度剖析', '4课时 | 错题精讲', '精选片段阅读40道典型错题，深度剖析错误原因。', 'article', 'intermediate', 4, 0, 108),
(2136, 574, '图形推理典型错题精讲：30题深度剖析', '3课时 | 错题精讲', '精选图形推理30道典型错题，深度剖析规律误判。', 'article', 'intermediate', 3, 0, 78),
(2137, 587, '逻辑判断典型错题精讲：40题深度剖析', '4课时 | 错题精讲', '精选逻辑判断40道典型错题，深度剖析推理错误。', 'article', 'intermediate', 4, 0, 115),
(2138, 593, '资料分析典型错题精讲：30题深度剖析', '3课时 | 错题精讲', '精选资料分析30道典型错题，深度剖析计算陷阱。', 'article', 'intermediate', 3, 0, 105),
(2139, 560, '数学运算典型错题精讲：40题深度剖析', '4课时 | 错题精讲', '精选数学运算40道典型错题，深度剖析思维误区。', 'article', 'intermediate', 4, 0, 130);

-- =============================================
-- 二百八十三、新增课程 - 图形推理规律专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2140, 574, '位置规律专题：平移、旋转、翻转全解', '4课时 | 规律专题', '系统讲解图形推理位置规律：平移、旋转、翻转的识别与应用。', 'article', 'intermediate', 4, 0, 80),
(2141, 574, '样式规律专题：遍历、叠加、去同存异', '4课时 | 规律专题', '系统讲解图形推理样式规律：遍历、叠加、去同存异的识别与应用。', 'article', 'intermediate', 4, 0, 81),
(2142, 574, '属性规律专题：对称、封闭、曲直', '3课时 | 规律专题', '系统讲解图形推理属性规律：对称性、封闭性、曲直性的识别与应用。', 'article', 'intermediate', 3, 0, 82),
(2143, 574, '数量规律专题：点线面角的计数', '4课时 | 规律专题', '系统讲解图形推理数量规律：点、线、面、角数量变化的识别与应用。', 'article', 'intermediate', 4, 0, 83),
(2144, 574, '空间重构专题：折纸盒与截面图', '5课时 | 规律专题', '系统讲解图形推理空间重构：折纸盒与截面图的解题方法。', 'article', 'advanced', 5, 0, 84),
(2145, 574, '特殊图形专题：九宫格与分组分类', '3课时 | 规律专题', '系统讲解图形推理特殊题型：九宫格与分组分类的解题方法。', 'article', 'intermediate', 3, 0, 85);

-- =============================================
-- 二百八十四、新增课程 - 逻辑判断专题深化系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2146, 587, '命题逻辑专题：假言、联言、选言命题', '5课时 | 逻辑专题', '系统讲解命题逻辑：假言命题、联言命题、选言命题的推理规则。', 'article', 'intermediate', 5, 0, 118),
(2147, 587, '三段论专题：标准形式与变形推理', '4课时 | 逻辑专题', '系统讲解三段论的标准形式与各种变形推理。', 'article', 'intermediate', 4, 0, 119),
(2148, 587, '论证逻辑专题：论点、论据、论证方式', '5课时 | 逻辑专题', '系统讲解论证逻辑的结构分析与加强削弱判断。', 'article', 'intermediate', 5, 0, 120),
(2149, 587, '推理规则专题：演绎、归纳、类比推理', '4课时 | 逻辑专题', '系统讲解演绎推理、归纳推理、类比推理的规则与应用。', 'article', 'intermediate', 4, 0, 121),
(2150, 587, '复合命题专题：多条件组合推理', '4课时 | 逻辑专题', '系统讲解复合命题的多条件组合推理方法。', 'article', 'advanced', 4, 0, 122);

-- =============================================
-- 二百八十五、新增课程 - 资料分析题型专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2151, 593, '文字材料专题：信息提取与计算', '4课时 | 材料专题', '系统讲解文字材料的信息提取技巧与计算方法。', 'article', 'intermediate', 4, 0, 108),
(2152, 593, '表格材料专题：数据定位与计算', '4课时 | 材料专题', '系统讲解表格材料的数据定位与计算技巧。', 'article', 'intermediate', 4, 0, 109),
(2153, 593, '柱状图专题：数据解读与计算', '3课时 | 材料专题', '系统讲解柱状图材料的数据解读与计算方法。', 'article', 'intermediate', 3, 0, 110),
(2154, 593, '折线图专题：趋势分析与计算', '3课时 | 材料专题', '系统讲解折线图材料的趋势分析与计算方法。', 'article', 'intermediate', 3, 0, 111),
(2155, 593, '饼图专题：比例计算与分析', '3课时 | 材料专题', '系统讲解饼图材料的比例计算与分析方法。', 'article', 'intermediate', 3, 0, 112),
(2156, 593, '混合材料专题：多类型综合分析', '4课时 | 材料专题', '系统讲解混合材料的综合分析与计算方法。', 'article', 'advanced', 4, 0, 113);

-- =============================================
-- 二百八十六、新增课程 - 报考政策解读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2157, 1, '国考报考政策解读：最新政策要点', '3课时 | 政策解读', '全面解读国考最新报考政策与关键要点。', 'article', 'basic', 3, 1, 585),
(2158, 1, '省考报考政策解读：各省政策差异', '4课时 | 政策解读', '对比分析各省省考报考政策的差异与特点。', 'article', 'basic', 4, 1, 586),
(2159, 1, '学历要求解读：不同学历报考范围', '2课时 | 政策解读', '详细解读不同学历层次的报考范围与限制。', 'article', 'basic', 2, 1, 587),
(2160, 1, '专业限制解读：专业对口与相近专业', '3课时 | 政策解读', '详细解读专业限制条件，包括对口专业与相近专业认定。', 'article', 'basic', 3, 1, 588),
(2161, 1, '年龄条件解读：不同岗位年龄要求', '2课时 | 政策解读', '详细解读不同类型岗位的年龄条件与放宽政策。', 'article', 'basic', 2, 1, 589),
(2162, 1, '基层经历解读：两年基层工作经历认定', '2课时 | 政策解读', '详细解读两年基层工作经历的认定标准与计算方法。', 'article', 'basic', 2, 1, 590);

-- =============================================
-- 二百八十七、新增课程 - 不同学历备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2163, 1, '本科生备考攻略：岗位选择与备考策略', '4课时 | 学历备考', '为本科学历考生制定岗位选择与备考策略。', 'article', 'intermediate', 4, 0, 592),
(2164, 1, '硕士生备考攻略：高学历优势发挥', '4课时 | 学历备考', '为硕士学历考生制定发挥学历优势的备考策略。', 'article', 'intermediate', 4, 0, 593),
(2165, 1, '博士生备考攻略：高端岗位竞争策略', '3课时 | 学历备考', '为博士学历考生制定高端岗位的竞争策略。', 'article', 'advanced', 3, 0, 594),
(2166, 1, '大专生备考攻略：可报岗位与提升路径', '4课时 | 学历备考', '为大专学历考生分析可报岗位与提升路径。', 'article', 'intermediate', 4, 0, 595);

-- =============================================
-- 二百八十八、新增课程 - 公考心理建设系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2167, 1, '备考初期心态建设：坚定信心与目标', '2课时 | 心理建设', '帮助考生在备考初期建设良好心态，坚定信心与目标。', 'article', 'basic', 2, 1, 598),
(2168, 1, '备考中期心态调整：克服疲倦与瓶颈', '2课时 | 心理建设', '帮助考生在备考中期调整心态，克服疲倦与瓶颈期。', 'article', 'basic', 2, 1, 599),
(2169, 1, '备考后期心态稳定：冲刺阶段不焦虑', '2课时 | 心理建设', '帮助考生在备考后期稳定心态，冲刺阶段不焦虑。', 'article', 'basic', 2, 1, 600),
(2170, 1, '考后心态调整：等待成绩与结果应对', '2课时 | 心理建设', '帮助考生在考后调整心态，正确面对各种结果。', 'article', 'basic', 2, 1, 601),
(2171, 1, '多次备考心态重建：屡败屡战的勇气', '2课时 | 心理建设', '帮助多次备考考生重建心态，培养屡败屡战的勇气。', 'article', 'basic', 2, 1, 602);

-- =============================================
-- 二百八十九、新增课程 - 备考资料选择系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2172, 1, '行测教材选择指南：各类教材优劣分析', '2课时 | 资料选择', '分析市面上各类行测教材的优劣，帮助选择适合自己的教材。', 'article', 'basic', 2, 1, 605),
(2173, 624, '申论教材选择指南：各类教材优劣分析', '2课时 | 资料选择', '分析市面上各类申论教材的优劣，帮助选择适合自己的教材。', 'article', 'basic', 2, 1, 302),
(2174, 716, '面试教材选择指南：各类教材优劣分析', '2课时 | 资料选择', '分析市面上各类面试教材的优劣，帮助选择适合自己的教材。', 'article', 'basic', 2, 1, 322),
(2175, 1, '真题资料选择：历年真题版本对比', '2课时 | 资料选择', '对比各版本历年真题资料的优劣，帮助选择优质真题。', 'article', 'basic', 2, 1, 606),
(2176, 1, '模拟题选择建议：质量与数量的平衡', '2课时 | 资料选择', '提供模拟题选择建议，帮助平衡质量与数量。', 'article', 'basic', 2, 1, 607);

-- =============================================
-- 二百九十、新增课程 - 备考APP与工具系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2177, 1, '公考刷题APP推荐：高效刷题工具', '2课时 | 工具推荐', '推荐优质公考刷题APP，帮助高效利用碎片时间刷题。', 'article', 'basic', 2, 1, 610),
(2178, 1, '公考学习APP推荐：视频课程平台', '2课时 | 工具推荐', '推荐优质公考学习APP，提供视频课程学习渠道。', 'article', 'basic', 2, 1, 611),
(2179, 1, '时政学习APP推荐：热点资讯获取', '2课时 | 工具推荐', '推荐优质时政学习APP，帮助及时获取热点资讯。', 'article', 'basic', 2, 1, 612),
(2180, 1, '备考效率工具推荐：笔记与计划管理', '2课时 | 工具推荐', '推荐备考效率工具，帮助管理笔记与学习计划。', 'article', 'basic', 2, 1, 613);

-- =============================================
-- 二百九十一、新增课程 - 申论字迹练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2181, 624, '申论书写规范：工整美观的书写标准', '2课时 | 字迹练习', '讲解申论书写的规范标准，追求工整美观。', 'article', 'basic', 2, 1, 305),
(2182, 624, '快速书写训练：在限时内完成答题', '3课时 | 字迹练习', '训练申论快速书写能力，确保在限时内完成答题。', 'article', 'intermediate', 3, 0, 306),
(2183, 624, '字迹改善方法：短期提升书写质量', '2课时 | 字迹练习', '提供短期改善字迹的方法，提升申论卷面分。', 'article', 'basic', 2, 1, 307),
(2184, 624, '格子填写技巧：字数控制与布局美观', '2课时 | 字迹练习', '讲解申论格子填写技巧，做到字数精准、布局美观。', 'article', 'basic', 2, 1, 308);

-- =============================================
-- 二百九十二、新增课程 - 面试仪态训练系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2185, 716, '面试坐姿训练：端正大方的坐姿标准', '2课时 | 仪态训练', '训练面试坐姿，做到端正大方、自然得体。', 'article', 'basic', 2, 1, 325),
(2186, 716, '面试眼神训练：自信从容的眼神交流', '2课时 | 仪态训练', '训练面试眼神，做到自信从容、真诚交流。', 'article', 'basic', 2, 1, 326),
(2187, 716, '面试手势训练：自然得体的手势运用', '2课时 | 仪态训练', '训练面试手势，做到自然得体、增强表达效果。', 'article', 'basic', 2, 1, 327),
(2188, 716, '面试微表情控制：避免紧张外露', '2课时 | 仪态训练', '训练面试微表情控制，避免紧张情绪外露。', 'article', 'basic', 2, 1, 328);

-- =============================================
-- 二百九十三、新增课程 - 面试录音复盘系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2189, 716, '面试录音自我复盘：发现问题与改进', '3课时 | 录音复盘', '讲解面试录音自我复盘的方法，发现问题并针对性改进。', 'article', 'intermediate', 3, 0, 330),
(2190, 716, '答题内容复盘：观点深度与逻辑分析', '3课时 | 录音复盘', '讲解答题内容复盘的方法，分析观点深度与逻辑性。', 'article', 'intermediate', 3, 0, 331),
(2191, 716, '语言表达复盘：流畅度与准确性分析', '3课时 | 录音复盘', '讲解语言表达复盘的方法，分析流畅度与准确性。', 'article', 'intermediate', 3, 0, 332),
(2192, 716, '时间控制复盘：各题用时分析与优化', '2课时 | 录音复盘', '讲解时间控制复盘的方法，分析各题用时并优化。', 'article', 'intermediate', 2, 0, 333);

-- =============================================
-- 二百九十四、新增课程 - 行测分数段提升系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2193, 1, '行测50-60分段提升：夯实基础冲击60', '5课时 | 分段提升', '为行测50-60分考生制定提升方案，夯实基础冲击60分。', 'article', 'basic', 5, 0, 615),
(2194, 1, '行测60-70分段提升：突破瓶颈冲击70', '5课时 | 分段提升', '为行测60-70分考生制定提升方案，突破瓶颈冲击70分。', 'article', 'intermediate', 5, 0, 616),
(2195, 1, '行测70-75分段提升：稳定发挥冲击75', '5课时 | 分段提升', '为行测70-75分考生制定提升方案，稳定发挥冲击75分。', 'article', 'intermediate', 5, 0, 617),
(2196, 1, '行测75-80分段提升：精细打磨冲击80', '5课时 | 分段提升', '为行测75-80分考生制定提升方案，精细打磨冲击80分。', 'article', 'advanced', 5, 0, 618),
(2197, 1, '行测80+高分突破：顶尖水平冲刺', '4课时 | 分段提升', '为行测80分以上考生制定高分突破策略。', 'article', 'advanced', 4, 0, 619);

-- =============================================
-- 二百九十五、新增课程 - 申论分数段提升系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2198, 624, '申论40-50分段提升：建立框架冲击50', '5课时 | 分段提升', '为申论40-50分考生制定提升方案，建立基本框架。', 'article', 'basic', 5, 0, 312),
(2199, 624, '申论50-60分段提升：完善方法冲击60', '5课时 | 分段提升', '为申论50-60分考生制定提升方案，完善答题方法。', 'article', 'intermediate', 5, 0, 313),
(2200, 624, '申论60-70分段提升：提升深度冲击70', '5课时 | 分段提升', '为申论60-70分考生制定提升方案，提升分析深度。', 'article', 'intermediate', 5, 0, 314),
(2201, 624, '申论70-75分段提升：精细打磨冲击75', '5课时 | 分段提升', '为申论70-75分考生制定提升方案，精细打磨各题型。', 'article', 'advanced', 5, 0, 315),
(2202, 624, '申论75+高分突破：顶尖水平冲刺', '4课时 | 分段提升', '为申论75分以上考生制定高分突破策略。', 'article', 'advanced', 4, 0, 316);

-- =============================================
-- 二百九十六、新增课程 - 面试分数段表现系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2203, 716, '面试70-75分表现特征：基础合格标准', '3课时 | 分数表现', '分析面试70-75分考生的表现特征与提升空间。', 'article', 'basic', 3, 0, 335),
(2204, 716, '面试75-80分表现特征：中等偏上水平', '3课时 | 分数表现', '分析面试75-80分考生的表现特征与提升空间。', 'article', 'intermediate', 3, 0, 336),
(2205, 716, '面试80-85分表现特征：优秀水平', '3课时 | 分数表现', '分析面试80-85分考生的表现特征与提升空间。', 'article', 'intermediate', 3, 0, 337),
(2206, 716, '面试85-90分表现特征：高分水平', '3课时 | 分数表现', '分析面试85-90分考生的表现特征与提升空间。', 'article', 'advanced', 3, 0, 338),
(2207, 716, '面试90+分表现特征：顶尖水平', '3课时 | 分数表现', '分析面试90分以上考生的表现特征与成功经验。', 'article', 'advanced', 3, 0, 339);

-- =============================================
-- 二百九十七、新增课程 - 综合成绩计算系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2208, 1, '国考综合成绩计算：笔面比例与计算方法', '2课时 | 成绩计算', '详细讲解国考综合成绩的计算方法与笔面比例。', 'article', 'basic', 2, 1, 622),
(2209, 1, '省考综合成绩计算：各省计算方式差异', '3课时 | 成绩计算', '对比各省省考综合成绩的计算方式差异。', 'article', 'basic', 3, 1, 623),
(2210, 1, '进面分数预估：根据岗位预估进面线', '2课时 | 成绩计算', '讲解根据岗位历年情况预估进面分数线的方法。', 'article', 'basic', 2, 1, 624),
(2211, 1, '逆袭分数计算：面试需要多少分逆袭', '2课时 | 成绩计算', '讲解笔试排名靠后时面试逆袭所需分数的计算方法。', 'article', 'basic', 2, 1, 625);

-- =============================================
-- 二百九十八、新增课程 - 体检标准详解系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2212, 1, '公务员体检通用标准：各项指标详解', '4课时 | 体检标准', '详细解读公务员录用体检通用标准的各项指标。', 'article', 'basic', 4, 1, 628),
(2213, 1, '公安岗位体检标准：特殊要求解读', '3课时 | 体检标准', '详细解读公安类岗位体检的特殊标准与要求。', 'article', 'basic', 3, 1, 629),
(2214, 1, '体检常见问题：哪些情况可能不合格', '3课时 | 体检标准', '分析体检中常见的不合格情况与应对建议。', 'article', 'basic', 3, 1, 630),
(2215, 1, '体检复检流程：复检申请与注意事项', '2课时 | 体检标准', '讲解体检复检的申请流程与注意事项。', 'article', 'basic', 2, 1, 631);

-- =============================================
-- 二百九十九、新增课程 - 政审流程详解系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2216, 1, '政审流程概述：考察内容与标准', '3课时 | 政审流程', '详细介绍政审考察的流程、内容与标准。', 'article', 'basic', 3, 1, 634),
(2217, 1, '政审材料准备：所需材料清单', '2课时 | 政审流程', '提供政审所需材料清单，帮助提前准备。', 'article', 'basic', 2, 1, 635),
(2218, 1, '政审常见问题：哪些情况影响政审', '3课时 | 政审流程', '分析政审中常见的影响因素与应对建议。', 'article', 'basic', 3, 1, 636),
(2219, 1, '档案问题处理：档案缺失与补办', '2课时 | 政审流程', '讲解档案缺失等问题的处理方法与补办流程。', 'article', 'basic', 2, 1, 637);

-- =============================================
-- 三百、新增课程 - 公示与录用系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2220, 1, '录用公示解读：公示内容与时间', '1课时 | 公示录用', '详细解读录用公示的内容与公示时间要求。', 'article', 'basic', 1, 1, 640),
(2221, 1, '录用审批流程：从公示到正式录用', '2课时 | 公示录用', '详细介绍从公示到正式录用的审批流程。', 'article', 'basic', 2, 1, 641),
(2222, 1, '入职报到准备：报到所需材料与手续', '2课时 | 公示录用', '提供入职报到所需材料清单与手续办理指南。', 'article', 'basic', 2, 1, 642),
(2223, 1, '试用期须知：试用期管理与转正要求', '2课时 | 公示录用', '介绍公务员试用期的管理规定与转正要求。', 'article', 'basic', 2, 1, 643);

-- =============================================
-- 三百〇一、新增课程 - 新人入职指南系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2224, 1, '公务员入职第一天：报到流程与注意事项', '2课时 | 入职指南', '介绍公务员入职第一天的报到流程与注意事项。', 'article', 'basic', 2, 1, 646),
(2225, 1, '新人工作适应：快速融入工作环境', '3课时 | 入职指南', '帮助新公务员快速适应工作环境与工作节奏。', 'article', 'basic', 3, 1, 647),
(2226, 1, '与领导相处之道：尊重沟通与执行', '3课时 | 入职指南', '介绍新公务员与领导相处的方法与技巧。', 'article', 'basic', 3, 1, 648),
(2227, 1, '与同事相处之道：团结协作与互助', '3课时 | 入职指南', '介绍新公务员与同事相处的方法与技巧。', 'article', 'basic', 3, 1, 649),
(2228, 1, '新人工作能力提升：快速成长路径', '4课时 | 入职指南', '为新公务员制定快速提升工作能力的成长路径。', 'article', 'intermediate', 4, 0, 650);

-- =============================================
-- 三百〇二、新增课程 - 行测各模块占比分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2229, 1, '国考行测各模块分值分布：题量与分值', '2课时 | 模块分析', '详细分析国考行测各模块的题量与分值分布。', 'article', 'basic', 2, 1, 653),
(2230, 1, '省考行测各模块分值分布：各省差异', '3课时 | 模块分析', '对比分析各省省考行测各模块的分值分布差异。', 'article', 'basic', 3, 1, 654),
(2231, 1, '行测得分重点：性价比最高的模块', '2课时 | 模块分析', '分析行测各模块的性价比，确定得分重点。', 'article', 'basic', 2, 1, 655),
(2232, 1, '行测放弃策略：哪些题目可以战略放弃', '2课时 | 模块分析', '分析行测各模块的难易程度，制定合理的放弃策略。', 'article', 'intermediate', 2, 0, 656);

-- =============================================
-- 三百〇三、新增课程 - 申论各题型分值分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2233, 624, '国考申论各题型分值分布：分值权重', '2课时 | 题型分析', '详细分析国考申论各题型的分值权重与得分要点。', 'article', 'basic', 2, 1, 320),
(2234, 624, '省考申论各题型分值分布：各省差异', '3课时 | 题型分析', '对比分析各省省考申论各题型的分值分布差异。', 'article', 'basic', 3, 1, 321),
(2235, 624, '申论得分重点：大作文vs小题的权衡', '2课时 | 题型分析', '分析申论大作文与小题的分值比重，制定得分策略。', 'article', 'basic', 2, 1, 322),
(2236, 624, '申论各档次判分：阅卷档次划分标准', '2课时 | 题型分析', '分析申论各题型的档次判分标准，了解得分区间。', 'article', 'intermediate', 2, 0, 323);

-- =============================================
-- 三百〇四、新增课程 - 面试评分细则系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2237, 716, '结构化面试评分细则：各维度评分标准', '3课时 | 评分细则', '详细解读结构化面试的各维度评分标准与细则。', 'article', 'intermediate', 3, 0, 342),
(2238, 716, '无领导面试评分细则：表现评价维度', '3课时 | 评分细则', '详细解读无领导小组讨论的评分维度与标准。', 'article', 'intermediate', 3, 0, 343),
(2239, 716, '面试加分项解读：哪些表现能加分', '3课时 | 评分细则', '分析面试中的加分项，明确优秀表现的特点。', 'article', 'intermediate', 3, 0, 344),
(2240, 716, '面试扣分项解读：哪些表现会扣分', '3课时 | 评分细则', '分析面试中的扣分项，避免常见的扣分表现。', 'article', 'intermediate', 3, 0, 345);

-- =============================================
-- 三百〇五、新增课程 - 考试大纲解读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2241, 1, '国考行测大纲解读：考查能力与题型', '3课时 | 大纲解读', '详细解读国考行测考试大纲的考查能力与题型要求。', 'article', 'basic', 3, 1, 660),
(2242, 624, '国考申论大纲解读：测查要素与题型', '3课时 | 大纲解读', '详细解读国考申论考试大纲的测查要素与题型要求。', 'article', 'basic', 3, 1, 326),
(2243, 1, '省考大纲解读：与国考的异同', '3课时 | 大纲解读', '对比解读省考与国考考试大纲的异同之处。', 'article', 'basic', 3, 1, 661),
(2244, 1, '大纲变化分析：历年大纲调整要点', '2课时 | 大纲解读', '分析历年考试大纲的调整变化与备考启示。', 'article', 'basic', 2, 1, 662);

-- =============================================
-- 三百〇六、新增课程 - 历年考情统计系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2245, 1, '国考历年报名人数统计：报考趋势分析', '2课时 | 考情统计', '统计分析国考历年报名人数与报考趋势变化。', 'article', 'basic', 2, 1, 665),
(2246, 1, '国考历年竞争比统计：热门岗位分析', '2课时 | 考情统计', '统计分析国考历年竞争比与热门岗位特点。', 'article', 'basic', 2, 1, 666),
(2247, 1, '省考历年报名统计：各省考情对比', '3课时 | 考情统计', '统计对比各省省考历年报名人数与考情特点。', 'article', 'basic', 3, 1, 667),
(2248, 1, '历年进面分数线：分数变化趋势', '3课时 | 考情统计', '统计分析历年进面分数线的变化趋势与规律。', 'article', 'basic', 3, 1, 668);

-- =============================================
-- 三百〇七、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '行测备考总体规划：科学安排备考节奏',
    `subtitle` = '3课时 | 备考规划',
    `description` = '全面规划行测备考的各阶段任务与时间安排，科学安排备考节奏。'
WHERE `id` = 13;

UPDATE `what_courses` SET 
    `title` = '申论备考总体规划：写作能力系统提升',
    `subtitle` = '3课时 | 备考规划',
    `description` = '全面规划申论备考的各阶段任务与能力提升路径，系统提升写作水平。'
WHERE `id` = 14;

UPDATE `what_courses` SET 
    `title` = '面试备考总体规划：全方位能力塑造',
    `subtitle` = '3课时 | 备考规划',
    `description` = '全面规划面试备考的各阶段任务与能力训练重点，全方位塑造面试表现。'
WHERE `id` = 15;

-- =============================================
-- 三百〇八、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习数字推理，掌握等差数列、等比数列、递推数列、特殊数列等核心规律。',
    `long_description` = '数字推理是数量关系的规律识别题型，主要考查考生对数列规律的识别与推理能力。本课程体系涵盖基础数列（等差、等比、质数、合数）、递推数列（和数列、积数列、差数列）、特殊数列（幂次数列、分数数列、多重数列），帮助考生快速识别数列规律。'
WHERE `id` = 569;

UPDATE `what_course_categories` SET 
    `description` = '系统学习材料解读技巧，掌握文字、表格、图形等不同材料类型的快速解读方法。',
    `long_description` = '材料解读是资料分析的基础能力，决定信息定位的速度与准确性。本课程体系涵盖文字材料解读（关键词定位、段落结构分析）、表格材料解读（行列对应、数据定位）、图形材料解读（柱状图、折线图、饼图解读），帮助考生快速准确定位数据信息。'
WHERE `id` = 603;

UPDATE `what_course_categories` SET 
    `description` = '系统学习归纳概括题型，掌握要点提取、同类合并、规范表述等核心方法。',
    `long_description` = '归纳概括是申论的基础题型，主要考查考生对材料信息的提取与概括能力。本课程体系涵盖要点提取方法（关键词法、结构分析法）、要点整合技巧（同类合并、分类概括）、规范表述方法（条理清晰、语言精炼），帮助考生全面准确概括材料要点。'
WHERE `id` = 627;

UPDATE `what_course_categories` SET 
    `description` = '系统学习提出对策题型，掌握对策来源分析、对策维度框架、可行性论证等核心方法。',
    `long_description` = '提出对策是申论的实务型题型，主要考查考生分析问题、解决问题的能力。本课程体系涵盖对策来源分析（直接对策、间接对策、自拟对策）、对策维度框架（主体、措施、保障等维度）、可行性论证（针对性、可操作性、有效性），帮助考生提出切实可行的对策建议。'
WHERE `id` = 631;

-- =============================================
-- 三百〇九、新增课程 - 言语理解高频考点系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2249, 547, '高频成语辨析100组：必考成语精讲', '8课时 | 高频考点', '精选100组高频考查成语，详细辨析词义与用法差异。', 'article', 'intermediate', 8, 0, 65),
(2250, 547, '高频实词辨析80组：核心实词精讲', '6课时 | 高频考点', '精选80组高频考查实词，详细辨析词义与语境搭配。', 'article', 'intermediate', 6, 0, 66),
(2251, 547, '关联词搭配大全：复句关系判断', '4课时 | 高频考点', '系统讲解关联词的搭配规则与复句关系判断方法。', 'article', 'intermediate', 4, 0, 67),
(2252, 551, '主旨概括题高频设问分析：题目类型识别', '3课时 | 高频考点', '分析主旨概括题的高频设问方式与答题策略。', 'article', 'intermediate', 3, 0, 112),
(2253, 551, '细节判断题高频陷阱：常见错误选项特征', '4课时 | 高频考点', '分析细节判断题的高频陷阱与错误选项特征。', 'article', 'intermediate', 4, 0, 113),
(2254, 555, '语句排序高频考法：排序技巧大全', '4课时 | 高频考点', '汇总语句排序题的高频考法与排序技巧。', 'article', 'intermediate', 4, 0, 55);

-- =============================================
-- 三百一十、新增课程 - 数学运算题型专项系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2255, 560, '工程问题专项：效率与时间的关系', '5课时 | 题型专项', '系统讲解工程问题的各类题型与解题方法。', 'article', 'intermediate', 5, 0, 135),
(2256, 560, '行程问题专项：相遇、追及与流水', '6课时 | 题型专项', '系统讲解行程问题的各类题型与解题方法。', 'article', 'intermediate', 6, 0, 136),
(2257, 560, '利润问题专项：成本、售价与利润率', '4课时 | 题型专项', '系统讲解利润问题的各类题型与解题方法。', 'article', 'intermediate', 4, 0, 137),
(2258, 560, '排列组合专项：计数原理与分类讨论', '6课时 | 题型专项', '系统讲解排列组合的各类题型与解题方法。', 'article', 'advanced', 6, 0, 138),
(2259, 560, '概率问题专项：古典概型与条件概率', '5课时 | 题型专项', '系统讲解概率问题的各类题型与解题方法。', 'article', 'advanced', 5, 0, 139),
(2260, 560, '几何问题专项：平面与立体几何', '5课时 | 题型专项', '系统讲解几何问题的各类题型与解题方法。', 'article', 'intermediate', 5, 0, 140),
(2261, 560, '容斥问题专项：两集合与三集合', '4课时 | 题型专项', '系统讲解容斥问题的各类题型与解题方法。', 'article', 'intermediate', 4, 0, 141),
(2262, 560, '最值问题专项：最大值与最小值', '4课时 | 题型专项', '系统讲解最值问题的各类题型与解题方法。', 'article', 'intermediate', 4, 0, 142);

-- =============================================
-- 三百一十一、新增课程 - 常识判断分模块系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2263, 608, '时政热点模块：国内国际重大事件', '6课时 | 分模块学习', '系统学习国内国际重大时政热点事件。', 'article', 'intermediate', 6, 0, 50),
(2264, 612, '法律常识模块：宪法、民法、刑法核心', '8课时 | 分模块学习', '系统学习宪法、民法、刑法的核心知识点。', 'article', 'intermediate', 8, 0, 72),
(2265, 615, '历史常识模块：中国史与世界史要点', '6课时 | 分模块学习', '系统学习中国史与世界史的重要知识点。', 'article', 'intermediate', 6, 0, 55),
(2266, 617, '科技常识模块：科学技术与生活应用', '5课时 | 分模块学习', '系统学习科学技术在生活中的应用知识。', 'article', 'intermediate', 5, 0, 82),
(2267, 619, '地理常识模块：自然地理与人文地理', '5课时 | 分模块学习', '系统学习自然地理与人文地理的核心知识。', 'article', 'intermediate', 5, 0, 30),
(2268, 621, '经济常识模块：宏观经济与微观经济', '5课时 | 分模块学习', '系统学习宏观经济与微观经济的基础知识。', 'article', 'intermediate', 5, 0, 35),
(2269, 622, '管理常识模块：行政管理与公共管理', '4课时 | 分模块学习', '系统学习行政管理与公共管理的基础知识。', 'article', 'intermediate', 4, 0, 25);

-- =============================================
-- 三百一十二、新增课程 - 申论材料阅读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2270, 624, '申论材料速读技巧：5分钟通读全篇', '3课时 | 材料阅读', '训练申论材料速读能力，实现5分钟通读全篇。', 'article', 'intermediate', 3, 0, 330),
(2271, 624, '申论材料精读方法：关键信息提取', '4课时 | 材料阅读', '讲解申论材料精读方法，准确提取关键信息。', 'article', 'intermediate', 4, 0, 331),
(2272, 624, '申论材料结构分析：把握材料逻辑', '3课时 | 材料阅读', '讲解申论材料结构分析方法，把握材料内在逻辑。', 'article', 'intermediate', 3, 0, 332),
(2273, 624, '申论材料标注技巧：高效做标记', '2课时 | 材料阅读', '讲解申论材料标注技巧，提高信息检索效率。', 'article', 'basic', 2, 1, 333),
(2274, 624, '案例型材料处理：从案例中提炼观点', '3课时 | 材料阅读', '讲解案例型材料的处理方法，从案例中提炼核心观点。', 'article', 'intermediate', 3, 0, 334),
(2275, 624, '数据型材料处理：数据背后的问题与趋势', '3课时 | 材料阅读', '讲解数据型材料的处理方法，分析数据背后的问题与趋势。', 'article', 'intermediate', 3, 0, 335);

-- =============================================
-- 三百一十三、新增课程 - 面试模拟练习系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2276, 716, '独立模拟练习法：自己如何有效练习', '3课时 | 模拟练习', '讲解独立进行面试模拟练习的方法与技巧。', 'article', 'basic', 3, 1, 350),
(2277, 716, '对练模拟方法：两人互练的技巧', '3课时 | 模拟练习', '讲解两人对练面试的方法与注意事项。', 'article', 'intermediate', 3, 0, 351),
(2278, 716, '小组模拟方法：多人模拟的组织', '3课时 | 模拟练习', '讲解多人小组进行面试模拟的组织方法。', 'article', 'intermediate', 3, 0, 352),
(2279, 716, '线上模拟练习：利用网络资源练习', '2课时 | 模拟练习', '讲解利用网络资源进行线上面试模拟的方法。', 'article', 'basic', 2, 1, 353),
(2280, 716, '模拟练习反馈：如何有效点评与改进', '3课时 | 模拟练习', '讲解面试模拟练习后的反馈点评与改进方法。', 'article', 'intermediate', 3, 0, 354);

-- =============================================
-- 三百一十四、新增课程 - 备考时间规划系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2281, 1, '6个月备考规划：从零开始系统学习', '5课时 | 时间规划', '为备考6个月的考生制定从零开始的系统学习规划。', 'article', 'basic', 5, 1, 672),
(2282, 1, '3个月备考规划：高效冲刺学习', '4课时 | 时间规划', '为备考3个月的考生制定高效冲刺学习规划。', 'article', 'intermediate', 4, 0, 673),
(2283, 1, '1个月备考规划：快速突击要点', '3课时 | 时间规划', '为备考1个月的考生制定快速突击学习规划。', 'article', 'intermediate', 3, 0, 674),
(2284, 1, '2周备考规划：极限冲刺策略', '2课时 | 时间规划', '为备考2周的考生制定极限冲刺策略。', 'article', 'advanced', 2, 0, 675),
(2285, 1, '1年长期备考规划：充分准备稳扎稳打', '5课时 | 时间规划', '为备考1年的考生制定充分准备的长期学习规划。', 'article', 'basic', 5, 1, 676);

-- =============================================
-- 三百一十五、新增课程 - 在职备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2286, 1, '在职备考时间管理：工作与学习的平衡', '4课时 | 在职备考', '帮助在职考生做好工作与备考学习的时间平衡。', 'article', 'intermediate', 4, 0, 680),
(2287, 1, '在职备考碎片时间利用：高效利用零散时间', '3课时 | 在职备考', '讲解在职考生如何高效利用碎片化时间学习。', 'article', 'intermediate', 3, 0, 681),
(2288, 1, '在职备考精力管理：保持学习状态', '3课时 | 在职备考', '帮助在职考生管理精力，保持良好学习状态。', 'article', 'intermediate', 3, 0, 682),
(2289, 1, '在职备考资源整合：善用各类学习资源', '2课时 | 在职备考', '帮助在职考生整合利用各类学习资源。', 'article', 'basic', 2, 1, 683),
(2290, 1, '在职备考心态调整：应对工作压力', '2课时 | 在职备考', '帮助在职考生调整心态，应对工作与备考双重压力。', 'article', 'basic', 2, 1, 684);

-- =============================================
-- 三百一十六、新增课程 - 应届生备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2291, 1, '应届生备考优势分析：如何发挥身份优势', '3课时 | 应届备考', '分析应届生报考公务员的优势与发挥方法。', 'article', 'basic', 3, 1, 688),
(2292, 1, '应届生时间安排：学业与备考的兼顾', '3课时 | 应届备考', '帮助应届生兼顾学业与公务员备考。', 'article', 'intermediate', 3, 0, 689),
(2293, 1, '应届生岗位选择：适合应届生的岗位', '3课时 | 应届备考', '分析适合应届生报考的公务员岗位类型。', 'article', 'basic', 3, 1, 690),
(2294, 1, '应届生与秋招的选择：公考与企业的权衡', '2课时 | 应届备考', '帮助应届生做好公考与企业秋招的选择权衡。', 'article', 'basic', 2, 1, 691),
(2295, 1, '应届生毕业论文与备考：时间冲突处理', '2课时 | 应届备考', '帮助应届生处理毕业论文与公考备考的时间冲突。', 'article', 'intermediate', 2, 0, 692);

-- =============================================
-- 三百一十七、新增课程 - 多次备考系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2296, 1, '二战备考策略：吸取教训重新出发', '4课时 | 多次备考', '为二战考生制定吸取经验教训的备考策略。', 'article', 'intermediate', 4, 0, 696),
(2297, 1, '三战及以上备考：坚持与调整的艺术', '3课时 | 多次备考', '为多次备考考生提供坚持与调整的建议。', 'article', 'intermediate', 3, 0, 697),
(2298, 1, '多次备考心态重建：从失败中走出', '3课时 | 多次备考', '帮助多次备考考生重建心态，从失败中走出。', 'article', 'basic', 3, 1, 698),
(2299, 1, '多次备考问题诊断：找到真正的短板', '4课时 | 多次备考', '帮助多次备考考生诊断问题，找到真正的短板所在。', 'article', 'intermediate', 4, 0, 699),
(2300, 1, '多次备考效率提升：避免重复无效劳动', '3课时 | 多次备考', '帮助多次备考考生提升效率，避免重复无效劳动。', 'article', 'intermediate', 3, 0, 700);

-- =============================================
-- 三百一十八、新增课程 - 公考备考误区系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2301, 1, '行测备考十大误区：避免无效努力', '4课时 | 备考误区', '揭示行测备考的十大常见误区，帮助避免无效努力。', 'article', 'basic', 4, 1, 705),
(2302, 624, '申论备考十大误区：纠正错误方法', '4课时 | 备考误区', '揭示申论备考的十大常见误区，帮助纠正错误方法。', 'article', 'basic', 4, 1, 340),
(2303, 716, '面试备考十大误区：走出练习误区', '4课时 | 备考误区', '揭示面试备考的十大常见误区，帮助走出练习误区。', 'article', 'basic', 4, 1, 358),
(2304, 1, '刷题误区解析：题目数量vs质量', '2课时 | 备考误区', '分析刷题中数量与质量的关系，避免盲目刷题。', 'article', 'basic', 2, 1, 706),
(2305, 1, '报班误区解析：培训班的正确定位', '2课时 | 备考误区', '分析报培训班的误区，帮助正确定位培训班作用。', 'article', 'basic', 2, 1, 707);

-- =============================================
-- 三百一十九、新增课程 - 行测高频错题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2306, 547, '逻辑填空高频错题TOP50：错因分析', '5课时 | 高频错题', '汇总逻辑填空高频错题50道，深入分析错误原因。', 'article', 'intermediate', 5, 0, 70),
(2307, 551, '片段阅读高频错题TOP40：陷阱识别', '4课时 | 高频错题', '汇总片段阅读高频错题40道，识别常见陷阱。', 'article', 'intermediate', 4, 0, 118),
(2308, 560, '数学运算高频错题TOP50：思维纠偏', '5课时 | 高频错题', '汇总数学运算高频错题50道，纠正思维偏差。', 'article', 'intermediate', 5, 0, 148),
(2309, 574, '图形推理高频错题TOP30：规律误判', '3课时 | 高频错题', '汇总图形推理高频错题30道，分析规律误判原因。', 'article', 'intermediate', 3, 0, 90),
(2310, 587, '逻辑判断高频错题TOP40：推理错误', '4课时 | 高频错题', '汇总逻辑判断高频错题40道，分析推理错误原因。', 'article', 'intermediate', 4, 0, 128),
(2311, 593, '资料分析高频错题TOP30：计算陷阱', '3课时 | 高频错题', '汇总资料分析高频错题30道，识别计算陷阱。', 'article', 'intermediate', 3, 0, 118);

-- =============================================
-- 三百二十、新增课程 - 申论高频扣分点系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2312, 627, '归纳概括高频扣分点：要点遗漏与表述问题', '3课时 | 高频扣分', '分析归纳概括题的高频扣分点，避免要点遗漏与表述问题。', 'article', 'intermediate', 3, 0, 55),
(2313, 631, '提出对策高频扣分点：对策不具体与缺乏针对性', '3课时 | 高频扣分', '分析提出对策题的高频扣分点，避免对策空泛。', 'article', 'intermediate', 3, 0, 58),
(2314, 635, '综合分析高频扣分点：逻辑混乱与观点不明', '3课时 | 高频扣分', '分析综合分析题的高频扣分点，避免逻辑混乱。', 'article', 'intermediate', 3, 0, 58),
(2315, 640, '贯彻执行高频扣分点：格式错误与内容偏差', '3课时 | 高频扣分', '分析贯彻执行题的高频扣分点，避免格式与内容错误。', 'article', 'intermediate', 3, 0, 62),
(2316, 651, '大作文高频扣分点：论证薄弱与结构混乱', '4课时 | 高频扣分', '分析大作文的高频扣分点，提升论证与结构质量。', 'article', 'intermediate', 4, 0, 115);

-- =============================================
-- 三百二十一、新增课程 - 面试高频失误系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2317, 716, '面试内容失误TOP10：答题内容常见问题', '4课时 | 高频失误', '汇总面试答题内容的十大常见失误及纠正方法。', 'article', 'intermediate', 4, 0, 362),
(2318, 716, '面试表达失误TOP10：语言表达常见问题', '4课时 | 高频失误', '汇总面试语言表达的十大常见失误及纠正方法。', 'article', 'intermediate', 4, 0, 363),
(2319, 716, '面试形象失误TOP10：仪表仪态常见问题', '3课时 | 高频失误', '汇总面试仪表仪态的十大常见失误及纠正方法。', 'article', 'basic', 3, 1, 364),
(2320, 716, '面试心态失误TOP10：心理状态常见问题', '3课时 | 高频失误', '汇总面试心理状态的十大常见失误及调整方法。', 'article', 'basic', 3, 1, 365),
(2321, 716, '无领导面试失误：小组讨论常见问题', '3课时 | 高频失误', '汇总无领导小组讨论的常见失误及纠正方法。', 'article', 'intermediate', 3, 0, 366);

-- =============================================
-- 三百二十二、新增课程 - 笔记整理方法系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2322, 1, '行测笔记整理法：知识点体系构建', '3课时 | 笔记方法', '讲解行测知识点笔记的整理方法，构建知识体系。', 'article', 'basic', 3, 1, 712),
(2323, 624, '申论笔记整理法：素材库与框架库', '3课时 | 笔记方法', '讲解申论素材库与框架库的笔记整理方法。', 'article', 'basic', 3, 1, 345),
(2324, 716, '面试笔记整理法：题目与答案的积累', '3课时 | 笔记方法', '讲解面试题目与优质答案的笔记积累方法。', 'article', 'basic', 3, 1, 370),
(2325, 1, '电子笔记vs手写笔记：选择适合自己的方式', '2课时 | 笔记方法', '对比电子笔记与手写笔记的优劣，帮助选择适合方式。', 'article', 'basic', 2, 1, 713),
(2326, 1, '思维导图笔记法：知识点可视化整理', '3课时 | 笔记方法', '讲解思维导图在公考备考中的应用方法。', 'article', 'intermediate', 3, 0, 714);

-- =============================================
-- 三百二十三、新增课程 - 错题本使用系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2327, 1, '错题本的正确使用：从记录到复习', '3课时 | 错题本', '讲解错题本的正确使用方法，从记录到复习的完整流程。', 'article', 'basic', 3, 1, 718),
(2328, 1, '错题分类方法：按知识点vs按错因', '2课时 | 错题本', '讲解错题的分类方法，帮助高效整理错题。', 'article', 'basic', 2, 1, 719),
(2329, 1, '错题复习周期：科学安排复习时间', '2课时 | 错题本', '讲解错题复习的最佳周期，科学安排复习时间。', 'article', 'basic', 2, 1, 720),
(2330, 1, '错题转化为得分：从错误中学习', '3课时 | 错题本', '讲解如何将错题转化为得分能力，从错误中学习成长。', 'article', 'intermediate', 3, 0, 721);

-- =============================================
-- 三百二十四、新增课程 - 考前一周冲刺系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2331, 1, '考前一周行测冲刺：重点回顾与查漏补缺', '3课时 | 考前冲刺', '考前一周行测冲刺安排，重点回顾与查漏补缺。', 'article', 'intermediate', 3, 0, 725),
(2332, 624, '考前一周申论冲刺：素材强化与写作练习', '3课时 | 考前冲刺', '考前一周申论冲刺安排，素材强化与写作练习。', 'article', 'intermediate', 3, 0, 350),
(2333, 716, '考前一周面试冲刺：高频题型强化', '3课时 | 考前冲刺', '考前一周面试冲刺安排，高频题型强化训练。', 'article', 'intermediate', 3, 0, 375),
(2334, 1, '考前一周作息调整：调整到考试状态', '2课时 | 考前冲刺', '考前一周作息调整方案，帮助调整到最佳考试状态。', 'article', 'basic', 2, 1, 726),
(2335, 1, '考前一周心态稳定：保持平稳心态', '2课时 | 考前冲刺', '考前一周心态调整方法，帮助保持平稳心态。', 'article', 'basic', 2, 1, 727);

-- =============================================
-- 三百二十五、新增课程 - 考前一天准备系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2336, 1, '考前一天物品准备：考试必备物品清单', '1课时 | 考前准备', '提供考试必备物品清单，确保考前准备齐全。', 'article', 'basic', 1, 1, 730),
(2337, 1, '考前一天学习安排：适度复习不过度', '2课时 | 考前准备', '考前一天学习安排建议，适度复习避免过度疲劳。', 'article', 'basic', 2, 1, 731),
(2338, 1, '考前一天饮食建议：清淡饮食保状态', '1课时 | 考前准备', '考前一天饮食建议，帮助保持良好身体状态。', 'article', 'basic', 1, 1, 732),
(2339, 1, '考前一天睡眠调整：保证充足睡眠', '1课时 | 考前准备', '考前一天睡眠调整建议，确保充足睡眠。', 'article', 'basic', 1, 1, 733),
(2340, 1, '考前一天心态放松：自信从容迎考', '1课时 | 考前准备', '考前一天心态调整方法，帮助自信从容迎考。', 'article', 'basic', 1, 1, 734);

-- =============================================
-- 三百二十六、新增课程 - 考场状态调节系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2341, 1, '考场紧张缓解：快速放松技巧', '2课时 | 考场调节', '讲解考场紧张情绪的快速缓解技巧。', 'article', 'basic', 2, 1, 738),
(2342, 1, '考场专注力保持：集中注意力的方法', '2课时 | 考场调节', '讲解考场保持专注力的方法与技巧。', 'article', 'basic', 2, 1, 739),
(2343, 1, '考场遇到难题应对：不慌不乱继续答题', '2课时 | 考场调节', '讲解考场遇到难题时的应对策略。', 'article', 'intermediate', 2, 0, 740),
(2344, 1, '考场时间不够应对：快速完成剩余题目', '2课时 | 考场调节', '讲解考场时间不够时的应对策略。', 'article', 'intermediate', 2, 0, 741),
(2345, 1, '两场考试之间调整：午休与状态恢复', '1课时 | 考场调节', '讲解行测与申论考试之间的调整方法。', 'article', 'basic', 1, 1, 742);

-- =============================================
-- 三百二十七、新增课程 - 各地公务员待遇系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2346, 1, '公务员工资构成解析：基本工资与津补贴', '3课时 | 待遇分析', '详细解析公务员工资的构成，包括基本工资与各类津补贴。', 'article', 'basic', 3, 1, 746),
(2347, 1, '东部发达地区公务员待遇：京沪浙粤', '3课时 | 待遇分析', '分析京沪浙粤等东部发达地区公务员待遇情况。', 'article', 'basic', 3, 1, 747),
(2348, 1, '中西部地区公务员待遇：各省对比', '3课时 | 待遇分析', '分析中西部各省公务员待遇情况与对比。', 'article', 'basic', 3, 1, 748),
(2349, 1, '不同层级公务员待遇：县乡vs市省', '2课时 | 待遇分析', '对比分析县乡与市省不同层级公务员待遇差异。', 'article', 'basic', 2, 1, 749),
(2350, 1, '公务员福利待遇全览：五险一金与其他福利', '3课时 | 待遇分析', '全面介绍公务员的五险一金与其他福利待遇。', 'article', 'basic', 3, 1, 750);

-- =============================================
-- 三百二十八、新增课程 - 不同系统晋升空间系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2351, 1, '中央部委晋升空间：晋升通道与规律', '3课时 | 晋升空间', '分析中央部委公务员的晋升通道与晋升规律。', 'article', 'basic', 3, 1, 754),
(2352, 1, '省级机关晋升空间：省厅晋升特点', '3课时 | 晋升空间', '分析省级机关公务员的晋升特点与空间。', 'article', 'basic', 3, 1, 755),
(2353, 1, '市县基层晋升空间：基层发展路径', '3课时 | 晋升空间', '分析市县基层公务员的晋升空间与发展路径。', 'article', 'basic', 3, 1, 756),
(2354, 1, '热门系统晋升对比：税务、海关、统计等', '3课时 | 晋升空间', '对比分析税务、海关、统计等热门系统的晋升空间。', 'article', 'basic', 3, 1, 757),
(2355, 1, '职级并行制度解读：晋升与待遇双通道', '3课时 | 晋升空间', '详细解读公务员职级并行制度与双通道晋升机制。', 'article', 'basic', 3, 1, 758);

-- =============================================
-- 三百二十九、新增课程 - 公考择岗策略系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2356, 1, '岗位筛选方法：快速缩小报考范围', '3课时 | 择岗策略', '讲解岗位筛选的方法，帮助快速缩小报考范围。', 'article', 'basic', 3, 1, 762),
(2357, 1, '岗位竞争分析：判断岗位竞争激烈程度', '3课时 | 择岗策略', '讲解判断岗位竞争激烈程度的方法与技巧。', 'article', 'intermediate', 3, 0, 763),
(2358, 1, '冷门岗位挖掘：发现高性价比岗位', '3课时 | 择岗策略', '讲解挖掘冷门高性价比岗位的方法与技巧。', 'article', 'intermediate', 3, 0, 764),
(2359, 1, '限制条件利用：发挥自身条件优势', '2课时 | 择岗策略', '讲解如何利用限制条件发挥自身优势报考。', 'article', 'basic', 2, 1, 765),
(2360, 1, '报名时机选择：何时报名最有利', '2课时 | 择岗策略', '讲解报名时机的选择策略与技巧。', 'article', 'basic', 2, 1, 766);

-- =============================================
-- 三百三十、新增课程 - 言语理解技巧进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2361, 547, '语境分析进阶：复杂语境的深度理解', '4课时 | 技巧进阶', '讲解复杂语境的深度分析与理解方法。', 'article', 'advanced', 4, 0, 75),
(2362, 547, '词义辨析进阶：相似词汇的精准区分', '4课时 | 技巧进阶', '讲解相似词汇的精准辨析与区分方法。', 'article', 'advanced', 4, 0, 76),
(2363, 551, '主旨把握进阶：隐含主旨的准确识别', '4课时 | 技巧进阶', '讲解隐含主旨的准确识别与把握方法。', 'article', 'advanced', 4, 0, 122),
(2364, 551, '逻辑关系进阶：复杂论证的结构分析', '4课时 | 技巧进阶', '讲解复杂论证结构的分析与理解方法。', 'article', 'advanced', 4, 0, 123),
(2365, 555, '语句衔接进阶：高难度衔接题攻克', '3课时 | 技巧进阶', '讲解高难度语句衔接题的攻克方法。', 'article', 'advanced', 3, 0, 60);

-- =============================================
-- 三百三十一、新增课程 - 数量关系技巧进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2366, 560, '数学思维进阶：建立数学模型思维', '4课时 | 技巧进阶', '培养数学建模思维，提升复杂问题分析能力。', 'article', 'advanced', 4, 0, 150),
(2367, 560, '计算技巧进阶：复杂计算的简化方法', '4课时 | 技巧进阶', '讲解复杂计算的简化与估算方法。', 'article', 'advanced', 4, 0, 151),
(2368, 560, '组合问题进阶：多条件组合的系统解法', '4课时 | 技巧进阶', '讲解多条件组合问题的系统解法。', 'article', 'advanced', 4, 0, 152),
(2369, 569, '数字推理进阶：复杂数列规律识别', '4课时 | 技巧进阶', '讲解复杂数列规律的识别与推理方法。', 'article', 'advanced', 4, 0, 55),
(2370, 560, '应用题综合进阶：多知识点综合应用', '4课时 | 技巧进阶', '讲解多知识点综合应用题的系统解法。', 'article', 'advanced', 4, 0, 153);

-- =============================================
-- 三百三十二、新增课程 - 判断推理技巧进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2371, 574, '图形推理进阶：复杂图形规律破解', '4课时 | 技巧进阶', '讲解复杂图形规律的识别与破解方法。', 'article', 'advanced', 4, 0, 95),
(2372, 580, '定义判断进阶：抽象定义的准确理解', '3课时 | 技巧进阶', '讲解抽象定义的准确理解与判断方法。', 'article', 'advanced', 3, 0, 48),
(2373, 583, '类比推理进阶：隐含关系的深度挖掘', '3课时 | 技巧进阶', '讲解类比推理隐含关系的深度挖掘方法。', 'article', 'advanced', 3, 0, 55),
(2374, 587, '逻辑判断进阶：复杂推理的系统方法', '5课时 | 技巧进阶', '讲解复杂逻辑推理的系统分析方法。', 'article', 'advanced', 5, 0, 132),
(2375, 587, '论证分析进阶：加强削弱的精准判断', '4课时 | 技巧进阶', '讲解论证加强削弱的精准判断方法。', 'article', 'advanced', 4, 0, 133);

-- =============================================
-- 三百三十三、新增课程 - 资料分析技巧进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2376, 593, '速算进阶：极速计算技巧大全', '5课时 | 技巧进阶', '汇总讲解资料分析极速计算的进阶技巧。', 'article', 'advanced', 5, 0, 125),
(2377, 593, '比较判断进阶：复杂比较的快速方法', '4课时 | 技巧进阶', '讲解复杂数据比较的快速判断方法。', 'article', 'advanced', 4, 0, 126),
(2378, 593, '综合分析进阶：多材料综合题攻克', '4课时 | 技巧进阶', '讲解多材料综合分析题的攻克方法。', 'article', 'advanced', 4, 0, 127),
(2379, 598, '估算技巧进阶：精度与速度的平衡', '4课时 | 技巧进阶', '讲解资料分析估算中精度与速度的平衡技巧。', 'article', 'advanced', 4, 0, 78),
(2380, 593, '陷阱题识别进阶：隐蔽陷阱的发现', '3课时 | 技巧进阶', '讲解资料分析隐蔽陷阱的识别与应对方法。', 'article', 'advanced', 3, 0, 128);

-- =============================================
-- 三百三十四、新增课程 - 申论写作进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2381, 651, '论证深度进阶：从浅层到深层的论证', '4课时 | 写作进阶', '讲解申论写作从浅层论证到深层论证的提升方法。', 'article', 'advanced', 4, 0, 120),
(2382, 651, '素材运用进阶：素材的巧妙融合', '4课时 | 写作进阶', '讲解申论写作中素材的巧妙运用与融合方法。', 'article', 'advanced', 4, 0, 121),
(2383, 651, '语言表达进阶：政论文的规范表达', '4课时 | 写作进阶', '讲解申论政论文的规范语言表达与提升方法。', 'article', 'advanced', 4, 0, 122),
(2384, 651, '结构创新进阶：突破模板的写法', '4课时 | 写作进阶', '讲解申论写作突破模板、结构创新的方法。', 'article', 'advanced', 4, 0, 123),
(2385, 651, '高分作文进阶：从70分到80分的突破', '5课时 | 写作进阶', '讲解申论作文从70分到80分高分突破的方法。', 'article', 'advanced', 5, 0, 124);

-- =============================================
-- 三百三十五、新增课程 - 面试表达进阶系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2386, 716, '逻辑表达进阶：清晰严密的表达逻辑', '4课时 | 表达进阶', '讲解面试答题清晰严密的逻辑表达方法。', 'article', 'advanced', 4, 0, 380),
(2387, 716, '语言组织进阶：流畅自然的语言表达', '4课时 | 表达进阶', '讲解面试答题流畅自然的语言组织方法。', 'article', 'advanced', 4, 0, 381),
(2388, 716, '观点阐述进阶：深度与广度的平衡', '4课时 | 表达进阶', '讲解面试观点阐述的深度与广度平衡方法。', 'article', 'advanced', 4, 0, 382),
(2389, 716, '个性表达进阶：展现独特思考与见解', '4课时 | 表达进阶', '讲解面试中展现个性思考与独特见解的方法。', 'article', 'advanced', 4, 0, 383),
(2390, 716, '临场应变进阶：灵活应对各种情况', '4课时 | 表达进阶', '讲解面试临场应变、灵活应对的进阶方法。', 'article', 'advanced', 4, 0, 384);

-- =============================================
-- 三百三十六、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '常识判断总论：知识体系与高效记忆',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍常识判断的知识体系构成与高效记忆方法，为系统学习打下基础。'
WHERE `id` = 16;

UPDATE `what_courses` SET 
    `title` = '资料分析总论：核心概念与速算基础',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍资料分析的核心概念与速算基础，建立正确的学习方法。'
WHERE `id` = 17;

UPDATE `what_courses` SET 
    `title` = '数量关系总论：题型概述与解题思路',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍数量关系的题型分布与解题思路，掌握备考方向与方法。'
WHERE `id` = 18;

-- =============================================
-- 三百三十七、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习综合分析题型，掌握评价分析、解释分析、启示分析等多种分析方法。',
    `long_description` = '综合分析是申论的思维型题型，主要考查考生的综合分析与判断能力。本课程体系涵盖评价分析（观点评价、现象评价）、解释分析（概念解释、句子理解）、启示分析（经验提炼、借鉴意义）、比较分析（异同分析、优劣比较），帮助考生深度理解材料内涵。'
WHERE `id` = 635;

UPDATE `what_course_categories` SET 
    `description` = '系统学习大作文写作，掌握立意、结构、论证、语言等核心写作能力。',
    `long_description` = '大作文是申论的核心题型，主要考查考生的综合写作能力与政策理解水平。本课程体系涵盖审题立意（准确把握命题意图）、谋篇布局（科学安排文章结构）、论证方法（充实有力的论证）、语言表达（规范准确的政论语言），帮助考生写出高质量的申论大作文。'
WHERE `id` = 651;

UPDATE `what_course_categories` SET 
    `description` = '系统学习综合分析类面试题型，掌握社会现象、政策理解、观点评价等分析方法。',
    `long_description` = '综合分析是结构化面试的核心题型，主要考查考生的综合分析能力与政治素养。本课程体系涵盖社会现象分析（热点事件分析）、政策理解分析（政策解读与评价）、观点评价分析（名言警句与观点辨析）、哲理分析（寓言故事与原理效应），帮助考生展现深度思考能力。'
WHERE `id` = 719;

UPDATE `what_course_categories` SET 
    `description` = '系统学习组织计划类面试题型，掌握活动策划、调研组织、协调安排等实务能力。',
    `long_description` = '组织计划是结构化面试的实务型题型，主要考查考生的组织协调与统筹能力。本课程体系涵盖活动策划（会议、培训、宣传等活动）、调研组织（调查研究的方法与流程）、协调安排（资源调配与任务分解）、突发处理（活动中的意外应对），帮助考生展现实际工作能力。'
WHERE `id` = 725;

-- =============================================
-- 三百三十八、新增课程 - 公基政治理论系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2391, 608, '马克思主义哲学核心：唯物论与辩证法', '6课时 | 政治理论', '系统讲解马克思主义哲学的唯物论与辩证法核心内容。', 'article', 'intermediate', 6, 0, 55),
(2392, 608, '毛泽东思想概论：核心内容与活的灵魂', '5课时 | 政治理论', '系统讲解毛泽东思想的核心内容与活的灵魂。', 'article', 'intermediate', 5, 0, 56),
(2393, 608, '邓小平理论精讲：改革开放理论体系', '4课时 | 政治理论', '系统讲解邓小平理论的核心内容与改革开放思想。', 'article', 'intermediate', 4, 0, 57),
(2394, 608, '三个代表重要思想：内涵与实践要求', '3课时 | 政治理论', '系统讲解三个代表重要思想的内涵与实践要求。', 'article', 'intermediate', 3, 0, 58),
(2395, 608, '科学发展观精讲：以人为本与全面协调', '3课时 | 政治理论', '系统讲解科学发展观的核心内容与基本要求。', 'article', 'intermediate', 3, 0, 59),
(2396, 608, '习近平新时代中国特色社会主义思想（一）：核心要义', '6课时 | 政治理论', '系统讲解习近平新时代中国特色社会主义思想的核心要义。', 'article', 'intermediate', 6, 0, 60),
(2397, 608, '习近平新时代中国特色社会主义思想（二）：十个明确', '6课时 | 政治理论', '系统讲解习近平新时代中国特色社会主义思想的十个明确。', 'article', 'intermediate', 6, 0, 61),
(2398, 608, '党的二十大精神学习：主要内容与重大意义', '5课时 | 政治理论', '系统学习党的二十大报告的主要内容与重大意义。', 'article', 'intermediate', 5, 0, 62);

-- =============================================
-- 三百三十九、新增课程 - 公基法律基础系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2399, 612, '宪法精讲：国家根本大法核心内容', '6课时 | 法律基础', '系统讲解宪法的核心内容，包括国体、政体、公民权利等。', 'article', 'intermediate', 6, 0, 78),
(2400, 612, '民法典精讲（一）：总则与物权编', '6课时 | 法律基础', '系统讲解民法典总则与物权编的核心内容。', 'article', 'intermediate', 6, 0, 79),
(2401, 612, '民法典精讲（二）：合同编与侵权编', '6课时 | 法律基础', '系统讲解民法典合同编与侵权责任编的核心内容。', 'article', 'intermediate', 6, 0, 80),
(2402, 612, '刑法精讲（一）：总则核心内容', '5课时 | 法律基础', '系统讲解刑法总则的核心内容，包括犯罪构成、刑罚等。', 'article', 'intermediate', 5, 0, 81),
(2403, 612, '刑法精讲（二）：分则重点罪名', '5课时 | 法律基础', '系统讲解刑法分则的重点罪名与构成要件。', 'article', 'intermediate', 5, 0, 82),
(2404, 612, '行政法精讲：行政行为与行政救济', '5课时 | 法律基础', '系统讲解行政法的核心内容，包括行政行为与救济途径。', 'article', 'intermediate', 5, 0, 83),
(2405, 612, '行政诉讼法精讲：诉讼程序与管辖', '4课时 | 法律基础', '系统讲解行政诉讼法的程序规定与管辖规则。', 'article', 'intermediate', 4, 0, 84),
(2406, 612, '劳动法与劳动合同法：劳动权益保障', '4课时 | 法律基础', '系统讲解劳动法与劳动合同法的核心内容。', 'article', 'intermediate', 4, 0, 85);

-- =============================================
-- 三百四十、新增课程 - 公基经济知识系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2407, 621, '市场经济理论：供需、价格与竞争', '4课时 | 经济知识', '系统讲解市场经济的基础理论，包括供需关系、价格机制等。', 'article', 'intermediate', 4, 0, 40),
(2408, 621, '宏观经济政策：财政政策与货币政策', '5课时 | 经济知识', '系统讲解宏观经济调控的财政政策与货币政策。', 'article', 'intermediate', 5, 0, 41),
(2409, 621, '国际贸易与金融：全球化经济运行', '4课时 | 经济知识', '系统讲解国际贸易与国际金融的基础知识。', 'article', 'intermediate', 4, 0, 42),
(2410, 621, '中国经济发展：新发展理念与新发展格局', '4课时 | 经济知识', '系统讲解中国经济发展的新理念与新格局。', 'article', 'intermediate', 4, 0, 43),
(2411, 621, '经济热点解读：当前经济形势与政策', '4课时 | 经济知识', '解读当前经济热点问题与相关政策。', 'article', 'intermediate', 4, 0, 44);

-- =============================================
-- 三百四十一、新增课程 - 公基管理知识系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2412, 622, '管理学基础：计划、组织、领导、控制', '5课时 | 管理知识', '系统讲解管理学的基本职能与核心概念。', 'article', 'intermediate', 5, 0, 30),
(2413, 622, '公共行政学：政府职能与行政体制', '5课时 | 管理知识', '系统讲解公共行政学的核心内容与政府职能。', 'article', 'intermediate', 5, 0, 31),
(2414, 622, '行政组织理论：组织结构与运行机制', '4课时 | 管理知识', '系统讲解行政组织的结构类型与运行机制。', 'article', 'intermediate', 4, 0, 32),
(2415, 622, '人力资源管理：公务员制度与管理', '4课时 | 管理知识', '系统讲解公务员制度与人力资源管理知识。', 'article', 'intermediate', 4, 0, 33),
(2416, 622, '公共政策分析：政策制定与执行', '4课时 | 管理知识', '系统讲解公共政策的制定过程与执行评估。', 'article', 'intermediate', 4, 0, 34);

-- =============================================
-- 三百四十二、新增课程 - 公基公文写作系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2417, 11, '公文基础知识：种类、格式与行文规则', '4课时 | 公文写作', '系统讲解公文的种类、格式规范与行文规则。', 'article', 'basic', 4, 1, 245),
(2418, 11, '法定公文写作（一）：决定、公告、通告', '4课时 | 公文写作', '系统讲解决定、公告、通告等法定公文的写作方法。', 'article', 'intermediate', 4, 0, 246),
(2419, 11, '法定公文写作（二）：通知、通报、报告', '4课时 | 公文写作', '系统讲解通知、通报、报告等法定公文的写作方法。', 'article', 'intermediate', 4, 0, 247),
(2420, 11, '法定公文写作（三）：请示、批复、意见', '4课时 | 公文写作', '系统讲解请示、批复、意见等法定公文的写作方法。', 'article', 'intermediate', 4, 0, 248),
(2421, 11, '法定公文写作（四）：函、纪要', '3课时 | 公文写作', '系统讲解函、纪要等法定公文的写作方法。', 'article', 'intermediate', 3, 0, 249),
(2422, 11, '事务性文书写作：计划、总结、调研报告', '4课时 | 公文写作', '系统讲解计划、总结、调研报告等事务性文书的写作方法。', 'article', 'intermediate', 4, 0, 250);

-- =============================================
-- 三百四十三、新增课程 - 公基科技人文系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2423, 617, '信息技术常识：计算机与互联网基础', '4课时 | 科技常识', '系统讲解计算机与互联网的基础知识。', 'article', 'basic', 4, 1, 85),
(2424, 617, '航空航天常识：中国航天成就与发展', '3课时 | 科技常识', '系统讲解中国航空航天事业的重大成就与发展历程。', 'article', 'intermediate', 3, 0, 86),
(2425, 617, '生物医学常识：生命科学与医疗健康', '3课时 | 科技常识', '系统讲解生命科学与医疗健康的基础知识。', 'article', 'intermediate', 3, 0, 87),
(2426, 617, '新能源与环保：绿色发展与可持续', '3课时 | 科技常识', '系统讲解新能源技术与环境保护的基础知识。', 'article', 'intermediate', 3, 0, 88),
(2427, 615, '中国古代史精要：朝代更迭与重大事件', '6课时 | 历史人文', '系统讲解中国古代史的重要朝代与重大历史事件。', 'article', 'intermediate', 6, 0, 60),
(2428, 615, '中国近现代史精要：从鸦片战争到新中国', '5课时 | 历史人文', '系统讲解中国近现代史的重要历程与重大事件。', 'article', 'intermediate', 5, 0, 61),
(2429, 615, '中国文学常识：诗词歌赋与名著名篇', '5课时 | 历史人文', '系统讲解中国古典文学的重要作品与文学常识。', 'article', 'intermediate', 5, 0, 62),
(2430, 619, '中国地理常识：自然地理与区域发展', '4课时 | 地理常识', '系统讲解中国自然地理与区域经济发展知识。', 'article', 'intermediate', 4, 0, 35);

-- =============================================
-- 三百四十四、新增课程 - 行测模块突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2431, 546, '言语理解80%正确率突破：系统提升方案', '6课时 | 模块突破', '系统讲解言语理解模块达到80%正确率的方法与策略。', 'article', 'intermediate', 6, 0, 170),
(2432, 559, '数量关系60%正确率突破：核心题型攻克', '6课时 | 模块突破', '系统讲解数量关系模块达到60%正确率的方法与策略。', 'article', 'intermediate', 6, 0, 165),
(2433, 573, '判断推理85%正确率突破：全题型提升', '6课时 | 模块突破', '系统讲解判断推理模块达到85%正确率的方法与策略。', 'article', 'intermediate', 6, 0, 165),
(2434, 592, '资料分析90%正确率突破：速度与准确并重', '6课时 | 模块突破', '系统讲解资料分析模块达到90%正确率的方法与策略。', 'article', 'intermediate', 6, 0, 158),
(2435, 606, '常识判断提升策略：精准把握高频考点', '5课时 | 模块突破', '系统讲解常识判断模块的提升策略与高频考点。', 'article', 'intermediate', 5, 0, 95);

-- =============================================
-- 三百四十五、新增课程 - 申论题型突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2436, 627, '归纳概括满分突破：要点无遗漏', '5课时 | 题型突破', '系统讲解归纳概括题满分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 60),
(2437, 631, '提出对策满分突破：对策精准有效', '5课时 | 题型突破', '系统讲解提出对策题满分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 62),
(2438, 635, '综合分析满分突破：逻辑清晰透彻', '5课时 | 题型突破', '系统讲解综合分析题满分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 62),
(2439, 640, '贯彻执行满分突破：格式内容双优', '5课时 | 题型突破', '系统讲解贯彻执行题满分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 68),
(2440, 651, '大作文一类文突破：立意深刻论证有力', '6课时 | 题型突破', '系统讲解大作文一类文的突破方法与写作技巧。', 'article', 'advanced', 6, 0, 128);

-- =============================================
-- 三百四十六、新增课程 - 面试题型突破系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2441, 719, '综合分析题高分突破：深度与亮点并存', '5课时 | 题型突破', '系统讲解综合分析题高分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 148),
(2442, 725, '组织计划题高分突破：全面细致有创意', '5课时 | 题型突破', '系统讲解组织计划题高分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 82),
(2443, 733, '人际关系题高分突破：情商与智商双高', '5课时 | 题型突破', '系统讲解人际关系题高分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 82),
(2444, 740, '应急应变题高分突破：冷静从容处理妥当', '5课时 | 题型突破', '系统讲解应急应变题高分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 82),
(2445, 746, '言语表达题高分突破：生动感人有内涵', '5课时 | 题型突破', '系统讲解言语表达题高分突破的方法与技巧。', 'article', 'intermediate', 5, 0, 85);

-- =============================================
-- 三百四十七、新增课程 - 真题年度对比系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2446, 1, '国考行测2022-2025真题对比：命题趋势分析', '4课时 | 年度对比', '对比分析2022-2025年国考行测真题的命题趋势与变化。', 'article', 'intermediate', 4, 0, 775),
(2447, 624, '国考申论2022-2025真题对比：主题与题型变化', '4课时 | 年度对比', '对比分析2022-2025年国考申论真题的主题与题型变化。', 'article', 'intermediate', 4, 0, 355),
(2448, 716, '国考面试2022-2025真题对比：考查重点变化', '4课时 | 年度对比', '对比分析2022-2025年国考面试真题的考查重点变化。', 'article', 'intermediate', 4, 0, 390),
(2449, 1, '省考联考2022-2025真题对比：各省考情差异', '5课时 | 年度对比', '对比分析2022-2025年省考联考真题的考情差异与趋势。', 'article', 'intermediate', 5, 0, 776);

-- =============================================
-- 三百四十八、新增课程 - 命题趋势分析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2450, 546, '言语理解命题趋势：近年变化与备考方向', '3课时 | 命题趋势', '分析言语理解近年命题趋势与未来备考方向。', 'article', 'intermediate', 3, 0, 175),
(2451, 559, '数量关系命题趋势：难度变化与重点题型', '3课时 | 命题趋势', '分析数量关系近年命题趋势与重点题型分布。', 'article', 'intermediate', 3, 0, 170),
(2452, 573, '判断推理命题趋势：题型变化与新考法', '3课时 | 命题趋势', '分析判断推理近年命题趋势与新型考法。', 'article', 'intermediate', 3, 0, 170),
(2453, 592, '资料分析命题趋势：材料类型与计算变化', '3课时 | 命题趋势', '分析资料分析近年命题趋势与材料类型变化。', 'article', 'intermediate', 3, 0, 162),
(2454, 624, '申论命题趋势：主题热点与题型创新', '3课时 | 命题趋势', '分析申论近年命题趋势与主题热点方向。', 'article', 'intermediate', 3, 0, 358),
(2455, 716, '面试命题趋势：考查方式与新题型', '3课时 | 命题趋势', '分析面试近年命题趋势与新型考查方式。', 'article', 'intermediate', 3, 0, 395);

-- =============================================
-- 三百四十九、新增课程 - 答题模板系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2456, 627, '归纳概括答题模板：结构化答题框架', '3课时 | 答题模板', '提供归纳概括题的结构化答题模板与应用方法。', 'article', 'basic', 3, 1, 65),
(2457, 631, '提出对策答题模板：对策框架与表述', '3课时 | 答题模板', '提供提出对策题的答题模板与规范表述方法。', 'article', 'basic', 3, 1, 66),
(2458, 635, '综合分析答题模板：分析框架与逻辑', '3课时 | 答题模板', '提供综合分析题的答题模板与分析逻辑。', 'article', 'basic', 3, 1, 66),
(2459, 640, '贯彻执行答题模板：各类文种模板', '4课时 | 答题模板', '提供贯彻执行题各类文种的答题模板。', 'article', 'basic', 4, 1, 72),
(2460, 651, '大作文答题模板：文章结构与论证模式', '4课时 | 答题模板', '提供大作文的文章结构模板与论证模式。', 'article', 'basic', 4, 1, 132),
(2461, 719, '综合分析面试模板：分析框架与答题结构', '3课时 | 答题模板', '提供综合分析类面试题的答题模板与框架。', 'article', 'basic', 3, 1, 152),
(2462, 725, '组织计划面试模板：活动策划答题框架', '3课时 | 答题模板', '提供组织计划类面试题的答题模板与框架。', 'article', 'basic', 3, 1, 88),
(2463, 733, '人际关系面试模板：沟通协调答题框架', '3课时 | 答题模板', '提供人际关系类面试题的答题模板与框架。', 'article', 'basic', 3, 1, 88);

-- =============================================
-- 三百五十、新增课程 - 素材积累系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2464, 651, '申论素材积累（一）：经典名言警句100句', '5课时 | 素材积累', '汇总积累申论写作常用的100句经典名言警句。', 'article', 'intermediate', 5, 0, 135),
(2465, 651, '申论素材积累（二）：热点事例50例', '5课时 | 素材积累', '汇总积累申论写作常用的50个热点事例素材。', 'article', 'intermediate', 5, 0, 136),
(2466, 651, '申论素材积累（三）：政策表述100条', '5课时 | 素材积累', '汇总积累申论写作常用的100条政策表述。', 'article', 'intermediate', 5, 0, 137),
(2467, 651, '申论素材积累（四）：精彩开头30种', '3课时 | 素材积累', '汇总积累申论大作文30种精彩开头写法。', 'article', 'intermediate', 3, 0, 138),
(2468, 651, '申论素材积累（五）：有力结尾20种', '2课时 | 素材积累', '汇总积累申论大作文20种有力结尾写法。', 'article', 'intermediate', 2, 0, 139),
(2469, 716, '面试素材积累（一）：名言警句50句', '4课时 | 素材积累', '汇总积累面试答题常用的50句名言警句。', 'article', 'intermediate', 4, 0, 400),
(2470, 716, '面试素材积累（二）：典型案例30例', '4课时 | 素材积累', '汇总积累面试答题常用的30个典型案例。', 'article', 'intermediate', 4, 0, 401),
(2471, 716, '面试素材积累（三）：时政热点20个', '3课时 | 素材积累', '汇总积累面试答题常用的20个时政热点。', 'article', 'intermediate', 3, 0, 402);

-- =============================================
-- 三百五十一、新增课程 - 热点专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2472, 624, '乡村振兴专题：政策解读与案例分析', '5课时 | 热点专题', '深入解读乡村振兴政策与典型案例分析。', 'article', 'intermediate', 5, 0, 362),
(2473, 624, '数字中国专题：数字化转型与治理现代化', '4课时 | 热点专题', '深入解读数字中国建设与数字化治理。', 'article', 'intermediate', 4, 0, 363),
(2474, 624, '绿色发展专题：双碳目标与生态文明', '4课时 | 热点专题', '深入解读双碳目标与生态文明建设。', 'article', 'intermediate', 4, 0, 364),
(2475, 624, '共同富裕专题：政策内涵与实现路径', '4课时 | 热点专题', '深入解读共同富裕的政策内涵与实现路径。', 'article', 'intermediate', 4, 0, 365),
(2476, 624, '基层治理专题：治理现代化与社区建设', '4课时 | 热点专题', '深入解读基层治理现代化与社区治理创新。', 'article', 'intermediate', 4, 0, 366),
(2477, 624, '高质量发展专题：新发展理念与实践', '4课时 | 热点专题', '深入解读高质量发展的新理念与实践路径。', 'article', 'intermediate', 4, 0, 367);

-- =============================================
-- 三百五十二、新增课程 - 政策解读系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2478, 608, '政府工作报告解读：年度重点工作与目标', '4课时 | 政策解读', '详细解读政府工作报告的重点工作与目标任务。', 'article', 'intermediate', 4, 0, 68),
(2479, 608, '中央一号文件解读：三农政策重点', '3课时 | 政策解读', '详细解读中央一号文件的三农政策重点内容。', 'article', 'intermediate', 3, 0, 69),
(2480, 608, '中央经济工作会议解读：经济政策走向', '3课时 | 政策解读', '详细解读中央经济工作会议的政策要点与走向。', 'article', 'intermediate', 3, 0, 70),
(2481, 608, '机构改革政策解读：政府职能优化', '3课时 | 政策解读', '详细解读机构改革政策与政府职能优化方向。', 'article', 'intermediate', 3, 0, 71),
(2482, 608, '民生政策解读：教育、医疗、养老、住房', '4课时 | 政策解读', '详细解读教育、医疗、养老、住房等民生政策。', 'article', 'intermediate', 4, 0, 72);

-- =============================================
-- 三百五十三、新增课程 - 时事政治月度系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2483, 608, '时政月报：国内重大事件梳理', '2课时 | 时政月报', '每月梳理国内重大时政事件与政策动态。', 'article', 'basic', 2, 1, 75),
(2484, 608, '时政月报：国际重大事件梳理', '2课时 | 时政月报', '每月梳理国际重大时政事件与外交动态。', 'article', 'basic', 2, 1, 76),
(2485, 608, '时政热词解读：每月核心概念', '2课时 | 时政月报', '每月解读重要时政热词与核心概念。', 'article', 'basic', 2, 1, 77),
(2486, 608, '时政考点预测：月度重点考查方向', '2课时 | 时政月报', '每月预测时政考点与重点考查方向。', 'article', 'intermediate', 2, 0, 78);

-- =============================================
-- 三百五十四、新增课程 - 面试热点预测系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2487, 716, '面试热点预测：社会民生类', '4课时 | 热点预测', '预测分析面试社会民生类热点话题与答题思路。', 'article', 'intermediate', 4, 0, 408),
(2488, 716, '面试热点预测：政策理解类', '4课时 | 热点预测', '预测分析面试政策理解类热点话题与答题思路。', 'article', 'intermediate', 4, 0, 409),
(2489, 716, '面试热点预测：基层治理类', '4课时 | 热点预测', '预测分析面试基层治理类热点话题与答题思路。', 'article', 'intermediate', 4, 0, 410),
(2490, 716, '面试热点预测：经济发展类', '3课时 | 热点预测', '预测分析面试经济发展类热点话题与答题思路。', 'article', 'intermediate', 3, 0, 411),
(2491, 716, '面试热点预测：科技创新类', '3课时 | 热点预测', '预测分析面试科技创新类热点话题与答题思路。', 'article', 'intermediate', 3, 0, 412);

-- =============================================
-- 三百五十五、新增课程 - 行测全真模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2492, 1, '行测全真模拟卷（一）：国考难度', '3课时 | 全真模拟', '国考难度行测全真模拟卷与详细解析。', 'article', 'intermediate', 3, 0, 782),
(2493, 1, '行测全真模拟卷（二）：国考难度', '3课时 | 全真模拟', '国考难度行测全真模拟卷与详细解析。', 'article', 'intermediate', 3, 0, 783),
(2494, 1, '行测全真模拟卷（三）：省考难度', '3课时 | 全真模拟', '省考难度行测全真模拟卷与详细解析。', 'article', 'intermediate', 3, 0, 784),
(2495, 1, '行测全真模拟卷（四）：省考难度', '3课时 | 全真模拟', '省考难度行测全真模拟卷与详细解析。', 'article', 'intermediate', 3, 0, 785),
(2496, 1, '行测冲刺模拟卷：考前终极模拟', '3课时 | 全真模拟', '考前冲刺行测终极模拟卷与详细解析。', 'article', 'advanced', 3, 0, 786);

-- =============================================
-- 三百五十六、新增课程 - 申论全真模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2497, 624, '申论全真模拟卷（一）：副省级难度', '4课时 | 全真模拟', '副省级难度申论全真模拟卷与详细解析。', 'article', 'advanced', 4, 0, 372),
(2498, 624, '申论全真模拟卷（二）：地市级难度', '4课时 | 全真模拟', '地市级难度申论全真模拟卷与详细解析。', 'article', 'intermediate', 4, 0, 373),
(2499, 624, '申论全真模拟卷（三）：省考难度', '4课时 | 全真模拟', '省考难度申论全真模拟卷与详细解析。', 'article', 'intermediate', 4, 0, 374),
(2500, 624, '申论冲刺模拟卷：考前终极模拟', '4课时 | 全真模拟', '考前冲刺申论终极模拟卷与详细解析。', 'article', 'advanced', 4, 0, 375);

-- =============================================
-- 三百五十七、新增课程 - 面试全真模拟系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2501, 716, '面试全真模拟（一）：结构化面试', '4课时 | 全真模拟', '结构化面试全真模拟与点评解析。', 'article', 'intermediate', 4, 0, 418),
(2502, 716, '面试全真模拟（二）：结构化面试', '4课时 | 全真模拟', '结构化面试全真模拟与点评解析。', 'article', 'intermediate', 4, 0, 419),
(2503, 716, '面试全真模拟（三）：无领导小组讨论', '4课时 | 全真模拟', '无领导小组讨论全真模拟与点评解析。', 'article', 'intermediate', 4, 0, 420),
(2504, 716, '面试全真模拟（四）：结构化小组', '4课时 | 全真模拟', '结构化小组面试全真模拟与点评解析。', 'article', 'intermediate', 4, 0, 421),
(2505, 716, '面试冲刺模拟：考前终极模拟', '4课时 | 全真模拟', '考前冲刺面试终极模拟与点评解析。', 'article', 'advanced', 4, 0, 422);

-- =============================================
-- 三百五十八、新增课程 - 各省真题精选系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2506, 1, '广东省考真题精选：粤考特色题型', '5课时 | 省考真题', '精选广东省考历年真题，分析粤考特色题型。', 'article', 'intermediate', 5, 0, 790),
(2507, 1, '江苏省考真题精选：苏考特色题型', '5课时 | 省考真题', '精选江苏省考历年真题，分析苏考特色题型。', 'article', 'intermediate', 5, 0, 791),
(2508, 1, '浙江省考真题精选：浙考特色题型', '5课时 | 省考真题', '精选浙江省考历年真题，分析浙考特色题型。', 'article', 'intermediate', 5, 0, 792),
(2509, 1, '山东省考真题精选：鲁考特色题型', '5课时 | 省考真题', '精选山东省考历年真题，分析鲁考特色题型。', 'article', 'intermediate', 5, 0, 793),
(2510, 1, '北京市考真题精选：京考特色题型', '5课时 | 省考真题', '精选北京市考历年真题，分析京考特色题型。', 'article', 'intermediate', 5, 0, 794),
(2511, 1, '上海市考真题精选：沪考特色题型', '5课时 | 省考真题', '精选上海市考历年真题，分析沪考特色题型。', 'article', 'intermediate', 5, 0, 795);

-- =============================================
-- 三百五十九、新增课程 - 中央部委专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2512, 1, '中央部委报考指南：岗位分析与选择', '4课时 | 部委专题', '分析中央部委岗位特点与报考选择策略。', 'article', 'basic', 4, 1, 800),
(2513, 716, '外交部面试特点：考查方式与备考策略', '4课时 | 部委专题', '分析外交部面试特点与专项备考策略。', 'article', 'intermediate', 4, 0, 428),
(2514, 716, '海关总署面试特点：考查方式与备考策略', '3课时 | 部委专题', '分析海关总署面试特点与专项备考策略。', 'article', 'intermediate', 3, 0, 429),
(2515, 716, '税务系统面试特点：考查方式与备考策略', '4课时 | 部委专题', '分析税务系统面试特点与专项备考策略。', 'article', 'intermediate', 4, 0, 430),
(2516, 716, '统计局面试特点：考查方式与备考策略', '3课时 | 部委专题', '分析统计局面试特点与专项备考策略。', 'article', 'intermediate', 3, 0, 431),
(2517, 716, '铁路公安面试特点：考查方式与备考策略', '4课时 | 部委专题', '分析铁路公安面试特点与专项备考策略。', 'article', 'intermediate', 4, 0, 432);

-- =============================================
-- 三百六十、新增课程 - 乡镇公务员专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2518, 1, '乡镇公务员报考指南：岗位特点与发展', '3课时 | 乡镇专题', '分析乡镇公务员岗位特点与职业发展前景。', 'article', 'basic', 3, 1, 805),
(2519, 1, '乡镇行测备考：基层实务倾向题型', '4课时 | 乡镇专题', '针对乡镇岗位行测基层实务倾向题型备考。', 'article', 'intermediate', 4, 0, 806),
(2520, 624, '乡镇申论备考：基层工作主题与案例', '4课时 | 乡镇专题', '针对乡镇岗位申论基层工作主题备考。', 'article', 'intermediate', 4, 0, 380),
(2521, 716, '乡镇面试备考：基层工作场景题', '4课时 | 乡镇专题', '针对乡镇岗位面试基层工作场景题备考。', 'article', 'intermediate', 4, 0, 438),
(2522, 1, '乡镇工作实务：基层工作方法与技巧', '4课时 | 乡镇专题', '介绍乡镇基层工作的方法与实务技巧。', 'article', 'intermediate', 4, 0, 807);

-- =============================================
-- 三百六十一、新增课程 - 选调生专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2523, 1, '选调生考试概述：报考条件与考试内容', '3课时 | 选调生专题', '介绍选调生考试的报考条件与考试内容。', 'article', 'basic', 3, 1, 812),
(2524, 1, '中央选调与定向选调：考试差异分析', '3课时 | 选调生专题', '分析中央选调与定向选调的考试差异与特点。', 'article', 'intermediate', 3, 0, 813),
(2525, 1, '选调生行测备考：能力测试特点', '4课时 | 选调生专题', '针对选调生考试行测能力测试特点备考。', 'article', 'intermediate', 4, 0, 814),
(2526, 624, '选调生申论备考：策论文与调研报告', '4课时 | 选调生专题', '针对选调生考试申论策论文与调研报告备考。', 'article', 'intermediate', 4, 0, 385),
(2527, 716, '选调生面试备考：综合素质考查', '4课时 | 选调生专题', '针对选调生面试综合素质考查备考。', 'article', 'intermediate', 4, 0, 445);

-- =============================================
-- 三百六十二、新增课程 - 事业单位专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2528, 1, '事业单位考试概述：分类与考试内容', '3课时 | 事业单位', '介绍事业单位考试的分类与考试内容。', 'article', 'basic', 3, 1, 820),
(2529, 1, '职业能力倾向测验A类：综合管理岗', '5课时 | 事业单位', '系统讲解综合管理岗职业能力倾向测验备考。', 'article', 'intermediate', 5, 0, 821),
(2530, 1, '职业能力倾向测验B类：社会科学岗', '5课时 | 事业单位', '系统讲解社会科学岗职业能力倾向测验备考。', 'article', 'intermediate', 5, 0, 822),
(2531, 1, '职业能力倾向测验C类：自然科学岗', '5课时 | 事业单位', '系统讲解自然科学岗职业能力倾向测验备考。', 'article', 'intermediate', 5, 0, 823),
(2532, 1, '综合应用能力A类：管理岗综合写作', '5课时 | 事业单位', '系统讲解管理岗综合应用能力考试备考。', 'article', 'intermediate', 5, 0, 824),
(2533, 1, '综合应用能力B类：社科岗论文写作', '5课时 | 事业单位', '系统讲解社科岗综合应用能力考试备考。', 'article', 'intermediate', 5, 0, 825),
(2534, 1, '综合应用能力C类：自科岗科技文写作', '5课时 | 事业单位', '系统讲解自科岗综合应用能力考试备考。', 'article', 'intermediate', 5, 0, 826);

-- =============================================
-- 三百六十三、新增课程 - 公安招警专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2535, 1, '公安招警考试概述：报考条件与考试内容', '3课时 | 公安招警', '介绍公安招警考试的报考条件与考试内容。', 'article', 'basic', 3, 1, 830),
(2536, 1, '公安专业知识：公安基础理论', '5课时 | 公安招警', '系统讲解公安招警考试的公安基础理论知识。', 'article', 'intermediate', 5, 0, 831),
(2537, 1, '公安专业知识：法律法规应用', '5课时 | 公安招警', '系统讲解公安招警考试的法律法规应用知识。', 'article', 'intermediate', 5, 0, 832),
(2538, 1, '公安专业知识：公安业务能力', '4课时 | 公安招警', '系统讲解公安招警考试的公安业务能力知识。', 'article', 'intermediate', 4, 0, 833),
(2539, 716, '公安面试备考：执法场景与应急处置', '4课时 | 公安招警', '针对公安岗位面试执法场景与应急处置备考。', 'article', 'intermediate', 4, 0, 452),
(2540, 1, '公安体能测试：体能项目与训练方法', '3课时 | 公安招警', '介绍公安体能测试项目与训练方法。', 'article', 'basic', 3, 1, 834);

-- =============================================
-- 三百六十四、新增课程 - 银行考试专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2541, 1, '银行考试概述：国有银行与股份银行', '3课时 | 银行考试', '介绍银行考试的类型与各银行考试特点。', 'article', 'basic', 3, 1, 840),
(2542, 1, '银行行测备考：银行版EPI', '5课时 | 银行考试', '系统讲解银行招聘考试行测EPI备考方法。', 'article', 'intermediate', 5, 0, 841),
(2543, 1, '银行综合知识：经济金融与银行常识', '5课时 | 银行考试', '系统讲解银行招聘考试综合知识备考。', 'article', 'intermediate', 5, 0, 842),
(2544, 1, '银行英语备考：阅读与专业词汇', '4课时 | 银行考试', '系统讲解银行招聘考试英语科目备考。', 'article', 'intermediate', 4, 0, 843),
(2545, 716, '银行面试备考：半结构化与无领导', '4课时 | 银行考试', '针对银行面试半结构化与无领导小组讨论备考。', 'article', 'intermediate', 4, 0, 458);

-- =============================================
-- 三百六十五、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '言语理解总论：题型概述与备考策略',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍言语理解题型分布与备考策略，建立正确的学习方法论。'
WHERE `id` = 19;

UPDATE `what_courses` SET 
    `title` = '判断推理总论：题型特点与解题思维',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍判断推理题型特点与解题思维，掌握备考方向与方法。'
WHERE `id` = 20;

UPDATE `what_courses` SET 
    `title` = '图形推理总论：规律识别与技巧体系',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍图形推理的规律类型与技巧体系，建立系统学习框架。'
WHERE `id` = 21;

-- =============================================
-- 三百六十六、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习人际关系类面试题型，掌握与领导、同事、群众沟通协调的方法技巧。',
    `long_description` = '人际关系是结构化面试的情境型题型，主要考查考生的沟通协调与人际交往能力。本课程体系涵盖与领导相处（请示汇报、意见分歧）、与同事相处（工作配合、矛盾处理）、与群众相处（接待服务、矛盾化解），帮助考生展现情商与协调能力。'
WHERE `id` = 733;

UPDATE `what_course_categories` SET 
    `description` = '系统学习应急应变类面试题型，掌握突发事件、工作失误、舆情危机等处理方法。',
    `long_description` = '应急应变是结构化面试的实战型题型，主要考查考生的应变能力与问题解决能力。本课程体系涵盖突发事件处理（安全事故、群体事件）、工作失误应对（信息错误、流程问题）、舆情危机处理（网络舆情、媒体应对），帮助考生展现冷静从容的处事能力。'
WHERE `id` = 740;

UPDATE `what_course_categories` SET 
    `description` = '系统学习言语表达类面试题型，掌握演讲、情景模拟、现场讲解等表达技巧。',
    `long_description` = '言语表达是结构化面试的表达型题型，主要考查考生的语言表达与临场感染能力。本课程体系涵盖演讲类（主题演讲、即兴演讲）、情景模拟类（劝说、解释、道歉）、现场讲解类（政策宣讲、活动介绍），帮助考生展现生动有力的表达能力。'
WHERE `id` = 746;

UPDATE `what_course_categories` SET 
    `description` = '系统学习逻辑填空题型，掌握语境分析、词义辨析、关联词搭配等核心方法。',
    `long_description` = '逻辑填空是言语理解的核心题型，主要考查考生对语境的理解与词汇的准确把握。本课程体系涵盖语境分析（上下文逻辑关系、情感色彩倾向）、词义辨析（实词辨析、成语辨析）、关联词搭配（复句关系、逻辑衔接），帮助考生准确选择最佳词语。'
WHERE `id` = 547;

-- =============================================
-- 三百六十七、新增课程 - 国企考试专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2546, 1, '国企考试概述：央企与地方国企招聘', '3课时 | 国企考试', '介绍国企考试的类型与各类国企招聘特点。', 'article', 'basic', 3, 1, 850),
(2547, 1, '国企行测备考：职业能力测试', '5课时 | 国企考试', '系统讲解国企招聘考试职业能力测试备考。', 'article', 'intermediate', 5, 0, 851),
(2548, 1, '国企综合知识：企业文化与行业常识', '4课时 | 国企考试', '系统讲解国企招聘考试综合知识备考。', 'article', 'intermediate', 4, 0, 852),
(2549, 1, '国企申论备考：材料分析与写作', '4课时 | 国企考试', '系统讲解国企招聘考试申论材料分析与写作。', 'article', 'intermediate', 4, 0, 853),
(2550, 716, '国企面试备考：结构化与半结构化', '4课时 | 国企考试', '针对国企面试结构化与半结构化形式备考。', 'article', 'intermediate', 4, 0, 465);

-- =============================================
-- 三百六十八、新增课程 - 军队文职专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2551, 1, '军队文职考试概述：报考条件与考试内容', '3课时 | 军队文职', '介绍军队文职考试的报考条件与考试内容。', 'article', 'basic', 3, 1, 858),
(2552, 1, '军队文职公共科目：岗位能力测验', '5课时 | 军队文职', '系统讲解军队文职公共科目岗位能力测验备考。', 'article', 'intermediate', 5, 0, 859),
(2553, 1, '军队文职公共科目：公共知识', '5课时 | 军队文职', '系统讲解军队文职公共科目公共知识备考。', 'article', 'intermediate', 5, 0, 860),
(2554, 1, '军队文职专业科目：管理学类', '4课时 | 军队文职', '系统讲解军队文职管理学类专业科目备考。', 'article', 'intermediate', 4, 0, 861),
(2555, 1, '军队文职专业科目：法学类', '4课时 | 军队文职', '系统讲解军队文职法学类专业科目备考。', 'article', 'intermediate', 4, 0, 862),
(2556, 716, '军队文职面试备考：考查特点与答题技巧', '4课时 | 军队文职', '针对军队文职面试特点与答题技巧备考。', 'article', 'intermediate', 4, 0, 472);

-- =============================================
-- 三百六十九、新增课程 - 教师招聘专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2557, 1, '教师招聘考试概述：编制与非编制区别', '3课时 | 教师招聘', '介绍教师招聘考试的类型与编制区别。', 'article', 'basic', 3, 1, 868),
(2558, 1, '教育综合知识：教育学心理学', '6课时 | 教师招聘', '系统讲解教师招聘考试教育综合知识备考。', 'article', 'intermediate', 6, 0, 869),
(2559, 1, '教师职业道德与法规：教育法律法规', '4课时 | 教师招聘', '系统讲解教师职业道德与教育法律法规。', 'article', 'intermediate', 4, 0, 870),
(2560, 1, '教师招聘公共基础：综合素质测试', '4课时 | 教师招聘', '系统讲解教师招聘公共基础知识备考。', 'article', 'intermediate', 4, 0, 871),
(2561, 716, '教师招聘面试备考：试讲与说课技巧', '5课时 | 教师招聘', '针对教师招聘面试试讲与说课技巧备考。', 'article', 'intermediate', 5, 0, 478);

-- =============================================
-- 三百七十、新增课程 - 三支一扶专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2562, 1, '三支一扶考试概述：政策解读与报考指南', '3课时 | 三支一扶', '介绍三支一扶考试的政策与报考条件。', 'article', 'basic', 3, 1, 878),
(2563, 1, '三支一扶行测备考：职业能力测试', '4课时 | 三支一扶', '系统讲解三支一扶考试行测备考方法。', 'article', 'intermediate', 4, 0, 879),
(2564, 1, '三支一扶综合知识：农业农村知识', '4课时 | 三支一扶', '系统讲解三支一扶考试农业农村知识备考。', 'article', 'intermediate', 4, 0, 880),
(2565, 624, '三支一扶申论备考：基层工作主题', '4课时 | 三支一扶', '针对三支一扶考试申论基层工作主题备考。', 'article', 'intermediate', 4, 0, 390),
(2566, 716, '三支一扶面试备考：基层服务场景', '4课时 | 三支一扶', '针对三支一扶面试基层服务场景题备考。', 'article', 'intermediate', 4, 0, 485);

-- =============================================
-- 三百七十一、新增课程 - 社区工作者专题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2567, 1, '社区工作者考试概述：岗位职责与考试内容', '3课时 | 社区工作者', '介绍社区工作者的岗位职责与考试内容。', 'article', 'basic', 3, 1, 888),
(2568, 1, '社区工作者综合知识：社区治理与服务', '4课时 | 社区工作者', '系统讲解社区工作者考试社区治理知识备考。', 'article', 'intermediate', 4, 0, 889),
(2569, 1, '社区工作者公共基础：基层工作常识', '4课时 | 社区工作者', '系统讲解社区工作者公共基础知识备考。', 'article', 'intermediate', 4, 0, 890),
(2570, 716, '社区工作者面试备考：社区服务场景', '4课时 | 社区工作者', '针对社区工作者面试社区服务场景题备考。', 'article', 'intermediate', 4, 0, 492);

-- =============================================
-- 三百七十二、新增课程 - 言语理解经典真题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2571, 547, '逻辑填空经典真题100道：高频考点覆盖', '8课时 | 经典真题', '精选逻辑填空经典真题100道，覆盖高频考点。', 'article', 'intermediate', 8, 0, 82),
(2572, 551, '片段阅读经典真题80道：各类题型汇总', '6课时 | 经典真题', '精选片段阅读经典真题80道，汇总各类题型。', 'article', 'intermediate', 6, 0, 128),
(2573, 555, '语句表达经典真题50道：排序与衔接', '4课时 | 经典真题', '精选语句表达经典真题50道，涵盖排序与衔接。', 'article', 'intermediate', 4, 0, 65),
(2574, 546, '言语理解难题精选30道：突破高难度', '3课时 | 经典真题', '精选言语理解高难度真题30道，突破瓶颈。', 'article', 'advanced', 3, 0, 182);

-- =============================================
-- 三百七十三、新增课程 - 数量关系经典真题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2575, 560, '数学运算经典真题100道：核心题型精讲', '8课时 | 经典真题', '精选数学运算经典真题100道，精讲核心题型。', 'article', 'intermediate', 8, 0, 158),
(2576, 569, '数字推理经典真题50道：规律识别训练', '4课时 | 经典真题', '精选数字推理经典真题50道，训练规律识别。', 'article', 'intermediate', 4, 0, 62),
(2577, 560, '数量关系难题精选30道：突破高难度', '3课时 | 经典真题', '精选数量关系高难度真题30道，突破瓶颈。', 'article', 'advanced', 3, 0, 162),
(2578, 559, '数量关系必会50题：基础题型巩固', '4课时 | 经典真题', '精选数量关系必会基础真题50道，巩固基础。', 'article', 'basic', 4, 1, 178);

-- =============================================
-- 三百七十四、新增课程 - 判断推理经典真题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2579, 574, '图形推理经典真题80道：规律类型全覆盖', '6课时 | 经典真题', '精选图形推理经典真题80道，覆盖各类规律。', 'article', 'intermediate', 6, 0, 102),
(2580, 580, '定义判断经典真题60道：各领域定义', '5课时 | 经典真题', '精选定义判断经典真题60道，涵盖各领域定义。', 'article', 'intermediate', 5, 0, 55),
(2581, 583, '类比推理经典真题60道：关系类型训练', '4课时 | 经典真题', '精选类比推理经典真题60道，训练关系识别。', 'article', 'intermediate', 4, 0, 62),
(2582, 587, '逻辑判断经典真题80道：推理方法精讲', '6课时 | 经典真题', '精选逻辑判断经典真题80道，精讲推理方法。', 'article', 'intermediate', 6, 0, 138),
(2583, 573, '判断推理难题精选40道：突破高难度', '4课时 | 经典真题', '精选判断推理高难度真题40道，突破瓶颈。', 'article', 'advanced', 4, 0, 178);

-- =============================================
-- 三百七十五、新增课程 - 资料分析经典真题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2584, 593, '资料分析经典真题100道：各类材料精讲', '8课时 | 经典真题', '精选资料分析经典真题100道，精讲各类材料。', 'article', 'intermediate', 8, 0, 135),
(2585, 598, '速算技巧真题演练50道：计算方法应用', '4课时 | 经典真题', '精选资料分析速算真题50道，演练计算方法。', 'article', 'intermediate', 4, 0, 85),
(2586, 593, '资料分析难题精选30道：突破高难度', '3课时 | 经典真题', '精选资料分析高难度真题30道，突破瓶颈。', 'article', 'advanced', 3, 0, 138),
(2587, 592, '资料分析必会50题：基础题型巩固', '4课时 | 经典真题', '精选资料分析必会基础真题50道，巩固基础。', 'article', 'basic', 4, 1, 168);

-- =============================================
-- 三百七十六、新增课程 - 申论经典真题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2588, 627, '归纳概括经典真题20道：要点提取训练', '4课时 | 经典真题', '精选归纳概括经典真题20道，训练要点提取。', 'article', 'intermediate', 4, 0, 72),
(2589, 631, '提出对策经典真题15道：对策撰写训练', '3课时 | 经典真题', '精选提出对策经典真题15道，训练对策撰写。', 'article', 'intermediate', 3, 0, 72),
(2590, 635, '综合分析经典真题15道：分析思维训练', '3课时 | 经典真题', '精选综合分析经典真题15道，训练分析思维。', 'article', 'intermediate', 3, 0, 72),
(2591, 640, '贯彻执行经典真题20道：文种写作训练', '4课时 | 经典真题', '精选贯彻执行经典真题20道，训练文种写作。', 'article', 'intermediate', 4, 0, 78),
(2592, 651, '大作文经典真题10道：写作思路精讲', '5课时 | 经典真题', '精选大作文经典真题10道，精讲写作思路。', 'article', 'intermediate', 5, 0, 145);

-- =============================================
-- 三百七十七、新增课程 - 面试经典真题系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2593, 719, '综合分析经典真题30道：分析框架演练', '5课时 | 经典真题', '精选综合分析经典真题30道，演练分析框架。', 'article', 'intermediate', 5, 0, 158),
(2594, 725, '组织计划经典真题25道：策划能力训练', '4课时 | 经典真题', '精选组织计划经典真题25道，训练策划能力。', 'article', 'intermediate', 4, 0, 95),
(2595, 733, '人际关系经典真题25道：沟通技巧演练', '4课时 | 经典真题', '精选人际关系经典真题25道，演练沟通技巧。', 'article', 'intermediate', 4, 0, 95),
(2596, 740, '应急应变经典真题25道：应变能力训练', '4课时 | 经典真题', '精选应急应变经典真题25道，训练应变能力。', 'article', 'intermediate', 4, 0, 95),
(2597, 746, '言语表达经典真题20道：表达能力演练', '4课时 | 经典真题', '精选言语表达经典真题20道，演练表达能力。', 'article', 'intermediate', 4, 0, 95);

-- =============================================
-- 三百七十八、新增课程 - 行测易错知识点系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2598, 547, '逻辑填空易错词汇50组：辨析与记忆', '4课时 | 易错知识点', '汇总逻辑填空易错词汇50组，详细辨析与记忆。', 'article', 'intermediate', 4, 0, 88),
(2599, 551, '片段阅读易错考点：选项陷阱识别', '3课时 | 易错知识点', '汇总片段阅读易错考点，识别选项陷阱。', 'article', 'intermediate', 3, 0, 132),
(2600, 560, '数学运算易错公式：正确理解与应用', '3课时 | 易错知识点', '汇总数学运算易错公式，强调正确理解与应用。', 'article', 'intermediate', 3, 0, 168),
(2601, 574, '图形推理易错规律：常见误判分析', '3课时 | 易错知识点', '汇总图形推理易错规律，分析常见误判原因。', 'article', 'intermediate', 3, 0, 108),
(2602, 587, '逻辑判断易错推理：推理陷阱识别', '3课时 | 易错知识点', '汇总逻辑判断易错推理，识别推理陷阱。', 'article', 'intermediate', 3, 0, 145),
(2603, 593, '资料分析易错计算：陷阱题型解析', '3课时 | 易错知识点', '汇总资料分析易错计算，解析陷阱题型。', 'article', 'intermediate', 3, 0, 142);

-- =============================================
-- 三百七十九、新增课程 - 申论高分范文赏析系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2604, 651, '国考高分范文赏析（一）：副省级真题', '5课时 | 范文赏析', '赏析国考副省级申论高分范文，学习写作技巧。', 'article', 'advanced', 5, 0, 150),
(2605, 651, '国考高分范文赏析（二）：地市级真题', '5课时 | 范文赏析', '赏析国考地市级申论高分范文，学习写作技巧。', 'article', 'intermediate', 5, 0, 151),
(2606, 651, '省考高分范文赏析（一）：A卷真题', '5课时 | 范文赏析', '赏析省考A卷申论高分范文，学习写作技巧。', 'article', 'intermediate', 5, 0, 152),
(2607, 651, '省考高分范文赏析（二）：B卷真题', '5课时 | 范文赏析', '赏析省考B卷申论高分范文，学习写作技巧。', 'article', 'intermediate', 5, 0, 153),
(2608, 651, '申论满分作文解密：满分作文的特点', '4课时 | 范文赏析', '解密申论满分作文的特点与写作方法。', 'article', 'advanced', 4, 0, 154);

-- =============================================
-- 三百八十、新增课程 - 面试高分答案示范系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2609, 719, '综合分析高分答案示范：思维深度展现', '4课时 | 高分示范', '示范综合分析题高分答案，展现思维深度。', 'article', 'advanced', 4, 0, 165),
(2610, 725, '组织计划高分答案示范：细致周全展现', '4课时 | 高分示范', '示范组织计划题高分答案，展现细致周全。', 'article', 'advanced', 4, 0, 102),
(2611, 733, '人际关系高分答案示范：情商智慧展现', '4课时 | 高分示范', '示范人际关系题高分答案，展现情商智慧。', 'article', 'advanced', 4, 0, 102),
(2612, 740, '应急应变高分答案示范：冷静从容展现', '4课时 | 高分示范', '示范应急应变题高分答案，展现冷静从容。', 'article', 'advanced', 4, 0, 102),
(2613, 716, '面试90分答案解密：高分答案的共性', '4课时 | 高分示范', '解密面试90分答案的共性与高分技巧。', 'article', 'advanced', 4, 0, 502);

-- =============================================
-- 三百八十一、新增课程 - 学霸备考经验系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2614, 1, '行测85+学霸经验：高分备考方法分享', '3课时 | 学霸经验', '分享行测85分以上学霸的备考方法与心得。', 'article', 'intermediate', 3, 0, 900),
(2615, 624, '申论75+学霸经验：高分写作方法分享', '3课时 | 学霸经验', '分享申论75分以上学霸的写作方法与心得。', 'article', 'intermediate', 3, 0, 395),
(2616, 716, '面试90+学霸经验：高分表现方法分享', '3课时 | 学霸经验', '分享面试90分以上学霸的表现方法与心得。', 'article', 'intermediate', 3, 0, 508),
(2617, 1, '笔试第一名经验分享：全科高分秘诀', '3课时 | 学霸经验', '分享笔试第一名的全科高分备考秘诀。', 'article', 'intermediate', 3, 0, 901),
(2618, 1, '逆袭上岸经验分享：从落榜到成功', '3课时 | 学霸经验', '分享逆袭上岸考生的经验与心路历程。', 'article', 'basic', 3, 1, 902);

-- =============================================
-- 三百八十二、新增课程 - 考前心理辅导系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2619, 1, '考前焦虑缓解：科学应对考试焦虑', '2课时 | 心理辅导', '讲解科学缓解考前焦虑的方法与技巧。', 'article', 'basic', 2, 1, 908),
(2620, 1, '考前自信建立：相信自己的实力', '2课时 | 心理辅导', '帮助考生建立考前自信，相信自己的实力。', 'article', 'basic', 2, 1, 909),
(2621, 1, '考前压力释放：有效减压方法', '2课时 | 心理辅导', '讲解考前有效释放压力的方法与技巧。', 'article', 'basic', 2, 1, 910),
(2622, 1, '考试心态调控：保持平稳心态', '2课时 | 心理辅导', '讲解考试中保持平稳心态的方法与技巧。', 'article', 'basic', 2, 1, 911),
(2623, 716, '面试紧张克服：从容面对考官', '2课时 | 心理辅导', '讲解面试紧张情绪的克服方法与技巧。', 'article', 'basic', 2, 1, 515);

-- =============================================
-- 三百八十三、新增课程 - 面试形象设计系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2624, 716, '男士面试着装指南：正装搭配与选择', '2课时 | 形象设计', '提供男士面试正装的搭配指南与选择建议。', 'article', 'basic', 2, 1, 520),
(2625, 716, '女士面试着装指南：职业装搭配与选择', '2课时 | 形象设计', '提供女士面试职业装的搭配指南与选择建议。', 'article', 'basic', 2, 1, 521),
(2626, 716, '面试发型设计：干练整洁的形象打造', '1课时 | 形象设计', '提供面试发型设计建议，打造干练整洁形象。', 'article', 'basic', 1, 1, 522),
(2627, 716, '面试妆容指南：自然得体的妆容建议', '1课时 | 形象设计', '提供面试妆容指南，打造自然得体的妆容。', 'article', 'basic', 1, 1, 523),
(2628, 716, '面试第一印象：进场与问好的细节', '2课时 | 形象设计', '讲解面试进场与问好的细节，打造良好第一印象。', 'article', 'basic', 2, 1, 524);

-- =============================================
-- 三百八十四、新增课程 - 常识判断速记系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2629, 608, '政治常识速记：核心考点快速记忆', '3课时 | 常识速记', '政治常识核心考点的快速记忆方法与口诀。', 'article', 'basic', 3, 1, 85),
(2630, 612, '法律常识速记：重点法条快速记忆', '3课时 | 常识速记', '法律常识重点法条的快速记忆方法与口诀。', 'article', 'basic', 3, 1, 92),
(2631, 615, '历史常识速记：重要事件快速记忆', '3课时 | 常识速记', '历史常识重要事件的快速记忆方法与口诀。', 'article', 'basic', 3, 1, 68),
(2632, 617, '科技常识速记：科技成就快速记忆', '3课时 | 常识速记', '科技常识重要成就的快速记忆方法与口诀。', 'article', 'basic', 3, 1, 95),
(2633, 619, '地理常识速记：地理知识快速记忆', '3课时 | 常识速记', '地理常识核心知识的快速记忆方法与口诀。', 'article', 'basic', 3, 1, 42),
(2634, 606, '常识判断口诀大全：记忆技巧汇总', '4课时 | 常识速记', '汇总常识判断各模块的记忆口诀与技巧。', 'article', 'basic', 4, 1, 102);

-- =============================================
-- 三百八十五、新增课程 - 申论金句背诵系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2635, 651, '申论开头金句50句：精彩开头必备', '3课时 | 金句背诵', '汇总申论大作文开头金句50句，背诵积累。', 'article', 'intermediate', 3, 0, 162),
(2636, 651, '申论结尾金句30句：有力结尾必备', '2课时 | 金句背诵', '汇总申论大作文结尾金句30句，背诵积累。', 'article', 'intermediate', 2, 0, 163),
(2637, 651, '申论论证金句50句：充实论证必备', '3课时 | 金句背诵', '汇总申论大作文论证金句50句，背诵积累。', 'article', 'intermediate', 3, 0, 164),
(2638, 651, '申论主题金句分类：各主题通用表述', '4课时 | 金句背诵', '分类汇总申论各主题的通用金句表述。', 'article', 'intermediate', 4, 0, 165),
(2639, 651, '习近平重要论述精选：申论必背语录', '4课时 | 金句背诵', '精选习近平重要论述，申论写作必背语录。', 'article', 'intermediate', 4, 0, 166);

-- =============================================
-- 三百八十六、新增课程 - 面试万能句式系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2640, 719, '综合分析万能句式：分析表达通用语', '3课时 | 万能句式', '汇总综合分析题的万能句式与通用表达。', 'article', 'basic', 3, 1, 172),
(2641, 725, '组织计划万能句式：策划表达通用语', '3课时 | 万能句式', '汇总组织计划题的万能句式与通用表达。', 'article', 'basic', 3, 1, 108),
(2642, 733, '人际关系万能句式：沟通表达通用语', '3课时 | 万能句式', '汇总人际关系题的万能句式与通用表达。', 'article', 'basic', 3, 1, 108),
(2643, 740, '应急应变万能句式：处置表达通用语', '3课时 | 万能句式', '汇总应急应变题的万能句式与通用表达。', 'article', 'basic', 3, 1, 108),
(2644, 716, '面试过渡语汇总：自然衔接的表达', '2课时 | 万能句式', '汇总面试答题的过渡语，实现自然衔接。', 'article', 'basic', 2, 1, 532);

-- =============================================
-- 三百八十七、新增课程 - 行测计算公式系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2645, 560, '数学运算核心公式：必背公式汇总', '4课时 | 计算公式', '汇总数学运算核心公式，必背公式大全。', 'article', 'basic', 4, 1, 175),
(2646, 560, '工程问题公式：效率与时间关系', '2课时 | 计算公式', '汇总工程问题的核心公式与应用方法。', 'article', 'basic', 2, 1, 176),
(2647, 560, '行程问题公式：速度、时间、路程', '2课时 | 计算公式', '汇总行程问题的核心公式与应用方法。', 'article', 'basic', 2, 1, 177),
(2648, 560, '利润问题公式：成本、售价、利润率', '2课时 | 计算公式', '汇总利润问题的核心公式与应用方法。', 'article', 'basic', 2, 1, 178),
(2649, 560, '排列组合公式：计数原理与公式', '2课时 | 计算公式', '汇总排列组合的核心公式与应用方法。', 'article', 'basic', 2, 1, 179);

-- =============================================
-- 三百八十八、新增课程 - 资料分析公式系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2650, 593, '资料分析核心公式：增长率与比重', '4课时 | 资料公式', '汇总资料分析增长率与比重的核心公式。', 'article', 'basic', 4, 1, 148),
(2651, 593, '基期与现期公式：时期数据计算', '3课时 | 资料公式', '汇总基期与现期计算的核心公式与方法。', 'article', 'basic', 3, 1, 149),
(2652, 593, '倍数与比值公式：数据比较计算', '3课时 | 资料公式', '汇总倍数与比值计算的核心公式与方法。', 'article', 'basic', 3, 1, 150),
(2653, 598, '速算公式与技巧：截位、估算方法', '4课时 | 资料公式', '汇总资料分析速算的核心公式与技巧。', 'article', 'intermediate', 4, 0, 92);

-- =============================================
-- 三百八十九、新增课程 - 逻辑推理公式系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2654, 587, '命题逻辑公式：假言、联言、选言', '4课时 | 逻辑公式', '汇总命题逻辑的核心公式与推理规则。', 'article', 'intermediate', 4, 0, 152),
(2655, 587, '三段论推理规则：标准形式与变形', '3课时 | 逻辑公式', '汇总三段论的标准形式与推理规则。', 'article', 'intermediate', 3, 0, 153),
(2656, 587, '加强削弱判断公式：论证关系分析', '3课时 | 逻辑公式', '汇总加强削弱判断的分析公式与方法。', 'article', 'intermediate', 3, 0, 154),
(2657, 587, '逻辑判断速解口诀：快速解题技巧', '3课时 | 逻辑公式', '汇总逻辑判断的速解口诀与快速技巧。', 'article', 'intermediate', 3, 0, 155);

-- =============================================
-- 三百九十、新增课程 - 图形推理规律表系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2658, 574, '图形推理规律速查表：各类规律汇总', '4课时 | 规律速查', '汇总图形推理各类规律的速查表与识别方法。', 'article', 'basic', 4, 1, 115),
(2659, 574, '位置规律速记：平移、旋转、翻转', '2课时 | 规律速查', '速记图形推理位置规律的识别口诀。', 'article', 'basic', 2, 1, 116),
(2660, 574, '样式规律速记：遍历、叠加、去同存异', '2课时 | 规律速查', '速记图形推理样式规律的识别口诀。', 'article', 'basic', 2, 1, 117),
(2661, 574, '数量规律速记：点线面角计数', '2课时 | 规律速查', '速记图形推理数量规律的识别口诀。', 'article', 'basic', 2, 1, 118),
(2662, 574, '属性规律速记：对称、封闭、曲直', '2课时 | 规律速查', '速记图形推理属性规律的识别口诀。', 'article', 'basic', 2, 1, 119);

-- =============================================
-- 三百九十一、新增课程 - 成语辨析速记系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2663, 547, '高频成语辨析速记（一）：50组必考成语', '4课时 | 成语速记', '速记高频必考成语50组，掌握辨析技巧。', 'article', 'intermediate', 4, 0, 95),
(2664, 547, '高频成语辨析速记（二）：50组常考成语', '4课时 | 成语速记', '速记高频常考成语50组，掌握辨析技巧。', 'article', 'intermediate', 4, 0, 96),
(2665, 547, '易混成语辨析：形近义近成语区分', '3课时 | 成语速记', '辨析形近义近的易混成语，精准区分。', 'article', 'intermediate', 3, 0, 97),
(2666, 547, '成语使用误区：常见错误用法纠正', '3课时 | 成语速记', '纠正成语常见错误用法，避免使用误区。', 'article', 'intermediate', 3, 0, 98);

-- =============================================
-- 三百九十二、新增课程 - 高频词汇速记系列
-- =============================================

REPLACE INTO `what_courses` (`id`, `category_id`, `title`, `subtitle`, `description`, `content_type`, `difficulty`, `chapter_count`, `is_free`, `sort_order`) VALUES
(2667, 547, '高频实词速记100组：核心实词积累', '5课时 | 词汇速记', '速记高频实词100组，积累核心词汇。', 'article', 'intermediate', 5, 0, 102),
(2668, 547, '高频虚词速记50组：虚词搭配规律', '3课时 | 词汇速记', '速记高频虚词50组，掌握搭配规律。', 'article', 'intermediate', 3, 0, 103),
(2669, 547, '关联词搭配速记：复句关系判断', '3课时 | 词汇速记', '速记关联词搭配规则，快速判断复句关系。', 'article', 'basic', 3, 1, 104),
(2670, 546, '言语理解词汇速记卡：随时随地背诵', '4课时 | 词汇速记', '提供言语理解词汇速记卡，方便随时背诵。', 'article', 'basic', 4, 1, 192);

-- =============================================
-- 三百九十三、更新更多课程内容优化
-- =============================================

UPDATE `what_courses` SET 
    `title` = '逻辑填空总论：语境分析与词义辨析',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍逻辑填空的解题思路与核心方法，包括语境分析与词义辨析。'
WHERE `id` = 22;

UPDATE `what_courses` SET 
    `title` = '片段阅读总论：阅读方法与题型分类',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍片段阅读的阅读方法与题型分类，建立系统答题框架。'
WHERE `id` = 23;

UPDATE `what_courses` SET 
    `title` = '定义判断总论：定义理解与要素匹配',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍定义判断的解题思路与核心方法，包括定义理解与要素匹配。'
WHERE `id` = 24;

UPDATE `what_courses` SET 
    `title` = '类比推理总论：关系类型与快速识别',
    `subtitle` = '2课时 | 总论导学',
    `description` = '全面介绍类比推理的关系类型与快速识别方法，建立答题框架。'
WHERE `id` = 25;

-- =============================================
-- 三百九十四、更新更多课程分类描述
-- =============================================

UPDATE `what_course_categories` SET 
    `description` = '系统学习片段阅读题型，掌握主旨概括、意图判断、细节判断、标题选择等核心方法。',
    `long_description` = '片段阅读是言语理解的核心题型，主要考查考生对文段的理解与分析能力。本课程体系涵盖主旨概括（中心句定位、归纳概括）、意图判断（作者态度、言外之意）、细节判断（信息匹配、选项辨析）、标题选择（主旨提炼、标题特点），帮助考生准确把握文段核心。'
WHERE `id` = 551;

UPDATE `what_course_categories` SET 
    `description` = '系统学习语句表达题型，掌握语句排序、语句衔接、下文推断等核心方法。',
    `long_description` = '语句表达是言语理解的特色题型，主要考查考生对语句逻辑关系的理解能力。本课程体系涵盖语句排序（首尾句特征、逻辑关系、关联词衔接）、语句衔接（话题一致、逻辑连贯）、下文推断（尾句分析、内容预测），帮助考生理顺语句逻辑关系。'
WHERE `id` = 555;

UPDATE `what_course_categories` SET 
    `description` = '系统学习数学运算题型，掌握方程法、比例法、特值法等核心解题方法。',
    `long_description` = '数学运算是数量关系的核心题型，主要考查考生的数学思维与计算能力。本课程体系涵盖基础解题方法（方程法、比例法、特值法、代入排除法）、核心题型（工程问题、行程问题、利润问题、排列组合、概率问题），帮助考生快速准确解题。'
WHERE `id` = 560;

UPDATE `what_course_categories` SET 
    `description` = '系统学习常识判断各模块，掌握政治、法律、历史、科技、地理等核心知识。',
    `long_description` = '常识判断是行测的综合性题型，主要考查考生的知识储备与综合素质。本课程体系涵盖政治常识（马克思主义、中特理论、时政热点）、法律常识（宪法、民法、刑法、行政法）、历史常识（中国史、世界史）、科技常识（科技成就、生活科学）、地理常识（自然地理、人文地理），帮助考生构建完整知识体系。'
WHERE `id` = 606;

-- =============================================
-- 结束
-- =============================================

-- 提示：以上SQL语句用于更新现有课程的标题、副标题和描述，以及新增课程
-- 执行前请确保数据库备份
-- 可根据实际需求调整课程ID与对应内容
-- 本次更新新增课程系列（第127-394系列）共计约1820门课程内容
-- 包含：
--   基础理论课程、真题解析、专项突破、冲刺复习、技巧汇总、
--   各系统面试、各省考情、热门主题深度、易错点汇总、话题素材、
--   职业发展、基层实务、机关适应、时评阅读、热点月报、模考讲评、
--   报名指导、成绩查询、体能测试、心理测评、法律实务、执法专题、
--   公文实务、调研报告、讲话撰写、政务信息、语言表达、思维训练、
--   审题技巧、答案组织、读题技巧、选项分析、秒杀技巧、时间管理、
--   蒙题技巧、涂卡技巧、真题汇编、常识专题、高分范文、答题示范、
--   错题精讲、图形规律专题、逻辑专题深化、资料题型专题、报考政策、
--   学历备考、心理建设、资料选择、APP工具、字迹练习、仪态训练、
--   录音复盘、分数段提升、成绩计算、体检标准、政审流程、公示录用、
--   入职指南、模块分析、题型分析、评分细则、大纲解读、考情统计、
--   高频考点、题型专项、分模块学习、材料阅读、模拟练习、时间规划、
--   在职备考、应届备考、多次备考、备考误区、高频错题、高频扣分点、
--   高频失误、笔记方法、错题本、考前冲刺、考前准备、考场调节、
--   待遇分析、晋升空间、择岗策略、技巧进阶、公基政治、公基法律、
--   公基经济、公基管理、公基公文、公基科技人文、模块突破、题型突破、
--   年度对比、命题趋势、答题模板、素材积累、热点专题、政策解读、
--   时政月报、热点预测、全真模拟、省考真题、部委专题、乡镇专题、
--   选调生专题、事业单位专题、公安招警专题、银行考试专题、国企考试、
--   军队文职、教师招聘、三支一扶、社区工作者、经典真题、易错知识点、
--   高分范文赏析、高分答案示范、学霸经验、心理辅导、形象设计、
--   常识速记、金句背诵、万能句式、计算公式、逻辑公式、规律速查、
--   成语速记、词汇速记等
-- 课程总数：约1820门课程内容
