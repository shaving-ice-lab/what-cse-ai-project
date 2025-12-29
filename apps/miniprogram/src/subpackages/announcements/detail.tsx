import { View, Text, RichText } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import './detail.scss'

export default function AnnouncementDetailPage() {
  const router = useRouter()

  const announcement = {
    id: router.params.id,
    title: '2024年国家公务员考试公告',
    date: '2024-10-15',
    source: '国家公务员局',
    content: `
      <p>根据公务员法和公务员录用有关规定，国家公务员局将组织实施中央机关及其直属机构2024年度考试录用一级主任科员及以下和其他相当职级层次公务员工作。</p>
      <h3>一、报考条件</h3>
      <p>（一）具有中华人民共和国国籍；</p>
      <p>（二）年龄一般为18周岁以上、35周岁以下；</p>
      <p>（三）拥护中华人民共和国宪法；</p>
      <h3>二、报名时间</h3>
      <p>报名时间为2024年10月15日至10月24日。</p>
      <h3>三、考试时间</h3>
      <p>公共科目笔试时间为2024年11月26日。</p>
    `,
  }

  return (
    <View className='detail-page'>
      <View className='detail-header'>
        <Text className='title'>{announcement.title}</Text>
        <View className='meta'>
          <Text className='source'>来源：{announcement.source}</Text>
          <Text className='date'>{announcement.date}</Text>
        </View>
      </View>

      <View className='detail-content'>
        <RichText nodes={announcement.content} />
      </View>
    </View>
  )
}
