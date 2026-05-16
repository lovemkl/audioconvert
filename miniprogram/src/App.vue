<script setup lang="ts">
// 初始化微信云开发
onLaunch(() => {
  // 替换为实际云环境ID
  const cloudEnvId = 'YOUR_CLOUD_ENV_ID'
  wx.cloud.init({
    env: cloudEnvId,
    traceUser: true,
  })
})
</script>

<style>
page {
  background-color: #F7F5F0;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

/* 全局颜色变量（小程序不支持CSS vars的部分场景，用class替代） */
.text-primary { color: #4A7C59; }
.text-secondary { color: #E8A838; }
.text-accent { color: #C45C26; }
.text-muted { color: #999; }
.bg-primary { background-color: #4A7C59; }
.bg-card { background-color: #ffffff; }

/* 通用卡片样式 */
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

/* 章节标题 */
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D2D2D;
  margin-bottom: 20rpx;
}

/* 标签 */
.tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background: #EBF4EF;
  color: #4A7C59;
  margin-right: 8rpx;
  margin-bottom: 8rpx;
}

.tag-orange {
  background: #FEF3E2;
  color: #C45C26;
}
</style>
