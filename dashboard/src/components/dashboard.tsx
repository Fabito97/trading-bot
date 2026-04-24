"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import StatusSection from "./sections/status-section";
import TradesSection from "./sections/trades-section";
import SignalsSection from "./sections/signals-section";
import LogsSection from "./sections/logs-section";
import { useAPIConnection } from "@/hooks/use-api-connection";

const fetcher = async (url: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}${url}`, {
    mode: "cors",
    credentials: "omit",
  });
  if (!response.ok) throw new Error("API error");
  return response.json();
};

export default function Dashboard() {
  const { connected } = useAPIConnection();
  const [activeTab, setActiveTab] = useState("status");

  const {
    data: statusData,
    error: statusError,
    isLoading: statusLoading,
  } = useSWR(connected ? "/api/status" : null, fetcher, {
    refreshInterval: 5000,
  });

  const { data: tradesData } = useSWR(
    connected && activeTab === "trades" ? "/api/trades" : null,
    fetcher,
    { refreshInterval: 10000 },
  );

  const { data: signalsData } = useSWR(
    connected && activeTab === "signals" ? "/api/signals" : null,
    fetcher,
    { refreshInterval: 10000 },
  );

  const { data: logsData } = useSWR(
    connected && activeTab === "logs" ? "/api/logs" : null,
    fetcher,
    { refreshInterval: 10000 },
  );

  if (!connected) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10 border-destructive">
          <div className="p-6 text-center">
            <p className="text-lg font-semibold text-destructive">
              Trading Bot API Not Connected
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure the bot is running and the API is accessible.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold">Trading Bot Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and trading signals
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {statusError && (
          <Card className="bg-destructive/10 border-destructive mb-6">
            <div className="p-4">
              <p className="text-destructive font-semibold">
                Error loading status
              </p>
              <p className="text-sm text-muted-foreground">
                Check bot connection
              </p>
            </div>
          </Card>
        )}

        {/* Status Section - Always Visible */}
        <StatusSection data={statusData} isLoading={statusLoading} />

        {/* Tabs */}
        <div className="mt-8 border-b">
          <div className="flex gap-8">
            {["status", "trades", "signals", "logs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "status" && (
            <div className="space-y-6">
              <StatusSection
                data={statusData}
                isLoading={statusLoading}
                expanded
              />
            </div>
          )}

          {activeTab === "trades" && <TradesSection data={tradesData} />}

          {activeTab === "signals" && <SignalsSection data={signalsData} />}

          {activeTab === "logs" && <LogsSection data={logsData} />}
        </div>
      </div>
    </div>
  );
}
