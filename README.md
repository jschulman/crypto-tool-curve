# Crypto Tool Curve

Tracking tool demand in finance job descriptions using aggregate public job-posting observations.

**[View the dashboard](https://jschulman.github.io/crypto-tool-curve)**

## What this measures

What share of eligible finance job descriptions names a specialist accounting tool, a general-purpose ERP, or an operational requirement?

```
tool_demand_share = unique eligible JDs naming any tracked specialist tool / eligible JDs
```

The denominator is **JDs last observed in the preceding 90 days**, including jobs that have since closed, at baseline employers. It is not the number currently open. A JD naming multiple specialist tools counts once in the headline and once per named tool in the breakdown. Vendor shares can therefore sum above the headline percentage.

A separate measure uses the same denominator for general-purpose ERPs. These categories can overlap in one JD or one company's systems. Their difference does not establish spreadsheet use, installed software or replacement of one category by another.


The crypto-native baseline is preserved. It is a selected employer sample, not a measure of adoption across incumbent banks, brokers or payment processors. See [Financial Rails](https://jschulman.github.io/stablecoin-signal/#financial-rails) and the separate [incumbent employer panel](https://jayschulman.com/blockchain#incumbent-panel).

See [METHODOLOGY.md](METHODOLOGY.md) for the current definitions, role coverage, historical changes and limitations. Missing percentages display as unknown; historical charts preserve gaps. Requested skills, persistent job listings and advertised pay do not by themselves establish adoption or demand for professional services.

## Architecture and refresh

- `docs/` — static HTML, JavaScript and CSS, served by GitHub Pages.
- `data/` and `docs/data/` — published aggregate snapshots from the private producer.
- `.github/workflows/` — publishing automation.
- `tests/` — renderer regression checks for measured zero, missing data and historical compatibility.

The private producer polls public Ashby, Greenhouse and Lever job-board feeds. Daily refresh is intended, but the observation date and coverage determine freshness. No individual job descriptions or private employer records are published here. The source location and scheduled publishing roots remain unchanged.

Run the renderer checks with `node --test tests/*.test.cjs`.

## The Crypto Canaries

- [CFO Gap](https://jschulman.github.io/cfo-gap) — persistent finance listings.
- [Crypto Tool Curve](https://jschulman.github.io/crypto-tool-curve) — tool and operational-skill demand.
- [Compliance Canary](https://jschulman.github.io/compliance-canary) — credential and control demand.
- [Comp Pulse](https://jschulman.github.io/comp-pulse) — advertised salary-range index.

Related: [Stablecoin Signal](https://jschulman.github.io/stablecoin-signal) · [Displacement Curve](https://jschulman.github.io/displacement-curve) · [Quantum Qanary](https://jschulman.github.io/quantum-qanary).

MIT — see [LICENSE](LICENSE).

— Jay Schulman · [jayschulman.com](https://jayschulman.com)
