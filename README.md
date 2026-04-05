# ✦ Coaldiam

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

**Coaldiam** is an institutional-grade, AI-driven stock intelligence terminal designed to democratize quantitative strategies for retail traders. Built directly on top of the **Google Gemini 2.5 Flash** large language model, Coaldiam aggregates real-time market action (via `yfinance` & `alpaca-py`) and translates raw, noisy options-flow data into concise, high-probability trade setups with precise entry/exit corridors.

---

## 💎 Features

- **Gemini AI Intelligence Layer**: Leverages continuous multi-timeframe heuristics processing to detect ascending triangle breakouts, volatility crushes, and institutional block orders. 
- **Real-Time Dashboards**: Powered by TradingView's Lightweight Charts to provide a sub-second, highly aesthetic market overview of SPY, QQQ, AAPL, NVDA, and TSLA.
- **Proprietary Scoring Matrix**: Every options flow and equity strategy is piped into an internal confidence scorer (0-100) detailing thesis, invalidation levels, and exact execution plays.
- **Asynchronous FastAPI Engine**: Blazing fast backend operations natively managing Websocket polling and SQLite encryption for the user infrastructure.
- **JWT Authentication Flow**: Full-stack session handling mapped to React Contexts for gated "Operator Mode" clearance. 

---

## 🏗 System Architecture 

* **Frontend**: React + Vite + TailwindCSS 
* **Backend**: FastAPI
* **Data Sources**: Yahoo Finance (`yfinance`), Alpaca Trade API
* **AI Engine**: Google AI Studio (`gemini-2.5-flash`)
* **Database**: Embedded SQLite + `aiosqlite`
* **Security**: `passlib[bcrypt]` + `python-jose`

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure you have the following installed on your system:
* Node.js (v16+)
* Python (3.9+)

### 2. Installation

Clone the repository and jump into the terminal directory:
```bash
git clone https://github.com/nebulagroup/Coaldiam.git
cd Coaldiam
```

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```

### 3. Environment Variables

In the `backend` directory, create a `.env` file and insert your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
USE_MOCK_DATA=false
```

### 4. Running the Terminal 

**Start the Backend Engine:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Start the React Client:**
```bash
cd frontend
npm run dev
```

The system will now be aggressively monitoring intelligence channels at `http://localhost:3000/`.

---

## 📖 Use Cases

**1. Rapid Due Diligence**
Instead of spending an hour charting a single ticker, queue up an "AI Scrape" and instantly acquire the technical thesis, support blocks, and options flow momentum derived directly by Gemini logic. 

**2. In-Session Execution Framing**
If you are struggling to build a proper risk-to-reward ratio, Coaldiam generates explicit Option Plays (e.g., `SPY 1DTE call ATM @ ~$3.00`) matched closely with stop-losses specifically targeting structural invalidation points.

**3. Paper Trading**
Test the hybrid Alpaca mock systems internally to train algorithms without utilizing live brokerage capital until confidence ratings align. 

---

> *"Turning raw, noisy coal into crystal clear actionable diamonds."*
