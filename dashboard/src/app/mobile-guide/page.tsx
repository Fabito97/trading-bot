'use client';

import { Copy, Download, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function MobileDevGuide() {
  const [copied, setCopied] = useState(false);

  const content = `DEVELOPING MT5 TRADING BOT ON YOUR PHONE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YES, IT'S POSSIBLE!

You can write Python code directly on your phone and deploy it to run on a server.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CHOOSE A MOBILE PYTHON EDITOR

Android:
• Termux (FREE) - Linux terminal on your phone. Install Python, pip, and write code in nano/vim
• Pydroid 3 (PAID ~$10) - Full Python IDE with pip package manager built-in
• QPython (FREE) - Simple Python IDE, great for beginners

iPhone/iOS:
• Python IDE (PAID) - Supports Python 3 with package management
• Carnets (PAID) - Jupyter notebooks on iOS
• Textastic (PAID) - Code editor with syntax highlighting

RECOMMENDATION: Termux (Android) or Python IDE (iOS) - both support pip and external libraries

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: YOUR PHONE WORKFLOW

1. Open code editor on phone
2. Write/edit the trading bot Python script
3. Test logic locally (can't test MT5 connection on phone, but can verify syntax)
4. Push code to GitHub or upload to a code hosting service
5. From your VPS/server, git pull the latest code
6. Run: python trading_bot.py

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: DEPLOYMENT (STILL HAPPENS ON A SERVER)

Your phone edits code → Stores on GitHub/GitLab → VPS pulls & runs it

Example deployment flow:
┌─────────────────┐
│  Your Phone     │
│  Edit code.py   │
└────────┬────────┘
         │
         ↓
    git push origin main
         │
         ↓
┌──────────────────────┐
│  GitHub/GitLab       │
│  Stores your code    │
└────────┬─────────────┘
         │
         ↓
    VPS runs: git pull
         │
         ↓
┌──────────────────────┐
│  Your VPS ($5/mo)    │
│  Runs 24/7:          │
│  python bot.py       │
│  Connects to MT5     │
│  Makes real trades   │
└──────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT LIMITATIONS

✗ MT5 cannot run ON your phone - MetaTrader 5 is Windows/Mac only
✓ BUT you CAN write the code on phone that controls MT5 running elsewhere

✗ Cannot test live trading from phone (no broker connection)
✓ CAN test the code logic and syntax on phone

✗ Termux: Installing heavy packages can be slow/crash on older phones
✓ Modern phones (2020+) handle it fine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REAL WORKFLOW EXAMPLE

Monday: Edit bot.py on phone during lunch
Tuesday: Push to GitHub from phone
Wednesday: SSH into VPS, pull changes, restart bot
Thursday: Monitor bot performance from phone via dashboard

You're editing on phone, bot runs on cloud. Perfect combo!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SETUP CHECKLIST

□ Download Termux (Android) or Python IDE (iOS)
□ Install Python 3 + pip in the app
□ Install libraries: pip install MetaTrader5 pandas numpy
□ Create GitHub account (free)
□ Write code in editor
□ Git push from phone
□ Rent a VPS (DigitalOcean, Linode, AWS)
□ SSH into VPS and git pull
□ Run python bot.py
□ Bot trades 24/7 while you relax

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOTTOM LINE

Yes, you can develop the entire bot on your phone.
No, it won't run ON your phone (MT5 constraint).
It WILL run on a cheap server after you push code from phone.

The phone becomes your development IDE. The server is your production environment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsFile = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'MT5_Mobile_Dev_Guide.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mobile Development Guide</h1>
          <p className="text-slate-400">Develop your MT5 trading bot on your phone</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Copy size={20} />
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={downloadAsFile}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={20} />
            Download as .txt
          </button>
        </div>

        {/* Content Canvas */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl">
          <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap wrap-break-words leading-relaxed">
            {content}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-slate-700/30 border border-slate-600 rounded-lg">
          <p className="text-slate-300 mb-4 flex items-center gap-2">
            <ArrowRight size={18} className="text-blue-400" />
            <span>
              Ready to set up? You'll need a cheap VPS (~$5/month) to run the bot 24/7 while you edit on your phone.
            </span>
          </p>
          <p className="text-slate-400 text-sm">
            The beauty of this approach: code anywhere, run anywhere. Your phone is your development environment, not your production environment.
          </p>
        </div>
      </div>
    </div>
  );
}
