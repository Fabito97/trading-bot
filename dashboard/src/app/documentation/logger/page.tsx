'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function LoggerPage() {
  return (
    <DocumentationLayout title="Logger" breadcrumb="System Components / Logger">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The Logger module provides structured JSON logging to three destinations: console, rotating file, and database. 
            All events are logged with context for easier debugging and monitoring.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">bot/logger.py</code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Log Output Locations</h3>
          <div className="space-y-3">
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">1. Console (stdout)</p>
              <p className="text-sm text-muted-foreground">
                Real-time logs as they happen. Set LOG_LEVEL=INFO to see all events.
              </p>
              <CodeBlock language="bash" code={`2026-04-26 16:01:51 - trading_bot - INFO - Bot started successfully
2026-04-26 16:01:52 - strategy - DEBUG - Current indicators
2026-04-26 16:02:10 - executor - ERROR - Order placement failed`} />
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">2. File (Rotating)</p>
              <p className="text-sm text-muted-foreground">
                Location: <code className="bg-background px-2 py-1 rounded text-xs">bot/logs/trading_bot.log</code>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Rotates daily or at 10MB. Keeps last 7 days of logs. Searchable JSON format.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">3. Database</p>
              <p className="text-sm text-muted-foreground">
                Stored in SQLite <code className="bg-background px-2 py-1 rounded text-xs">logs</code> table. 
                Queryable and accessible via API at <code className="bg-background px-2 py-1 rounded text-xs">/api/logs</code>
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Logging Methods</h3>
          <p className="text-muted-foreground mb-4">
            All methods accept keyword arguments that get stored as structured data.
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">logger.info(message, **kwargs)</p>
              <p className="text-sm text-muted-foreground mt-2">
                General informational messages about bot operations.
              </p>
              <CodeBlock language="python" code={`logger.info(
    "Bot started successfully",
    login=106273315,
    server="MetaQuotes-Demo",
    symbol="EURUSD"
)

# Output:
# 2026-04-26 16:01:41 - trading_bot - INFO - Bot started successfully | {"login": 106273315, "server": "MetaQuotes-Demo", "symbol": "EURUSD"}`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">logger.warning(message, **kwargs)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Non-critical issues that don't stop execution.
              </p>
              <CodeBlock language="python" code={`logger.warning(
    "MT5 connection lost, attempting reconnect",
    last_ping="10 seconds ago",
    retry_count=1
)`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">logger.error(message, **kwargs)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Error conditions that may stop execution or need attention.
              </p>
              <CodeBlock language="python" code={`logger.error(
    "Failed to place order",
    symbol="EURUSD",
    order_type="BUY",
    error_code=-10001,
    error_message="Not enough money"
)`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">logger.log_signal(signal_type, reason, indicators)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Special method for trading signals with technical indicator data.
              </p>
              <CodeBlock language="python" code={`logger.log_signal(
    signal_type="BUY",
    reason="SMA crossover + RSI filter",
    indicators={
        "fast_ma": 1.0850,
        "slow_ma": 1.0820,
        "rsi": 68.5,
        "close": 1.0852
    }
)`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">logger.log_trade(trade_type, details)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Special method for trade execution events.
              </p>
              <CodeBlock language="python" code={`logger.log_trade(
    trade_type="ENTRY",  # or "EXIT"
    details={
        "ticket": 123456,
        "symbol": "EURUSD",
        "type": "BUY",
        "entry_price": 1.0850,
        "stop_loss": 1.0800,
        "take_profit": 1.0900,
        "position_size": 0.1,
        "reason": "SMA crossover signal"
    }
)`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Log Levels</h3>
          <p className="text-muted-foreground mb-4">
            Controlled via <code className="bg-muted px-2 py-1 rounded text-xs">LOG_LEVEL</code> environment variable.
          </p>
          <div className="space-y-2">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">DEBUG</p>
              <p className="text-sm text-muted-foreground">Most verbose. Shows all details including indicator values at each cycle.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">INFO (default)</p>
              <p className="text-sm text-muted-foreground">Normal operation messages, trades, signals, errors.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">WARNING</p>
              <p className="text-sm text-muted-foreground">Only warnings and errors. Skips normal operation info.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">ERROR</p>
              <p className="text-sm text-muted-foreground">Only critical errors. Minimal logging.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Log File Format</h3>
          <p className="text-muted-foreground mb-4">
            Logs are stored as JSON objects with timestamps for easy parsing and analysis.
          </p>
          <CodeBlock language="json" code={`{
  "timestamp": "2026-04-26T16:01:41.123456Z",
  "level": "INFO",
  "module": "trading_bot",
  "message": "Bot started successfully",
  "data": {
    "login": 106273315,
    "server": "MetaQuotes-Demo",
    "symbol": "EURUSD"
  }
}
{
  "timestamp": "2026-04-26T16:02:15.654321Z",
  "level": "ERROR",
  "module": "executor",
  "message": "Order placement failed",
  "data": {
    "symbol": "EURUSD",
    "error_code": -10001,
    "reason": "Insufficient margin"
  }
}`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Analyzing Logs</h3>
          <p className="text-muted-foreground mb-4">
            Example Python script to analyze bot logs:
          </p>
          <CodeBlock language="python" code={`import json
from datetime import datetime, timedelta

# Read log file
with open('bot/logs/trading_bot.log', 'r') as f:
    lines = f.readlines()

# Parse JSON logs
logs = [json.loads(line) for line in lines if line.strip()]

# Find all errors in last hour
one_hour_ago = datetime.now() - timedelta(hours=1)
errors = [
    log for log in logs 
    if log['level'] == 'ERROR' and 
    datetime.fromisoformat(log['timestamp']) > one_hour_ago
]

print(f"Errors in last hour: {len(errors)}")
for error in errors:
    print(f"  {error['timestamp']}: {error['message']}")
    print(f"    {error['data']}")`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Accessing Logs via API</h3>
          <p className="text-muted-foreground mb-4">
            The web dashboard retrieves logs from the API endpoint:
          </p>
          <CodeBlock language="bash" code={`# Get latest 100 logs
curl http://localhost:8000/api/logs?limit=100

# Response:
{
  "timestamp": "2026-04-26T16:03:00Z",
  "count": 100,
  "logs": [
    {
      "id": 1234,
      "level": "INFO",
      "module": "trading_bot",
      "message": "Bot started successfully",
      "details": "{\\"login\\": 106273315}",
      "created_at": "2026-04-26T16:01:41Z"
    },
    ...
  ]
}`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Log Rotation</h3>
          <p className="text-muted-foreground mb-4">
            Logs are rotated daily or when reaching 10MB, whichever comes first.
          </p>
          <CodeBlock language="bash" code={`# Log files are stored as:
bot/logs/trading_bot.log              # Current log
bot/logs/trading_bot.log.1            # Yesterday
bot/logs/trading_bot.log.2            # 2 days ago
bot/logs/trading_bot.log.7            # 7 days ago (oldest kept)

# Oldest logs are automatically deleted after 7 days`} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Structured Logging Best Practice</p>
          <p className="text-sm">
            Always pass relevant context as kwargs. This makes logs searchable and analyzable:
          </p>
          <CodeBlock language="python" code={`# ❌ Bad
logger.error("Something went wrong")

# ✅ Good
logger.error(
    "Failed to fetch market data",
    symbol="EURUSD",
    timeframe="M1",
    error_code=-1,
    retry_count=2,
    next_retry_in_seconds=30
)`} />
        </div>
      </section>
    </DocumentationLayout>
  );
}
