# 项目结构文档

```
auto_trans/
├── docs/                           # 文档目录
│   ├── product-requirements.md     # 产品需求文档
│   ├── technical-architecture.md   # 技术架构文档
│   └── project-structure.md        # 项目结构文档
├── public/                         # 静态资源目录
│   ├── manifest.json              # Chrome扩展核心配置文件
│   ├── icons/                     # 扩展图标
│   │   ├── icon16.png            # 16x16 图标
│   │   ├── icon48.png            # 48x48 图标
│   │   └── icon128.png           # 128x128 图标
│   └── assets/                    # 共享静态资源
├── src/                           # 源代码目录
│   ├── background/                # 后台服务脚本
│   │   ├── index.ts              # 主入口文件
│   │   ├── ocr-service.ts        # OCR处理服务
│   │   ├── translation-service.ts # 翻译服务模块
│   │   ├── storage-manager.ts    # 数据存储管理
│   │   └── message-handler.ts    # 消息处理中心
│   ├── content/                   # 页面内容脚本
│   │   ├── index.ts              # 主入口文件
│   │   ├── screen-capture.ts     # 截图功能模块
│   │   ├── ui-overlay.ts         # 页面UI覆盖层
│   │   ├── message-client.ts     # 消息通信客户端
│   │   └── styles/               # 内容脚本样式
│   │       └── content.css       # 页面注入样式
│   ├── popup/                     # 扩展弹窗页面
│   │   ├── index.html            # 弹窗HTML页面
│   │   ├── index.ts              # 弹窗逻辑控制
│   │   └── styles/               # 弹窗样式文件
│   │       └── popup.css         # 弹窗专用样式
│   ├── options/                   # 设置页面
│   │   ├── index.html            # 设置页面HTML
│   │   ├── index.ts              # 设置页面逻辑
│   │   └── styles/               # 设置页面样式
│   │       └── options.css       # 设置专用样式
│   └── shared/                    # 共享代码模块
│       ├── types.ts              # TypeScript类型定义
│       ├── constants.ts          # 常量定义
│       ├── utils.ts              # 工具函数库
│       └── event-bus.ts          # 事件总线系统
├── dist/                          # 构建输出目录
│   ├── background.js             # 构建后的后台脚本
│   ├── content.js                # 构建后的内容脚本
│   ├── popup/                    # 构建后的弹窗资源
│   ├── options/                  # 构建后的设置页面
│   ├── manifest.json             # 最终的manifest文件
│   └── icons/                    # 复制的图标资源
├── tests/                         # 测试文件目录
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── e2e/                      # 端到端测试
├── .gitignore                     # Git忽略文件配置
├── package.json                   # 项目依赖配置
├── tsconfig.json                 # TypeScript编译配置
├── vite.config.ts                # Vite构建配置
└── README.md                     # 项目说明文档
```
