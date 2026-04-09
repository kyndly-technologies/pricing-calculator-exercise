# Kyndly Pricing Calculator

Ruby on Rails rewrite of the internal revenue calculator used to model TPA and broker economics on Kyndly's ICHRA platform.

## Local setup

```bash
bundle install
bin/rails db:prepare
bin/rails server
```

Open `http://localhost:3000`.

## GitHub Codespaces

This branch includes a `.devcontainer/devcontainer.json` that:

- uses a Ruby 3.3 development image
- runs `bundle install` and `bin/rails db:prepare` on create
- forwards port `3000`
- opens the forwarded app in the browser preview

## What the calculator models

- Tiered pricing: Catalyst, Core, Premier
- Admin PEPM revenue
- Broker of Record commission revenue
- Optional concierge enrollment
- Optional payment processing

## Notes

- Tier recommendation is based on the lowest monthly platform cost for the selected inputs.
- Pass `?client=Acme` in the URL to show a client label in the header.
