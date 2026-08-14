from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.domain import RolePermission

router = APIRouter(prefix="/v1/roles", tags=["RBAC Roles"])

class PermissionUpdate(BaseModel):
    manage_students_staff: bool = True
    admissions_onboarding: bool = True
    operational_details: bool = True
    requester_role: Optional[str] = "SuperAdmin"

class RolePermissionResponse(BaseModel):
    role: str
    manage_students_staff: bool
    admissions_onboarding: bool
    operational_details: bool

@router.get("/{role_name}/permissions", response_model=RolePermissionResponse)
async def get_role_permissions(role_name: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RolePermission).where(RolePermission.role == role_name))
    perm = result.scalar_one_or_none()

    if not perm:
        # Default fallback defaults for un-initialized role
        default_state = True if role_name in ["SuperAdmin", "Admin"] else False
        perm = RolePermission(
            role=role_name,
            manage_students_staff=default_state if role_name != "Parent" else False,
            admissions_onboarding=default_state if role_name != "Parent" else False,
            operational_details=True if role_name != "Parent" else False
        )
        db.add(perm)
        await db.commit()
        await db.refresh(perm)

    return {
        "role": perm.role,
        "manage_students_staff": perm.manage_students_staff,
        "admissions_onboarding": perm.admissions_onboarding,
        "operational_details": perm.operational_details
    }

@router.put("/{role_name}/permissions", response_model=RolePermissionResponse)
async def update_role_permissions(
    role_name: str, 
    data: PermissionUpdate, 
    db: AsyncSession = Depends(get_db)
):
    # Enforce SuperAdmin restriction
    requester = data.requester_role or "SuperAdmin"
    if requester != "SuperAdmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only SuperAdmin is authorized to update RBAC role permissions."
        )

    result = await db.execute(select(RolePermission).where(RolePermission.role == role_name))
    perm = result.scalar_one_or_none()

    if not perm:
        perm = RolePermission(role=role_name)
        db.add(perm)

    perm.manage_students_staff = data.manage_students_staff
    perm.admissions_onboarding = data.admissions_onboarding
    perm.operational_details = data.operational_details

    await db.commit()
    await db.refresh(perm)

    return {
        "role": perm.role,
        "manage_students_staff": perm.manage_students_staff,
        "admissions_onboarding": perm.admissions_onboarding,
        "operational_details": perm.operational_details
    }
