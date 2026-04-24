"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard";
import { useAPIConnection } from "@/hooks/use-api-connection";

export default function Home() {
  const { connected, apiUrl } = useAPIConnection();

  return (
    <main className="min-h-screen bg-background">
      {!connected && (
        <div className="bg-red-50 border border-red-200 p-4 m-4 rounded-lg">
          <p className="text-red-800">
            ⚠️ Cannot connect to bot API. Make sure the bot is running and the
            API is accessible at {apiUrl}
          </p>
        </div>
      )}
      <Dashboard />
    </main>
  );
}
