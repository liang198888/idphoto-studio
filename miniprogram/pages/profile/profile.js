// pages/profile/profile.js - 个人中心逻辑
const app = getApp();

Page({
  data: {
    userInfo: null,
    userId: null,
    isMember: false,
    expireDate: '',
    orderCount: 0,
    freeTrialsLeft: 3,
    totalSpent: '0',
    cacheSize: '0MB'
  },
  
  onLoad() {
    this.checkUserStatus();
    this.loadUserData();
  },
  
  onShow() {
    this.updateUserInfo();
  },
  
  checkUserStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userId: userInfo.id || '已登录',
        isMember: userInfo.isMember || false,
        expireDate: userInfo.expireDate || ''
      });
    } else {
      this.setData({
        userId: '未登录',
        userInfo: null
      });
    }
  },
  
  updateUserInfo() {
    this.checkUserStatus();
    
    // 从storage加载用户数据
    const orderCount = parseInt(wx.getStorageSync('orderCount') || '0');
    const freeTrialsLeft = parseInt(wx.getStorageSync('freeTrialsLeft') || '3');
    const totalSpent = parseFloat(wx.getStorageSync('totalSpent') || '0').toFixed(1);
    
    this.setData({
      orderCount,
      freeTrialsLeft,
      totalSpent
    });
  },
  
  loadUserData() {
    // TODO: 调用API获取用户详细信息
    console.log('Loading user data...');
  },
  
  login() {
    wx.login({
      success: async (res) => {
        if (res.code) {
          try {
            const result = await app.loginWithWechat();
            if (result.success) {
              this.updateUserInfo();
              wx.showToast({ title: '登录成功', icon: 'success' });
            }
          } catch (err) {
            console.error('登录失败:', err);
          }
        }
      }
    });
  },
  
  goToOrders() {
    wx.navigateTo({
      url: '/pages/order/order'
    });
  },
  
  goToHistory() {
    wx.showToast({
      title: '制作历史功能开发中',
      icon: 'none'
    });
  },
  
  shareApp() {
    wx.shareAppMessage({
      title: '我用这个小程序做了超专业的证件照！快来试试',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    });
  },
  
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage();
          this.setData({
            cacheSize: '0MB'
          });
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  about() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },
  
  feedback() {
    wx.showToast({
      title: '反馈功能开发中',
      icon: 'none'
    });
  }
});
