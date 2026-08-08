from pydantic import BaseModel
from typing import List, Dict, Optional

class AppInfo(BaseModel):
    app_name: str
    developer: str
    app_id: int
    icon_url: Optional[str] = None

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