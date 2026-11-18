// 配置文件 - 需要替换为你的真实密钥
module.exports = {
  // 微信小程序配置
  wechat: {
    appId: 'YOUR_WECHAT_APPID',        // 替换为你的小程序 AppID
    appSecret: 'YOUR_WECHAT_APPSECRET', // 替换为你的小程序 AppSecret
    mchId: 'YOUR_MCH_ID',              // 微信支付商户号（申请支付时获得）
    apiKey: 'YOUR_API_KEY'             // API密钥（微信支付平台设置）
  },
  
  // 定价配置
  pricing: {
    standard: 9.9,      // 标准版价格（元）
    hd: 19.9,           // 高清版价格（元）
    freeTrial: 3        // 免费体验次数
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  
  // 订单配置
  order: {
    expireHours: 2,     // 订单过期时间（小时）
    maxConcurrent: 5    // 单用户最大并发订单数
  }
};
