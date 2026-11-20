// pages/h5tool/h5tool.js - H5网页工具页
Page({
  data: {
    // GitHub Pages 线上地址（已上线）
    h5Url: 'https://liang198888.github.io/idphoto-studio/'
  },
  
  onLoad() {
    // 可以从这里传递参数给H5页面
    console.log('打开H5工具')
  },
  
  // 监听消息事件（如果需要和H5通信）
  onMessage(e) {
    console.log('来自H5的消息:', e.detail.data)
  }
})
