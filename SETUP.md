# VoiceLab Pro - Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)
- uv package manager (for Python)

## Quick Start with Docker

1. **Clone the repository** (if not already done)

2. **Set up environment variables:**

   Create `backend/.env` file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and add your API keys:
   ```
   # Required: At least one TTS provider API key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   CARTESIA_API_KEY=your_cartesia_api_key_here
   
   # Optional: Database settings (defaults provided)
   POSTGRES_USER=voicelab_user
   POSTGRES_PASSWORD=voicelab_password
   POSTGRES_DB=voicelab_pro
   
   # Optional: Application settings
   SECRET_KEY=change-this-secret-key-in-production
   ENVIRONMENT=development
   ```

   Create `frontend/.env.local` file:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```
   
   Edit `frontend/.env.local` (optional - defaults provided):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Default Login Credentials

- Username: `Nayeem`
- Password: `password`

## Local Development (Without Docker)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment with uv:
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   uv pip install -e .
   ```

4. Set up environment variables (create `.env` file)

5. Start PostgreSQL (using Docker or local installation)

6. Run migrations:
   ```bash
   alembic upgrade head
   ```

7. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file (optional - defaults provided):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Migrations

### Create a new migration:
```bash
docker-compose exec backend alembic revision --autogenerate -m "Description"
```

### Apply migrations:
```bash
docker-compose exec backend alembic upgrade head
```

### Rollback migration:
```bash
docker-compose exec backend alembic downgrade -1
```

## Project Structure

```
voicelab-pro/
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   │   ├── api/         # API routes
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   ├── alembic/         # Database migrations
│   └── Dockerfile
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── lib/            # Utilities and API client
│   └── Dockerfile
└── docker-compose.yml   # Docker orchestration
```

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify `.env` file has correct database credentials
- Check if port 8000 is available

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches backend URL
- Check CORS settings in backend `config.py`
- Ensure backend is running

### Database connection errors
- Verify PostgreSQL container is healthy: `docker-compose ps`
- Check database credentials in `.env`
- Ensure migrations are applied: `alembic upgrade head`

### TTS generation fails
- Verify at least one TTS provider API key is set in `.env`:
  - `ELEVENLABS_API_KEY` for ElevenLabs TTS
  - `CARTESIA_API_KEY` for Cartesia AI TTS
- Check API key is valid and has credits/quota
- Review backend logs for error messages
- For ElevenLabs: Check if Free Tier restrictions apply (VPN/Proxy issues)

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Use production database (not Docker)
3. Build frontend: `npm run build`
4. Use production Dockerfile (separate from dev)
5. Set up proper secrets management
6. Configure HTTPS
7. Set up monitoring and logging

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### TTS
- `POST /api/tts/generate` - Generate TTS audio
- `GET /api/tts/history` - Get TTS history

### STT
- `GET /api/stt/status` - Get STT status (Coming Soon)

Full API documentation available at `/docs` when backend is running.

