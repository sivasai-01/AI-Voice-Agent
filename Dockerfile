# Use official Python runtime
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Copy requirements first (for caching)
COPY backend/requirements.txt ./requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy full backend code
COPY backend/ ./backend

# Expose port (optional, for documentation)
EXPOSE 8000

# Start app (IMPORTANT: use $PORT and correct path)
CMD ["sh", "-c", "uvicorn backend.app:app --host 0.0.0.0 --port $PORT"]
