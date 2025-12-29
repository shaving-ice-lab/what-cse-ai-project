import { View, Text, ScrollView } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import "./privacy.scss";

export default function Privacy() {
  useLoad(() => {
    console.log("Privacy page loaded");
  });

  return (
    <ScrollView className="privacy-page" scrollY>
      <View className="privacy-container">
        <View className="privacy-header">
          <Text className="privacy-title">隐私政策</Text>
          <Text className="privacy-update">更新日期：2024年12月29日</Text>
          <Text className="privacy-effective">生效日期：2024年12月29日</Text>
        </View>

        <View className="privacy-content">
          <View className="section">
            <Text className="section-title">引言</Text>
            <Text className="section-text">
              公考职位智能筛选系统（以下简称"我们"）非常重视用户的隐私和个人信息保护。
              本隐私政策适用于我们提供的所有服务，包括但不限于网站、移动应用程序、微信小程序等。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">一、我们收集的信息</Text>
            <Text className="section-text">
              1. 注册信息：手机号码、邮箱地址、昵称等；{"\n"}
              2. 个人简历信息：学历、专业、户籍、工作经历等（用于职位匹配）；{"\n"}
              3. 设备信息：设备标识符、操作系统版本等；{"\n"}
              4. 日志信息：IP地址、访问时间、浏览记录等；{"\n"}
              5. 位置信息：仅在您授权后收集，用于推荐附近职位。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">二、信息使用目的</Text>
            <Text className="section-text">
              1. 提供职位筛选和智能匹配服务；{"\n"}
              2. 发送职位推荐、报名提醒等通知；{"\n"}
              3. 改进和优化我们的服务；{"\n"}
              4. 保障账户安全；{"\n"}
              5. 履行法律法规规定的义务。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">三、信息共享</Text>
            <Text className="section-text">
              我们不会将您的个人信息出售给任何第三方。仅在以下情况下可能共享：{"\n"}
              1. 获得您的明确同意；{"\n"}
              2. 法律法规要求或政府机关依法要求；{"\n"}
              3. 与关联公司共享（受同等隐私保护约束）。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">四、信息存储与保护</Text>
            <Text className="section-text">
              1. 您的信息存储于中国境内的服务器；{"\n"}
              2. 我们采用加密技术保护您的数据；{"\n"}
              3. 建立严格的访问权限管理机制；{"\n"}
              4. 定期进行安全审计和漏洞修复。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">五、您的权利</Text>
            <Text className="section-text">
              1. 访问权：您可以查看和获取您的个人信息；{"\n"}
              2. 更正权：您可以更正不准确的个人信息；{"\n"}
              3. 删除权：您可以要求删除您的个人信息；{"\n"}
              4. 撤回同意权：您可以撤回之前的授权；{"\n"}
              5. 注销账户：您可以申请注销账户。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">六、未成年人保护</Text>
            <Text className="section-text">
              我们的服务主要面向成年人。如您是未满18周岁的未成年人，请在监护人陪同下阅读本政策，
              并在获得监护人同意后使用我们的服务。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">七、政策更新</Text>
            <Text className="section-text">
              我们可能适时修订本隐私政策，更新后将在应用内公布。重大变更将以显著方式通知您。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">八、联系我们</Text>
            <Text className="section-text">
              如您对本隐私政策有任何疑问，可通过以下方式联系我们：{"\n"}
              邮箱：privacy@gongkao.example.com{"\n"}
              客服电话：400-XXX-XXXX
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
