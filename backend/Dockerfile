# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Set environment variables (build-time optimization, not for secrets)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render will override with $PORT)
EXPOSE 8000

# Command to run the application
# Environment variables (LIVEKIT_URL, LIVEKIT_API_KEY, etc.) 
# are passed at runtime, NOT embedded in Dockerfile
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
