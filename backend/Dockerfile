FROM python:3.11

WORKDIR /app

# Install system dependencies for packages that may need compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies (with prebuilt wheels)
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --prefer-binary -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the app
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
