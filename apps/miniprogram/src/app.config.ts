export default defineAppConfig({
  pages: ["pages/index/index", "pages/user/index", "pages/user/login", "pages/user/profile"],
  subpackages: [
    {
      root: "subpackages/positions",
      pages: ["index", "search", "filter", "detail"],
    },
    {
      root: "subpackages/match",
      pages: ["index", "report"],
    },
    {
      root: "subpackages/announcements",
      pages: ["index", "detail"],
    },
  ],
  preloadRule: {
    "pages/index/index": {
      network: "all",
      packages: ["subpackages/positions", "subpackages/announcements"],
    },
    "pages/user/index": {
      network: "all",
      packages: ["subpackages/match"],
    },
    "subpackages/positions/index": {
      network: "wifi",
      packages: ["subpackages/match"],
    },
    "subpackages/match/index": {
      network: "wifi",
      packages: ["subpackages/positions"],
    },
  },
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "公考智能筛选",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#999",
    selectedColor: "#1890ff",
    backgroundColor: "#fff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "assets/tabbar/home.png",
        selectedIconPath: "assets/tabbar/home-active.png",
      },
      {
        pagePath: "pages/user/index",
        text: "我的",
        iconPath: "assets/tabbar/user.png",
        selectedIconPath: "assets/tabbar/user-active.png",
      },
    ],
  },
  lazyCodeLoading: "requiredComponents",
});
