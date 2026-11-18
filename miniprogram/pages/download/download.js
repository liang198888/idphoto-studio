// pages/download/download.js - 下载页逻辑
Page({
  data: {
    orderId: '',
    orderPaid: false,
    paymentMethod: '微信支付',
    paymentTime: '',
    paidAmount: '0.00',
    selectedVersion: 'standard',
    downloading: false,
    standardWidth: 295,
    standardHeight: 413,
    hdWidth: 1181,
    hdHeight: 1653,
    previewImages: []
  },

  onLoad(options) {
    const { orderId, paid } = options
    
    if (orderId) {
      this.setData({ 
        orderId,
        orderPaid: paid === 'true'
      })
      
      // 加载订单详情
      this.loadOrderDetails(orderId)
    }
    
    // 从缓存读取预览图
    const previews = wx.getStorageSync('previewImages') || []
    this.setData({ previewImages: previews })
  },

  async loadOrderDetails(orderId) {
    try {
      wx.showLoading({ title: '加载中...' })
      
      // TODO: 调用后端 API 获取订单详情
      // const res = await wx.request({ url: `${app.globalData.apiBaseUrl}/api/order/query/${orderId}` })
      
      // 模拟数据（开发阶段）
      setTimeout(() => {
        this.setData({
          orderPaid: true,
          paymentTime: new Date().toLocaleString(),
          paidAmount: '9.90'
        })
        wx.hideLoading()
      }, 500)
    } catch (error) {
      console.error('加载订单失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  selectVersion(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ selectedVersion: type })
  },

  async downloadImage() {
    if (this.data.downloading) return

    this.setData({ downloading: true })
    wx.showLoading({ title: '准备下载...' })

    try {
      // TODO: 调用后端 API 获取下载链接
      // const res = await wx.request({
      //   url: `${app.globalData.apiBaseUrl}/api/download`,
      //   data: { orderId: this.data.orderId, version: this.data.selectedVersion }
      // })

      // 模拟下载流程
      await this.simulateDownload()
      
      wx.hideLoading()
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('下载失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '下载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ downloading: false })
    }
  },

  simulateDownload() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500)
    })
  },

  saveToAlbum() {
    if (this.data.previewImages.length === 0) {
      wx.showToast({
        title: '暂无图片',
        icon: 'none'
      })
      return
    }

    let index = 0
    const saveNext = () => {
      if (index >= this.data.previewImages.length) {
        wx.showToast({
          title: '全部保存成功',
          icon: 'success'
        })
        return
      }

      wx.saveImageToPhotosAlbum({
        filePath: this.data.previewImages[index],
        success: () => {
          index++
          saveNext()
        },
        fail: (err) => {
          if (err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '需要授权',
              content: '请允许访问相册权限',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting()
                }
              }
            })
          } else {
            wx.showToast({
              title: '保存失败',
              icon: 'error'
            })
          }
        }
      })
    }

    saveNext()
  },

  shareApp() {
    // 分享海报
    wx.navigateTo({
      url: '/pages/share/share'
    })
  },

  backToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage() {
    return {
      title: '我用这个小程序制作证件照，免费抠图换底，超好用！',
      path: '/pages/index/index',
      imageUrl: this.data.previewImages[0] || ''
    }
  }
})
