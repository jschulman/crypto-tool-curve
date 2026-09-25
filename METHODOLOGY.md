# Methodology

What share of eligible finance job descriptions names a specialist accounting tool, a general-purpose ERP, or an operational requirement?

```
tool_demand_share = unique eligible JDs naming any tracked specialist tool / eligible JDs
```

The denominator is **JDs last observed in the preceding 90 days**, including jobs that have since closed, at baseline employers. It is not the number currently open. A JD naming multiple specialist tools counts once in the headline and once per named tool in the breakdown. Vendor shares can therefore sum above the headline percentage.

A separate measure uses the same denominator for general-purpose ERPs. These categories can overlap in one JD or one company's systems. Their difference does not establish spreadsheet use, installed software or replacement of one category by another.

## Tracked names and requirements

The specialist roster is **Bitwave, TaxBit, Cryptio, SoftLedger, Ledgible, Cryptoworth and Lukka**. Earlier documentation listed Integral incorrectly; the roster described here matches the producer's actual names. General-purpose ERP names are NetSuite, Sage Intacct, Xero, QuickBooks, Microsoft Dynamics, SAP, Workday and Oracle Fusion.

The additional requirement breakdown tracks integration, reconciliation, custody and controls language **when the job description also has blockchain-related context**. It does not require a vendor name. Each category reports unique matching JDs, a share of the same eligible sample and the number of matching companies. Company breadth also reports how many employers account for specialist-tool and ERP mentions. Missing breadth or requirements in an older snapshot display as unavailable, not zero.

Matching is case-insensitive and vendor or requirement-specific. Keyword matching can include preferred experience, historical systems, alternatives or negated requirements. A context match does not prove that the named operational requirement itself uses a blockchain.

## Eligible finance roles

Controller and assistant-controller variants; finance leadership and CFO; strategic finance; accounting management and leads; senior, financial, staff, fund and other matched accountants; tax management; FP&A; technical accounting and financial reporting; AP/AR; treasury management; internal audit; and SOX/compliance roles. Titles are matched by ordered, case-insensitive patterns. Bookkeeper and payroll-manager capture-only roles are excluded. This includes individual contributors, so “senior finance” does not precisely describe the entire sample.

## Sources and coverage

The private producer polls public Ashby, Greenhouse and Lever job-board feeds and publishes aggregates here. The crypto-native baseline is a selected, evolving employer sample; it is not a census or a representative survey. Company additions, exclusions, title classification, job-board coverage and collection failures can change the sample. Companies without observed eligible jobs are not represented in a JD denominator.

The baseline is retained separately from any expanded panel of incumbent financial businesses. An incumbent employer must not be added to this series simply to widen market observation. Employer type, infrastructure-provider role and use case are separate attributes in the expanded research panel. A crypto-native firm can also provide financial infrastructure.

Daily refresh is the intended cadence. The date shown in the dashboard is the observation date, which can precede publication. A scheduled workflow or recent export is not proof that every employer feed was refreshed successfully. Snapshots live in `data/` and `docs/data/`; the dashboard reads `docs/data/latest.json`.

## Interpretation

This is requested-skill demand. A firm can use software without naming it in a job description, or name a tool without having installed it. Low specialist-tool demand does not demonstrate spreadsheet dependence. Requirement mentions do not prove adoption, production usage, control effectiveness, vendor sales, or assurance purchasing intent.

## Material historical changes

On **2026-06-24**, demand measurement moved to a 90-day active window and finance title classification broadened. Earlier windows may differ. Version 2.0 adds company breadth and operational requirements, and stops filling missing historical denominators with zero. A historical percentage is restored only when a saved observation supplies its own numerator and denominator; present-day jobs cannot reconstruct an old denominator. Where that evidence is absent, history remains unknown.

## Missing data and historical comparability

An unknown numerator or a zero/unknown denominator produces an unknown percentage, displayed as `—`; it is never interpreted as 0%. Missing calendar dates and unavailable values remain gaps in charts. A measured zero requires a known, positive denominator. Material definition changes can break comparability even where a chart is continuous.

The 2026-09-25 interpretation update removes unsupported success/failure verdicts. Version 2.0 producer snapshots identify the updated methodology in metadata; older snapshots retain their original version. Original aggregate series and URLs remain available. Generated snapshots are published by the producer, not fabricated by the dashboard.

## Reproducibility

Replicate the selected employer feeds, eligibility rules, title and text patterns, and snapshot date. Keep dated counts and denominators together. Save unique-job and company counts at collection time; do not derive old coverage from today’s database. The private producer owns collection and aggregation; this repository renders the published aggregates.
