FROM python:3.11

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-download the SentenceTransformer model to prevent health check timeouts
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

EXPOSE 8000

# CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port $PORT"]

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
