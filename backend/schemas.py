from pydantic import BaseModel
from typing import List, Dict

class AppInfo(BaseModel):
    app_name: str
    developer: str
    app_id: int

class Review(BaseModel):
    rating: int
    author: str
    title: str
    text: str

class AnalyzeResponse(BaseModel):
    total_reviews: int
    average_rating: float
    rating_distribution: Dict[str, int]
    overall_sentiment: str
    key_issues: List[str]
    feature_requests: List[str]