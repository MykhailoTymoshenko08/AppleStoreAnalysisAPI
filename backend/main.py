from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from schemas import AppInfo, Review, AnalyzeResponse
from services.itunes import search_app_id
from services.parser import get_reviews_rss
from services.ai import analyze_reviews_with_ai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="App Store Review Analyzer API",
    description="API для пошуку додатків, збору відгуків та їхнього аналізу за допомогою ШІ (OpenRouter)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/apps/search", response_model=List[AppInfo])
def search_apps(query: str = Query(..., description="Назва додатку")):
    return search_app_id(query)

@app.get("/api/reviews/collect", response_model=List[Review])
def collect_reviews(
    app_id: int = Query(..., description="ID додатку"),
    count: int = Query(100, description="Кількість відгуків")
):
    return get_reviews_rss(app_id, count)

@app.post("/api/reviews/analyze", response_model=AnalyzeResponse)
def analyze_reviews(reviews: List[Review]):
    return analyze_reviews_with_ai(reviews)
