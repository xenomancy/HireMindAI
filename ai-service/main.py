import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import ats, interview, roadmap

app = FastAPI(
    title="HireMind AI Service",
    description="Python microservice handling ATS, Interview, and learning roadmaps for HireMind AI platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ats.router)
app.include_router(interview.router)
app.include_router(roadmap.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "HireMind AI python microservice"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
