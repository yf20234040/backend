<template>
  <view class="container">
    <view class="nav-bar beautify-navbar" :style="{paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 88) + 'rpx'}">
      <view class="nav-title">文档</view>
      <!-- 右侧不放自定义按钮，避免遮挡胶囊按钮 -->
    </view>
    <view class="content">
      <view class="content-inner">
        <view class="section">
          <view class="section-header">
            <text class="section-title">项目文档</text>
          </view>
          <view class="doc-list">
            <view class="doc-item" v-for="(doc, index) in documents" :key="index" @click="openDoc(doc)">
              <view class="doc-icon">📄</view>
              <view class="doc-info">
                <text class="doc-title">{{ doc.title }}</text>
                <text class="doc-desc">{{ doc.description }}</text>
              </view>
              <view class="doc-arrow">→</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      documents: [
        {
          title: '项目计划书',
          description: '项目整体规划与实施方案',
          type: 'pdf'
        },
        {
          title: '会议纪要',
          description: '项目会议记录与决策',
          type: 'doc'
        },
        {
          title: '技术文档',
          description: '技术实现方案与说明',
          type: 'pdf'
        },
        {
          title: '用户手册',
          description: '产品使用指南',
          type: 'pdf'
        }
      ],
      statusBarHeight: 0
    }
  },
  onLoad() {
    const sys = uni.getSystemInfoSync();
    this.statusBarHeight = sys.statusBarHeight ? sys.statusBarHeight + 'px' : '40px';
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    openDoc(doc) {
      uni.showToast({
        title: `打开${doc.title}`,
        icon: 'none'
      });
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx; /* 为tabBar留出空间 */
}

.custom-navbar {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #eee;
}

.nav-left, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-search {
  font-size: 32rpx;
  color: #666;
}

.content {
  flex: 1;
  padding: 32rpx;
}

.content-inner {
  padding: 0 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.doc-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.doc-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.doc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.doc-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.doc-desc {
  font-size: 24rpx;
  color: #666;
}

.doc-arrow {
  font-size: 32rpx;
  color: #999;
}

.beautify-navbar {
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  position: relative;
  z-index: 10;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}
.nav-left, .nav-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-back, .nav-icon {
  font-size: 32rpx;
  color: #666;
}
</style> 