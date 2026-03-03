import {Step} from '@mathigon/studio';

const NS = 'http://www.w3.org/2000/svg';
const W = 360, H = 360;
const PAD = {top: 20, right: 20, bottom: 50, left: 55};
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

// ── math helpers ──────────────────────────────────────────────────────────

function linFit(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return null;
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
  const sx2 = xs.reduce((a, b) => a + b * b, 0);
  const denom = n * sx2 - sx * sx;
  if (Math.abs(denom) < 1e-10) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return {slope, intercept};
}

// ── plot helpers ──────────────────────────────────────────────────────────

function scaleX(x: number, xMin: number, xMax: number) {
  return PAD.left + ((x - xMin) / (xMax - xMin)) * PW;
}

function scaleY(y: number, yMin: number, yMax: number) {
  return PAD.top + PH - ((y - yMin) / (yMax - yMin)) * PH;
}

function niceRange(vals: number[]) {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx - mn) * 0.15 || 1;
  return [mn - pad, mx + pad];
}

function el(tag: string, attrs: Record<string, string>) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function drawAxes(svg: SVGSVGElement, xMin: number, xMax: number, yMin: number, yMax: number) {
  // background
  svg.appendChild(el('rect', {x:'0',y:'0',width:String(W),height:String(H),fill:'#fafafa'}));

  // grid lines (5 ticks each axis)
  for (let i = 0; i <= 5; i++) {
    const xv = xMin + i * (xMax - xMin) / 5;
    const xp = String(scaleX(xv, xMin, xMax));
    svg.appendChild(el('line', {x1:xp,y1:String(PAD.top),x2:xp,y2:String(PAD.top+PH),
      stroke:'#e0e0e0','stroke-width':'0.8'}));
    const xt = el('text', {x:xp,y:String(PAD.top+PH+18),'text-anchor':'middle',
      'font-size':'11',fill:'#888'});
    xt.textContent = xv.toFixed(1);
    svg.appendChild(xt);

    const yv = yMin + i * (yMax - yMin) / 5;
    const yp = String(scaleY(yv, yMin, yMax));
    svg.appendChild(el('line', {x1:String(PAD.left),y1:yp,x2:String(PAD.left+PW),y2:yp,
      stroke:'#e0e0e0','stroke-width':'0.8'}));
    const yt = el('text', {x:String(PAD.left-8),y:yp,'text-anchor':'end',
      'dominant-baseline':'middle','font-size':'11',fill:'#888'});
    yt.textContent = yv.toFixed(1);
    svg.appendChild(yt);
  }

  // axes
  svg.appendChild(el('line', {x1:String(PAD.left),y1:String(PAD.top),
    x2:String(PAD.left),y2:String(PAD.top+PH),stroke:'#555','stroke-width':'1.5'}));
  svg.appendChild(el('line', {x1:String(PAD.left),y1:String(PAD.top+PH),
    x2:String(PAD.left+PW),y2:String(PAD.top+PH),stroke:'#555','stroke-width':'1.5'}));

  // axis labels
  const xl = el('text', {x:String(PAD.left+PW/2),y:String(H-4),
    'text-anchor':'middle','font-size':'13',fill:'#333','font-weight':'bold'});
  xl.textContent = 'Time t (s)';
  svg.appendChild(xl);

  const yl = el('text', {x:'14',y:String(PAD.top+PH/2),
    'text-anchor':'middle','font-size':'13',fill:'#333',
    'font-weight':'bold',transform:`rotate(-90,14,${PAD.top+PH/2})`});
  yl.textContent = 'Velocity v (m/s)';
  svg.appendChild(yl);
}

function renderPlot(svg: SVGSVGElement, xs: number[], ys: number[]) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  if (xs.length === 0) {
    svg.appendChild(el('rect', {x:'0',y:'0',width:String(W),height:String(H),fill:'#fafafa'}));
    const t = el('text', {x:String(W/2),y:String(H/2),'text-anchor':'middle',
      'font-size':'13',fill:'#bbb'});
    t.textContent = 'Enter data to plot';
    svg.appendChild(t);
    return;
  }

  const [xMin, xMax] = niceRange(xs);
  const [yMin, yMax] = niceRange(ys);
  drawAxes(svg, xMin, xMax, yMin, yMax);

  // best fit line
  const fit = linFit(xs, ys);
  if (fit) {
    const x1 = xMin, y1 = fit.slope * x1 + fit.intercept;
    const x2 = xMax, y2 = fit.slope * x2 + fit.intercept;
    svg.appendChild(el('line', {
      x1: String(scaleX(x1, xMin, xMax)), y1: String(scaleY(y1, yMin, yMax)),
      x2: String(scaleX(x2, xMin, xMax)), y2: String(scaleY(y2, yMin, yMax)),
      stroke: '#FF6F00', 'stroke-width': '2', 'stroke-dasharray': '6,3', opacity:'0.8'
    }));
  }

  // data points
  for (let i = 0; i < xs.length; i++) {
    svg.appendChild(el('circle', {
      cx: String(scaleX(xs[i], xMin, xMax)),
      cy: String(scaleY(ys[i], yMin, yMax)),
      r: '5', fill: '#1565C0', stroke: 'white', 'stroke-width': '1.5'
    }));
  }
}

function updateResults(container: Element, xs: number[], ys: number[]) {
  const fit = linFit(xs, ys);
  if (!fit) {
    container.innerHTML = '<p>Enter at least 2 data points to see the fit.</p>';
    return;
  }
  const sign = fit.intercept >= 0 ? '+' : '−';
  const intercept = Math.abs(fit.intercept).toFixed(3);
  container.innerHTML = `
    <p><strong>Best-fit line:</strong></p>
    <p class="fit-eq">v = ${fit.slope.toFixed(3)} t ${sign} ${intercept}</p>
    <p><strong>Slope (acceleration):</strong> ${fit.slope.toFixed(3)} m/s²</p>
    <p><strong>y-intercept (v₀):</strong> ${fit.intercept.toFixed(3)} m/s</p>
    <p><em>N = ${xs.length} points</em></p>
  `;
}

// ── Step export ───────────────────────────────────────────────────────────

export function dataTable($step: Step) {
  const container = $step._el as HTMLElement;

  const readData = () => {
    const tInputs = Array.from(container.querySelectorAll('.t-val')) as HTMLInputElement[];
    const vInputs = Array.from(container.querySelectorAll('.v-val')) as HTMLInputElement[];
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i < tInputs.length; i++) {
      const t = parseFloat(tInputs[i].value);
      const v = parseFloat(vInputs[i].value);
      if (!isNaN(t) && !isNaN(v)) { xs.push(t); ys.push(v); }
    }
    return {xs, ys};
  };

  const refresh = () => {
    const {xs, ys} = readData();
    const svg = container.querySelector('#vt-plot') as SVGSVGElement | null;
    const results = container.querySelector('#fit-results');
    if (svg) renderPlot(svg, xs, ys);
    if (results) updateResults(results, xs, ys);
  };

  // attach listeners after DOM settles
  setTimeout(() => {
    container.querySelectorAll('.t-val, .v-val').forEach(inp => {
      inp.addEventListener('input', refresh);
    });
    refresh();
  }, 100);
}

