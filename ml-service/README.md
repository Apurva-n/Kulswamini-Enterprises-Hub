# ML Service (Phase 5 Placeholder)

This FastAPI microservice is a skeleton for future ML features. It is **not wired into production ordering or ledger flows** — the Node backend can call it via `ML_SERVICE_URL` when ready.

## Planned features

| Endpoint | Purpose | Approach |
|----------|---------|----------|
| `POST /forecast/demand` | Predict product demand per shop or overall | Moving average → Facebook Prophet |
| `POST /score/credit-risk` | Flag shops likely to delay payment | Logistic regression on payment history |

## Run locally

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Health check: `GET http://localhost:8001/health`

## Integration

Set `ML_SERVICE_URL=http://localhost:8001` in the backend `.env`. The main app continues to work without this service running.
