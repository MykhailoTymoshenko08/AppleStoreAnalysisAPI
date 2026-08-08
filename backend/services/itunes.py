import urllib.request
import urllib.parse
import json
from fastapi import HTTPException

def search_app_id(query: str):
    params = {
        "term": query,
        "limit": 10,
        "entity": "software"
    }
    query_string = urllib.parse.urlencode(params)
    url = f"https://itunes.apple.com/search?{query_string}"

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode('utf-8'))
            apps = []
            for result in data.get("results", []):
                apps.append({
                    "app_name": result.get("trackName", "Unknown"),
                    "developer": result.get("artistName", "Unknown"),
                    "app_id": result.get("trackId"),
                    "icon_url": result.get("artworkUrl100")
                })
            return apps
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка iTunes API: {str(e)}")