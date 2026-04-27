'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function ConfigPage() {
  return (
    <DocumentationLayout title="Configuration" breadcrumb="Getting Started / Configuration">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
          <p className="text-muted-foreground mb-4">
            All configuration is loaded from a <code className="bg-muted px-2 py-1 rounded text-xs">.env</code> file in the bot directory.
            Copy <code className="bg-muted px-2 py-1 rounded text-xs">.env.example</code> and update with your values.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">MT5 Credentials</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">MT5_LOGIN</p>
              <p className="text-sm text-muted-foreground">Your MT5 account number (integer)</p>
              <CodeBlock language="bash" code="MT5_LOGIN=106273315" />
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">MT5_PASSWORD</p>
              <p className="text-sm text-muted-foreground">Your MT5 account password</p>
              <CodeBlock language="bash" code="MT5_PASSWORD=YourPassword123" />
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">MT5_SERVER</p>
              <p className="text-sm text-muted-foreground">Broker's server name (from MT5 login wizard)</p>
              <CodeBlock language="bash" code="MT5_SERVER=MetaQuotes-Demo" />
              <p className="text-xs text-muted-foreground mt-2">Examples: ExnessMarketsPro-Real, ICMarketsSC-Demo, PepperstoneECN</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Trading Parameters</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">TRADING_SYMBOL</p>
              <p className="text-sm text-muted-foreground">Currency pair or asset to trade</p>
              <CodeBlock language="bash" code="TRADING_SYMBOL=EURUSD" />
              <p className="text-xs text-muted-foreground mt-2">Default: EURUSD. Must exist on your broker.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">TRADING_TIMEFRAME</p>
              <p className="text-sm text-muted-foreground">Candle timeframe for analysis</p>
              <CodeBlock language="bash" code="TRADING_TIMEFRAME=TIMEFRAME_M1" />
              <p className="text-xs text-muted-foreground mt-2">
                Valid values: TIMEFRAME_M1 (1 min), TIMEFRAME_M5, TIMEFRAME_M15, TIMEFRAME_M30, TIMEFRAME_H1, TIMEFRAME_H4, TIMEFRAME_D1
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">FAST_MA_PERIOD</p>
              <p className="text-sm text-muted-foreground">Fast moving average period</p>
              <CodeBlock language="bash" code="FAST_MA_PERIOD=20" />
              <p className="text-xs text-muted-foreground mt-2">Default: 20. Lower = faster response, more false signals</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">SLOW_MA_PERIOD</p>
              <p className="text-sm text-muted-foreground">Slow moving average period</p>
              <CodeBlock language="bash" code="SLOW_MA_PERIOD=50" />
              <p className="text-xs text-muted-foreground mt-2">Default: 50. Higher = slower response, fewer false signals</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Risk Management</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">STOP_LOSS_PIPS</p>
              <p className="text-sm text-muted-foreground">Stop loss distance in pips</p>
              <CodeBlock language="bash" code="STOP_LOSS_PIPS=50" />
              <p className="text-xs text-muted-foreground mt-2">
                Default: 50. Used to calculate position size: position_size = (balance × 1%) / stop_loss_pips
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">TAKE_PROFIT_PIPS</p>
              <p className="text-sm text-muted-foreground">Take profit distance in pips</p>
              <CodeBlock language="bash" code="TAKE_PROFIT_PIPS=100" />
              <p className="text-xs text-muted-foreground mt-2">Default: 100. Risk:Reward ratio = TP / SL</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">RISK_PERCENTAGE</p>
              <p className="text-sm text-muted-foreground">Risk per trade as % of balance</p>
              <CodeBlock language="bash" code="RISK_PERCENTAGE=1.0" />
              <p className="text-xs text-muted-foreground mt-2">Default: 1.0%. Never risk more than 2% per trade.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">DAILY_LOSS_LIMIT_PERCENT</p>
              <p className="text-sm text-muted-foreground">Daily loss limit before stopping</p>
              <CodeBlock language="bash" code="DAILY_LOSS_LIMIT_PERCENT=15.0" />
              <p className="text-xs text-muted-foreground mt-2">
                Default: 15%. If daily P&L drops below -15% of starting balance, bot stops trading.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">MAX_TRADES_PER_HOUR</p>
              <p className="text-sm text-muted-foreground">Maximum trades allowed per hour</p>
              <CodeBlock language="bash" code="MAX_TRADES_PER_HOUR=5" />
              <p className="text-xs text-muted-foreground mt-2">Default: 5. Prevents over-trading in volatile markets.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Bot Behavior</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">CHECK_INTERVAL_SECONDS</p>
              <p className="text-sm text-muted-foreground">Seconds between market checks</p>
              <CodeBlock language="bash" code="CHECK_INTERVAL_SECONDS=60" />
              <p className="text-xs text-muted-foreground mt-2">Default: 60. Lower = higher latency but more responsive.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">ENABLE_API</p>
              <p className="text-sm text-muted-foreground">Enable Flask API server</p>
              <CodeBlock language="bash" code="ENABLE_API=true" />
              <p className="text-xs text-muted-foreground mt-2">Default: true. Set to false to disable web dashboard.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">API_HOST</p>
              <p className="text-sm text-muted-foreground">API server bind address</p>
              <CodeBlock language="bash" code="API_HOST=0.0.0.0" />
              <p className="text-xs text-muted-foreground mt-2">Default: 0.0.0.0 (accessible from all IPs). Use 127.0.0.1 for localhost only.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">API_PORT</p>
              <p className="text-sm text-muted-foreground">API server port</p>
              <CodeBlock language="bash" code="API_PORT=8000" />
              <p className="text-xs text-muted-foreground mt-2">Default: 8000. Access API at http://localhost:8000</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">LOG_LEVEL</p>
              <p className="text-sm text-muted-foreground">Logging verbosity</p>
              <CodeBlock language="bash" code="LOG_LEVEL=INFO" />
              <p className="text-xs text-muted-foreground mt-2">Valid: DEBUG (verbose), INFO (normal), WARNING, ERROR</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Example .env File</h3>
          <CodeBlock 
            language="bash"
            code={`# MT5 Credentials
MT5_LOGIN=106273315
MT5_PASSWORD=YourPassword123
MT5_SERVER=MetaQuotes-Demo

# Trading Parameters
TRADING_SYMBOL=EURUSD
TRADING_TIMEFRAME=TIMEFRAME_M1
FAST_MA_PERIOD=20
SLOW_MA_PERIOD=50

# Risk Management
STOP_LOSS_PIPS=50
TAKE_PROFIT_PIPS=100
RISK_PERCENTAGE=1.0
DAILY_LOSS_LIMIT_PERCENT=15.0
MAX_TRADES_PER_HOUR=5

# Bot Behavior
CHECK_INTERVAL_SECONDS=60
ENABLE_API=true
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO`}
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">⚠️ Security Warning</p>
          <p className="text-sm">
            Never commit your <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded text-xs">.env</code> file to Git.
            It contains sensitive credentials. Use <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded text-xs">.env.example</code> as a template instead.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
