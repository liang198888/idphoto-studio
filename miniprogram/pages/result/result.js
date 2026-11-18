// pages/result/result.js - 结果页逻辑
const app = getApp();

Page({
  data: {
    imageId: '',
    imagePath: '',
    processedImages: [],
    selectedImage: null,
    showPayModal: false,
    loading: true,
    
    // 价格
    standardPrice: 9.9,
    hdPrice: 19.9,
    selectedPrice: 'standard',
    showOriginalPrice: false,
    isPaid: false,
    
    // 支付相关
    payAmount: 9.9,
    
    // 背景色选项
    bgColors: [
      { name: '白色', color: '#FFFFFF' },
      { name: '蓝色', color: '#438EDB' },
      { name: '红色', color: '#C40C0C' },
      { name: '灰色', color: '#8B8B8B' },
      { name: '浅蓝', color: '#6FA8DC' }
    ],
    selectedBgColor: '#438EDB'
  },
  
  onLoad(options) {
    this.setData({ 
      imageId: options.imageId || Date.now().toString(),
      imagePath: decodeURIComponent(options.imagePath || ''),
      selectedBg: options.bg || '#438EDB'
    });
    
    this.loadProcessedImages();
    this.checkPaymentStatus();
  },
  
  // 加载处理后的图片
  async loadProcessedImages() {
    wx.showLoading({ title: '正在生成...' });
    
    try {
      // TODO: 调用后端API获取处理结果
      // 这里使用占位数据
      const mockImages = [
        {
          id: '1',
          url: this.data.imagePath || '/images/demo-1.jpg',
          version: 'standard',
          width: 295,
          height: 413
        },
        {
          id: '2',
          url: this.data.imagePath || '/images/demo-1.jpg',
          version: 'hd',
          width: 590,
          height: 826
        }
      ];
      
      this.setData({
        processedImages: mockImages,
        selectedImage: mockImages[0],
        loading: false
      });
      
      wx.hideLoading();
    } catch (err) {
      console.error('加载失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },
  
  // 检查支付状态
  async checkPaymentStatus() {
    const orderId = wx.getStorageSync('lastOrderId');
    if (orderId) {
      try {
        const res = await wx.request({
          url: `${app.globalData.apiBaseUrl}/order/query/${orderId}`,
          method: 'GET'
        });
        
        if (res.data.success && res.data.order.status === 'paid') {
          this.setData({ isPaid: true, selectedVersion: res.data.order.productType });
        }
      } catch (err) {
        console.error('查询支付状态失败:', err);
      }
    }
  },
  
  // 选择图片版本
  selectImage(e) {
    const index = e.currentTarget.dataset.index;
    const image = this.data.processedImages[index];
    
    this.setData({ 
      selectedImage: image,
      selectedPrice: image.version,
      payAmount: image.version === 'hd' ? this.data.hdPrice : this.data.standardPrice
    });
  },
  
  // 预览大图
  previewImage(e) {
    const url = e.currentTarget.dataset.url || this.data.selectedImage?.url;
    if (!url) return;
    
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },
  
  // 切换背景色
  switchBgColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({ selectedBgColor: color });
    
    // TODO: 重新生成指定背景的证件照
    wx.showToast({
      title: '正在切换...',
      icon: 'loading'
    });
  },
  
  // 选择价格套餐
  selectPrice(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedPrice: type,
      payAmount: type === 'hd' ? this.data.hdPrice : this.data.standardPrice
    });
  },
  
  // 打开支付弹窗
  openPayModal() {
    this.setData({ showPayModal: true });
  },
  
  // 关闭支付弹窗
  closePayModal() {
    this.setData({ showPayModal: false });
  },
  
  // 确认支付
  async confirmPayment() {
    this.setData({ paying: true });
    this.closePayModal();
    
    wx.showLoading({ title: '支付中...' });
    
    try {
      // 创建订单
      const orderRes = await wx.request({
        url: `${app.globalData.apiBaseUrl}/order/create`,
        method: 'POST',
        data: {
          userId: app.globalData.userId,
          productType: this.data.selectedPrice,
          amount: this.data.payAmount,
          imageId: this.data.imageId
        }
      });
      
      if (orderRes.data.success) {
        const { orderId, timeStamp, nonceStr, package: pkg, signType, paySign } = orderRes.data.data;
        
        // 发起微信支付
        const payResult = await new Promise((resolve, reject) => {
          wx.requestPayment({
            timeStamp,
            nonceStr,
            package: pkg,
            signType,
            paySign,
            success: resolve,
            fail: reject
          });
        });
        
        // 支付成功
        this.setData({ isPaid: true, orderId });
        wx.setStorageSync('lastOrderId', orderId);
        
        // 减少免费次数
        const freeTrialsLeft = app.globalData.freeTrialsLeft - 1;
        wx.setStorageSync('freeTrialsLeft', freeTrialsLeft);
        
        wx.showToast({
          title: '支付成功！',
          icon: 'success'
        });
        
      } else {
        throw new Error(orderRes.data.message);
      }
    } catch (err) {
      console.error('支付失败:', err);
      
      if (err.errMsg && err.errMsg.includes('cancel')) {
        // 用户取消支付
        wx.showToast({
          title: '已取消支付',
          icon: 'none'
        });
      } else {
        wx.showModal({
          title: '支付失败',
          content: err.message || '请重试或联系客服',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      }
    } finally {
      this.setData({ paying: false });
      wx.hideLoading();
    }
  },
  
  // 保存相册
  saveToAlbum() {
    if (!this.data.selectedImage) return;
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.selectedImage.url,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要授权',
            content: '请在设置中允许访问相册',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },
  
  // 下载图片
  downloadImage() {
    if (!this.data.selectedImage) return;
    
    wx.downloadFile({
      url: this.data.selectedImage.url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '下载成功', icon: 'success' });
            }
          });
        }
      }
    });
  },
  
  // 下载PDF
  downloadPDF() {
    wx.showToast({
      title: 'PDF功能开发中',
      icon: 'none'
    });
  },
  
  // 生成分享海报
  async generatePoster() {
    wx.showLoading({ title: '生成中...' });
    
    try {
      // TODO: 调用后端API生成海报
      const posterUrl = `https://your-domain.com/poster/${this.data.imageId}.png`;
      
      wx.navigateTo({
        url: `/pages/share/share?url=${encodeURIComponent(posterUrl)}`
      });
    } catch (err) {
      console.error('生成海报失败:', err);
      wx.hideLoading();
    }
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
