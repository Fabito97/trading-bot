"""
Main trading bot orchestrator.
Runs the main loop: connect, analyze, execute, monitor, repeat.
"""

import signal
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from config import mt5_config, monitoring_config, trading_config
from database import db
from executor import executor
from logger import logger
from mt5_connector import mt5_conn
from strategy import strategy


class TradingBot:
    """
    Main trading bot controller.
    Handles connection, strategy analysis, trade execution, and monitoring.
    """

    def __init__(self):
        self.is_running = False
        self.last_status_log = datetime.now(timezone.utc)
        self.status_log_interval = timedelta(minutes=5)
        self.total_trades = 0
        self.total_pnl = 0.0

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info("Shutdown signal received, stopping bot...")
        self.stop()

    def start(self) -> None:
        """Start the trading bot"""
        logger.info("Starting Trading Bot")
        logger.info(
            "Configuration loaded",
            symbol=trading_config.symbol,
            fast_ma=trading_config.fast_ma_period,
            slow_ma=trading_config.slow_ma_period,
            timeframe="1 minute",
            stop_loss_pips=trading_config.stop_loss_pips,
            take_profit_pips=trading_config.take_profit_pips,
        )

        # Connect to MT5
        if not mt5_conn.connect():
            logger.error("Failed to connect to MT5, exiting")
            return

        self.is_running = True
        db.update_bot_state(
            is_running=True,
            total_trades=self.total_trades,
            total_pnl=self.total_pnl,
            daily_pnl=0.0,
        )

        logger.info("Bot started successfully")

        try:
            self._main_loop()
        except Exception as e:
            logger.error("Unexpected error in main loop", exception=str(e))
        finally:
            self.stop()

    def stop(self) -> None:
        """Stop the trading bot gracefully"""
        logger.info("Stopping Trading Bot")
        self.is_running = False

        # Disconnect from MT5
        mt5_conn.disconnect()

        # Update final state
        db.update_bot_state(
            is_running=False,
            total_trades=self.total_trades,
            total_pnl=self.total_pnl,
            daily_pnl=0.0,
        )

        logger.info("Bot stopped")

    def _main_loop(self) -> None:
        """Main trading loop"""
        logger.info("Entering main loop")
        iteration_count = 0

        while self.is_running:
            try:
                iteration_count += 1

                # Health check
                if not mt5_conn.is_ready():
                    logger.warning("MT5 connection lost, attempting reconnect")
                    if not mt5_conn.reconnect():
                        logger.error("Reconnection failed, stopping bot")
                        break

                # Get market data
                bars = mt5_conn.get_rates(
                    symbol=trading_config.symbol,
                    timeframe=trading_config.timeframe,
                    count=trading_config.slow_ma_period + 10,
                )

                if bars is None:
                    logger.warning("[DEBUG] Failed to get market data, waiting for next cycle", iteration=iteration_count)
                    time.sleep(trading_config.check_interval_seconds)
                    continue

                # DEBUG: Log bar count and latest prices
                logger.info(
                    "[DEBUG] Market data fetched",
                    iteration=iteration_count,
                    bar_count=len(bars),
                    latest_close=float(bars[-1][4]) if len(bars) > 0 else "N/A",
                    oldest_close=float(bars[0][4]) if len(bars) > 0 else "N/A",
                )

                # Analyze with strategy
                signal_result = strategy.analyze(bars)

                # DEBUG: Log analysis result
                if signal_result:
                    signal_type, indicator_values = signal_result
                    logger.info(
                        "[DEBUG] Signal generated",
                        iteration=iteration_count,
                        signal_type=signal_type,
                        fast_ma=indicator_values.get("fast_ma"),
                        slow_ma=indicator_values.get("slow_ma"),
                        rsi=indicator_values.get("rsi"),
                    )
                    executor.execute_signal(signal_type, indicator_values)
                    self.total_trades += 1
                else:
                    logger.info(
                        "[DEBUG] No signal generated",
                        iteration=iteration_count,
                    )

                # Manage open trades
                executor.manage_open_trades()

                # Log status periodically
                self._log_status_if_due()

                # Sleep before next check
                time.sleep(trading_config.check_interval_seconds)

            except KeyboardInterrupt:
                logger.info("Keyboard interrupt received")
                break
            except Exception as e:
                logger.error("Error in main loop iteration", exception=str(e), iteration=iteration_count)
                time.sleep(trading_config.check_interval_seconds)

    def _log_status_if_due(self) -> None:
        """Log bot status periodically"""
        now = datetime.now(timezone.utc)
        if now - self.last_status_log >= self.status_log_interval:
            account_info = mt5_conn.get_account_info()
            if account_info:
                daily_stats = db.get_daily_stats()
                logger.log_status(
                    balance=account_info["balance"],
                    equity=account_info["equity"],
                    open_trades=len(db.get_open_trades()),
                    daily_pnl=daily_stats.get("daily_pnl", 0),
                )

                # Update database state
                self.total_pnl = daily_stats.get("daily_pnl", 0)
                db.update_bot_state(
                    is_running=True,
                    total_trades=self.total_trades,
                    total_pnl=self.total_pnl,
                    daily_pnl=self.total_pnl,
                )

            self.last_status_log = now


def main():
    """Entry point for the trading bot"""
    bot = TradingBot()
    bot.start()


if __name__ == "__main__":
    main()
