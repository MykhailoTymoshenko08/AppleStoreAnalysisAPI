import requests
from fastapi import HTTPException

def get_reviews_rss(app_id: int, count: int = 100):
    all_reviews = []
    page = 1
    
    try:
        while len(all_reviews) < count:
            url = f"https://itunes.apple.com/us/rss/customerreviews/page={page}/id={app_id}/sortBy=mostRecent/json"
            response = requests.get(url)
            
            if response.status_code != 200:
                break
                
            data = response.json()
            entries = data.get("feed", {}).get("entry", [])
            
            reviews_on_page = [entry for entry in entries if "author" in entry]
            if not reviews_on_page:
                break
                
            for review in reviews_on_page:
                if len(all_reviews) >= count:
                    break
                
                rating_str = review.get("im:rating", {}).get("label", "0")
                rating = int(rating_str) if rating_str.isdigit() else 0
                
                all_reviews.append({
                    "rating": rating,
                    "author": review.get("author", {}).get("name", {}).get("label", "Unknown"),
                    "title": review.get("title", {}).get("label", "Без теми"),
                    "text": review.get("content", {}).get("label", "")
                })
                
            page += 1
            if page > 10:
                break
                
        return all_reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при зборі відгуків: {str(e)}")