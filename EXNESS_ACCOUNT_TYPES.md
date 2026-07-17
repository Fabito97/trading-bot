# Exness Account Types & Symbol Format

## Your Account Type: Exness Micro Account

Your Exness trial account uses **micro account symbols**, which end with an "m" suffix. This is different from standard accounts.

### Available Symbols on Your Account

Based on your bot output, your available symbols are:
- **EUR pairs**: EURAUDm, EURCADm, EURCHFm, EURCZKm, EURDKKm, ...
- **GBP pairs**: GBPAUDm, GBPCADm, GBPCHFm, GBPCZKm, GBPDKKm, ...
- **USD pairs**: USDAEDm, USDAMDm, USDAOAm, USDARSm, USDAZNm, ...
- **AUD pairs**: AUDCADm, AUDCHFm, AUDCZKm, AUDDKKm, AUDHUFm, ...
- **NZD pairs**: NZDCADm, NZDCHFm, NZDCZKm, NZDDKKm, NZDHUFm, ...

### How to Configure Your Bot

**Step 1: Find Available Symbols**
Run this command to see all symbols on YOUR account:
```bash
python list_available_symbols.py
```

**Step 2: Update .env File**
Edit your `.env` file with symbols from YOUR account:

```bash
# Single pair (start with one for testing)
TRADING_SYMBOL=EURAUDm

# Multiple pairs (after testing single pair)
TRADING_SYMBOLS=EURAUDm,GBPAUDm,AUDCADm
```

**Step 3: Start the Bot**
```bash
python trading_bot.py
```

## Account Type Comparison

| Feature | Micro Account | Standard Account |
|---------|---------------|------------------|
| **Symbol Format** | Ends with "m" (e.g., EURAUDm) | Standard (e.g., EURUSD) |
| **Min Lot Size** | 0.01 (1,000 units) | 0.1 (10,000 units) |
| **Leverage** | Up to 2000:1 | Up to 2000:1 |
| **Spreads** | Low | Low |
| **Available Pairs** | Limited set | Full set |
| **Typical Pairs** | EURAUD, GBPAUD, AUDCAD, etc. | EURUSD, GBPUSD, USDJPY, etc. |

## Recommended Starting Configuration

For your micro account with the bot:

```bash
# Conservative (safest for testing)
TRADING_SYMBOL=EURAUDm
TEST_MODE=off  # Use real signals, not test mode

# Balanced (good for learning)
TRADING_SYMBOLS=EURAUDm,GBPAUDm,AUDCADm

# Aggressive (after you understand the bot)
TRADING_SYMBOLS=EURAUDm,GBPAUDm,AUDCADm,EURCADm,GBPCADm
```

## Quick Start

1. Open PowerShell in your bot directory
2. Run: `python list_available_symbols.py`
3. Copy one or more symbols from the output
4. Edit `.env` file: `TRADING_SYMBOL=EURAUDm` (replace with your chosen symbol)
5. Save and run: `python trading_bot.py`

## Troubleshooting

**Problem**: "Symbol not found in Market Watch"
**Solution**: Run `python list_available_symbols.py` to see what's actually available on your account

**Problem**: Got different symbols than expected
**Solution**: Check if you have a standard account instead of micro account. Standard accounts use EURUSD format instead of EURAUDm format.

**Problem**: Can't find recommended pairs like EURUSD
**Solution**: Your micro account doesn't have traditional pairs. Use EURAUDm, GBPAUDm, etc. instead.
