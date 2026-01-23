# FoodAI - 智能美食社交App

## 项目结构

```
FoodAI/
├── src/app/
│   ├── App.tsx                          # 主应用入口和导航管理
│   ├── screens/                         # 所有页面screens
│   │   ├── Recommend/                   # 推荐模块
│   │   │   └── RecommendScreen.tsx      # - AI推荐、探店流、菜谱流、健康流
│   │   ├── Explore/                     # 探索模块
│   │   │   ├── ExploreScreen.tsx        # - 搜索、标签浏览、菜系分类、附近餐厅
│   │   │   └── WhatToEatScreen.tsx      # - 今天吃什么？(轮盘选择)
│   │   ├── AIKitchen/                   # AI厨房模块（核心AI功能）
│   │   │   ├── AIKitchenScreen.tsx      # AI厨房主界面
│   │   │   └── features/                # AI功能组件
│   │   │       ├── ImageToRecipeFeature.tsx        # 图 → 菜谱
│   │   │       ├── ImageToCalorieFeature.tsx       # 图 → 卡路里
│   │   │       ├── TextToImageFeature.tsx          # 文 → 图
│   │   │       ├── TextToRecipeFeature.tsx         # 文 → 菜谱
│   │   │       ├── FridgeToRecipeFeature.tsx       # 冰箱 → 菜谱
│   │   │       └── VoiceAssistantFeature.tsx       # 语音烹饪助手
│   │   └── Profile/                     # 我的模块（待完善）
│   ├── components/                      # 共用组件和详情页
│   │   ├── MyKitchenPage.tsx            # 我的冰箱（冰箱管理、智能推荐）
│   │   ├── RecipeDetailPage.tsx         # 菜谱详情页
│   │   ├── RestaurantDetailPage.tsx     # 餐厅详情页
│   │   ├── PublishPage.tsx              # 发布页面（菜谱/探店）
│   │   ├── MessagesPage.tsx             # 消息页面
│   │   └── ProfilePage.tsx              # 个人中心（含内容中心）
│   └── styles/                          # 样式文件
└── README.md                            # 项目说明文档
```

## 功能模块

### 1. 推荐 (RecommendScreen)
- **AI推荐**: 基于用户口味的智能推荐
- **探店流**: 精选餐厅推荐
- **菜谱流**: 热门菜谱展示
- **健康流**: 健康饮食资讯

### 2. 探索 (ExploreScreen + WhatToEatScreen)
- **今天吃什么？**: 幸运轮盘随机选择美食
  - 自定义选项
  - 食物类别选择
  - 轮盘转动动画
- **搜索**: 搜索菜品、餐厅、风味、食材
- **标签浏览**: 热门标签和趋势
- **菜系分类**: 中餐、西餐、日韩料理等
- **附近餐厅**: 基于位置的餐厅推荐

### 3. AI厨房 (AIKitchenScreen)
**核心AI功能空间**

#### 3.1 图 → 菜谱 (ImageToRecipeFeature)
- 拍照识别食物
- AI生成详细菜谱
- 显示食材和步骤

#### 3.2 图 → 卡路里 (ImageToCalorieFeature)
- 识别食物营养成分
- 计算卡路里
- 营养分析

#### 3.3 文 → 图 (TextToImageFeature)
- 描述美食
- AI生成精美图片
- 成品模拟

#### 3.4 文 → 菜谱 (TextToRecipeFeature)
- 输入食材或菜名
- 选择口味偏好（清淡/香辣/酸甜等）
- AI生成定制菜谱

#### 3.5 冰箱 → 菜谱 (FridgeToRecipeFeature)
- 基于冰箱库存推荐
- 智能菜谱生成

#### 3.6 语音烹饪助手 (VoiceAssistantFeature)
- 边做边问
- 实时语音指导

#### 3.7 我的冰箱入口
- 直达我的厨房管理页面

### 4. 我的厨房 (MyKitchenPage)
- **冰箱库存管理**
  - 食材列表（名称+数量+有效期）
  - 食材录入（拍照/条码/语音/文本）
  - 类型标签（蔬菜/蛋白/调料）
  - 有效期提醒
- **智能推荐**
  - 选择食材
  - 选择口味类型
  - AI生成菜谱推荐
  - 显示匹配度
- **做菜建议**
  - 基于库存+风味
  - 缺料建议（自动生成购物清单）
- **健康目标**
  - 低脂/控糖/增肌

### 5. 发布 (PublishPage)
- **发布探店足迹**
  - 上传照片
  - 餐厅信息
  - 位置标记
  - 评分评价
- **发布菜谱**
  - 上传成品照片
  - 菜谱名称
  - 食材清单
  - 烹饪步骤
  - 添加标签

### 6. 消息 (MessagesPage)
- 系统通知
- 互动消息（点赞、评论、关注）
- 推荐关注

### 7. 我的 (ProfilePage)
- **个人资料**
  - 头像、昵称、签名
  - 发布数、粉丝数、关注数
- **我的内容**（整合原内容中心）
  - 我的菜谱
  - 我的探店足迹
- **收藏**
- **偏好与禁忌**
- **风味画像**
- **PRO订阅管理**
- **成就系统**
- **数据统计**
- **设置**

## 导航结构

### 底部导航栏 (5个Tab)
1. **推荐** - 首页推荐流
2. **探索** - 搜索和发现
3. **+发布** - 中间凸起按钮，发布内容
4. **AI厨房** - AI功能集合
5. **我的** - 个人中心

## 技术栈

- **前端框架**: React + TypeScript
- **样式**: Tailwind CSS v4
- **图标**: Lucide React
- **图片**: Unsplash API
- **导航**: 自定义React状态管理

## 设计特色

- 🎨 插画风格设计
- 🌈 温暖的橙粉色调
- ⭕ 圆润卡片设计
- 😊 生动的Emoji图标
- ✨ 流畅的过渡动画
- 📱 移动优先的响应式设计

## 数据流

```
App.tsx (导航控制)
  ↓
Screens (各页面)
  ↓
Components (共用组件)
  ↓
navigate() 函数 (页面跳转和数据传递)
```

## 核心功能亮点

1. **AI智能推荐**: 基于用户偏好、冰箱库存、健康目标的个性化推荐
2. **图像识别**: 拍照识别食物，生成菜谱和营养分析
3. **文本生成**: 根据描述生成图片和菜谱
4. **语音助手**: 实时烹饪指导
5. **库存管理**: 智能冰箱管理和过期提醒
6. **社交分享**: 发布和浏览美食内容
7. **轮盘决策**: 解决"今天吃什么"的选择困难

## 未来扩展

- 地图功能 (V2)
- 实时视频烹饪课程
- 社区互动增强
- AR菜品预览
- 多人协作菜单规划
