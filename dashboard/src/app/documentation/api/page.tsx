"use client";

import DocumentationLayout from "@/components/documentation-layout";
import CodeBlock from "@/components/code-block";

export default function APIPage() {
  return (
    <DocumentationLayout
      title="API Server"
      breadcrumb="System Components / API Server"
    >
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Flask REST API server runs on port 8000 and provides endpoints for
            the web dashboard to query bot status, trades, signals, and logs.
            Runs in a separate Python process from the main bot.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong>{" "}
            <code className="bg-muted px-2 py-1 rounded text-xs">
              bot/api.py
            </code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Endpoints</h3>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">GET /health</p>
              <p className="text-sm text-muted-foreground mt-2">
                Simple health check endpoint
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/health

# Response (200 OK):
{
  "status": "ok",
  "timestamp": "2026-04-26T16:03:00.123456Z"
}`}
              />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">GET /api/status</p>
              <p className="text-sm text-muted-foreground mt-2">
                Get current bot status and account info
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/api/status

# Response (200 OK):
{
  "timestamp": "2026-04-26T16:03:00Z",
  "mt5_connected": true,
  "account_info": {
    "login": 106273315,
    "balance": 100000.0,
    "equity": 99500.0,
    "margin_free": 45000.0,
    "margin_used": 55000.0,
    "leverage": 100,
    "currency": "USD"
  },
  "bot_stats": {
    "open_trades": 2,
    "daily_pnl": -500.0,
    "total_trades": 5,
    "uptime_seconds": 3600
  }
}`}
              />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">GET /api/trades</p>
              <p className="text-sm text-muted-foreground mt-2">
                List all open and closed trades
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/api/trades?limit=20&status=OPEN

# Response:
{
  "timestamp": "2026-04-26T16:03:00Z",
  "open_count": 2,
  "trades": [
    {
      "id": 1,
      "ticket": 123456,
      "symbol": "EURUSD",
      "trade_type": "BUY",
      "entry_price": 1.0850,
      "entry_time": "2026-04-26T15:00:00Z",
      "stop_loss": 1.0800,
      "take_profit": 1.0900,
      "position_size": 0.1,
      "status": "OPEN",
      "unrealized_pnl": 150.50
    }
  ]
}`}
              />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">
                GET /api/trades/&lt;ticket&gt;
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Get details for a specific trade
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/api/trades/123456

# Response:
{
  "timestamp": "2026-04-26T16:03:00Z",
  "trade": {
    "id": 1,
    "ticket": 123456,
    "symbol": "EURUSD",
    "trade_type": "BUY",
    "entry_price": 1.0850,
    "entry_time": "2026-04-26T15:00:00Z",
    "exit_price": null,
    "exit_time": null,
    "stop_loss": 1.0800,
    "take_profit": 1.0900,
    "position_size": 0.1,
    "status": "OPEN"
  }
}`}
              />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">
                GET /api/signals
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Get generated trading signals
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/api/signals?limit=50

# Response:
{
  "timestamp": "2026-04-26T16:03:00Z",
  "count": 5,
  "signals": [
    {
      "id": 1,
      "signal_type": "BUY",
      "reason": "SMA crossover + RSI filter",
      "fast_ma": 1.0850,
      "slow_ma": 1.0820,
      "rsi": 68.5,
      "candle_close": 1.0852,
      "created_at": "2026-04-26T16:02:15Z"
    }
  ]
}`}
              />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">GET /api/logs</p>
              <p className="text-sm text-muted-foreground mt-2">
                Stream bot activity logs
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/api/logs?limit=100&level=INFO

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
    }
  ]
}`}
              />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">GET /api/stats</p>
              <p className="text-sm text-muted-foreground mt-2">
                Get performance statistics
              </p>
              <CodeBlock
                language="bash"
                code={`curl http://localhost:8000/api/stats

# Response:
{
  "timestamp": "2026-04-26T16:03:00Z",
  "stats": {
    "total_trades": 25,
    "winning_trades": 15,
    "losing_trades": 10,
    "win_rate": 0.6,
    "total_pnl": 2500.0,
    "average_win": 250.0,
    "average_loss": -150.0,
    "largest_win": 500.0,
    "largest_loss": -400.0,
    "uptime_hours": 5.5
  }
}`}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Query Parameters</h3>
          <div className="space-y-3">
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">limit</p>
              <p className="text-sm text-muted-foreground">
                Number of records to return (default: 100)
              </p>
              <code className="bg-background px-2 py-1 rounded text-xs">
                ?limit=50
              </code>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">status</p>
              <p className="text-sm text-muted-foreground">
                Filter trades by status: OPEN, CLOSED
              </p>
              <code className="bg-background px-2 py-1 rounded text-xs">
                ?status=OPEN
              </code>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">level</p>
              <p className="text-sm text-muted-foreground">
                Filter logs by level: DEBUG, INFO, WARNING, ERROR
              </p>
              <code className="bg-background px-2 py-1 rounded text-xs">
                ?level=ERROR
              </code>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">offset</p>
              <p className="text-sm text-muted-foreground">
                Pagination offset (default: 0)
              </p>
              <code className="bg-background px-2 py-1 rounded text-xs">
                ?offset=50&limit=50
              </code>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Error Responses</h3>
          <CodeBlock
            language="json"
            code={`// 503 Service Unavailable - MT5 not connected
{
  "error": "MT5 connection unavailable",
  "status": 503,
  "timestamp": "2026-04-26T16:03:00Z"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "details": "...",
  "status": 500,
  "timestamp": "2026-04-26T16:03:00Z"
}`}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">CORS Headers</h3>
          <p className="text-muted-foreground mb-4">
            API supports CORS for cross-origin requests from the dashboard.
          </p>
          <CodeBlock
            language="bash"
            code={`# All responses include:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type`}
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">
            💡 API Process Separation
          </p>
          <p className="text-sm">
            The API server is a separate Flask process that re-initializes MT5
            connection when needed. It pulls data from the SQLite database and
            MT5. If MT5 is unavailable, endpoints return 503.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
