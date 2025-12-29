import { View, Text, ScrollView } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import "./agreement.scss";

export default function Agreement() {
  useLoad(() => {
    console.log("Agreement page loaded");
  });

  return (
    <ScrollView className="agreement-page" scrollY>
      <View className="agreement-container">
        <View className="agreement-header">
          <Text className="agreement-title">用户服务协议</Text>
          <Text className="agreement-update">更新日期：2024年12月29日</Text>
          <Text className="agreement-effective">生效日期：2024年12月29日</Text>
        </View>

        <View className="agreement-content">
          <View className="section">
            <Text className="section-title">一、服务说明</Text>
            <Text className="section-text">
              公考职位智能筛选系统（以下简称"本平台"）是一个为公务员考试、事业单位考试考生
              提供职位信息查询、智能匹配、公告推送等服务的信息平台。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">二、用户注册</Text>
            <Text className="section-text">
              1. 用户应提供真实、准确的注册信息；{"\n"}
              2. 用户应妥善保管账户信息，因账户信息泄露造成的损失由用户自行承担；{"\n"}
              3. 禁止将账户转让、出借给他人使用；{"\n"}
              4. 用户应为注册账户下的所有行为承担责任。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">三、服务内容</Text>
            <Text className="section-text">
              1. 职位信息查询和筛选；{"\n"}
              2. 个人条件与职位智能匹配；{"\n"}
              3. 招考公告推送提醒；{"\n"}
              4. 报名截止、考试时间提醒；{"\n"}
              5. 其他相关增值服务。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">四、用户行为规范</Text>
            <Text className="section-text">
              用户在使用本平台服务时，不得：{"\n"}
              1. 发布违法违规信息；{"\n"}
              2. 恶意注册、批量注册账号；{"\n"}
              3. 利用技术手段干扰平台正常运行；{"\n"}
              4. 未经授权抓取平台数据；{"\n"}
              5. 其他违反法律法规或公序良俗的行为。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">五、信息来源声明</Text>
            <Text className="section-text">
              1. 本平台职位信息来源于各级政府官方网站公开发布的招考公告；{"\n"}
              2. 我们尽力确保信息准确，但不对信息的完整性、及时性作出保证；{"\n"}
              3. 最终报考信息请以官方公告为准；{"\n"}
              4. 用户应自行核实相关信息后做出报考决定。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">六、知识产权</Text>
            <Text className="section-text">
              1. 本平台的所有内容（包括但不限于文字、图片、软件、设计）均受知识产权保护；{"\n"}
              2. 未经我们书面许可，不得复制、转载、传播本平台内容；{"\n"}
              3. 用户发布的内容应确保拥有合法权利。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">七、免责声明</Text>
            <Text className="section-text">
              1. 本平台仅提供信息服务，不对用户的报考结果负责；{"\n"}
              2. 因不可抗力导致的服务中断，我们不承担责任；{"\n"}
              3. 用户因自身原因导致的损失由用户自行承担。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">八、协议变更</Text>
            <Text className="section-text">
              我们有权根据需要修订本协议，修订后的协议将在本平台公布。
              如您继续使用本平台服务，视为接受修订后的协议。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">九、争议解决</Text>
            <Text className="section-text">
              本协议的订立、执行和解释适用中华人民共和国法律。
              因本协议产生的争议，双方应友好协商解决；协商不成的，
              任何一方均可向平台所在地有管辖权的人民法院提起诉讼。
            </Text>
          </View>

          <View className="section">
            <Text className="section-title">十、联系方式</Text>
            <Text className="section-text">
              如您对本协议有任何疑问，可通过以下方式联系我们：{"\n"}
              邮箱：service@gongkao.example.com{"\n"}
              客服电话：400-XXX-XXXX
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
