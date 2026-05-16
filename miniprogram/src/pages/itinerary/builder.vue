<script setup lang="ts">
import { ref, computed } from 'vue'
import { districts } from '@/data/districts'
import { buildItinerary, THEME_DISTRICT_ORDER } from '@/data/itinerary'
import type { ItineraryTheme, ItineraryDay } from '@/data/itinerary'

const step = ref<1 | 2 | 3>(1)
const selectedDistrictIds = ref<string[]>([])
const selectedDays = ref(3)
const selectedTheme = ref<ItineraryTheme>('深度游')
const generatedDays = ref<ItineraryDay[]>([])

const themes: ItineraryTheme[] = ['深度游', '避暑旅居', '自驾探索', '亲子游', '摄影采风', '文化历史']
const dayOptions = [1, 2, 3, 4, 5, 6, 7]

const availableDistricts = computed(() => districts.filter(d => d.available))

function toggleDistrict(id: string) {
  const idx = selectedDistrictIds.value.indexOf(id)
  if (idx > -1) {
    selectedDistrictIds.value.splice(idx, 1)
  } else {
    selectedDistrictIds.value.push(id)
  }
}

function isSelected(id: string) {
  return selectedDistrictIds.value.includes(id)
}

function goStep2() {
  if (selectedDistrictIds.value.length === 0) {
    uni.showToast({ title: '请至少选择一个区县', icon: 'none' })
    return
  }
  step.value = 2
}

function generate() {
  generatedDays.value = buildItinerary(
    selectedDistrictIds.value,
    selectedDays.value,
    selectedTheme.value,
    districts
  )
  step.value = 3
}

function saveItinerary() {
  // TODO: 保存到云数据库
  uni.showToast({ title: '行程已保存', icon: 'success' })
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/itinerary/detail?from=builder' })
  }, 1500)
}

function shareItinerary() {
  uni.showShareMenu({ withShareTicket: true })
}
</script>

<template>
  <view class="builder">
    <!-- 步骤指示器 -->
    <view class="steps">
      <view v-for="n in 3" :key="n" class="step-item">
        <view :class="['step-dot', step >= n ? 'active' : '']">{{ n }}</view>
        <text :class="['step-label', step >= n ? 'active' : '']">
          {{ n === 1 ? '选区县' : n === 2 ? '选天数' : '生成行程' }}
        </text>
      </view>
    </view>

    <!-- Step 1：选择区县 -->
    <view v-if="step === 1" class="step-content">
      <text class="step-title">想去哪些区县？</text>
      <text class="step-hint">可多选，行程将按最优顺序排列</text>
      <view class="district-grid">
        <view
          v-for="d in availableDistricts"
          :key="d.id"
          :class="['district-chip', isSelected(d.id) ? 'selected' : '']"
          @tap="toggleDistrict(d.id)"
        >
          <text class="chip-name">{{ d.name }}</text>
          <text class="chip-tag">{{ d.tags[0] }}</text>
        </view>
      </view>
      <view class="btn-primary" @tap="goStep2">下一步</view>
    </view>

    <!-- Step 2：选择天数和主题 -->
    <view v-if="step === 2" class="step-content">
      <text class="step-title">计划玩几天？</text>
      <view class="day-options">
        <view
          v-for="d in dayOptions"
          :key="d"
          :class="['day-chip', selectedDays === d ? 'selected' : '']"
          @tap="selectedDays = d"
        >
          {{ d }}天
        </view>
      </view>

      <text class="step-title" style="margin-top: 40rpx;">旅行主题</text>
      <view class="theme-options">
        <view
          v-for="t in themes"
          :key="t"
          :class="['theme-chip', selectedTheme === t ? 'selected' : '']"
          @tap="selectedTheme = t"
        >
          {{ t }}
        </view>
      </view>

      <view style="display: flex; gap: 20rpx; margin-top: 60rpx;">
        <view class="btn-secondary" @tap="step = 1">上一步</view>
        <view class="btn-primary" style="flex: 1;" @tap="generate">生成行程</view>
      </view>
    </view>

    <!-- Step 3：行程预览 -->
    <view v-if="step === 3" class="step-content">
      <text class="step-title">你的 {{ selectedDays }} 日行程</text>
      <text class="step-hint">可上下拖动调整景点顺序</text>

      <view v-for="day in generatedDays" :key="day.dayIndex" class="day-card card">
        <text class="day-label">{{ day.label }}</text>
        <text v-if="day.note" class="day-note">{{ day.note }}</text>

        <view v-for="stop in day.stops" :key="stop.order" class="stop-item">
          <view class="stop-time">{{ stop.duration }}</view>
          <view class="stop-info">
            <text class="stop-name">{{ stop.attractionName }}</text>
            <text class="stop-desc">{{ stop.attractionDesc.slice(0, 40) }}...</text>
          </view>
        </view>

        <view v-if="day.stops.length === 0" class="empty-day">
          <text>暂无数据，请手动添加景点</text>
        </view>
      </view>

      <view style="display: flex; gap: 20rpx; margin-top: 40rpx;">
        <view class="btn-secondary" @tap="step = 2">重新设置</view>
        <view class="btn-primary" style="flex: 1;" @tap="saveItinerary">保存行程</view>
      </view>
      <view class="btn-share" @tap="shareItinerary">分享给朋友</view>
    </view>
  </view>
