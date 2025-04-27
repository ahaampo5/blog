from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!"}

@router.get("/health")
async def health_check():
    return {"status": "ok"}