# Cedar Sentinel

An AI agent permission and audit layer. An AI agent (Strands SDK, backed
by Amazon Bedrock or a fallback provider) can execute real actions —
issuing refunds, reading records — but only after passing a Cedar policy
check. Every decision, allowed or denied, is logged immutably to
OpenSearch, so there's always an answer to "why did the agent do that?"

Built for the WeMakeDevs × AWS First Commit hackathon.

## Getting Started

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Unix/MacOS: `source .venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Copy `.env.example` to `.env` and fill in real values (OpenSearch
   credentials, and either Bedrock or Omniroute credentials for the
   agent — see AGENTS.md for details).

### Running the API

To start the API server:

```bash
uvicorn api.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### API Endpoints

- `POST /api/authorize` - Authorize an action
- `GET /api/logs` - Search audit logs
- `GET /api/logs/{log_id}` - Get a specific log entry
- `GET /api/agents` - List known agents
- `GET /api/policies` - List Cedar policies

### Running Tests

To run the API tests:

```bash
cd api
python -m pytest test_api.py -v
```

### Project Structure

- `api/` - FastAPI application
- `agent/` - Strands agent with Bedrock/Omniroute/Ollama provider fallback
- `policy/` - Cedar policies and authorization logic
- `audit/` - OpenSearch audit logging
- `executor/` - Action execution
- `frontend/` - React UI (teammate's responsibility)
- `infra/` - Infrastructure as code

### Notes

- The API uses CORS middleware allowing all origins (for development).
- The frontend should call the API at `http://localhost:8000/api/...`.