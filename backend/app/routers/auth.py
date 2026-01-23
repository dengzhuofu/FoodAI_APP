from fastapi import APIRouter, HTTPException, status
from app.schemas.users import UserCreate, UserLogin, Token, UserOut
from app.models.users import User, UserProfile
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate):
    user = await User.get_or_none(username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    user = await User.create(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        nickname=user_in.nickname,
        email=user_in.email
    )
    # Create default profile
    await UserProfile.create(user=user)
    
    return user

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    user = await User.get_or_none(username=user_in.username)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
