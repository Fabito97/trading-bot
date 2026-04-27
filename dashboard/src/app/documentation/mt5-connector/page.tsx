'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function MT5ConnectorPage() {
  return (
    <DocumentationLayout title="MT5 Connector" breadcrumb="Core Modules / MT5 Connector">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The MT5Connector module manages all communication with MetaTrader 5. It handles connection lifecycle,
            data fetching, and order execution. The module is thread-safe and includes auto-reconnection logic.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">bot/mt5_connector.py</code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Class: MT5Connector</h3>
          <p className="text-muted-foreground mb-4">Main class for MT5 interaction.</p>
          
          <div className="bg-muted/30 border border-border rounded p-4 mb-4">
            <p className="font-mono font-semibold text-sm mb-3">__init__(login, password, server)</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">Parameters:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><code className="bg-background px-1 rounded text-xs">login</code> (int): MT5 account number</li>
                  <li><code className="bg-background px-1 rounded text-xs">password</code> (str): MT5 account password</li>
                  <li><code className="bg-background px-1 rounded text-xs">server</code> (str): Broker server name</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Behavior:</p>
                <p className="text-muted-foreground">Stores credentials but does NOT connect immediately. Use connect() to establish connection.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Core Methods</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">connect() → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Initializes MT5 and logs in. Must be called before any data/order operations.
              </p>
              <CodeBlock language="python" code={`# Returns True if successful, False otherwise
connected = mt5_conn.connect()
if not connected:
    print("Failed to connect to MT5")`} />
              <p className="text-xs text-muted-foreground mt-2">
                <strong>IPC Error:</strong> If you see "IPC initialize failed, MetaTrader 5 x64 not found", 
                MT5 is not installed or not running on this machine.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">is_ready() → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Checks if connection is still active. Non-blocking health check.
              </p>
              <CodeBlock language="python" code={`if not mt5_conn.is_ready():
    print("Connection lost, need to reconnect")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">reconnect() → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Attempts to re-establish connection. Used when connection drops unexpectedly.
              </p>
              <CodeBlock language="python" code={`if not mt5_conn.is_ready():
    success = mt5_conn.reconnect()
    if not success:
        logger.error("Reconnection failed")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_rates(symbol, timeframe, count) → np.ndarray | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetches historical candle data from MT5.
              </p>
              <div className="bg-background border border-border rounded p-3 mt-2 text-sm">
                <p className="font-semibold mb-2">Parameters:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><code className="bg-muted px-1 rounded text-xs">symbol</code> (str): Asset to fetch (e.g., "EURUSD")</li>
                  <li><code className="bg-muted px-1 rounded text-xs">timeframe</code> (int): MT5 timeframe constant (TIMEFRAME_M1, TIMEFRAME_H1, etc.)</li>
                  <li><code className="bg-muted px-1 rounded text-xs">count</code> (int): Number of bars to fetch (e.g., 100)</li>
                </ul>
                <p className="font-semibold mt-3 mb-2">Returns:</p>
                <p className="text-muted-foreground">NumPy array of shape (N, 6) with columns: [time, open, high, low, close, volume] or None if failed</p>
              </div>
              <CodeBlock language="python" code={`import MetaTrader5 as mt5

bars = mt5_conn.get_rates(
    symbol="EURUSD",
    timeframe=mt5.TIMEFRAME_M1,
    count=100
)
if bars is not None:
    print(f"Got {len(bars)} bars")
    close_prices = bars[:, 4]  # Column 4 is close price`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_account_info() → dict | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetches current account balance, equity, margin usage.
              </p>
              <CodeBlock language="python" code={`info = mt5_conn.get_account_info()
if info:
    print(f"Balance: {info['balance']}")
    print(f"Equity: {info['equity']}")
    print(f"Free Margin: {info['margin_free']}")
    print(f"Used Margin: {info['margin_used']}")`} />
              <p className="text-xs text-muted-foreground mt-2">
                Returns dict with keys: login, balance, equity, margin_free, margin_used, leverage, currency
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">place_order(symbol, order_type, volume, price, sl, tp, comment) → int | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Places a market or pending order on MT5.
              </p>
              <div className="bg-background border border-border rounded p-3 mt-2 text-sm">
                <p className="font-semibold mb-2">Parameters:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><code className="bg-muted px-1 rounded text-xs">symbol</code> (str): "EURUSD", etc.</li>
                  <li><code className="bg-muted px-1 rounded text-xs">order_type</code> (int): mt5.ORDER_TYPE_BUY or ORDER_TYPE_SELL</li>
                  <li><code className="bg-muted px-1 rounded text-xs">volume</code> (float): Lot size (0.01 = 1000 units for forex)</li>
                  <li><code className="bg-muted px-1 rounded text-xs">price</code> (float): Ask price for BUY, Bid for SELL</li>
                  <li><code className="bg-muted px-1 rounded text-xs">sl</code> (float): Stop loss price</li>
                  <li><code className="bg-muted px-1 rounded text-xs">tp</code> (float): Take profit price</li>
                  <li><code className="bg-muted px-1 rounded text-xs">comment</code> (str): Order comment/label</li>
                </ul>
                <p className="font-semibold mt-3 mb-2">Returns:</p>
                <p className="text-muted-foreground">Order ticket (int) on success, None on failure</p>
              </div>
              <CodeBlock language="python" code={`ticket = mt5_conn.place_order(
    symbol="EURUSD",
    order_type=mt5.ORDER_TYPE_BUY,
    volume=0.1,  # 0.1 lot
    price=1.0800,
    sl=1.0750,  # 50 pips SL
    tp=1.0850,  # 50 pips TP
    comment="SMA crossover buy signal"
)
if ticket:
    print(f"Order placed: ticket {ticket}")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_symbol_info(symbol) → dict | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Gets symbol metadata (pip value, ask/bid spread, etc.)
              </p>
              <CodeBlock language="python" code={`info = mt5_conn.get_symbol_info("EURUSD")
if info:
    print(f"Ask: {info['ask']}")
    print(f"Bid: {info['bid']}")
    print(f"Spread: {info['spread']} pips")
    print(f"Digits: {info['digits']}")  # Decimal places`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">get_positions(symbol) → list</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetches all open positions for a symbol.
              </p>
              <CodeBlock language="python" code={`positions = mt5_conn.get_positions("EURUSD")
for pos in positions:
    print(f"Ticket: {pos.ticket}")
    print(f"Type: {'BUY' if pos.type == 0 else 'SELL'}")
    print(f"Volume: {pos.volume}")
    print(f"Entry: {pos.price_open}")
    print(f"Current: {pos.price_current}")
    print(f"P&L: {pos.profit}")`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Bar Data Structure</h3>
          <p className="text-muted-foreground mb-4">
            The <code className="bg-muted px-2 py-1 rounded text-xs">get_rates()</code> method returns NumPy array with shape (N, 6):
          </p>
          <CodeBlock language="python" code={`bars = mt5_conn.get_rates("EURUSD", mt5.TIMEFRAME_M1, 10)

# bars is ndarray with shape (10, 6)
# Each row is one candle:
for bar in bars:
    time = bar[0]      # Unix timestamp
    open = bar[1]      # Open price
    high = bar[2]      # High price
    low = bar[3]       # Low price
    close = bar[4]     # Close price
    volume = bar[5]    # Volume in units`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Error Handling</h3>
          <p className="text-muted-foreground mb-4">All methods include try-except blocks and log errors:</p>
          <CodeBlock language="python" code={`# Method safely handles errors internally
result = mt5_conn.get_rates(...)
if result is None:
    # Logged as ERROR already, handle gracefully
    logger.warning("Failed to get rates, trying again next cycle")`} />
          <p className="text-xs text-muted-foreground mt-4">Common errors are logged with context for debugging.</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 IPC Communication</p>
          <p className="text-sm">
            MT5Connector uses MT5's Python library which communicates via IPC (Inter-Process Communication).
            MT5 terminal must be running on the same Windows machine. IPC is per-process, so each Python 
            process needs its own MT5 connection. The API server handles this by auto-reconnecting when needed.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
