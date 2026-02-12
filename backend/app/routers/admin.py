from fastapi import APIRouter, HTTPException
from typing import List
from app.models.rbac import Role, Permission
from app.schemas.rbac import Role as RoleSchema, RoleCreate, RoleUpdate, Permission as PermissionSchema
from app.models.users import User

router = APIRouter()

@router.get("/stats")
async def get_stats():
    # Mock data for dashboard matching the prototype
    return {
        "dau": {
            "value": 124500,
            "growth": 0.12,
            "label": "124.5K"
        },
        "ai_calls": {
            "value": 45231,
            "growth": 0.085,
            "label": "45,231",
            "success_rate": 0.998
        },
        "new_content": {
            "value": 1893,
            "growth": -0.021,
            "label": "1,893",
            "pending": 45
        },
        "token_cost": {
            "value": 342.50,
            "avg_cost": 0.007,
            "label": "$342.50"
        }
    }

# RBAC Endpoints

@router.get("/roles", response_model=List[RoleSchema])
async def get_roles():
    roles = await Role.all().prefetch_related("permissions")
    result = []
    for role in roles:
        user_count = await role.users.all().count()
        role_data = RoleSchema.model_validate(role)
        role_data.user_count = user_count
        result.append(role_data)
    return result

@router.post("/roles", response_model=RoleSchema)
async def create_role(role_in: RoleCreate):
    role = await Role.create(**role_in.model_dump())
    return role

@router.put("/roles/{role_id}", response_model=RoleSchema)
async def update_role(role_id: int, role_in: RoleUpdate):
    role = await Role.get_or_none(id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.is_system and role_in.display_name:
        pass

    if role_in.display_name is not None:
        role.display_name = role_in.display_name
    if role_in.description is not None:
        role.description = role_in.description
    
    await role.save()

    if role_in.permission_ids is not None:
        permissions = await Permission.filter(id__in=role_in.permission_ids)
        await role.permissions.clear()
        await role.permissions.add(*permissions)
    
    await role.fetch_related("permissions")
    return role

@router.delete("/roles/{role_id}")
async def delete_role(role_id: int):
    role = await Role.get_or_none(id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=400, detail="Cannot delete system role")
    
    await role.delete()
    return {"message": "Role deleted"}

@router.get("/permissions", response_model=List[PermissionSchema])
async def get_permissions():
    return await Permission.all()

@router.post("/init-rbac")
async def init_rbac():
    """Initialize default roles and permissions with tree structure"""
    
    # 1. Content Management (Menu)
    p_content, _ = await Permission.get_or_create(
        code="content", 
        defaults={"name": "内容管理", "type": "menu", "parent_id": None}
    )
    
    # Content Sub-permissions
    content_perms = [
        {"code": "content:view", "name": "查看菜谱", "type": "button", "parent_id": p_content.id},
        {"code": "content:edit", "name": "编辑菜谱", "type": "button", "parent_id": p_content.id},
        {"code": "content:publish", "name": "发布/下架", "type": "button", "parent_id": p_content.id},
        {"code": "content:audit", "name": "审核内容", "type": "button", "parent_id": p_content.id},
        {"code": "content:comment", "name": "管理评论", "type": "button", "parent_id": p_content.id},
        {"code": "content:tag", "name": "标签管理", "type": "button", "parent_id": p_content.id},
    ]
    
    # 2. AI Service (Menu)
    p_ai, _ = await Permission.get_or_create(
        code="ai", 
        defaults={"name": "AI 服务管理", "type": "menu", "parent_id": None}
    )
    
    ai_perms = [
        {"code": "ai:monitor", "name": "查看监控", "type": "button", "parent_id": p_ai.id},
        {"code": "ai:prompt", "name": "管理 Prompts", "type": "button", "parent_id": p_ai.id},
        {"code": "ai:config", "name": "配置模型参数", "type": "button", "parent_id": p_ai.id},
    ]
    
    # 3. System Management (Menu)
    p_sys, _ = await Permission.get_or_create(
        code="sys", 
        defaults={"name": "系统管理", "type": "menu", "parent_id": None}
    )
    
    sys_perms = [
        {"code": "sys:user", "name": "用户管理", "type": "button", "parent_id": p_sys.id},
        {"code": "sys:role", "name": "角色权限", "type": "button", "parent_id": p_sys.id},
        {"code": "sys:log", "name": "查看日志", "type": "button", "parent_id": p_sys.id},
        {"code": "sys:settings", "name": "系统设置", "type": "button", "parent_id": p_sys.id},
    ]
    
    all_perms_data = content_perms + ai_perms + sys_perms
    
    for p in all_perms_data:
        # Use update_or_create to ensure parent_id is set correctly if re-running
        await Permission.update_or_create(code=p["code"], defaults=p)
        
    # Roles
    super_admin, _ = await Role.get_or_create(
        name="super_admin", 
        defaults={"display_name": "超级管理员", "description": "拥有系统全部权限", "is_system": True}
    )
    if _:
        all_perms = await Permission.all()
        await super_admin.permissions.add(*all_perms)
        
    system_admin, _ = await Role.get_or_create(
        name="system_admin",
        defaults={"display_name": "系统管理员", "description": "系统配置与用户管理", "is_system": True}
    )
    if _:
        # Add sys menu + sys buttons
        sys_menu_perms = await Permission.filter(parent_id=p_sys.id)
        await system_admin.permissions.add(p_sys, *sys_menu_perms)
        
    content_manager, _ = await Role.get_or_create(
        name="content_manager",
        defaults={"display_name": "内容管理员", "description": "负责菜谱与内容审核", "is_system": False}
    )
    if _:
        # Add content menu + content buttons
        content_menu_perms = await Permission.filter(parent_id=p_content.id)
        await content_manager.permissions.add(p_content, *content_menu_perms)

    return {"message": "RBAC initialized with tree structure"}
