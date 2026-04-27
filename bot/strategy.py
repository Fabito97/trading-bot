"""
Trading strategy implementation: SMA Crossover with RSI filter.
"""

from datetime import datetime
from typing import Optional, Tuple

import numpy as np
import pandas as pd
import pandas_ta as ta

from config import trading_config, test_config
from database import db
from logger import logger
from mt5_connector import mt5_conn


class TradingStrategy:
    """
    SMA (Simple Moving Average) Crossover strategy with RSI filter.
    Supports both single and multiple trading pairs.

    Entry signals:
    - BUY: Fast MA > Slow MA AND RSI < 70 (not overbought)
    - SELL: Fast MA < Slow MA AND RSI > 30 (not oversold)
    """

    def __init__(self):
        self.fast_period = trading_config.fast_ma_period
        self.slow_period = trading_config.slow_ma_period
        self.rsi_period = trading_config.rsi_period
        self.rsi_overbought = trading_config.rsi_overbought
        self.rsi_oversold = trading_config.rsi_oversold
        self.test_mode = test_config.test_mode
        self.test_signal_interval = test_config.test_signal_interval
        self.test_cycle_count = 0

    def analyze(self, bars: np.ndarray, symbol: str = None) -> Optional[Tuple[str, dict]]:
        """
        Analyze market data and generate trading signal for a specific symbol.

        Args:
            bars: Array of OHLC bars from MT5
            symbol: Trading pair symbol (e.g., 'EURUSD'). If None, uses default symbol.

        Returns:
            Tuple of (signal_type, indicator_values) or None if no signal
        """
        try:
            # Convert MT5 bars to DataFrame
            df = self._bars_to_dataframe(bars)

            if len(df) < self.slow_period:
                logger.info(f"[DEBUG] Not enough bars to calculate indicators: {len(df)} < {self.slow_period}")
                return None

            # Calculate indicators
            df = self._calculate_indicators(df)

            # Get latest values
            latest = df.iloc[-1]
            fast_ma = latest["fast_ma"]
            slow_ma = latest["slow_ma"]
            rsi = latest["rsi"]
            close = latest["close"]
            previous = df.iloc[-2]
            prev_fast_ma = previous["fast_ma"]
            prev_slow_ma = previous["slow_ma"]

            # DEBUG: Log current indicator values
            logger.info(
                "[DEBUG] Current indicators",
                close=float(close),
                fast_ma=float(fast_ma),
                slow_ma=float(slow_ma),
                rsi=float(rsi),
                prev_fast_ma=float(prev_fast_ma),
                prev_slow_ma=float(prev_slow_ma),
            )

            # TEST MODE: Generate artificial signals for testing without waiting for real crossovers
            if self.test_mode != "off":
                self.test_cycle_count += 1
                if self.test_cycle_count >= self.test_signal_interval:
                    self.test_cycle_count = 0  # Reset counter

                    if self.test_mode == "buy":
                        signal = ("BUY", "TEST MODE: Forced BUY signal")
                        logger.warning(
                            "[TEST MODE] Generating forced BUY signal",
                            symbol=symbol or trading_config.symbol,
                        )
                    elif self.test_mode == "sell":
                        signal = ("SELL", "TEST MODE: Forced SELL signal")
                        logger.warning(
                            "[TEST MODE] Generating forced SELL signal",
                            symbol=symbol or trading_config.symbol,
                        )
                    elif self.test_mode == "alternate":
                        # Alternate between BUY and SELL
                        if self.test_cycle_count % 2 == 0:
                            signal = ("BUY", "TEST MODE: Alternating BUY signal")
                        else:
                            signal = ("SELL", "TEST MODE: Alternating SELL signal")
                        logger.warning(
                            "[TEST MODE] Generating alternating signal",
                            symbol=symbol or trading_config.symbol,
                        )
                    else:
                        signal = None
                else:
                    signal = None
            else:
                # Check for crossover signals (normal mode)
                signal = self._generate_signal(
                    fast_ma, slow_ma, prev_fast_ma, prev_slow_ma, rsi, close
                )

            if signal:
                signal_type, reason = signal
                indicator_values = {
                    "fast_ma": float(fast_ma),
                    "slow_ma": float(slow_ma),
                    "rsi": float(rsi),
                    "close": float(close),
                }

                # Store signal to database (with symbol support)
                db.add_signal(
                    symbol=symbol or trading_config.symbol,
                    signal_type=signal_type,
                    reason=reason,
                    fast_ma=float(fast_ma),
                    slow_ma=float(slow_ma),
                    rsi=float(rsi),
                    candle_close=float(close),
                )

                if self.test_mode != "off":
                    logger.warning(
                        f"[TEST MODE] Signal: {signal_type}",
                        reason=reason,
                        indicator_values=indicator_values,
                        symbol=symbol or trading_config.symbol,
                    )
                else:
                    logger.log_signal(signal_type, reason, indicator_values, symbol=symbol)

                return signal_type, indicator_values

            return None

        except Exception as e:
            logger.error("Strategy analysis error", exception=str(e))
            return None

    def _bars_to_dataframe(self, bars: np.ndarray) -> pd.DataFrame:
        """Convert MT5 bars to pandas DataFrame"""
        df = pd.DataFrame(bars)
        df.columns = ["time", "open", "high", "low", "close", "tick_volume", "spread", "real_volume"]
        df["time"] = pd.to_datetime(df["time"], unit="s")
        return df

    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators"""
        # Simple Moving Averages
        df["fast_ma"] = ta.sma(df["close"], length=self.fast_period)
        df["slow_ma"] = ta.sma(df["close"], length=self.slow_period)

        # RSI (Relative Strength Index)
        df["rsi"] = ta.rsi(df["close"], length=self.rsi_period)

        return df

    def _generate_signal(
        self, fast_ma: float, slow_ma: float, prev_fast_ma: float, prev_slow_ma: float, rsi: float, close: float
    ) -> Optional[Tuple[str, str]]:
        """
        Generate trading signal based on MA crossover and RSI filter.
        
        Returns:
            Tuple of (signal_type, reason) or None
        """
        # Check for bullish crossover (fast > slow) with RSI filter
        if (
            prev_fast_ma <= prev_slow_ma
            and fast_ma > slow_ma
            and rsi < self.rsi_overbought
        ):
            reason = (
                f"Bullish crossover: Fast MA ({fast_ma:.4f}) > Slow MA ({slow_ma:.4f}), "
                f"RSI ({rsi:.2f}) < {self.rsi_overbought}"
            )
            return "BUY", reason

        # Check for bearish crossover (fast < slow) with RSI filter
        if (
            prev_fast_ma >= prev_slow_ma
            and fast_ma < slow_ma
            and rsi > self.rsi_oversold
        ):
            reason = (
                f"Bearish crossover: Fast MA ({fast_ma:.4f}) < Slow MA ({slow_ma:.4f}), "
                f"RSI ({rsi:.2f}) > {self.rsi_oversold}"
            )
            return "SELL", reason

        return None


# Global strategy instance
strategy = TradingStrategy()
