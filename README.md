# 围棋游戏 (Weiqi Game)

一个基于React和TypeScript开发的围棋游戏，支持人机对战和人人对战模式，具有完整的游戏规则实现、AI对手、游戏记录保存/加载等功能。

## 功能特性

- **完整的围棋规则实现**：支持落子、提子、禁止自杀、打劫等规则
- **多种游戏模式**：
  - 人人对战
  - 人机对战（支持简单、中等、困难三种难度）
- **游戏控制功能**：
  - 落子悔棋
  - 游戏重置
  - 计算胜负
- **游戏记录管理**：
  - 保存游戏进度
  - 加载历史游戏
  - 导出/导入游戏记录
  - 删除游戏记录
- **响应式设计**：适配不同屏幕尺寸的设备
- **美观的UI界面**：带有动画效果和交互反馈
- **完整的单元测试**：确保核心功能的正确性

## 技术栈

- **前端框架**：React 18
- **编程语言**：TypeScript
- **构建工具**：Vite
- **测试框架**：Jest, React Testing Library
- **样式**：CSS
- **状态管理**：React Hooks (useState, useEffect, useCallback, useMemo)
- **存储**：localStorage

## 安装和运行

### 前置要求

- Node.js (v16或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库

```bash
git clone <repository-url>
cd weiqi
```

2. 安装依赖

```bash
npm install
# 或者使用 yarn
yarn install
```

3. 运行开发服务器

```bash
npm run dev
# 或者使用 yarn
yarn dev
```

4. 构建生产版本

```bash
npm run build
# 或者使用 yarn
yarn build
```

5. 预览生产版本

```bash
npm run preview
# 或者使用 yarn
yarn preview
```

## 使用说明

### 开始游戏

1. 选择游戏模式（人人对战或人机对战）
2. 如果选择人机对战，可以选择AI难度
3. 点击开始游戏按钮

### 游戏操作

- **落子**：点击棋盘上的交叉点放置棋子
- **悔棋**：点击悔棋按钮撤销上一步操作
- **重置**：点击重置按钮重新开始游戏
- **计算胜负**：点击计算胜负按钮查看当前得分

### 游戏记录管理

- **保存游戏**：点击保存游戏按钮，输入游戏名称
- **加载游戏**：点击加载游戏按钮，从记录列表中选择要加载的游戏
- **导出记录**：点击导出按钮保存游戏记录文件
- **导入记录**：点击导入按钮选择游戏记录文件

## 项目结构

```
weiqi/
├── src/
│   ├── components/         # React组件
│   │   ├── Board.tsx       # 棋盘组件
│   │   ├── Board.css       # 棋盘样式
│   │   ├── GameControls.tsx # 游戏控制组件
│   │   ├── GameControls.css # 游戏控制样式
│   │   ├── GameRecordManager.tsx # 游戏记录管理组件
│   │   └── GameRecordManager.css # 游戏记录管理样式
│   ├── engine/            # 游戏引擎
│   │   ├── Game.ts        # 游戏核心逻辑
│   │   ├── AIController.ts # AI控制器
│   │   ├── Board.ts       # 棋盘数据结构
│   │   └── StorageService.ts # 存储服务
│   ├── types/             # 类型定义
│   │   └── index.ts       # 游戏类型定义
│   ├── utils/             # 工具函数
│   │   └── index.ts       # 通用工具函数
│   ├── App.tsx            # 应用主组件
│   ├── App.css            # 应用样式
│   ├── main.tsx           # 应用入口
│   └── vite-env.d.ts      # Vite环境类型
├── tests/                 # 测试文件
│   ├── Game.test.ts       # 游戏逻辑测试
│   └── AIController.test.ts # AI控制器测试
├── public/                # 静态资源
├── .gitignore            # Git忽略配置
├── index.html            # HTML入口
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript配置
├── tsconfig.node.json    # Node环境TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目说明文档
```

## 开发指南

### 运行测试

```bash
npm test
# 或者使用 yarn
yarn test

# 监视模式运行测试
npm run test:watch
# 或者使用 yarn
yarn test:watch
```

### 代码格式化

项目使用ESLint和Prettier保持代码风格一致性。

### 性能优化

- 使用React.memo避免不必要的重渲染
- 使用useCallback和useMemo缓存函数和计算结果
- 实现了防抖处理以优化窗口大小变化的响应
- 棋子渲染使用优化的网格算法

## 许可证

[MIT](https://opensource.org/licenses/MIT)

## 致谢

感谢所有为这个项目做出贡献的开发者！