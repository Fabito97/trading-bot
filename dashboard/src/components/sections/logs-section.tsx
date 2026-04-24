import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";

interface Log {
  id: number;
  level: string;
  event?: string;
  message: string;
  data?: string;
  created_at: string;
}

interface LogsSectionProps {
  data?: {
    timestamp: string;
    count: number;
    logs: Log[];
  };
}

export default function LogsSection({ data }: LogsSectionProps) {
  if (!data || data.logs.length === 0) {
    return (
      <Empty
        // icon="FileText"
        title="No logs yet"
        // description="Bot activity logs will appear here"
      />
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-blue-500/20 text-blue-700";
      case "WARNING":
        return "bg-yellow-500/20 text-yellow-700";
      case "ERROR":
        return "bg-red-500/20 text-red-700";
      case "DEBUG":
        return "bg-gray-500/20 text-gray-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const parseLogData = (data?: string) => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {data.logs.length} recent logs
      </div>

      <div className="space-y-3">
        {data.logs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex gap-4">
              {/* Level Badge */}
              <div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(log.level)}`}
                >
                  {log.level}
                </span>
              </div>

              {/* Log Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {log.event && (
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        {log.event}
                      </p>
                    )}
                    <p className="text-sm wrap-break-words">{log.message}</p>

                    {log.data && (
                      <div className="mt-2 bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                        {typeof parseLogData(log.data) === "object" ? (
                          <pre>
                            {JSON.stringify(parseLogData(log.data), null, 2)}
                          </pre>
                        ) : (
                          <pre>{log.data}</pre>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
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
