# 零成本部署方案

## 🎯 核心思路

**现有资源：**
- ✅ `idphoto-studio.html` - V10抠图工具（112KB，本地运行，无需后端）
- ✅ 小程序UI框架 - 已完成美化设计
- ❌ 无服务器、无支付能力

---

## 方案对比

| 方案 | 成本 | 难度 | 适合场景 |
|------|------|------|---------|
| **A. 纯前端+Web-view** | ¥0 | ⭐ | 快速验证MVP |
| **B. 微信云开发** | ¥0（有额度） | ⭐⭐ | 正式运营 |
| **C. GitHub Pages外链** | ¥0 | ⭐ | 引流到已有网页 |

---

## 方案A：纯前端方案（最快上线）

### 原理
小程序只做「外壳」，实际处理逻辑复用你的HTML文件，通过 `web-view` 嵌入。

### 架构图
```
┌─────────────────┐     ┌─────────────────┐
│  微信小程序      │────►│ idphoto-studio  │
│  (纯展示/UI)    │     │   .html         │
│                 │     │  (本地处理)      │
│  - 上传照片入口  │────►│  - 用户选择规格  │
│  - 预览结果      │     │  - 浏览器内生成  │
│  - 保存相册      │     │  - 下载导出      │
└─────────────────┘     └─────────────────┘
```

### 修改步骤

#### Step 1: 创建 web-view 页面

新建 `pages/webview/webview.wxml`:
```html
<!-- pages/webview/webview.wxml -->
<web-view src="https://your-github-page.github.io/idphoto-studio.html"></web-view>
```

新建 `pages/webview/webview.js`:
```javascript
Page({
  onLoad(options) {
    // 可以从这里传递参数给H5
    console.log('打开网页工具', options)
  }
})
```

#### Step 2: 在首页添加按钮

修改 `miniprogram/pages/index/index.wxml`:
```html
<!-- 在生成按钮下方添加 -->
<button class="btn btn-outline" bindtap="openWebTool">
  🌐 打开完整版（免费无广告）
</button>
```

修改 `miniprogram/pages/index/index.js`:
```javascript
// 添加方法
openWebTool() {
  wx.navigateTo({
    url: '/pages/webview/webview'
  })
}
```

#### Step 3: 部署H5到免费空间

**选项1：GitHub Pages（推荐）**
```bash
# 1. 创建GitHub仓库
# 2. 上传 idphoto-studio.html 到仓库根目录
# 3. Settings > Pages > Source: main branch
# 4. 获取URL: https://username.github.io/your-repo/

# 然后修改 webview.wxml 中的src
```

**选项2：Vercel/Netlify（拖拽上传）**
- 访问 https://vercel.com 或 https://netlify.com
- 登录GitHub → 导入项目
- 自动部署，获得永久URL

#### Step 4: 配置小程序web-view白名单

1. 登录微信公众平台
2. 开发管理 > 开发设置 > 业务域名
3. 下载验证文件放到H5站点根目录
4. 填写你的域名（如 `yourname.github.io`）

---

## 方案B：微信云开发（适合长期运营）

### 为什么选云开发？

| 优势 | 说明 |
|------|------|
| **完全免费** | 每月1GB存储 + 2GB数据库 + 20万次云函数调用 |
| **无需服务器** | 腾讯托管，自动扩容 |
| **原生集成** | 数据库/存储/云函数一站式 |
| **实名认证即可** | 个人主体可用 |

### 实施步骤

#### Step 1: 开通云开发

1. 微信开发者工具 > 开通云开发
2. 环境名称：`idphoto-dev`
3. 环境ID会生成类似 `cloud1-xxx` 的字符串

#### Step 2: 创建数据库集合

在云开发控制台手动创建以下集合：

| 集合名 | 用途 | 字段 |
|--------|------|------|
| `users` | 用户信息 | _openid, nickName, avatarUrl, freeTrialsLeft, isMember |
| `orders` | 订单记录 | _id, userId, orderId, imageId, amount, status, createTime |
| `photos` | 图片记录 | _id, userId, originalUrl, processedUrl, spec, bgColor |

#### Step 3: 创建云函数

右键 `functions` 文件夹 > 新建Node.js云函数：

