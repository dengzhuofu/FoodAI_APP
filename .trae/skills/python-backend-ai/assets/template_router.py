from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.example import ExampleCreate, ExampleResponse
from app.services.example_service import ExampleService

router = APIRouter(
    prefix="/examples",
    tags=["examples"]
)

def get_service():
    """Dependency injection for Service"""
    return ExampleService()

@router.post("/", response_model=ExampleResponse, status_code=status.HTTP_201_CREATED)
async def create_example(
    item: ExampleCreate,
    service: ExampleService = Depends(get_service)
):
    """
    Create a new example item.
    - **item**: The item data
    """
    try:
        result = await service.process_item(item)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error"
        )
