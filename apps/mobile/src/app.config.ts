export default defineAppConfig({
  pages: ["pages/index/index", "pages/positions/index", "pages/match/index", "pages/user/index"],
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
        pagePath: "pages/positions/index",
        text: "职位",
        iconPath: "assets/tabbar/position.png",
        selectedIconPath: "assets/tabbar/position-active.png",
      },
      {
        pagePath: "pages/match/index",
        text: "匹配",
        iconPath: "assets/tabbar/match.png",
        selectedIconPath: "assets/tabbar/match-active.png",
      },
      {
        pagePath: "pages/user/index",
        text: "我的",
        iconPath: "assets/tabbar/user.png",
        selectedIconPath: "assets/tabbar/user-active.png",
      },
    ],
  },
});
