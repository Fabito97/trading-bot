"""
Structured logging system for trading bot.
Logs to console, file, and database for monitoring.
"""

import json
import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler
from typing import Any, Dict, Optional

from config import logging_config


class StructuredLogger:
    """
    Structured logging with JSON output and real-time monitoring.
    Supports multiple handlers: console, file, and database.
    """

    def __init__(self, name: str = "trading_bot"):
        self.name = name
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, logging_config.log_level))

        # Create logs directory if it doesn't exist
        os.makedirs(logging_config.log_dir, exist_ok=True)

        # Console handler
        self._setup_console_handler()

        # File handler with rotation
        self._setup_file_handler()

    def _setup_console_handler(self) -> None:
        """Setup console logging"""
        console_handler = logging.StreamHandler()
        console_handler.setLevel(getattr(logging, logging_config.log_level))

        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def _setup_file_handler(self) -> None:
        """Setup file logging with rotation"""
        log_file = os.path.join(logging_config.log_dir, "bot.log")

        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=logging_config.max_log_size_mb * 1024 * 1024,
            backupCount=logging_config.backup_count,
        )
        file_handler.setLevel(getattr(logging, logging_config.log_level))

        # JSON formatter for structured logs
        class JSONFormatter(logging.Formatter):
            def format(self, record: logging.LogRecord) -> str:
                log_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "logger": record.name,
                    "message": record.getMessage(),
                }
                if record.exc_info:
                    log_data["exception"] = self.formatException(record.exc_info)
                return json.dumps(log_data)

        formatter = JSONFormatter()
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

    def log_trade(
        self,
        trade_type: str,
        symbol: str,
        volume: float,
        entry_price: float,
        stop_loss: float,
        take_profit: float,
        ticket: Optional[int] = None,
    ) -> None:
        """Log a trade execution"""
        log_data = {
            "event": "TRADE_EXECUTED",
            "type": trade_type,
            "symbol": symbol,
            "volume": volume,
            "entry_price": entry_price,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "ticket": ticket,
        }
        self.logger.info(json.dumps(log_data))

    def log_signal(
        self, signal_type: str, reason: str, indicator_values: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log a trading signal"""
        log_data = {
            "event": "SIGNAL_GENERATED",
            "signal": signal_type,
            "reason": reason,
        }
        if indicator_values:
            log_data["indicators"] = indicator_values
        self.logger.info(json.dumps(log_data))

    def log_error(self, error_type: str, message: str, context: Optional[Dict[str, Any]] = None) -> None:
        """Log an error with context"""
        log_data = {
            "event": "ERROR",
            "error_type": error_type,
            "message": message,
        }
        if context:
            log_data["context"] = context
        self.logger.error(json.dumps(log_data))

    def log_status(
        self, balance: float, equity: float, open_trades: int, daily_pnl: float
    ) -> None:
        """Log bot status snapshot"""
        log_data = {
            "event": "STATUS_CHECK",
            "balance": balance,
            "equity": equity,
            "open_trades": open_trades,
            "daily_pnl": daily_pnl,
        }
        self.logger.info(json.dumps(log_data))

    def info(self, message: str, **kwargs) -> None:
        """Log info level message"""
        if kwargs:
            message = f"{message} | {json.dumps(kwargs)}"
        self.logger.info(message)

    def warning(self, message: str, **kwargs) -> None:
        """Log warning level message"""
        if kwargs:
            message = f"{message} | {json.dumps(kwargs)}"
        self.logger.warning(message)

    def error(self, message: str, **kwargs) -> None:
        """Log error level message"""
        if kwargs:
            message = f"{message} | {json.dumps(kwargs)}"
        self.logger.error(message)

    def debug(self, message: str, **kwargs) -> None:
        """Log debug level message"""
        if kwargs:
            message = f"{message} | {json.dumps(kwargs)}"
        self.logger.debug(message)


# Global logger instance
logger = StructuredLogger()
