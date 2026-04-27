'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function TradingBotPage() {
  return (
    <DocumentationLayout title="Trading Bot Orchestrator" breadcrumb="System Components / Trading Bot">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The main trading bot orchestrator initializes all modules, manages the main event loop, 
            and coordinates between MT5, Strategy, Executor, and Database. This is the entry point of the system.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">bot/trading_bot.py</code><br/>
            <strong>Run:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">python trading_bot.py</code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Initialization Flow</h3>
          <CodeBlock language="text" code={`1. Load Configuration
   └─ Read .env file
   └─ Validate all required variables
   └─ Initialize TradingConfig object

2. Setup Logging
   └─ Create logs directory
   └─ Initialize rotating file handler
   └─ Initialize console handler
   └─ Initialize database logger

3. Initialize Database
   └─ Connect to SQLite
   └─ Create tables if needed
   └─ Record bot startup

4. Connect to MT5
   └─ Initialize MT5Connector
   └─ Log in with credentials
   └─ Verify connection

5. Start API Server
   └─ If ENABLE_API=true
   └─ Spawn Flask process on port 8000
   └─ Health check endpoints

6. Enter Main Loop
   └─ Fetch market data
   └─ Run strategy analysis
   └─ Execute signals
   └─ Manage open trades
   └─ Log status periodically`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Class: TradingBot</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">__init__(config)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Initializes bot with configuration. Does not start trading immediately.
              </p>
              <CodeBlock language="python" code={`from config import TradingConfig
from trading_bot import TradingBot

config = TradingConfig()
bot = TradingBot(config)  # Initialized but not running`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">start()</p>
              <p className="text-sm text-muted-foreground mt-2">
                Starts the bot and enters the main trading loop. Blocks until bot stops.
              </p>
              <CodeBlock language="python" code={`bot.start()
# Bot is now running and trading
# Blocks here until Ctrl+C or daily loss limit hit`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">stop()</p>
              <p className="text-sm text-muted-foreground mt-2">
                Gracefully stops the bot. Closes open positions (optional).
              </p>
              <CodeBlock language="python" code={`# Can be called from signal handler or API
bot.stop()
# Bot exits main loop
# Closes database connections`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Main Loop Execution</h3>
          <p className="text-muted-foreground mb-4">
            The main loop runs every CHECK_INTERVAL_SECONDS (default 60 seconds):
          </p>
          <CodeBlock language="python" code={`# Main loop pseudo-code (simplified)
while bot.is_running:
    try:
        # 1. Health check
        if not mt5_conn.is_ready():
            if not mt5_conn.reconnect():
                logger.error("MT5 disconnected, stopping")
                break
        
        # 2. Fetch market data
        bars = mt5_conn.get_rates(
            symbol=config.symbol,
            timeframe=config.timeframe,
            count=config.slow_ma_period + 10
        )
        
        if bars is None:
            logger.warning("Failed to get market data")
            sleep(config.check_interval_seconds)
            continue
        
        # 3. Analyze with strategy
        signal = strategy.analyze(bars)
        
        # 4. Execute if signal
        if signal:
            signal_type, indicators = signal
            executor.execute_signal(signal_type, indicators)
        
        # 5. Manage open trades
        executor.manage_open_trades()
        
        # 6. Log status periodically
        log_status_if_due()
        
        # 7. Sleep before next iteration
        sleep(config.check_interval_seconds)
        
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt, stopping")
        break
    except Exception as e:
        logger.error("Error in main loop", exception=str(e))
        sleep(config.check_interval_seconds)`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Signal Handling</h3>
          <p className="text-muted-foreground mb-4">
            Graceful shutdown on Ctrl+C and system signals:
          </p>
          <CodeBlock language="python" code={`# In bot initialization
def signal_handler(sig, frame):
    logger.info("Signal received, shutting down")
    bot.stop()

signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
signal.signal(signal.SIGTERM, signal_handler)  # Terminate

# Now Ctrl+C stops the bot gracefully`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Status Logging</h3>
          <p className="text-muted-foreground mb-4">
            Every 5 minutes, the bot logs its status:
          </p>
          <CodeBlock language="json" code={`{
  "timestamp": "2026-04-26T16:05:00Z",
  "event": "STATUS_CHECK",
  "balance": 100000.0,
  "equity": 99500.0,
  "open_trades": 2,
  "daily_pnl": -500.0,
  "total_trades_today": 5
}`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Running Multiple Bots</h3>
          <p className="text-muted-foreground mb-4">
            Each bot instance needs its own configuration and database:
          </p>
          <CodeBlock language="bash" code={`# Bot 1 - EURUSD strategy
$ python trading_bot.py  # Uses .env

# Bot 2 - GBPUSD strategy (different terminal)
$ TRADING_SYMBOL=GBPUSD DATABASE_PATH=bot/trading_bot_gbp.db python trading_bot.py

# Bot 3 - Gold strategy (different terminal)
$ TRADING_SYMBOL=GOLD DATABASE_PATH=bot/trading_bot_gold.db python trading_bot.py

# Each maintains separate trades, signals, and logs`} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Graceful Shutdown</p>
          <p className="text-sm">
            The bot handles Ctrl+C gracefully by closing the main loop, flushing logs, and closing database connections.
            No data is lost. The next run will resume normally.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
