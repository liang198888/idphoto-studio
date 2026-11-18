const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const app = express();
app.use(express.json());

// 订单存储（生产环境请改用数据库）
const orders = new Map();
const users = new Map();

// ========== 订单管理接口 ==========

// 创建订单
app.post('/api/order/create', (req, res) => {
  const { userId, productType, amount } = req.body;
  
  if (!userId || !productType || !amount) {
    return res.status(400).json({ error: '参数缺失' });
  }
  
  const orderId = `IP${Date.now()}${uuidv4().slice(0,6).toUpperCase()}`;
  const order = {
    orderId,
    userId,
    productType,
    amount,
    status: 'pending',
    createTime: Date.now(),
    expireTime: Date.now() + config.order.expireHours * 3600 * 1000
  };
  
  orders.set(orderId, order);
  
  res.json({
    success: true,
    orderId,
    message: '订单创建成功'
  });
});

// 查询订单状态
app.get('/api/order/query/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.get(orderId);
  
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }
  
  res.json({ success: true, order });
});

// 支付回调（微信支付异步通知）
app.post('/api/payment/callback', (req, res) => {
  const { outTradeNo, transactionId, tradeState } = req.body;
  
  const order = orders.get(outTradeNo);
  if (order && tradeState === 'SUCCESS') {
    order.status = 'paid';
    order.transactionId = transactionId;
    order.payTime = Date.now();
    
    // TODO: 发送通知给用户
    console.log(`订单 ${outTradeNo} 支付成功`);
  }
  
  // 必须返回success，否则微信会重试
  res.json({ code: 'SUCCESS', message: '成功' });
});

// 生成分享海报URL
app.get('/api/share/poster', (req, res) => {
  const { orderId, userId } = req.query;
  
  // TODO: 实现海报生成逻辑（可以使用 canvas 或现有图片服务）
  res.json({
    success: true,
    posterUrl: `https://your-domain.com/poster/${orderId}.png`,
    miniProgramPath: `pages/index/index?orderId=${orderId}`
  });
});

// ========== 用户管理 ==========

// 获取用户统计
app.get('/api/user/stats/:userId', (req, res) => {
  const { userId } = req.params;
  let userStats = users.get(userId);
  
  if (!userStats) {
    userStats = {
      totalOrders: 0,
      totalSpent: 0,
      freeTrialsUsed: 0,
      registeredAt: Date.now()
    };
    users.set(userId, userStats);
  }
  
  res.json({ success: true, stats: userStats });
});

// ========== 健康检查 ==========
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    orders: orders.size,
    users: users.size
  });
});

// 启动服务器
app.listen(config.server.port, config.server.host, () => {
  console.log(`🚀 证件照服务已启动: http://${config.server.host}:${config.server.port}`);
  console.log(`📋 订单数量: ${orders.size}`);
  console.log(`👥 用户数量: ${users.size}`);
});

module.exports = app;
