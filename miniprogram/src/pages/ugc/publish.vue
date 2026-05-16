<script setup lang="ts">
import { ref } from 'vue'
import { districts } from '@/data/districts'
import type { UGCType, UGCSeason } from '@/data/ugc'

const title = ref('')
const content = ref('')
const images = ref<string[]>([])
const selectedType = ref<UGCType>('景点')
const selectedSeason = ref<UGCSeason>('夏')
const selectedDistrictId = ref('')
const relatedAttractionNames = ref<string[]>([])
const submitting = ref(false)

const types: UGCType[] = ['景点', '美食', '旅居', '自驾', '小众秘境', '住宿']
const seasons: UGCSeason[] = ['春', '夏', '秋', '冬', '全年']

const availableDistricts = districts.filter(d => d.available)

function getAttractionsByDistrict(districtId: string) {
  const d = districts.find(d => d.id === districtId)
  return d?.attractions.map(a => a.name) ?? []
}

function toggleAttraction(name: string) {
  const idx = relatedAttractionNames.value.indexOf(name)
  if (idx > -1) {
    relatedAttractionNames.value.splice(idx, 1)
  } else {
    relatedAttractionNames.value.push(name)
  }
}

function chooseImages() {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 上传到云存储
      const tempFiles = res.tempFilePaths
      tempFiles.forEach(path => {
        wx.cloud.uploadFile({
          cloudPath: `ugc/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
          filePath: path,
          success: (r: any) => {
            images.value.push(r.fileID)
          }
        })
      })
    }
  })
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

async function submit() {
  if (!title.value.trim()) {
    uni.showToast({ title: '请填写标题', icon: 'none' })
    return
  }
  if (content.value.length < 100) {
    uni.showToast({ title: '正文至少100字', icon: 'none' })
    return
  }
  if (!selectedDistrictId.value) {
    uni.showToast({ title: '请选择所在区县', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const district = districts.find(d => d.id === selectedDistrictId.value)
    await wx.cloud.callFunction({
      name: 'submitUGC',
      data: {
        title: title.value,
        content: content.value,
        images: images.value,
        type: selectedType.value,
        season: selectedSeason.value,
        districtId: selectedDistrictId.value,
        districtName: district?.name ?? '',
        relatedAttractions: relatedAttractionNames.value.map(name => ({
          name,
          districtId: selectedDistrictId.value,
        })),
      },
    })
    uni.showModal({
      title: '提交成功',
      content: '游记已提交审核，通过后将自动发布，通常在24小时内完成。',
      showCancel: false,
      success: () => uni.navigateBack(),
    })
  } catch (e) {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="publish">
    <!-- 标题 -->
    <view class="card">
      <input
        v-model="title"
        class="title-input"
        placeholder="起一个吸引人的标题..."
        maxlength="30"
      />
      <text class="char-count">{{ title.length }}/30</text>
    </view>

    <!-- 图片 -->
    <view class="card">
      <text class="label">添加图片</text>
      <view class="image-grid">
        <view
          v-for="(img, idx) in images"
          :key="idx"
          class="image-item"
        >
          <image :src="img" mode="aspectFill" class="preview-img" />
          <view class="img-remove" @tap="removeImage(idx)">×</view>
        </view>
        <view v-if="images.length < 9" class="image-add" @tap="chooseImages">
          <text class="add-icon">+</text>
          <text class="add-label">{{ images.length }}/9</text>
        </view>
      </view>
    </view>

    <!-- 正文 -->
    <view class="card">
      <textarea
        v-model="content"
        class="content-input"
        placeholder="分享你的昭通旅行故事，景点体验、美食推荐、旅居感受……至少100字"
        :maxlength="3000"
        auto-height
      />
      <text class="char-count">{{ content.length }}/3000</text>
    </view>

    <!-- 结构化标签 -->
    <view class="card">
      <text class="label">游记类型</text>
      <view class="tag-row">
        <view
          v-for="t in types"
          :key="t"
          :class="['tag-chip', selectedType === t ? 'selected' : '']"
          @tap="selectedType = t"
        >{{ t }}</view>
      </view>

      <text class="label" style="margin-top: 32rpx;">适合季节</text>
      <view class="tag-row">
        <view
          v-for="s in seasons"
          :key="s"
          :class="['tag-chip', selectedSeason === s ? 'selected' : '']"
          @tap="selectedSeason = s"
        >{{ s }}</view>
      </view>

      <text class="label" style="margin-top: 32rpx;">所在区县</text>
      <view class="tag-row">
        <view
          v-for="d in availableDistricts"
          :key="d.id"
          :class="['tag-chip', selectedDistrictId === d.id ? 'selected' : '']"
          @tap="() => { selectedDistrictId = d.id; relatedAttractionNames = [] }"
        >{{ d.name }}</view>
        <view
          :class="['tag-chip', !selectedDistrictId ? '' : (availableDistricts.some(d => d.id === selectedDistrictId) ? '' : 'selected')]"
          @tap="selectedDistrictId = 'other'"
        >其他区县</view>
      </view>

      <!-- 关联景点（仅当选了有数据的区县时显示） -->
      <view v-if="selectedDistrictId && getAttractionsByDistrict(selectedDistrictId).length > 0">
        <text class="label" style="margin-top: 32rpx;">关联景点（可多选）</text>
        <view class="tag-row">
          <view
            v-for="name in getAttractionsByDistrict(selectedDistrictId)"
            :key="name"
            :class="['tag-chip', relatedAttractionNames.includes(name) ? 'selected-orange' : '']"
            @tap="toggleAttraction(name)"
          >{{ name }}</view>
        </view>
      </view>
    </view>

    <!-- 提示 -->
    <view class="tips-card">
      <text class="tips-title">提交后由 AI 自动审核</text>
      <text class="tips-text">• 内容需与昭通旅行相关</text>
      <text class="tips-text">• 正文不少于100字</text>
      <text class="tips-text">• 不含广告或联系方式</text>
      <text class="tips-text">• 审核通常在24小时内完成</text>
    </view>

    <!-- 提交 -->
    <view :class="['btn-submit', submitting ? 'disabled' : '']" @tap="submit">
      {{ submitting ? '提交中...' : '提交游记' }}
    </view>
  </view>
</template>

<style scoped>
.publish { padding: 24rpx; padding-bottom: 60rpx; }

.label { display: block; font-size: 26rpx; font-weight: 600; color: #2D2D2D; margin-bottom: 16rpx; }

.title-input {
  font-size: 32rpx; color: #2D2D2D; width: 100%;
  border: none; outline: none;
}
.char-count { display: block; text-align: right; font-size: 22rpx; color: #ccc; margin-top: 12rpx; }

.image-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { position: relative; width: 200rpx; height: 200rpx; }
.preview-img { width: 200rpx; height: 200rpx; border-radius: 12rpx; }
.img-remove {
  position: absolute; top: -12rpx; right: -12rpx;
  width: 40rpx; height: 40rpx; border-radius: 50%;
  background: rgba(0,0,0,0.5); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx;
}
.image-add {
  width: 200rpx; height: 200rpx; border-radius: 12rpx;
  border: 2rpx dashed #ddd; background: #fafafa;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx;
}
.add-icon { font-size: 60rpx; color: #ccc; line-height: 1; }
.add-label { font-size: 22rpx; color: #ccc; }

.content-input {
  width: 100%; min-height: 240rpx;
  font-size: 28rpx; color: #2D2D2D; line-height: 1.8;
}

.tag-row { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag-chip {
  padding: 12rpx 24rpx; border-radius: 32rpx;
  border: 2rpx solid #eee; background: #fafafa;
  font-size: 26rpx; color: #666;
}
.tag-chip.selected { border-color: #4A7C59; background: #EBF4EF; color: #4A7C59; font-weight: 600; }
.tag-chip.selected-orange { border-color: #C45C26; background: #FEF3E2; color: #C45C26; }

.tips-card {
  background: #FEF9EC; border-radius: 16rpx; padding: 24rpx;
  margin-bottom: 32rpx; border-left: 6rpx solid #E8A838;
}
.tips-title { display: block; font-size: 26rpx; font-weight: 700; color: #C45C26; margin-bottom: 12rpx; }
.tips-text { display: block; font-size: 24rpx; color: #666; line-height: 2; }

.btn-submit {
  background: #4A7C59; color: #fff; text-align: center;
  padding: 32rpx 0; border-radius: 16rpx; font-size: 32rpx; font-weight: 600;
}
.btn-submit.disabled { opacity: 0.6; }
</style>
