# MT5 Trading Bot - Deployment Guide

A complete guide for deploying the production-ready trading bot using Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [VPS Deployment](#vps-deployment)
5. [Configuration](#configuration)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Docker** (19.03+) and **Docker Compose** (1.25+)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)

- **MetaTrader5** installed and configured
  - Account with a broker (demo or live)
  - MT5 terminal must be accessible to the bot

- **Python 3.9+** (for local development)

### Optional

- **Git** for version control
- **curl** for API testing
- **nginx** for reverse proxy (production)

---

## Local Development

### 1. Setup Python Environment

```bash
cd bot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .
```

### 2. Configure Environment Variables

```bash
# Copy example to actual config
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

**Key variables:**

```env
MT5_LOGIN=12345678
MT5_PASSWORD=your_password
MT5_SERVER=ICMarketsSC-Demo
TRADING_SYMBOL=EURUSD
FAST_MA_PERIOD=20
SLOW_MA_PERIOD=50
```

### 3. Run Locally

```bash
# Start the trading bot
python trading_bot.py

# In another terminal, start the API server
python api.py

# Test the API
curl http://localhost:8000/health
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
# Build the image
docker build -f bot/Dockerfile -t mt5-trading-bot:latest .

# Or use docker-compose
docker-compose build
```

### 2. Create Configuration

```bash
# Copy example env file
cp bot/.env.example bot/.env

# Edit configuration
nano bot/.env
```

### 3. Run with Docker Compose

```bash
# Start the container
docker-compose up -d

# View logs
docker-compose logs -f trading-bot

# Stop the container
docker-compose down
```

### 4. Verify Container

```bash
# Check container status
docker-compose ps

# Test API endpoint
curl http://localhost:8000/health

# View logs
docker-compose logs trading-bot
```

---

## VPS Deployment

### 1. Setup VPS (Example: DigitalOcean Ubuntu 22.04)

```bash
# SSH into VPS
ssh root@your_vps_ip

# Update system
apt update && apt upgrade -y

# Install Docker
apt install -y docker.io docker-compose

# Start Docker service
systemctl start docker
systemctl enable docker

# Add current user to docker group
usermod -aG docker $USER
newgrp docker
```

### 2. Clone Repository

```bash
# Clone from GitHub (or copy files)
git clone https://github.com/yourusername/mt5-trading-bot.git
cd mt5-trading-bot

# Or upload files via SCP
# scp -r ./bot user@vps_ip:/home/user/trading-bot/
```

### 3. Configure for VPS

```bash
# Create .env file with your credentials
cat > bot/.env << EOF
MT5_LOGIN=12345678
MT5_PASSWORD=your_password
MT5_SERVER=ICMarketsSC-Demo
TRADING_SYMBOL=EURUSD
ENABLE_API=true
API_HOST=0.0.0.0
API_PORT=8000
EOF
```

### 4. Deploy with Docker Compose

```bash
# Start the bot
docker-compose up -d

# Verify it's running
docker-compose ps

# View logs
docker-compose logs -f trading-bot
```

### 5. Setup Reverse Proxy (Optional)

```bash
# Install nginx
apt install -y nginx

# Create nginx config
cat > /etc/nginx/sites-available/trading-bot << 'EOF'
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site and restart nginx
ln -s /etc/nginx/sites-available/trading-bot /etc/nginx/sites-enabled/
systemctl restart nginx
```

---

## Configuration

### Environment Variables

All configuration is done through environment variables in `bot/.env`:

```env
# MetaTrader5
MT5_LOGIN=12345678
MT5_PASSWORD=your_password
MT5_SERVER=ICMarketsSC-Demo
MT5_PATH=/path/to/terminal64.exe  # Optional

# Strategy
TRADING_SYMBOL=EURUSD
FAST_MA_PERIOD=20
SLOW_MA_PERIOD=50
RSI_PERIOD=14

# Risk Management
STOP_LOSS_PIPS=50
TAKE_PROFIT_PIPS=100
MAX_DAILY_LOSS_PERCENT=2.0
MAX_POSITION_SIZE=0.1
MAX_TRADES_PER_DAY=5

# Logging
LOG_LEVEL=INFO
LOG_DIR=./logs

# API
ENABLE_API=true
API_HOST=0.0.0.0
API_PORT=8000
```

### Dynamic Configuration

To change settings without restarting:

1. Update `.env` file
2. Restart container: `docker-compose restart trading-bot`

---

## Monitoring

### API Endpoints

#### Health Check

```bash
curl http://localhost:8000/health
```

#### Bot Status

```bash
curl http://localhost:8000/api/status
```

Response includes:
- MT5 connection status
- Account balance, equity, margin
- Open trades count
- Daily P&L

#### Recent Trades

```bash
curl http://localhost:8000/api/trades?limit=20
```

#### Trading Signals

```bash
curl http://localhost:8000/api/signals?limit=50
```

#### Logs

```bash
curl http://localhost:8000/api/logs?limit=100
```

### Web Dashboard

Access the Next.js dashboard:

```
http://localhost:3000
```

Configure API URL in `.env`:

```env
NEXT_PUBLIC_API_URL=http://your_vps_ip:8000
```

### Log Monitoring

```bash
# View bot logs
docker-compose logs -f trading-bot

# View specific log level
docker-compose logs trading-bot | grep ERROR

# Download logs
docker-compose cp trading-bot:/app/bot/logs ./logs-backup
```

---

## Troubleshooting

### Bot Won't Start

```bash
# Check container logs
docker-compose logs trading-bot

# Common issues:
# 1. Missing .env file - create it from .env.example
# 2. Invalid MT5 credentials - verify login/password
# 3. MT5 server not reachable - check broker server name
```

### API Not Responding

```bash
# Check container is running
docker-compose ps

# Test health endpoint
curl -v http://localhost:8000/health

# Check port is exposed
docker ps | grep mt5-trading-bot

# Verify API port configuration
docker-compose logs trading-bot | grep "Starting API"
```

### No Trades Being Executed

```bash
# Check strategy logs
docker-compose logs trading-bot | grep "SIGNAL"

# Verify market data is being fetched
docker-compose logs trading-bot | grep "rates"

# Check risk management rules
docker-compose logs trading-bot | grep "blocked"
```

### High CPU/Memory Usage

```bash
# Check resource limits
docker stats

# Reduce check interval (default: 60s)
# Edit bot/.env: CHECK_INTERVAL_SECONDS=120

# Restart container
docker-compose restart trading-bot
```

### Database Errors

```bash
# Check database file exists
docker-compose exec trading-bot ls -la /app/bot/data/

# Reset database if corrupted
docker-compose exec trading-bot rm /app/bot/trading_bot.db
docker-compose restart trading-bot
```

---

## Updating the Bot

```bash
# Pull latest code
git pull origin main

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify update
docker-compose logs trading-bot
```

---

## Production Best Practices

1. **Backup Configuration**
   ```bash
   cp bot/.env bot/.env.backup
   ```

2. **Monitor Resource Usage**
   ```bash
   watch -n 5 'docker stats'
   ```

3. **Log Rotation**
   - Docker compose already handles log rotation (see docker-compose.yml)

4. **Regular Backups**
   ```bash
   # Backup database and logs
   docker-compose exec trading-bot tar -czf /tmp/backup.tar.gz /app/bot/data /app/bot/logs
   ```

5. **Security**
   - Never commit `.env` with real credentials to Git
   - Use environment variables for secrets on production
   - Restrict API access with firewall rules

6. **Monitoring Alerts**
   - Monitor MT5 connection status
   - Alert on daily loss limit exceeded
   - Track P&L trends

---

## Support & Resources

- **Documentation**: See `/` for full guide
- **Configuration**: Edit `bot/.env` and restart
- **Logs**: View with `docker-compose logs`
- **API**: Access at `http://localhost:8000/health`

---

For more details, refer to the main README.md file.
