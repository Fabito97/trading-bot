import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";

interface Signal {
  id: number;
  signal_type: string;
  reason: string;
  fast_ma: number;
  slow_ma: number;
  rsi: number;
  candle_close: number;
  created_at: string;
}

interface SignalsSectionProps {
  data?: {
    timestamp: string;
    count: number;
    signals: Signal[];
  };
}

export default function SignalsSection({ data }: SignalsSectionProps) {
  if (!data || data.signals.length === 0) {
    return (
      <Empty
        // icon="Activity"
        title="No signals yet"
        // description="Trading signals will appear here as the bot analyzes the market"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {data.signals.map((signal) => (
          <Card key={signal.id} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Signal Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      signal.signal_type === "BUY"
                        ? "bg-green-500/20 text-green-700"
                        : "bg-red-500/20 text-red-700"
                    }`}
                  >
                    {signal.signal_type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(signal.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Reason:</p>
                <p className="text-sm leading-relaxed">{signal.reason}</p>
              </div>

              {/* Indicators */}
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Fast MA (20):
                    </span>
                    <span className="font-mono text-sm">
                      {signal.fast_ma.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Slow MA (50):
                    </span>
                    <span className="font-mono text-sm">
                      {signal.slow_ma.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      RSI (14):
                    </span>
                    <span className="font-mono text-sm">
                      {signal.rsi.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Close Price:
                    </span>
                    <span className="font-mono text-sm">
                      {signal.candle_close.toFixed(5)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
