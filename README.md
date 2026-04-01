# Kyndly Pricing Calculator

An internal revenue calculator that helps sales teams show prospective clients (TPAs/brokers) their economics when using the Kyndly ICHRA platform.

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Open [http://localhost:3000](http://localhost:3000)

## About

This calculator models the P&L for a TPA offering ICHRA through Kyndly's platform, including:
- Tiered pricing (Catalyst, Core, Premier)
- Admin PEPM revenue
- Broker of Record (BOR) commission revenue
- Optional add-ons (Concierge enrollment, Payment processing)

## Structure

- `app.py` — Flask app with routes and API
- `calculator.py` — Core P&L calculation logic
- `pricing_defaults.py` — Default tier and pricing config
- `merge_config.py` — Merges client-specific config with defaults
- `templates/calculator.html` — Frontend with vanilla JS
