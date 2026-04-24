import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface StatusData {
  timestamp: string;
  mt5_connected: boolean;
  account: {
    login: number;
    balance: number;
    equity: number;
    margin_free: number;
    margin_used: number;
    leverage: number;
    currency: string;
  };
  bot: {
    is_running: boolean;
    total_trades: number;
    total_pnl: number;
    daily_pnl: number;
    last_heartbeat: string;
  };
  trading: {
    open_trades: number;
    daily_trades: number;
    winning_trades: number;
    closing_trades: number;
    average_pnl: number;
    daily_pnl: number;
  };
}

interface StatusSectionProps {
  data?: { status: string; timestamp: string } & StatusData;
  isLoading?: boolean;
  expanded?: boolean;
}

export default function StatusSection({
  data,
  isLoading = false,
  expanded = false,
}: StatusSectionProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Spinner className="mr-3" />
          <span>Loading status...</span>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No data available</p>
      </Card>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.account.currency,
    }).format(value);

  const formatPnL = (value: number) => {
    const formatted = formatCurrency(Math.abs(value));
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">MT5 Connection</p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  data.mt5_connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="font-semibold">
                {data.mt5_connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Bot Status</p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  data.bot.is_running ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span className="font-semibold">
                {data.bot.is_running ? "Running" : "Stopped"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {expanded && (
        <>
          {/* Account Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Login</p>
                <p className="text-lg font-semibold mt-1">
                  {data.account.login}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(data.account.balance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equity</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(data.account.equity)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free Margin</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(data.account.margin_free)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used Margin</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(data.account.margin_used)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leverage</p>
                <p className="text-lg font-semibold mt-1">
                  1:{data.account.leverage}
                </p>
              </div>
            </div>
          </Card>

          {/* Trading Statistics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Today&apos;s Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold mt-1">
                  {data.trading.daily_trades}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Trades</p>
                <p className="text-2xl font-bold mt-1">
                  {data.trading.open_trades}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Winning Trades</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {data.trading.winning_trades}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    data.trading.daily_pnl >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPnL(data.trading.daily_pnl)}
                </p>
              </div>
            </div>
          </Card>

          {/* Overall Statistics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Overall Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-lg font-semibold mt-1">
                  {data.bot.total_trades}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p
                  className={`text-lg font-semibold mt-1 ${
                    data.bot.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPnL(data.bot.total_pnl)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Heartbeat</p>
                <p className="text-sm font-mono mt-1">
                  {new Date(data.bot.last_heartbeat).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
