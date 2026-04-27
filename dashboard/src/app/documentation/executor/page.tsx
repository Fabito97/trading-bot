'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function ExecutorPage() {
  return (
    <DocumentationLayout title="Order Executor" breadcrumb="Core Modules / Order Executor">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The Executor module validates trading signals, calculates position sizes based on risk, 
            and executes orders on MT5. It enforces all risk management rules and prevents over-trading.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>File:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">bot/executor.py</code>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Class: OrderExecutor</h3>
          <p className="text-muted-foreground mb-4">Handles all order placement and trade management.</p>
          
          <div className="bg-muted/30 border border-border rounded p-4 mb-4">
            <p className="font-mono font-semibold text-sm mb-3">__init__(connector, config)</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">Parameters:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><code className="bg-background px-1 rounded text-xs">connector</code>: MT5Connector instance</li>
                  <li><code className="bg-background px-1 rounded text-xs">config</code>: TradingConfig instance</li>
                </ul>
              </div>
              <p className="font-semibold mt-3">Initializes tracking for:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Open trades and their entry prices</li>
                <li>Daily loss tracking</li>
                <li>Trade count per hour for frequency limits</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Core Methods</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">execute_signal(signal_type, indicator_values)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Entry point for executing a trade signal. Validates all conditions before placing order.
              </p>
              <div className="bg-background border border-border rounded p-3 mt-2 text-sm space-y-2">
                <div>
                  <p className="font-semibold">Process:</p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-2">
                    <li>Check if daily loss limit exceeded</li>
                    <li>Check if max trades per hour reached</li>
                    <li>Fetch current prices and account info</li>
                    <li>Calculate position size</li>
                    <li>Validate position size (minimum {">"}0)</li>
                    <li>Place order via MT5</li>
                    <li>Store trade in database</li>
                  </ol>
                </div>
              </div>
              <CodeBlock language="python" code={`# Called from main loop when strategy generates signal
executor.execute_signal(
    signal_type='BUY',  # or 'SELL'
    indicator_values={
        'fast_ma': 1.0850,
        'slow_ma': 1.0820,
        'rsi': 68.5,
        'close': 1.0852
    }
)`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_calculate_position_size(stop_loss_pips) → float</p>
              <p className="text-sm text-muted-foreground mt-2">
                Calculates lot size based on account balance and risk percentage.
              </p>
              <div className="bg-background border border-border rounded p-3 mt-2 text-sm">
                <p className="font-semibold mb-2">Formula:</p>
                <code className="block bg-muted px-2 py-1 rounded text-xs">
                  position_size = (balance × risk%) / (stop_loss_pips × pip_value)
                </code>
                <p className="text-muted-foreground mt-2">
                  <strong>Example:</strong> Balance=$100k, Risk=1%, SL=50 pips
                </p>
                <p className="text-muted-foreground">
                  position_size = (100000 × 0.01) / (50 × 0.0001) = 0.2 lots (20k units)
                </p>
              </div>
              <CodeBlock language="python" code={`# Internal calculation
def _calculate_position_size(self, stop_loss_pips):
    account_info = self.connector.get_account_info()
    balance = account_info['balance']
    
    # Risk amount
    risk_amount = balance * (self.config.risk_percentage / 100)
    
    # Pip value for forex (typically 10 for standard lot)
    pip_value = 0.0001 * 100000
    
    # Position size = risk amount / (SL pips × pip value per pip)
    position_size = risk_amount / (stop_loss_pips * pip_value)
    
    return position_size`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">manage_open_trades()</p>
              <p className="text-sm text-muted-foreground mt-2">
                Monitors all open trades and closes them if SL/TP hit. Updates daily P&L.
              </p>
              <CodeBlock language="python" code={`# Called every cycle from main loop
executor.manage_open_trades()

# Internally:
# 1. Fetch all open positions from MT5
# 2. For each position:
#    a. Check if price hit stop loss
#    b. Check if price hit take profit
#    c. Close trade if either hit
#    d. Log the result
# 3. Update daily_pnl
# 4. Check if daily_pnl < daily_loss_limit`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_check_daily_loss_limit() → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Checks if daily loss exceeds threshold. Stops trading if exceeded.
              </p>
              <CodeBlock language="python" code={`# Daily loss limit = 15% by default
# Configured via DAILY_LOSS_LIMIT_PERCENT env var

current_balance = account_info['balance']
starting_balance = db.get_starting_balance()
daily_pnl = current_balance - starting_balance

threshold = starting_balance * 0.15  # 15%

if abs(daily_pnl) > threshold and daily_pnl < 0:
    logger.error("Daily loss limit exceeded, stopping bot")
    return False

return True`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_check_trade_frequency() → bool</p>
              <p className="text-sm text-muted-foreground mt-2">
                Prevents over-trading by limiting trades per hour.
              </p>
              <CodeBlock language="python" code={`# Max trades per hour = 5 by default
# Configured via MAX_TRADES_PER_HOUR env var

trades_in_last_hour = db.get_trades_in_timeframe(
    start_time=now - 1 hour,
    end_time=now
)

if len(trades_in_last_hour) >= max_trades_per_hour:
    logger.warning("Max trades per hour reached, skipping signal")
    return False

return True`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-mono font-semibold text-sm">_place_order(order_type, volume, sl_pips, tp_pips) → int | None</p>
              <p className="text-sm text-muted-foreground mt-2">
                Actually places the order on MT5. Internal method called by execute_signal().
              </p>
              <CodeBlock language="python" code={`# Gets current market prices
symbol_info = self.connector.get_symbol_info(self.config.symbol)
ask = symbol_info['ask']
bid = symbol_info['bid']

# For BUY: use ask, SL below entry, TP above entry
# For SELL: use bid, SL above entry, TP below entry

if order_type == 'BUY':
    entry_price = ask
    sl_price = entry_price - (sl_pips * 0.0001)
    tp_price = entry_price + (tp_pips * 0.0001)
else:  # SELL
    entry_price = bid
    sl_price = entry_price + (sl_pips * 0.0001)
    tp_price = entry_price - (tp_pips * 0.0001)

ticket = self.connector.place_order(
    symbol=self.config.symbol,
    order_type=order_type,
    volume=volume,
    price=entry_price,
    sl=sl_price,
    tp=tp_price,
    comment="Bot trade"
)

return ticket`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Risk Management Rules</h3>
          <div className="space-y-3">
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">✓ Position Sizing</p>
              <p className="text-sm text-muted-foreground">
                1% of balance risked per trade. Position size adjusts automatically with balance.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">✓ Daily Loss Limit</p>
              <p className="text-sm text-muted-foreground">
                Bot stops trading if daily loss exceeds 15% (configurable). Prevents catastrophic losses.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">✓ Trade Frequency Cap</p>
              <p className="text-sm text-muted-foreground">
                Maximum 5 trades per hour. Prevents over-trading in volatile conditions.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">✓ Mandatory SL/TP</p>
              <p className="text-sm text-muted-foreground">
                Every order includes stop loss and take profit. No trade can execute without them.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Trade Lifecycle</h3>
          <CodeBlock language="text" code={`Signal Generated (BUY/SELL)
    ↓
Check Daily Loss Limit ✓
    ↓
Check Trade Frequency ✓
    ↓
Calculate Position Size
    ↓
Get Current Prices
    ↓
Calculate SL/TP Prices
    ↓
Place Order on MT5
    ↓
Store Trade in Database
    ↓
Log Trade Details

[Trade Open - In Management Phase]
    ↓
Every Cycle:
  - Fetch open positions
  - Check if SL/TP hit
  - Close if necessary
  - Update P&L
    ↓
[Trade Closed]
    ↓
Store Trade Result in Database`} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Pip Value Calculation</p>
          <p className="text-sm">
            For forex pairs like EURUSD with 4 decimals (0.0001 = 1 pip):
          </p>
          <p className="text-sm mt-2">
            <code className="bg-background px-2 py-1 rounded text-xs">pip_value = 0.0001 × lot_size × 10000</code>
          </p>
          <p className="text-sm mt-2">
            A 0.1 lot with 50 pip SL = 0.0001 × 0.1 × 10000 × 50 = $50 risk
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
