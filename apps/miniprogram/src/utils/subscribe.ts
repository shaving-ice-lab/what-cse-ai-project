import Taro from '@tarojs/taro'

const TEMPLATE_IDS = {
  NEW_POSITION: 'tmpl_xxx1',
  DEADLINE_REMINDER: 'tmpl_xxx2',
  EXAM_REMINDER: 'tmpl_xxx3',
}

export async function requestSubscribe(templateIds: string[]): Promise<boolean> {
  try {
    const res = await Taro.requestSubscribeMessage({
      tmplIds: templateIds,
    })
    
    const accepted = templateIds.every((id) => res[id] === 'accept')
    return accepted
  } catch (error) {
    console.error('订阅消息失败:', error)
    return false
  }
}

export async function subscribeNewPosition(): Promise<boolean> {
  return requestSubscribe([TEMPLATE_IDS.NEW_POSITION])
}

export async function subscribeDeadline(): Promise<boolean> {
  return requestSubscribe([TEMPLATE_IDS.DEADLINE_REMINDER])
}

export async function subscribeExam(): Promise<boolean> {
  return requestSubscribe([TEMPLATE_IDS.EXAM_REMINDER])
}

export async function subscribeAll(): Promise<boolean> {
  return requestSubscribe(Object.values(TEMPLATE_IDS))
}
