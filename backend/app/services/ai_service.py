import httpx
from app.core.config import settings
from typing import List, Dict, Any, Optional
import json
import base64
import os

# ai框架
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import PromptTemplate

class AIService:
    def __init__(self):
        self.base_url = settings.SILICONFLOW_BASE_URL
        self.api_key = settings.SILICONFLOW_API_KEY
        
        # Initialize ChatOpenAI for Text Generation (Qwen)
        self.llm_text = ChatOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            model="Qwen/Qwen3-8B",
            temperature=0.7,
            max_tokens=2048,
        )

        # Initialize ChatOpenAI for Vision (GLM-4V)
        # Note: We need to check if LangChain's ChatOpenAI handles GLM-4V's specific image format correctly.
        # Standard OpenAI vision format uses "image_url". Assuming SiliconFlow follows this.
        self.llm_vision = ChatOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            model="THUDM/GLM-4.1V-9B-Thinking",
            temperature=0.1,
            max_tokens=2048,
        )

    async def _post(self, endpoint: str, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """Raw HTTP post for endpoints not supported by LangChain ChatOpenAI (like image generation)"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                json=json_data
            )
            response.raise_for_status()
            return response.json()

    def _process_image_url(self, image_url: str) -> str:
        """
        If the image URL is local (starts with /static or http://localhost),
        read the file and convert to base64 data URI.
        If it's a remote URL (like COS), download it and convert to base64.
        """
        # Case 1: Remote URL (COS, etc.) - Download and convert to Base64
        # 只要是 http 开头，且不是 localhost/127.0.0.1，就认为是远程图片
        # 这样可以兼容 COS 以及其他任何远程图片链接
        is_remote = image_url.startswith("http") and \
                   "localhost" not in image_url and \
                   "127.0.0.1" not in image_url and \
                   "159.75.135.120" not in image_url # 排除自己的服务器IP，走本地文件读取更高效
        
        # 强制 COS URL 也走下载流程，即便它包含服务器IP（如果将来有变动）
        if "myqcloud.com" in image_url:
            is_remote = True

        if is_remote:
            try:
                print(f"DEBUG: Downloading remote image from {image_url}")
                import httpx
                # Use synchronous download here since this method is synchronous
                # Ideally this whole chain should be async, but for quick fix:
                with httpx.Client() as client:
                    response = client.get(image_url)
                    response.raise_for_status()
                    image_data = response.content
                    
                    encoded_string = base64.b64encode(image_data).decode('utf-8')
                    # Simple mime type guessing
                    mime_type = "image/jpeg"
                    if image_url.lower().endswith(".png"):
                        mime_type = "image/png"
                    elif image_url.lower().endswith(".webp"):
                        mime_type = "image/webp"
                        
                    return f"data:{mime_type};base64,{encoded_string}"
            except Exception as e:
                print(f"Error downloading remote image: {e}")
                # 如果下载失败，尝试返回原 URL 给 AI 服务，死马当活马医
                return image_url

        # Case 2: Local File Path
        local_path = None
        if image_url.startswith("/static/"):
            local_path = f"backend{image_url}" # e.g. backend/static/uploads/xxx.jpg
        elif "localhost" in image_url or "127.0.0.1" in image_url or "159.75.135.120" in image_url:
            # Try to extract the static part
            if "/static/" in image_url:
                static_part = image_url.split("/static/")[1]
                local_path = f"backend/static/{static_part}"
        
        if local_path and os.path.exists(local_path):
            try:
                with open(local_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    # Guess mime type based on extension
                    ext = os.path.splitext(local_path)[1].lower()
                    mime_type = "image/jpeg" # default
                    if ext == ".png":
                        mime_type = "image/png"
                    elif ext == ".gif":
                        mime_type = "image/gif"
                    elif ext == ".webp":
                        mime_type = "image/webp"
                    
                    return f"data:{mime_type};base64,{encoded_string}"
            except Exception as e:
                print(f"Error processing local image: {e}")
                # Fallback to original URL if reading fails
                return image_url
        
        return image_url

    async def generate_image(self, prompt: str, size: str = "1024x1024") -> str:
        """
        Generate image using Kolors model.
        LangChain doesn't have a generic 'ImageGeneration' chat model, 
        so we stick to raw API call or use DallEAPIWrapper if fully compatible.
        Here we use raw API for better control over Kolors specific params.
        """
        payload = {
            "model": "Kwai-Kolors/Kolors",
            "prompt": prompt,
            "image_size": size,
            "num_inference_steps": 20
        }
        response = await self._post("/images/generations", payload)
        return response["images"][0]["url"] 

    async def generate_recipe_from_text(self, description: str, preferences: str = "") -> str:
        """Use LangChain to generate recipe from text"""
        template = """你是一个专业的厨师。请根据用户的描述生成一个JSON格式的菜谱，包含title, description, ingredients(list), steps(list), nutrition(dict with calories, protein, fat, carbs), cooking_time, difficulty。
        
        描述: {description}
        偏好: {preferences}
        
        只返回JSON，不要其他文字。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm_text
        
        response = await chain.ainvoke({"description": description, "preferences": preferences})
        return response.content

    async def generate_recipe_from_image(self, image_url: str) -> str:
        """Use LangChain (Vision) to generate recipe from image"""
        processed_url = self._process_image_url(image_url)
        
        # 调试：打印处理后的 URL 长度（如果是 base64 会很长）
        print(f"DEBUG: Processed URL length: {len(processed_url)}")
        if processed_url.startswith("data:"):
            print("DEBUG: Image converted to Base64 successfully")
        else:
            print(f"DEBUG: Using raw URL: {processed_url}")

        message = HumanMessage(
            content=[
                {"type": "text", "text": "请识别图中的菜品，并生成一个JSON格式的菜谱，包含title, description, ingredients(list), steps(list), nutrition(dict with calories, protein, fat, carbs), cooking_time, difficulty。只返回JSON。"},
                {"type": "image_url", "image_url": {"url": processed_url}},
            ]
        )
        
        try:
            response = await self.llm_vision.ainvoke([message])
            return response.content
        except Exception as e:
            print(f"AI Service Error (Vision): {e}")
            # 如果是 400 错误，可能是 base64 太长或者格式问题，尝试打印更多信息
            raise e
        
    async def estimate_calories(self, image_url: str) -> str:
        """Use LangChain (Vision) to estimate calories"""
        processed_url = self._process_image_url(image_url)
        
        # 调试日志
        print(f"DEBUG: Processed URL length: {len(processed_url)}")
        
        message = HumanMessage(
            content=[
                {"type": "text", "text": "请识别图中的食物，并估算其总卡路里和营养成分。请返回JSON格式，包含 calories(int), protein(str), fat(str), carbs(str)。只返回JSON。"},
                {"type": "image_url", "image_url": {"url": processed_url}},
            ]
        )
        
        try:
            response = await self.llm_vision.ainvoke([message])
            return response.content
        except Exception as e:
            print(f"AI Service Error (Calories): {e}")
            raise e

    async def fridge_to_recipe(self, items: List[str]) -> str:
        """Use LangChain to recommend recipe from fridge items"""
        template = """我有以下食材: {items_str}。请推荐一道可以用这些食材制作的菜谱。请返回JSON格式，包含title, description, ingredients(list), steps(list), nutrition(dict), cooking_time, difficulty。只返回JSON。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm_text
        
        response = await chain.ainvoke({"items_str": ", ".join(items)})
        return response.content

    async def chat_completion(self, messages: List[Dict[str, Any]], model: str = "Qwen/Qwen3-8B") -> str:
        """General chat using LangChain"""
        # Convert dict messages to LangChain Message objects
        lc_messages = []
        for msg in messages:
            if msg["role"] == "system":
                lc_messages.append(SystemMessage(content=msg["content"]))
            elif msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            # Add AI/Assistant message support if needed
        
        response = await self.llm_text.ainvoke(lc_messages)
        return response.content

ai_service = AIService()
