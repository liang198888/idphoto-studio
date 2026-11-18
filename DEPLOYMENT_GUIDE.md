# 证件照小程序 - 部署对接指南

## 一、补充占位图（share-cover.png）

### 方案A：使用AI生成宣传图（推荐，免费）
```
步骤：
1. 打开 Agnes AI (https://platform.agnes-ai.com/)
2. 输入提示词：
   "一张专业的证件照制作小程序宣传海报，尺寸750x1334像素，紫色渐变背景，
    展示几张不同背景的证件照示例（蓝/白/红），底部有'智能抠图换底'字样，
    现代简约风格，无AI水印标记"
3. 下载生成的图片
4. 重命名为 share-cover.png
5. 放到 C:/Users/Administrator/Desktop/证件照工具/miniprogram/images/
```

### 方案B：用设计工具制作
```
工具推荐：
- Canva（免费版够用）
- Figma（需Figma账号）
- PS/AI（如已有）

操作步骤：
1. 新建画布 750×1334px（微信标准分享图比例）
2. 添加渐变背景（紫色 #667eea → #764ba2）
3. 插入3-4张证件照示例图（可用截图占位）
4. 添加文案："智能证件照制作"
5. 导出为PNG格式
6. 重命名并放入 images 目录
```

### 方案C：临时用网图测试
```
在 share.js 中直接修改 URL：
```javascript
// pages/share/share.js 第32行
const mockPoster = '你的真实图片URL'  // 替换这行
```

---

## 二、接入后端API（详细步骤）

### Step 1: 配置服务器密钥

编辑 `server/config.js`：
```javascript
// 配置文件 - 需要替换为你的真实密钥
module.exports = {
  wechat: {
    appId: 'wx1234567890abcdef',        // ← 填入小程序AppID
    appSecret: 'your_app_secret_here',  // ← 填入AppSecret
    mchId: '1234567890',                // ← 微信支付商户号
    apiKey: 'YOUR_API_KEY_32位'         // ← API密钥（32位）
  },
  pricing: {
    standard: 9.9,
    hd: 19.9,
    freeTrial: 3
  },
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  }
};
```

### Step 2: 获取微信小程序凭证

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 > 开发管理 > 开发者工具
3. 找到 AppID 和 AppSecret
4. 微信支付商户号申请：
   - 登录 [微信支付商户平台](https://pay.weixin.qq.com/)
   - 产品中心 > 申请收银台
   - 获取商户号(mch_id)和API密钥

### Step 3: 部署Node.js后端

**本地开发环境：**
```bash
cd C:/Users/Administrator/Desktop/证件照工具/server
npm install
node server.js
# 服务启动在 http://localhost:3000
```

**云服务器部署（推荐腾讯云）：**
```bash
# 1. 购买轻量应用服务器（¥50-100/月）
# 2. SSH登录服务器后执行：
git clone <你的仓库地址>
cd 证件照工具/server
npm install
pm2 start server.js --name idphoto-server
pm2 save
```

### Step 4: 修改小程序中的TODO代码

#### 修改1: index/index.js（图片处理接口）
```javascript
// 原代码（约172行）
// TODO: 调用后端API处理图片
// 这里模拟一个延迟
await new Promise(resolve => setTimeout(resolve, 2000));

// 改为：
const res = await wx.request({
  url: `${app.globalData.apiBaseUrl}/api/photo/process`,
  method: 'POST',
  header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
  data: {
    imageUrl: currentFile.path,
    spec: selectedSpec,
    bgColor: selectedBg
  }
});

if (!res.data.success) throw new Error(res.data.message);

// 跳转到结果页，传入处理后图片URL
wx.redirectTo({
  url: `/pages/result/result?imagePath=${encodeURIComponent(res.data.data.processedUrl)}&spec=${selectedSpec}&bg=${selectedBg}`
});
```

#### 修改2: result/result.js（支付订单接口）
```javascript
// 原代码（约168行）
const orderRes = await wx.request({
  url: `${app.globalData.apiBaseUrl}/order/create`,
  ...
});

// 改为（修正路径）：
const orderRes = await wx.request({
  url: `${app.globalData.apiBaseUrl}/api/order/create`,  // ← 加 /api
  method: 'POST',
  header: { 'Content-Type': 'application/json' },
  data: {
    userId: app.globalData.userId,
    productType: this.data.selectedPrice,
    amount: this.data.payAmount,
    imageId: this.data.imageId
  }
});
```

#### 修改3: pay/pay.js（统一下单接口）
```javascript
// 原代码（约48行）
const payRes = await wx.request({
  url: `${app.globalData.apiBaseUrl}/payment/unifiedorder`,
  ...
});

