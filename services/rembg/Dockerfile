FROM python:3.11-slim

# Set environment vars
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

WORKDIR /app

# Install system deps needed by Pillow and OpenCV (used by rembg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the u2net model so it's baked into the image
RUN python -c "from rembg import new_session; new_session('u2net')"

# Copy app code
COPY main.py .

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "2", "--timeout", "300", "main:app"]
