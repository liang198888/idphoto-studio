// pages/order/order.js - 订单列表页逻辑
const app = getApp()

Page({
  data: {
    loading: false,
    orders: [],
    currentTab: 'all',
    tabs: [
      { label: '全部', value: 'all', count: 0 },
      { label: '待支付', value: 'pending', count: 0 },
      { label: '已完成', value: 'paid', count: 0 },
      { label: '已取消', value: 'failed', count: 0 }
    ],
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad(options) {
    this.loadOrders(true)
  },

  onShow() {
    // 页面显示时刷新订单数据
    if (this.data.orders.length > 0) {
      this.loadOrders(true)
    }
  },

  // 加载订单列表
  async loadOrders(reset = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      wx.showLoading({ title: '加载中...' })
      
      // TODO: 调用后端 API
      // const res = await wx.request({
      //   url: `${app.globalData.apiBaseUrl}/api/order/list`,
      //   data: { 
      //     page: reset ? 1 : this.data.page, 
      //     status: this.data.currentTab === 'all' ? '' : this.data.currentTab,
      //     limit: this.data.pageSize
      //   }
      // })
      
      // 模拟数据（开发阶段）
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockOrders = this.getMockOrders()
      
      this.setData({
        orders: reset ? mockOrders : [...this.data.orders, ...mockOrders],
        page: reset ? 1 : this.data.page + 1,
        hasMore: mockOrders.length < this.data.pageSize
      })
      
      // 更新 tab 计数
      this.updateTabCounts(mockOrders)
    } catch (error) {
      console.error('加载订单失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
      wx.hideLoading()
    }
  },

  getMockOrders() {
    return [
      {
        orderId: 'IDP20261113001',
        image: '/images/default-cover.png',
        imageCount: 4,
        specName: '一寸证件照',
        bgColor: '白色',
        versionText: '标准版',
        actualAmount: '9.90',
        originalAmount: '',
        createTime: '2026-11-13 14:30',
        status: 'paid',
        statusText: '已完成'
      },
      {
        orderId: 'IDP20261113002',
        image: '/images/default-cover.png',
        imageCount: 6,
        specName: '二寸证件照',
        bgColor: '蓝色',
        versionText: '高清版',
        actualAmount: '19.90',
        originalAmount: '19.90',
        createTime: '2026-11-13 15:20',
        status: 'paid',
        statusText: '已完成'
      },
      {
        orderId: 'IDP20261112003',
        image: '/images/default-cover.png',
        imageCount: 4,
        specName: '简历照片',
        bgColor: '浅蓝',
        versionText: '标准版',
        actualAmount: '9.90',
        originalAmount: '',
        createTime: '2026-11-12 09:15',
        status: 'paid',
        statusText: '已完成'
      },
      {
        orderId: 'IDP20261111004',
        image: '/images/default-cover.png',
        imageCount: 3,
        specName: '签证照片',
        bgColor: '白色',
        versionText: '高清版',
        actualAmount: '19.90',
        originalAmount: '19.90',
        createTime: '2026-11-11 10:00',
        status: 'paid',
        statusText: '已完成'
      },
      {
        orderId: 'IDP20261110005',
        image: '/images/default-cover.png',
        imageCount: 4,
        specName: '驾驶证照片',
        bgColor: '白色',
        versionText: '标准版',
        actualAmount: '9.90',
        originalAmount: '',
        createTime: '2026-11-10 16:45',
        status: 'paid',
        statusText: '已完成'
      }
    ]
  },

  updateTabCounts(orders) {
    const counts = { all: orders.length, pending: 0, paid: 0, failed: 0 }
    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++
      }
    })
    
    const tabs = this.data.tabs.map(tab => ({
      ...tab,
      count: counts[tab.value]
    }))
    this.setData({ tabs })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab, hasMore: true })
    this.loadOrders(true)
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.loadOrders(false)
  },

  // 查看订单详情
  goToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail/detail?orderId=${orderId}`
    })
  },

  // 重新下载
  downloadAgain(e) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `/pages/download/download?orderId=${order.orderId}&paid=true`
    })
  },

  // 去支付
  goPay(e) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `/pages/pay/pay?orderId=${order.orderId}`
    })
  },

  // 返回首页
  goMake() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 阻止事件冒泡
  stopPropagation() {}
})
