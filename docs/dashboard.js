// crypto-tool-curve — observable demand and explicit missing data.
'use strict';

const known = value => typeof value === 'number' && Number.isFinite(value);
const count = value => known(value) ? Math.round(value).toLocaleString('en-US') : '—';
const rate = (numerator, denominator) => known(numerator) && known(denominator) && denominator > 0 && numerator >= 0 && numerator <= denominator ? numerator / denominator : null;
const pct = (value, digits = 1) => known(value) ? (value * 100).toFixed(digits) + '%' : '—';
const text = (id, value) => { document.getElementById(id).textContent = value; };
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function observationDate(data) {
  return data.metadata.as_of_date || data.timeseries?.at(-1)?.date || data.metadata.last_updated;
}
function freshness(data, detail) {
  const date = observationDate(data);
  const age = date ? Math.floor((Date.now() - Date.parse(date)) / 86400000) : null;
  const status = known(age) && age > 2 ? ` · ${age} days old` : '';
  text('last-updated', `Observation: ${date || 'unknown'}${status} · ${detail}`);
  text('method-note', `Method: ${data.metadata.methodology_version || data.metadata.version || 'unversioned'}. Historical gaps are unknown, not zero. Changes in coverage or definitions can affect comparisons.`);
}
async function loadLatest() {
  const res = await fetch('data/latest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Unable to load the latest observations.');
  return res.json();
}
// Daily observations are authoritative within the same exported document.
// Missing calendar dates are inserted so a line cannot bridge an unobserved day.
function dailySeries(points) {
  const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
  const result = [];
  for (const point of sorted) {
    const previous = result.at(-1);
    if (previous) {
      let next = Date.parse(previous.date) + 86400000;
      const end = Date.parse(point.date);
      while (Number.isFinite(next) && next < end) {
        result.push({ date: new Date(next).toISOString().slice(0, 10) });
        next += 86400000;
      }
    }
    result.push(point);
  }
  return result;
}
function lineChart(id, series, values, label, percentage = false) {
  new Chart(document.getElementById(id).getContext('2d'), {
    type: 'line',
    data: { labels: series.map(p => p.date), datasets: [{
      label, data: values, spanGaps: false,
      borderColor: '#f6c440', backgroundColor: 'rgba(246,196,64,0.12)',
      fill: true, tension: 0.2,
      pointRadius: values.map((value, index) => known(value) && (series.length <= 30 || (!known(values[index - 1]) && !known(values[index + 1]))) ? 3 : 0),
      pointHoverRadius: 5,
    }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: item => known(item.parsed.y) ? `${item.parsed.y.toFixed(1)}${percentage ? '%' : ''} ${label}` : 'Unknown',
      } } },
      scales: {
        x: { ticks: { color: '#8b949e', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { color: 'rgba(139,148,158,0.08)' } },
        y: { min: 0, ...(percentage ? { max: 100 } : {}), ticks: { color: '#8b949e', callback: v => v + (percentage ? '%' : '') }, grid: { color: 'rgba(139,148,158,0.08)' } },
      },
    },
  });
}
function demandTable(id, rows, field, denominator, companies = false) {
  const cells = companies ? 4 : 3;
  document.getElementById(id).innerHTML = rows.length ? rows.slice().sort((a, b) => b.n - a.n).map(row => {
    const share = rate(row.n, denominator);
    return `<tr><td class="subsector-name">${escapeHtml(row[field])}</td><td class="subsector-numeric">${count(row.n)}</td><td class="subsector-numeric">${pct(share)}</td>${companies ? `<td class="subsector-numeric">${count(row.n_companies)}</td>` : ''}</tr>`;
  }).join('') : `<tr><td colspan="${cells}" style="text-align:center;padding:1.5rem;">No observations available</td></tr>`;
}
function unavailable(error) {
  text('hero-score', '—'); text('hero-phase', 'Data unavailable');
  text('hero-description', 'The latest observations could not be loaded. Please try again later.');
  text('last-updated', 'Observation date unavailable');
  console.error(error);
}

function render(data) {
  const h = data.headline;
  const value = rate(h.n_with_tool, h.n_total);
  text('hero-score', pct(value));
  text('hero-sub', `${count(h.n_with_tool)} of ${count(h.n_total)} finance JDs`);
  text('hero-phase', value == null ? 'No eligible observations' : 'Tool demand');
  text('hero-description', 'Job descriptions reveal requested skills, not installed software. Specialist tools and general-purpose ERPs can coexist; an unnamed tool may still be in use.');
  const contrast = data.contrast;
  text('contrast-score', pct(contrast ? rate(contrast.n_with_tool, contrast.n_total) : null));
  text('contrast-sub', contrast ? `${count(contrast.n_with_tool)} of ${count(contrast.n_total)} finance JDs` : 'No observations available');
  const breadth = data.breadth;
  text('sample-note', `${count(data.sample?.n_companies)} companies represented.${breadth ? ` Specialist mentions at ${count(breadth.tool_companies)} companies; ERP mentions at ${count(breadth.erp_companies)}.` : ' Company breadth was not recorded in older snapshots.'}`);
  freshness(data, `${count(h.n_total)} finance JDs observed in the last 90 days · crypto-native baseline`);
  demandTable('tool-tbody', data.by_tool || [], 'tool', h.n_total);
  demandTable('generic-erp-tbody', data.by_generic_erp || [], 'tool', h.n_total);
  demandTable('requirement-tbody', data.by_requirement || [], 'requirement', h.n_total, true);
  const series = dailySeries(data.timeseries || []);
  lineChart('timeline-chart', series, series.map(p => { const value = rate(p.with_any_tool, p.total_finance_jds); return value == null ? null : value * 100; }), 'of JDs naming a specialist tool', true);
}

loadLatest().then(render).catch(unavailable);
