export interface Attraction {
  name: string
  desc: string
  tags: string[]
  tips?: string
  openTime?: string
  ticket?: string
  location?: { lat: number; lng: number }
}

export interface Food {
  name: string
  desc: string
  where?: string
}

export interface Accommodation {
  name: string
  type: '民宿' | '酒店' | '客栈'
  priceRange: string
  tags: string[]
}

export interface LivingFacility {
  type: 'hospital' | 'supermarket' | 'market' | 'bank' | 'pharmacy'
  label: string
  name: string
  address?: string
}

export interface District {
  id: string
  name: string
  fullName: string
  tagline: string
  altitude: number
  summerTempRange: [number, number]
  summerHumidity: string
  weatherLocationId: string
  resortScore: number
  monthlyRentRange: [number, number]
  coverImage: string
  tags: string[]
  distanceFromChengdu: string
  distanceFromChongqing: string
  highlights: string[]
  attractions: Attraction[]
  foods: Food[]
  accommodations: Accommodation[]
  livingFacilities: LivingFacility[]
  resortNote: string
  available: boolean
}

export const districts: District[] = [
  {
    id: 'zhaoyang',
    name: '昭阳区',
    fullName: '昭通市昭阳区',
    tagline: '秋城主城，旅居首选',
    altitude: 1900,
    summerTempRange: [17, 22],
    summerHumidity: '适中（60-75%）',
    weatherLocationId: '101290601',
    resortScore: 5,
    monthlyRentRange: [800, 2000],
    coverImage: '/static/districts/zhaoyang-cover.jpg',
    tags: ['避暑★★★★★', '配套完善', '交通便利', '高铁直达'],
    distanceFromChengdu: '高铁约3.5小时 / 自驾约5小时',
    distanceFromChongqing: '高铁约3小时 / 自驾约4.5小时',
    highlights: ['大山包黑颈鹤', '昭通古城', '高原湿地', '苹果之乡'],
    attractions: [
      {
        name: '大山包黑颈鹤国家级自然保护区',
        desc: '海拔3000m以上的高原湿地，全球最重要的黑颈鹤越冬地之一。夏季高原草甸花海壮观，是昭阳区避暑的绝佳去处。',
        tags: ['自然保护区', '观鸟', '高原湿地', '摄影圣地'],
        openTime: '全年开放，夏季6-9月最佳',
        ticket: '旺季60元/人，淡季30元/人',
        tips: '海拔较高（3200m+），注意防晒保暖，不建议心肺功能较弱的老人单独前往。',
        location: { lat: 27.5833, lng: 103.5500 }
      },
      {
        name: '昭通古城（昭通历史文化街区）',
        desc: '保存完好的清代商业街区，石板路、老茶馆、传统手工艺一应俱全，傍晚最有烟火气。',
        tags: ['历史文化', '古街', '美食集中'],
        openTime: '全天开放',
        ticket: '免费'
      },
      {
        name: '朱德故居纪念馆',
        desc: '朱德元帅早年居住地，展示红色历史与昭通近代史，适合带娃的历史教育游。',
        tags: ['红色文化', '历史'],
        openTime: '9:00-17:00（周一闭馆）',
        ticket: '免费'
      },
      {
        name: '凤凰山公园',
        desc: '城区内的登山公园，山顶可俯瞰昭通盆地全景，是本地人晨练和傍晚散步的首选地。',
        tags: ['城市公园', '登山', '观景'],
        openTime: '全天',
        ticket: '免费'
      },
      {
        name: '五尺道遗址',
        desc: '秦汉时期开凿的古驿道，见证了两千年云贵高原与中原的交通历史，石壁上至今可见深深的车辙印。',
        tags: ['历史遗迹', '古道'],
        openTime: '全天',
        ticket: '免费'
      }
    ],
    foods: [
      {
        name: '昭通酱',
        desc: '昭通最具代表性的特产，以辣椒、豆瓣为主料，香辣醇厚，可拌饭、下面、炒菜。买几瓶带回去绝对不亏。',
        where: '任何超市均有售，老字号推荐"冠香园"'
      },
      {
        name: '荞麦饭',
        desc: '高原传统主食，口感粗粝有嚼劲，搭配昭通酱或酸汤，是本地农家乐的标配。',
        where: '古城区周边农家乐'
      },
      {
        name: '洋芋（土豆）系列',
        desc: '高原洋芋淀粉含量高、口感绵密，烤洋芋、洋芋饼、炸洋芋各有风味，路边摊5-10元一份。',
        where: '古城步行街沿街摊位'
      },
      {
        name: '昭通苹果',
        desc: '高原日照充足、昼夜温差大，昭通苹果个大皮薄、甜中带酸，每年9-10月大量上市。',
        where: '昭通水果批发市场或农贸市场'
      },
      {
        name: '豆花饭',
        desc: '细嫩的石磨豆花配米饭，浇上蘸水（昭通酱+葱花+花椒），简单却回味无穷，早餐首选。',
        where: '古城区老街早餐摊'
      }
    ],
    accommodations: [
      {
        name: '昭通古城民宿集群',
        type: '民宿',
        priceRange: '120-300元/晚（短租），800-1500元/月（长租）',
        tags: ['老城风情', '生活便利', '适合旅居']
      },
      {
        name: '昭通市区酒店',
        type: '酒店',
        priceRange: '150-500元/晚',
        tags: ['设施完善', '交通方便']
      },
      {
        name: '大山包周边农家乐',
        type: '客栈',
        priceRange: '80-200元/晚',
        tags: ['高原清凉', '体验农家生活']
      }
    ],
    livingFacilities: [
      { type: 'hospital', label: '医院', name: '昭通市第一人民医院', address: '昭通市昭阳区' },
      { type: 'hospital', label: '医院', name: '昭通市中医医院', address: '昭通市昭阳区' },
      { type: 'supermarket', label: '超市', name: '永辉超市昭通店', address: '城区商业中心' },
      { type: 'supermarket', label: '超市', name: '步步高超市', address: '城区' },
      { type: 'market', label: '菜市场', name: '北正街农贸市场', address: '北正街' },
      { type: 'market', label: '菜市场', name: '昭通中心市场', address: '市中心' },
      { type: 'bank', label: '银行', name: '各大银行均有网点', address: '市区广泛分布' },
      { type: 'pharmacy', label: '药店', name: '大参林/老百姓大药房', address: '市区' }
    ],
    resortNote: '昭阳区是长期旅居的最优选，配套设施最完善，有三甲医院、大型超市和完整的城市服务。高铁直达，返程方便。夏季（6-9月）17-22°C是避暑黄金期。',
    available: true
  },
  {
    id: 'qiaojia',
    name: '巧家县',
    fullName: '昭通市巧家县',
    tagline: '金沙江畔，世界级水电奇观',
    altitude: 900,
    summerTempRange: [25, 31],
    summerHumidity: '偏干（40-60%）',
    weatherLocationId: '101290606',
    resortScore: 3,
    monthlyRentRange: [400, 900],
    coverImage: '/static/districts/qiaojia-cover.jpg',
    tags: ['观光★★★★', '水电奇观', '峡谷风光', '药山自然'],
    distanceFromChengdu: '自驾约5.5小时（经宜宾）',
    distanceFromChongqing: '自驾约5小时（经宜宾）',
    highlights: ['白鹤滩水电站', '药山自然保护区', '金沙江大峡谷'],
    attractions: [
      {
        name: '白鹤滩水电站观光区',
        desc: '世界第二大水电站，总装机1600万千瓦。巨型大坝和高峡平湖的壮观景象令人震撼，是了解中国现代工程成就的绝佳地点。',
        tags: ['世界级工程', '人文景观', '摄影'],
        openTime: '8:00-17:30',
        ticket: '免费（需提前预约）',
        tips: '需通过官方渠道预约参观，旺季提前1-2周预约。'
      },
      {
        name: '药山自然保护区',
        desc: '海拔从700m跨越至4041m，垂直落差形成多样生态带。山顶气候清凉，适合夏季避暑徒步，杜鹃花海（5月）尤为壮观。',
        tags: ['自然保护区', '徒步', '避暑（山顶）', '杜鹃花'],
        openTime: '全年开放',
        ticket: '30元/人'
      },
      {
        name: '金沙江大峡谷',
        desc: '江面宽约200-400米，两岸绝壁千丈，漂流与观光并举。沿江有多处观景台，自驾路途中风景极佳。',
        tags: ['峡谷', '漂流', '自然风光'],
        openTime: '全天',
        ticket: '观光免费，漂流另计'
      }
    ],
    foods: [
      {
        name: '白鹤滩鱼',
        desc: '金沙江冷水鱼，肉质细嫩，当地酸汤鱼做法最为鲜美，是到巧家必吃的一道菜。',
        where: '水电站附近农家乐'
      },
      {
        name: '巧家核桃',
        desc: '巧家核桃个大壳薄、肉质香，是当地重要经济作物，秋季现剥最香。',
        where: '县城农贸市场'
      },
      {
        name: '巧家花椒',
        desc: '金沙江干热气候孕育的大红袍花椒，麻香浓郁，是四川、重庆厨房的热门选购品。',
        where: '县城集市'
      }
    ],
    accommodations: [
      {
        name: '白鹤滩库区民宿',
        type: '民宿',
        priceRange: '100-250元/晚',
        tags: ['江景', '新开发区']
      },
      {
        name: '巧家县城酒店',
        type: '酒店',
        priceRange: '120-280元/晚',
        tags: ['配套一般', '价格实惠']
      }
    ],
    livingFacilities: [
      { type: 'hospital', label: '医院', name: '巧家县人民医院', address: '巧家县城' },
      { type: 'supermarket', label: '超市', name: '县城综合超市', address: '县城中心' },
      { type: 'market', label: '菜市场', name: '巧家县农贸市场', address: '县城' }
    ],
    resortNote: '巧家县城海拔较低（900m），夏季较热，不适合长期旅居。但药山景区（2000m+）气候宜人，适合短期避暑。主要推荐作为自驾昭通的观光目的地，看白鹤滩水电站是必选项目。',
    available: true
  },
  {
    id: 'ludian',
    name: '鲁甸县',
    fullName: '昭通市鲁甸县',
    tagline: '待完善（二期）',
    altitude: 1800,
    summerTempRange: [18, 23],
    summerHumidity: '适中',
    weatherLocationId: '101290602',
    resortScore: 4,
    monthlyRentRange: [500, 1200],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线'],
    distanceFromChengdu: '自驾约5小时',
    distanceFromChongqing: '自驾约4.5小时',
    highlights: ['龙头山公园', '地震遗址公园'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'daguan',
    name: '大关县',
    fullName: '昭通市大关县',
    tagline: '待完善（二期）',
    altitude: 1300,
    summerTempRange: [21, 26],
    summerHumidity: '偏湿',
    weatherLocationId: '101290604',
    resortScore: 4,
    monthlyRentRange: [400, 900],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线'],
    distanceFromChengdu: '自驾约6小时',
    distanceFromChongqing: '自驾约5小时',
    highlights: ['翠华山', '筇竹'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'yanjin',
    name: '盐津县',
    fullName: '昭通市盐津县',
    tagline: '待完善（二期）',
    altitude: 800,
    summerTempRange: [25, 30],
    summerHumidity: '偏湿',
    weatherLocationId: '101290605',
    resortScore: 3,
    monthlyRentRange: [400, 800],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线'],
    distanceFromChengdu: '自驾约5小时',
    distanceFromChongqing: '自驾约3.5小时',
    highlights: ['豆沙关', '五尺道'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'yongshan',
    name: '永善县',
    fullName: '昭通市永善县',
    tagline: '待完善（二期）',
    altitude: 600,
    summerTempRange: [27, 32],
    summerHumidity: '偏干',
    weatherLocationId: '101290607',
    resortScore: 2,
    monthlyRentRange: [350, 700],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线'],
    distanceFromChengdu: '自驾约6小时',
    distanceFromChongqing: '自驾约6小时',
    highlights: ['溪洛渡水电站', '马楠草山'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'suijiang',
    name: '绥江县',
    fullName: '昭通市绥江县',
    tagline: '待完善（二期）',
    altitude: 400,
    summerTempRange: [28, 33],
    summerHumidity: '偏湿',
    weatherLocationId: '101290608',
    resortScore: 2,
    monthlyRentRange: [350, 700],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线'],
    distanceFromChengdu: '自驾约5小时',
    distanceFromChongqing: '自驾约4小时',
    highlights: ['绥江新城', '库区风光'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'zhenxiong',
    name: '镇雄县',
    fullName: '昭通市镇雄县',
    tagline: '待完善（二期）',
    altitude: 1600,
    summerTempRange: [19, 24],
    summerHumidity: '适中',
    weatherLocationId: '101290609',
    resortScore: 4,
    monthlyRentRange: [500, 1000],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线'],
    distanceFromChengdu: '自驾约5小时',
    distanceFromChongqing: '自驾约4小时',
    highlights: ['赤水河源头', '乌峰山'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'yiliang',
    name: '彝良县',
    fullName: '昭通市彝良县',
    tagline: '待完善（二期）',
    altitude: 1800,
    summerTempRange: [17, 22],
    summerHumidity: '适中',
    weatherLocationId: '101290610',
    resortScore: 5,
    monthlyRentRange: [400, 900],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线', '小草坝杜鹃'],
    distanceFromChengdu: '自驾约5.5小时',
    distanceFromChongqing: '自驾约4.5小时',
    highlights: ['小草坝杜鹃花海', '毕摩文化'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'weixin',
    name: '威信县',
    fullName: '昭通市威信县',
    tagline: '待完善（二期）',
    altitude: 1400,
    summerTempRange: [20, 25],
    summerHumidity: '偏湿',
    weatherLocationId: '101290611',
    resortScore: 4,
    monthlyRentRange: [400, 900],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线', '红色文化'],
    distanceFromChengdu: '自驾约5小时',
    distanceFromChongqing: '自驾约4小时',
    highlights: ['扎西会议遗址'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  },
  {
    id: 'shuifu',
    name: '水富市',
    fullName: '昭通市水富市',
    tagline: '待完善（二期）',
    altitude: 270,
    summerTempRange: [29, 34],
    summerHumidity: '偏湿',
    weatherLocationId: '101290603',
    resortScore: 1,
    monthlyRentRange: [500, 1200],
    coverImage: '/static/districts/default-cover.jpg',
    tags: ['二期上线', '温泉'],
    distanceFromChengdu: '自驾约3.5小时',
    distanceFromChongqing: '自驾约3小时',
    highlights: ['西部大峡谷温泉'],
    attractions: [],
    foods: [],
    accommodations: [],
    livingFacilities: [],
    resortNote: '',
    available: false
  }
]

export const getDistrictById = (id: string) => districts.find(d => d.id === id)
export const availableDistricts = districts.filter(d => d.available)

// 避暑综合评分（用于选地对比页）
export const resortRankings = [...districts].sort((a, b) => b.resortScore - a.resortScore)
