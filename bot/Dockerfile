# Multi-stage build: Python bot
FROM python:3.11-slim as bot-builder

WORKDIR /app/bot

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy bot requirements
COPY bot/pyproject.toml .
RUN pip install --no-cache-dir -e .

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Python environment from builder
COPY --from=bot-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=bot-builder /usr/local/bin /usr/local/bin

# Copy bot code
COPY bot /app/bot

WORKDIR /app/bot

# Create data directories
RUN mkdir -p logs data

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run the trading bot
CMD ["python", "trading_bot.py"]
