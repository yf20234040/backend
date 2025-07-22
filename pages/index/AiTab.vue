<template>
  <view class="container">
    <!-- 微信小程序风格导航栏 -->
    <view class="wx-navbar" :style="{ paddingTop: statusBarHeight }">
      <!-- 左侧返回按钮 -->
      <view class="navbar-left" @click="goBack">
        <view class="back-icon">
          <!-- 使用微信原生风格的返回箭头 -->
          <view class="arrow-left"></view>
        </view>
      </view>
      
      <!-- 中间标题 -->
      <view class="navbar-center">
        <text class="navbar-title">AI助手</text>
      </view>
      
      <!-- 右侧图标 -->
      <view class="navbar-right" @click="handleSettings">
        <text class="settings-icon">⚙️</text>
      </view>
    </view>
    
    <!-- 对话内容区（保持不变） -->
    <scroll-view class="chat-container" scroll-y="true" :scroll-with-animation="true" :scroll-top="scrollTop">
      <!-- 欢迎语 -->
      <view class="welcome-message">
        <text>你好，有什么我能帮你的吗</text>
      </view>
      
      <!-- 对话记录（一问一答布局） -->
      <view class="message-pair" v-for="(pair, pairIndex) in formattedChatHistory" :key="pairIndex">
        <!-- 用户消息 -->
        <view class="message-item user-message">
          <view class="avatar user-avatar">
            <image src="/static/user-avatar.png" mode="widthFix" :lazy-load="true"></image>
          </view>
          <view class="message-content user-content">
            <text>{{ pair.user.content }}</text>
          </view>
        </view>
        
        <!-- AI消息（如果存在） -->
        <view class="message-item ai-message" v-if="pair.assistant">
          <view class="avatar ai-avatar">
            <image src="/static/ai-avatar.png" mode="widthFix" :lazy-load="true"></image>
          </view>
          <view class="message-content ai-content">
            <text>{{ pair.assistant.content }}</text>
          </view>
        </view>
        
        <!-- 加载状态（仅当前对话对显示） -->
        <view class="loading" v-if="isLoading && pairIndex === formattedChatHistory.length - 1">
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 输入区域（保持不变） -->
    <view class="chat-input">
      <textarea 
        class="input-field" 
        placeholder="输入您的问题..." 
        v-model="inputText"
        @input="autoResize"
        @confirm="sendMessage"
        maxlength="500"
        :style="{ height: textareaHeight + 'px' }"
      />
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || isLoading">发送</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      chatHistory: [],
      inputText: '',
      scrollTop: 0,
      isLoading: false,
      textareaHeight: 80,
      statusBarHeight: 0,
      // 阿里云智能体配置（保持不变）
      apiKey: 'sk-c99a267c10224a0a85954153f2879fc2',
      appId: 'a0a3038170474d4baea968b98c806fc3',
      apiUrl: 'https://dashscope.aliyuncs.com/api/v1/apps'
    };
  },
  computed: {
    formattedChatHistory() {
      // 保持不变
      const pairs = [];
      let currentPair = { user: null, assistant: null };
      
      this.chatHistory.forEach(item => {
        if (item.role === 'user') {
          if (currentPair.user) pairs.push(currentPair);
          currentPair = { user: item, assistant: null };
        } else if (item.role === 'assistant') {
          currentPair.assistant = item;
        }
      });
      
      if (currentPair.user) pairs.push(currentPair);
      return pairs;
    }
  },
  onLoad() {
    // 获取状态栏高度（微信小程序必填）
    const sys = uni.getSystemInfoSync();
    this.statusBarHeight = sys.statusBarHeight + 'px';
  },
  methods: {
    // 返回上一页（添加微信风格的动画效果）
    goBack() {
      uni.navigateBack({
        animationType: 'slide-out-right', // 微信小程序返回动画
        animationDuration: 300
      });
    },
    // 新增：设置按钮点击事件
    handleSettings() {
      // 可添加设置页面跳转逻辑
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none',
        duration: 1500
      });
    },
    // 其他方法保持不变
    autoResize(e) {
      const textarea = e.target;
      this.textareaHeight = Math.min(240, Math.max(80, textarea.scrollHeight));
    },
    async sendMessage() {
      // 保持不变
      const question = this.inputText.trim();
      if (!question || this.isLoading) return;
      
      this.chatHistory.push({ role: 'user', content: question });
      this.inputText = '';
      this.textareaHeight = 80;
      this.scrollToBottom();
      this.isLoading = true;
      
      try {
        const rawAnswer = await this.callAliyunAI(question);
        const cleanAnswer = this.cleanResponse(rawAnswer);
        this.chatHistory.push({ role: 'assistant', content: cleanAnswer });
      } catch (error) {
        this.chatHistory.push({ 
          role: 'assistant', 
          content: `调用失败：${error.message || '请稍后重试'}` 
        });
        console.error('API错误:', error);
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },
    scrollToBottom() {
      setTimeout(() => this.scrollTop = 99999, 100);
    },
    cleanResponse(text) {
      if (!text) return '';
      return text.replace(/#|\*|`|~|>/g, '').trim();
    },
    async callAliyunAI(question) {
      // 保持不变
      const fullUrl = `${this.apiUrl}/${this.appId}/completion`;
      
      try {
        const response = await uni.request({
          url: fullUrl,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          data: {
            input: { prompt: question },
            parameters: {},
            debug: {}
          }
        });
        
        const err = response[0];
        const res = response[1] || response;
        
        if (err) throw new Error(`网络错误：${err.errMsg}`);
        if (res.statusCode !== 200) {
          throw new Error(`服务端错误：${res.statusCode}，${res.data?.message || ''}`);
        }
        if (!res.data?.output?.text) {
          throw new Error('未获取到有效回复');
        }
        
        return res.data.output.text;
      } catch (error) {
        throw error;
      }
    }
  }
};
</script>

