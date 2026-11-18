// app.js - 证件照小程序主入口
App({
  globalData: {
    userId: null,
    userInfo: null,
    freeTrialsLeft: 3, // 免费体验次数
    apiBaseUrl: 'https://your-domain.com/api' // 替换为你的服务器地址
  },
  
  onLaunch() {
    // 检查登录状态
    this.checkLogin();
    
    // 上报性能数据
    this.reportPerformance();
  },
  
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.verifyToken(token);
    } else {
      this.showLoginTip();
    }
  },
  
  async verifyToken(token) {
    try {
      const res = await wx.request({
        url: `${this.globalData.apiBaseUrl}/user/verify`,
        header: { 'Authorization': `Bearer ${token}` },
        method: 'GET'
      });
      
      if (res.data.success) {
        this.globalData.userId = res.data.data.userId;
        this.globalData.userInfo = res.data.data.userInfo;
        wx.setStorageSync('userInfo', res.data.data.userInfo);
      } else {
        this.handleTokenExpired();
      }
    } catch (err) {
      console.error('Token验证失败:', err);
      this.handleTokenExpired();
    }
  },
  
  handleTokenExpired() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.userId = null;
    this.globalData.userInfo = null;
  },
  
  showLoginTip() {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
  },
  
  async loginWithWechat() {
    try {
      const code = await wx.login();
      const res = await wx.request({
        url: `${this.globalData.apiBaseUrl}/auth/wechat`,
        method: 'POST',
        data: { code: code.code }
      });
      
      if (res.data.success) {
        const { token, userInfo, freeTrials } = res.data.data;
        this.globalData.userId = userInfo.id;
        this.globalData.userInfo = userInfo;
        this.globalData.freeTrialsLeft = freeTrials.left;
        
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', userInfo);
        
        return { success: true };
      } else {
        throw new Error(res.data.message || '登录失败');
      }
    } catch (err) {
      console.error('微信登录失败:', err);
      return { success: false, error: err.message };
    }
  },
  
  reportPerformance() {
    // 上报使用数据用于优化
    const performance = wx.getSystemInfoSync();
    console.log('设备信息:', performance.model, performance.system);
  },
  
  // 工具方法
  formatPrice(price) {
    return `¥${price.toFixed(2)}`;
  },
  
  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  },
  
  generateOrderId() {
    return 'IP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
});
