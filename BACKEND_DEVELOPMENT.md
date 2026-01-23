# 后端开发规范文档 (Backend Development Documentation)

本文档旨在规范 **FoodAI** 项目的后端开发任务，基于已完成的前端功能和指定的后端技术栈。

## 1. 项目概述

FoodAI 是一个智能美食社交应用，核心功能包括 AI 厨房（菜谱生成、卡路里计算）、冰箱管理、美食社区（菜谱/探店分享）以及智能推荐。后端主要负责数据存储、业务逻辑处理以及与 AI 服务的集成。

## 2. 技术栈 (Tech Stack)

*   **编程语言**: Python 3.10+
*   **Web 框架**: FastAPI
*   **数据库**: MySQL 8.0+ (推荐使用 SQLAlchemy 或 Tortoise-ORM)
*   **缓存/会话**: Redis
*   **AI 服务**: SiliconFlow API
    *   **API Base URL**: `https://api.siliconflow.cn/v1`
    *   **API Key**: `sk-stbgzwbunmivodvxzpnlzjpdorkimoiozdybiqdeuhilwvua`
    *   **模型配置**:
        *   **文本/逻辑模型**: `Qwen/Qwen3-8B` (用于对话、文本生成菜谱)
        *   **生图模型**: `Kwai-Kolors/Kolors` (用于文生图)
        *   **图像理解模型**: `THUDM/GLM-4.1V-9B-Thinking` (用于拍照识菜、卡路里估算)

## 3. API 设计规范

### 3.1 协议与格式
*   采用 **RESTful API** 风格。
*   所有接口前缀建议为 `/api/v1`。
*   请求和响应体均使用 JSON 格式。

### 3.2 统一响应结构
所有 API 应返回统一的数据结构：

```json
{
  "code": 200,          // 业务状态码，200 表示成功，非 200 表示错误
  "message": "success", // 提示信息
  "data": { ... }       // 业务数据
}
```

### 3.3 认证
*   使用 **JWT (JSON Web Token)** 进行用户认证。
*   Request Header: `Authorization: Bearer <token>`

## 4. 数据库设计 (Database Schema)

以下是详细的数据库表设计，覆盖前端所有功能模块。

### 4.1 用户与个人中心 (User & Profile)

**`users` 表**: 核心用户账户信息
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 用户ID |
| `username` | Varchar(50) | Unique, Not Null | 用户名 |
| `email` | Varchar(100) | Unique | 邮箱 |
| `password_hash` | Varchar(255) | Not Null | 密码哈希 |
| `nickname` | Varchar(50) | Not Null | 昵称 |
| `avatar` | Varchar(255) | | 头像URL |
| `bio` | Text | | 个人简介/签名 |
| `is_pro` | Boolean | Default False | 是否为 PRO 会员 |
| `created_at` | DateTime | Default Now | 注册时间 |

**`user_profiles` 表**: 用户的偏好设置与风味画像
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | BigInt | PK, FK -> users.id | 用户ID |
| `preferences` | JSON | | 口味倾向 (如 ["微辣", "清淡"]) |
| `allergies` | JSON | | 饮食禁忌 (如 ["花生", "海鲜"]) |
| `health_goals` | JSON | | 健康目标 (如 ["减脂", "增肌"]) |
| `settings` | JSON | | App设置 (主题, 语言, 通知开关) |

### 4.2 内容发布 (Content)

**`recipes` 表**: 菜谱信息
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 菜谱ID |
| `author_id` | BigInt | FK -> users.id | 作者ID |
| `title` | Varchar(100) | Not Null | 菜谱标题 |
| `cover_image` | Varchar(255) | Not Null | 封面图片URL |
| `description` | Text | | 简介/心得 |
| `cooking_time` | Varchar(20) | | 烹饪时间 (如 "15分钟") |
| `difficulty` | Varchar(20) | | 难度 (简单/中等/困难) |
| `calories` | Int | | 卡路里 (kcal) |
| `nutrition` | JSON | | 营养成分 {protein, fat, carbs} |
| `ingredients` | JSON | | 食材列表 ["鸡蛋 2个", ...] |
| `steps` | JSON | | 烹饪步骤 ["步骤1...", "步骤2..."] |
| `likes_count` | Int | Default 0 | 点赞数 |
| `created_at` | DateTime | Default Now | 发布时间 |

**`restaurants` 表**: 探店/餐厅推荐
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 餐厅/探店贴ID |
| `author_id` | BigInt | FK -> users.id | 发布者ID |
| `name` | Varchar(100) | Not Null | 餐厅名称 |
| `title` | Varchar(100) | Not Null | 探店贴标题 |
| `content` | Text | | 探店心得/评价 |
| `images` | JSON | | 图片列表 (URL数组) |
| `address` | Varchar(255) | | 地址 |
| `rating` | Float | | 评分 (0-5) |
| `hours` | Varchar(50) | | 营业时间 |
| `phone` | Varchar(20) | | 联系电话 |
| `likes_count` | Int | Default 0 | 点赞数 |
| `created_at` | DateTime | Default Now | 发布时间 |

### 4.3 社交互动 (Social)

