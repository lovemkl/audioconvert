export interface Waypoint {
  name: string
  desc: string
  duration: string
  type: 'attraction' | 'food' | 'rest' | 'fuel' | 'camp'
  location?: { lat: number; lng: number }
  tips?: string
}

export interface DriveRoute {
  id: string
  name: string
  tagline: string
  totalDistance: string
  totalDays: number
  difficulty: '轻松' | '适中' | '有挑战'
  startPoint: string
  endPoint: string
  tags: string[]
  cover: string
  highlights: string[]
  waypoints: Waypoint[]
  fuelStations: string[]
  evChargingNote: string
  campings: { name: string; price: string; tel?: string }[]
  bestSeason: string
  tips: string[]
}

export const routes: DriveRoute[] = [
  {
    id: 'chengdu-zhaoyang',
    name: '成都→昭通经典入城线',
    tagline: '川滇门户，穿越高山峡谷，抵达秋城',
    totalDistance: '约530公里',
    totalDays: 1,
    difficulty: '适中',
    startPoint: '成都',
    endPoint: '昭通市昭阳区',
    tags: ['川渝入昭', '单日自驾', '高速为主', '沿途有惊喜'],
    cover: '/static/routes/chengdu-zhaoyang.jpg',
    highlights: ['乐山大佛（绕道1小时）', '宜宾三江口', '盐津豆沙关', '昭通苹果园'],
    bestSeason: '5-10月均可，避开冬季雨雪',
    waypoints: [
      {
        name: '成都出发',
        desc: '建议早上7点前出发，走成渝高速→宜叙高速方向。',
        duration: '出发点',
        type: 'rest'
      },
      {
        name: '宜宾三江口（可选）',
        desc: '金沙江、岷江、长江三江交汇，宜宾老城值得停留1-2小时，顺便吃碗地道燃面。',
        duration: '停留1-2小时',
        type: 'food',
        tips: '宜宾燃面是当地早餐，建议上午到达。'
      },
      {
        name: '盐津豆沙关（可选绕道）',
        desc: '秦汉五尺道穿越关隘，古驿站遗址，石壁上的车辙和文字历经千年。离高速约20分钟车程。',
        duration: '停留1.5小时',
        type: 'attraction',
        location: { lat: 28.1, lng: 104.07 }
      },
      {
        name: '昭通高速收费站',
        desc: '进入昭通主城区，此处海拔约1900米，明显感受到温度下降——这就是秋城魅力开始的地方。',
        duration: '到达',
        type: 'rest'
      }
    ],
    fuelStations: ['宜宾服务区', '盐津服务区', '昭通北收费站附近'],
    evChargingNote: '沿高速主要服务区均有充电桩，昭通市区有多处快充站（特来电、星星充电）。注意：盐津至昭通段山路较多，建议在宜宾或盐津充满电。',
    campings: [],
    tips: [
      '全程高速路况良好，冬季注意结冰预警',
      '宜宾绕城路段早晚高峰拥堵，建议避开',
      '昭通当地停车方便，市区停车场收费低'
    ]
  },
  {
    id: 'chongqing-zhaoyang',
    name: '重庆→昭通经典入城线',
    tagline: '山城到秋城，巫山云雨换高原清凉',
    totalDistance: '约480公里',
    totalDays: 1,
    difficulty: '轻松',
    startPoint: '重庆',
    endPoint: '昭通市昭阳区',
    tags: ['川渝入昭', '单日自驾', '高速为主'],
    cover: '/static/routes/chongqing-zhaoyang.jpg',
    highlights: ['永川服务区', '宜宾过境', '盐津峡谷风光'],
    bestSeason: '全年可行（冬季注意路况）',
    waypoints: [
      {
        name: '重庆出发',
        desc: '走渝昆高速（在建完善中）或渝宜高速→宜叙高速，全程约4.5小时。',
        duration: '出发点',
        type: 'rest'
      },
      {
        name: '宜宾过境',
        desc: '在宜宾补给休息，也可顺道品尝五粮液酒城风情。',
        duration: '停留1小时',
        type: 'food'
      },
      {
        name: '盐津县',
        desc: '峡谷中的小县城，关河两岸风光秀丽，也是进入云南昭通的门户。',
        duration: '途经，可停留',
        type: 'attraction'
      },
      {
        name: '昭通主城',
        desc: '抵达。建议首晚在古城区附近住宿，步行体验老城烟火气。',
        duration: '到达',
        type: 'rest'
      }
    ],
    fuelStations: ['永川服务区', '宜宾服务区', '盐津服务区'],
    evChargingNote: '重庆至宜宾段充电桩覆盖完善，宜宾后建议充满。昭通市区有快充站。',
    campings: [],
    tips: [
      '重庆出发建议避开周五晚和周一早的高速拥堵',
      '全程导航建议选高德/百度，渝昆高速部分路段仍在更新'
    ]
  },
  {
    id: 'zhaoyang-panorama',
    name: '昭通全境精华5日游',
    tagline: '串联11区县，深度体验昭通的山、水、城、食',
    totalDistance: '约900公里',
    totalDays: 5,
    difficulty: '有挑战',
    startPoint: '昭阳区',
    endPoint: '昭阳区（环线）',
    tags: ['深度游', '多日自驾', '环线', '全境覆盖'],
    cover: '/static/routes/panorama.jpg',
    highlights: ['大山包湿地', '白鹤滩水电站', '小草坝杜鹃', '盐津豆沙关', '赤水河源头'],
    bestSeason: '5-9月（杜鹃5月、避暑6-9月）',
    waypoints: [
      {
        name: '第1天：昭阳区',
        desc: '大山包黑颈鹤保护区（上午）→昭通古城（下午）→凤凰山夜景',
        duration: '全天',
        type: 'attraction'
      },
      {
        name: '第2天：巧家县',
        desc: '白鹤滩水电站观光（提前预约）→药山风景区→金沙江大峡谷',
        duration: '全天',
        type: 'attraction',
        tips: '昭阳到巧家约2.5小时车程，建议早出发。'
      },
      {
        name: '第3天：彝良县',
        desc: '小草坝杜鹃花海→毕摩文化体验→彝良特色美食',
        duration: '全天',
        type: 'attraction'
      },
      {
        name: '第4天：盐津县+大关县',
        desc: '豆沙关五尺道（上午）→大关翠华山（下午）→竹笋宴晚餐',
        duration: '全天',
        type: 'attraction'
      },
      {
        name: '第5天：镇雄县→返回昭阳',
        desc: '赤水河源头→乌峰山→返回昭阳区，购买昭通酱、苹果等特产',
        duration: '全天',
        type: 'attraction'
      }
    ],
    fuelStations: ['各县城均有加油站，山区路段建议提前加满'],
    evChargingNote: '注意：除昭阳区外，各县城快充桩较少。建议油车或混动车辆出行，纯电车辆需提前规划充电路线，每天在县城过夜时充电。',
    campings: [
      { name: '大山包露营基地', price: '50-120元/晚（帐篷/木屋）' },
      { name: '小草坝彝家营地', price: '80-150元/晚' }
    ],
    tips: [
      '各县城之间道路多为省道/国道，路况一般，预留充足时间',
      '山区信号可能较弱，提前下载离线地图',
      '行程可根据停留偏好灵活调整，不必严格按日程走'
    ]
  }
]

export const getRouteById = (id: string) => routes.find(r => r.id === id)
