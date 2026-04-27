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
    """Trading strategy settings - supports single or multiple pairs"""
    # Multi-pair support: TRADING_SYMBOLS=EURUSD,GBPUSD,USDJPY or TRADING_SYMBOL=EURUSD (backwards compat)
    _symbols_str: str = os.getenv("TRADING_SYMBOLS", "").strip()
    _single_symbol: str = os.getenv("TRADING_SYMBOL", "EURUSD").strip()

    timeframe: int = 60  # 1-minute candles

    # SMA Strategy
    fast_ma_period: int = int(os.getenv("FAST_MA_PERIOD", "20"))
    slow_ma_period: int = int(os.getenv("SLOW_MA_PERIOD", "50"))

    # RSI Filter
    rsi_period: int = int(os.getenv("RSI_PERIOD", "14"))
    rsi_overbought: int = int(os.getenv("RSI_OVERBOUGHT", "70"))
    rsi_oversold: int = int(os.getenv("RSI_OVERSOLD", "30"))

    # Risk Management (Global across all pairs)
    stop_loss_pips: int = int(os.getenv("STOP_LOSS_PIPS", "50"))
    take_profit_pips: int = int(os.getenv("TAKE_PROFIT_PIPS", "100"))
    max_daily_loss_percent: float = float(os.getenv("MAX_DAILY_LOSS_PERCENT", "2.0"))
    max_position_size: float = float(os.getenv("MAX_POSITION_SIZE", "0.1"))  # Lots
    max_trades_per_day: int = int(os.getenv("MAX_TRADES_PER_DAY", "5"))  # Global limit across all pairs

    # Trading hours (UTC)
    trading_start_hour: int = int(os.getenv("TRADING_START_HOUR", "0"))
    trading_end_hour: int = int(os.getenv("TRADING_END_HOUR", "23"))

    # Execution
    check_interval_seconds: int = int(os.getenv("CHECK_INTERVAL_SECONDS", "60"))
    trade_timeout_minutes: int = int(os.getenv("TRADE_TIMEOUT_MINUTES", "60"))

    def __post_init__(self):
        """Parse trading symbols after dataclass initialization"""
        if self._symbols_str:
            self.symbols = [s.strip().upper() for s in self._symbols_str.split(",") if s.strip()]
        else:
            self.symbols = [self._single_symbol.upper()]

        self.is_multi_pair = len(self.symbols) > 1

    @property
    def symbol(self) -> str:
        """Backwards compatibility: return first symbol"""
        return self.symbols[0] if self.symbols else self._single_symbol


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


@dataclass
class TestConfig:
    """Testing and debugging settings"""
    # TEST_MODE: Generate artificial signals for testing without waiting for real crossovers
    # Options: "off" (normal operation), "buy" (auto-buy), "sell" (auto-sell), "alternate" (buy/sell alternating)
    test_mode: str = os.getenv("TEST_MODE", "off").lower()

    # TEST_SIGNAL_INTERVAL: How many cycles before generating a test signal
    test_signal_interval: int = int(os.getenv("TEST_SIGNAL_INTERVAL", "3"))


# Load all configurations
mt5_config = MT5Config()
trading_config = TradingConfig()
logging_config = LoggingConfig()
database_config = DatabaseConfig()
monitoring_config = MonitoringConfig()
test_config = TestConfig()