from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import authorize as authorize_route
from .routes import logs as logs_route
from .routes import agents as agents_route
from .routes import policies as policies_route

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authorize_route.router, prefix="/api")
app.include_router(logs_route.router, prefix="/api")
app.include_router(agents_route.router, prefix="/api")
app.include_router(policies_route.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)