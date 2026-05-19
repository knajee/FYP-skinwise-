# SkinWISE 2.0 Backend

FastAPI asynchronous backend with PostgreSQL.

## Setup Instructions

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/skinwise
   JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
   ```

4. **Run Migrations**
   Generate the initial migration and apply it:
   ```bash
   # Make sure PYTHONPATH is set to the backend directory
   # Windows: $env:PYTHONPATH="."
   # Linux/Mac: export PYTHONPATH="."
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```

5. **Start the Server**
   ```bash
   uvicorn src.main:app --reload
   ```
