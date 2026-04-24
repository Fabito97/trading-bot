"""
Trade execution manager with risk management and position tracking.
"""

from datetime import datetime, timedelta
from typing import Optional

from config import trading_config
from database import db
from logger import logger
from mt5_connector import mt5_conn


class TradeExecutor:
    """
    Executes trades with risk management:
    - Fixed position sizing
    - Stop loss and take profit
    - Daily loss limits
    - Max trades per day limit
    - Trade timeout
    """

    def __init__(self):
        self.symbol = trading_config.symbol
        self.stop_loss_pips = trading_config.stop_loss_pips
        self.take_profit_pips = trading_config.take_profit_pips
        self.max_daily_loss = trading_config.max_daily_loss_percent
        self.max_position_size = trading_config.max_position_size
        self.max_trades_per_day = trading_config.max_trades_per_day
        self.trade_timeout_minutes = trading_config.trade_timeout_minutes
        self.last_trade_time = None

    def execute_signal(self, signal_type: str, indicator_values: dict) -> bool:
        """
        Execute a trading signal with risk management checks.
        
        Args:
            signal_type: 'BUY' or 'SELL'
            indicator_values: Dictionary of indicator values
            
        Returns:
            True if trade executed, False if blocked by risk management
        """
        # Risk management checks
        if not self._can_trade():
            logger.warning(
                "Trade blocked by risk management",
                reason=self._get_trade_block_reason(),
            )
            return False

        # Get current account and symbol info
        account_info = mt5_conn.get_account_info()
        symbol_info = mt5_conn.get_symbol_info(self.symbol)

        if not account_info or not symbol_info:
            logger.error("Failed to get account or symbol info")
            return False

        # Calculate position size
        volume = self._calculate_position_size(account_info)
        if volume <= 0:
            logger.warning("Position size calculation resulted in 0 volume")
            return False

        # Calculate SL/TP prices
        bid = symbol_info["bid"]
        ask = symbol_info["ask"]
        point = symbol_info["point"]

        if signal_type == "BUY":
            entry_price = ask
            stop_loss = entry_price - (self.stop_loss_pips * point)
            take_profit = entry_price + (self.take_profit_pips * point)
        else:  # SELL
            entry_price = bid
            stop_loss = entry_price + (self.stop_loss_pips * point)
            take_profit = entry_price - (self.take_profit_pips * point)

        # Send order
        ticket = mt5_conn.send_order(
            symbol=self.symbol,
            order_type=signal_type,
            volume=volume,
            price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            comment=f"TradingBot-{signal_type}",
        )

        if ticket is None:
            logger.error("Failed to execute order", signal_type=signal_type)
            return False

        # Store trade in database
        db.add_trade(
            ticket=ticket,
            symbol=self.symbol,
            trade_type=signal_type,
            volume=volume,
            entry_price=entry_price,
            entry_time=datetime.utcnow(),
            stop_loss=stop_loss,
            take_profit=take_profit,
        )

        # Log trade execution
        logger.log_trade(
            trade_type=signal_type,
            symbol=self.symbol,
            volume=volume,
            entry_price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            ticket=ticket,
        )

        self.last_trade_time = datetime.utcnow()
        return True

    def manage_open_trades(self) -> None:
        """
        Check and manage open trades:
        - Monitor for closed positions
        - Check for timeouts
        """
        try:
            open_trades = db.get_open_trades()

            for trade in open_trades:
                ticket = trade["ticket"]
                entry_time = datetime.fromisoformat(trade["entry_time"])

                # Check trade timeout
                if self.trade_timeout_minutes > 0:
                    elapsed = (datetime.utcnow() - entry_time).total_seconds() / 60
                    if elapsed > self.trade_timeout_minutes:
                        logger.warning(
                            "Trade timeout exceeded",
                            ticket=ticket,
                            elapsed_minutes=elapsed,
                        )
                        # Could implement auto-close here if desired

                # Check if position is still open in MT5
                position = mt5_conn.mt5.positions_get(ticket=ticket) if hasattr(mt5_conn, 'mt5') else None
                
                if position is None:
                    # Position closed in MT5, need to check profit/loss
                    # This would require fetching closed trades from MT5
                    logger.debug(f"Position {ticket} not found in MT5, may be closed")

        except Exception as e:
            logger.error("Error managing open trades", exception=str(e))

    def _can_trade(self) -> bool:
        """Check if trading is allowed based on risk management rules"""
        # Check daily loss limit
        daily_stats = db.get_daily_stats()
        if daily_stats.get("daily_pnl", 0) < 0:
            daily_loss_pct = abs(daily_stats["daily_pnl"]) / (
                db.get_bot_state().get("balance", 1) or 1
            ) * 100
            if daily_loss_pct >= self.max_daily_loss:
                return False

        # Check max trades per day
        daily_stats = db.get_daily_stats()
        if daily_stats.get("total_trades", 0) >= self.max_trades_per_day:
            return False

        # Check trade frequency (don't trade too close together)
        if self.last_trade_time:
            seconds_since_last = (datetime.utcnow() - self.last_trade_time).total_seconds()
            if seconds_since_last < 300:  # Min 5 minutes between trades
                return False

        return True

    def _get_trade_block_reason(self) -> str:
        """Get reason why trade is blocked"""
        daily_stats = db.get_daily_stats()
        
        if daily_stats.get("total_trades", 0) >= self.max_trades_per_day:
            return f"Max trades per day ({self.max_trades_per_day}) reached"

        if daily_stats.get("daily_pnl", 0) < 0:
            daily_loss_pct = abs(daily_stats["daily_pnl"]) / (
                db.get_bot_state().get("balance", 1) or 1
            ) * 100
            if daily_loss_pct >= self.max_daily_loss:
                return f"Daily loss limit ({self.max_daily_loss}%) exceeded"

        if self.last_trade_time:
            seconds_since_last = (datetime.utcnow() - self.last_trade_time).total_seconds()
            if seconds_since_last < 300:
                return "Trade frequency limit (5 min minimum between trades)"

        return "Unknown"

    def _calculate_position_size(self, account_info: dict) -> float:
        """
        Calculate position size based on 1% risk rule.
        
        Args:
            account_info: Account information from MT5
            
        Returns:
            Position size in lots
        """
        balance = account_info.get("balance", 0)
        
        if balance <= 0:
            return 0

        # Risk 1% of balance per trade
        risk_amount = balance * 0.01

        # For forex, approximate pip value
        # In reality, this varies by pair and account currency
        pip_value = risk_amount / self.stop_loss_pips

        # Position size: (Risk Amount / Stop Loss Pips) / Pip Value
        # Standard lot = 100,000 units, mini = 10,000, micro = 1,000
        position_size = pip_value / 100000

        # Cap at max position size
        position_size = min(position_size, self.max_position_size)

        # Round to valid lot step (0.01 lot minimum)
        position_size = round(position_size, 2)

        return position_size


# Global executor instance
executor = TradeExecutor()
