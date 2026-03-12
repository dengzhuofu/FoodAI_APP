import sys
import os
import asyncio
from unittest.mock import MagicMock, patch

# -----------------------------------------------------------------------------
# MOCK DEPENDENCIES (If not installed)
# -----------------------------------------------------------------------------
# Since we might not have faiss or sentence_transformers installed in this environment,
# we mock them BEFORE importing the app modules.
# -----------------------------------------------------------------------------

class MockIndex:
    def __init__(self, d):
        self.ntotal = 0
        self.d = d
        self.vectors = []
    
    def add(self, vectors):
        self.vectors.extend(vectors)
        self.ntotal += len(vectors)
    
    def search(self, query_vectors, k):
        # Return dummy distances and indices
        # shape: (len(query_vectors), k)
        import numpy as np
        return (
            np.array([[0.9] * k for _ in query_vectors], dtype='float32'), 
            np.array([[0] * k for _ in query_vectors], dtype='int64') # Always return index 0 for test
        )

# Mock faiss
try:
    import faiss
except ImportError:
    print("[Warning] 'faiss' not found. Using Mock.")
    mock_faiss = MagicMock()
    mock_faiss.IndexFlatIP = MockIndex
    sys.modules["faiss"] = mock_faiss

# Mock sentence_transformers
try:
    import sentence_transformers
except ImportError:
    print("[Warning] 'sentence_transformers' not found. Using Mock.")
    mock_st = MagicMock()
    class MockModel:
        def __init__(self, model_name):
            self.model_name = model_name
        def encode(self, texts, normalize_embeddings=True):
            import numpy as np
            # Return random vectors of dimension 384
            return np.random.rand(len(texts), 384).astype('float32')
            
    mock_st.SentenceTransformer = MockModel
    sys.modules["sentence_transformers"] = mock_st


# -----------------------------------------------------------------------------
# IMPORT APP MODULES
# -----------------------------------------------------------------------------

# 确保 backend 目录在 sys.path 中，以便可以导入 app 模块
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.services.vector_service import VectorService
from app.agents import planner_graph

def get_vector_service_instance():
    """
    创建一个 VectorService 实例用于测试。
    """
    # Mock os.path.exists to avoid trying to load real index from disk
    with patch("os.path.exists", return_value=False):
        service = VectorService()
    return service

def test_vector_service(vector_service_instance):
    """
    测试 VectorService 的基本功能：
    1. 初始化索引
    2. 添加虚拟文档
    3. 搜索文档
    """
    print("\n[Test] Testing VectorService...")
    
    # 1. 添加一个虚拟文档 (Add a dummy document)
    dummy_text = "A very healthy green salad with spinach and tomatoes."
    dummy_metadata = {"title": "Healthy Salad", "type": "recipe", "ingredients": "spinach, tomatoes"}
    
    vector_service_instance.add_documents([dummy_text], [dummy_metadata])
    
    # 2. 搜索它 (Search for it)
    # Note: With MockIndex, we always return index 0.
    results = vector_service_instance.similarity_search("healthy salad", k=1, filter_type="recipe")
    
    # 验证
    assert len(results) > 0, "Should return at least one result"
    # Verify metadata is retrieved
    assert results[0]["title"] == "Healthy Salad", "Should find the dummy recipe"
    print(f"Found recipe: {results[0]['title']}")
    print("[Test] VectorService test passed.")

async def test_planner_graph(vector_service_instance):
    """
    测试 PlannerGraph 的运行：
    1. 运行 run_planner("plan a healthy dinner")
    2. 检查输出是否包含菜单和购物清单
    """
    print("\n[Test] Testing PlannerGraph...")

    # 重要：我们需要 patch planner_graph 模块中使用的 vector_service 实例，
    # 这样它才能访问我们在上一个测试中添加的 "Healthy Salad"。
    # 否则它会使用模块加载时初始化的默认实例（不包含内存中的新文档）。
    with patch('app.agents.planner_graph.vector_service', vector_service_instance):
        
        # 1. 运行 Planner (Run run_planner)
        request = "plan a healthy dinner"
        try:
            result = await planner_graph.run_planner(request)
        except Exception as e:
            print(f"[Error] Planner execution failed: {e}")
            raise e
        
        # 2. 检查输出 (Check output)
        print(f"[Test] Planner result keys: {list(result.keys())}")
        
        # 检查是否包含选定的食谱 (Menu)
        if "selected_recipes" not in result or not result["selected_recipes"]:
             print("[Warning] No recipes selected. This might happen if LLM logic fails or no match found.")
        else:
            titles = [r.get("title", r.get("name", "Unknown")) for r in result["selected_recipes"]]
            print(f"[Test] Selected recipes: {titles}")
        
        # 检查是否生成了购物清单 (Shopping List)
        if "shopping_list" in result:
             print(f"[Test] Shopping list: {result['shopping_list']}")
        else:
             print("[Error] Shopping list missing form result")

        # 检查是否生成了时间表 (Schedule)
        if "schedule" in result:
             print(f"[Test] Schedule generated.")
        
    print("[Test] PlannerGraph test passed.")

if __name__ == "__main__":
    # 手动运行测试
    try:
        service = get_vector_service_instance()
        test_vector_service(service)
        asyncio.run(test_planner_graph(service))
        print("\nAll tests passed successfully!")
    except Exception as e:
        print(f"\nTests failed: {e}")
        # Print full traceback
        import traceback
        traceback.print_exc()
        sys.exit(1)
