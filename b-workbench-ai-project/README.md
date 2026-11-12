# 得助智能 - 坐席工作台（进行中会话）

## 项目说明

这是一个 AI 坐席工作台的前端原型页面，展示了进行中会话的界面设计。

## 文件结构

```
b-workbench-ai-project/
├── b-workbench-ai.html       # 主页面文件
├── fonts/                     # 字体文件目录
│   ├── bootstrap-icons.css
│   └── bootstrap-icons.woff2
├── dz-theme.css              # 主题样式文件
├── server.js                 # Node.js 本地服务器
├── server.ps1                # PowerShell 启动脚本
├── prototype.md              # 原型说明文档
└── README.md                 # 本文件
```

## 使用方法

### 方法 1：直接打开（不推荐）
双击 `b-workbench-ai.html` 在浏览器中打开。
**注意**：由于浏览器安全限制，直接打开可能无法加载字体图标。

### 方法 2：使用本地服务器（推荐）

#### Windows PowerShell:
```powershell
.\server.ps1
```

#### 或使用 Node.js:
```bash
node server.js
```

然后在浏览器中访问：`http://localhost:8080`

## 功能特性

- AI 智能客服会话界面
- 实时消息流展示
- 工具栏功能（包括满意度评价）
- 响应式设计
- Bootstrap Icons 图标支持

## 技术栈

- 纯 HTML/CSS/JavaScript
- Bootstrap Icons (字体图标)
- Node.js (本地服务器)

## 注意事项

- 需要现代浏览器支持（Chrome、Firefox、Edge、Safari）
- 确保 8080 端口未被占用
- 字体文件需要正确加载才能显示图标

---

生成时间：2026-10-31
