# GitHub Pages 部署指南

## 为什么选 GitHub Pages？

| 优势 | 说明 |
|------|------|
| **完全免费** | 永久 Hosting，无广告 |
| **HTTPS 默认** | 不需要额外配置证书 |
| **访问稳定** | 全球 CDN 加速 |
| **支持自定义域名** | 后期可绑定自己的域名 |

---

## 详细步骤（图文教程）

### Step 1：注册 GitHub 账号

1. 打开 https://github.com
2. 点击 **Sign up**
3. 填写：
   - Email：你的邮箱
   - Password：6位以上密码
   - Username：选一个好记的名字（如 `idphoto-tool`）
4. 完成邮箱验证

**时间：** 5分钟  
**费用：** ¥0

---

### Step 2：创建仓库（Repo）

1. 登录后点击右上角 **+** → **New repository**
2. 填写信息：
   ```
   Repository name: idphoto-studio
   Description: 智能证件照制作工具
   Public/Private: Public（公开）
   ```
3. 取消勾选 "Initialize this repository with a README"
4. 点击 **Create repository**

**时间：** 2分钟

---

### Step 3：上传 idphoto-studio.html

**方法A：网页上传（最简单）**
```
1. 进入刚创建的仓库页面
2. 点击 "uploading an existing file"
3. 把 C:/Users/Administrator/Desktop/证件照工具/idphoto-studio.html 拖进去
4. 点击 "Commit changes"
```

**方法B：Git 命令行（推荐，以后方便更新）**
```bash
cd "C:/Users/Administrator/Desktop/证件照工具"
git init
git add idphoto-studio.html
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/idphoto-studio.git
git push -u origin main
```

---

### Step 4：开启 Pages 功能

1. 进入仓库 → **Settings**（设置）
2. 左侧菜单找 **Pages**
3. Source 选 **Deploy from a branch**
4. Branch 选 **main**，文件夹选 **/(root)**
5. 点击 **Save**
6. 等待约 1-2 分钟刷新页面

你会看到类似这样的提示：
```
Your site is live at https://你的用户名.github.io/idphoto-studio/
```

**把这个URL复制下来！**

---

## 验证是否成功

在浏览器打开刚才的URL，应该能看到：
- 证件照工作台界面
- 可以上传图片
- 可以换背景色
- 功能正常

如果看到就证明部署成功了 ✅

---

## 如何分享给用户测试

得到URL后，你可以：

1. **发朋友圈**
   ```
   文案示例：
   "做了一个证件照工具，自动抠图换背景，完全免费，
    大家帮忙测测看有没有问题~
    https://xxx.github.io/..."
   ```

2. **发到微信群**
   ```
   "朋友们帮忙测试下这个证件照小程序，纯前端实现，不用服务器。
    有问题反馈给我，谢谢！🙏"
   ```

3. **生成二维码**
   ```
   工具推荐：草料二维码（cli.im）
   输入你的GitHub Pages URL → 生成二维码
   印在名片上或发到群里
   ```

---

## 监控使用情况

在 h5tool.js 里添加简单统计：

```javascript
// 每次页面加载时记录
if (!window.firstVisitRecorded) {
  console.log('有新用户访问:', new Date().toISOString())
  window.firstVisitRecorded = true
}
```

或者用更专业的方法 - **Google Analytics**（也是免费的）：
https://analytics.google.com/

---

## 常见问题

**Q: 访问速度很慢怎么办？**
A: GitHub Pages 在国内有时被限速，可以试试用代理访问确认

**Q: 可以绑定自己的域名吗？**
A: 可以！但在 Settings > Pages > Custom domain 填写即可

**Q: 用户量大了会爆吗？**
A: GitHub Pages 有并发限制，日常小流量完全没问题

---

*部署完成后，把 GitHub Pages URL 告诉我，我帮你改代码接入！*
