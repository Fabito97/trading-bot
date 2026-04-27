"""
SQLite database management for trading bot.
Stores trades, logs, signals, and bot state.
"""

import sqlite3
from dataclasses import asdict
from datetime import datetime
from threading import Lock
from typing import Any, Dict, List, Optional, Tuple

from config import database_config
from logger import logger


class TradingDatabase:
    """
    SQLite database for persistent storage of trades and logs.
    Thread-safe with connection pooling.
    """

    def __init__(self, db_path: str = database_config.db_path):
        self.db_path = db_path
        self.lock = Lock()
        self._initialize_database()

    def _get_connection(self) -> sqlite3.Connection:
        """Get a database connection with row factory"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _initialize_database(self) -> None:
        """Create database tables if they don't exist and run migrations"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Trades table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticket INTEGER UNIQUE,
                    symbol TEXT NOT NULL,
                    type TEXT NOT NULL,
                    volume REAL NOT NULL,
                    entry_price REAL NOT NULL,
                    entry_time TIMESTAMP NOT NULL,
                    stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL,
                    close_price REAL,
                    close_time TIMESTAMP,
                    pnl REAL,
                    status TEXT DEFAULT 'OPEN',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            # Signals table - tracks signals per symbol for multi-pair support
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS signals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    signal_type TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    fast_ma REAL,
                    slow_ma REAL,
                    rsi REAL,
                    candle_close REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            # Run migrations for schema updates
            # self._run_migrations(cursor)

            # Logs table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    event TEXT,
                    message TEXT NOT NULL,
                    data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            # Bot state table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS bot_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    is_running BOOLEAN DEFAULT 1,
                    last_heartbeat TIMESTAMP,
                    total_trades INTEGER DEFAULT 0,
                    total_pnl REAL DEFAULT 0,
                    daily_pnl REAL DEFAULT 0,
                    last_reset_date DATE,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            # Initialize bot state if not exists
            cursor.execute("SELECT COUNT(*) FROM bot_state WHERE id = 1")
            if cursor.fetchone()[0] == 0:
                cursor.execute(
                    """
                    INSERT INTO bot_state (id, is_running, last_heartbeat, last_reset_date)
                    VALUES (1, 1, CURRENT_TIMESTAMP, date('now'))
                    """
                )

            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")

            # Run migrations after initialization
            # self._run_migrations_after_init()

    def _run_migrations_after_init(self) -> None:
        """Run schema migrations for database updates"""
        with self.lock:
            try:
                conn = self._get_connection()
                cursor = conn.cursor()

                # Migration 1: Add symbol column to signals table if it doesn't exist
                cursor.execute("PRAGMA table_info(signals)")
                columns = [row[1] for row in cursor.fetchall()]

                if "symbol" not in columns:
                    logger.info("Running migration: Adding symbol column to signals table")
                    cursor.execute(
                        "ALTER TABLE signals ADD COLUMN symbol TEXT NOT NULL DEFAULT 'EURUSD'"
                    )
                    conn.commit()
                    logger.info("Migration completed: symbol column added to signals table")

                conn.close()
            except Exception as e:
                logger.warning("Migration check/execution failed", exception=str(e))

    def add_trade(
        self,
        ticket: int,
        symbol: str,
        trade_type: str,
        volume: float,
        entry_price: float,
        entry_time: datetime,
        stop_loss: float,
        take_profit: float,
    ) -> None:
        """Store a new trade"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            try:
                cursor.execute(
                    """
                    INSERT INTO trades
                    (ticket, symbol, type, volume, entry_price, entry_time,
                     stop_loss, take_profit, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
                    """,
                    (
                        ticket,
                        symbol,
                        trade_type,
                        volume,
                        entry_price,
                        entry_time,
                        stop_loss,
                        take_profit,
                    ),
                )
                conn.commit()
                logger.debug(f"Trade {ticket} added to database")
            except sqlite3.IntegrityError:
                logger.warning(f"Trade {ticket} already exists in database")
            finally:
                conn.close()

    def close_trade(
        self,
        ticket: int,
        close_price: float,
        close_time: datetime,
        pnl: float,
    ) -> None:
        """Close an open trade"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                UPDATE trades
                SET close_price = ?, close_time = ?, pnl = ?, status = 'CLOSED'
                WHERE ticket = ?
                """,
                (close_price, close_time, pnl, ticket),
            )
            conn.commit()
            conn.close()
            logger.debug(f"Trade {ticket} closed with PnL: {pnl}")

    def get_open_trades(self) -> List[Dict[str, Any]]:
        """Get all open trades"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT * FROM trades WHERE status = 'OPEN'
                ORDER BY entry_time DESC
                """
            )
            rows = cursor.fetchall()
            conn.close()

            return [dict(row) for row in rows]

    def get_trade_by_ticket(self, ticket: int) -> Optional[Dict[str, Any]]:
        """Get a specific trade by ticket number"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM trades WHERE ticket = ?", (ticket,))
            row = cursor.fetchone()
            conn.close()

            return dict(row) if row else None

    def add_signal(
        self,
        symbol: str,
        signal_type: str,
        reason: str,
        fast_ma: float,
        slow_ma: float,
        rsi: float,
        candle_close: float,
    ) -> None:
        """Store a trading signal with symbol tracking for multi-pair support"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO signals
                (symbol, signal_type, reason, fast_ma, slow_ma, rsi, candle_close)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (symbol, signal_type, reason, fast_ma, slow_ma, rsi, candle_close),
            )
            conn.commit()
            conn.close()

    def add_log(
        self, level: str, message: str, event: Optional[str] = None, data: Optional[str] = None
    ) -> None:
        """Store a log entry"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO logs (level, event, message, data)
                VALUES (?, ?, ?, ?)
                """,
                (level, event, message, data),
            )
            conn.commit()
            conn.close()

    def get_logs(self, limit: int = 100, level: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent logs"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            if level:
                cursor.execute(
                    """
                    SELECT * FROM logs WHERE level = ?
                    ORDER BY created_at DESC LIMIT ?
                    """,
                    (level, limit),
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM logs
                    ORDER BY created_at DESC LIMIT ?
                    """,
                    (limit,),
                )

            rows = cursor.fetchall()
            conn.close()

            return [dict(row) for row in rows]

    def get_signals(self, limit: int = 50, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent signals, optionally filtered by symbol for multi-pair support"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            if symbol:
                cursor.execute(
                    """
                    SELECT * FROM signals WHERE symbol = ?
                    ORDER BY created_at DESC LIMIT ?
                    """,
                    (symbol, limit),
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM signals
                    ORDER BY created_at DESC LIMIT ?
                    """,
                    (limit,),
                )

            rows = cursor.fetchall()
            conn.close()

            return [dict(row) for row in rows]

    def update_bot_state(
        self,
        is_running: bool,
        total_trades: int,
        total_pnl: float,
        daily_pnl: float,
    ) -> None:
        """Update bot state"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                UPDATE bot_state
                SET is_running = ?, total_trades = ?, total_pnl = ?,
                    daily_pnl = ?, last_heartbeat = CURRENT_TIMESTAMP
                WHERE id = 1
                """,
                (is_running, total_trades, total_pnl, daily_pnl),
            )
            conn.commit()
            conn.close()

    def get_bot_state(self) -> Dict[str, Any]:
        """Get current bot state"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM bot_state WHERE id = 1")
            row = cursor.fetchone()
            conn.close()

            return dict(row) if row else {}

    def get_daily_stats(self) -> Dict[str, Any]:
        """Get today's trading statistics"""
        with self.lock:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    COUNT(*) as total_trades,
                    SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closed_trades,
                    SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
                    COALESCE(SUM(pnl), 0) as daily_pnl,
                    AVG(CASE WHEN status = 'CLOSED' THEN pnl END) as avg_pnl
                FROM trades
                WHERE DATE(entry_time) = date('now')
                """
            )

            row = cursor.fetchone()
            conn.close()

            return dict(row) if row else {}


# Global database instance
db = TradingDatabase()