</template>

<style scoped>
.builder { padding: 30rpx; }

.steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}
.step-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.step-dot {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  background: #eee; color: #999;
  display: flex; align-items: center; justify-content: center;
  font-size: 24rpx; font-weight: 700;
}
.step-dot.active { background: #4A7C59; color: #fff; }
.step-label { font-size: 22rpx; color: #999; }
.step-label.active { color: #4A7C59; font-weight: 600; }

.step-content { }
.step-title { display: block; font-size: 34rpx; font-weight: 700; color: #2D2D2D; margin-bottom: 12rpx; }
.step-hint { display: block; font-size: 24rpx; color: #999; margin-bottom: 32rpx; }

.district-grid { display: flex; flex-wrap: wrap; gap: 20rpx; margin-bottom: 48rpx; }
.district-chip {
  padding: 20rpx 28rpx; border-radius: 16rpx;
  background: #fff; border: 2rpx solid #eee;
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  min-width: 140rpx;
}
.district-chip.selected { border-color: #4A7C59; background: #EBF4EF; }
.chip-name { font-size: 28rpx; font-weight: 600; color: #2D2D2D; }
.chip-tag { font-size: 20rpx; color: #999; }
.district-chip.selected .chip-name { color: #4A7C59; }

.day-options { display: flex; flex-wrap: wrap; gap: 20rpx; margin-bottom: 20rpx; }
.day-chip {
  width: 100rpx; height: 100rpx; border-radius: 16rpx;
  background: #fff; border: 2rpx solid #eee;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: #666;
}
.day-chip.selected { border-color: #4A7C59; background: #EBF4EF; color: #4A7C59; font-weight: 700; }

.theme-options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.theme-chip {
  padding: 14rpx 28rpx; border-radius: 32rpx;
  background: #fff; border: 2rpx solid #eee;
  font-size: 26rpx; color: #666;
}
.theme-chip.selected { border-color: #C45C26; background: #FEF3E2; color: #C45C26; }

.day-card { margin-bottom: 24rpx; }
.day-label { display: block; font-size: 30rpx; font-weight: 700; color: #4A7C59; margin-bottom: 16rpx; }
.day-note { display: block; font-size: 22rpx; color: #999; margin-bottom: 16rpx; }

.stop-item {
  display: flex; gap: 20rpx; padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.stop-time { font-size: 22rpx; color: #C45C26; min-width: 140rpx; padding-top: 4rpx; }
.stop-name { display: block; font-size: 28rpx; font-weight: 600; color: #2D2D2D; margin-bottom: 6rpx; }
.stop-desc { display: block; font-size: 22rpx; color: #999; }
.empty-day { padding: 20rpx 0; color: #ccc; font-size: 24rpx; text-align: center; }

.btn-primary {
  background: #4A7C59; color: #fff; text-align: center;
  padding: 28rpx 0; border-radius: 16rpx; font-size: 30rpx; font-weight: 600;
}
.btn-secondary {
  background: #f5f5f5; color: #666; text-align: center;
  padding: 28rpx 40rpx; border-radius: 16rpx; font-size: 30rpx;
}
.btn-share {
  background: transparent; color: #4A7C59; text-align: center;
  padding: 28rpx 0; border-radius: 16rpx; font-size: 28rpx;
  border: 2rpx solid #4A7C59; margin-top: 20rpx;
}
</style>
