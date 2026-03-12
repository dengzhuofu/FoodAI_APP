# 智能厨房生态：RAG 增强与 LangGraph 规划 Agent (Smart Kitchen Ecosystem) 规格说明书

## 为什么 (Why)
用户希望在项目中深度体现 AI 与 Agent 的结合，使用主流技术进行创新。
1.  **知识深度 (RAG)**: 目前的搜索和回答缺乏深度，容易产生幻觉。引入 RAG 可以让 AI 基于专业知识库（营养、烹饪技巧）回答问题。
2.  **任务复杂度 (LangGraph)**: 现有的 Agent 多为单轮或简单的工具调用。引入 **LangGraph** 可以实现复杂的、多步骤的**长程任务规划**，例如“策划一场生日派对”，需要协调食谱选择、库存检查、购物清单生成和备菜时间表安排。

## 变更内容 (What Changes)
- **核心架构升级**: 引入 `LangGraph` 用于构建状态感知的多 Agent 工作流。
- **RAG 系统 (基础层)**: 
  - 构建向量数据库 (FAISS)，索引食谱和烹饪知识。
  - 实现语义搜索和知识检索工具。
- **智能规划 Agent (应用层)**:
  - 新增 **"Event Planner" (活动策划)** 工作流：用户输入“周末聚餐”，Agent 自动规划菜单、生成购物清单并制定备菜时间表。
- **依赖项**: `langgraph`, `sentence-transformers`, `faiss-cpu`, `langchain-community`。

## 影响 (Impact)
- **受影响的规格**: 厨房助手, 搜索, 购物清单。
- **受影响的代码**: 
  - `backend/app/agents/`: 新增 `planner_graph.py` (LangGraph 定义)。
  - `backend/app/services/vector_service.py`: RAG 服务。
  - `backend/app/mcp_server.py`: 新增相关工具。

## 新增需求 (ADDED Requirements)

### 需求：RAG 知识检索 (RAG Knowledge Retrieval)
(同前版，保留 RAG 功能)
- 支持食谱和通用烹饪知识的向量索引与检索。

### 需求：基于 LangGraph 的活动策划 (LangGraph Event Planner)
系统应提供一个能够处理复杂、多步骤任务的 Agent。

#### 场景：聚餐规划
- **当 (WHEN)** 用户输入“帮我规划一个 4 人的低脂周末晚餐”
- **那么 (THEN)** 系统启动 Graph 工作流：
  1.  **搜索节点**: 检索符合“低脂”和“晚餐”的食谱（使用 RAG）。
  2.  **决策节点**: 选择 3-4 道搭配合理的菜品。
  3.  **库存节点**: 检查冰箱现有食材。
  4.  **清单节点**: 生成缺失食材的购物清单。
  5.  **输出**: 返回完整的菜单、购物清单和烹饪顺序建议。

## 修改需求 (MODIFIED Requirements)
- **Kitchen Agent**: 集成 `Event Planner` 能力，当识别到复杂规划意图时，将控制权移交给 LangGraph 工作流。
