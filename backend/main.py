from fastapi import FastAPI
from api.v1.routers import base

app = FastAPI(
    title="My Blog API",
    description="블로그 백엔드용 FastAPI 예제",
    version="0.1.0"
)

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0", port=8000)