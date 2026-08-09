# App Store Review Analyzer

An AI-powered tool designed to collect user reviews from the Apple Store for any specified application, calculate precise statistical metrics, and generate actionable product insights using LLMs (via OpenRouter).

## Architecture
- **Backend:** FastAPI, Pydantic, iTunes RSS & Search APIs.
- **AI Engine:** OpenRouter API (Nvidia Nemotron / Llama models) for sentiment and key issue analysis.
- **Frontend:** Next.js (App Router), Tailwind CSS, Recharts for visual dashboards.
- **Containerization:** Docker & Docker Compose.

---

## Getting Started Locally (Using Docker)

### Prerequisites
- Docker and Docker Compose installed on your machine.
- An OpenRouter API key.

### Installation & Run

1. Clone the repository:
```bash
git clone https://github.com/MykhailoTymoshenko08/testTaskOBRIO
cd testTaskOBRIO
```

2. Create a .env file inside the backend/ directory:
```bash
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
```

3. Build and run the containers using Docker Compose:
```bash
docker-compose up --build
```

4. Access the services:
* Frontend Dashboard: http://localhost:3000
* Backend API Docs (Swagger): http://localhost:8000/docs 

## Architecture & Tech Stack
- **Backend:** FastAPI, Pydantic, iTunes RSS & Search APIs.
- **AI Engine:** OpenRouter API (Nvidia Nemotron / Llama models) for sentiment and key issue analysis.
- **Frontend:** Next.js (App Router), Tailwind CSS, Recharts for visual dashboards.
- **Containerization:** Docker & Docker Compose.
