# DevMeetScribe AI

> **Every Meeting. Every Insight. One Intelligent Assistant.**

DevMeetScribe AI is an AI meeting assistant. Paste a meeting transcript (audio upload coming next) and it produces a summary, the decisions that were made, and action items you can edit and track, all running locally with Ollama.

## Features

- **AI meeting summary**: a short, readable overview instead of a wall of text
- **Decisions and action items**: extracted as structured data; owner and deadline stay empty unless the transcript states them
- **Editable tasks**: update status, assignee and deadline, or add tasks manually
- **Meeting history**: every meeting, summary and task is stored in PostgreSQL

**Roadmap:** audio transcription (Whisper), chat with your meeting (RAG with citations), follow-up email draft, PDF export, JWT auth, React dashboard.

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Data JPA, Bean Validation |
| AI | Ollama + Llama 3.2 (local) |
| Database | MySQL 8 (pgvector image, ready for RAG) |
| API docs / testing | Swagger UI, Postman collection |
| Frontend | React (coming soon) |

## Project structure

```
devmeetscribe-ai/
├── backend/    # Spring Boot REST API
└── frontend/   # React app (coming soon)
```

## Run the backend

```bash
# 1. Database
cd backend
docker compose up -d

# 2. LLM
ollama pull llama3.2

# 3. API
mvn spring-boot:run
```

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Postman: import `backend/postman/DevMeetScribe-AI.postman_collection.json`

## API overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | App, database and Ollama status |
| POST | `/api/meetings` | Create a meeting from a transcript |
| GET | `/api/meetings` | List meetings |
| GET | `/api/meetings/{id}` | Meeting with summary, decisions and tasks |
| POST | `/api/meetings/{id}/analyze` | Run AI analysis |
| DELETE | `/api/meetings/{id}` | Delete a meeting |
| GET / POST | `/api/meetings/{id}/tasks` | List or add tasks |
| GET | `/api/tasks?status=PENDING` | Tasks across meetings |
| PATCH / DELETE | `/api/tasks/{id}` | Update or delete a task |

## Author

**Harishchandra Antarkar**: [GitHub](https://github.com/hariantarkar)