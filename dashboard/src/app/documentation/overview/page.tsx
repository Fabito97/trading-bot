'use client';

import { Code2 } from 'lucide-react';
import DocumentationLayout from '@/components/documentation-layout';

export default function OverviewPage() {
  return (
    <DocumentationLayout title="System Overview" breadcrumb="Getting Started / Overview">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Architecture</h2>
          <p className="text-muted-foreground mb-4">
            The MT5 Trading Bot is a multi-layered system that connects to MetaTrader 5, analyzes market data, and executes trades automatically.
          </p>
          
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
            <pre className="text-sm font-mono overflow-x-auto">
{`┌─────────────────────────────────────────────────────┐
│         TRADING BOT ARCHITECTURE                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  trading_bot.py (Main Orchestrator)         │   │
│  │  - Initializes system                       │   │
│  │  - Runs main loop every N seconds           │   │
│  │  - Coordinates all modules                  │   │
│  └──────────────────┬──────────────────────────┘   │
│                    │                              │
│     ┌──────────────┼──────────────┐               │
│     │              │              │               │
│  ┌──▼─────┐  ┌────▼────┐  ┌─────▼──┐            │
│  │MT5      │  │Strategy │  │Executor│            │
│  │Connector│  │Engine   │  │        │            │
│  └──┬─────┘  └────┬────┘  └─────┬──┘            │
│     │              │              │               │
│     └──────────────┼──────────────┘               │
│                    │                              │
│            ┌───────▼────────┐                    │
│            │  Database      │                    │
│            │  (SQLite)      │                    │
│            └────────────────┘                    │
│                                                     │
│       API Server (Flask) - Separate Process        │
│       - /api/status    - Get bot status            │
│       - /api/trades    - List trades               │
│       - /api/signals   - Get signals               │
│       - /api/logs      - Stream logs               │
│                                                     │
└─────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Execution Flow</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">1. Initialization</h3>
              <p className="text-sm text-muted-foreground">Bot starts, initializes database, loads config from .env, connects to MT5</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">2. Market Data Fetch</h3>
              <p className="text-sm text-muted-foreground">MT5Connector fetches N candles for specified symbol and timeframe</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">3. Strategy Analysis</h3>
              <p className="text-sm text-muted-foreground">Strategy calculates moving averages, RSI, checks for crossover signals</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">4. Signal Generation</h3>
              <p className="text-sm text-muted-foreground">If conditions met, signal stored in database and returned to executor</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">5. Trade Execution</h3>
              <p className="text-sm text-muted-foreground">Executor validates signal, calculates position size, places order on MT5</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">6. Trade Management</h3>
              <p className="text-sm text-muted-foreground">Monitor open trades for SL/TP hits, update balance, check daily limits</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">7. Logging & Status</h3>
              <p className="text-sm text-muted-foreground">Log all events to file and database, periodic status reports every 5 mins</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Key Concepts</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded p-4">
              <h3 className="font-semibold mb-2">Moving Average Crossover</h3>
              <p className="text-sm text-muted-foreground">
                Signal = When 20-period MA crosses above 50-period MA (BUY) or below (SELL). 
                Only triggers if RSI {"<"} 70 to avoid overbought conditions.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <h3 className="font-semibold mb-2">Position Sizing</h3>
              <p className="text-sm text-muted-foreground">
                Risk = 1% of balance per trade. Position size = (Balance × Risk %) / Stop Loss (pips).
                Ensures consistent risk management across all trades.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <h3 className="font-semibold mb-2">Daily Loss Limit</h3>
              <p className="text-sm text-muted-foreground">
                If daily P&L drops below -15% of starting balance, bot stops trading and logs alert.
                Prevents catastrophic losses in adverse market conditions.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <h3 className="font-semibold mb-2">IPC Connection</h3>
              <p className="text-sm text-muted-foreground">
                Bot communicates with MT5 via Inter-Process Communication. MT5 must be running 
                on the same Windows machine with valid login credentials.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Module Responsibilities</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">config.py</p>
                <p className="text-sm text-muted-foreground">Loads and validates environment variables. Single source of truth for all settings.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">mt5_connector.py</p>
                <p className="text-sm text-muted-foreground">Manages MT5 connection lifecycle, data fetching, and order placement. Auto-reconnects on failure.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">strategy.py</p>
                <p className="text-sm text-muted-foreground">Calculates technical indicators (SMA, RSI) and determines buy/sell signals.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">executor.py</p>
                <p className="text-sm text-muted-foreground">Validates signals, calculates position size, manages risk limits, executes orders.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">database.py</p>
                <p className="text-sm text-muted-foreground">SQLite operations: creates tables, inserts trades/signals/logs, thread-safe queries.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">logger.py</p>
                <p className="text-sm text-muted-foreground">Structured JSON logging to console, file, and database. Rotation and filtering.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">api.py</p>
                <p className="text-sm text-muted-foreground">Flask REST API for dashboard communication. Runs in separate process on port 8000.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DocumentationLayout>
  );
}