**函数1: createUser**
```javascript
// functions/createUser/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  // 检查是否已存在
  const exists = await db.collection('users').where({ _openid: OPENID }).get()
  
  if (exists.data.length === 0) {
    // 新用户，初始化数据
    await db.collection('users').add({
      data: {
        _openid: OPENID,
        freeTrialsLeft: 3,
        totalSpent: 0,
        orderCount: 0,
        createdAt: db.serverDate()
      }
    })
    return { success: true, isNewUser: true }
  }
  
  return { success: true, isNewUser: false }
}
```

**函数2: processImage**
```javascript
// functions/processImage/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { imageUrl, spec, bgColor } = event
  
  try {
    // 方案1: 调用外部AI API（如百度AI、阿里云视觉智能）
    // 方案2: 下载原图，用Canvas处理（适合简单操作）
    
    // 这里先返回模拟结果
    const processedUrl = imageUrl // 实际应该生成新URL
    
    // 保存图片记录
    const { _id } = await db.collection('photos').add({
      data: {
        _openid: OPENID,
        originalUrl: imageUrl,
        processedUrl,
        spec,
        bgColor,
        createdAt: db.serverDate()
      }
    })
    
    // 扣除免费次数
    await db.collection('users').where({ _openid: OPENID }).update({
      data: {
        freeTrialsLeft: db.command.inc(-1)
      }
    })
    
    return { success: true, photoId: _id, processedUrl }
    
  } catch (error) {
    console.error('处理失败:', error)
    return { success: false, error: error.message }
  }
}
```

**函数3: createOrder**
```javascript
// functions/createOrder/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { photoId, amount, productType } = event
  
  const orderId = 'IP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
  
  const { _id } = await db.collection('orders').add({
    data: {
      _openid: OPENID,
      orderId,
      photoId,
      productType,
      amount,
      status: 'pending',
      createTime: db.serverDate()
    }
  })
  
  return { success: true, orderId }
}
```

#### Step 4: 修改小程序代码

**app.js 中添加云开发初始化：**
```javascript
App({
  globalData: {
    userId: null,
    userInfo: null,
    freeTrialsLeft: 3,
    // 云开发环境ID，替换为你的
    cloudEnv: 'cloud1-xxx' 
  },
  
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    })
    
    this.checkLogin()
  }
})
```

**result.js 中调用云函数：**
```javascript
// 打开结果页时调用云函数创建订单
async createOrderInCloud() {
  try {
    const res = await wx.cloud.callFunction({
      name: 'createOrder',
      data: {
        photoId: this.data.imageId,
        amount: this.data.payAmount,
        productType: this.data.selectedPrice
      }
    })
    
    if (res.result.success) {
      this.setData({ orderId: res.result.orderId })
      return res.result.orderId
    }
  } catch (error) {
    console.error('创建订单失败:', error)
  }
}
```

---

## 方案C：GitHub Pages外链（最简单引流）

### 适用场景
只想快速测试用户需求，不考虑即时付费。

### 实施步骤

1. 将 `idphoto-studio.html` 上传到GitHub仓库
2. 启用GitHub Pages功能
3. 在小程序首页显示提示：
   ```html
   <view class="hint-box">
     <text>📱 本小程序仅供预览，完整功能请访问：</text>
     <navigator url="https://yourname.github.io/idphoto-studio.html" open-type="navigate">
       <text class="link">电脑端在线制作</text>
     </navigator>
   </view>
   ```
4. 引导用户收藏网页到桌面

---

## 我的建议

| 阶段 | 推荐方案 | 原因 |
|------|---------|------|
| **Week 1-2 MVP验证** | 方案C | 零成本快速测试市场需求 |
| **Week 3-4 小规模运营** | 方案B | 云开发免费额度足够，可收钱 |
| **Month 2+ 规模化** | 方案B升级 | 流量大了再考虑独立服务器 |

---

## 关于支付的现实说明

⚠️ **微信支付必须真实商户资质**

| 需求 | 能否免费解决 |
|------|-------------|
| 小程序注册 | ✅ 免费（个人主体） |
| 云开发基础功能 | ✅ 免费额度 |
| 在线收款 | ❌ 需要商户号（个体工商户也可申请，0元） |
| 公众号认证 | ❌ ¥300/年（但可以先不认证） |

**最佳实践：**
1. 先用方案C/MVP验证需求
2. 如果前100单有人付费意愿 → 注册个体工商户（线上办理免费）
3. 用个体户执照申请微信支付商户号
4. 再接入云开发正式运营

---

*现在要我先帮你实现哪个方案？我可以立即开始写代码。*
