# 3分钟把证件照工具上线

## 方案：用 Vercel 一键部署（最简单）

### 为什么选 Vercel？
- 拖拽文件夹就能部署
- 自动生成 HTTPS 链接
- 不需要注册 GitHub（直接用邮箱登录）
- 完全免费

---

## 步骤

### Step 1：注册 Vercel
1. 打开 https://vercel.com
2. 点击 **Sign Up**
3. 选择 **Continue with Email**
4. 填写邮箱和密码，完成验证

### Step 2：导入项目
1. 登录后点击 **Add New...** → **Project**
2. 上传文件夹：选择 `C:/Users/Administrator/Desktop/证件照工具`
3. 等5秒钟，Vercel 自动检测并部署
4. 点击 **Deploy**

### Step 3：获得网址
部署完成后你会看到类似这样的链接：
```
https://idphoto-studio-xxx.vercel.app
```

把这个链接发给朋友，他们就能用了！

---

## 常见问题

**Q: 部署后链接打不开？**
A: 等待30秒，Vercel 还在初始化

**Q: 想换域名怎么办？**
A: 在 Project Settings → Domains 添加你的域名（可选）

**Q: 能统计有多少人访问吗？**
A: 点进项目 → Analytics 可以看到访问数据

---

*现在就去 vercel.com 试试吧！有问题随时问我。*
