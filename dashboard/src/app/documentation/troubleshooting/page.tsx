'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function TroubleshootingPage() {
  return (
    <DocumentationLayout title="Troubleshooting" breadcrumb="Advanced Topics / Troubleshooting">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Common Issues & Solutions</h2>
          <p className="text-muted-foreground mb-4">
            This guide covers common errors and how to debug them.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ IPC initialize failed, MetaTrader 5 x64 not found
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> MT5 is not installed on your machine, or it's not running.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-2">
              <li>Download MT5 from your broker's website</li>
              <li>Install normally</li>
              <li>Open MT5 terminal (it must be running)</li>
              <li>Run the bot again</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Verify:</strong> You should see MT5 icon in system tray, and the window can be minimized but must be running.
            </p>
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ Failed to login to MT5 account
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Wrong credentials or server name.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Test login manually in MT5 first
#    Open MT5, select server, enter login/password
#    If it fails there, your credentials are wrong

# 2. Double-check your .env file
notepad .env

# Verify:
# MT5_LOGIN=xxxxx        (your account number, not email)
# MT5_PASSWORD=xxxxxxx   (correct password)
# MT5_SERVER=ExnessMarketsPro-Demo  (exact server name from login dropdown)

# 3. Get correct server name:
#    Open MT5 → Settings → Server
#    Copy exact server name including any hyphens/numbers`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ No trades are being executed
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Market conditions don't match strategy or signals not being generated.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Enable debug logging to see indicators
#    Edit .env:
LOG_LEVEL=DEBUG

# 2. Restart bot and watch output
#    Look for [DEBUG] lines showing indicators
#    Check if signals are being generated

# 3. Manually check market data
#    Market might be closed or price frozen
#    Check if bars are being fetched correctly

# 4. Verify strategy conditions
#    SMA crossover might not be happening
#    RSI might be outside range (>70 or <30)
#    Check debug output for fast_ma, slow_ma, rsi values`} />
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Example Debug Output:</strong>
            </p>
            <CodeBlock language="text" code={`[DEBUG] Market data fetched - 100 bars
[DEBUG] Current indicators - fast_ma: 1.0850, slow_ma: 1.0820, rsi: 68.5
[DEBUG] No signal generated (fast_ma > slow_ma, but not crossover)`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ Order placement failed (Not enough money)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Account balance too low for calculated position size.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Check your account balance
#    Via bot logs: look for "balance" in status
#    Or via MT5: Account Info

# 2. Reduce position size by adjusting risk percentage
#    In .env:
RISK_PERCENTAGE=0.5    # Instead of 1.0, risk 0.5% per trade

# 3. Check minimum position size for your broker
#    Some brokers require 0.01 lot minimum
#    If calculated size < 0.01, order fails`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ API returns 503 Service Unavailable
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> API server cannot connect to MT5.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Check if MT5 is running
#    Should see MT5 icon in system tray

# 2. Check if API server is running
#    Should see "Flask running on http://0.0.0.0:8000"

# 3. Check for errors in API logs
#    Look at bot console output for error messages

# 4. Restart API server
#    Kill the API process and start it again
#    python api.py`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ Database locked error
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Multiple processes writing to SQLite simultaneously.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Ensure only one bot process is running
ps aux | grep trading_bot

# 2. Close any tools accessing the database
#    SQLite browser, analytics tools, etc.

# 3. Delete lock file (if exists)
rm trading_bot.db-wal
rm trading_bot.db-shm

# 4. Restart bot`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ Bot stops after hitting daily loss limit
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Daily P&L fell below loss limit threshold.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Check logs for daily loss limit message
tail logs/trading_bot.log | grep "Daily loss"

# 2. Review recent trades
#    Check if losing trades had proper stop losses
#    Verify risk management settings

# 3. Increase daily loss limit (temporary fix)
#    In .env:
DAILY_LOSS_LIMIT_PERCENT=20.0    # Instead of 15%

# 4. Improve strategy (permanent fix)
#    Review trades that lost money
#    Adjust entry/exit conditions
#    Add additional filters

# 5. Restart bot (to reset daily P&L)
python trading_bot.py`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ High latency / Slow order execution
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Bot running far from broker's servers or too many checks.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Reduce check interval (if possible)
#    In .env:
CHECK_INTERVAL_SECONDS=30    # Instead of 60

# 2. Use VPS in same region as broker
#    Check broker's server locations
#    Choose VPS provider in same region

# 3. Monitor latency
#    Use ping to test connection to broker

# 4. Reduce lookback bars (fewer calculations)
#    In .env:
SLOW_MA_PERIOD=40    # Instead of 50 (fewer bars = faster)`} />
          </div>

          <div className="border-2 border-red-200 dark:border-red-800 rounded p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
              ❌ Memory leak / Process grows over time
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Cause:</strong> Long-running process accumulating memory.
            </p>
            <p className="text-sm font-semibold mb-2">Solution:</p>
            <CodeBlock language="bash" code={`# 1. Schedule daily restart (best solution)
#    In Task Scheduler:
#    Create task to restart bot at 2 AM daily

# 2. Monitor memory usage
#    Watch in Task Manager during trading

# 3. Check for unnecessary log accumulation
#    Logs rotate, but database might grow
#    Archive old trades monthly

# 4. Reduce check interval (less processing)
#    In .env:
CHECK_INTERVAL_SECONDS=120    # Instead of 60`} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Debugging with Logs</h3>
          <CodeBlock language="bash" code={`# View latest logs (Windows)
Get-Content C:\\trading-bot\\logs\\trading_bot.log -Tail 50

# Search for errors
Select-String "ERROR" C:\\trading-bot\\logs\\trading_bot.log

# Real-time log watching
Get-Content C:\\trading-bot\\logs\\trading_bot.log -Wait -Tail 20

# Query database directly
sqlite3 C:\\trading-bot\\trading_bot.db "SELECT * FROM logs WHERE level='ERROR' ORDER BY created_at DESC LIMIT 10;"`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Performance Profiling</h3>
          <CodeBlock language="python" code={`# Add to trading_bot.py to profile main loop
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# ... main loop code ...

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)  # Top 20 functions by time`} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Before Asking for Help</p>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Enable DEBUG logging and run for 5+ minutes</li>
            <li>Check if MT5 is installed and running</li>
            <li>Verify .env configuration is correct</li>
            <li>Review logs for ERROR messages</li>
            <li>Test credentials manually in MT5</li>
            <li>Include recent logs when seeking help</li>
          </ol>
        </div>
      </section>
    </DocumentationLayout>
  );
}
