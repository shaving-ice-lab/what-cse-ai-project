export interface MajorCategory {
  code: string;
  name: string;
  majors: Major[];
}

export interface Major {
  code: string;
  name: string;
  category: string;
}

export const majorCategories: MajorCategory[] = [
  {
    code: "01",
    name: "哲学",
    majors: [
      { code: "0101", name: "哲学", category: "哲学" },
      { code: "0102", name: "逻辑学", category: "哲学" },
      { code: "0103", name: "宗教学", category: "哲学" },
    ],
  },
  {
    code: "02",
    name: "经济学",
    majors: [
      { code: "0201", name: "经济学", category: "经济学" },
      { code: "0202", name: "金融学", category: "经济学" },
      { code: "0203", name: "财政学", category: "经济学" },
      { code: "0204", name: "国际经济与贸易", category: "经济学" },
      { code: "0205", name: "统计学", category: "经济学" },
    ],
  },
  {
    code: "03",
    name: "法学",
    majors: [
      { code: "0301", name: "法学", category: "法学" },
      { code: "0302", name: "政治学", category: "法学" },
      { code: "0303", name: "社会学", category: "法学" },
      { code: "0304", name: "马克思主义理论", category: "法学" },
    ],
  },
  {
    code: "04",
    name: "教育学",
    majors: [
      { code: "0401", name: "教育学", category: "教育学" },
      { code: "0402", name: "心理学", category: "教育学" },
      { code: "0403", name: "体育学", category: "教育学" },
    ],
  },
  {
    code: "05",
    name: "文学",
    majors: [
      { code: "0501", name: "中国语言文学", category: "文学" },
      { code: "0502", name: "外国语言文学", category: "文学" },
      { code: "0503", name: "新闻传播学", category: "文学" },
    ],
  },
  {
    code: "07",
    name: "理学",
    majors: [
      { code: "0701", name: "数学", category: "理学" },
      { code: "0702", name: "物理学", category: "理学" },
      { code: "0703", name: "化学", category: "理学" },
      { code: "0710", name: "生物学", category: "理学" },
      { code: "0714", name: "统计学", category: "理学" },
    ],
  },
  {
    code: "08",
    name: "工学",
    majors: [
      { code: "0801", name: "计算机科学与技术", category: "工学" },
      { code: "0802", name: "软件工程", category: "工学" },
      { code: "0803", name: "电子信息工程", category: "工学" },
      { code: "0804", name: "通信工程", category: "工学" },
      { code: "0810", name: "土木工程", category: "工学" },
    ],
  },
  {
    code: "12",
    name: "管理学",
    majors: [
      { code: "1201", name: "管理科学与工程", category: "管理学" },
      { code: "1202", name: "工商管理", category: "管理学" },
      { code: "1203", name: "会计学", category: "管理学" },
      { code: "1204", name: "公共管理", category: "管理学" },
      { code: "1205", name: "行政管理", category: "管理学" },
    ],
  },
];

export const majorUtils = {
  getMajorByCode: (code: string): Major | undefined => {
    for (const category of majorCategories) {
      const major = category.majors.find((m) => m.code === code);
      if (major) return major;
    }
    return undefined;
  },

  getMajorByName: (name: string): Major | undefined => {
    for (const category of majorCategories) {
      const major = category.majors.find((m) => m.name === name || m.name.includes(name));
      if (major) return major;
    }
    return undefined;
  },

  getCategoryByCode: (code: string): MajorCategory | undefined => {
    return majorCategories.find((c) => c.code === code);
  },

  getAllMajors: (): Major[] => {
    return majorCategories.flatMap((c) => c.majors);
  },

  searchMajors: (keyword: string): Major[] => {
    const allMajors = majorUtils.getAllMajors();
    return allMajors.filter((m) => m.name.includes(keyword) || m.category.includes(keyword));
  },

  matchMajorRequirement: (userMajor: string, requirement: string): boolean => {
    if (!requirement || requirement === "不限") return true;
    if (requirement.includes(userMajor)) return true;

    const userMajorObj = majorUtils.getMajorByName(userMajor);
    if (!userMajorObj) return false;

    if (requirement.includes(userMajorObj.category)) return true;

    return false;
  },
};
