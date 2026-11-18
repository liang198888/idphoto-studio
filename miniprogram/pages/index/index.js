// pages/index/index.js - 首页逻辑
const app = getApp();

Page({
  data: {
    specs: [
      { name: '1寸', value: '1inch', size: '295×413px' },
      { name: '2寸', value: '2inch', size: '413×579px' },
      { name: '小2寸', value: 'small2inch', size: '354×472px' },
      { name: '大2寸', value: 'large2inch', size: '480×640px' },
      { name: '简历照', value: 'resume', size: '390×567px' },
      { name: '自定义', value: 'custom', size: '自定义尺寸' }
    ],
    bgColors: [
      { name: '白色', color: '#FFFFFF' },
      { name: '蓝色', color: '#438EDB' },
      { name: '红色', color: '#C40C0C' },
      { name: '灰色', color: '#8B8B8B' },
      { name: '浅蓝', color: '#6FA8DC' }
    ],
    cutModes: ['标准模式（快）', '精细模式（准）'],
    
    selectedSpec: '1inch',
    selectedBg: '#FFFFFF',
    cutModeIndex: 0,
    protectBody: true,
    gradient: false,
    showCustomSize: false,
    customWidth: 295,
    customHeight: 413,
    
    currentFile: null,
    hasImage: false,
    generating: false,
    
    canUseFreeTrial: true,
    freeTrialsLeft: 3
  },
  
  onLoad() {
    this.checkUserStatus();
  },
  
  onShow() {
    this.updateUserStatus();
  },
  
  checkUserStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        canUseFreeTrial: userInfo.freeTrialsLeft > 0
      });
    }
  },
  
  updateUserStatus() {
    const orderCount = parseInt(wx.getStorageSync('orderCount') || '0');
    this.setData({ orderCount });
  },
  
  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        const fileName = tempFilePath.split('/').pop();
        this.setData({
          currentFile: { name: fileName, path: tempFilePath },
          hasImage: true
        });
        
        // 预览图片
        wx.previewImage({
          current: tempFilePath,
          urls: [tempFilePath]
        });
      }
    });
  },
  
  // 移除图片
  removeFile() {
    this.setData({
      currentFile: null,
      hasImage: false
    });
  },
  
  // 选择规格
  selectSpec(e) {
    const spec = e.currentTarget.dataset.spec;
    this.setData({ selectedSpec: spec });
    
    // 自定义规格显示输入框
    this.setData({
      showCustomSize: spec === 'custom'
    });
  },
  
  // 选择背景色
  selectBg(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({ selectedBg: color });
  },
  
  // 切换抠图模式
  onCutModeChange(e) {
    this.setData({ cutModeIndex: e.detail.value });
  },
  
  // 切换保留衣领
  onProtectBodyChange(e) {
    this.setData({ protectBody: e.detail.value });
  },
  
  // 切换渐变背景
  onGradientChange(e) {
    this.setData({ gradient: e.detail.value });
  },
  
  // 自定义宽度输入
  onCustomWidthInput(e) {
    this.setData({ customWidth: parseInt(e.detail.value) || 0 });
  },
  
  // 自定义高度输入
  onCustomHeightInput(e) {
    this.setData({ customHeight: parseInt(e.detail.value) || 0 });
  },
  
  // 生成证件照
  async generatePhoto() {
    if (!this.data.hasImage) {
      wx.showToast({
        title: '请先上传照片',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.canUseFreeTrial) {
      // 引导付费
      wx.showModal({
        title: '免费体验已用完',
        content: '标准版 ¥9.9/张，高清版 ¥19.9/张\n是否前往制作？',
        confirmText: '立即制作',
        cancelText: '返回首页',
        success: (res) => {
          if (res.confirm) {
            this.startGeneration();
          }
        }
      });
      return;
    }
    
    this.startGeneration();
  },
  
  // 开始生成
  async startGeneration() {
    this.setData({ generating: true });
    wx.showLoading({ title: '正在智能抠图...' });
    
    try {
      const { currentFile, selectedSpec, selectedBg, cutModeIndex, protectBody, gradient } = this.data;
      
      // TODO: 调用后端API处理图片
      // 这里模拟一个延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 跳转到结果页
      wx.redirectTo({
        url: `/pages/result/result?imagePath=${encodeURIComponent(currentFile.path)}&spec=${selectedSpec}&bg=${selectedBg}`
      });
      
    } catch (err) {
      console.error('生成失败:', err);
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'error'
      });
    } finally {
      this.setData({ generating: false });
      wx.hideLoading();
    }
  },
  
  // 打开H5网页版（零成本方案）
  openH5Tool() {
    wx.navigateTo({
      url: '/pages/h5tool/h5tool'
    })
  },
  
  // 分享给好友
  onShareAppMessage() {
    return {
      title: '我用这个小程序做了超专业的证件照！快来试试',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    };
  }
});