<style scoped>
/* 基础样式*/
.container {
  min-height: 100vh;
  background-color: #f5f7f5;
  background-image: 
    radial-gradient(#e0eae0 0.5px, transparent 0.5px),
    radial-gradient(#e0eae0 0.5px, #f5f7f5 0.5px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  display: flex;
  flex-direction: column;
}

/* 微信小程序风格导航栏核心样式 */
.wx-navbar {
  height: 44px; /* 微信导航栏标准高度 */
  background-color: #ffffff; /* 微信导航栏默认白底 */
  border-bottom: 1px solid #f1f1f1; /* 微信风格分割线 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

/* 左侧返回按钮 */
.navbar-left {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 返回箭头 */
.arrow-left {
  width: 14px;
  height: 14px;
  border: 2px solid #333;
  border-width: 0 0 2px 2px;
  transform: rotate(45deg);
  margin-right: 6px; /* 视觉上更居中 */
}

/* 中间标题 */
.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 44px; /* 避开左右按钮区域 */
  box-sizing: border-box;
}

.navbar-title {
  font-size: 15px; /* 微信导航栏标题标准字体大小 */
  color: #000; /* 微信标题默认黑色 */
  font-weight: 500; /* 微信标题字重 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* 右侧设置按钮 */
.navbar-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-icon {
  font-size: 20px;
  color: #333; /* 微信图标默认颜色 */
}

/* 对话内容区*/
.chat-container {
  flex: 1;
  padding: 16rpx 15rpx; /* 微信常用内边距 */
  box-sizing: border-box;
  overflow-y: auto;
}

/* 适配微信风格 */
.welcome-message {
  background-color: #eaf7f0;
  color: #333;
  padding: 24rpx 30rpx;
  border-radius: 20rpx;
  margin: 20rpx auto 40rpx;
  font-size: 30rpx;
  text-align: center;
  max-width: 80%;
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.message-pair {
  margin-bottom: 30rpx;
  animation: slideIn 0.3s ease-out;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  max-width: 100%;
  margin-bottom: 15rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f0f5f0;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
}

.avatar image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 75%;
  padding: 24rpx 30rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  line-height: 1.6;
  word-break: break-all;
  position: relative;
}

.user-message {
  flex-direction: row-reverse;
}

.user-content {
  background-color: #4caf50;
  color: white;
  border-top-right-radius: 8rpx;
}

.user-content::after {
  content: '';
  position: absolute;
  right: -14rpx;
  top: 20rpx;
  border-top: 14rpx solid transparent;
  border-bottom: 14rpx solid transparent;
  border-left: 14rpx solid #4caf50;
}

.ai-content {
  background-color: white;
  color: #333;
  border-top-left-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.ai-content::after {
  content: '';
  position: absolute;
  left: -14rpx;
  top: 20rpx;
  border-top: 14rpx solid transparent;
  border-bottom: 14rpx solid transparent;
  border-right: 14rpx solid white;
}

.loading {
  display: flex;
  gap: 12rpx;
  padding: 20rpx 30rpx;
  align-items: center;
  background-color: white;
  border-radius: 20rpx;
  max-width: 50%;
  margin-left: 100rpx;
}

.loading-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #4caf50;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

.chat-input {
  display: flex;
  gap: 16rpx;
  align-items: center;
  padding: 16rpx 30rpx 30px 30rpx; /* 微信风格内边距 */
  background-color: white;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.03);
  box-sizing: border-box;
}

.input-field {
  flex: 1;
  min-height: 80rpx;
  max-height: 240rpx;
  background: #f5f7f5;
  border-radius: 40rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  border: 1rpx solid #eee;
  resize: none;
  outline: none;
  line-height: 1.4;
}

.send-btn {
  width: 120rpx;
  height: 80rpx;
  background: #4caf50;
  color: #fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border: none;
  transition: all 0.2s;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn:disabled {
  background-color: #b2d8b7;
  opacity: 0.7;
}

/* 动画效果*/
@keyframes loading {
  0%, 80%, 100% { transform: scale(0.6); }
  40% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>