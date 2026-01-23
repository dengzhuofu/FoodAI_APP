我将通过以下两个步骤来响应您的需求：

### 1. 引入 LangChain 重构 AI 服务
我们将使用 `LangChain` 框架来规范化 AI 逻辑，替代原有的 HTTP 请求封装。这能利用其强大的 Prompt 管理和 Output Parser 能力，确保输出的 JSON 格式更稳定。

*   **依赖更新**: 添加 `langchain`, `langchain-openai` 到 `requirements.txt`。
*   **重构 `AIService`**:
    *   使用 `ChatOpenAI` (配置 SiliconFlow Base URL) 连接 **Qwen** 和 **GLM-4V**。
    *   使用 `PromptTemplate` 管理提示词。
    *   使用 `JsonOutputParser` 严格控制图生菜谱、文生菜谱的 JSON 输出结构。
    *   对于 **文生图 (Kolors)**，由于 LangChain 主要针对 LLM，我们将保留 HTTP 调用或寻找合适的 Tool 封装，保持代码整洁。

### 2. 数据库表结构管理 (Aerich 迁移方案)
关于“怎么把表导入到数据库”的问题，目前的 `main.py` 中使用了 `generate_schemas=True`，这意味着**只要程序启动，Tortoise ORM 就会自动在数据库中创建所有表**。

但在正规开发中，我们应该使用迁移工具 `Aerich`。我将为您配置 Aerich，以便您可以手动管理数据库版本：

*   **配置 Tortoise ORM**: 在 `app/core/config.py` 中添加标准的 `TORTOISE_ORM` 配置字典。
*   **初始化 Aerich**: 生成 `aerich.ini` 配置文件。
*   **提供操作指南**: 告诉您如何使用 `aerich init-db` 来手动导入表结构。

### 执行计划

1.  **修改 `requirements.txt`**: 添加 LangChain 相关库。
2.  **配置 `app/core/config.py`**: 添加供 Aerich 使用的数据库配置字典。
3.  **初始化 Aerich**: 运行命令生成配置文件，并创建迁移目录。
4.  **重构 `app/services/ai_service.py`**: 使用 LangChain 重写文本生成和图像理解逻辑。
5.  **验证**: 确保服务启动正常，并解释数据库导入命令。
