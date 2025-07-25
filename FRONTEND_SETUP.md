# MarkAgent 前端接入指南

## 🎯 前端实现概述

基于现有的 **React + TypeScript + Vite** 技术栈，我们已经成功实现了完整的前端接入，包含以下核心功能：

### ✨ 已实现的功能

#### 1. **图片验证码系统**
- 🎨 **动态验证码生成**: 使用SkiaSharp生成带噪点、干扰线的验证码图片
- 🔄 **一键刷新**: 支持点击图片或刷新按钮重新生成
- ⏱️ **自动过期**: 5分钟有效期，验证后自动删除防止重复使用
- 📱 **响应式设计**: 适配不同屏幕尺寸

#### 2. **认证系统**
- 📧 **邮箱登录/注册**: 完整的用户认证流程
- 🔐 **密码强度检测**: 实时显示密码强度指示器
- 👀 **密码可见性切换**: 支持显示/隐藏密码
- ✅ **表单验证**: 前端实时验证和后端二次验证
- 🎯 **验证码集成**: 登录和注册均需验证码验证

#### 3. **现代化UI组件**
- 🎨 **Shadcn/ui风格**: 使用业界领先的组件库
- 🌓 **深色模式支持**: 自动适配系统主题
- 📱 **响应式设计**: 完美适配移动端和桌面端
- ⚡ **加载状态**: 优雅的加载动画和状态指示

#### 4. **API客户端**
- 🔌 **类型安全**: 完整的TypeScript类型定义
- 🔄 **自动重试**: 网络错误自动重试机制
- 🎯 **统一响应格式**: 标准化的API响应结构
- 🔐 **自动token管理**: 自动处理JWT token存储和刷新

## 🚀 快速启动

### 前提条件
- Node.js 18+ 
- .NET 9.0 SDK
- Git

### 启动步骤

#### 1. 启动后端服务
```bash
# 使用便捷脚本启动
./start.sh           # Linux/Mac
# 或
start.bat           # Windows

# 或手动启动
cd src/MarkAgent.Api
dotnet run --urls="http://localhost:5000"
```

#### 2. 启动前端服务
```bash
cd web
npm install
npm run dev
```

#### 3. 访问应用
- 前端地址: http://localhost:5173
- 后端API: http://localhost:5000
- Swagger文档: http://localhost:5000/swagger

## 📋 默认测试账号

```
邮箱: admin@markagent.com
密码: Admin123!
API Key: sk-admin-default-key-12345
```

## 🏗️ 项目结构

```
web/
├── src/
│   ├── components/
│   │   ├── auth/               # 认证相关组件
│   │   │   ├── login-form.tsx  # 登录表单
│   │   │   └── register-form.tsx # 注册表单
│   │   └── ui/                 # UI基础组件
│   │       ├── captcha.tsx     # 验证码组件
│   │       ├── button.tsx      # 按钮组件
│   │       ├── input.tsx       # 输入框组件
│   │       ├── card.tsx        # 卡片组件
│   │       └── alert.tsx       # 警告组件
│   ├── lib/
│   │   ├── api-client.ts       # API客户端
│   │   └── utils.ts           # 工具函数
│   ├── pages/
│   │   └── auth/              # 认证页面
│   │       ├── login.tsx      # 登录页
│   │       └── register.tsx   # 注册页
│   └── router/
│       └── index.tsx          # 路由配置
```

## 🔧 技术特性

### 前端技术栈
- **React 19** - 最新版本React
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **TailwindCSS** - 原子化CSS
- **Radix UI** - 无障碍组件库
- **React Router** - 客户端路由
- **Lucide React** - 现代图标库

### UI设计特色
- **🎨 现代化设计**: 遵循最新UI/UX设计趋势
- **📱 移动优先**: 响应式设计，完美适配各种设备
- **♿ 无障碍访问**: 支持屏幕阅读器和键盘导航
- **🌓 主题切换**: 支持明暗主题自动切换
- **⚡ 性能优化**: 代码分割、懒加载、预取等优化

### 安全特性
- **🔐 验证码保护**: 防止暴力破解和机器人攻击
- **🛡️ CSRF防护**: 跨站请求伪造防护
- **🔒 XSS防护**: 跨站脚本攻击防护
- **⏱️ Token自动刷新**: JWT token自动管理
- **📝 输入验证**: 前后端双重验证

## 🌟 核心组件使用示例

### 验证码组件
```tsx
import { Captcha } from "@/components/ui/captcha"

function MyForm() {
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaId, setCaptchaId] = useState<string | null>(null)

  return (
    <Captcha
      value={captchaAnswer}
      onChange={setCaptchaAnswer}
      captchaId={captchaId}
      onCaptchaChange={setCaptchaId}
      error={captchaError}
    />
  )
}
```

### API客户端使用
```tsx
import { apiClient } from "@/lib/api-client"

// 登录
const response = await apiClient.auth.login({
  email: "user@example.com",
  password: "password",
  captchaId: "captcha-id",
  captchaAnswer: "ABCD"
})

// 获取验证码
const captcha = await apiClient.captcha.generate()
```

## 🔮 后续扩展规划

### 即将实现的功能
- [ ] **仪表板页面**: 用户统计和数据概览
- [ ] **Todo管理界面**: 任务创建、编辑、状态管理
- [ ] **API Key管理**: 多API Key管理界面
- [ ] **MCP服务配置**: 服务选择和配置界面
- [ ] **实时通知**: SSE实时更新集成
- [ ] **用户设置**: 个人信息管理
- [ ] **管理员面板**: 系统管理界面

### 技术优化
- [ ] **状态管理**: 集成Zustand或Redux Toolkit
- [ ] **表单管理**: React Hook Form集成
- [ ] **数据获取**: TanStack Query集成
- [ ] **国际化**: i18n多语言支持
- [ ] **PWA支持**: 渐进式Web应用
- [ ] **离线模式**: 支持离线使用

## 🤝 开发指南

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 组件使用PascalCase命名
- 文件使用kebab-case命名
- 使用函数式组件和Hooks

这套前端接入方案提供了完整的用户认证体验，包含现代化的UI设计、完善的验证码系统、类型安全的API接入，为后续功能扩展奠定了坚实基础。