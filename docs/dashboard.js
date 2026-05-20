// Crypto Tool Curve — dashboard renderer
// Reads data/latest.json and renders three views:
//   1. Headline tool adoption rate + phase label
//   2. Per-tool mention count, sorted descending
//   3. Time series of corpus-wide adoption rate

'use strict';

const PHASES = [
  { max: 0.05, label: 'Spreadsheet',   desc: 'Sector is still hand-rolling crypto accounting in Excel.' },
  { max: 0.15, label: 'Curious',       desc: 'Early adopters; tooling is in JDs but not yet table-stakes.' },
  { max: 0.40, label: 'Standardizing', desc: 'Real demand signal; vendors crossing chasm.' },
  { max: 1.00, label: 'Established',   desc: 'Crypto-accounting tools are required-skill in JDs.' },
];

function phaseFor(rate) {
  for (const p of PHASES) {
    if (rate <= p.max) return p;
  }
  return PHASES[PHASES.length - 1];
}

// Bands are inverted from cfo-gap: HIGH adoption is good (green), LOW is bad (red).
// For now we colour every tool bar with the canary accent; the headline phase carries the verdict.
function bandClassFor(_rate) {
  return 'low';
}

function formatPct(x, digits) {
  if (x == null || !isFinite(x)) return '—';
  const d = (typeof digits === 'number') ? digits : 1;
  return (x * 100).toFixed(d) + '%';
}

async function loadLatest() {
  const res = await fetch('data/latest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('failed to load data/latest.json');
  return res.json();
}

async function loadSnapshots() {
  // Fall back to the timeseries embedded in latest.json if no separate manifest exists.
  try {
    const res = await fetch('data/timeseries.json', { cache: 'no-store' });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

function renderHeadline(data) {
  const rate = data.headline.value;
  const phase = phaseFor(rate);
  document.getElementById('hero-score').textContent = formatPct(rate, 1);
  document.getElementById('hero-sub').textContent =
    `${data.headline.n_with_tool} of ${data.headline.n_total} finance JDs`;

  // Contrast block (v1.1+)
  const contrast = data.contrast;
  if (contrast) {
    document.getElementById('contrast-score').textContent = formatPct(contrast.value, 1);
    document.getElementById('contrast-sub').textContent =
      `${contrast.n_with_tool} of ${contrast.n_total} finance JDs`;
  } else {
    document.getElementById('contrast-row').style.display = 'none';
  }

  document.getElementById('hero-phase').textContent = phase.label;
  document.getElementById('hero-description').textContent =
    (contrast && contrast.narrative) ? contrast.narrative : phase.desc;
  document.getElementById('last-updated').textContent =
    `Last updated: ${data.metadata.last_updated} · n=${data.headline.n_total} finance JDs`;
}

function renderGenericErpTable(data) {
  const total = data.headline.n_total;
  const rows = (data.by_generic_erp || []).slice().sort((a, b) => b.n - a.n);
  const tbody = document.getElementById('generic-erp-tbody');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary);padding:1.5rem;">No data yet</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(t => {
    const share = total > 0 ? (t.n / total) : 0;
    const pct = formatPct(share, 1);
    const widthPct = Math.max(2, Math.min(100, share * 100));
    return `
      <tr>
        <td class="subsector-name">${escapeHtml(t.tool)}</td>
        <td class="subsector-numeric">${t.n}</td>
        <td class="subsector-numeric">
          ${pct}
          <span class="ratio-bar" aria-hidden="true"><span class="ratio-bar-fill" style="width:${widthPct}%;background:#3fb950"></span></span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderToolTable(data) {
  const total = data.headline.n_total;
  const rows = (data.by_tool || [])
    .slice()
    .sort((a, b) => b.n - a.n);

  const tbody = document.getElementById('tool-tbody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary);padding:1.5rem;">No data yet</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(t => {
    const share = total > 0 ? (t.n / total) : 0;
    const pct = formatPct(share, 2);
    const cls = bandClassFor(share);
    const widthPct = Math.max(2, Math.min(100, share * 100));
    return `
      <tr>
        <td class="subsector-name">${escapeHtml(t.tool)}</td>
        <td class="subsector-numeric">${t.n}</td>
        <td class="subsector-numeric">
          ${pct}
          <span class="ratio-bar" aria-hidden="true"><span class="ratio-bar-fill ${cls}" style="width:${widthPct}%"></span></span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTimeline(data, ts) {
  const series = (ts && ts.points) ? ts.points : (data.timeseries || []);
  const labels = series.map(p => p.date);
  const values = series.map(p => {
    const pct = (typeof p.pct === 'number')
      ? p.pct
      : (p.total_finance_jds > 0 ? (p.with_any_tool / p.total_finance_jds) : 0);
    return Number((pct * 100).toFixed(2));
  });

  const ctx = document.getElementById('timeline-chart').getContext('2d');
  // eslint-disable-next-line no-new
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tool adoption rate (corpus-wide)',
        data: values,
        borderColor: '#f6c440',
        backgroundColor: 'rgba(246, 196, 64, 0.12)',
        fill: true,
        tension: 0.25,
        pointRadius: series.length > 30 ? 0 : 3,
        pointHoverRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `${item.parsed.y.toFixed(2)}% of JDs`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#8b949e', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
          grid:  { color: 'rgba(139,148,158,0.08)' },
        },
        y: {
          min: 0,
          ticks: { color: '#8b949e', callback: (v) => v + '%' },
          grid:  { color: 'rgba(139,148,158,0.08)' },
        },
      },
    },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

(async function init() {
  try {
    const [data, ts] = await Promise.all([loadLatest(), loadSnapshots()]);
    renderHeadline(data);
    renderToolTable(data);
    renderGenericErpTable(data);
    renderTimeline(data, ts);
  } catch (err) {
    document.getElementById('hero-score').textContent = '—';
    document.getElementById('hero-phase').textContent = 'Data unavailable';
    document.getElementById('hero-description').textContent = String(err && err.message ? err.message : err);
    console.error(err);
  }
})();
