# 后续开发计划 (Next Steps)

## 1. 前端 API 客户端升级
- [ ] 更新 `src/api/client.ts` 或相关服务文件，确保在调用 AI 接口时发送 JSON 格式的数据（使用 `application/json` Content-Type），而不是之前的 FormData。
- [ ] 确保前端在获取到图片上传 URL 后，将其作为 JSON 对象 `{ "image_url": "..." }` 发送给后端。

## 2. 功能模块对接 (Frontend Integration)
### 2.1 文本生成菜谱 (Text to Recipe)
- [ ] 修改 `AIKitchen/features/TextToRecipeFeature.tsx`。
- [ ] 对接 `POST /api/v1/ai/text-to-recipe` 接口。
- [ ] 处理返回的 JSON 菜谱数据并展示。

### 2.2 图片生成菜谱 (Image to Recipe)
- [ ] 修改 `AIKitchen/features/ImageToRecipeFeature.tsx`。
- [ ] 实现先上传图片 (`POST /api/v1/upload`) 获取 URL。
- [ ] 再调用 `POST /api/v1/ai/image-to-recipe` 接口。

### 2.3 图片估算热量 (Image to Calorie)
- [ ] 修改 `AIKitchen/features/ImageToCalorieFeature.tsx`。
- [ ] 同样实现先上传后分析的流程。
- [ ] 展示热量和营养成分结果。

### 2.4 冰箱食材推荐 (Fridge to Recipe)
- [ ] 修改 `AIKitchen/features/FridgeToRecipeFeature.tsx`。
- [ ] 对接 `POST /api/v1/ai/fridge-to-recipe`，发送食材列表。

## 3. UI/UX 优化
- [ ] 添加加载状态 (Loading Spinners)，因为 AI 生成需要较长时间。
- [ ] 优化错误处理，当 AI 服务超时或失败时给予用户友好的提示。
