# 任务列表 (Tasks)

- [x] 任务 1: 环境与数据准备 (Environment & Data Prep)
  - [x] 子任务 1.1: 添加 `langgraph`, `sentence-transformers`, `faiss-cpu`, `langchain-community` 依赖。
  - [x] 子任务 1.2: 创建 `backend/data/cooking_knowledge.json`，包含基础烹饪知识和营养常识。

- [x] 任务 2: 向量服务与检索 (Vector Service & RAG)
  - [x] 子任务 2.1: 实现 `backend/app/services/vector_service.py`，支持多源数据索引（食谱+知识）。
  - [x] 子任务 2.2: 实现 API `POST /sync-index` 和 `GET /semantic`。
  - [x] 子任务 2.3: 在 `mcp_server.py` 中添加 `retrieve_cooking_knowledge` 工具。

- [x] 任务 3: LangGraph 规划 Agent (LangGraph Planner Agent)
  - [x] 子任务 3.1: 创建 `backend/app/agents/planner_graph.py`。
  - [x] 子任务 3.2: 定义 State (状态)，包含：用户意图、选定食谱列表、现有库存、缺失清单。
  - [x] 子任务 3.3: 实现节点 (Nodes)：
    - `plan_menu`: 使用 RAG 检索并选定食谱。
    - `check_inventory`: 调用 `get_fridge_items` 检查库存。
    - `generate_shopping_list`: 计算差额并生成购物建议。
  - [x] 子任务 3.4: 构建 Graph，连接节点并定义条件边（如：若食谱不够，回退重搜）。

- [x] 任务 4: 集成与 API (Integration)
  - [x] 子任务 4.1: 创建 API `POST /api/ai/plan-event`，接收用户需求，启动 LangGraph 运行。
  - [x] 子任务 4.2: 更新 `KitchenAgent`，使其能识别规划类意图并调用 `plan-event` API 或工具。

- [x] 任务 5: 验证 (Verification)
  - [x] 子任务 5.1: 验证 RAG 检索的准确性（知识库问答）。
  - [x] 子任务 5.2: 验证 LangGraph 能够生成完整的聚餐计划（含菜单和购物清单）。
