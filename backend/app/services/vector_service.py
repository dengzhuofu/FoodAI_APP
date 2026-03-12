import os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional

# 获取当前文件所在目录的上上级目录，即 backend 目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

class VectorService:
    """
    向量检索服务，用于处理文本向量化、存储和相似度搜索。
    支持 Recipe 和 Knowledge 数据类型。
    """
    
    def __init__(self):
        self.index_path = os.path.join(DATA_DIR, "vector_index.faiss")
        self.metadata_path = os.path.join(DATA_DIR, "vector_metadata.pkl")
        # 使用 all-MiniLM-L6-v2 模型生成 384 维向量
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimension = 384
        self.index = None
        self.metadatas: List[Dict[str, Any]] = []
        
        # 确保数据目录存在
        os.makedirs(DATA_DIR, exist_ok=True)
        
        self.initialize_index()

    def initialize_index(self):
        """
        初始化索引：如果存在现有索引和元数据则加载，否则创建新索引。
        """
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            print(f"正在加载向量索引: {self.index_path}")
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, 'rb') as f:
                    self.metadatas = pickle.load(f)
                print(f"成功加载索引，包含 {self.index.ntotal} 条记录。")
            except Exception as e:
                print(f"加载索引失败: {e}，将创建新索引。")
                self._create_new_index()
        else:
            print("未找到现有索引，正在创建新索引...")
            self._create_new_index()

    def _create_new_index(self):
        """创建一个新的 FAISS 索引 (Inner Product for Cosine Similarity)"""
        # 使用 IndexFlatIP (内积) 来计算余弦相似度（前提是向量已归一化）
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadatas = []

    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]]):
        """
        添加文档到索引中。
        
        Args:
            texts: 文本列表
            metadatas: 元数据列表，每个元素对应一个文本。建议包含 'type' 字段 ('recipe' 或 'knowledge')。
        """
        if not texts:
            return

        if len(texts) != len(metadatas):
            raise ValueError("文本数量与元数据数量不匹配")

        print(f"正在生成 {len(texts)} 条文本的向量嵌入...")
        # 生成向量，并进行归一化以支持余弦相似度
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        
        # 转换为 float32 类型以适配 FAISS
        embeddings = np.array(embeddings).astype('float32')
        
        # 添加到 FAISS 索引
        self.index.add(embeddings)
        
        # 存储元数据
        # 我们需要确保存储的顺序与索引顺序一致
        self.metadatas.extend(metadatas)
        
        print(f"已添加 {len(texts)} 条文档到索引。当前总数: {self.index.ntotal}")

    def similarity_search(self, query: str, k: int = 5, filter_type: str = None) -> List[Dict[str, Any]]:
        """
        根据查询文本搜索相似文档。
        
        Args:
            query: 查询文本
            k: 返回结果数量
            filter_type: 可选，根据元数据中的 'type' 字段过滤 (e.g., 'recipe', 'knowledge')
            
        Returns:
            包含元数据和相似度分数的字典列表。
        """
        if self.index is None or self.index.ntotal == 0:
            return []

        # 生成查询向量并归一化
        query_vector = self.model.encode([query], normalize_embeddings=True)
        query_vector = np.array(query_vector).astype('float32')
        
        # 如果需要过滤，我们需要检索更多的候选结果
        search_k = k
        if filter_type:
            # 简单的启发式策略：检索 k * 4 个结果，或者全部结果
            search_k = min(k * 4, self.index.ntotal)
            if search_k < k: # 避免 search_k 小于 k 的情况
                search_k = self.index.ntotal

        # FAISS 搜索
        distances, indices = self.index.search(query_vector, search_k)
        
        results = []
        found_indices = indices[0]
        found_distances = distances[0]
        
        for i, idx in enumerate(found_indices):
            if idx == -1: continue 
            
            if idx >= len(self.metadatas):
                print(f"警告: 索引 {idx} 超出元数据范围")
                continue

            meta = self.metadatas[idx]
            
            # 应用类型过滤
            if filter_type:
                if meta.get('type') != filter_type:
                    continue
            
            # 构建结果对象
            result_item = meta.copy()
            # 对于 Inner Product (normalized)，分数即余弦相似度
            result_item['score'] = float(found_distances[i])
            results.append(result_item)
            
            if len(results) >= k:
                break
                
        return results

    def save_index(self):
        """保存索引和元数据到磁盘"""
        print(f"正在保存索引到 {self.index_path}...")
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.metadatas, f)
        print("索引保存成功。")

# 单例模式使用建议：
# vector_service = VectorService()
