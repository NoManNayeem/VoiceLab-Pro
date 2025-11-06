# VoiceLab Pro

A modern Text-to-Speech (TTS) and Speech-to-Text (STT) platform built with FastAPI and Next.js, powered by ElevenLabs AI.

## Project Structure

```
voicelab-pro/
├── backend/          # FastAPI backend
├── frontend/         # Next.js 16 frontend
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.12+ (for local backend development)
- uv (Python package manager)

### Setup

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```
3. Update `.env` files with your configuration:
   - **Important**: Add your ElevenLabs API key to `backend/.env`:
     ```
     ELEVENLABS_API_KEY=your_api_key_here
     ```
     Get your API key from: https://elevenlabs.io/
   
   **Note**: If you're using a Free Tier account:
   - Free Tier doesn't work with VPNs/Proxies
   - Multiple free accounts from the same IP may trigger abuse detection
   - Rate limit: 3 requests/minute
   - Consider upgrading to a Paid Plan ($5/month Creator Plan) for production use
   - Paid plans remove VPN restrictions and have higher rate limits
   
   **Troubleshooting**: If you see "detected_unusual_activity" error:
   - Disable VPN/Proxy if using one
   - Use consistent IP addresses
   - Don't create multiple free accounts
   - Respect rate limits
   - Contact ElevenLabs support: https://elevenlabs.io/help

4. Start services with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432

### Default Login Credentials

- Username: `Nayeem`
- Password: `password`

## Development

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Backend**: FastAPI 0.121.0, SQLAlchemy, Alembic, PostgreSQL, ElevenLabs SDK v3
- **Frontend**: Next.js 16, React, Tailwind CSS, React Icons
- **Infrastructure**: Docker, Docker Compose
- **Package Management**: uv (Python), npm (Node.js)

## Troubleshooting

### ElevenLabs API Issues

**Error: "detected_unusual_activity"**

This error indicates ElevenLabs has flagged your account for potential abuse. Common causes:

1. **VPN/Proxy Usage**: Free Tier doesn't support VPNs/Proxies
2. **Multiple Accounts**: Multiple free accounts from the same IP
3. **Rate Limiting**: Exceeding Free Tier limits (3 requests/minute)
4. **Abuse Patterns**: Automated scripts or unusual usage patterns

**Solutions:**

- ✅ Disable VPN/Proxy if using one
- ✅ Use consistent IP addresses
- ✅ Don't create multiple free accounts
- ✅ Respect rate limits (3 requests/minute for Free Tier)
- ✅ Upgrade to Paid Plan ($5/month Creator Plan removes most restrictions)
- ✅ Contact ElevenLabs support: https://elevenlabs.io/help

**Test Your API Key:**

```bash
curl -X GET "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: YOUR_API_KEY"
```

### Prevention Tips

- Use consistent IP addresses
- Don't create multiple free accounts
- Respect rate limits (Free Tier: 3 requests/minute)
- Avoid automated scripts on Free Tier
- Consider upgrading for production use

The Free Tier has strict abuse detection to prevent system overload. For development/production use, upgrading to a paid plan is recommended as it removes most of these restrictions.

