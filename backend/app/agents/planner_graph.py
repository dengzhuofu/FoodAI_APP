import asyncio
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from app.services.vector_service import VectorService
from app.models.inventory import FridgeItem
import json

# 1. Define PlannerState
class PlannerState(TypedDict):
    user_request: str
    selected_recipes: List[Dict[str, Any]]
    inventory: List[str]  # List of item names
    shopping_list: List[str]
    schedule: str

# Initialize VectorService globally to avoid reloading on every request
vector_service = VectorService()

# 2. Implement nodes

async def plan_menu(state: PlannerState) -> Dict[str, Any]:
    """
    Use VectorService to find recipes matching user_request. Select top 3.
    """
    print(f"Executing plan_menu with request: {state['user_request']}")
    user_request = state['user_request']
    
    # Search for recipes
    # Assuming 'recipe' is the correct filter_type based on vector_service.py comments
    results = vector_service.similarity_search(query=user_request, k=3, filter_type='recipe')
    
    # If no results found or filter_type not working as expected, try without filter
    if not results:
        results = vector_service.similarity_search(query=user_request, k=3)
        
    print(f"Found {len(results)} recipes.")
    return {"selected_recipes": results}

async def check_inventory(state: PlannerState) -> Dict[str, Any]:
    """
    Fetch fridge items (use app.models.inventory.FridgeItem).
    """
    print("Executing check_inventory...")
    # Fetch all fridge items. In a real app, this should filter by user_id.
    # Here we assume a single user or global inventory for simplicity as per instructions.
    try:
        # Assuming we are in an async context where DB is connected
        items = await FridgeItem.all()
        inventory_names = [item.name for item in items]
    except Exception as e:
        print(f"Error fetching inventory: {e}")
        # Fallback for when DB is not available or initialized
        inventory_names = []
        
    print(f"Fetched inventory: {inventory_names}")
    return {"inventory": inventory_names}

def generate_shopping_list(state: PlannerState) -> Dict[str, Any]:
    """
    Compare recipe ingredients (mocked parsing) with inventory.
    """
    print("Executing generate_shopping_list...")
    selected_recipes = state.get("selected_recipes", [])
    inventory = set(state.get("inventory", []))
    shopping_list = set()
    
    for recipe in selected_recipes:
        # Mocked parsing: Assuming recipe has 'ingredients' field which is a list or string
        # If not, we'll try to extract something or just mock it.
        ingredients_raw = recipe.get("ingredients", [])
        
        if isinstance(ingredients_raw, str):
            # Simple split if it's a string
            ingredients = [i.strip() for i in ingredients_raw.split(',')]
        elif isinstance(ingredients_raw, list):
            ingredients = ingredients_raw
        else:
            # Fallback mock if no ingredients data
            ingredients = ["mock_ingredient_1", "mock_ingredient_2"]
            
        for ingredient in ingredients:
            # Simple case-insensitive match
            if ingredient.lower() not in [i.lower() for i in inventory]:
                shopping_list.add(ingredient)
                
    print(f"Generated shopping list: {shopping_list}")
    return {"shopping_list": list(shopping_list)}

def create_schedule(state: PlannerState) -> Dict[str, Any]:
    """
    Generate a simple text schedule.
    """
    print("Executing create_schedule...")
    selected_recipes = state.get("selected_recipes", [])
    
    if not selected_recipes:
        return {"schedule": "No recipes selected to schedule."}
    
    schedule_lines = ["Here is your meal plan:"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for i, recipe in enumerate(selected_recipes):
        day = days[i % len(days)]
        title = recipe.get("title", recipe.get("name", "Unknown Recipe"))
        schedule_lines.append(f"- {day}: {title}")
        
    schedule = "\n".join(schedule_lines)
    print(f"Created schedule:\n{schedule}")
    return {"schedule": schedule}

# 3. Build the graph

workflow = StateGraph(PlannerState)

# Add nodes
workflow.add_node("plan_menu", plan_menu)
workflow.add_node("check_inventory", check_inventory)
workflow.add_node("generate_shopping_list", generate_shopping_list)
workflow.add_node("create_schedule", create_schedule)

# Add edges
# Start -> plan_menu
# plan_menu -> check_inventory (can be parallel actually, but sequential is fine)
# check_inventory -> generate_shopping_list
# generate_shopping_list -> create_schedule
# create_schedule -> END

workflow.set_entry_point("plan_menu")
workflow.add_edge("plan_menu", "check_inventory")
workflow.add_edge("check_inventory", "generate_shopping_list")
workflow.add_edge("generate_shopping_list", "create_schedule")
workflow.add_edge("create_schedule", END)

# Compile the graph
app = workflow.compile()

# 4. Export a function run_planner
async def run_planner(request: str) -> PlannerState:
    """
    Runs the graph and returns the final state.
    """
    inputs = {"user_request": request}
    # invoke is sync, ainvoke is async. Since our nodes are async (some of them), we should use ainvoke.
    result = await app.ainvoke(inputs)
    return result
