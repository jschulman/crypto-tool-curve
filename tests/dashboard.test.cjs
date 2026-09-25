const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../docs/dashboard.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/latest.json'), 'utf8'));
async function render(data) {
  const nodes = new Map([...html.matchAll(/id="([^"]+)"/g)].map(([,id]) => [id, {textContent:'',innerHTML:'',style:{},getContext:() => ({id})}]));
  const charts = [];
  const errors = [];
  const context = vm.createContext({
    document: {getElementById: id => { assert.ok(nodes.has(id), `Missing DOM node: ${id}`); return nodes.get(id); }},
    fetch: async () => ({ok:true,json:async() => data}),
    Chart: function(canvas, config) { charts.push({id:canvas.id, ...config}); },
    console: {error:error => errors.push(error)},
  });
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(errors.length, 0, errors.map(String).join(' | '));
  return {nodes, charts, get:id => nodes.get(id).textContent, context};
}

test('existing published snapshot renders without invented data', async () => {
  const page = await render(structuredClone(baseline));
  assert.ok(page.charts.length > 0);
  assert.doesNotMatch(page.get('hero-score'), /NaN|undefined/);
  for (const chart of page.charts) assert.equal(chart.data.datasets[0].spanGaps, false);
});

test('a missing calendar day remains an explicit chart gap', async () => {
  const data = structuredClone(baseline);
  data.timeseries = [{...data.timeseries.at(-1),date:'2026-09-01'}, {...data.timeseries.at(-1),date:'2026-09-03'}];
  const page = await render(data);
  assert.equal(page.charts[0].data.labels[1], '2026-09-02');
  assert.equal(page.charts[0].data.datasets[0].data[1], null);
});

test('snapshot observation date takes precedence over export date', async () => {
  const data = structuredClone(baseline);
  data.metadata.last_updated = '2099-01-01';
  data.metadata.as_of_date = '2026-08-01';
  const page = await render(data);
  assert.match(page.get('last-updated'), /Observation: 2026-08-01/);
  assert.doesNotMatch(page.get('last-updated'), /2099/);
});

test('legacy fabricated percentages are rejected when denominators are missing', async () => {
  const data = structuredClone(baseline);
  data.headline = {n_with_tool:0,n_total:0,value:0};
  data.timeseries = [{date:'2026-09-23',total_finance_jds:0,with_any_tool:2,pct:0},{date:'2026-09-24',total_finance_jds:null,with_any_tool:0,pct:null},{date:'2026-09-25',total_finance_jds:10,with_any_tool:0,pct:0}];
  const page = await render(data);
  assert.equal(page.get('hero-score'), '—');
  assert.equal(JSON.stringify(page.charts[0].data.datasets[0].data), '[null,null,0]');
  assert.doesNotMatch(page.get('hero-description'), /gap between|hand-rolling/);
});

test('operational requirements use eligible jobs and report company breadth', async () => {
  const data = structuredClone(baseline);
  data.headline = {n_with_tool:1,n_total:10,value:0.1};
  data.sample = {n_jds:10,n_companies:4};
  data.breadth = {tool_companies:1,erp_companies:2};
  data.by_requirement = [{requirement:'reconciliation',n:2,pct:0.2,n_companies:2}];
  const page = await render(data);
  assert.match(page.nodes.get('requirement-tbody').innerHTML, /20.0%/);
  assert.match(page.get('sample-note'), /4 companies represented/);
});

test('isolated known observations remain visible in sparse long history', async () => {
  const page = await render(structuredClone(baseline));
  vm.runInContext(`lineChart('timeline-chart', Array.from({length: 40}, (_, i) => ({date: String(i)})), Array.from({length: 40}, (_, i) => i === 39 ? 12 : null), 'test')`, page.context);
  const points = page.charts.at(-1).data.datasets[0].pointRadius;
  assert.equal(points[39], 3);
  assert.equal(points[38], 0);
});
