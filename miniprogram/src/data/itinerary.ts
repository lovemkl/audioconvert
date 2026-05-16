import type { Attraction } from './districts'

export interface ItineraryStop {
  districtId: string
  districtName: string
  attractionName: string
  attractionDesc: string
  duration: string
  order: number
  dayIndex: number
}

export interface ItineraryDay {
  dayIndex: number
  label: string
  stops: ItineraryStop[]
  note?: string
}

export interface Itinerary {
  id?: string
  title: string
  totalDays: number
  districtIds: string[]
  theme: ItineraryTheme
  days: ItineraryDay[]
  authorId?: string
  isShared: boolean
  createdAt?: string
}

export type ItineraryTheme = '深度游' | '避暑旅居' | '自驾探索' | '亲子游' | '摄影采风' | '文化历史'

// 根据选择的区县和天数自动生成行程框架
export function buildItinerary(
  districtIds: string[],
  totalDays: number,
  theme: ItineraryTheme,
  districts: any[]
): ItineraryDay[] {
  const days: ItineraryDay[] = []
  const availableDistricts = districts.filter(d => districtIds.includes(d.id) && d.available)

  // 每天分配 1-2 个区县，每个区县取前 2-3 个景点
  for (let i = 0; i < totalDays; i++) {
    const districtForDay = availableDistricts[i % availableDistricts.length]
    const stops: ItineraryStop[] = []

    if (districtForDay && districtForDay.attractions.length > 0) {
      const attractionsPerDay = Math.min(3, districtForDay.attractions.length)
      for (let j = 0; j < attractionsPerDay; j++) {
        const attraction = districtForDay.attractions[j]
        stops.push({
          districtId: districtForDay.id,
          districtName: districtForDay.name,
          attractionName: attraction.name,
          attractionDesc: attraction.desc,
          duration: j === 0 ? '上午（2-3小时）' : j === 1 ? '下午（2小时）' : '傍晚（1小时）',
          order: j,
          dayIndex: i,
        })
      }
    }

    days.push({
      dayIndex: i,
      label: `第 ${i + 1} 天${districtForDay ? ` · ${districtForDay.name}` : ''}`,
      stops,
      note: i === 0 ? '建议上午出发，预留充足路途时间' : undefined,
    })
  }

  return days
}

// 主题对应的推荐区县顺序
export const THEME_DISTRICT_ORDER: Record<ItineraryTheme, string[]> = {
  '深度游': ['zhaoyang', 'qiaojia', 'yiliang', 'yanjin', 'daguan', 'zhenxiong'],
  '避暑旅居': ['zhaoyang', 'yiliang', 'zhenxiong', 'ludian', 'weixin'],
  '自驾探索': ['zhaoyang', 'qiaojia', 'yanjin', 'daguan', 'yongshan', 'suijiang'],
  '亲子游': ['zhaoyang', 'yiliang', 'yanjin', 'weixin'],
  '摄影采风': ['zhaoyang', 'qiaojia', 'yiliang', 'daguan'],
  '文化历史': ['zhaoyang', 'yanjin', 'weixin', 'zhenxiong'],
}