**`comments` 表**: 评论
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 评论ID |
| `user_id` | BigInt | FK -> users.id | 评论者ID |
| `target_id` | BigInt | Not Null | 目标ID (菜谱或餐厅ID) |
| `target_type` | Enum | 'recipe', 'restaurant' | 评论目标类型 |
| `content` | Text | Not Null | 评论内容 |
| `rating` | Int | | 评分 (可选) |
| `created_at` | DateTime | Default Now | 评论时间 |

**`collections` 表**: 收藏夹
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 记录ID |
| `user_id` | BigInt | FK -> users.id | 用户ID |
| `target_id` | BigInt | Not Null | 收藏目标ID |
| `target_type` | Enum | 'recipe', 'restaurant' | 收藏目标类型 |
| `created_at` | DateTime | Default Now | 收藏时间 |

### 4.4 厨房与库存 (Inventory)

**`fridge_items` 表**: 冰箱库存
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 物品ID |
| `user_id` | BigInt | FK -> users.id | 用户ID |
| `name` | Varchar(50) | Not Null | 食材名称 |
| `category` | Varchar(20) | | 分类 (蔬菜/肉类/水果等) |
| `quantity` | Varchar(20) | | 数量 (如 "2个", "500g") |
| `icon` | Varchar(10) | | 图标/Emoji |
| `expiry_date` | Date | | 过期日期 |
| `created_at` | DateTime | Default Now | 录入时间 |

**`shopping_items` 表**: 购物清单
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 物品ID |
| `user_id` | BigInt | FK -> users.id | 用户ID |
| `name` | Varchar(50) | Not Null | 物品名称 |
| `category` | Varchar(20) | | 分类 |
| `is_bought` | Boolean | Default False | 是否已购买 |

### 4.5 AI 历史记录 (AI History)

**`ai_logs` 表**: 记录用户的 AI 生成历史
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | PK, Auto Inc | 记录ID |
| `user_id` | BigInt | FK -> users.id | 用户ID |
| `feature` | Varchar(50) | | 功能类型 (如 "image-to-recipe") |
| `input_summary` | Text | | 输入摘要 (如图片URL或提示词) |
| `output_result` | JSON | | 生成结果 (如生成的菜谱数据) |
| `created_at` | DateTime | Default Now | 生成时间 |

## 5. 模块 API 列表 (API Endpoints)

### 5.1 用户模块
*   `POST /auth/register` - 注册
*   `POST /auth/login` - 登录
*   `GET /users/me` - 获取个人信息
*   `PUT /users/me/profile` - 更新风味画像

### 5.2 首页与探索
*   `GET /feed/recommend` - 首页推荐流
*   `GET /restaurants/nearby` - 附近餐厅
*   `GET /search?q={keyword}` - 综合搜索

### 5.3 菜谱与餐厅
*   `GET /recipes/{id}` - 菜谱详情
*   `POST /recipes` - 发布菜谱
*   `GET /restaurants/{id}` - 餐厅详情
*   `POST /restaurants` - 发布探店
*   `POST /comments` - 发表评论
*   `POST /collections` - 收藏

### 5.4 冰箱与购物
*   `GET /fridge` - 获取库存
*   `POST /fridge` - 添加库存
*   `DELETE /fridge/{id}` - 删除库存
*   `GET /shopping-list` - 获取购物清单
*   `PUT /shopping-list/{id}` - 更新购买状态

### 5.5 AI 厨房接口 (集成 SiliconFlow)

后端需封装 SiliconFlow API 调用，前端仅与后端交互。

#### 5.5.1 图像理解 (Vision)
**Models**: `THUDM/GLM-4.1V-9B-Thinking`

*   `POST /ai/image-to-recipe`: 上传图片 -> 后端调用 GLM-4V -> 返回菜谱 JSON
*   `POST /ai/image-to-calorie`: 上传图片 -> 后端调用 GLM-4V -> 返回卡路里信息

#### 5.5.2 文本生成 (Text)
**Models**: `Qwen/Qwen3-8B`

*   `POST /ai/text-to-recipe`: 用户输入描述 -> 后端调用 Qwen -> 返回菜谱
*   `POST /ai/fridge-to-recipe`: 发送冰箱库存列表 -> 后端 Prompt Qwen -> 返回推荐菜谱
*   `POST /ai/chat`: 语音助手对话

#### 5.5.3 图像生成 (Image Generation)
**Models**: `Kwai-Kolors/Kolors`

*   `POST /ai/text-to-image`: 用户描述 -> 后端调用 Kolors -> 返回图片 URL

## 6. 开发建议
1.  **ORM 选择**: 建议使用 `SQLAlchemy` (配合 Alembic 做迁移) 或 `Tortoise-ORM` (对 FastAPI 支持友好)。
2.  **图片存储**: 用户上传的图片建议存储在对象存储 (如 AWS S3, 阿里云 OSS) 或本地静态目录，数据库仅存 URL。
3.  **Prompt 工程**: 针对 `Qwen` 和 `GLM-4V` 的 Prompt 需要精心设计，以保证返回标准的 JSON 格式供前端渲染。
