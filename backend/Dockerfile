FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies directly (skip editable install for now)
RUN uv pip install --system fastapi uvicorn[standard] python-dotenv sqlalchemy alembic psycopg2-binary elevenlabs cartesia pydantic pydantic-settings python-multipart requests pyjwt python-jose[cryptography]

# Copy application code
COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

