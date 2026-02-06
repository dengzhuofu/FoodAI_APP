from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.core.config import settings
from typing import Dict, Any, Optional
import json

class HealthAIService:
    def __init__(self):
        self.base_url = settings.SILICONFLOW_BASE_URL
        self.api_key = settings.SILICONFLOW_API_KEY
        
        self.llm = ChatOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            model="Qwen/Qwen3-8B",
            temperature=0.7,
            max_tokens=2048,
        )

    def _extract_json(self, content: str) -> Any:
        try:
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.replace("```", "")
            
            content = content.strip("` \n")
            return json.loads(content)
        except Exception as e:
            print(f"JSON Extraction Error: {e} for content: {content[:100]}...")
            return None

    async def calculate_health_profile(self, height: float, weight: float) -> Dict[str, Any]:
        template = """你是一个专业的健康营养师。请根据用户的身高和体重，计算每日推荐摄入热量，并给出饮食和运动建议。
        
        用户身高: {height} cm
        用户体重: {weight} kg
        
        请返回严格的JSON格式：
        {{
            "daily_calorie_target": 2000,
            "dietary_advice": "建议多吃...",
            "exercise_advice": "建议每周..."
        }}
        
        注意：
        1. daily_calorie_target 必须是整数。
        2. 建议要具体且实用。
        3. 只返回JSON，不要其他废话。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm
        
        response = await chain.ainvoke({"height": height, "weight": weight})
        data = self._extract_json(response.content)
        if not data:
            return {
                "daily_calorie_target": 2000,
                "dietary_advice": "无法生成建议，请保持均衡饮食。",
                "exercise_advice": "建议每周进行150分钟中等强度运动。"
            }
        return data

    async def calculate_daily_log(self, breakfast: Optional[str], lunch: Optional[str], dinner: Optional[str], exercise: Optional[str]) -> Dict[str, Any]:
        template = """你是一个卡路里计算助手。请根据用户提供的早中晚摄入食物和运动情况，估算总摄入热量和总消耗热量。
        
        早餐: {breakfast}
        午餐: {lunch}
        晚餐: {dinner}
        运动: {exercise}
        
        如果用户未提供某项，请视为0。
        
        请返回严格的JSON格式：
        {{
            "total_calories_in": 1500,
            "total_calories_burned": 300,
            "breakdown": "早餐约400大卡，午餐..."
        }}
        
        注意：
        1. total_calories_in 和 total_calories_burned 必须是整数。
        2. breakdown 是对计算过程的简要说明。
        3. 只返回JSON，不要其他废话。"""
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm
        
        response = await chain.ainvoke({
            "breakfast": breakfast or "无",
            "lunch": lunch or "无",
            "dinner": dinner or "无",
            "exercise": exercise or "无"
        })
        data = self._extract_json(response.content)
        if not data:
            return {
                "total_calories_in": 0,
                "total_calories_burned": 0,
                "breakdown": "AI计算失败，请手动输入。"
            }
        return data

health_ai_service = HealthAIService()
