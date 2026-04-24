import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";

interface Trade {
  id: number;
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  entry_price: number;
  entry_time: string;
  stop_loss: number;
  take_profit: number;
  close_price?: number;
  close_time?: string;
  pnl?: number;
  status: string;
}

interface TradesSectionProps {
  data?: {
    timestamp: string;
    open_count: number;
    trades: Trade[];
  };
}

export default function TradesSection({ data }: TradesSectionProps) {
  if (!data || data.trades.length === 0) {
    return (
      <Empty
        // icon="TrendingUp"
        title="No trades yet"
        // description="Trades will appear here once the bot executes them"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {data.open_count} open trade{data.open_count !== 1 ? "s" : ""}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Ticket</th>
              <th className="text-left py-3 px-4 font-semibold">Type</th>
              <th className="text-left py-3 px-4 font-semibold">Volume</th>
              <th className="text-left py-3 px-4 font-semibold">Entry Price</th>
              <th className="text-left py-3 px-4 font-semibold">SL</th>
              <th className="text-left py-3 px-4 font-semibold">TP</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">P&L</th>
              <th className="text-left py-3 px-4 font-semibold">Entry Time</th>
            </tr>
          </thead>
          <tbody>
            {data.trades.map((trade) => (
              <tr key={trade.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4 font-mono">{trade.ticket}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.type === "BUY"
                        ? "bg-green-500/20 text-green-700"
                        : "bg-red-500/20 text-red-700"
                    }`}
                  >
                    {trade.type}
                  </span>
                </td>
                <td className="py-3 px-4">{trade.volume.toFixed(2)}</td>
                <td className="py-3 px-4">{trade.entry_price.toFixed(5)}</td>
                <td className="py-3 px-4">{trade.stop_loss.toFixed(5)}</td>
                <td className="py-3 px-4">{trade.take_profit.toFixed(5)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.status === "OPEN"
                        ? "bg-blue-500/20 text-blue-700"
                        : "bg-gray-500/20 text-gray-700"
                    }`}
                  >
                    {trade.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {trade.pnl !== undefined && (
                    <span
                      className={
                        trade.pnl >= 0
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {trade.pnl >= 0 ? "+" : "-"}
                      {Math.abs(trade.pnl).toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {new Date(trade.entry_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
