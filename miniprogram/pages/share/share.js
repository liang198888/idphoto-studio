// pages/share/share.js - 分享海报页
Page({
  data: {
    posterUrl: '',
    inviteCode: 'IDPZ2026',
    saving: false,
    loading: true
  },

  onLoad(options) {
    // 从缓存读取分享数据
    const shareData = wx.getStorageSync('shareData') || {}
    
    this.setData({
      inviteCode: options.inviteCode || 'IDPZ2026',
      loading: false
    })

    // 生成或加载分享海报
    this.generatePoster()
  },

  onShow() {
    // 页面显示时刷新
  },

  async generatePoster() {
    try {
      wx.showLoading({ title: '生成海报中...' })

      // 模拟海报生成（实际应调用后端 API）
      const mockPoster = 'https://via.placeholder.com/750x1334/667eea/ffffff?text=%E8%AF%81%E4%BB%B6%E7%85%A7'
      
      // 保存临时路径
      await this.savePosterImage(mockPoster)

      this.setData({
        posterUrl: mockPoster,
        loading: false
      })
    } catch (error) {
      console.error('生成海报失败:', error)
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    } finally {
      wx.hideLoading()
    }
  },

  async savePosterImage(url) {
    // 下载图片到本地
    const res = await wx.downloadFile({ url })
    return res.tempFilePath
  },

  async savePoster() {
    if (this.data.saving) return

    this.setData({ saving: true })

    try {
      wx.showLoading({ title: '保存中...' })

      // 保存图片到相册
      await wx.saveImageToPhotosAlbum({
        filePath: this.data.posterUrl
      })

      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存失败:', error)
      
      if (error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要先授权相册权限才能保存图片',
          confirmText: '去授权',
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
    } finally {
      this.setData({ saving: false })
      wx.hideLoading()
    }
  },

  copyInviteCode() {
    const code = this.data.inviteCode
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '邀请码已复制',
          icon: 'success'
        })
      }
    })
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: `制作了一张证件照，免费帮你抠图换底！`,
      path: `/pages/index/index?invite=${this.data.inviteCode}`,
      imageUrl: this.data.posterUrl || ''
    }
  }
})
