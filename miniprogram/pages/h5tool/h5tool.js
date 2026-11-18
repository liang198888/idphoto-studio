// pages/h5tool/h5tool.js - H5网页工具页
Page({
  data: {
    // TODO: 替换为你自己的GitHub Pages URL
    h5Url: 'https://你的用户名.github.io/idphoto-studio/'
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
