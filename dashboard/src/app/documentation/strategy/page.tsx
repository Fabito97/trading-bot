'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function StrategyPage() {
  return (
    <DocumentationLayout title="Strategy Engine" breadcrumb="Core Modules / Strategy Engine">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The Strategy module analyzes market data using technical indicators (SMA, RSI) and generates 
            buy/sell signals when specific conditions are met. It is stateless - each analysis is independent.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">bot/strategy.py</code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Class: SMACrossoverStrategy</h3>
          <p className="text-muted-foreground mb-4">Implements Simple Moving Average Crossover strategy with RSI filter.</p>
          
          <div className="bg-muted/30 border border-border rounded p-4 mb-4">
            <p className="font-mono font-semibold text-sm mb-3">__init__(fast_period, slow_period)</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">Parameters:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><code className="bg-background px-1 rounded text-xs">fast_period</code> (int): Fast MA period (default 20)</li>
                  <li><code className="bg-background px-1 rounded text-xs">slow_period</code> (int): Slow MA period (default 50)</li>
                </ul>
              </div>
              <CodeBlock language="python" code={`from strategy import SMACrossoverStrategy

strategy = SMACrossoverStrategy(fast_period=20, slow_period=50)
signal = strategy.analyze(bars)`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Signal Generation Logic</h3>
          <p className="text-muted-foreground mb-4">The strategy follows this decision tree:</p>
          
          <div className="bg-muted/30 border border-border rounded p-6 mb-4">
            <pre className="text-sm font-mono overflow-x-auto">
{`IF fast_ma_previous < slow_ma_previous
   AND fast_ma_current > slow_ma_current
   AND rsi < 70:
    SIGNAL = BUY

ELIF fast_ma_previous > slow_ma_previous
   AND fast_ma_current < slow_ma_current
   AND rsi > 30:
    SIGNAL = SELL

ELSE:
    SIGNAL = NONE`}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">BUY Signal</p>
              <p className="text-sm text-muted-foreground">
                Fast MA crosses above Slow MA (bullish crossover) AND RSI {"<"} 70 (not overbought).
                Indicates potential uptrend start with healthy momentum.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">SELL Signal</p>
              <p className="text-sm text-muted-foreground">
                Fast MA crosses below Slow MA (bearish crossover) AND RSI {">"} 30 (not oversold).
                Indicates potential downtrend start with declining momentum.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">NO Signal</p>
              <p className="text-sm text-muted-foreground">
                No crossover or RSI conditions not met. No trade generated this cycle.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Technical Indicators</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">Simple Moving Average (SMA)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Average of closing prices over N periods. Smooths price action.
              </p>
              <CodeBlock language="python" code={`# Fast SMA (20-period)
fast_ma = df['close'].rolling(window=20).mean()

# Slow SMA (50-period)
slow_ma = df['close'].rolling(window=50).mean()

# When fast_ma > slow_ma: uptrend
# When fast_ma < slow_ma: downtrend`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">Relative Strength Index (RSI)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Momentum oscillator measuring overbought/oversold conditions. Range 0-100.
              </p>
              <CodeBlock language="python" code={`# RSI calculation (simplified)
# RSI = 100 - (100 / (1 + (avg_gain / avg_loss)))
# RSI < 30: Oversold (potential upside)
# RSI > 70: Overbought (potential downside)
# RSI 30-70: Neutral

# In code, we filter signals:
if rsi > 70:  # Overbought
    ignore_signal()  # Don't buy
if rsi < 30:  # Oversold
    ignore_signal()  # Don't sell`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Core Methods</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">analyze(bars) → tuple | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Analyzes market data and returns signal if conditions met.
              </p>
              <div className="bg-background border border-border rounded p-3 mt-2 text-sm">
                <p className="font-semibold mb-2">Parameters:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><code className="bg-muted px-1 rounded text-xs">bars</code> (np.ndarray): OHLCV data from get_rates()</li>
                </ul>
                <p className="font-semibold mt-3 mb-2">Returns:</p>
                <p className="text-muted-foreground">
                  <code className="bg-muted px-1 rounded text-xs">(signal_type, indicator_values)</code> tuple or None
                </p>
              </div>
              <CodeBlock language="python" code={`result = strategy.analyze(bars)
if result:
    signal_type, indicators = result
    print(f"Signal: {signal_type}")  # 'BUY' or 'SELL'
    print(f"Fast MA: {indicators['fast_ma']}")
    print(f"Slow MA: {indicators['slow_ma']}")
    print(f"RSI: {indicators['rsi']}")
    print(f"Close: {indicators['close']}")`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_bars_to_dataframe(bars) → pd.DataFrame</p>
              <p className="text-sm text-muted-foreground mt-2">
                Converts MT5 NumPy bars to pandas DataFrame for easier manipulation.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Internal method:</strong> Called automatically by analyze(). Creates columns: 
                [time, open, high, low, close, volume]
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_calculate_indicators(df) → pd.DataFrame</p>
              <p className="text-sm text-muted-foreground mt-2">
                Calculates all technical indicators and adds them as new columns.
              </p>
              <CodeBlock language="python" code={`# Adds these columns to dataframe:
df['fast_ma']   # 20-period SMA
df['slow_ma']   # 50-period SMA
df['rsi']       # 14-period RSI (standard)`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_generate_signal(fast_ma, slow_ma, ..., rsi, close) → tuple | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Checks if conditions are met and returns signal type with reason.
              </p>
              <CodeBlock language="python" code={`# Internal logic
signal = None

# BUY: Fast MA crosses above Slow MA + RSI not overbought
if prev_fast < prev_slow and curr_fast > curr_slow and rsi < 70:
    signal = ('BUY', 'SMA crossover + RSI filter')

# SELL: Fast MA crosses below Slow MA + RSI not oversold
elif prev_fast > prev_slow and curr_fast < curr_slow and rsi > 30:
    signal = ('SELL', 'SMA crossover + RSI filter')

return signal`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Example Workflow</h3>
          <CodeBlock language="python" code={`import MetaTrader5 as mt5
from strategy import SMACrossoverStrategy
from mt5_connector import MT5Connector

# Setup
connector = MT5Connector(login=123456, password="pwd", server="Server")
connector.connect()
strategy = SMACrossoverStrategy(fast_period=20, slow_period=50)

# Fetch data
bars = connector.get_rates("EURUSD", mt5.TIMEFRAME_M1, count=100)

# Analyze
result = strategy.analyze(bars)

# Handle signal
if result:
    signal_type, indicators = result
    if signal_type == 'BUY':
        # Execute buy order
        print(f"Buy signal generated at {indicators['close']}")
    elif signal_type == 'SELL':
        # Execute sell order
        print(f"Sell signal generated at {indicators['close']}")`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Customization</h3>
          <p className="text-muted-foreground mb-4">
            The strategy is designed to be customizable. To change indicators or signals:
          </p>
          <CodeBlock language="python" code={`# In strategy.py, modify _generate_signal():

def _generate_signal(self, fast_ma, slow_ma, prev_fast_ma, prev_slow_ma, rsi, close):
    # Example: Add MACD filter
    # Example: Change RSI thresholds (70, 30)
    # Example: Require RSI momentum confirmation
    
    # Current logic:
    if (prev_fast_ma < prev_slow_ma and 
        fast_ma > slow_ma and 
        rsi < 70):  # Change this threshold
        return ('BUY', 'Signal reason')`} />
          <p className="text-xs text-muted-foreground mt-4">
            Changes require restarting the bot for new config to take effect.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Stateless Design</p>
          <p className="text-sm">
            Each analyze() call is independent - the strategy doesn't maintain state between calls. 
            This makes it safe to call from multiple threads and simplifies testing. All historical 
            context comes from the bars parameter.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
