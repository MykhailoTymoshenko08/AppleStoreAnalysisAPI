import os
import json
import requests
from fastapi import HTTPException
from typing import List

def analyze_reviews_with_ai(reviews: List):
    total = len(reviews)
    if total == 0:
        raise HTTPException(status_code=400, detail="Список відгуків порожній")

    avg_rating = sum(r.rating for r in reviews) / total
    distribution = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    for r in reviews:
        distribution[str(r.rating)] += 1

    reviews_text = ""
    for i, review in enumerate(reviews, 1):
        reviews_text += f"Відгук {i}:\nРейтинг: {review.rating} ⭐️\nТекст: {review.text}\n\n"

    api_key = os.getenv("OPENROUTER_API_KEY")
    model_name = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free") # Дефолт, якщо раптом забудеш вказати

    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY не знайдено у змінних середовища (.env)")

    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": model_name,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "Ти Senior AI-аналітик. Проаналізуй відгуки. "
                    "Зроби висновок про 'overall_sentiment' (позитивний, негативний, нейтральний) орієнтуючись на більшість оцінок. "
                    "Знайди 'key_issues' (масив рядків - технічні проблеми) та 'feature_requests' (масив рядків - побажання). "
                    "Поверни результат СУВОРО у форматі JSON з полями: 'overall_sentiment', 'key_issues', 'feature_requests'."
                )
            },
            {
                "role": "user",
                "content": f"Проаналізуй відгуки:\n{reviews_text}"
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        result_data = response.json()
        ai_response_str = result_data['choices'][0]['message']['content']
        ai_response_str = ai_response_str.strip("`").removeprefix("json").strip()
        
        parsed_ai = json.loads(ai_response_str)
        
        return {
            "total_reviews": total,
            "average_rating": round(avg_rating, 2),
            "rating_distribution": distribution,
            "overall_sentiment": parsed_ai.get("overall_sentiment", "Невідомо"),
            "key_issues": parsed_ai.get("key_issues", []),
            "feature_requests": parsed_ai.get("feature_requests", [])
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="ШІ повернув невалідний JSON")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Помилка OpenRouter API: {str(e)}")