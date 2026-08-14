from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.domain import Student, ProfileParent, User, UserRole, Subject, enrollments
from app.schemas.domain_schemas import StudentCreate, StudentResponse, ParentCreate

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[StudentResponse])
async def list_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student))
    students = result.scalars().all()
    return students

@router.post("", response_model=StudentResponse)
async def create_student(student_in: StudentCreate, db: AsyncSession = Depends(get_db)):
    # Check parent
    parent_res = await db.execute(select(ProfileParent).where(ProfileParent.id == student_in.parent_id))
    if not parent_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Parent profile not found")

    student = Student(
        parent_id=student_in.parent_id,
        name=student_in.name,
        dob=student_in.dob,
        standard=student_in.standard,
        program=student_in.program
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student

@router.post("/enroll")
async def enroll_student(student_id: str, subject_id: str, db: AsyncSession = Depends(get_db)):
    st_res = await db.execute(select(Student).where(Student.id == student_id))
    student = st_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sb_res = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = sb_res.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Add association
    await db.execute(enrollments.insert().values(student_id=student_id, subject_id=subject_id))
    await db.commit()
    return {"message": f"Successfully enrolled student {student.name} in {subject.name}"}
