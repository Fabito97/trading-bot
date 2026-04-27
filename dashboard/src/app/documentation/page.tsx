'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function DocumentationPage() {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Overview', href: '/documentation/overview', desc: 'High-level architecture and how the bot works' },
        { name: 'Configuration', href: '/documentation/config', desc: 'All environment variables and config options' },
      ],
    },
    {
      title: 'Core Modules',
      items: [
        { name: 'MT5 Connector', href: '/documentation/mt5-connector', desc: 'MT5 connection management and order execution' },
        { name: 'Strategy Engine', href: '/documentation/strategy', desc: 'SMA Crossover strategy and signal generation' },
        { name: 'Order Executor', href: '/documentation/executor', desc: 'Trade execution and risk management' },
        { name: 'Database', href: '/documentation/database', desc: 'SQLite schema and data persistence' },
      ],
    },
    {
      title: 'System Components',
      items: [
        { name: 'Logger', href: '/documentation/logger', desc: 'Structured logging and monitoring' },
        { name: 'API Server', href: '/documentation/api', desc: 'Flask API endpoints and responses' },
        { name: 'Trading Bot', href: '/documentation/trading-bot', desc: 'Main bot orchestration and loop' },
      ],
    },
    {
      title: 'Advanced Topics',
      items: [
        { name: 'Deployment', href: '/documentation/deployment', desc: 'Windows VPS setup and 24/7 deployment' },
        { name: 'Troubleshooting', href: '/documentation/troubleshooting', desc: 'Common errors and debugging' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">MT5 Trading Bot Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Complete technical documentation covering architecture, configuration, modules, and APIs.
            Dive deep into every component of the automated trading system.
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <div className="grid gap-4">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16 p-6 rounded-lg bg-muted/30 border border-border">
          <h3 className="font-bold mb-4">Quick Reference</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Entry Point</p>
              <code className="bg-background px-2 py-1 rounded text-xs">bot/trading_bot.py</code>
            </div>
            <div>
              <p className="font-semibold mb-2">API Server</p>
              <code className="bg-background px-2 py-1 rounded text-xs">bot/api.py:5000</code>
            </div>
            <div>
              <p className="font-semibold mb-2">Database</p>
              <code className="bg-background px-2 py-1 rounded text-xs">bot/trading_bot.db</code>
            </div>
            <div>
              <p className="font-semibold mb-2">Logs</p>
              <code className="bg-background px-2 py-1 rounded text-xs">bot/logs/trading_bot.log</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
