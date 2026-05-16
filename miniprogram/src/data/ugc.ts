export type UGCType = '景点' | '美食' | '旅居' | '自驾' | '小众秘境' | '住宿'
export type UGCSeason = '春' | '夏' | '秋' | '冬' | '全年'
export type UGCStatus = 'pending' | 'approved' | 'rejected'

export interface UGCAttraction {
  name: string
  districtId: string
}

export interface UGCPost {
  id: string
  title: string
  content: string
  images: string[]
  type: UGCType
  season: UGCSeason
  districtId: string
  districtName: string
  relatedAttractions: UGCAttraction[]
  authorId: string
  authorNickname: string
  authorAvatar: string
  status: UGCStatus
  rejectReason?: string
  likeCount: number
  collectCount: number
  viewCount: number
  createdAt: string
  isExternal?: boolean
  externalSource?: string
}

// Claude API 审核请求/响应结构
export interface ModerationRequest {
  postId: string
  title: string
  content: string
  type: UGCType
  districtId: string
}

export interface ModerationResult {
  status: 'approved' | 'rejected' | 'manual_review'
  reason?: string
  score: number
}

// 审核规则（传给 Claude 的 system prompt 基础）
export const MODERATION_RULES = {
  minLength: 100,
  requireImages: false,
  mustMentionLocation: true,
  bannedKeywords: ['广告', '微信号', '加我', 'QQ', '私信'],
  qualityThreshold: 0.6,
}
