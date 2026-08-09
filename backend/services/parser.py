import requests
import random
from fastapi import HTTPException

def get_reviews_rss(app_id: int, count: int = 100):
    all_fetched_reviews = []
    page = 1
    max_pages = 3 
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    
    try:
        while page <= max_pages and len(all_fetched_reviews) < 200:
            url = f"https://itunes.apple.com/us/rss/customerreviews/page={page}/id={app_id}/sortBy=mostRecent/json"
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                break
                
            data = response.json()
            entries = data.get("feed", {}).get("entry", [])
            
            if isinstance(entries, dict):
                entries = [entries]
            
            if not entries:
                break
                
            reviews_on_page = [e for e in entries if isinstance(e, dict) and "author" in e]
            
            if not reviews_on_page:
                break
                
            for review in reviews_on_page:
                rating_str = review.get("im:rating", {}).get("label", "0")
                rating = int(rating_str) if rating_str.isdigit() else 0
                
                all_fetched_reviews.append({
                    "rating": rating,
                    "author": review.get("author", {}).get("name", {}).get("label", "Unknown"),
                    "title": review.get("title", {}).get("label", "Без теми"),
                    "text": review.get("content", {}).get("label", "")
                })
                
            page += 1

        if not all_fetched_reviews:
            raise HTTPException(status_code=404, detail="Відгуки для цього додатку не знайдені в App Store")

        while len(all_fetched_reviews) < count:
            all_fetched_reviews.extend(all_fetched_reviews.copy())

        selected_count = min(count, len(all_fetched_reviews))
        random_reviews = random.sample(all_fetched_reviews, selected_count)
        
        return random_reviews

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Помилка при зборі відгуків: {str(e)}")