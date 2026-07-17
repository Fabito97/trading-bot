#!/usr/bin/env python3
"""
Helper script to list all available symbols on your Exness MT5 account.
Run this to see what symbols are available for trading.

Usage:
    python list_available_symbols.py
    python list_available_symbols.py EUR  # Show only EUR pairs
"""

import sys
import MetaTrader5 as mt5
from config import mt5_config


def main():
    print("Connecting to MT5...")

    if not mt5.initialize():
        print(f"MT5 initialization failed: {mt5.last_error()}")
        return

    print(f"Connected to: {mt5_config.server}")

    # Get all symbols
    symbols = mt5.symbols_get()
    if not symbols:
        print("No symbols found. Make sure symbols are added to Market Watch in MT5!")
        print("\nTo add symbols:")
        print("1. Open MT5 terminal")
        print("2. View → Market Watch")
        print("3. Right-click → Symbols")
        print("4. Search and check symbols")
        mt5.shutdown()
        return

    # Filter by prefix if provided
    prefix = sys.argv[1].upper() if len(sys.argv) > 1 else ""

    available = []
    for s in symbols:
        if s.visible:
            if not prefix or s.name.startswith(prefix):
                available.append(s.name)

    available = sorted(available)

    print(f"\nAvailable symbols ({len(available)} total):")
    print("-" * 50)

    for i, symbol in enumerate(available):
        if (i + 1) % 5 == 0:
            print(f"{symbol}")
        else:
            print(f"{symbol:<15}", end=" ")

    if len(available) % 5 != 0:
        print()

    print("-" * 50)
    print(f"\nNOTE: This Exness account uses micro symbols (ending in 'm')")
    print(f"Example recommended pairs for .env:")

    # Find example pairs
    eur_pairs = [s for s in available if s.startswith("EUR")]
    gbp_pairs = [s for s in available if s.startswith("GBP")]
    aud_pairs = [s for s in available if s.startswith("AUD")]

    if eur_pairs and gbp_pairs and aud_pairs:
        print(f"TRADING_SYMBOLS={eur_pairs[0]},{gbp_pairs[0]},{aud_pairs[0]}")
        print(f"\nOr single pair:")
        print(f"TRADING_SYMBOL={eur_pairs[0]}")

    mt5.shutdown()


if __name__ == "__main__":
    main()
