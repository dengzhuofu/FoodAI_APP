# FastAPI Development Standards

## Project Structure

A standardized directory structure ensures maintainability:

```
backend/
├── app/
│   ├── api/            # API endpoints
│   │   └── v1/         # Versioning
│   │       └── api.py  # Router aggregation
│   ├── core/           # Core config
│   │   ├── config.py   # Pydantic Settings
│   │   └── security.py # JWT/Auth logic
│   ├── models/         # ORM Models (DB)
│   ├── schemas/        # Pydantic Models (Data Transfer)
│   ├── services/       # Business Logic
│   ├── db/             # Database connection/session
│   └── main.py         # App entry point
├── tests/              # Pytest tests
├── requirements.txt
└── .env
```

## Naming Conventions

- **Clear & Descriptive**: Function and variable names must be self-explanatory (e.g., `get_user_profile` instead of `get_data`).
- **RESTful Endpoints**: Use nouns for resources and HTTP verbs for actions.
  - Good: `POST /users`, `GET /users/{id}`
  - Bad: `POST /createUser`, `GET /getUserInfo`
- **Function Names**: Use `verb_noun` pattern (e.g., `calculate_total_price`, `validate_email`).
- **No Ambiguous Abbreviations**: Avoid `mgr`, `ctx` (unless standard), `func`. Use full words like `manager`, `context`.

## Dependency Management

- Use `requirements.txt` or `pyproject.toml`.
- Pin versions for stability.
- Common dependencies: `fastapi`, `uvicorn`, `pydantic-settings`, `sqlalchemy`, `httpx` (for AI calls).

## Error Handling

Use a global exception handler or specific HTTP exceptions.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Item not found"
)
```

## Database

- Use **SQLAlchemy 2.0+** (Async) or **Tortoise ORM**.
- Use Alembic for migrations.
- Always use `async` session management.

## Testing

- Use `pytest` and `httpx.AsyncClient` for integration tests.
- Mock external AI services during tests to save costs and ensure speed.
