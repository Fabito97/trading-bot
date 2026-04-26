"""
Flask API server for dashboard monitoring.
Provides endpoints for bot status, trades, logs, and signals.
"""

import json
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import database_config, monitoring_config
from database import db
from logger import logger
from mt5_connector import mt5_conn

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.route("/api/status", methods=["GET"])
def get_status():
    """Get current bot status"""
    try:
        # Get account info
        account_info = mt5_conn.get_account_info()
        if not account_info:
            return jsonify({"error": "MT5 not connected"}), 503

        # Get bot state
        bot_state = db.get_bot_state()

        # Get open trades
        open_trades = db.get_open_trades()

        # Get daily stats
        daily_stats = db.get_daily_stats()

        response = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "mt5_connected": mt5_conn.is_ready(),
            "account": {
                "login": account_info["login"],
                "balance": account_info["balance"],
                "equity": account_info["equity"],
                "margin_free": account_info["margin_free"],
                "margin_used": account_info["margin_used"],
                "leverage": account_info["leverage"],
                "currency": account_info["currency"],
            },
            "bot": {
                "is_running": bot_state.get("is_running", False),
                "total_trades": bot_state.get("total_trades", 0),
                "total_pnl": bot_state.get("total_pnl", 0),
                "daily_pnl": bot_state.get("daily_pnl", 0),
                "last_heartbeat": bot_state.get("last_heartbeat"),
            },
            "trading": {
                "open_trades": len(open_trades),
                "daily_trades": daily_stats.get("total_trades", 0),
                "winning_trades": daily_stats.get("winning_trades", 0),
                "closing_trades": daily_stats.get("closed_trades", 0),
                "average_pnl": daily_stats.get("avg_pnl", 0),
            },
        }

        return jsonify(response)

    except Exception as e:
        logger.error("Error in /api/status", exception=str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/trades", methods=["GET"])
def get_trades():
    """Get trades (open and recent closed)"""
    try:
        limit = request.args.get("limit", default=50, type=int)

        # Get open trades
        open_trades = db.get_open_trades()

        # Get all trades limited
        conn = db._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM trades
            ORDER BY entry_time DESC LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
        conn.close()

        trades = [dict(row) for row in rows]

        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "open_count": len(open_trades),
            "trades": trades,
        })

    except Exception as e:
        logger.error("Error in /api/trades", exception=str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/trades/<int:ticket>", methods=["GET"])
def get_trade(ticket: int):
    """Get specific trade details"""
    try:
        trade = db.get_trade_by_ticket(ticket)
        if not trade:
            return jsonify({"error": "Trade not found"}), 404

        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "trade": trade,
        })

    except Exception as e:
        logger.error("Error in /api/trades/<ticket>", exception=str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/signals", methods=["GET"])
def get_signals():
    """Get recent trading signals"""
    try:
        limit = request.args.get("limit", default=50, type=int)
        signals = db.get_signals(limit)

        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "count": len(signals),
            "signals": signals,
        })

    except Exception as e:
        logger.error("Error in /api/signals", exception=str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/logs", methods=["GET"])
def get_logs():
    """Get recent logs"""
    try:
        limit = request.args.get("limit", default=100, type=int)
        level = request.args.get("level")

        logs = db.get_logs(limit=limit, level=level)

        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "count": len(logs),
            "logs": logs,
        })

    except Exception as e:
        logger.error("Error in /api/logs", exception=str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/daily-stats", methods=["GET"])
def get_daily_stats():
    """Get today's trading statistics"""
    try:
        stats = db.get_daily_stats()

        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stats": stats,
        })

    except Exception as e:
        logger.error("Error in /api/daily-stats", exception=str(e))
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


def run_api_server():
    """Run the API server"""
    logger.info(
        f"Starting API server",
        host=monitoring_config.api_host,
        port=monitoring_config.api_port,
    )
    
    app.run(
        host=monitoring_config.api_host,
        port=monitoring_config.api_port,
        debug=False,
        threaded=True,
    )


if __name__ == "__main__":
    run_api_server()
