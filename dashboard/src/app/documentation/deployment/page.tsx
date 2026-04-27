'use client';

import DocumentationLayout from '@/components/documentation-layout';
import CodeBlock from '@/components/code-block';

export default function DeploymentPage() {
  return (
    <DocumentationLayout title="Deployment Guide" breadcrumb="Advanced Topics / Deployment">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The bot must run on a Windows machine (local or VPS) with MetaTrader 5 installed.
            This guide covers setup and 24/7 deployment strategies.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Windows Machine Requirements</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
            <li>Windows 7 or later (Server 2008+ for VPS)</li>
            <li>MetaTrader 5 installed and configured</li>
            <li>Python 3.9+</li>
            <li>Internet connection (for MT5 and API)</li>
            <li>Minimum 4GB RAM, 2+ CPU cores recommended</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Local Windows Machine Setup</h3>
          <CodeBlock language="powershell" code={`# 1. Install MetaTrader 5
#    Download from broker, install normally

# 2. Create Python virtual environment
python -m venv C:\\trading-bot\\venv
C:\\trading-bot\\venv\\Scripts\\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure .env
copy .env.example .env
# Edit .env with your MT5 credentials

# 5. Start bot (MT5 must be running)
python trading_bot.py

# 6. In another terminal, start API
python api.py

# Dashboard: http://localhost:8000`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Windows VPS Deployment</h3>
          
          <div className="border-l-4 border-primary pl-4 mb-4">
            <p className="font-semibold mb-3">Step 1: Rent Windows VPS</p>
            <p className="text-sm text-muted-foreground mb-3">
              Recommended: Contabo (~$8/month), Linode, AWS EC2, or Azure
            </p>
            <p className="text-sm text-muted-foreground mb-2">Specs:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Windows Server 2019 or 2022</li>
              <li>2 CPU cores, 4GB RAM minimum</li>
              <li>60GB SSD storage</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary pl-4 mb-4">
            <p className="font-semibold mb-3">Step 2: Connect via RDP</p>
            <CodeBlock language="powershell" code={`# On Windows, open RDP client
mstsc.exe

# Connect to: your_vps_ip
# Username: Administrator
# Password: (from provider email)`} />
          </div>

          <div className="border-l-4 border-primary pl-4 mb-4">
            <p className="font-semibold mb-3">Step 3: Install Software</p>
            <CodeBlock language="powershell" code={`# 1. Install MetaTrader 5
#    Download from broker, install

# 2. Configure MT5 with your account

# 3. Install Python
#    Download python-3.11.exe
#    Check "Add Python to PATH"

# 4. Upload bot files
#    Use WinSCP or file upload from provider

# 5. Install dependencies
cd C:\\trading-bot
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt

# 6. Configure .env
notepad .env`} />
          </div>

          <div className="border-l-4 border-primary pl-4">
            <p className="font-semibold mb-3">Step 4: Keep Running 24/7</p>
            <p className="text-sm text-muted-foreground mb-3">Option A: Task Scheduler</p>
            <CodeBlock language="powershell" code={`# Create C:\\trading-bot\\start-bot.bat
@echo off
cd C:\\trading-bot
venv\\Scripts\\activate
python trading_bot.py

# In Task Scheduler:
# Create Basic Task → "Start at system startup"
# Action: Start a program
# Program: C:\\trading-bot\\start-bot.bat
# Check "Run with highest privileges"`} />
            <p className="text-sm text-muted-foreground mt-4 mb-3">Option B: NSSM (better)</p>
            <CodeBlock language="powershell" code={`# Download nssm.exe, place in C:\\nssm\\
# Install bot as service:
C:\\nssm\\nssm.exe install TradingBot C:\\trading-bot\\venv\\Scripts\\python.exe bot\\trading_bot.py

# Start service:
C:\\nssm\\nssm.exe start TradingBot

# Check status:
C:\\nssm\\nssm.exe status TradingBot

# View logs:
C:\\nssm\\nssm.exe edit TradingBot  # Configure logging`} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Docker (Linux-Based)</h3>
          <p className="text-muted-foreground mb-4">
            ⚠️ NOTE: MT5 is Windows-only. Docker containerization is NOT recommended for this bot.
            Use Windows VPS instead for proper isolation.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Monitoring & Maintenance</h3>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-sm mb-2">Check Bot Status</p>
              <CodeBlock language="bash" code={`# Via API health check
curl http://your_vps_ip:8000/health

# Via API status
curl http://your_vps_ip:8000/api/status

# View logs
tail -f C:\\trading-bot\\logs\\trading_bot.log`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-sm mb-2">Daily Restart</p>
              <CodeBlock language="powershell" code={`# Prevent memory leaks, restart daily at 2 AM
# In Task Scheduler:
# Create Basic Task → "Daily Restart"
# Trigger: Daily at 2:00 AM
# Action: Stop service, wait 5 min, start service
# Use: nssm.exe stop TradingBot / nssm.exe start TradingBot`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-sm mb-2">Backup Database</p>
              <CodeBlock language="powershell" code={`# Daily backup of SQLite database
# Create backup-db.bat:
@echo off
copy C:\\trading-bot\\trading_bot.db C:\\backups\\trading_bot_%date:~-4,4%%date:~-10,2%%date:~-7,2%.db

# Schedule in Task Scheduler daily at 3 AM`} />
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-sm mb-2">Error Alerts</p>
              <CodeBlock language="powershell" code={`# Query database for errors
$errors = sqlite3 C:\\trading-bot\\trading_bot.db "SELECT * FROM logs WHERE level='ERROR' AND created_at > datetime('now', '-1 hour')"

# If errors found, send email alert
if ($errors) {
    Send-MailMessage -From "bot@example.com" -To "admin@example.com" \\
      -Subject "Trading Bot Errors" -Body $errors -SmtpServer "smtp.gmail.com"
}`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Troubleshooting Deployment</h3>
          
          <div className="space-y-3">
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">❌ "MT5 x64 not found"</p>
              <p className="text-sm text-muted-foreground">MT5 not installed or not running. Ensure MT5 terminal is open.</p>
            </div>

            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">❌ "Failed to login"</p>
              <p className="text-sm text-muted-foreground">Check .env credentials. Test login manually in MT5 first.</p>
            </div>

            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">❌ "IPC connection lost"</p>
              <p className="text-sm text-muted-foreground">Bot lost connection to MT5. Auto-reconnect should fix it. Check logs.</p>
            </div>

            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="font-semibold text-sm mb-2">❌ "No signals being generated"</p>
              <p className="text-sm text-muted-foreground">Market data not matching strategy conditions. Set LOG_LEVEL=DEBUG to see indicators.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Cost Estimation (Annual)</h3>
          <div className="bg-muted/30 border border-border rounded p-4">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
              <li><strong>Windows VPS (Contabo):</strong> ~$96/year ($8/month)</li>
              <li><strong>Backup storage:</strong> ~$0 (included in VPS or use free tier)</li>
              <li><strong>Domain (optional):</strong> ~$12/year</li>
              <li><strong>Total minimum:</strong> ~$96/year</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <p className="font-semibold text-sm mb-2">💡 Best Practice</p>
          <p className="text-sm">
            Use NSSM for service management on Windows VPS. It's more reliable than Task Scheduler 
            and provides automatic restart on crashes. Always keep MT5 terminal running alongside the bot.
          </p>
        </div>
      </section>
    </DocumentationLayout>
  );
}
