# MT5 Trading Bot - Exness Configuration Guide

## Overview

This bot is now fully optimized for **Exness** broker. Exness provides excellent conditions for algorithmic trading with tight spreads, high leverage, and reliable API connectivity.

## Quick Start - Exness Setup

### 1. Create Exness Account

- Visit [Exness.com](https://www.exness.com)
- Create a trading account (Demo or Live)
- Exness offers:
  - **Demo Account**: 100,000 USD starting balance, 1:2000 leverage (testing only)
  - **Live Account**: Real money trading, variable leverage based on account type

### 2. Download MetaTrader 5

- Go to your Exness account dashboard
- Download MetaTrader 5 terminal
- Alternative: Download from [MetaTrader official site](https://www.metatrader5.com/)

### 3. Connect to Exness Server

When you launch MT5:

1. In the top-left dropdown, select **"Exness-Demo"** or **"Exness-Real"**
2. Enter your Exness login credentials
3. MT5 will auto-detect the correct server

### 4. Configure Bot

Edit `.env` file:

```bash
# Exness Connection
MT5_LOGIN=your_exness_login_number
MT5_PASSWORD=your_exness_password
MT5_SERVER=ExnessMarketsPro-Demo

# Trading Configuration (Exness optimized)
TRADING_SYMBOLS=EURUSD,GBPUSD,USDJPY
FAST_MA_PERIOD=12
SLOW_MA_PERIOD=26
STOP_LOSS_PIPS=30
TAKE_PROFIT_PIPS=60
MAX_POSITION_SIZE=0.5
```

### 5. Enable AutoTrading

- Open MT5 terminal
- Click the "AutoTrading" button in top toolbar (robot icon)
- Should turn green/active
- If not visible: Tools → Options → Expert Advisors → Check "Allow automated trading"

### 6. Run Bot

```bash
python trading_bot.py
```

Bot will:
1. Connect to Exness via MT5
2. Validate all configured symbols
3. Start analyzing and trading

---

## Exness-Specific Features

### Supported Symbols

Exness provides excellent liquidity for major forex pairs:

**Major Pairs (Recommended)**
- EURUSD - Euro/USD
- GBPUSD - British Pound/USD
- USDJPY - USD/Japanese Yen
- AUDUSD - Australian Dollar/USD
- NZDUSD - New Zealand Dollar/USD

**Minor Pairs**
- EURJPY, EURGBP, GBPJPY, AUDJPY, CADJPY

**Exotic Pairs**
- USDZAR, USDTRY, USDHKD, USDSGD

**Commodities**
- XAUUSD (Gold/USD)
- XAGUSD (Silver/USD)
- BRENT, WTI (Oils)

Check your Exness account for the full available symbol list.

### Lot Sizes

Exness supports micro lot trading perfect for small accounts:

- **Micro Lot (0.01)**: 1,000 units
- **Mini Lot (0.1)**: 10,000 units
- **Standard Lot (1.0)**: 100,000 units

Default position sizing uses 1% risk rule with Exness micro lots:
```
Risk per trade = 1% of account balance
Position size = Risk amount / (Stop Loss Pips * $10)
Minimum = 0.01 lots (1,000 units)
Maximum = 0.5 lots (50,000 units) by default
```

### Leverage

Exness provides:
- **Demo Accounts**: Up to 1:2000 leverage
- **Live Accounts**: Variable leverage (1:100 to 1:400 depending on account type and regulations)

Bot automatically detects your account leverage and adapts.

### Spreads

Exness spreads (typical):
- EURUSD: 0.2-0.4 pips (very tight)
- GBPUSD: 0.4-0.8 pips
- USDJPY: 0.3-0.8 pips

Tight spreads are ideal for scalping and frequent trading strategies.

---

## Best Configuration for Exness

### Conservative (Safe for Learning)

```bash
TRADING_SYMBOLS=EURUSD
FAST_MA_PERIOD=12
SLOW_MA_PERIOD=26
STOP_LOSS_PIPS=40
TAKE_PROFIT_PIPS=80
MAX_POSITION_SIZE=0.1
MAX_DAILY_LOSS_PERCENT=2.0
MAX_TRADES_PER_DAY=5
```

### Moderate (Balanced)

```bash
TRADING_SYMBOLS=EURUSD,GBPUSD,USDJPY
FAST_MA_PERIOD=12
SLOW_MA_PERIOD=26
STOP_LOSS_PIPS=30
TAKE_PROFIT_PIPS=60
MAX_POSITION_SIZE=0.3
MAX_DAILY_LOSS_PERCENT=3.0
MAX_TRADES_PER_DAY=10
```

### Aggressive (Multi-Pair Scalping)

```bash
TRADING_SYMBOLS=EURUSD,GBPUSD,USDJPY,AUDUSD,NZDUSD
FAST_MA_PERIOD=9
SLOW_MA_PERIOD=21
STOP_LOSS_PIPS=20
TAKE_PROFIT_PIPS=40
MAX_POSITION_SIZE=0.5
MAX_DAILY_LOSS_PERCENT=5.0
MAX_TRADES_PER_DAY=20
```

---

## Testing on Exness Demo

### Recommended Testing Sequence

1. **Week 1: Single Pair Conservative**
   - EURUSD only
   - 0.1 lot maximum
   - 40 pip SL / 80 pip TP
   - Monitor for proper signal generation

2. **Week 2: Multi-Pair Testing**
   - Add GBPUSD and USDJPY
   - 0.1 lot per pair
   - Same SL/TP from Week 1
   - Check if multi-pair logic works correctly

3. **Week 3: Increase Position Size**
   - Keep 3 pairs (EURUSD, GBPUSD, USDJPY)
   - Increase to 0.2 lot per pair
   - Test under different market conditions

4. **Week 4: Optimize Strategy**
   - Adjust MA periods based on profitability
   - Test different SL/TP ratios
   - Run backtests on historical data

### Monitor These Metrics

- Win Rate: Target > 50% for profitable strategy
- Profit Factor: Gross Profit / Gross Loss (target > 1.5)
- Max Drawdown: Should not exceed 20% of account balance
- Daily Consistency: Avoid days with -5% loss or more

---

## Troubleshooting Exness Connection

### Error: "Symbol not found"

**Solution**: Symbol not enabled on your Exness account
- Check MT5 Market Watch window for available symbols
- Make sure you're connected to correct Exness server
- Right-click in Market Watch → "Show/Hide" to enable symbols

### Error: "Invalid stops"

**Solution**: Stop loss/take profit too close to entry price
- Bot automatically adds safety buffer
- Exness minimum: typically 2-3 pips minimum distance
- If still failing, increase STOP_LOSS_PIPS to 40+

### Error: "AutoTrading disabled"

**Solution**: Enable automated trading in MT5
- Click robot icon in top toolbar
- Or: Tools → Options → Expert Advisors → Check "Allow automated trading"
- Save and restart MT5

### Error: "Connection lost"

**Solution**: Network or MT5 terminal issue
- Make sure MT5 terminal is running
- Check internet connection
- Restart both MT5 and bot
- Bot auto-reconnects up to 5 times

---

## Moving to Live Trading

### Prerequisites

- Run minimum 2-4 weeks of profitable demo trading
- Win rate above 50%
- Daily drawdown never exceeds 2%
- Comfortable with strategy logic and behavior

### Steps

1. **Create Live Account on Exness**
   - Verify identity (KYC requirements)
   - Fund account
   - Choose leverage level (start with conservative 1:100 or 1:200)

2. **Update Configuration**
   ```bash
   MT5_SERVER=ExnessMarketsPro-Real
   MT5_LOGIN=your_live_login
   MT5_PASSWORD=your_live_password
   
   # Reduce position size for live
   MAX_POSITION_SIZE=0.1
   MAX_DAILY_LOSS_PERCENT=2.0
   ```

3. **Start Small**
   - Trade with 0.01 lot minimum
   - Test for 1 week
   - Gradually increase position size

4. **Monitor Closely**
   - Check logs daily
   - Review trades at end of day
   - Stop if behavior differs from demo

---

## Exness Features Used by Bot

- ✓ AutoTrading (automated order placement)
- ✓ Market orders with SL/TP
- ✓ Account leverage information
- ✓ Symbol information retrieval
- ✓ Real-time price quotes
- ✓ Minute-based candle data
- ✓ Micro lot support (0.01 minimum)

All features are fully tested and compatible with Exness servers.
