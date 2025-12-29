import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './search.scss'

export default function PositionSearchPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([
    '税务局', '海关', '统计局', '北京'
  ])
  const [hotKeywords] = useState([
    '国考2024', '省考', '税务', '海关', '统计', '事业编'
  ])

  useEffect(() => {
    const initialKeyword = router.params.keyword || ''
    if (initialKeyword) {
      setKeyword(initialKeyword)
      handleSearch(initialKeyword)
    }
  }, [])

  const handleSearch = (searchKeyword?: string) => {
    const kw = searchKeyword || keyword
    if (kw.trim()) {
      if (!searchHistory.includes(kw)) {
        setSearchHistory([kw, ...searchHistory.slice(0, 9)])
      }
      Taro.navigateTo({
        url: `/pages/positions/index?keyword=${kw}`
      })
    }
  }

  const handleClearHistory = () => {
    setSearchHistory([])
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <View className='search-box'>
          <Input
            className='search-input'
            placeholder='搜索职位、单位、地区'
            value={keyword}
            focus
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={() => handleSearch()}
          />
          {keyword && (
            <Text className='clear-btn' onClick={() => setKeyword('')}>✕</Text>
          )}
        </View>
        <Text className='search-btn' onClick={() => handleSearch()}>搜索</Text>
      </View>

      <ScrollView scrollY className='search-content'>
        {searchHistory.length > 0 && (
          <View className='search-section'>
            <View className='section-header'>
              <Text className='section-title'>搜索历史</Text>
              <Text className='clear-all' onClick={handleClearHistory}>清空</Text>
            </View>
            <View className='keyword-list'>
              {searchHistory.map((item, index) => (
                <Text
                  key={index}
                  className='keyword-tag'
                  onClick={() => handleSearch(item)}
                >
                  {item}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View className='search-section'>
          <View className='section-header'>
            <Text className='section-title'>热门搜索</Text>
          </View>
          <View className='keyword-list'>
            {hotKeywords.map((item, index) => (
              <Text
                key={index}
                className='keyword-tag hot'
                onClick={() => handleSearch(item)}
              >
                {item}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
