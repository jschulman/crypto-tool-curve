# Methodology

How Crypto Tool Curve is computed, what its limits are, and how to read its numbers honestly.

## One question

Is purpose-built crypto-accounting tooling actually being adopted by crypto-native middle-market finance teams?

## The metric

**Tool Adoption Rate**, defined corpus-wide and per-tool:

```
adoption_rate = (open finance JDs mentioning any tracked crypto-accounting tool) / (open finance JDs)
```

Where:
- **"Open"** means the listing was present in the most recent scan of the company's public job-board feed.
- **"Finance JDs"** are job postings matching the same fixed taxonomy of accounting and finance roles used by [The CFO Gap](https://jschulman.github.io/cfo-gap): Controller, Assistant Controller, Corporate Controller, VP Finance, Head of Finance, CFO, Accounting Manager, Senior Accounting Manager, Accounting Lead, Senior Accountant, Tax Manager, Tax Director, FP&A Manager, FP&A Director, Technical Accounting Manager, Revenue Accountant, Staff Accountant, AP/AR Specialist, Treasury Manager, Internal Audit Manager, SOX/Compliance Manager.
- **"Mentioning any tracked tool"** means the JD body (full description text, lowercased) contains a case-insensitive whole-word match for any vendor name in the tracked list below.

A single JD that mentions two tracked tools counts once toward the headline (it's a `with_any_tool` JD) and once per tool toward the per-tool breakdown.

## Tracked tools

The current tracked list (alphabetical):

- **Bitwave** — institutional crypto accounting subledger
- **Cryptio** — crypto bookkeeping and accounting automation
- **Cryptoworth** — multi-entity crypto accounting platform
- **Integral** — crypto-native finance and accounting suite
- **Ledgible** — tax and accounting reporting for digital assets
- **SoftLedger** — multi-entity general ledger with crypto support
- **TaxBit** — enterprise digital-asset tax and accounting

The list is intentionally limited to vendors selling purpose-built crypto-accounting *subledgers* or *general ledgers*. General-purpose accounting tools (NetSuite, QuickBooks, Sage Intacct), wallet/custody tools (Fireblocks, Anchorage, BitGo), and tax-only consumer tools are explicitly **not** on this list. The list is reviewed quarterly and changes will be noted in this file with a version bump.

## Data source

The scanner queries public job-board APIs:
- **Ashby:** `https://api.ashbyhq.com/posting-api/job-board/{slug}`
- **Greenhouse:** `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true`
- **Lever:** `https://api.lever.co/v0/postings/{slug}?mode=json`

For each company in the curated target list, the scanner pulls all open postings, classifies titles into the finance taxonomy, then string-matches the full JD body against the tool list. All matches are case-insensitive whole-word (word-boundary regex) to avoid false positives from substrings.

All data is **public**. No portal logins. No robots.txt bypass. Per-domain rate limiting. User-Agent identifies the project.

## Target universe

The curated target list is the same crypto-native middle-market universe used by The CFO Gap:
- Primary business is crypto-native (not "crypto-curious" fintech)
- Last priced round: Series B, C, or D (or equivalent token raise scale)
- Headcount: roughly 50–500
- Last funding event within 36 months
- US or US-adjacent operations

Hard exclusions: too small (seed / pre-seed / Series A under $10M raised), too big (Coinbase, Binance, Kraken, Block, Robinhood Crypto, Tether, Circle, public crypto companies), dead or distressed.

The target list is maintained privately and refreshed quarterly.

## Update cadence

The dashboard refreshes daily. Each snapshot includes:
- A timestamp
- Headline adoption rate (corpus-wide)
- Per-tool mention count
- Total tracked JD count (the denominator)
- A point in the daily time series

Snapshots are versioned under `data/snapshots/YYYY-MM-DD.json`. The dashboard reads `data/latest.json`.

## Caveats and limits

- **Mentions ≠ adoption.** A JD listing "experience with Bitwave or similar" tells us the company values that skill — not that they've signed a contract. The metric is a *demand* signal, not a usage signal.
- **JD body language is noisy.** A JD that says "no experience with Bitwave required" still mentions Bitwave. Negation handling is not attempted; the signal works in aggregate, not per individual JD.
- **The tracked tool list is curated.** Adding or removing a vendor will shift the headline. Changes are documented in this file.
- **The target list is curated.** We are intentionally focused on crypto-native middle-market companies. Larger crypto companies (Series E+) and smaller ones (pre-Series A) are excluded by design.
- **First-pass classifier.** Finance role titles are matched against the same regex taxonomy as The CFO Gap. Real-world title variation is captured but not perfectly.

## What this cannot tell you

- Whether a company is actually *using* a tool (only that they're hiring for it)
- Which vendors are winning deals (no contract data)
- Whether tooling reduces stall (that's The CFO Gap)
- Anything about pricing, contract size, or churn

## Versioning

Methodology versions are tracked in this file. Material changes (a vendor added, the role taxonomy revised) will bump the `version` field in `data/latest.json` and be noted here.

Current version: **1.0** (2026-05-19).

## Reproducibility

You can replicate Crypto Tool Curve if you:
1. Curate your own list of crypto-native middle-market companies and their ATS slugs.
2. Poll their public job-board APIs daily.
3. Apply the finance role taxonomy.
4. Word-boundary-match each JD body against the tracked tool list.
5. Compute the adoption rate per the formula above.

The target list and scanner code are maintained privately (the source repository contains operational exclusions and rubric weights that are not appropriate for public release). The methodology above is the canonical specification.
