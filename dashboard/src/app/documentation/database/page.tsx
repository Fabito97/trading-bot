'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function DatabasePage() {
  return (
    <DocumentationLayout title="Database" breadcrumb="Core Modules / Database">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            SQLite database stores all persistent data: trades, signals, logs, and bot state. 
            Single file at <code className="bg-muted px-2 py-1 rounded text-xs">bot/trading_bot.db</code>. 
            Thread-safe operations using connection pooling.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">bot/database.py</code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Database Schema</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">trades</p>
              <p className="text-sm text-muted-foreground mb-3">Executed trades and their results</p>
              <CodeBlock language="sql" code={`CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket INTEGER NOT NULL UNIQUE,           -- MT5 order ticket
    symbol TEXT NOT NULL,                     -- Currency pair (EURUSD)
    trade_type TEXT NOT NULL,                 -- 'BUY' or 'SELL'
    entry_price REAL NOT NULL,                -- Entry price
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_price REAL,                          -- Exit price (null if open)
    exit_time TIMESTAMP,                      -- Exit time (null if open)
    stop_loss REAL NOT NULL,                  -- SL price
    take_profit REAL NOT NULL,                -- TP price
    position_size REAL NOT NULL,              -- Lot size
    profit_loss REAL,                         -- P&L in account currency
    profit_loss_pips REAL,                    -- P&L in pips
    status TEXT DEFAULT 'OPEN',               -- 'OPEN' or 'CLOSED'
    close_reason TEXT,                        -- 'SL_HIT', 'TP_HIT', 'MANUAL'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">signals</p>
              <p className="text-sm text-muted-foreground mb-3">All generated trading signals</p>
              <CodeBlock language="sql" code={`CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signal_type TEXT NOT NULL,                -- 'BUY' or 'SELL'
    reason TEXT NOT NULL,                     -- Signal reason
    fast_ma REAL,                             -- Fast MA value
    slow_ma REAL,                             -- Slow MA value
    rsi REAL,                                 -- RSI value
    candle_close REAL,                        -- Close price
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">logs</p>
              <p className="text-sm text-muted-foreground mb-3">Structured activity logs (also in file)</p>
              <CodeBlock language="sql" code={`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,                      -- 'INFO', 'WARNING', 'ERROR'
    module TEXT NOT NULL,                     -- Source module
    message TEXT NOT NULL,                    -- Log message
    details TEXT,                             -- JSON details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">bot_state</p>
              <p className="text-sm text-muted-foreground mb-3">Current bot status and metrics</p>
              <CodeBlock language="sql" code={`CREATE TABLE IF NOT EXISTS bot_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_run TIMESTAMP,                       -- Last bot cycle
    total_trades INTEGER DEFAULT 0,           -- Total trades executed
    daily_pnl REAL DEFAULT 0,                 -- Daily profit/loss
    is_running BOOLEAN DEFAULT 0,             -- Bot active?
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Class: Database</h3>
          <p className="text-muted-foreground mb-4">Main class for all database operations.</p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">add_trade(ticket, symbol, trade_type, ...) → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Inserts a new trade record after execution.
              </p>
              <CodeBlock language="python" code={`db.add_trade(
    ticket=123456,                    # MT5 order ticket
    symbol="EURUSD",
    trade_type="BUY",
    entry_price=1.0850,
    stop_loss=1.0800,
    take_profit=1.0900,
    position_size=0.1
)
# Returns True if successful`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">close_trade(ticket, exit_price, close_reason) → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Updates trade with exit price and closes it.
              </p>
              <CodeBlock language="python" code={`db.close_trade(
    ticket=123456,
    exit_price=1.0900,                # Price at which position closed
    close_reason="TP_HIT"             # or "SL_HIT" or "MANUAL"
)
# Automatically calculates P&L`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">add_signal(signal_type, reason, fast_ma, slow_ma, rsi, candle_close) → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Records a generated trading signal.
              </p>
              <CodeBlock language="python" code={`db.add_signal(
    signal_type="BUY",
    reason="SMA crossover + RSI filter",
    fast_ma=1.0850,
    slow_ma=1.0820,
    rsi=68.5,
    candle_close=1.0852
)`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_open_trades(symbol) → list</p>
              <p className="text-sm text-muted-foreground mt-2">
                Returns all open trades for a symbol.
              </p>
              <CodeBlock language="python" code={`trades = db.get_open_trades("EURUSD")
for trade in trades:
    print(f"Ticket: {trade['ticket']}")
    print(f"Entry: {trade['entry_price']}")
    print(f"SL: {trade['stop_loss']}")
    print(f"TP: {trade['take_profit']}")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_trade_history(limit=100) → list</p>
              <p className="text-sm text-muted-foreground mt-2">
                Returns closed trades (most recent first).
              </p>
              <CodeBlock language="python" code={`history = db.get_trade_history(limit=50)
for trade in history:
    print(f"Closed at: {trade['exit_time']}")
    print(f"P&L: {trade['profit_loss']}")
    print(f"Reason: {trade['close_reason']}")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_signals(limit=100) → list</p>
              <p className="text-sm text-muted-foreground mt-2">
                Returns recent signals (most recent first).
              </p>
              <CodeBlock language="python" code={`signals = db.get_signals(limit=20)
for signal in signals:
    print(f"Type: {signal['signal_type']}")
    print(f"Fast MA: {signal['fast_ma']}")
    print(f"Slow MA: {signal['slow_ma']}")
    print(f"RSI: {signal['rsi']}")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_daily_stats() → dict</p>
              <p className="text-sm text-muted-foreground mt-2">
                Returns daily performance metrics.
              </p>
              <CodeBlock language="python" code={`stats = db.get_daily_stats()
print(f"Total trades today: {stats['total_trades']}")
print(f"Winning trades: {stats['winning_trades']}")
print(f"Losing trades: {stats['losing_trades']}")
print(f"Daily P&L: {stats['daily_pnl']}")
print(f"Win rate: {stats['win_rate']:.2%}")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">add_log(level, module, message, details) → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Inserts a log record (also logged to file).
              </p>
              <CodeBlock language="python" code={`db.add_log(
    level="INFO",
    module="executor",
    message="Trade executed successfully",
    details=json.dumps({
        "ticket": 123456,
        "symbol": "EURUSD",
        "type": "BUY"
    })
)`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Querying Data</h3>
          <p className="text-muted-foreground mb-4">Direct SQL queries for custom analysis:</p>
          <CodeBlock language="python" code={`import sqlite3

# Connect to database
conn = sqlite3.connect('bot/trading_bot.db')
cursor = conn.cursor()

# Find all closed trades with P&L > 0
cursor.execute('''
    SELECT ticket, entry_price, exit_price, profit_loss, exit_time
    FROM trades
    WHERE status = 'CLOSED' AND profit_loss > 0
    ORDER BY exit_time DESC
    LIMIT 10
''')

for row in cursor.fetchall():
    print(f"Ticket {row[0]}: +{row[3]} pips")

conn.close()`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Thread Safety</h3>
          <p className="text-muted-foreground mb-4">
            Database uses thread-safe SQLite connections with connection pooling. 
            Multiple processes can read simultaneously, but only one write at a time (handled automatically by SQLite).
          </p>
          <CodeBlock language="python" code={`# Safe to call from multiple threads
# Bot main loop thread
db.add_trade(...)

# API server thread
trades = db.get_trade_history()

# Logger thread
db.add_log(...)`} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Database File Location</p>
          <p className="text-sm">
            <code className="bg-background px-2 py-1 rounded text-xs">bot/trading_bot.db</code> - Single SQLite file containing all data.
          </p>
          <p className="text-sm mt-2">
            To backup: Simply copy the .db file. To inspect: Use SQLite Studio or command-line sqlite3 tool.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
