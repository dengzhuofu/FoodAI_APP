from pydantic import BaseModel
from typing import List, Optional

class PermissionBase(BaseModel):
    name: str
    code: str
    type: str
    parent_id: Optional[int] = None

class PermissionCreate(PermissionBase):
    pass

class Permission(PermissionBase):
    id: int

    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None

class Role(RoleBase):
    id: int
    is_system: bool
    permissions: List[Permission] = []
    user_count: int = 0

    class Config:
        from_attributes = True
