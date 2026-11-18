// pages/pay/pay.js - 支付页面
const app = getApp();

Page({
  data: {
    orderId: '',
    amount: 0,
    productType: 'standard',
    paying: false,
    payStatus: '' // pending | success | failed
  },
  
  onLoad(options) {
    this.setData({
      orderId: options.orderId || '',
      productType: options.type || 'standard'
    });
    
    this.loadOrderDetails();
  },
  
  async loadOrderDetails() {
    try {
      const res = await wx.request({
        url: `${app.globalData.apiBaseUrl}/order/detail/${this.data.orderId}`,
        method: 'GET'
      });
      
      if (res.data.success) {
        this.setData({
          amount: res.data.data.amount,
          productType: res.data.data.productType
        });
      }
    } catch (err) {
      console.error('加载订单失败:', err);
    }
  },
  
  async handlePayment() {
    if (this.data.paying) return;
    
    this.setData({ paying: true, payStatus: 'pending' });
    wx.showLoading({ title: '正在支付...' });
    
    try {
      // 获取微信支付参数
      const payRes = await wx.request({
        url: `${app.globalData.apiBaseUrl}/payment/unifiedorder`,
        method: 'POST',
        data: {
          orderId: this.data.orderId,
          appId: app.globalData.appId
        }
      });
      
      if (payRes.data.success) {
        const { timeStamp, nonceStr, package: pkg, signType, paySign } = payRes.data.data;
        
        // 调用微信支付
        const result = await new Promise((resolve, reject) => {
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
        
        this.setData({ 
          payStatus: 'success',
          paying: false 
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '支付成功！',
          icon: 'success'
        });
        
        // 延迟跳转下载页
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/download/download?orderId=${this.data.orderId}`
          });
        }, 2000);
        
      } else {
        throw new Error(payRes.data.message);
      }
    } catch (err) {
      console.error('支付失败:', err);
      this.setData({ payStatus: 'failed', paying: false });
      
      wx.showModal({
        title: '支付失败',
        content: err.message || '请重试或联系客服',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 联系客服
  contactService() {
    wx.makePhoneCall({
      phoneNumber: '400-XXX-XXXX' // 替换为实际客服电话
    });
  }
});
