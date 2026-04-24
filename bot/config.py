"""
Configuration management for MT5 trading bot.
Load settings from environment variables or config file.
"""

import os
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


@dataclass
class MT5Config:
    """MetaTrader5 connection settings"""
    login: int = int(os.getenv("MT5_LOGIN", "0"))
    password: str = os.getenv("MT5_PASSWORD", "")
    server: str = os.getenv("MT5_SERVER", "ICMarketsSC-Demo")
    path: Optional[str] = os.getenv("MT5_PATH")  # Optional: full path to MT5


@dataclass
class TradingConfig:
    """Trading strategy settings"""
    symbol: str = os.getenv("TRADING_SYMBOL", "EURUSD")
    timeframe: int = 60  # 1-minute candles
    
    # SMA Strategy
    fast_ma_period: int = int(os.getenv("FAST_MA_PERIOD", "20"))
    slow_ma_period: int = int(os.getenv("SLOW_MA_PERIOD", "50"))
    
    # RSI Filter
    rsi_period: int = int(os.getenv("RSI_PERIOD", "14"))
    rsi_overbought: int = int(os.getenv("RSI_OVERBOUGHT", "70"))
    rsi_oversold: int = int(os.getenv("RSI_OVERSOLD", "30"))
    
    # Risk Management
    stop_loss_pips: int = int(os.getenv("STOP_LOSS_PIPS", "50"))
    take_profit_pips: int = int(os.getenv("TAKE_PROFIT_PIPS", "100"))
    max_daily_loss_percent: float = float(os.getenv("MAX_DAILY_LOSS_PERCENT", "2.0"))
    max_position_size: float = float(os.getenv("MAX_POSITION_SIZE", "0.1"))  # Lots
    
    # Trading hours (UTC)
    trading_start_hour: int = int(os.getenv("TRADING_START_HOUR", "0"))
    trading_end_hour: int = int(os.getenv("TRADING_END_HOUR", "23"))
    
    # Execution
    check_interval_seconds: int = int(os.getenv("CHECK_INTERVAL_SECONDS", "60"))
    max_trades_per_day: int = int(os.getenv("MAX_TRADES_PER_DAY", "5"))
    trade_timeout_minutes: int = int(os.getenv("TRADE_TIMEOUT_MINUTES", "60"))


@dataclass
class LoggingConfig:
    """Logging settings"""
    log_dir: str = os.getenv("LOG_DIR", "./logs")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    max_log_size_mb: int = int(os.getenv("MAX_LOG_SIZE_MB", "10"))
    backup_count: int = int(os.getenv("BACKUP_COUNT", "5"))


@dataclass
class DatabaseConfig:
    """Database settings"""
    db_path: str = os.getenv("DB_PATH", "./trading_bot.db")


@dataclass
class MonitoringConfig:
    """Monitoring and health check settings"""
    health_check_interval_seconds: int = int(os.getenv("HEALTH_CHECK_INTERVAL", "300"))
    enable_api: bool = os.getenv("ENABLE_API", "true").lower() == "true"
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_host: str = os.getenv("API_HOST", "0.0.0.0")


# Load all configurations
mt5_config = MT5Config()
trading_config = TradingConfig()
logging_config = LoggingConfig()
database_config = DatabaseConfig()
monitoring_config = MonitoringConfig()
