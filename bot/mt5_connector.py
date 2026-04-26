"""
MetaTrader5 connection manager with auto-reconnect and health checks.
"""

import time
from typing import Optional

import MetaTrader5 as mt5

from config import mt5_config
from logger import logger


class MT5Connector:
    """
    Manages MT5 connection with automatic reconnection and error handling.
    """

    def __init__(self):
        self.is_connected = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self.reconnect_delay_seconds = 5

    def connect(self) -> bool:
        """
        Initialize MT5 connection.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            # Initialize MT5
            if mt5_config.path:
                initialized = mt5.initialize(path=mt5_config.path)
            else:
                initialized = mt5.initialize()

            if not initialized:
                logger.error("MT5 initialization failed", error_code=mt5.last_error())
                return False

            # Login
            login_success = mt5.login(
                login=mt5_config.login,
                password=mt5_config.password,
                server=mt5_config.server,
            )

            if not login_success:
                error = mt5.last_error()
                logger.error(
                    "MT5 login failed",
                    login=mt5_config.login,
                    server=mt5_config.server,
                    error_code=error[0],
                    error_message=error[1],
                )
                mt5.shutdown()
                return False

            self.is_connected = True
            self.reconnect_attempts = 0
            logger.info(
                "Connected to MT5",
                login=mt5_config.login,
                server=mt5_config.server,
            )
            return True

        except Exception as e:
            logger.error("MT5 connection exception", exception=str(e))
            return False

    def disconnect(self) -> None:
        """Disconnect from MT5"""
        try:
            mt5.shutdown()
            self.is_connected = False
            logger.info("Disconnected from MT5")
        except Exception as e:
            logger.error("Error disconnecting from MT5", exception=str(e))

    def reconnect(self) -> bool:
        """
        Attempt to reconnect to MT5 with exponential backoff.
        
        Returns:
            bool: True if reconnection successful, False if max attempts exceeded
        """
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error(
                "Max reconnection attempts exceeded",
                attempts=self.reconnect_attempts,
            )
            return False

        self.reconnect_attempts += 1
        delay = self.reconnect_delay_seconds * self.reconnect_attempts
        logger.warning(
            f"Reconnecting to MT5 in {delay} seconds",
            attempt=self.reconnect_attempts,
        )

        time.sleep(delay)
        return self.connect()

    def is_ready(self) -> bool:
        """Check if MT5 connection is active"""
        if not self.is_connected:
            return False

        try:
            # Try to get account info as health check
            info = mt5.account_info()
            return info is not None
        except Exception:
            self.is_connected = False
            return False

    def get_account_info(self) -> Optional[dict]:
        """Get account information"""
        try:
            # Try to get account info directly
            info = mt5.account_info()
            if info is None:
                # If None, try to check if MT5 is still initialized
                if not mt5.initialize():
                    # Try to re-initialize with credentials
                    if not self.connect():
                        logger.error("Failed to reconnect to MT5 for account info")
                        return None
                    info = mt5.account_info()
                    if info is None:
                        logger.error("Account info still None after reconnect")
                        return None
                else:
                    logger.error("Failed to get account info - MT5 initialized but account_info returned None")
                    return None

            # Calculate margin_used if not available (different MT5 versions)
            margin_used = getattr(info, 'margin_used', None)
            if margin_used is None:
                # Fallback: margin_used = margin_free - free_margin or calculate from balance/equity
                margin_used = info.balance - info.equity if info.balance >= info.equity else 0

            return {
                "login": info.login,
                "balance": info.balance,
                "equity": info.equity,
                "margin_free": info.margin_free,
                "margin_used": margin_used,
                "leverage": info.leverage,
                "currency": info.currency,
            }
        except Exception as e:
            logger.error("Exception getting account info", exception=str(e), traceback=True)
            return None

    def get_symbol_info(self, symbol: str) -> Optional[dict]:
        """Get symbol/instrument information"""
        try:
            info = mt5.symbol_info(symbol)
            if info is None:
                logger.error("Symbol not found", symbol=symbol)
                return None

            return {
                "symbol": info.name,
                "bid": info.bid,
                "ask": info.ask,
                "point": info.point,
                "digits": info.digits,
                "trade_contract_size": info.trade_contract_size,
                "min_volume": info.volume_min,
                "max_volume": info.volume_max,
                "volume_step": info.volume_step,
            }
        except Exception as e:
            logger.error("Exception getting symbol info", symbol=symbol, exception=str(e))
            return None

    def get_rates(self, symbol: str, timeframe: int, count: int) -> Optional[list]:
        """
        Get historical rates (OHLC data).
        
        Args:
            symbol: Trading symbol (e.g., 'EURUSD')
            timeframe: Timeframe in minutes (1, 5, 15, 60, etc.)
            count: Number of bars to fetch
            
        Returns:
            List of OHLC bars or None if error
        """
        try:
            # Convert minutes to MT5 timeframe constant
            mt5_timeframe = self._get_mt5_timeframe(timeframe)
            if mt5_timeframe is None:
                logger.error("Invalid timeframe", timeframe=timeframe)
                return None

            rates = mt5.copy_rates_from_pos(symbol, mt5_timeframe, 0, count)
            if rates is None:
                logger.error("Failed to get rates", symbol=symbol, timeframe=timeframe)
                return None

            return rates

        except Exception as e:
            logger.error(
                "Exception getting rates",
                symbol=symbol,
                timeframe=timeframe,
                exception=str(e),
            )
            return None

    @staticmethod
    def _get_mt5_timeframe(minutes: int) -> Optional[int]:
        """Convert minutes to MT5 timeframe constant"""
        timeframe_map = {
            1: mt5.TIMEFRAME_M1,
            5: mt5.TIMEFRAME_M5,
            15: mt5.TIMEFRAME_M15,
            30: mt5.TIMEFRAME_M30,
            60: mt5.TIMEFRAME_H1,
            240: mt5.TIMEFRAME_H4,
            1440: mt5.TIMEFRAME_D1,
        }
        return timeframe_map.get(minutes)

    def send_order(
        self,
        symbol: str,
        order_type: str,
        volume: float,
        price: float,
        stop_loss: float,
        take_profit: float,
        comment: str = "TradingBot",
    ) -> Optional[int]:
        """
        Send a market order to MT5.
        
        Args:
            symbol: Trading symbol
            order_type: 'BUY' or 'SELL'
            volume: Order size in lots
            price: Entry price (ask for BUY, bid for SELL)
            stop_loss: Stop loss price
            take_profit: Take profit price
            comment: Order comment
            
        Returns:
            Order ticket number or None if failed
        """
        try:
            # Prepare order request
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": volume,
                "type": mt5.ORDER_TYPE_BUY if order_type == "BUY" else mt5.ORDER_TYPE_SELL,
                "price": price,
                "sl": stop_loss,
                "tp": take_profit,
                "deviation": 20,  # Max deviation in points
                "magic": 12345,
                "comment": comment,
                "type_filling": mt5.ORDER_FILLING_IOC,
                "type_time": mt5.ORDER_TIME_GTC,
            }

            # Send order
            result = mt5.order_send(request)

            if result.retcode != mt5.TRADE_RETCODE_DONE:
                logger.error(
                    "Order rejected",
                    symbol=symbol,
                    type=order_type,
                    retcode=result.retcode,
                    comment=result.comment,
                )
                return None

            logger.info(
                "Order executed",
                ticket=result.order,
                symbol=symbol,
                type=order_type,
                volume=volume,
                price=price,
            )
            return result.order

        except Exception as e:
            logger.error(
                "Exception sending order",
                symbol=symbol,
                order_type=order_type,
                exception=str(e),
            )
            return None

    def close_order(self, ticket: int, symbol: str, volume: float, price: float) -> bool:
        """
        Close an open position.
        
        Args:
            ticket: Order ticket number
            symbol: Trading symbol
            volume: Position size in lots
            price: Close price (bid for BUY, ask for SELL)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get position to determine order type
            position = mt5.positions_get(ticket=ticket)
            if not position:
                logger.error("Position not found", ticket=ticket)
                return False

            pos_type = position[0].type
            order_type = mt5.ORDER_TYPE_SELL if pos_type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY

            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": volume,
                "type": order_type,
                "position": ticket,
                "price": price,
                "deviation": 20,
                "magic": 12345,
                "comment": "TradingBot Close",
                "type_filling": mt5.ORDER_FILLING_IOC,
                "type_time": mt5.ORDER_TIME_GTC,
            }

            result = mt5.order_send(request)

            if result.retcode != mt5.TRADE_RETCODE_DONE:
                logger.error(
                    "Close order rejected",
                    ticket=ticket,
                    retcode=result.retcode,
                )
                return False

            logger.info("Order closed", ticket=ticket, close_order=result.order)
            return True

        except Exception as e:
            logger.error("Exception closing order", ticket=ticket, exception=str(e))
            return False


# Global MT5 connector instance
mt5_conn = MT5Connector()