// 改为：
const payRes = await wx.request({
  url: `${app.globalData.apiBaseUrl}/api/payment/unifiedorder`,
  method: 'POST',
  data: {
    orderId: this.data.orderId,
    appId: app.globalData.appId
  }
});

// 注意：统一支付需要先在后端生成 prepay_id
```

### Step 5: 更新全局配置

编辑 `miniprogram/app.js`：
```javascript
globalData: {
  userId: null,
  userInfo: null,
  freeTrialsLeft: 3,
  apiBaseUrl: 'https://your-domain.com/api',  // ← 替换为你的域名
  appId: 'wx1234567890abcdef'                  // ← 填入你的AppID
}
```

### Step 6: 实现后端缺失的接口

目前 server.js 缺少以下接口，需要补充：

**新增接口文件：server/routes/photo.js**
```javascript
const express = require('express');
const router = express.Router();
const config = require('../config');

// 图片处理接口（实际应调用Python抠图服务）
router.post('/process', async (req, res) => {
  const { imageUrl, spec, bgColor } = req.body;
  
  try {
    // TODO: 调用实际的抠图API（如调用本地的idphoto-studio.html对应的服务）
    const processedUrl = await callImageProcessingService(imageUrl, spec, bgColor);
    
    res.json({
      success: true,
      data: {
        processedUrl,
        thumbnailUrl: processedUrl  // 实际应返回多个尺寸
      }
    });
  } catch (error) {
    res.status(500).json({ error: '处理失败: ' + error.message });
  }
});

async function callImageProcessingService(imageUrl, spec, bgColor) {
  // 方案1: 调用本地HTML工具的Python脚本
  // 方案2: 上传到对象存储，用云函数处理
  // 方案3: 接入第三方AI抠图API（如阿里云视觉智能）
  
  return imageUrl; // 暂时返回原图URL
}

module.exports = router;
```

**在 server.js 中添加路由：**
```javascript
const photoRoutes = require('./routes/photo');
app.use('/api/photo', photoRoutes);
```

---

## 三、完整部署流程检查清单

### 阶段1：准备工作（Day 1-2）
- [ ] 注册微信小程序账号（个人主体）
- [ ] 获取 AppID + AppSecret
- [ ] 申请微信支付商户号（个体工商户或企业主体）
- [ ] 购买云服务器（腾讯云轻量 ¥50/月起）
- [ ] 配置域名解析（绑定到服务器IP）

### 阶段2：后端部署（Day 3-4）
- [ ] 安装 Node.js 环境
- [ ] 克隆项目代码到服务器
- [ ] 执行 npm install 安装依赖
- [ ] 修改 config.js 填入真实密钥
- [ ] 启动服务并测试健康检查：`curl http://localhost:3000/health`
- [ ] 配置 Nginx 反向代理（HTTPS + 域名）
- [ ] 设置 PM2 开机自启

### 阶段3：小程序开发（Day 5-7）
- [ ] 下载微信开发者工具
- [ ] 导入项目：`C:/Users/Administrator/Desktop/证件照工具/miniprogram/`
- [ ] 填写 AppID
- [ ] 修改 app.js 中的 apiBaseUrl
- [ ] 逐个页面调试（真机预览）
- [ ] 添加图片资源（share-cover.png等）
- [ ] 提交代码审核

### 阶段4：测试上线（Day 8-10）
- [ ] 完成微信支付沙箱测试
- [ ] 验证完整下单→支付→下载流程
- [ ] 提审小程序（预计1-3天审核）
- [ ] 上线后进行灰度发布
- [ ] 收集用户反馈迭代优化

---

## 四、常见问题排查

### Q1: 小程序请求后端报错
```
错误：request:fail url not in domain list
解决：登录微信公众平台 > 开发管理 > 服务器域名
     添加你的后端域名到 request 合法域名
```

### Q2: 微信支付统一下单失败
```
错误：prepay_id为空
原因：后端没有正确调用微信API获取prepay_id
解决：检查 server.js 中的 payment.js 实现，确保：
     1. appId/mchId/apiKey 配置正确
     2. 签名算法正确（MD5/HMAC-SHA256）
     3. 异步回调notify_url已配置
```

### Q3: 图片处理耗时过长
```
问题：前端请求后端处理图片超时
解决：改用WebSocket推送进度 或 图片处理完成后回调通知
     或：接入专业AI抠图API（如百度/阿里云的图像分割服务）
```

### Q4: 服务器端口被占用
```
错误：Error: listen EADDRINUSE: address already in use :::3000
解决：netstat -ano | findstr :3000
     taskkill /PID <进程号> /F
     或修改 config.js 中的 port
```

---

*本文档基于实际项目经验编写，建议按顺序执行。遇到问题随时查阅 README.md 中的技术方案。*
