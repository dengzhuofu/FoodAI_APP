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

    def _clean_recipe_response(self, content: str) -> Dict[str, Any]:
        try:
            # Clean markdown
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.replace("```", "")
            
            content = content.strip("` \n")
            
            data = json.loads(content)
            
            # Fix steps
            if "steps" in data:
                steps = data["steps"]
                import re
                
                # Case 1: String "1. xxx 2. xxx"
                if isinstance(steps, str):
                    # Split by "1. ", "2. " etc.
                    parts = re.split(r'\d+\.\s*', steps)
                    data["steps"] = [p.strip() for p in parts if p.strip()]
                    
                # Case 2: List ["1. xxx 2. xxx"]
                elif isinstance(steps, list) and len(steps) == 1:
                    s = steps[0]
                    # Check if it actually has multiple steps
                    if "2." in s:
                        parts = re.split(r'\d+\.\s*', s)
                        data["steps"] = [p.strip() for p in parts if p.strip()]
            
            return data
        except json.JSONDecodeError:
            print(f"JSON Decode Error for content: {content}")
            return {
                "title": "Generated Recipe",
                "description": content[:100] + "...",
                "ingredients": [],
                "steps": [content],
                "nutrition": {},
                "cooking_time": "N/A",
                "difficulty": "Unknown"
            }
        except Exception as e:
            print(f"Error processing recipe: {e}")
            return {}

    async def generate_recipe_from_text(self, description: str, preferences: str = "") -> Dict[str, Any]:
        """Use LangChain to generate recipe from text"""
        template = """你是一个专业的厨师。请根据用户的描述生成一个JSON格式的菜谱，包含title, description, ingredients(list), steps(list), nutrition(dict with calories, protein, fat, carbs), cooking_time, difficulty。
        
        描述: {description}
        偏好: {preferences}
        
        注意：
        1. steps 必须是一个字符串列表，每个字符串代表一个独立的步骤。
        2. 步骤描述要清晰具体，不要把所有步骤合并成一段话。
        3. 示例格式: ["洗净切块", "大火爆炒", "加水炖煮"]
        
        只返回JSON，不要其他文字。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm_text
        
        response = await chain.ainvoke({"description": description, "preferences": preferences})
        return self._clean_recipe_response(response.content)

    async def generate_recipe_from_image(self, image_url: str) -> Dict[str, Any]:
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
                {"type": "text", "text": "请识别图中的菜品，并生成一个JSON格式的菜谱，包含title, description, ingredients(list), steps(list), nutrition(dict with calories, protein, fat, carbs), cooking_time, difficulty。\n\n注意：\n1. steps 必须是一个字符串列表，每个字符串代表一个独立的步骤。\n2. 步骤描述要清晰具体，不要把所有步骤合并成一段话。\n3. 示例格式: [\"洗净切块\", \"大火爆炒\", \"加水炖煮\"]\n\n只返回JSON。"},
                {"type": "image_url", "image_url": {"url": processed_url}},
            ]
        )
        
        try:
            response = await self.llm_vision.ainvoke([message])
            return self._clean_recipe_response(response.content)
        except Exception as e:
            print(f"AI Service Error (Vision): {e}")
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

    async def fridge_to_recipe(self, items: List[str]) -> Dict[str, Any]:
        """Use LangChain to recommend recipe from fridge items"""
        template = """我有以下食材: {items_str}。请推荐一道可以用这些食材制作的菜谱。请返回JSON格式，包含title, description, ingredients(list), steps(list), nutrition(dict), cooking_time, difficulty。
        
        注意：
        1. steps 必须是一个字符串列表，每个字符串代表一个独立的步骤。
        2. 步骤描述要清晰具体，不要把所有步骤合并成一段话。
        3. 示例格式: ["洗净切块", "大火爆炒", "加水炖煮"]
        
        只返回JSON。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm_text
        
        response = await chain.ainvoke({"items_str": ", ".join(items)})
        return self._clean_recipe_response(response.content)

    async def recognize_fridge_items(self, image_url: str) -> List[Dict[str, Any]]:
        """Use LangChain (Vision) to recognize fridge items"""
        processed_url = self._process_image_url(image_url)
        
        message = HumanMessage(
            content=[
                {"type": "text", "text": "请识别图中的所有食材。请返回JSON格式的列表，每个列表项包含：name(食材名称), quantity(数量/重量, 估算), expiry_days(预估保质期天数, int), icon(emoji图标)。只返回JSON列表。"},
                {"type": "image_url", "image_url": {"url": processed_url}},
            ]
        )
        
        try:
            response = await self.llm_vision.ainvoke([message])
            content = response.content
            
            # Clean content similar to recipe response
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.replace("```", "")
            content = content.strip("` \n")
            
            return json.loads(content)
        except Exception as e:
            print(f"AI Service Error (Fridge): {e}")
            # Fallback mock for demo if AI fails or returns bad format
            return []

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

    async def generate_what_to_eat_options(self, categories: List[str], quantity: int) -> List[str]:
        """Generate food options based on categories and quantity"""
        template = """请根据以下食物种类，生成总共 {quantity} 个具体的食物名称。
        
        种类: {categories_str}
        
        要求：
        1. 必须从指定的种类中选择具体的食物。
        2. 生成的食物数量总和必须接近 {quantity} 个。
        3. 请根据你的判断合理分配每个种类的数量。
        4. 只返回一个JSON字符串列表，不要包含任何其他文字。
        5. 示例格式: ["麻辣火锅", " pepperoni pizza", "豚骨拉面"]
        
        只返回JSON列表。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm_text
        
        response = await chain.ainvoke({
            "categories_str": ", ".join(categories),
            "quantity": quantity
        })
        
        content = response.content.strip()
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.replace("```", "")
            content = content.strip("` \n")
            return json.loads(content)
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return []

ai_service = AIService()
